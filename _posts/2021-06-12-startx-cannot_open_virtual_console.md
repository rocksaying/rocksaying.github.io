---
title: startx - Cannot open virtual console
category: computer
tags: [debian,linux,x-window]
lastupdated: 2021-06-12
---

我使用 Debian 虛擬機的習慣是啟動後保持在文字環境。先登入文字終端機環境，再視需要執行 <kbd>startx</kbd> 進入桌面環境。

但我安裝 Debian 10 後，執行 <kbd>startx</kbd> 會失敗。依程式訊息查看 ~/.local/share/xorg/Xorg.0.log ，錯誤重點如下:

~~~text
Fatal server error:
[   ...] (EE) xf86OpenConsole: Cannot not open virtual console ? (Permission denied)
~~~

解法是編輯 **/etc/X11/Xwrapper.config** ，加入一行:

~~~text
needs_root_rights=yes
~~~

編輯 Xwrapper.config 時，你會看到檔案內容中提示更動此檔後，必須執行<kbd>dpkg-reconfigure xserver-xorg-legacy</kbd> 變更 X 服務組態。存檔後照做。一般用戶就能執行 startx 了。

透過 dm (Desktop Manager) 登入桌面環境的使用者，不必動上面的東西。
