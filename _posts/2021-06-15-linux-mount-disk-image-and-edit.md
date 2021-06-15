---
title: Linux Mount Disk Image and Edit 掛載磁碟映像與編輯
category: computer
tags: [debian,linux,"raspberry pi",rpi]
lastupdated: 2021-06-15
---

我手上有一份磁碟映像 (disk image)，它是從 SD 記憶卡或硬碟直接 dd 複製而來。
如果我需要修改磁碟映像的檔案系統內某個檔案的內容，我該怎麼做？

最笨的方法是把磁碟映像寫回記憶卡或硬碟，修改內容後，再重新做一個磁碟映像。
最好的方法則是利用 Linux 的 loop 設備 (loop device) 功能，把磁碟映像當成一個磁碟設備，直接掛載起來。
基本步驟如下:

1. 首先查看磁碟映像的分割狀態。
2. 計算指定分割區的起始位置。
3. 掛載這個磁碟映像的分割區到指定目錄。
4. 修改檔案內容。
5. 卸載磁碟映像分割區。

同理，你也能直接編輯磁碟映像的分割區。

<!--more-->

### 編輯磁碟映像內部的檔案

舉例而言，我有一份用於 Raspberry Pi 安裝 Rasbian 系統的磁碟映像 rpi8g.img 。
想要修改磁碟映像中的 /etc/dhcpcd.conf 的網路組態。照步驟做:

#### 首先查看磁碟映像的分割狀態

使用 *fdisk* 查看磁碟映像的磁碟分割狀態。

~~~term

root$ fdisk -l rpi8g.img

Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x0006e3ae

Device     Boot   Start      End  Sectors  Size Id Type
rpi8g.img1         8192  2427734  2419543  1.2G  e W95 FAT16 (LBA)
rpi8g.img2      2427735 31116287 28688553 13.7G  5 Extended
rpi8g.img5      2433024  2498557    65534   32M 83 Linux
rpi8g.img6      2498560  2627583   129024   63M  c W95 FAT32 (LBA)
rpi8g.img7      2629632 15212543 12582912    6G 83 Linux

~~~

#### 計算指定分割區的起始位置

磁碟映像的 root 檔案系統位在第 7 號分割區，分割狀態就是 rpi8g.img7 那一行。
這磁碟映像的每一磁區大小是 512 bytes (Sectors size)。
第 7 號分割區的起始磁區在 2629632 ，故其起始位置是在此磁碟映像第 `2629632*512 = 1346371584` 位元組的位置。

#### 掛載這個磁碟映像的分割區到指定目錄

用 *mount* 指令，搭配 *-o loop* 選項，將磁碟映像當成 loop 設備掛載。
其中的 *offset* 要指明磁碟映像內部分割區的起始位置。

rpi8g.img 內部第 7 分割區的起始位置是第 1346371584 位元組。
掛載到 /mnt/mnt1 目錄，指令如下:

~~~term

    # 第一種用法。把磁碟映像設置成名稱是 /dev/loop1 的 loop 設備。
root$ mount -o loop=/dev/loop1,offset=1346371584  rpi8g.img  /mnt/mnt1

    # 第二種用法。不指定 loop 設備名稱，由系統自動指派。
root$ mount -o loop,offset=1346371584  rpi8g.img  /mnt/mnt1

~~~

比較老的操作指令，則要把指派 loop 設備和掛載檔案系統這兩件事分成兩個指令。

~~~term

    # 先把磁碟映像設置為 loop 設備，名稱是 /dev/loop1
root$ losetup /dev/loop1 rpi8g.img

    # 掛載 /dev/loop1 設備到 /mnt/mnt1 目錄
root$ mount -o offset=1346371584 /dev/loop1 /mnt/mnt1

~~~

掛載之後，就可以到 /mnt/mnt1 操作到磁碟映像中的檔案系統內容了。
本例就是編輯 /mnt/mnt1/etc/dhcpcd.conf 。異動內容都會立即寫回磁碟映像。

#### 卸載磁碟映像分割區

檔案編輯完成，那就把磁碟映像卸下來吧。

~~~term 

    # 卸載
root$ umount /mnt/mnt1

    # 如果你有指派 loop 設備名稱，此指令將解除聯繫。
root$ losetup -d /dev/loop1

~~~

### 編輯磁碟映像的分割區

如果你的主要目的是編輯分割區而不是掛載檔案系統，你需要用 *losetup* 。

先用 *losetup* 將磁碟映像設置為 loop 設備，並指派一個設備名稱。在此用 /dev/loop1 。

然後用 *fdisk* 開啟這個設備，就可以編輯磁碟映像內的分割區狀態了。

~~~term

root$ losetup /dev/loop1 rpi8g.img

root$ fdisk /dev/loop1

    # 你也可以用 GUI 的 gparted
root$ gparted /dev/loop1

~~~
