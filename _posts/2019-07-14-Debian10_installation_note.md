---
title: Debian 10 安裝筆記升級篇
category: computer
tags: [debian,kde,buster,firefox,ime,中文,thinkpad,trackpoint]
lastupdated: 2021-06-06
---

上星期 (2019-07-06) Debian 官方發行了 Debian 10 (buster)。正好我的筆電 Thinkpad X200s 上的 Debian 8 也實在有點舊了。就趁著週末重新安裝作業系統，升級到 Debian 10 。

安裝步驟大致依照我以前的筆記。

* [Debian 8~10 安裝筆記 基礎安裝篇]({% post_url 2014-9-16-Debian 8 (jessie) 安裝筆記 基礎篇 %})
* [Debian 8~10 安裝筆記 中文環境篇]({% post_url 2014-9-26-Debian 8 (jessie) 安裝筆記 中文環境篇 %})
* [Debian 8 (jessie) 安裝筆記 Firefox 與 Iceweasel]({% post_url 2015-5-18-Debian 8 (jessie) 安裝筆記 Firefox 與 Iceweasel %})
* [Debian 8 (jessie) WiFi 啟用後斷線]({% post_url 2016-03-29-Debian_8_(jessie)_wifi_disconnect %})
* [我與小黑(ThinkPad X200s)之小紅點]({% post_url 2010-3-1-我與小黑(ThinkPad X200s)之小紅點 %})
* [我與小黑(ThinkPad X200s)之旋轉螢幕]({% post_url 2010-3-5-我與小黑(ThinkPad X200s)之旋轉螢幕 %})

本文主要列出和 Debian 舊版不同的地方。這裡沒寫的，就是看以前的安裝筆記。

<!--more-->

#### 檔案系統配置

硬碟分成 root 和 home 兩個分割區。 root 分割區在安裝時選擇重新格式化，全新安裝 Debian 10 。故安裝前先用 CloneZilla 備份此區內容 。

Debian 10 格式化會加入新的檔案系統屬性 (metadata_csum)。這會讓舊版 Ubuntu Live CD 與 CloneZilla 的檔案系統檢查功能失敗。 CloneZilla 要選專家模式，備份工具要選 *dd* ，不要用預設的。

另外， */etc* 與 */usr/share/X11/xorg.conf.d* 這兩個目錄下的設定檔，也是在安裝前先複製到 home 目錄下。以便安裝後取回使用。

home 分割區內容不動。

#### KDE 桌面環境

我現在覺得 KDE 共享桌面套件 [krfb](https://kde.org/applications/internet/org.kde.krfb) 足夠用了。它提供 VNC server 功能。

*kdepasswd* 已整合入 KDE 系統設定，沒有獨立套件。

*kdesudo* 已廢棄。使用 *kdesu* (*kde-cli-tools* 套件) 取代。但這個指令沒有放入 <var>PATH</var> 目錄清單。 kdesu 所在位置可用 `kde4-config --path libexec` 查詢。 manpage 建議的使用的方式如下:

```term

$(kde4-config --path libexec)kdesu

```

*ntpdate* 已廢棄。 KDE 系統設定功能已整合網路校時功能。

Firefox 的商標問題解套了，所以 Debian 重新將 Firefox 瀏覽器納入主要套件清單，套件名稱為 *firefox-esr* 。
至於 *iceweasel* 則停止發佈。消息來源: [The end of the Iceweasel Age](https://lwn.net/Articles/676799/) 。

*gnome-commander* 未更新，Debian 10 不提供套件。 KDE 系列的雙面板式檔案管理工具是 *krusader* 。

*vlc-plugin-pulse* 套件不再需要，不提供。

*libav-tools* 套件已移除。重新回到 *ffmpeg* 套件。

#### 中文字體與輸入法

Debian 10 提供 Google 思源字體套件 (*fonts-noto* 等系列套件) 。安裝桌面環境時，就會順便安裝思源字體。文泉驛 (*fonts-wqy*) 和文鼎字體 (*ttf-arphic*) 不再是中文桌面環境所需字體套件。視個人需要安裝。

*hime* 輸入法引擎，配合 KDE 升級，其 KDE 模組套件從 hime-qt4-immodule 升級到 *hime-qt5-immodule* 。
但使用時發現在某些軟體中，看不到 hime 的選字區。很麻煩，所以改用 *fcitx* 輸入法引擎。

*fcitx5* 在 KDE 桌面環境下，無法執行設定程式。出現錯誤訊息：「找不到模組 fcitx5。請用 kcmshell5 --list 看所有的模組清單」。我判斷 fcitx5 和 KDE 環境的可用性不佳。所以選擇安裝上一代的 fcitx 。

我安裝的 fcitx 套件是:

* fcitx
* fcitx-frontend-qt5
* fcitx-frontend-gtk2
* fcitx-frontend-gtk3
* kde-config-fcitx
* fcitx-table-array30 : 行列30輸入法字根表。
* fcitx-chewing : 酷音輸入法。

自己編輯啟動指令稿 $HOME/.xsessionrc 加入下列設置:

```text
export LANG=zh_TW.utf8
export LANGUAGE=zh_TW

export GTK_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
export QT_IM_MODULE=fcitx
```

在 KDE 的「系統設定 -> 啟動與關閉 -> 自動啟動」的設定頁面，增加一個桌面程式，選擇 *fcitx* 。以便在進入 KDE 桌面後，自動啟動 fcitx 。

最後，從「系統設定 -> 區域設定 -> 輸入法」的設定頁面，設定你慣用的輸入法內容。

![KDE 系統設定 - 輸入法](https://www.rocksaying.tw/images/debian10_kde_fcitx_setting.png)

#### rc.local

rc.local 現在完全取消。

你可以參考上版本的 *rc.local-service* ，把它加回來。或者，就把原先放在 rc.local 的內容改成 *systemd* 的作法做。

接著，以我的 Thinkpad X200s 以前在 rc.local 中執行兩個鍵盤與小紅點功能設定指令為例，示範改為 systemd 機制的做法。步驟如下:

第一步、我將原先 rc.local 的指令稿內容，分類拆開，統一存在放 */opt/systemd-scripts* 目錄。

建立 */opt/systemd-scripts/thinkpad-inputs-setup.sh* ，寫下執行筆電的鍵盤與小紅點的功能設定指令。

```sh

#!/bin/sh
# set Back as PageUp, Forward as PageDown
setkeycodes e06a 104 e069 109

# TrackPoint: Enable Press to select
echo -n 1 > /sys/devices/platform/i8042/serio1/press_to_select

```

第二步、新增 */etc/systemd/system/thinkpad-inputs-setup.service*

```text

[Unit]
Description=ThinkPad Keyboard and TrackPoint Setup

[Service]
Type=oneshot
ExecStart=/opt/systemd-scripts/thinkpad-inputs-setup.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target

```

第三步、要求 *systemd* 啟用

```term

$ sudo systemctl enable thinkpad-inputs-setup

```

下次重啟系統後，就會執行 *thinkpad-inputs-setup.sh* 內的設定指令了。

停用這動作的指令則是:

```term 

$ sudo systemctl disable thinkpad-inputs-setup

```

若不想等系統重啟就想確認這個設定能否正常執行，就下指令:

```term

$ sudo systemctl start thinkpad-inputs-setup

```

最後、重啟後，查看執行狀態，確認結果。

```term

$ systemctl status thinkpad-inputs-setup

```

