---
title: Kensington SlimBlade Trackball 軌跡球在 Linux 中的使用設定
category: computer
tags: [linux,debian,trackball,kensington]
---

我最近去日本時，趁便宜買了兩隻 Kensington 的軌跡球，分別是 Kensington SlimBlade Trackball 和 Kensington Orbit Trackball 。分別說明這兩隻軌跡球在 Linux 下使用的設定心得。

在 Debian 8 中，基本上不用設定任何項目便可正常使用。

如果你是左撇子，或者想要更快的捲頁速度，請繼續閱讀。

<!--more-->

### 指令工具 xinput

指令工具 *xinput* 可以操作軌跡球設定。

#### 鍵碼與按鍵動作

查看全部屬性值:

```term
xinput list-props "Kensington Kensington Slimblade Trackball"
```

按鍵動作設置與鍵碼:

* 左下鍵: 鍵碼 1 ；預設動作 滑鼠左鍵。
* 右下鍵: 鍵碼 3 ；預設動作 滑鼠右鍵。
* 左上鍵: 鍵碼 2 ；預設動作 滑鼠中鍵。
* 右上鍵: 鍵碼 8 ；預設動作 返頁(page back)。少數應用軟體支持此鍵。在瀏覽器中按下此鍵，等於回上一頁。

查看現行按鍵動作設置:

```term
xinput get-button-map "Kensington Kensington Slimblade Trackball"
```

右撇子的按鍵動作設置:

```term
xinput set-button-map "Kensington Kensington Slimblade Trackball" 1 2 3 4 5 6 7 8 9 10 11 12
```

左撇子可以採用下列設置，將按鍵設置和水平滾動的捲頁方向倒過來:

```term
xinput set-button-map "Kensington Kensington Slimblade Trackball" 3 8 1 5 4 6 7 2 9 10 11 12
```

#### 水平滾動與捲頁

SlimBlade Trackball 軌跡球的特色就是以水平滾動軌跡球做到上、下捲頁。但是在 Linux 中，水平滾動的捲頁速度無法調得更快。有時會讓人覺得捲太慢。我試過調整屬性 "Evdev Scrolling Distance" ，並不影響捲頁速度。

另外，想要水平滾動軌跡球又不想要讓指標漂動的話有個小技巧，就是用指頭頂著軌跡球旁那一圈裝飾環，沿著那一圈順勢滾動軌跡球。那一圈環看來不是單純的裝飾用途。

雖然沒辦法從系統方面調整水平滾動軌跡球的捲頁速度，但 Mozilla Firefox 版本 17 或更新版本的使用者，可以調整 Firefox 的內部設定，加快在 Firefox 中瀏覽網頁時的捲頁速度。

在 Firefox 瀏覽器網址列輸入 <code>about:config</code> ，然後找到 <var>mousewheel.default.delta\_multiplier\_y</var> 項目。它的預設值是 100 ，這代表 1 個捲頁單位，而 1 個捲頁單位其實是 3 行。軌跡球水平滾動「滴」一聲就是一個單位。若將此項目改為 200 就是一次捲 6 行。最大可以設 400 ，一次捲 12 行。參考: [Gecko:Mouse Wheel Scrolling](https://wiki.mozilla.org/Gecko:Mouse_Wheel_Scrolling) 。

#### 四方向捲頁

除此之外，還可以用滾輪模擬功能實現快速捲頁。滾輪模擬功能是用垂直滾動軌跡球的方式捲頁，和水平滾動相比有下列兩個優點:

* 可以上、下、左、右的四方向捲頁。
* 此模式的捲頁速度比水平滾動軌跡球更快。

但缺點是，要額外配合一個按鍵使用。一般會設定在按住左上或右上鍵的狀態下垂直滾動軌跡球。

啟用滾輪模擬功能:

```term
xinput set-prop "Kensington Kensington Slimblade Trackball" "Evdev Wheel Emulation" 1
```

設定滾輪模擬鍵: (此例指定右上鍵，鍵碼 8)

```term
xinput set-prop "Kensington Kensington Slimblade Trackball" "Evdev Wheel Emulation Button" 8
```

設定滾輪可以四方向捲頁:

```term
xinput set-prop "Kensington Kensington Slimblade Trackball" "Evdev Wheel Emulation Axes" 6 7 4 5
```

預設只模擬上下方向捲頁。在第一欄填 6 ，第二欄填 7 ，便可加上左右方向捲頁。

### X 組態檔

上述調整的 xinput 指令，也可以 X 組態檔設置，如下:

```text
## Debian: /usr/share/X11/xorg.conf.d/50-slimblade.conf
Section "InputClass"
    Identifier      "Slimblade Trackball"
    MatchProduct    "Kensington Kensington Slimblade Trackball"
    MatchDevicePath "/dev/input/event*"

    Option "Buttons"            "12"

    ## Right hand (default setting)
    #Option "ButtonMapping"      "1 2 3 4 5 6 7 8 9 10 11 12"

    ## Left hand
    #Option "ButtonMapping"      "3 8 1 5 4 6 7 2 9 10 11 12"


    ## xinput "Evdev Wheel Emulation" 1
    Option "EmulateWheel"       "true"

    ## xinput "Evdev Wheel Emulation Button" 8
    Option "EmulateWheelButton" "8"

    ## xinput "Evdev Wheel Emulation Axes" 6 7 4 5
    Option "XAxisMapping"       "6 7"
    Option "YAxisMapping"       "4 5"
EndSection
```

xinput 與 evdev 的屬性說明請參考 [EVDEV manual](http://www.x.org/archive/X11R7.6/doc/man/man4/evdev.4.xhtml) 。

本文提到的屬性，其預設狀態如下:

* 按鍵動作對照(button-map): 1 2 3 4 5 6 7 8 9 10 11 12
* Evdev Wheel Emulation: 0
* Evdev Wheel Emulation Button: 4
* Evdev Wheel Emulation Axes: 0 0 4 5

###### 相關文章

* [Logitech Trackman Marble on Debian / Ubuntu]({{ site.baseurl }}/archives/2011/Logitech%20Trackman%20Marble%20on%20Debian%20_%20Ubuntu.html)
* [Kensington Orbit Trackball 軌跡球 在 Linux 中的使用設定]({{ site.baseurl }}/archives/2015/Kensington%20Orbit%20Trackball%20%E8%BB%8C%E8%B7%A1%E7%90%83%20%E5%9C%A8%20Linux%20%E4%B8%AD%E7%9A%84%E4%BD%BF%E7%94%A8%E8%A8%AD%E5%AE%9A.html)

<div class="note">樂多舊網址: http://blog.roodo.com/rocksaying/archives/48245538.html</div>
