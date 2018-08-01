---
title: overlayMessage - non-jquery-ui
category: programming
tags: [javascript,non-jquery,html]
---

*overlayMessage* 是一個顯示全頁覆蓋訊息的網頁 UI 。它完全獨立，不使用其他 JavaScript 套件。

其設計目的是在執行非同步工作時，顯示覆蓋全頁的訊息，阻擋使用者操作頁面的內容。例如使用 XmlHttpRequest 上傳表單資料時，防止使用者在上傳完成前修改表單。

Source Repo: [non-jquery-ui](https://github.com/shirock/non-jquery-ui)

<!--more-->

* 相容性: 所有符合 HTML5 規格的瀏覽器；微軟 IE8 到 IE11 。
* 依賴套件: 無。

<div class="note">
IE8 的使用狀況: IE8不支援透明背景，所以覆蓋訊息會完全蓋住頁面內容。但若不指定背景色，IE8 竟然不會蓋住整頁，使用者依然可以碰到底下的頁面內容。在 IE6 ~ IE8 那個年代，我們會用帶透明底色的 GIF 會背景圖來達成透明背景。不過我現在懶得為 IE8 做這件事了。
</div>

注意，這不是當全頁廣告用的 UI 。基於設計目的，應在非同步工作完成後，由程式關閉覆蓋訊息。所以預設不顯示關閉按鈕，不讓使用者自己關閉。除非你要把覆蓋訊息當成 `alert()` 的替代品來用，才使用關閉按鈕。

