---
title: Raspberry Pi 使用 4G 數據網路
category: computer
tags: ["raspberry pi",rpi,4g,iot,智慧農業]
---

在進行智慧農業的案子時，如何讓 Raspberry Pi 連接 internet 也是一個令人困擾的問題。在空曠的農田中， WiFi 訊號收不到，乙太網路不夠長。在 Raspberry Pi 上裝一個 4G 網路設備，可說是必然的答案。在蒐集資料以及實際使用後，我個人認為使用 4G Router (俗稱 4G 行動分享器) 是最簡易的解決方案。

<!--more-->

資料蒐集時，我先後往三種產品找尋可用於 Raspberry Pi 的 4G 網路設備。第一是 4G 無線數據模組；第二是 4G USB Modem (俗稱 4G USB 網卡)；第三是 4G Router (俗稱 4G 行動分享器)。

首先，關於 4G 無線數據模組，可用的產品非常少。就算找到了，台灣也有法規限制。在台灣，4G 通訊設備屬於 NCC 管制項目。 4G 無線數據模組依法要向 NCC 申請認證。在國內的零售市場，找不到申請過認證的 4G 無線數據模組。至於自己進口並向 NCC 申請認證這種事，不在考量之中。

#### 4G USB Modem

4G USB Modem ，在台灣一般稱為 4G USB 網卡。只是這個俗稱是錯的，非常容易造成誤解。我們俗稱的 4G USB 網卡，在作業系統眼中其實一直是 4G Modem (數據機)。嚴格說來，本文下一節提的 4G Router 才會被作業系統視為 USB 網卡。

我以前曾經使用過 3G USB Modem ，參閱 [BandLuxe C270 使用筆記](https://rocksaying.tw/archives/15987847.html)。而 4G USB Modem 的使用經驗也差不多。那種內建驅動程式的兩段式啟用方式，幾乎成了 4G USB Modem 的通用設計。

若你的 Raspberry Pi 作業系統是 Raspbian 。為了使用 4G USB Modem ，你需要安裝下列套件: usb-modeswitch, modemmanager, wvdial 。**如果運氣好**，你的 4G USB Modem 在插進 Raspberry Pi 時，系統就會觸發 usb-modeswitch 設定的啟用動作 - 解除 USB 裝置的內建儲存區，啟用 4G Modem 模組。接著， Modem manager 自動呼叫 wvdial 完成撥號接通 4G 基地台的動作，你的 Pi 就能上網了。

但是，運氣不好的話， usb-modeswitch 可能認不得你的 4G USB Modem 而無法切換模式。 Modem manager 和 wvdial 可能搞錯你的 4G 基地台的撥號指令。總之，有很多的可能原因，讓你的 4G USB Modem 無法發揮作用。我找到下列兩篇相關的討論文章。如果你屬於不幸的一方，你可以試著參考這兩篇文章找尋解決方法。

* [Connecting with Huawai E3372 modem](https://www.raspberrypi.org/forums/viewtopic.php?t=101582)
* [Huawei E3372 in Linux (Raspberry PI)](https://nvdcstuff.blogspot.tw/2015/04/huawei-e3372-in-linux-raspberry-pi.html)

#### 4G Router

4G Router ，在台灣一般稱為 4G 行動分享器。是自帶電池、內建 DHCP 服務與管理後台、以 WiFi 基地台的角色讓其他設備連線上網的設備。價格會比 4G USB Modem 貴。但零售市場上的產品種類比 4G USB Modem 多。

使用 4G Router 時，由 4G Router 負責和 4G 基地台連線的所有工作。免除了 Raspberry Pi 一切數據通訊的困擾。你只需要選擇方便的網路連線方式就好。你可以選擇讓 Raspberry Pi 使用 WiFi 網路連接；或者像我一樣，把  4G Router 插上 Raspberry Pi 作為 USB 乙太網路卡使用。後者的好處是，你不用擔心無線訊號干擾斷線，而且也相容 Pi 1/2 這些未內建 WiFi 模組的舊機板。

我的用法是將 4G Router 直接用 USB 線接上 Raspberry Pi 。透過 Raspberry Pi 的 USB 埠供電給 4G Router 。接著，我去看作業系統的網路設備列表 (ifconfig) 中是否多出了 USB ethernet device (乙太網路設備)。網路設備名稱可能是 *eth?* 或 *usb?* 。一但 Pi 的作業系統將 4G Router 視為乙太網路設備，就會從 4G Router 內建的 DHCP 服務分配到一個 LAN IP ，然後就能上網了。就這樣，比使用 4G USB Modem 還簡單。你只需要擔心 4G Router 找不到基地台的事。

注意! 使用時，請詳閱該設備的使用說明書，進入管理後台，修改預設密碼。該關的關，懂得設定防火牆就設。

4G Router 透過 USB 連接電腦後可以當 USB 乙太網路卡的功能，稱為 [USB tethering](https://zh.wikipedia.org/wiki/Tethering) 。我用過下列兩種 4G Router 都支持這種模式。

* D-Link友訊 DWR-933
* HUAWEI 華為 E5573s

如果你的 4G Router 的 USB 埠只負責充電用途而不支持 USB tethering 的話，你還是可以選擇用 WiFi 無線分享的方式連接網路。

由於 4G Router 的相容性和使用途徑比 4G USB Modem 簡單太多了，所以我認為 4G Router 是 Raspberry Pi 在空曠地區使用網路時的最簡易方案。但如果你的使用需求有嚴格的電力使用限制，你還是要找 4G 無線數據模組，並且撰寫控制程式，在需要傳出資料時才開啟 4G 模組。
