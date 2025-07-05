---
title: 用 Ventoy 將 CloneZilla 和 GParted 放在同一隻 USB 開機碟
category: computer
tags: [clonezilla,gparted,ventoy,MultiBoot,LiveCD]
lastupdated: 2025-07-05
cover: https://rocksaying.github.io/images/2022-01-30-CloneZilla_Gparted_Ventoy.png
---

在 Linux 用戶圈中， CloneZilla 和 GParted (GNOME Partition Editor) 可說是系統備份轉移與磁區管理的兩大神器。就算是 Windows 系統的管理者，也應該準備好這兩個工具的開機用 USB 碟 (Live USB)，以備不時之需。

只是現在的 USB 隨身碟容量普遍超過 8 GB 。而 CloneZilla 或 GParted 的 Live USB 的容量要求不會超過 500 MB 。為此各自使用一隻 USB 碟很浪費。所以時不時有人想用多重開機管理工具把這些工具放在同一隻 USB 碟。

我個人試過一些多重開機 USB 碟的管理工具，例如 MultiBootCD 。但都有各自的缺點。不是很久未曾維護，就是和 UEFI 不相容。最後我找到了 Ventoy 。[Ventoy](https://www.ventoy.net/en/index.html) 自介是「新一代多系统启动U盘解决方案」。操作簡單，而且支援的規格也很新。

<!--more-->

先自下列網址取得本文需要的軟體。 CloneZilla 和 GParted 請選擇下載 LiveCD (.iso) 。

* [CloneZilla 再生龍 Live 下載](https://clonezilla.nchc.org.tw/clonezilla-live/download/)
* [GNOME Partition Editor Downloads](https://gparted.org/download.php)
* [Ventoy](https://www.ventoy.net/cn/doc_start.html)

接著準備一隻容量 1 GB 以上的 USB 碟。若已儲存資料，請先將資料複製出來。因為 Ventoy 安裝時，會清空安裝目標。

安裝過程請看 Ventoy 的[使用說明](https://www.ventoy.net/cn/doc_start.html)。執行安裝程式 Ventoy2Disk ，選擇你要安裝的 USB 碟。然後 Ventoy 會將這隻 USB 碟分割成兩個分割區。尾巴的 EFI 分割區容量是 32MB ，這裡放的是啟動管理程式。其餘容量全部分配給開頭的分割區，檔案格式是 exFAT 。這個分割區就是讓你擺放 LiveCD (.iso) 檔案的地方。

例如我的 USB 碟安裝 Ventoy 之後的狀態如下圖所示：

![Ventoy 安裝後的分割區狀態](https://rocksaying.github.io/images/2022-01-30-CloneZilla_Gparted_Ventoy.png)

這隻 4 GB 容量的 USB 碟安裝 Ventoy 後，剩下 3.86 GB 的 exFAT 分割區，分配到磁碟代號 F: 。
我再把 CloneZilla 和 GParted 的 .iso 檔案複製到 F: 上就完成了。

以 Ventoy 製作的 USB 開機碟在系統開機時，它會自動在那個大分割區尋找 .iso 檔案，然後列在開機選單中，讓你選取接下來要啟動哪一個 LiveCD 系統。

此外，如果你不想把整個 USB 碟的空間都分給 Ventoy 的話，可透過 Ventoy2Disk 的功能選單「選項」->「設定分割區」，勾取「在磁區最後保留一部份空間」，並填入你想保留的容量。如此一來，Ventoy 安裝後就會留下一塊未配置區域。你再使用磁碟管理程式，如 fdisk, gpartd ，在未配置區域上增加分割區並格式化。就有地方放置你需要的工具或檔案文件。

說下個人使用經驗。從 Ventoy 載入 CloneZilla 或 GParted 之後的 grub 選單，最好選擇 To RAM 的項目。像我的某些電腦，若啟動 GParted 時不選 To RAM 的項目，就會失敗。

除了 CloneZilla LiveCD 這種小系統，你也可以把 Ubuntu LiveCD 這種大系統放上去。
只是 Ubuntu LiveCD 的大小有 2~3 GB ，載入 .iso 的時間會很長。
若主機記憶體不足的話，還會在載入途中失敗。
