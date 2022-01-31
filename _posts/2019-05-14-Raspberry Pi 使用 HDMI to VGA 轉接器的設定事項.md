---
title: Raspberry Pi 使用 HDMI to VGA 轉接器的設定事項
category: computer
tags: ["raspberry pi",hdmi,vga]
lastupdated: 2019-06-07
cover: http://rocksaying.github.io/images/imgur/Xy0OHov.png
---

#### 用電需求

Raspberry Pi 的 HDMI 埠會提供符合 HDMI 規範的最低限度電源(5V/55mA)。但 HDMI to VGA 轉接器的訊號轉換晶片大約需要 50mA ~ 150mA 電流。供電量非常勉強地達標。而畫面解析度愈高，耗電量也愈高。因此 HDMI to VGA 轉接器建議外接供電才會穩定工作。

我碰到的情形是，在未外接電源時，可以正常顯示 NOOBS 的系統安裝畫面。但啟動 Raspbian 時，就會在啟動過程即將進入 GUI 模式前重啟。因為按預設組態， Raspbian 需自動偵測畫面最適解析度。在逐步提高解析度的偵測過程中，耗電量超過 Raspberry Pi 透過 HDMI 送來的電力，導致系統重啟。我必須為 HDMI to VGA 轉接器接上外接電源，才能正常啟動。

因此建議找附帶電源輸入端的品項。如果附帶的電源輸入端是 Micro USB 入電孔，你可以從 Raspberry Pi 的 USB 插座供電給轉接器。

例如:

* [JDA213 HDMI to VGA轉接器](https://tw.j5create.com/products/jda213)
* [HDMI TO VGA 轉接器附電源孔](https://24h.pchome.com.tw/prod/DCAX57-A90077VHQ)

有人動手改裝不含外部電源輸入的 HDMI to VGA 轉接器：[RaspberryPI : HDMI to VGA 加裝 USB 外接電源](http://gsyan888.blogspot.com/2013/07/raspberrypi-hdmi-to-vga-usb-power.html)。

<!--more-->

#### config.txt

作業系統方面，可以透過 config.txt 調整 HDMI to VGA 轉接器的輸出效果。按照預設值的話，轉接器通常只會用 VGA 解析度。以下分別說明與 HDMI 輸出有關的 config.txt 項。

完整的選項說明，請看 [Video options in config.txt](https://www.raspberrypi.org/documentation/configuration/config-txt/video.md)。

##### HDMI 功能

以下兩項是 noobs 添加的預設值，我沒有更動。

* hdmi_force_hotplug=1
* config_hdmi_boost=4

*hdmi_drive* 主要差別在是否輸出音訊資料。不影響 HDMI to VGA 轉接器工作。

* 1 - DVI ，不輸出音訊資料。
* 2 - 一般 HDMI。

##### 畫面解析度

*hdmi_mode* 主要影響畫面解析度。解析度尺寸對應的代號則依 *hdmi_group* 之值決定。建議用 `hdmi_group=2` (DMT 模式代號) 。
在 DMT 模式下，*hdmi_mode* 對應的解析度代號如下:

* 4 - 640x480 (VGA)，此為預設模式。
* 8 - 800x600 (SVGA)
* 16 - 1024x768
* 81 - 1366x768
* 82 - 1920x1080

我通常會從 `hdmi_mode=4` 開始試驗。如果透過 HDMI to VGA 轉接器可以顯示，再往更大的解析度調整。此外，在我的經驗中， 1024x768 以下解析度耗電量較低，轉接器可不用外接電源。

我建議最小操作畫面是 800x600 ，這可以顯示大部份 GUI 工具的完整視窗內容，而不會有一部份視窗內容不在畫面上。例如 Raspbian 桌面的「Raspberry Pi 設定」(rc_gui) ，在 VGA 解析度下，視窗下方的確定、取消按鈕就不在畫面上，使用不方便。雖然 Linux 桌面支援按住 Alt 鍵再按住滑鼠左鍵拖動整個軟體視窗的操作方式，讓你把本來看不到的部份拖出來。但畫面太小還是不好看。

*disable_overscan* 則會影響畫面顯示時是否允許出現黑邊區域。`disable_overscan=1` 時，若 LCD 螢幕最適解析度大於輸出解析度，則畫面上可能出現黑邊區域。而 `disable_overscan=0` 要求避免黑邊區域，但此時螢幕解析度將會略小於設定值。

例如設定 `hdmi_mode=16` ，在 `disable_overscan=0` 時，解析度可能是 9??x6?? 而不是 1024x768 。

##### 範例

我用 HDMI to VGA 轉接器，連接 19 吋 LCD 螢幕時，使用的 config.txt 內容如下:

```
hdmi_force_hotplug=1
config_hdmi_boost=4
hdmi_drive=1
hdmi_group=2
hdmi_mode=81
disable_overscan=1
```

##### VNC 解析度

Raspbian 用戶以 VNC 登入 Raspberry Pi 時，基本畫面大小就是看前述的 HDMI 設定。根據下列情況，決定解析度。

1. config.txt 沒有指定解析度，但有連接實體螢幕時，自動偵測螢幕最佳解析度。此時 VNC 的畫面解析度等於實際螢幕之解析度。
2. config.txt 指定解析度時，不論有無連接實體螢幕， VNC 的畫面解析度都會是 config.txt 指定的大小。
