---
title: Mosquitto 設置安全性 Websocket (wss)
category: computer
tags: [mqtt,mosquitto,websocket,ssl]
lastupdated: 2019-01-31
---

我早先在網頁前端使用 MQTT 處理訊息時，大多是在內網或非加密性網站。所以我用 [mosquitte](https://mosquitto.org/) 架設的 MQTT 服務只啟用了一般性的 *ws* 協定。但近日開發一項基於 PWA 的網站應用 (Web App) 時，看到 mqtt 連線失敗的訊息，才知道處於 *https* 狀態的網頁， mqtt 也必須走安全性的 *wss* 連線。

所以我又花了不少時間，將公司內的 mosquitto 服務設置加進 *wss* 協定。本文也會特別說明 mosquitto 在 Windows 平台上設置 *wss* 的注意事項。事實上，我大部份時間就是耗在 Windows 平台上頭。

<!--more-->

在網頁前端使用 MQTT 處理訊息時，得要走 *WebSocket* 協定。而 WebSocket 也和 HTTP 協定一樣，分成未加密傳輸的 *ws* URI協定名稱，與加密傳輸的 *wss* URI協定名稱。而瀏覽器基於安全性理由，要求前端的 WebSocket 請求必須與 HTTP 請求處於相同或更高的安全層級。簡單地說，如果使用者是用 *https://* 開啟你的網頁，那麼網頁中的 WebSocket 請求就必須用 *wss://* 送出。如果用 *http://* 開啟網頁，才可以選 *ws://* 或 *wss://* 。

隨著愈來愈多的網站被鼓勵或被要求掛上 HTTPS 標誌之後，想要處理 MQTT 的開發者勢必要找提供 *wss* 連線的 MQTT 服務。如果你選擇用 mosquitto 自己設置 MQTT 服務，那就接著看下去吧。

首先，入門 mosquitto 安裝與設置基本 *ws* 協定，請看「[MQTT用戶端入門 - 二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})」。

其次， mosquitto 安裝手冊說明 wss 的內容時是用自簽憑證，僅能用於內網。而本文聚焦在公開網站上使用 MQTT 服務，所以你也得要為你的網站向公正憑證機構申請 SSL 憑證。 你可以選擇向 [Let's Encrypt](https://letsencrypt.org/) 申請。如果你的網站已經有 SSL 憑證，但卻是 PFX 格式的，那看「[使用 OpenSSL 從 PFX 憑證文件匯出 PEM 憑證與金鑰]({% post_url 2019-01-28-使用OpenSSL從PFX憑證文件匯出PEM憑證與金鑰 %})」。請找到根憑證/中繼憑證、網站憑證、網站私鑰這三份 PEM 格式文件的路徑。

關於 Windows 平台的用戶，如果你選擇下載 mosquitto for windows 的版本，那麼你必須選擇 <strong>1.54 或更新的版本</strong>。雖然 mosquitto for Windows 在 1.51 版時已經加入 WebSocket 支援，但卻因為內部 libwebsocket 未針對 Windows 平台作調整 (windows socket並不完整)，只能綁定 127.0.0.1 位址。換句話說，只能用於 localhost 之測試工作。這個 Bug 一直到 1.54 版才修正。 1.55 版則新增組態參數 *socket_domain ipv4* 解決它只綁定 ipv6 位址的問題。 mosquitto for Windows 安裝請看「[在 Windows 10 安裝 mosquitto 補遺]({% post_url 2017-10-17-MQTT-4-Install-mosquitto-on-windows %})」。

Linux 平台的用戶就簡單多了。只要 mosquitto 版本 1.4 以上即可。現在的 Linux 散佈套件幾乎都提供這版本或更新 mosquitto 套件。

##### mosquitto.conf:

設置 *wss*  協定內容。我將 MQTT 的 *wss* 埠設為 1885 ，故加入一個 *listener* 傾聽 1885 埠。接下來指定處理協定為 *websockets* 。重點是，在這個 listener 段落指定憑證與私鑰文件的路徑參數，分別是:

* cafile 根憑證/中繼憑證路徑。
* certfile 網站憑證路徑。
* keyfile 網站私鑰路徑。

整個 mosquitto.conf 範例如下。

~~~text
# Port to use for the default listener.
port 1883

# normal websocket ws://
listener 1884
protocol websockets

# secure websocket wss://
listener 1885
protocol websockets

# CA certificate
cafile C:/mosquitto/certs/CA.crt

# Path to the PEM encoded server certificate.
certfile C:/mosquitto/certs/my.domain.name.tw.crt

# Path to the PEM encoded keyfile.
keyfile C:/mosquitto/certs/my.domain.name.tw.key

~~~

mosquitto.conf 的結構沒有明顯分段，但它其實是用 *port* 和 *listener* 表示段落起迄。整份設置只能有一個 *port* ，這是第一段。接著每出現一個 *listener* 就開始一個新段落。新段落中的每一個參數項目，都是針對此段落之設置內容。

這個範例就分成了 3 個段落。

* 第一段 (port) 指示預設連接埠為 1883 ，其下沒有明示參數，故此連接埠的行為皆按預設值處理，亦即負責 MQTT 原生協定。
* 第二段 (第一個 listener) 連接埠 1884 ，其下有參數 *protocol* 指示此傾聽者走 websockets 協定。沒有憑證參數，所以 1884 負責非安全性 *ws* 連線請求。
* 第三段 (第二個 listener) 連接埠 1885 ，其下參數同樣指示走 websockets 協定。但此段落有憑證和私鑰參數，所以 1885 負責安全性 *wss*  連線請求。

你可以使用此工具網頁: [mqtt js utility](https://www.eclipse.org/paho/clients/js/utility/) 測試。注意，*TLS* 選項要打勾，表示用 *wss* 連接協定。不勾 TLS 就是用 *ws* 連接協定。但這個網頁是在 https 之下，所以不勾 TLS 走 *ws* 連接協定會被瀏覽器擋下，連不出去。
