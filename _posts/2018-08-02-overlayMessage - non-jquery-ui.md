---
title: overlayMessage - non-jquery-ui
category: programming
tags: [javascript, non-jquery, html]
cover: https://rocksaying.github.io/images/imgur/OOWnfG8.png
---

*overlayMessage* 是一個顯示全頁覆蓋訊息的網頁 UI 項目 。它完全獨立，不使用其他 JavaScript 套件。

其設計目的是在執行非同步工作時，顯示覆蓋全頁的訊息，阻擋使用者操作頁面的內容。例如使用 *XmlHttpRequest* 上傳表單資料時，防止使用者在上傳完成前修改表單。

Source Repo: [non-jquery-ui](https://github.com/shirock/non-jquery-ui)

<!--more-->

* 相容性: 所有符合 HTML5 規格的瀏覽器；微軟 IE8 到 IE11 。
* 依賴套件: 無。

<div class="note">
IE8 的使用狀況: IE8 不支援透明背景，所以覆蓋訊息會完全蓋住頁面內容。但若不指定背景色，IE8 竟然不會蓋住整頁，使用者依然可以碰到底下的頁面內容。在 IE6 ~ IE8 那個年代，我們會用帶透明底色的 GIF 為背景圖來達成透明背景。不過我現在懶得為 IE8 做這件事了。
</div>

### 使用說明

首先從 [non-jquery-ui](https://github.com/shirock/non-jquery-ui) 取得 *overlayMessage* 的程式碼文件 ui/overlay-message.js 。同一目錄下有預先寫好的訊息顯示樣式表 ui/overlay-message.css ，修改樣式表以自訂覆蓋訊息的外觀。

*overlayMessage* 是一個獨立套件，所以你只需要引入它的程式碼就可以使用。如下所示:

{% highlight html %}
<!DOCTYPE HTML>

<link rel="stylesheet" type="text/css" href="assets/ui/overlay-message.css">
<script src="assets/ui/overlay-message.js"></script>

<script>
window.onload = function(){
    overlayMessage.initial();
    // If you don't care IE8, you could omit this line.
};
</script>
{% endhighlight %}

如果你不在乎 IE8 的使用者，可以略去自行呼叫 `overlayMessage.initial()` 的動作。因為 overlayMessage 自己會做好這件事。而 IE8 環境需要自行呼叫的原因在於 IE8 的事件處理函數的執行順序和現代瀏覽器相反。它會先執行最後一個 window.onload 事件處理函數，然後才執行 overlayMessage 自己安排的初始動作。如果 IE8 環境中，想要在 window.onload 事件處理函數內就調用 `overlayMessage.show()` 顯示覆蓋訊息的話，就必須先調用 `overlayMessage.initial()` 。現代瀏覽器則可寫可不寫。

除了 `initial()` ，overlayMessage 只有兩個使用方法， `show()` 和 `off()` 。

#### show

```javascript

overlayMessage.show(message, options)

```

顯示全頁覆蓋訊息。訊息內容是 <var>message</var> 。訊息內容的 CSS 樣式名稱預設為 *overlay-message* 。但也可以在 <var>options</var> 參數表中，以關鍵字 *overlay-message* 指定使用別的 CSS 樣式。

options 參數表可用項目:

* overlay-message: 指定訊息內容的 CSS 樣式名稱。預設 "overlay-message"。
* close-button: 是否顯示關閉按鈕。 *true* 、 *false* 或者指定的關閉按鈕符號。預設 false ，不使用。常用於代表關閉符號的文字有 '❌', '✖', 'ⓧ', '╳', '⛒', '✘', '❎' 等。

注意，這不是當全頁廣告用的 UI 。基於設計目的，應在非同步工作完成後，由程式關閉覆蓋訊息。所以預設不顯示關閉按鈕，不讓使用者自己關閉。除非你要把覆蓋訊息當成 `alert()` 的替代品來用，才使用關閉按鈕。

在關閉覆蓋訊息前，仍然可以再次呼叫 `overlayMessage.show()` 。新的訊息內容將取代舊的訊息。

程式範例如下:

```javascript
overlayMessage.show('傳送資料中，請等待...');

overlayMessage.show('傳送資料中，請等待...', {'close-button': true});

overlayMessage.show('傳送資料中，請等待...', {
    'overlay-message': 'my-message',
    'close-button': '✘'
});
```

#### off

```javascript

overlayMessage.off()

```

關閉全頁覆蓋訊息。


### 使用範例

在 [non-jquery-ui](https://github.com/shirock/non-jquery-ui) 源碼的 sample 目錄下有一份 overlay-message.html 使用範例。這個範例頁面會在開啟時，就顯示覆蓋訊息提示使用者等待三秒。這是模擬頁面載入時，還在等待 Ajax 從服務端取回頁面所需資料的狀況。在覆蓋訊息存在期間，使用者不能操作頁面上的按鈕及文字輸入框。

![overlayMessage 範例 - 載入頁面時就出現](https://rocksaying.github.io/images/imgur/OOWnfG8.png)

當頁面程式關閉覆蓋訊息後，可以點擊頁面上的兩個按鈕 'Default button' 或 'Custom button'，顯示帶有右上角關閉按鈕的覆蓋訊息。

![overlayMessage 範例 - 帶有關閉按鈕的覆蓋訊息](https://rocksaying.github.io/images/imgur/rh4YEOg.png)

當覆蓋訊息出現時，頁面上的時鐘仍然持續更新，表示各事件函數依然在工作。因為 overlayMessage 不會擱置其他背景工作。而 `window.alert()` 則會擱置背景工作 (worker不受影嚮)。所以不希望影響背景工作的時候，你可以用 overlayMessage 取代 `window.alert()`。
