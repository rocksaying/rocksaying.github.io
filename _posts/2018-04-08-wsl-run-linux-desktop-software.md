---
title: Windows Subsystem for Linux (WSL) 使用 Linux GUI 桌面軟體與中文字型
category: computer
tags: [wsl, linux, debian, windows, x-window, 中文]
cover: https://i.imgur.com/xrY65Iy.png
lastupdated: 2019-05-09
---

自從微軟將 Windows Subsystem for Linux (WSL) 正式釋出後， Windows 10 的使用者不必安裝虛擬機也可配置 Linux 環境，還可在 Microsoft Store 下輕鬆選擇你想用的 Linux 散佈版本。像是 Ubuntu, Debian, Kali Linux 都已經有 Microsoft Store 上的 App 版本。只要準備 1GB 左右的系統磁碟空間，你就能像安裝 Windows App 般安裝一套 Linux 終端環境。

在 WSL 的終端視窗下，使用文字終端軟體時幾乎沒有不適應之處。不過，人總是貪心的。文字終端軟體可以用，哪 Linux 的桌面應用軟體呢？我搜尋了網路上的相關文章，很快就成功跑起 Linux 桌面應用軟體，也順便解決了中文顯示的問題。

<!--more-->

#### 套件需求

想在 WSL 環境下使用 Linux 桌面應用軟體，基本需要額外 500MB 系統磁碟空間。 如果你想裝整套桌面管理環境 (KDE, gnome-shell, unity)，那需要 1.5GB ~ 2GB 。

我使用的 WSL 環境是 Ubuntu 和 Debian 。所以本文提到的軟體套件名稱與安裝工具，都針對 Ubuntu/Debian 。

在 WSL 終端視窗下，你需要執行 *apt-get* 指令安裝下列套件:

* x11-apps
* fontconfig
* dbus-x11
* xfonts-wqy 
* fonts-wqy-zenhei 
* fonts-wqy-microhei 

在 WSL ，我不裝桌面管理環境 (KDE, gnome-shell, unity 之類)。只安裝個別的 GUI 軟體。我個人選擇安裝下列 Linux 桌面應用軟體:

* gnome-commander : 左右雙面板的檔案管理器。
* geany : 功能豐富，且不依賴完整桌面環境的文字編輯器。

#### 安裝 X Server

Windows 上的 X Server 軟體常見下列兩種:

* [XMing](https://sourceforge.net/projects/xming/) X Server
* [VcXsrv](https://sourceforge.net/projects/vcxsrv/) Windows X Server

XMing 和 VcXsrv 功能都很齊全，只是 XMing 開源版的主程式已經多年不更新，而 VcXsrv 則是活躍狀態。所以目前多數人會選擇使用 VcXsrv 。

VcXsrv 安裝動作很簡單，執行安裝檔後，按指示一路下一步即可。安裝後， Windows 開始程式清單會多出兩個圖示: XLaunch 和 VcXsrv 。

執行 XLaunch 會先讓使用者挑選 X Server 的呈現模式和一些顯示功能設置，然後才起動 X Server 。

直接執行 VcXsrv 將預設採用 Multiple windows 模式起動 X Server 。一般用此模式即可。如果你想用 X Window 管理程式和桌面管理程式 (KDE, Gnome-shell) 的話，則建議選擇 One large window 模式。

以現況來說， VcXsrv 這邊不需要調整設置就可配合 WSL 工作。大部份需要手動調整的內容，都是 WSL 這端的事。

首先，啟動 WSL 視窗，安裝 *x11-apps* 套件，它提供了一些 X client 的小玩具，例如小眼睛 *xeyes* 。接著編輯 WSL 內的 */etc/profile* 或是 *~/.bashrc* ，加入一行 `export DISPLAY=127.0.0.1:0` 讓 X client 知道 X Server 的位址，本文用例就是本機電腦。至於連線遠端 IP 的玩法，不在本文範圍。

```term
$ sudo apt-get install x11-apps

$ echo "export DISPLAY=127.0.0.1:0" >> ~/.bashrc

# 或
$ sudo su
root$ echo "export DISPLAY=127.0.0.1:0" >> /etc/profile

```

將 `DISPLAY` 的設置內容存入後，再開啟一個 WSL 視窗，讓它載入新的設置內容。在這個 WSL 視窗中執行 *xeyes* 看看你的桌面上是不是出現了一對 X 小眼睛。

![xeyes on Windows Subsystem for Linux](https://i.imgur.com/3o8G19E.png)

<div class="note">
X Window (沒有 s ) 是 UNIX 時代發展出的一套巧妙的視窗工作架構，採用主從式通訊協定架構。和 Windows 的整合式視窗架構大不相同。詳情請看維基百科: <a href="https://zh.wikipedia.org/wiki/X_Window%E7%B3%BB%E7%B5%B1">X Window系統</a>。
</div>


#### D-Bus

現代化的 Linux 桌面版本都遵循著 [freedesktop.org](www.freedesktop.org) 規劃內容，讓各種不同的 X 軟體開發框架有一致的桌面整合途徑。在這之中， D-Bus 是最主要的訊息匯流排協定，幾乎所有主要的 Linux 桌面軟體都透過 D-Bus 和桌面整合。所以要執行這些桌面軟體，還需要搞定 D-Bus 設置。

在 WSL 環境下，安裝 *dbus-x11* 套件。按照 D-Bus 機制，需要用到 D-Bus 的時候， dbus daemon 將會自動執行，不需要使用者手動執行。

D-Bus 服務預設使用 *UNIX Domain Socket* 建立通訊管道。但是 Windows 10 1803 版本之前並不支援這種 Socket 型態，所以 WSL 環境要改用 *TCP/IP Socket* 。Windows 10 1803 起，已實作 *UNIX Domain Socket* 功能，就不需要修改。

編輯 */etc/dbus-1/session.conf* 加入下列設定改用 *TCP/IP Socket*:

```
<listen>tcp:host=localhost,port=0</listen>
```

Linux 桌面應用軟體這一部份，可參考「[Debian 8 (jessie) 安裝筆記 基礎篇](https://rocksaying.tw/archives/31064659.html)」，選擇你需要的軟體套件。


#### 中文顯示與輸入

我安裝了*geany* 文字編輯器，用它開啟一個中文內容的文件。在未安裝中文環境之前，執行畫面如下圖。

![安裝中文字型前](https://i.imgur.com/vAwAR9E.png)

WSL 安裝好之後，預設就會採用 *zh_tw.UTF-8* 的正體中文組態。所以 geany 也會使用中文語系介面。但因為尚未安裝中文字型，故原本應顯示中文字的內容，全都以方塊豆腐字取代。

至於背景正常顯示中文的瀏覽器畫面，那是我的 Windows Firefox 內容。不是 WSL 內的 Linux Firefox 。

原先以為要錯誤嘗試很多事，但靠著我以前留下的中文環境的安裝筆記，我一下就搞定了。在 WSL 環境下安裝 Linux 中文桌面環境的步驟，基本上就與我從 Debian/Ubuntu 基本安裝的基礎上加裝中文環境的步驟相同。參考「[Debian 8 (jessie) 安裝筆記 中文環境篇](https://rocksaying.tw/archives/31556973.html)」。 WSL 用例不必主動安裝 KDE 或 GNOME Desktop 套件。有套件依賴的時候，再自動安裝即可。

安裝中文字型後，我先在 WSL 視窗中執行 *fc-list* 列出 X Server 找到的中文字型，確認文泉驛黑體可用。再同樣以 geany 開啟相同文件。現在中文字就正常顯示了。

![安裝中文字型後](https://i.imgur.com/xrY65Iy.png)

<div class="note">
<p>
如果你想手動安裝更多中文字型，字型檔的目錄是在 WSL 環境內部的 /usr/share/font 或者 ~/.fonts 。
</p>
<p>
在 WSL 終端視窗中，你可以把 /mnt/c/Windows/Fonts 的 TrueType 字型複製到 /usr/share/font/truetype 或是在 ~/.fonts 中建個符號連結指向 /mnt/c/Windows/Fonts 。
</p>
</div>

不過呢，你會發現中文輸入不能用。雖然 Windows 的中文輸入法可以讓你在 WSL 的終端環境下輸入中文字，但卻不能用於 WSL 下的 Linux 桌面軟體。你需要再安裝 X Window 的輸入法。我個人是用 *hime* 。細節在參考筆記中都提到了，不再細說。


###### 參考文件

* [【WSL】Windows Subsystem for Linux 安裝及基本配置！](https://blogs.msdn.microsoft.com/microsoft_student_partners_in_taiwan/2017/10/03/wsltune/)
* [WSL interoperability with Windows](https://docs.microsoft.com/zh-tw/windows/wsl/interop)
* [Debian 8 (jessie) 安裝筆記 基礎篇](https://rocksaying.tw/archives/31064659.html)
* [Debian 8 (jessie) 安裝筆記 中文環境篇](https://rocksaying.tw/archives/31556973.html)
* [X Window系統](https://zh.wikipedia.org/wiki/X_Window%E7%B3%BB%E7%B5%B1)
