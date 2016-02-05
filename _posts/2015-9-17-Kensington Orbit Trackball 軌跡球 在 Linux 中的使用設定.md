---
title: Kensington Orbit Trackball 軌跡球 在 Linux 中的使用設定
category: computer
tags: [linux,debian,trackball,kensington]
permalink: /archives/48245554.html
---

身為一位 Logitech Marble Trackball 木星軌跡球的用戶，我拿到 Kensington Orbit Trackball 軌跡球後第一眼就覺得這兩隻的球體大小似乎一樣。當場動手互換，證實 Orbit 軌跡球和 Logitech Marble 木星軌跡球的球體通用。

接著，我又比較了它和 Kensington SlimBlade Trackball 軌跡球的捲頁速度。 Orbit 軌跡球捲頁輪 (Scroll Ring) 的捲頁速度要快得多。還可用一根手指 360 度旋轉捲頁，真是爽快。唯一缺點就是少了實體中鍵。或許我當初該買 Kensington Expert Mouse 而非 SlimBlade 軌跡球。

Orbit 軌跡球最大缺點就是沒有實體中鍵，故接下來將著重說明在 Linux 如何設定中鍵模擬。

<!--more-->

### 基礎說明與鍵碼

首先，請執行 <kbd>xinput list</kbd> 確認你的 Orbit 軌跡球的系統識別名稱。在我的系統上，我查到的名稱是 "Primax Kensington Eagle Trackball" ，而不是舊文件上提到的 "Kensington Kensington USB/PS2 Orbit" 。或許是代工廠改了吧。

查看可用屬性:

```term
xinput list-props "Primax Kensington Eagle Trackball"
```

查看按鍵動作設置:

```term
xinput get-button-map "Primax Kensington Eagle Trackball"
1 2 3 4 5 6 7
```

動作設置第一欄是滑鼠左鍵，第二欄是滑鼠中鍵，第三欄是滑鼠右鍵。但 Orbit 軌跡球實際上只有 4 個按鍵，就是左鍵(鍵碼1)、右鍵(鍵碼3)、捲頁輪順時針捲動(鍵碼4)、捲頁輪逆時針捲動(鍵碼5)。捲頁輪 (scrolling ring) 功能不變，實際可用的按鍵只有左、右兩鍵。要增加滑鼠中鍵動作的方法都要配合特殊設定。一種是啟用中鍵模擬，另一種是啟用第三鍵。

左撇子的按鍵動作設置如下:

```term
xinput set-button-map "Primax Kensington Eagle Trackball" 3 2 1 5 4 6 7
```


### 中鍵模擬

中鍵模擬指同時按左鍵和右鍵等於按中鍵。啟用指令如下:

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Middle Button Emulation" 1
```

如果你同時按左鍵和右鍵的動作不夠快、有時間差，可調長動作時間。下列設置調長為 0.1 秒 (預設是 0.05 秒):

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Middle Button Timeout" 100
```

注意， Orbit 軌跡球的「中鍵模擬」與接下來說明的「第三鍵」、「滾輪模擬」兩功能不會同時生效。當啟用中鍵模擬時，第三鍵與滾輪模擬設置就失效。但第三鍵與滾輪模擬則可以並存。

### 第三鍵

第三鍵是指按住左鍵超過 1 秒後放開，等於某一鍵位。預設值是按住左鍵後放開等於按右鍵(鍵碼3)。這設定毫無必要，在此當然希望按住左鍵後放開等於按中鍵(鍵碼2)。另外，我也縮短按住後放開的時間為 0.3 秒。

啟用第三鍵:

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Third Button Emulation" 1
```

設定放開後等於按中鍵(鍵碼2):

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Third Button Emulation Button" 2
```

縮短按住左鍵的時間為 0.3 秒:

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Third Button Emulation Timeout" 300
```

為了不影響按住左鍵的拖曳行為，可以調低動作門檻值為 1 :

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Third Button Emulation Threshold" 1
```

### 四方向捲頁

滾輪模擬，這是全系軌跡球 (Kensington 與 Logitech) 都通用的玩法。按照我的使用習慣，設為按住右鍵後可四方向捲頁。

啟用滾輪模擬功能:

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Wheel Emulation" 1
```

設定滾輪模擬鍵: (此例指定右鍵，鍵碼 3)

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Wheel Emulation Button" 3
```

設定滾輪可以四方向捲頁:

```term
xinput set-prop "Primax Kensington Eagle Trackball" "Evdev Wheel Emulation Axes" 6 7 4 5
```

### X 組態檔設置

最後說明 X 組態檔設置方式。此設置內容啟用「中鍵模擬」，不使用第三鍵與滾輪模擬。

```text
## Debian: /usr/share/X11/xorg.conf.d/50-orbit-trackball.conf
Section "InputClass"
    Identifier      "Kensington Orbit Trackball"
    MatchProduct    "Primax Kensington Eagle Trackball"
    MatchDevicePath "/dev/input/event*"
    #Driver "evdev"

    ## Right hand (default setting)
    #Option "ButtonMapping"      "1 2 3 4 5 6 7"

    ## Left hand
    #Option "ButtonMapping"      "3 2 1 5 4 6 7"

    ## xinput "Evdev Middle Button Emulation" 1
    Option "Emulate3Buttons"       "true"

    ## xinput "Evdev Middle Button Timeout" 100
    Option "Emulate3Timeout" "100"
EndSection
```

xinput 與 evdev 的屬性說明請參考 [EVDEV manual](http://www.x.org/archive/X11R7.6/doc/man/man4/evdev.4.xhtml) 。

###### 相關文章

* [Logitech Trackman Marble on Debian / Ubuntu]({{ site.baseurl }}/archives/15305647.html)
* [Kensington SlimBlade Trackball 軌跡球在 Linux 中的使用設定]({{ site.baseurl }}/archives/48245538.html)

<div class="note">樂多舊網址: http://blog.roodo.com/rocksaying/archives/48245554.html</div>