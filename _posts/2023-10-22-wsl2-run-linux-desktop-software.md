---
title: WSL2 執行 Linux GUI 不用再裝 X-Server
category: computer
tags: [wsl,linux,windows]
cover: https://github.com/shirock/images/raw/main/2023/10-22-wsl2-run-linux-desktop-software.png
lastupdated: 2023-10-22
---

數年前，當 Windows 當發布 Linux 子系統 WSL 時，我便曾在上面跑過 Linux GUI 桌面程式。
看這篇「[Windows Subsystem for Linux (WSL) 使用 Linux GUI 桌面軟體與中文字型]({% post_url 2018-04-08-wsl-run-linux-desktop-software %})」。
那時還要自己裝一套 Windows 版的 X-Server。

但最近看到 Microsoft Learn 上這篇
「[在 Windows 子系統 Linux 版上執行 Linux GUI 應用程式](https://learn.microsoft.com/zh-tw/windows/wsl/tutorials/gui-apps)」。
說 WSL2 已經進步到直接內建 X11 和 Wayland 協定了。
也就是說現在 WSL2 執行 Linux GUI 應用程式，不用再裝 X-Server 。

<!--more-->

此功能的系統需求是「Windows 10組建 19044+或Windows 11」才能存取此功能。
看了一下我的電腦，是 Windows 10 22h2 19045 。嗯，這算是相當新的功能。

你必須使用 WSL2 ，啟用任何一套 Linux 散佈套件。
然後安裝一套 GUI 套件，例如 x11-apps ，然後跑 xeyes 。
直接就能執行了，神奇。

![WSL2 run xeyes](https://github.com/shirock/images/raw/main/2023/10-22-wsl2-run-linux-desktop-software.png)

不過字型還是老樣子。 WSL2 GUI 環境下的字型路徑是獨立的，不會去讀 C:\Windows\Fonts 。
你可以在 WSL2 內，在 ~/.fonts 目錄下建個符號連結指向 /mnt/c/Windows/Fonts 。
這樣就能和 Windows 系統用同一組字型。

但是中文輸入目前無解。中文字可以在 Windows 和 Linux GUI 之間剪貼複製。
但是不能在 Linux GUI 軟體使用 Windows 輸入法引擎。
我也找不到適合的方法在 Linux GUI 軟體中叫出 Linux 的輸入法引擎。

要在這上面叫出 Linux 的輸入法引擎，感覺上像是回到 20 年前在摸索 X 視窗怎麼支援中文輸入。
算了，能跑就行。就當多一個方便測試 Linux GUI 程式的環境。
應該不會有人認真在 WSL2 跑 Linux 桌面軟體作為工作環境吧。
