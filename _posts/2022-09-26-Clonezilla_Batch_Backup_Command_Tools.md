---
title: 使用 CloneZilla 指令列工具批次生產相同配置的業務用磁碟
category: computer
tags: [clonezilla,fdisk,tune2fs,uuid]
lastupdated: 2022-09-26
---

標題說的業務用磁碟是指多顆具有相同分割區配置，安裝 Linux 作業系統和客戶業務軟體，用在大量裝機場合的磁碟。
此外，本文情境還將面臨分批採購、後續替換等狀況，故使用的磁碟會是不同型號、不同品牌、甚至標示容量也不相同。

CloneZilla 的磁碟對拷功能雖然可以直接複製分割區配置，但那僅限兩顆磁碟實際容量一致或目的磁碟容量較大的情形。
不適用本文所說的多顆磁碟不相同的情形。
所以本文使用的指令操作，著重在以分割區為單位之複製工作，才能適應本文情境。

<div class="note">
為了能複製到不同容量的磁碟，本文情境的分割區配置並不會用滿整顆磁碟的容量。
實務上可能只配置 30GB 左右，以便複製到 32GB 或更大容量的磁碟。
因此適合使用於 eMMC, CF卡, USB隨身碟, SSD 這一類的儲存媒體。
</div>

<!--more-->

說到批次生產，使用指令列工具還是比較方便。
[CloneZilla Live](https://clonezilla.nchc.org.tw/) 已經包含下列指令列工具，進入指令列模式後可用。
Linux 散佈套件的基礎安裝工具中也會包含這些 (除了 ocs-onthefly 和 ocs-sr)。

* fdisk
* parted
* sfdisk
* sgdisk - 專用於 GPT 磁碟的工具。
* tune2fs
* uuidgen - 可以隨機產生一個 UUID 。
* ocs-onthefly - Clonezilla 工具。
* ocs-sr - Clonezilla 工具。

<div class="note">
本文所有指令，都需要 sudo 。只是指令範例省略不寫。
</div>

#### 查看磁碟資訊

以第一顆 SATA 磁碟 (/dev/sda) 為例。

`$ sfdisk -d /dev/sda`

輸出範例:

```text

label: gpt
label-id: abcd

/dev/sda1 : ..... UUID=1234

```

*label* 欄是這顆磁碟的分割區表格式。*gpt* 自然是 GPT 格式。至於 MBR 格式則是顯示 *dos* 。

但 fdisk/sfdisk/sgdisk 等工具只會列出 Disk UUID 和 Partition UUID 。
我們還需要知道 Filesystem UUID 。
EXT2/EXT3/EXT4 檔案系統可用 tune2fs 配合選項 `-l` 查看 Filesystem UUID。例如:

`$ tune2fs -l /dev/sda1 | grep UUID`

註: 一般用 blkid 查看。但碰到修改 UUID 的場合， blkid 會顯示修改前的 UUID 。後面章節會提到需要修改 UUID 的理由。

#### 儲存與複製分割區表

只複製分割區表，不含分割區內的檔案。
這是為了讓兩顆磁碟的分割區配置保持一致。
手動操作 fdisk/sfdisk/sgdisk 等工具時，以 MB/GB 為單位的分配方式實際上並不能保證分割區配置一致。

分割區表格式分成 MBR 和 GPT (GUID Partition Table) 兩種。
使用的工具不一樣。

##### GPT 格式

假設來源 (SOURCE) 為 /dev/sda ，目的 (DEST) 為 /dev/sdb 。

儲存分割區表為一個備份檔:

`$ sgdisk $SOURCE --backup=partitions-info.sgdisk`

讀入備份檔的分割區表，寫入目的磁碟:

`$ sgdisk --load-backup=partitions-info.sgdisk $DEST`

直接複製 SOURCE 的分割區表到 DEST:

`$ sgdisk $SOURCE --replicate=$DEST`

隨機設定新的 Partition UUID:

`$ sgdisk -G $DEST`

##### MBR 格式

假設來源 (SOURCE) 為 /dev/sda ，目的 (DEST) 為 /dev/sdb 。

儲存分割區表為一個備份檔:

`$ sfdisk -d $SOURCE > source-partition-table.sfdisk`

讀入備份檔的分割區表，寫入目的磁碟:

`$ sfdisk $DEST < source-partition-table.sfdisk`

直接複製 SOURCE 的分割區表到 DEST:

`$ sfdisk -d $SOURCE | sfdisk $DEST`

為磁碟隨機設定新的 Disk UUID:

`$ sfdisk --disk-id $DEST $disk-UUID`

為分割區隨機設定新的 Partition UUID:

`$ sfdisk --part-UUID $DEST $partN $new-UUID`

#### 分割區對分割區複製

指令範例。由 Clonezilla 提供。

`
$ /usr/sbin/ocs-onthefly -e1 auto -e2 -r -j2 -sfsck -k 
  -p choose -f sda1 -d sdb1
`

* -batch: 不提示任何確認。默認則是詢問兩次是否執行？
* -f {來源分割區}: 這裡用的分割區名稱不需要包含 /dev 。
* -d {目的分割區}: 格式同上。
* -p choose: 操作完後詢問使用者下一步。
* -p true: 操作完後回到命令列。

參考 [ocs-onthefly doc](https://clonezilla.org/fine-print-live-doc.php?path=./clonezilla-live/doc/98_ocs_related_command_manpages/02-ocs-onthefly.doc)。

如果不想直接分割區對拷，而是先產生備份影像檔的話，可以改用 ocs-sr 指令。
例如下列指令將一次性備份 sda1, sda2, sda3 三個分割區影像至 /home/partimag/sda-parts-img 目錄下。

`
$ /usr/sbin/ocs-sr -q2 -c -j2 -z9p -i 4096 -sfsck -scs -senc 
  -p choose saveparts sda-parts-img sda1 sda2 sda3
`

如果你想知道 `dd` 指令怎麼做，可以參考我這篇 [產生指定容量的 Raspberry Pi SD 卡磁碟映像]({% post_url 2019-08-23-Raspberry_Pi_產生指定容量_SD_image %})。

#### 批次處理範例

設母片前兩個分割區是 EXT4 檔案系統，第三個分割區是 Swap 。
並且已知母片第一個分割區的 Filesystem UUID 是 "1234-5678"。
批次作業將檢查來源的 UUID ，以免操作方向相反而失去母片。

這個 shell script 執行時要提供兩個參數，分別指出母片和目的地的檔案名稱。
例如 sda 和 sdb 。

```shell

#!/bin/sh

if [ "$2" = "" ]; then
    echo "Usage: <SRC> <DST>"
    echo "example: clone-disk sda sdb"
    exit 1
fi

SRC="$1"
DST="$2"

# 檢查 SRC 是否為母片
tune2fs -l /dev/${SRC}1 | grep 1234-5678
if [ $? -ne 0 ]; then
    echo "$SRC is not original disk."
    exit 1
fi

echo "Data in ${DST} will be lost. Press Ctrl+C to break operation else continue."
read K
if [ $? -ne 0 ]; then
    exit 0
fi

# 直接複製分割區表:
sgdisk /dev/$SRC --replicate=/dev/$DST

# 隨機設定新的 Partition UUID:
sgdisk -G /dev/$DST

# clone ext4 partitions
ocs-onthefly -batch -e1 auto -e2 -r -j2 -sfsck -k -p true -f ${SRC}1 -d ${DST}1
ocs-onthefly -batch -e1 auto -e2 -r -j2 -sfsck -k -p true -f ${SRC}2 -d ${DST}2

# format swap parttion.
mkswap /dev/${DST}3

echo "Done."

```

#### 啟動問題

1. 雖然重設了新的 Partition UUID ，但 Filesystem UUID 沒改。
2. 分割區對分割區複製之後，兩邊的 Filesystem UUID 相同。

兩顆磁碟分別上線，皆可正常啟動作業系統。
然而兩顆磁碟同時上線時，作業系統可能會隨機挑選分割區掛載。

因為 fstab 目前普遍採用的設定方式是認 Filesystem UUID 掛載。
必須指定新的 Filesystem UUID 才能讓作業系統正確掛載分割區。

例如兩顆磁碟的分割區與檔案系統 UUID 如下:

```text

sda1 UUID=root-1111 PARTUUID=part-a111
sda2 UUID=home-2222 PARTUUID=part-a222

sda1 UUID=root-1111 PARTUUID=part-b111
sda2 UUID=home-2222 PARTUUID=part-b222
```

fstab 的內容是:

```text

UUID=root-1111  /
UUID=home-2222  /home
```

啟動後，實際掛載情形可能是下列排列組合:

* /       /dev/sda1
* /home   /dev/sdb2

或者:

* /       /dev/sdb1
* /home   /dev/sda2

如果需要兩顆磁碟同時在線，解決方案有兩種。

第一種， fstab 第一欄改用 PARTUUID 而不是 UUID 。

UUID 依 Filesystem UUID 掛載。PARTUUID 則依 Partition UUID 掛載。

第二種，修改 Filesystem UUID 。

EXT2/EXT3/EXT4 檔案系統使用 tune2fs 指令。例如:

`$ tune2fs -U random /dev/sda1`

選項參數 *random* 會隨機產生一個 UUID 。

Swap 分割區則使用 mkswap 指令修改 Filesystem UUID 。
假設 Swap 分割區是 /dev/sda4 ，指令如下:

`$ mkswap --UUID ???? /dev/sda4`

###### 資源連結

* [CloneZilla 再生龍 Live 下載](https://clonezilla.nchc.org.tw/clonezilla-live/download/)
* [產生指定容量的 Raspberry Pi SD 卡磁碟映像]({% post_url 2019-08-23-Raspberry_Pi_產生指定容量_SD_image %})
* [用 Ventoy 將 CloneZilla 和 GParted 放在同一隻 USB 開機碟]({% post_url 2022-01-30-CloneZilla_Gparted_Ventoy %})
