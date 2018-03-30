---
title: Windows Subsystem for Linux (WSL) 使用 Linux 桌面軟體 (X Server)
category: computer
tags: [wsl, linux, debian, ]
cover:
---


<!--more-->

#### 安裝 X Server

說到 Windows 上的 X Server 軟體，下列兩種為常見者:

* [XMing](https://sourceforge.net/projects/xming/) X Server
* [VcXsrv](https://sourceforge.net/projects/vcxsrv/) Windows X Server

XMing 和 VcXsrv 功能都很齊全，只是 XMing 開源版的主程式已經多年不更新，而 VcXsrv 則是活躍狀態。所以目前多數人會選擇使用 VcXsrv 。

VcXsrv 安裝動作很簡單，執行安裝檔後，按指示一路下一步即可。安裝後， Windows 開始程式清單會多出兩個圖示: XLaunch 和 VcXsrv 。

執行 XLaunch 會先讓使用者挑選 X Server 的呈現模式和一些顯示功能設置，然後才起動 X Server 。

執行 VcXsrv 則是用預設模式直接起動 X Server 。一般用此模式即可。

以現況來說， VcXsrv 這邊不需要調整設置，就可配合 WSL 工作。大部份需要手動調整的內容，都是 WSL 這端的事。

首先，啟動 WSL 視窗，安裝 *x11-apps* 套件，它提供了一些 X client 的小玩具。然後編輯 WSL 內的 */etc/profile* 或是 *~/.bashrc* ，加入一行 `export DISPLAY=127.0.0.1:0` 讓 X client 知道 X Server 的位址。

```term
$ sudo apt-get install x11-apps

$ echo "export DISPLAY=127.0.0.1:0" >> ~/.bashrc
# 或
$ sudo su
root$ echo "export DISPLAY=127.0.0.1:0" >> /etc/profile

```

將 `DISPLAY` 的設置內容存入後，再開啟一個 WSL 視窗，讓它載入新的設置內容。然後執行 *xeyes* 看看你的桌面上是不是出現了一對 X 小眼睛。

![xeyes on Windows Subsystem for Linux]()


#### D-Bus

現代化的 Linux 桌面版本都遵循著 [freedesktop.org](www.freedesktop.org) 規劃內容，讓各種不同的 X 軟體開發框架有一致的桌面整合途徑。在這之中， D-Bus 是最主要的訊息匯流排協定，幾乎所有主要的 Linux 桌面軟體都透過 D-Bus 和桌面整合。所以要執行這些桌面軟體，還需要搞定 D-Bus 設置。

在 WSL 環境下，安裝 *dbus-x11* 套件。 D-Bus 服務預設使用 *UNIX Domain Socket* 建立通訊管道。但是 Windows 並不支援這種 Socket 型態，所以 WSL 環境要改用 *TCP/IP Socket* 。
編輯 */etc/dbus-1/session.conf* 加入下列設定改用 *TCP/IP Socket*:

```
<listen>tcp:host=localhost,port=0</listen>
```

參考「[Debian 8 (jessie) 安裝筆記 基礎篇](http://rocksaying.tw/archives/31064659.html)」，選擇一套桌面軟體套件安裝。



#### 中文顯示與輸入

參考「[Debian 8 (jessie) 安裝筆記 中文環境篇](http://rocksaying.tw/archives/31556973.html)」。


