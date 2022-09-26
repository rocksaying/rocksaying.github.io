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

```term
$ sfdisk -d /dev/sda
```

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

```term
$ tune2fs -l /dev/sda1 | grep UUID
```

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

```term
$ sgdisk $SOURCE --backup=partitions-info.sgdisk
```

讀入備份檔的分割區表，寫入目的磁碟:

```term
$ sgdisk --load-backup=partitions-info.sgdisk $DEST
```

直接複製 SOURCE 的分割區表到 DEST:

```term
$ sgdisk $SOURCE --replicate=$DEST
```

隨機設定新的 Partition UUID:

```term
$ sgdisk -G $DEST
```
