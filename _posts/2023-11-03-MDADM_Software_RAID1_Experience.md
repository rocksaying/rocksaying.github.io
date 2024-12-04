---
title: MDADM 軟體磁碟陣列 RAID 1 使用經驗與心得
category: computer
tags: [linux,raid,mdadm]
lastupdated: 2024-12-04
---

用 Software RAID (MDADM) 做 RAID 1 磁碟陣列。

先說明，RAID 1 適合用在全年不關機，又要保持資料即時備份的場合。
不適合常常關機的家用電腦。對常年不關機的家用 NAS，可以說是成本最低的資料保全方案。

1. [本文情境設定的磁碟分割表]({{page.url}}#本文情境設定的磁碟分割表)
2. [磁碟故障操作情境]({{page.url}}#磁碟故障操作情境)
3. [系統安裝時就建立 RAID 1]({{page.url}}#系統安裝時就建立-raid-1)
4. [把工作中的分割區轉移到 RAID 1]({{page.url}}#把工作中的分割區轉移到-raid-1)
5. [陣列中的磁碟單獨拿到另一台電腦]({{page.url}}#陣列中的磁碟單獨拿到另一台電腦)

<div class="note">
2024-12-04: 更新關於 UEFI 啟動系統的重建方式，以及 swap 處理。
</div>

<!--more-->

本文情境設定的磁碟分割表
------------------

| 設備 | 掛載點    | 容量    | 檔案系統 |
|------|-----------|---------|----------|
| sda1 | /boot/efi | 100 MB  | FAT32    |
| sda2 | md2       | 512 MB  | Ext2     |
| sda3 | Swap      | 1 GB    | swap     |
| sda4 | md4       | 1000 GB | Ext4     |
| sdb1 |           | 100 MB  | FAT32    |
| sdb2 | md2       | 512 MB  | Ext2     |
| sdb3 | Swap      | 1 GB    | swap     |
| sdb4 | md4       | 1000 GB | Ext4     |
| md2  | /boot     | 512 MB  | Ext2     |
| md4  | /         | 1000 GB | Ext4     |

Boot 和 Root 各組一個 RAID 1 陣列。

* 陣列 /dev/md2 是 /dev/sda2 + /dev/sdb2。
* 陣列 /dev/md4 是 /dev/sda4 + /dev/sdb4。

磁碟故障操作情境
----------------

先說明磁碟故障時該怎麼處理。
沒用過 MDADM 的人，請先評估能不能應付這種情形。

磁碟陣列的操作情境都是針對 *磁碟可以熱插拔* 的情形。
在開機運作過程中，若一個磁碟故障時，管理者先告訴 MDADM 從陣列中移除故障磁碟。
然後管理者就可以拔下故障磁碟換上新的。再告訴 MDADM 新磁碟上線了，讓它在新磁碟上重建資料。
*全程不關機*，維持電腦全年不關機運作。

「全程不關機」聽起來很美好。但你的電腦機殻上有磁碟抽取設計嗎？
家用或辦公室電腦 (非伺服器型) 都是把磁碟鎖在機殻內部。
你敢在不關機狀態下，打開機殻、拆下磁碟嗎？

機殻設計先不管，再繼續看指令操作過程。注意，本文所有指令，都是用 root 執行。

若第二個磁碟 (sdb) 故障。首先移除故障磁碟:

```term
# mdadm --manage /dev/md2 --remove /dev/sdb2
# mdadm --manage /dev/md4 --remove /dev/sdb4
```

拔下故障磁碟，換上新的。
這時新磁碟連分割區都沒建，還不能加入陣列。
可以直接複製目前分割區狀態到新磁碟

```term
; MBR分割表用 sfdisk 複製
# sfdisk -d /dev/sda | sfdisk /dev/sdb

; GPT分割表用 sgdisk 複製
# sgdisk /dev/sda --replicate=/dev/sdb
; 隨機設定新的 Partition UUID
# sgdisk -G /dev/sdb

; 格式化新磁碟的置換空間 (/dev/sdb3)
# mkswap /dev/sdb3
```

手動重建 ESP 與更新 EFI 啟動紀錄。我未將這塊納入 MDADM 管理。

```term
# mkfs.fat -F 32 /dev/sdb1
# mount /dev/sdb1 /mnt
# rsync -a /boot/efi/EFI /mnt
# umount /mnt

; 或者直接用 dd 寫入 ESP
# dd if=/dev/sda1 of=/dev/sdb1

; 查看目前 EFI 紀錄
# efibootmgr -v

Boot0004* EFI Internal Shell
Boot0005* debian        HD(1,GPT,db0ae29a-...)/File(\EFI\debian\shimx64.efi)
Boot0006* debian2       HD(1,GPT,c334bd11-...)/File(\EFI\debian\shimx64.efi)

; 移除損壞磁碟(此例是第2個)的 EFI 紀錄 Boot0006
# efibootmgr -B -b 0006

; 將替換磁碟加入 EFI 紀錄
# efibootmgr --create --disk /dev/sdb --part 1 --label "debian2" --loader "\EFI\debian\shimx64.efi"
```

新磁碟建好分割區加入陣列:

```term
# mdadm --manage /dev/md2 --add /dev/sdb2
# mdadm --manage /dev/md4 --add /dev/sdb4
```

查看 MDADM 工作狀況，就會看到一行 Rebuild Status ，顯示重建進度。

```term
# cat /proc/mdstat
# mdadm -D /dev/md4

  Rebuild Status : ??% complete
```

在重建過程中，系統可以繼續工作。這是 RAID 1 最主要的好處。

反之，磁碟資料損毀的情形下關機最麻煩。
因為 RAID 1 沒有容錯能力。
在系統重啟後，MDADM 不知道哪個磁碟的資料有問題，你很難預期它會做什麼。
有可能把資料損毀的磁碟當成資料來源，同步到另一個磁碟，使兩個磁碟的資料一起變成不可用。
*若你的電腦常常關機，你甚至不要考慮 RAID 1，而要提升到 RAID 5。*

系統重啟後，有一個磁碟找不到的情形簡單些。
作業系統開機啟動時會先停住數分鐘。這時就是作業系統在等管理者插入新的磁碟。
你就可以按上面說的步驟，抽換磁碟、重建分割區、加入陣列。

但在生產環境，一般使用者只會覺得卡住開不了機，而想重覆 reboot，悲劇。
如果一直放置不理，開機程序最後就會提示等候逾時，切換到緊急模式。
總之這時就先關機，通知管理者來處理。

<div class="note">
VirtualBox 可以模擬這個動作。
先移除一個磁碟，然後啟動虛擬機。
當啟動程序停住時，可以在虛擬機的「設定->存放裝置」頁面，加入硬碟 (插入新磁碟)。
然後啟動程序等一會就繼續跑下去了。
</div>

系統安裝時就建立 RAID 1
-----------------------

安裝時就準備兩個磁碟。引導到選擇分割區這一步時，必須選手動(Manual)，才會看到 Software RAID 項目。

手動切分割區，然後組合陣列。這過程都有安裝程式引導，不必打指令，就不多說。

安裝最後一步，會問要在哪個磁碟上安裝 GRUB。先裝 sda。

如果你的電腦是經由 UEFI 啟動，請看上節的 efibootmgr 操作在 sdb 上建立啟動程式。
電腦經由 BIOS 啟動的話，則等啟動系統後，再下指令 grub-install 安裝一份到 sdb。
但這不是為了 sdb 也能獨立開機。而是為了 sda 故障消失時，可以從 sdb 進入啟動程序，等管理者換上新磁碟。

```term
# grub-install /dev/sdb
# update-grub
```

fstab 中不歸 RAID 管理的項目 (例如 ESP 和 swap)，建議不用 UUID，改成實際設備名稱 (/dev/sda1, /dev/sda3)。
假設故障情境是第一個磁碟 (原 sda) 損壞。
當主機找不到第一個磁碟時，第二個磁碟 (原 sdb) 的設備名稱就會頂替成為 /dev/sda。
原 /dev/sdb1 就會變成 /dev/sda1。 fstab 就能找到繼續用。
如果用 UUID (指向原 sda1)，那 fstab 就找不到了。

此外，安裝時在兩個磁碟中各切一個 swap 分割區，你的 fstab 通常會有兩個 swap 項目。
若是你在更換磁碟之後忘了修改 fstab 更新 swap 項目的 UUID，那麼開機會因為找不到 UUID 指定的 swap 而卡住幾分鐘。
改用實際設備名稱，例如本文的 /dev/sda3, /dev/sdb3，就比較省事。

fstab swap 紀錄的建議寫法:

```term
/dev/sda3    none    swap    sw,nofail    0    0
/dev/sdb3    none    swap    sw,nofail    0    0
```

把工作中的分割區轉移到 RAID 1
---------------------------

你安裝系統時只有一個磁碟。日後想要轉移到 RAID 1。

*注意，不能直接把一個有資料的磁碟分割區加到 RAID。*
因為建立 RAID 的過程，需要格式化 RAID 設備。這會清除原本的資料。
建議事先備份原來的資料。

安裝套件: `apt install mdadm rsync`。

情境設定與陣列建立流程:

1. sda4 是正在使用、有資料的 Root 分割區。
2. 準備另一個分割區 sdb4 ，用來和 sda4 組陣列 md4。
3. 你的系統還沒有任何磁碟陣列。先單獨用 sdb4 建立陣列 md4。
4. 格式化 md4。如 sdb4 不是全新分割區，那格式化會清除 sdb4 的資料。
5. 格式化後，掛載 md4 到 /mnt。
6. 將 sda4 (/) 的資料複製到 md4 (/mnt)。通常用 rsync。
7. 最後才是將 sda4 組進陣列 md4。

在一個新磁碟上建好分割區 /dev/sdb4。分割區型態 (type of partition) 要選 *fd* (Linux raid autodetect)。

先用這一個分割區建建立 RAID 1 磁碟陣列，然後格式化陣列。

```term
; 清除 sdb4 的 superblock 資料 (metadata)，確保 MDADM 知道這是一個新分割區。
# mdadm --zero-superblock /dev/sdb4

# mdadm --create /dev/md4 --level=1 --raid-disks=2 missing /dev/sdb4

# mkfs.ext4 /dev/md4
```

規劃是把 sda4 和 sdb4 組成陣列，但現在只能加進 sdb4。
留給 sda4 的位置，就要用 *missing* 表示。

把 sda4 (/) 的資料複製到陣列 md4:

```term
# mount /dev/md4 /mnt
# rsync -avh --exclude=/{boot,dev,media,mnt,proc,run,sys,tmp}/  /  /mnt

# umount /mnt
```

將 RAID 組合資訊，存入 */etc/mdadm/mdadm.conf*。

```term
# mdadm --detail --scan >> /etc/mdadm/mdadm.conf
```

用指令 `blkid` 查看各分割區 (含磁碟陣列) 的 UUID。
修改 /etc/fstab ，將原本指向 /dev/sda4 的那一條，改成 /dev/md4。

```text
# 原來的
UUID=sda4的uuid     /       ext4       errors=remount-ro     0     1

# 改成
UUID=md4的uuid      /       ext4       errors=remount-ro     0     1
```

重新啟動主機，讓 /dev/md4 掛載在 / 上。解放 /dev/sda4。

接著為了將 sda4 組進 md4，需要清除 sda4 的資料。對，清除。
我們要變更它的分割區型態為 *fd* (Linux raid autodetect)，*這會清除原本分割區上的資料*。

操作磁碟分割工具變更 sda4 的分割區型態之後，我們便可將 sda4 加入陣列 md4。
加入後， MDADM 就會開始重建資料。

```term
# mdadm /dev/md4 --add /dev/sda4

; 觀察陣列 md4 的狀態
# mdadm -D /dev/md4

```

最後觀察陣列 md4 的狀態，確認資料重建進度。
到此就完成將一組分割區轉移到磁碟陣列的工作了。

陣列中的磁碟單獨拿到另一台電腦
------------------------------

如果把陣列的其中一個磁碟單獨拿到另一台工作中的電腦，想要複製裡面的資料。
通常不能直接掛載。

1. 先看 /proc/mdstat 確認這個磁碟現在的狀態和名稱。
2. 要求 MDADM 停止控制它。
3. 告訴 MDADM 單獨跑這個磁碟。
4. 可以掛載了。

```term
; 查看狀態
# cat /proc/mdstat

; 假設看到 md4 : inactive sdb4[2]
; 這就是說 md4 磁碟陣列現在未動作，只有一個單位 sdb4 在。

; 停止 md4 磁碟陣列
# mdadm --stop /dev/md4

; 讓 md4 陣列單獨用 sdb4 一個單位跑
# mdadm --assemble --run /dev/md4 /dev/sdb4

# mount /dev/md4 /mnt
```

把陣列的磁碟單獨拿出來接在另一台電腦上，通常是為了資料救援。
也有人是再插一個新磁碟，在另一台電腦重製系統。嗯，也行啦。
