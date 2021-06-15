---
title: 產生指定容量的 Raspberry Pi SD 卡磁碟映像
tags: ["raspberry pi",rpi]
category: computer
lastupdated: 2019-08-23
---

將 Raspberry Pi 的 SD 記憶卡備份為磁碟映像很簡單。但那是指同一張 SD 卡備份還原的情形。
在大量部署樹莓派設備時，我們需要一些特別的前置工作，才能產生很多張 SD 記憶卡都能用的磁碟映像。

win32diskimager 或 etcher 這些 Windows 磁碟備份與寫入工具有個缺點。
它們只能整顆磁碟備份或寫入，不能選擇備份的容量範圍。
然而標示相同容量的 SD 卡，實際容量仍有個別差異。少則十幾 MB ，多則差一、兩百 MB 。
因此，就算你備份的 SD 卡容量比你想寫入的 SD 卡容量只大一些，它也拒絕寫入。
在大量部署樹莓派設備時，非常不利。

我的維護經驗是:

1. 使用 gparted 縮減 SD 卡使用的分割區容量。
   我通常會縮減最後的分割區容量。尾巴留下 100~200MB 的不使用空間。對應 SD 卡容量的誤差量。
2. 使用 dd 指令建立 SD 卡磁碟映像。因為 dd 可以指定容量。

<!--more-->

#### 縮減分割區

需要一台安裝 Linux 作業系統桌面環境的電腦。你可以用另一台樹莓派來操作，但我習慣用 PC 。

使用磁碟分割區編輯工具 gparted 。
縮減最後的分割區容量。尾巴留下 100~200MB 的不使用空間。對應 SD 卡容量的誤差量。

將 SD 卡插入讀卡機後，作業系統會自動掛載 SD 卡的檔案系統。
但掛載後就不能用 gparted 編輯。所以執行 gparted 之前要先卸載。
下列指令可以一次卸載全部 SD 卡分割區。

~~~term
$ for MP in `ls /media/$LOGNAME/`; do sudo umount /media/$LOGNAME/$MP; done
~~~

#### 容量計算與產生磁碟映像

執行 `sudo fdisk -l` 查看 SD 卡的實際容量。
假設容量為 15609102336 。
我如果用 gparted 保留尾端 150MB 不用，那麼我備份磁碟映像時會減大約 100MB ，
也就是取 `15609102336 - (100 * 1024 * 1024) = 15504244736` bytes 的內容。
備份指令的參數就會是:

~~~term
$ sudo dd if=/dev/sdd of=pi-image.img bs=32768 count=473152
~~~

上列指令假設 SD 卡分配為設備 /dev/sdd 。
每次讀 32768 bytes ，故需要讀 `15504244736 / 32768 = 473152` 次。

如果用樹莓派的 Raspbian 編輯 SD 卡內容，那麼可能沒有足夠空間直接在本機儲存磁碟映像。
應用進階技巧，直接將 dd 讀出的內容透過 ssh 傳到遠端主機上儲存。
如下例所示:

~~~term
$ sudo dd if=/dev/sdd bs=32768 count=472512 | \
  ssh rock@192.168.160.100 "7z a pi-image.7z -sipi-image.img"
~~~

此例將 dd 讀出的資料，直接透過 ssh 送到遠端主機 192.168.160.100 。
遠端主機同時執行 7z 工具，將讀到的資料同步壓縮儲存在 pi-image.7z 。

##### 相關文章

如果你已經有一份SD 卡的磁碟映像，你也可以直接操作磁碟映像調整分割區大小。請看「[Linux 掛載磁碟映像與編輯]({% post_url 2021-06-15-linux-mount-disk-image-and-edit %})」。
