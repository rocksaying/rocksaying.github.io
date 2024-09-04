---
title: CloneZilla 再生龍客製化，還原後自動擴大指定分割區的容量
category: computer
tags: [clonezilla,gparted]
lastupdated: 2024-09-05
---

「CloneZilla 再生龍」有個功能叫「[recovery-iso-zip 產生回復專用的再生龍](https://clonezilla.nchc.org.tw/clonezilla-live/doc/fine-print.php?path=04_Create_Recovery_Clonezilla) 」。它可以將磁碟印象檔打包成一份還原光碟或 USB 碟。
用這份還原光碟或 USB 碟開機後，就會自動進行磁碟還原工作。使用者不需要搞懂什麼是印象檔或磁碟代號。

這個自動化功能很方便，但還可以更聰明。本文將說明如何客製一份 CloneZilla 再生龍還原光碟。客製化項目是將磁碟印象檔還原到更大容量的磁碟後，只擴大指定分割區的容量。

<!--more-->

### 目前的分割區還原處理方式

CloneZilla 目前的分割區還原處理方式有三種:

1. 照原本的配置複刻 (參數 -k0)。
2. 照原本的配置按比例擴大每個分割區的容量 (參數 -k1)。
3. 不理會原本配置容量，直接按目標磁碟的分割區順序寫入資料。

第 3 種方式，要求使用者事先手動分割目標磁碟，再跑 CloneZilla 還原。操作者需要知道原本磁碟的分割區配置和使用容量，才能分配合適的分割區。操作者需要比較高的技術能力，不符合本文的自動化需求。

第 2 種方式，舉例說明。例如我原先使用一顆 200 GB 磁碟，分成 3 個分割區，容量分別是 100 MB, 512 MB, 199 GB。
利用 CloneZilla 搭配 *-k1* 複製到 2 TB 磁碟之後，這顆新磁碟的 3 個分割區容量，就會按比例調整為 1 GB, 5 GB, 1990 GB。

乍看合理，其實不符合 Linux 老手的需求。

因為實務狀況是有一些分割區的容量固定不變。例如 ESP (EFI 保留區) 只需要 100 MB； boot 只需要 512 MB。甚至基本系統區 (/bin, /lib, /usr) 的容量通常也是固定的。升級到大容量磁碟時，並不需要擴大這些分割區的容量。
只有 /home, /var 這兩種資料區才需要擴大容量。

本文的客製化方式，就是希望還原到大容量磁碟後，只擴大資料用途分割區的容量，而不是等比例擴大所有分割區容量。

### 情境設定

本文案例的磁碟分割區配置如下:

* sda1: ESP, 100MB.
* sda2: boot (/boot), 512MB.
* sda3: swap, 2GB.
* sda4: root (/), 剩餘全部容量.

這是 Debian 引導安裝時的基礎分配。配置理由可參考我寫的這份筆記「[磁碟分割]( https://github.com/shirock/rocksources/blob/master/linux/debian/partition.md)」。

我要求在還原到大容量磁碟後，只擴大 sda4 分割區容量，把增加的可用空間都分給 sda4。

### 客製化步驟

#### 第一步，先做一份磁碟印象檔

假設這份印象檔的儲存資料夾是 /home/nas/backup/vm-2024-08-img 。
在這份資料夾內，有 Info-OS-prober.txt, clonezilla-img 等檔案。

#### 第二步，撰寫客製化工作指令稿

在第一步的印象檔資料夾內，建立一個 shell script 指令稿，撰寫客製化工作。

本文的客製化工作是還原磁碟之後再擴大分割區容量，故將 shell script 指令稿取名為 restore_postrun.sh 。
存在第一步建立的印象檔資料夾內: /home/nas/backup/vm-2024-08-img/restore_postrun.sh。

restore_postrun.sh 內容如下：

```shell
#!/bin/sh
/usr/sbin/parted --fix /dev/sda resizepart 4 100% print

/usr/sbin/fsck -y /dev/sda4

/usr/sbin/resize2fs -f /dev/sda4

exit 0
```

客製化工作用了三個工具。 *parted* 調整指定分割區的容量。*fsck* 檢查分割區檔案系統。*resize2fs* 將擴大後分割區容量寫入檔案系統表。
工具的參數說明請看文末列出的參考文件。

resize2fs 要求先跑到一次 fsck 才能動。所以一定要加一行 fsck。
fsck 和 resize2fs 這兩行也可換成 `ocs-resize-part /dev/sda4`。

#### 第三步，再次使用 CloneZilla 開機，但選擇「進入命令列」

客製化工作需要我們自己用命令列工具指定工作參數。

進入命令列後，請先執行 `prep-ocsroot` 命令，掛載印象檔資料夾到 */home/partimag*。

```term
# sudo su
# prep-ocsroot
# cd /home/partimag
```

我是把印象檔存在 NAS 的 /home/nas/backup 資料夾。需要透過這個方式設定 ssh server，把 NAS 的 /home/nas/backup 資料夾掛載起來。
掛載的路徑是 */home/partimag*。

CloneZilla 掛載後，本文第一步建立的印象檔資料夾將會是 /home/partimag/vm-2024-08-img。
而第二步準備的 restore_postrun.sh，在 CloneZilla 系統中的完整路徑現在是 /home/partimag/vm-2024-08-img/restore_postrun.sh。

#### 第四步，產生還原光碟檔

使用 *ocs-iso* 命令列工具產生還原光碟檔 (ISO)。

在 CloneZilla 命令列下達指令:

```shell
ocs-iso -g zh_TW.UTF-8 -t -k NONE -a vm-restore \
 -x "ocs_restoredisk_postrun=/home/partimag/vm-2024-08-img/restore_postrun.sh" \
 -e "-g auto -e1 auto -e2 -r -j2 -c -k0 -scr -p poweroff restoredisk vm-2024-08-img sda" \
 vm-2024-08-img
```

注意:

1. ocs-iso 認定的工作資料夾是 /home/partimag 。你必須在這個位置執行指令，否則就會發生找不到印象檔的錯誤。
2. 參數 *-a* 指定光碟 ISO 檔名為 vm-restore.iso。副檔名 .iso 會自動加上，不用寫。
3. ocs_restoredisk_postrun 指定還原磁碟後要執行的客製工作。也就是第二步準備的命令稿 restore_postrun.sh。
4. 指令中的 *vm-2024-08-img* 是本文案例的印象檔資料夾名稱。請按你的實際情形，替換成你的印象檔資料夾名稱。
5. sda 是還原目標的磁碟代號。也請按你的實際情形替換。

指令很長，我會另外寫在 shell script 指令稿，也放在 NAS 上。
等 CloneZilla 掛載到 /home/partimag 之後，我就可以執行它了。

以本文案例來說，我把 shell script 指令稿儲放在 NAS 的 /home/nas/backup/create-iso.sh。
CloneZilla 掛載後就是 /home/partimag/create-iso.sh。

若要建立還原 USB 碟，則將工具 *ocs-iso* 換成 *ocs-live-dev*。其他參數相同。

### 操作經驗談

#### 可以指定哪些客製化工作？

還原磁碟後的客製化工作是用參數 *ocs_restoredisk_postrun* 指定。
其他的參數請看 [Clonezilla live的開機參數](https://clonezilla.nchc.org.tw/clonezilla-live/doc/fine-print.php?path=99_Misc/00_live-boot-parameters.doc)。

每一個客製化開機參數，都可以後綴 1, 2, 3 指定多個指令。
例如 ocs_restoredisk_postrun1="..." ocs_restoredisk_postrun2="..."。

但是它沒有處理好 escape 字元，你得要小心處理空白和雙引號。
所以我的建議是把多個指令寫進一個 shell script 指令稿的作法較佳。

#### shell script 要放哪？

CloneZilla 的使用手冊並沒有說明。
根據我的使用經驗，最好的位置是放在印象檔的資料夾內。
在本文案例就是放在 /home/nas/backup/vm-2024-08-img 內。
並設定執行權限 (chmod 0755)。

放在印象檔資料夾的每個檔案，都會被包進我們建立的還原光碟 ISO 或 ZIP。
放進 ISO 或 ZIP 中的資料夾路徑將會是 /home/partimag/印象檔資料夾名稱。

如此一來，我就可以明確地指示 ocs_restoredisk_postrun 該去哪找到要執行的 shell script 指令稿。

#### shell script 撰寫要項

我會先進入 CloneZilla 命令列，把客製化的工具指令實際操作一遍，確認每一步的結果。
再把指令歷程整理寫成 shell script。

* 執行身份是 root。
* 工作資料夾是 /home/partimag 。
* 建議使用絕對路徑。

#### CloneZilla 官方文件說的客製化方式

CloneZilla 官方文件介紹的客製化方式是先建立還原 USB 碟，然後要你去修改 USB 碟的 grub.cfg 開機參數。

缺點很明顯。你每次備份新的印象檔和還原碟後，都需要動手修改一次 USB 碟的 grub.cfg。
而且 grub.cfg 的內容很長，很難閱讀與編輯。
本文的作法就是自動化操作。每次建立還原碟時，就順便將參數寫入 grub.cfg 。

另外，如果你要建立還原光碟(ISO檔)，這個方法也不適用。

##### 參考文件

* [產生一個能自動執行的再生還原光碟或USB隨身碟](https://clonezilla.nchc.org.tw/clonezilla-live/doc/fine-print.php?path=04_Create_Recovery_Clonezilla)
* 客製化參數: [Clonezilla live的開機參數](https://clonezilla.nchc.org.tw/clonezilla-live/doc/fine-print.php?path=99_Misc/00_live-boot-parameters.doc)
* CloneZilla 還原光碟建立工具: [ocs-iso](https://github.com/stevenshiau/clonezilla/blob/master/sbin/ocs-iso)
* 分割區修改工具 parted: [How to manage partitions with GNU Parted on Linux](https://linuxconfig.org/how-to-manage-partitions-with-gnu-parted-on-linux)
* 調整檔案系統容量 [resize2fs manpage](https://www.man7.org/linux/man-pages/man8/resize2fs.8.html)
* [將印象檔ZIP寫入隨身碟](https://clonezilla.nchc.org.tw/clonezilla-live/liveusb.php)
