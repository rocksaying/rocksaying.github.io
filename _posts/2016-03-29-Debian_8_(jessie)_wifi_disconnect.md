---
title: Debian 8 (jessie) WiFi 啟用後斷線
category: computer
old-category: 電腦技術
tags: [debian,jessie,wifi]
---

我的筆記型電腦 Thinkpad X200s 有好一陣子沒有使用 WiFi 網路。前兩天帶著出外勤時，才發現 WiFi 啟用後一下就斷線，之後再也連不上網路。不論是連接手機分享網路，或是無線 WiFi 基地台都相同。查看 dmesg 後發現下列錯誤訊息:

```text
wlan0: authentication with xxxxx (try 1)
wlan0: authentication with xxxxx (try 2)
wlan0: authentication with xxxxx (try 3)
wlan0: authentication with xxxxx time out
```

<!--more-->

幸好我還帶著一台平板電腦 (Windows 10)。利用它上網搜尋，發現遇到這情形的使用者並不少，但多數為 Intel 無線晶片的用戶 (模組套件 firmware-iwlwifi)。而我的 Thinkpad X200s 則使用 Realtek 無線晶片 (模組套件 firmware-realtek) 。

按照那些人回報的狀況，似乎在去年 5 月升級某一版本的 Linux 核心之後，穩定版(stable)套件庫提供的模組套件 firmware-iwlwifi 就不相容了，導致 WiFi 模組在啟用會不斷發生認證逾時而斷線的錯誤。解決之道是裝回舊版的 firmware-iwlwifi 。

由於狀況雷同，於是我也試著將我的模組套件 firmware-realtek 強制安裝 wheezy-backports 提供的舊版本。重新啟動系統後， WiFi 連線就正常了。我又在 jessie-backports 看到一個更新的版本，我也試著安裝它，也能正常運作。

總結，如果你是 Debian 8 Stable 版本用戶，但你的 WiFi 模組會斷線的話，那麼你的 WiFi 模組就得要安裝 wheezy-backports 或 jessie-backports 提供的版本。

參考下列內容，加入 wheezy-backports 或 jessie-backports 套件庫。由於無線晶片模組套件不屬於自由軟體，所以屬於 non-free 類別。在 apt 套件來源中記得加上 non-free 。

```text
# wheezy-backports
deb http://opensource.nchc.org.tw/debian/ wheezy-backports non-free

# jessie-backports
deb http://opensource.nchc.org.tw/debian/ jessie-backports non-free

```

各套件庫提供的模組版本整理如下:

firmware-iwlwifi:

* stable: 0.43 (會斷線)
* wheezy-backports: 0.43~bpo70+1 (正常)

firmware-realtek:

* stable: 0.43 (會斷線)
* wheezy-backports: 0.43~bpo70+1 (正常)
* jessie-backports: 20160110-1~bpo8+1 (正常)

iwlwifi 沒有更新的版本，所以必須以強制指定版本的方式安裝 wheezy-backports 的舊版模組套件。 realtek 則有 20160110 的新版模組套件，請直接升級。

我猜在 non-free 中的 WiFi 模組套件，可能都會碰上相同的狀況。

###### 參考文章

* [wifi disconnects every few minutes iwlwifi](http://crunchbang.org/forums/viewtopic.php?id=38670)
