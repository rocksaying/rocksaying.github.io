---
title: Linux 桌面共用 VNC 工具說明
category: computer
tags: [linux,vnc,ssh]
cover: https://github.com/shirock/images/raw/main/2023/10-31-Linux-krfb-setting.png
lastupdated: 2023-10-31
---

各版本 Linux 散佈套件中，基本都有三款只提供「桌面共用」功能的 VNC 工具。

* x11vnc - 最基本UI，不綁定任何桌面環境。
* krfb - 基本綁定 KDE/QT 桌面。
* vino - 基本綁定 GNOME/Gtk 桌面。

它們不提供「遠端登入」功能。

<!--more-->

「桌面共用」工具適用下列情形:

1. 主機已經設定自動登入桌面。就是「顯示管理者 (Display manager)」啟用 autologin。
2. 你的主要工作是協助遠端使用者解決他的電腦使用問題，必須和對方看到相同畫面。
3. LAN 環境。這三個工具，或者說 VNC 工具的通病，多半沒有資料傳輸加密能力，所以不適用在公開網路。

這類工具要求本機使用者必須先登入桌面，然後再透過它們讓遠端使用者看到「本機的桌面內容」。
雙方會看到一樣的畫面，所以才說它們是「桌面共用」工具。
如果本機停留在「顯示管理者 (display manager)」的狀態，則遠端不能連接。

至於遠端登入功能的 VNC 伺服端工具不是這樣。
遠端登入的使用者是透過顯示管理者，登入「一個獨立的桌面會期」。
它不是和本機使用者共用同一個桌面會期，甚至不需要本機使用者登入桌面。
兩者互不接觸，彼此看不到對方的畫面。

但是具有遠端登入功能的 VNC 工具，需要與顯示管理者協調才能登入。
而 Linux 上的顯示管理者種類繁多，如 xdm, gdm, sddm, lightdm 等。
使得此類 VNC 工具設定相當麻煩。

X 視窗協定講古
------------

X 視窗協定的設計原本就可登入遠端主機使用。
並且允許一台主機同時登入多位用戶，各自有自己的工作空間 (桌面會期)。

當時常見用法是 X server 裝在本機，X client (GUI軟體) 裝在遠端主機。
使用者先登入遠端，然後執行遠端的 X client ，透 X 視窗協定把 GUI 畫面顯示在自己的電腦螢幕。
我最後一次做這種事，大概是 1999 年，用自己的 Linux PC 登入計算機中心機房的 SunOS/Solaris SPARC 工作站。

不過 X 視窗協定的實作軟體基本不跨平台，而 VNC 軟體可以。
後來就變成 X server 和 X client 都裝在同一台 Linux/BSD 主機上跑。
再透過 VNC 協定，把遠端電腦的畫面傳回自己的 Windows 電腦。
到這裡就是「桌面共用」。

讓 VNC 工具可以處理遠端登入工作，又是後來的事了。
某方面來說，後來反而像是把登入遠端桌面這件事搞得多此一舉了。

x11vnc
------

x11vnc 其實不難，就兩步。

1. 設定登入密碼。最好和使用者自己的帳號密碼不一樣。

```term
$ x11vnc -storepasswd
```

然後手動執行它，確認遠端是否可以連線。

```term
$ x11vnc -forever -rfbauth ~/.vnc/passwd -rfbport 5900
```

你可以先和遠端使用者聯繫時間，再啟動 x11vnc 等待對方。
如果想登入桌面後就啟動 x11vnc，那就把上面那行啟動指令加到你的桌面設定的「自動啟動程式」清單。

每個桌面環境都有自己一套設定「自動啟動程式」的方法。不多說。

其他參數:

* -viewonly : 只能看，不能控制鍵盤、滑鼠。
* -shared : 允許多人遠端連線共用桌面。預設同一時間只允許一人遠端連線共用。

其他設定或是透過 ssh 通道安全連線的用法，可參考
[X11vnc - Arch Linux Wiki](https://wiki.archlinuxcn.org/zh-tw/X11vnc)。

krfb
----

嗯... krfb 好像沒有指令。
它是 KDE 的桌面工具模組，安裝後，在 KDE 右下角的工具匣就可以看到它。

![krfb設定畫面](https://github.com/shirock/images/raw/main/2023/10-31-Linux-krfb-setting.png)

點擊這個工具圖示就會叫出設定畫面。它的設定項目也就兩種。太簡單了。

1. 啟用桌面分享，設定連線密碼。
2. 啟用直接存取模式，以及此模式的連線密碼。

第 1 種是人坐在電腦前操作桌面，讓遠端使用者連進來看同樣畫面的方式。
遠端使用者連進來時會詢問電腦前的人允不允許。
通常這種密碼不會設的太複雜，而且會是一次性的。

第 2 種就是「無人值守」模式。這種密碼就會設的很複雜。
另外，因為它沒有資料加密能力，所以並不適合暴露在 Internet 上。
只適合 LAN 環境。

vino
----

vino 是 GNOME Desktop 整合的桌面共用工具。
它的設定方式在 GNOME 系統設定頁面中可以找到。
但我好幾年沒用 GNOME 桌面，就不抓圖了。

vino 的設定內容都按 GNOME 的桌面軟體規範存在 *GSchema* (相當於 Windows 的 registry)。
它其實可以獨立安裝並透過命令列工具 `gsettings` 設定內容。

它的指令就是 /usr/bin/vino。參數都是讀它的 GSchema。
請按下列說明執行 `gsettings` 設定 vino 參數。

啟用桌面共用 (enabled=true):

```term
$ gsettings set org.gnome.Vino enabled true
```

你執行了 vino，但沒有設定 enabled=true 的話，它是不會接受連線的。

設定連線方法 (authentication-methods) 和連線密碼 (vnc-password):

```term
$ gsettings set org.gnome.Vino authentication-methods "['vnc']"
$ gsettings set org.gnome.Vino vnc-password $(echo -n '你的密碼'|base64)
```

它的密碼格式是用 base64 編碼字串。所以設定時要繞一下。

設定是否提示本地使用者接受遠端連線請求:

```term
$ gsettings set org.gnome.Vino prompt-enabled false
```

關閉 (prompt-enabled=false) 就是啟用無人值守模式。

如果遠端 VNC Viewer 不支援加密通訊，關閉加密要求 (require-encryption=false):

```term
$ gsettings set org.gnome.Vino require-encryption false
```

走 ssh 通道連接 VNC
-------------------

ssh 通道或者叫 ssh tunnel。

因為 VNC 協定的工具多半沒有資料加密傳輸能力，所以配合 ssh 通道加密傳輸資料是普遍的使用方式。

基本用法是先用 ssh 登入目標主機，並指定讓 ssh 居中轉發兩個 port 的資料，形成一條傳輸通道。

例如你要連接遠端主機 192.168.1.2 的 VNC 服務 (通訊埠 5900)。
走 ssh 通道的話，你不是直接用 VNC Viewer 連對方。
你要先用 ssh 連線，讓 ssh 在本機 (localhost) 的通訊埠和 192.168.1.2 的通訊埠之間建一條通道。

因為對方設定的 VNC 通訊埠是 5900，所以先用下列指令建立這一條通道 ($login 請替換成登入帳號):

```term
$ ssh $login@192.168.1.2 -L 5900:localhost:5900
```

ssh 讓它維持工作狀態，不要關掉。

現在，你電腦的 5900 號通訊埠實際就是通向 192.168.1.2 的 5900 號通訊埠。
所以你應該用 VNC Viewer 連線你的電腦的 5900 號通訊埠。
然後 ssh 就會把資料轉發到 192.168.1.2 去了。

差別如下:

```text
不走 ssh 通道:
VNC Viewer --> 192.168.1.2:5900 <-- VNC server

走 ssh 通道:
VNC Viewer --> localhost:5900 <-- ssh --> 192.168.1.2:5900 <-- VNC server
```

ps. 你電腦的通訊埠不一定要 5900。可以選別的。

putty 也可以這麼做。
請看「[透過putty使用tunnel連線](https://it001.pixnet.net/blog/post/360680285)」。
