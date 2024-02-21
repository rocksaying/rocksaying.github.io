---
title: 舊電腦安裝 Alpine Linux、X 視窗、桌面與 Firefox
category: computer
tags: [alpine,linux]
lastupdated: 2023-10-30
---

我安裝的舊電腦是一台工業用電腦，將近 15 年前的硬體規格。
我最初拿 x86_64 的 Linux USB 作業碟開機，看到 CPU 不支持 x86_64 的訊息時，讓我驚訝不已。
其配置規格為:

* [VIA C7](https://zh.wikipedia.org/zh-tw/VIA_C7%E8%99%95%E7%90%86%E5%99%A8%E5%88%97%E8%A1%A8) CPU。x86 32 位元 CPU，不支持 x86_64。
* 主機板晶片組內建 [S3 UniChrome](https://en.wikipedia.org/wiki/S3_Chrome) 顯示晶片。
* 1 GB RAM。
* 2 GB CF 記憶卡。早期工業用電腦常用 CF 記憶卡作為 IDE 磁碟裝置。

就算是 Debian 也很難在這種配置下裝視窗環境。所以我選擇了更精簡的 [Alpine Linux](https://www.alpinelinux.org/)。
本文整套安裝結束，清除 /var/cache/apk ，最後用了 root 分割區大約 750~800 MB。

<!--more-->

### Setup

#### 一般安裝

參考 [Alpine wiki - Setup](https://wiki.alpinelinux.org/wiki/Alpine_setup_scripts)。
執行一般安裝程序:

```term
# setup-alpine
```

固定回答項目:

* Time zone: Asia/Taipei
* Mirror: 36 nycu.edu.tw 陽明交通大學資工系
* Mode: sys

我裝在 2GB (CF Card) 磁碟時，sys 模式的分割區分配如下:

* sda1 - /boot - 300 MB
* sda2 - swap  - 512 MB
* sda3 - /     - 剩餘全部

#### 自訂分割區配置

預設分配狀態的 /boot 切了 300 MB，但只用 25~49 MB。
佔比太大，故調整分配 100 MB。

執行 `setup-alpine` 前，先用環境變數
[指定各分割區的大小](https://wiki.alpinelinux.org/wiki/Alpine_setup_scripts#setup-disk)。

```term
# export BOOT_SIZE=100
# export SWAP_SIZE=400
# export BOOTFS=ext2
# setup-alpine
```

<div class="note">
ps. 我安裝的是 alphine-3.18.4-x86，ROOTFS 不能用 ext2。
若是用 ext2，安裝後開機將無法掛載 /dev/sda3 到 /sysroot。
Alpine wiki 說 ext2 也支援。不確定是哪邊錯。
</div>

### 基本工具

修改 */etc/apk/repositories*，打開 community。

已預裝 vi，但 nano 或 joe 方便些。

```term
# apk update
# apk add sudo nano
# chmod u+w /etc/sudoers
# nano /etc/sudoers
# chmod u-w /etc/sudoers
```

修改 */etc/sudoers*，找到 `# %wheel ALL=(ALL:ALL) ALL`，取消註解。
它上面就有一行說明文字「Uncomment to allow members of group sudo to execute any command」。
然後將一般使用者帳號加入 *wheel*，此帳號才能 sudo。

```term
# addgroup $user wheel
```

### X 視窗環境

#### 安裝與調整 Xorg

執行下列指令安裝基本項目。

```term
# setup-xorg-base
# apk add xf86-input-evdev xf86-input-libinput

; VIA C7 CPU:
# apk add xf86-video-openchrome
```

執行 `Xorg -configure` 產生 xorg 基本組態檔 */root/xorg.conf.new*。
然後測試是否可以開啟 X 視窗。
畫面一片黑沒花紋就是正確設定。複製這個測試組態為 Xorg 預設組態。
結束測試動作要按 Ctrl+Alt+F2 切到第二號控制終端機畫面，`killall Xorg`。

```term
# Xorg -configure
# X -config /root/xorg.conf.new
# cp /root/xorg.conf.new /etc/X11/xorg.conf
```

#### 畫面有花紋

VIA C7 內建顯示晶片的螢幕解析度最高 1024x768，更高會花。
如果顯示晶卡像這個一樣老舊的話，需要手動修改 Xorg 組態檔。
然後參考下列內容修改 */root/xorg.conf.new* 再測試。

```text
Section "Screen"
    # 加上 DefaultDepth
    DefaultDepth    24
    SubSection "Display"
        Viewport    0 0
        Depth       24
        # 加上 Modes
        Modes       "1024x768" "800x600"
    EndSubSection
```

### 使用者權限交涉工具

這是配合 X 視窗環境 GUI 軟體使用的工具。
這些工具作為代理人，讓使用者執行的軟體做一些需要更高權限才能做的事。
主要效果是讓檔案管理員自動掛載磁碟。
又或者是軟體需要 root 權限時，會彈出要求輸入管理密碼的視窗。

如果習慣一切手動操作，可以不裝。
以一般使用者執行 startx 進入 X 環境的人，也可以不裝。
startx 的 real user id 是一般使用者；Display manager 的 real user id 是 root。
startx 的權限比 Display manager 低，它的環境不能用這些交涉權限的工具。

```term
# apk add gvfs gvfs-fuse udisks2 
# apk add elogind polkit-elogind fuse-openrc
# rc-update add fuse
# rc-update add elogind
# setup-devd udev
```

### 視窗管理者 Window Manager

本文不說明視窗管理者 (Window manager)、桌面管理者 (Desktop manager)、顯示管理者 (Display manager) 是什麼。
只是 Alpine Linux 沒有一套三連，用戶得自己分開裝。

現代化的 X GUI 軟體，免不了 dbus 互動。

```term
# apk add dbus dbus-x11
# rc-update add dbus
```

只裝到視窗管理者，不需要桌面管理者。
所以裝 [Openbox](https://wiki.alpinelinux.org/wiki/Openbox)，不裝 xfce4 或 lxqt。

```term
# apk add openbox lxterminal font-terminus
# addgroup $username input
# addgroup $username video
# rc-update add acpid
# ln -s /usr/bin/lxterminal /usr/local/bin/xterm
```

Alpine 的 `startx` 呼叫 script 的順序:
X -> ~/.xsession -> ~/.xinitrc。
所以把 openbox 加在 *~/.xinitrc* 最後一行。

```term
$ echo 'exec openbox-session' >> ~/.xinitrc
$ mkdir ~/.config
$ cp -r /etc/xdg/openbox ~/.config
```

### 顯示管理者 Display Manager

startx 的執行權限其實比較低，視窗環境還是配合顯示管理者 (display manager) 方便。
我選 [sddm](https://wiki.alpinelinux.org/wiki/SDDM)。

```term
# apk add sddm
# rc-update add sddm
# rc-service sddm start
```

或者 lightdm 似乎更輕量。至於 xdm，使用有問題，而且不提供 autologin 功能。

### 中文 TrueType 字型

有 font-noto-cjk 和 font-wqy-zenhei (testing)。
noto 太大了，選文泉驛 (wqy)。

```term
# apk add font-wqy-zenhei 
```

或者手動複製到 /usr/share/fonts/TrueType。

### 自選應用程式

雖然不裝桌面管理者，但還是需要 GUI 軟體。
網路瀏覽器基本不可缺，firefox 或 chromium 擇一。
此外，預裝 icon 不足，要裝 adwaita-icon-theme 來補。
否則有些 GUI 軟體介面的按鈕或圖像會是空白。

```term
# apk add musl-locales firefox
# apk add adwaita-icon-theme 
# apk add 7zip
# apk add xarchiver xarchiver-lang
# apk add mousepad
# apk add lxterminal
# apk add obconf-qt obconf-qt-lang
# apk add pcmanfm-qt pcmanfm-qt-lang
# apk add qterminal 
# apk add lximage-qt pavucontrol-qt screengrab 
```

若是覺得 Firefox, Chromium 太消耗 CPU/Ram，
可以考慮更輕量級的候補者: falkon, qutebrowser。
但是這些候補者加上依賴套件可能要求更多的磁碟安裝空間。
Firefox 大約要求 300 MB。 falkon 則要求 600 MB。

其他軟體可能要往 flatpak 找。

```term
# apk add flatpak
```

### Autologin

#### 顯示管理者自動登入

sddm 的自動登入: (目錄預裝時不存在，要自已建)

```term
# mkdir /etc/sddm.conf.d
# nano /etc/sddm.conf.d/autologin
```

/etc/sddm.conf.d/autologin 內容如下 ($user 自行替換):

```ini
[Autologin]
User=$user
Session=openbox.desktop
Relogin=false
```

#### TTY Autologin

如果不想用顯示管理者，但想從終端控制機自動登入跑 startx，也有辦法。
[tty auto login](https://wiki.alpinelinux.org/wiki/TTY_Autologin)。

```term
# apk add agetty
```

修改 */etc/inittab* ， tty1 那一項改用 agetty。

```text
tty1::respawn:/sbin/agetty --autologin $user tty1 linux
```

再來於 ~/.profile 最後面加上下面的條件執行敘述。
沒有~/.profile，就複製 /etc/profile 過來。

```sh
if [[ -z "$DISPLAY" ]] && [[ $(tty) = /dev/tty1 ]]; then
    startx
fi
```

這段條件是說只有從 tty1 (第一號終端控制機) 登入時，才會跑 startx。
遠端登入、或從其他控制機登入，則維持原狀。
可能需要 `addgroup $user tty`。

### 桌面共用

我設定自動登入視窗環境，所以不裝遠端登入工具，而是桌面共用工具。

我選 x11vnc。
安裝後，以一般使用者身份，設定登入密碼。

```term
$ sudo apk add x11vnc
$ x11vnc -storepasswd
```

把 x11vnc 加進 openbox 自動啟動程式:
編輯 *~/.config/openbox/autostart*。

```sh
x11vnc -forever -shared -rfbauth ~/.vnc/passwd -rfbport 5900 &
```

選項 *-shared* 表示允許多人遠端連線共用桌面。預設同一時間只允許一人遠端連線共用。

我在 `setup-alpine` 安裝過程中，選擇要 openssh。
所以可以透過 ssh 通道和 VNC 走安全連線。
用法不難找，這就不多說了。

### 個人中文環境

我習慣讓 console 登入時保持英文語系環境 (沒中文)。
進 X 視窗環境才切換中文語系環境。
故在此會把下列環境變數寫在 *~/.config/openbox/environment*。

```sh
LANG=zh_TW.UTF-8
LANGUAGE=zh_TW.UTF-8
LC_CTYPE=zh_TW.UTF-8
LC_NUMERIC=zh_TW.UTF-8
LC_TIME=zh_TW.UTF-8
LC_COLLATE=zh_TW.UTF-8
LC_MONETARY=zh_TW.UTF-8
LC_MESSAGES=zh_TW.UTF-8
LC_PAPER=zh_TW.UTF-8
LC_NAME=zh_TW.UTF-8
LC_ADDRESS=zh_TW.UTF-8
LC_TELEPHONE=zh_TW.UTF-8
LC_MEASUREMENT=zh_TW.UTF-8
LC_IDENTIFICATION=zh_TW.UTF-8
```

### 執行效能

這套裝起來，對於 RAM 的要求並不高，就算開啟瀏覽器看一個網頁，也不會超 1 GB。
一切效能瓶頸都卡在 CPU 上。
VIA C7 真的舊了，晚它幾年推出的 Intel Atom 可能都比較快。
程式啟動與切換時明顯遲頓。不適合一般應用情境，連文書工作也不行。

裝這台電腦就只跑 Firefox，只瀏覽固定的網站。就是當 Kiosk 在用的情境。
所以我連中文輸入法也省略不裝。

###### Alpine Linux 網路資源

* [下載 Alpine Linux](https://www.alpinelinux.org/downloads/)
* [Alpine Linux Wiki](https://wiki.alpinelinux.org/wiki/Main_Page)
* [Alpine Linux 套件搜索](https://pkgs.alpinelinux.org/packages)
* [Post Installation Recommendations](https://docs.alpinelinux.org/user-handbook/0.1a/Working/post-install.html)
* [安裝Alpine Linux為桌面系統教學 XFCE4 + 中文輸入法](https://ivonblog.com/posts/alpine-linux-installation/)
* [Alpine包管理工具apk使用介紹](https://www.twblogs.net/a/5d7f950abd9eee541c348c44)
