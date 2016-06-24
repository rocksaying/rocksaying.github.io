---
title: Hello HTML5 and XULRunner
category: programming
old-category: Programming
tags: [web,html5,xulrunner]
permalink: /archives/13354357.html
---

對一位 Web 軟體開發者來說， <a href="http://en.wikipedia.org/wiki/XULRunner">XULRunner</a> 是一個很奇妙的東西，因為它可以讓我們開發出來的 Web 軟體變成一個桌面軟體。當 HTML5 試圖將我們的 Web 軟體開發經驗延伸到桌面軟體開發領域時， XULRunner 將會是承載我們的夢想之引擎。對了，GtkWebKit/QtWebKit 也具有相同的能力。這件事，我已經等了10年了(<a href="{{ site.baseurl }}/archives/2628393.html">Web programming</a>)。

<!--more-->

XULRunner 是 Firefox3 的核心引擎；若要用具體的東西來形容的話，可以說它就是沒有工具列和網址列的瀏覽器。它原本使用 <a href="http://en.wikipedia.org/wiki/XUL">XUL (XML User Interface Language)</a> 作為 UI 設計語言，但它現在也支援使用 HTML 作為 UI 設計語言。作為 Firefox3 的核心，它理所當然地可以使用 HTML5, CSS 和 JavaScript 這些我們熟悉的老夥伴。本文就是使用 HTML5 配合 XULRunner 設計一個桌面軟體。

首先，各位可以先看看《<a href="https://developer.mozilla.org/en/Getting_started_with_XULRunner">Getting started with XULRunner</a>》
這篇基礎教學文章。因為我很懶，所以那篇文章中說明的內容，本文都不會再重述。本文只有一件事的作法和那篇教學文章不同，那就是它用 XUL ，而我用 HTML。我的目的是將 Web 軟體開發經驗延伸到桌面軟體開發，不想為了開發桌面軟體，而多學一種 UI 設計語言。

#### 建立軟體目錄結構

配合 XULRunner ，我的軟體文件目錄的結構必須如下列所示。

```
 /
 |
 +-+ /chrome
 | |
 | +-+ /content
 | |
 | +- chrome.manifest
 |
 +-+ /defaults
 | |
 | +-+ /preferences
 |   |
 |   +- prefs.js
 |
 +- application.ini
```

###### chrome/chrome.manifest

```
content hello_xulrunner file:content/
```

chrome.manifest 軟體的 UI 設計文件放在 chrome 底下的哪個子目錄。慣例是放在 content 目錄內。本文範例所使用的 HTML, CSS, JavaScript 等文件，都將放置在此目錄中。

###### defaults/preferences/prefs.js

```
pref("toolkit.defaultChromeURI", "chrome://hello_xulrunner/content/index.html");
```

宣告軟體開啟後第一個呈現的畫面文件。本文延用 Web 開發經驗，故所謂「第一個呈現的畫面」自然就是首頁(index.html)。

###### application.ini

```
[App]
; This field specifies your application's name.  This field is required.
Name=Hello XULRunner

; This field specifies your application's build ID (timestamp).  This field is
; required.
BuildID=20100601

; This field specifies your organization's name.  This field is recommended,
; but optional.
Vendor=rock

; This field is optional.
Version=1.0

; This field is optional.
Copyright=Copyright (c) 2010 rock

; This field is optional.
ID=rock@rocksaying

[Gecko]
; This field is required.
MinVersion=1.9.2
```

宣告軟體基本資訊。最重要的是 <var>Name</var>, <var>BuildID</var>, 和 <var>MinVersion</var>。<var>BuildID</var> 可以用時間來表示。至於 <var>MinVersion</var> 表示執行此軟體所需的 XULRunner 最小版本號。因為本文範例使用了 HTML5 規格，所以最小版本號必須是 1.9.2 (Firefox 3.6內建核心版本)。

#### 實作軟體使用介面(UI)

接著我要用 HTML 來設計我的桌面軟體的畫面。其實也沒什麼好講的，就跟我們平常在設計網頁一樣。只是我們的 HTML 等內容不用佈署到 web server 上，而是直接運行在桌面。

###### index.html

{% highlight html %}
<!DOCTYPE html
     PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <title>Hello XULRunner</title>
    <link rel="stylesheet" href="site.css" type="text/css" media="screen" title="no title" charset="utf-8" />
    <script type="text/javascript" src="jquery-1.4.2.min.js">
    </script>
    <script type="text/javascript">
    $(document).ready(function() {
        function event_change_name() {
            var name = $('#entry_name').val();
            $('#name').text(name);

            var flickr = "http://api.flickr.com/services/feeds/photos_public.gne?tags=" +
                name + "&tagmode=any&format=json&jsoncallback=?";
            $("#images").empty().text("loading...");
            $.getJSON(flickr, function(data){
                $("#images").empty();
                $.each(data.items, function(i,item){
                    $("<img/>").attr("src", item.media.m).appendTo("#images");
                    if ( i == 2 ) return false;
                });
            });
        }

        $('#entry_ok').click(event_change_name);
        $('#entry_name').change(event_change_name);

    });
    </script>
</head>
<body>
    <h1>Hello <span id="name">XULRunner</span></h1>
    <div class="entry_form">
    <input id="entry_name" type="text"/>
    <button id="entry_ok" type="button">OK</button>
    </div>

    <div id="images"></div>

    <div>
    <video src="Big_Buck_Bunny_small.ogv" controls="controls">
    "Big Buck Bunny" is a sample Ogg video on <a href="http://en.wikipedia.org/wiki/Ogg">Ogg - Wikipedia</a>.
    </video>
    <embed height="300" width="420" src="butterfly.svg" type="image/svg+xml" />
    </div>
</body>
</html>
{% endhighlight %}


HTML 的內容概略說明如下:


* title - 視窗的標題。軟體運行期間，可用 JavaScript 變動。
* 載入 site.css - 畫面的樣式主題。視窗的大小可以藉由 body 的長寬來指定。
* 載入 jquery-1.4.2.min.js - jQuery 是什麼不用多說了吧？
* UI 上會呈現一個文字輸入框及一個「OK」按鈕，當使用者輸入一組文字並按下OK鈕後，就會呼叫我所撰寫的一段 JavaScript 程式碼，向 Flickr 查詢一組照片，並顯示在畫面上。
* 使用 HTML5 的 Video 規格，播放影片。因為 Firefox 3.6 的 HTML5 video 功能目前只支援 Ogg video ，所以不能直接播 Youtube 的影片作示範。
* 使用 HTML5 的 SVG 規格，呈現一個向量圖片。

###### site.css

{% highlight css %}
body {
    width: 800px;
    height: 600px;
    font-size: 16pt;
}

h1 {
    border-bottom: 3px double black;
}

input[type="text"] {
    padding: 10px;
    border: 3px solid blue;
    -moz-border-radius: 10px;
}
{% endhighlight %}

在 HTML 中載入的三份外部文件: jquery-1.4.2.min.js, butterfly.svg, Big_Buck_Bunny_small.ogv，都是自網路下載的。 jquery-1.4.2.min.js 可以到 jQuery 官網取得。 butterfly.svg 取自 <a href="http://www.croczilla.com/bits_and_pieces/svg/samples/">SVG Samples</a> 。Big_Buck_Bunny_small.ogv 取自 <a href="http://en.wikipedia.org/wiki/Ogg">Ogg - Wikipedia</a>。

以上5份文件都要存放在 chrome/content 目錄內。

#### 執行軟體

只要你安裝的 Firefox 3.6 ，你就能執行本文的範例。不需要額外安裝其他軟體。啟動方式是加上 <em>-app</em> 選項，並指定 application.ini 即可。

例如我執行本文範例時，Linux 上是放在 ~/hello_xulrunner ，Windows 上是放在 C:\workspace\hello_xulrunner。那麼執行方式如下例所示範。

```term
# Linux
firefox -app ~/hello_xulrunner/application.ini

# Windows
"C:\Program Files\Firefox\firefox.exe" -app C:\workspace\hello_xulrunner\application.ini
```

Linux平台執行畫面如下:

<img src="{{ site.baseurl }}/images/8ffbd788.png" alt="Hello XULRunner on Linux"/>

Windows平台執行畫面如下:

<img src="{{ site.baseurl }}/images/f894b535.png" alt="Hello XULRunner on Windows"/>

#### 參考文件

* <a href="https://developer.mozilla.org/en/Getting_started_with_XULRunner">Getting started with XULRunner</a>
* <a href="https://developer.mozilla.org/samples/xulrunner/myapp.zip">sample project.zip at MDC</a>
* <a href="http://www.css3.info/preview/rounded-border/">Border-radius: create rounded corners with CSS! - CSS3 . Info</a>
* <a href="http://www.croczilla.com/bits_and_pieces/svg/samples/">SVG Samples</a>
* <a href="http://en.wikipedia.org/wiki/Ogg">Ogg - Wikipedia</a>
* <a href="http://support.mozilla.com/zh-TW/kb/%E7%82%BA%E4%BD%95%E7%84%A1%E6%B3%95%E5%9C%A8Firefox%E4%BB%A5HTML5%E6%A0%BC%E5%BC%8F%E4%BD%BF%E7%94%A8Youtube">為何無法在Firefox以HTML5格式使用Youtube</a>
* <a href="http://jquery.com/">jQuery</a>

###### 相關文章

* <a href="{{ site.baseurl }}/archives/14282187.html">JavaScript 與 Desktop - WebKit</a>
* <a href="http://blog.roodo.com/rocksaying/archives/28212965.html">Kiosk Designing 續篇 - 在 x86 PC 上，以 mplayer 替代 omxplayer</a>

<div class="note">樂多舊網址: http://blog.roodo.com/rocksaying/archives/13354357.html</div>