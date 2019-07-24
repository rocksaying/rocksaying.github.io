---
title: Rasberry Pi eth0 有線網路設定的 fallback 組態
tags: ["raspberry pi",rpi,dhcp]
category: computer
lastupdated: 2019-07-24
---

Raspberry Pi 使用作業系統 Raspbian GNU/Linux 9.9 (stretch) ，啟用 GUI 桌面。
在此環境下，傳統的網路介面組態 */etc/network/interfaces* 無效用。以 */etc/dhcpcd.conf* 為準。

dhcpcd.conf 的 eth0 有線網路基本組態就是向 DHCP 服務要求 IP 。如果所處環境沒有 DHCP 服務，那 eth0 就不設定任何 IP 。

如果是在靜態 IP 網路環境中使用 Raspberry Pi ，可以從 Raspbian 桌面上方工作列的 WiFi 圖示，打開「Wireless & Wired Network Settings」設定頁面，設定有線網路 eth0 的靜態 IP 。
若是自行編輯 dhcpcd.conf ，則設定內容如下 (假設靜態 IP 是 192.168.1.99):

```sh

interface eth0
inform 192.168.1.99

```

但 dhcpcd.conf 其實還有一組更有彈性的 fallback 組態，可在自動要求配置 IP 失敗後，才退回靜態 IP 。只是這組態得要動手編輯 dhcpcd.conf 。

<!--more-->

我先描述公司內的 Raspberry Pi 使用情境。
Raspberry Pi 會被裝在防水盒中，因為空間限制，沒有預留螢幕和鍵盤的接線空間。
唯一的維護途徑，就是用 SSH 或 VNC 遠端登入。

在公司內的商品開發階段，我們使用 DHCP 配置動態 IP 。
但當它連同控制設備一同移設到戶外運作時，就沒有任何網路可用。所以出廠前要改為靜態 IP 。
通常每台設備都設同一個靜態 IP ，維護人員只要記這一個 IP 就好。
維護人員到時就用網路線連接筆電與 Raspberry Pi ，遠端登入維護。
對了，用一般網路線就可以對接，不用 crossover 跳線。

我不想隨著設備移動就改變 eth0 的網路組態。
若是 Raspberry Pi 移到戶外之前忘了調整 eth0 為靜態 IP ，那現場維護人員可就頭痛了。
所以我選擇用 dhcpcd.conf 的 fallback 組態解決這個問題。

dhcpcd.conf 的 fallback 內容如下例:

```sh

# It is possible to fall back to a static IP if DHCP fails:
# define static profile
profile static_eth0
static ip_address=192.168.1.99/24

# fallback to static profile on eth0
interface eth0
fallback static_eth0

```

這意思很簡單。
先設定一個 static_eth0 的狀態，定義此狀態用靜態 IP 。
然後再定義 eth0 的組態，當它不能取得動態 IP 時，就退回用 static_eth0 定義的靜態 IP 。

如此一來，當設備移到戶外時，就會是通用的靜態 IP 。
移回公司維護時，又會變動態 IP 。
不再需要管理者動手調整它的網路組態。

