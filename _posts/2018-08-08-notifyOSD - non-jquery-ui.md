---
title: notifyOSD - non-jquery-ui
category: programming
tags: [javascript, non-jquery, html]
cover: https://rocksaying.github.io/images/imgur/PJnt8Vj.png
---

*notifyOSD* 是一個在畫面角落顯示提示訊息的網頁 UI 項目。以固定位置浮動視窗，顯示提示訊息。訊息採堆疊方式管理，新的訊息將疊在已有訊息之上，並在下方顯示已有幾筆提示訊息。

它不使用其他 JavaScript 套件。

Source Repo: [non-jquery-ui](https://github.com/shirock/non-jquery-ui)

<!--more-->

### 使用說明

* 相容性: 所有符合 HTML5 規格的瀏覽器；微軟 IE8 到 IE11 。
* 依賴套件: polyfill/classlist.js (*)

<div class="note">
如果你要在 IE8 中使用，才需要加入 classlist.js 。
</div>

在 [non-jquery-ui](https://github.com/shirock/non-jquery-ui) 源碼的 sample 目錄下有一份 notify-osd.html 使用範例。用例如下圖。

![notifyOSD 範例](https://rocksaying.github.io/images/imgur/PJnt8Vj.png)

首先從 [non-jquery-ui](https://github.com/shirock/non-jquery-ui) 取得 *notifyOSD* 的程式碼文件 ui/notify-osd.js 。同一目錄下有預先寫好的訊息顯示樣式表 ui/notify-osd.css ，修改樣式表以自訂提示訊息的外觀。

*notifyOSD* 是一個獨立套件，所以你只需要引入它的程式碼就可以使用。如下所示:

{% highlight html %}
<!DOCTYPE HTML>

<link rel="stylesheet" type="text/css" href="assets/notify-osd.css">
<script src="assets/polyfill/classlist.js"></script><!-- for IE8 -->
<script src="assets/notify-osd.js"></script>

<script>
// 如果你需要改變預設行為，才需要呼叫 notifyOSD.setConfig()
notifyOSD.setConfig({
    'closable': true
});
</script>

{% endhighlight %}

### 方法說明

notifyOSD 提供下列方法:

* setConfig
* push
* append
* remove
* pop

調用 `notifyOSD.push()` 或 `notifyOSD.append()` 可新增提示訊息，每一個訊息都要指定一個標題(title)。 notifyOSD 將以標題識別提示訊息。重覆推送相同標題的提示訊息，並不會做任何事。

程式人員隨時可調用 `notifyOSD.remove()` 方法按標題移除堆疊中任一位置的提示訊息，或用 `notifyOSD.pop()` 方法移除最上方的提示訊息。

#### setConfig

```javascript

notifyOSD.setConfig(settings)

```

設定 *notifyOSD* 的行為。目前有下列可指定項目。

* {Object} settings 
* {boolean} [settings.closable=false]
* {string} [settings.corner='right-top'] - left-top, left-bottom, right-top, right-bottom.
* {string} [settings.count_template='還有$c筆訊息']
* {number} [settings.zIndexBase=1999]

notifyOSD 預設行為是不允許使用者關掉訊息，顯示在畫面右上角。

程式人員可以設定 *closable* 為 true 允許使用者關掉訊息，提示訊息視窗下方將增加一個 x 符號。

*corner* 可指示訊息顯示的角落，分別是:

* 左上: 'left-top'
* 左下: 'left-bottom'
* 右上: 'right-top'
* 右下: 'right-bottom'

當網頁需要支援多種語系文字時，可用 *count_template* 指定訊息視窗下方的訊息計數文字內容，符號 <var>$c</var> 代表計數值將插入的位置。

若程式人員和其他 UI 套件搭配使用時，發現其他套件的浮動項目會蓋住提示訊息的話，可以調整 *zIndexBase* 的值，數值愈大代表位置愈上方。

程式範例如下:

```javascript

notifyOSD.setConfig({
    'closable': true
});

```

#### push

```javascript

notifyOSD.push(title, message, options)

```

在角落顯示提示訊息視窗。一個 title 一個視窗，不會重覆建立。

* {string} title
* {string} message
* {Object} options
* {boolean} options.to_bottom - 新訊息放在訊息堆疊最下方。

程式範例:

```javascript

notifyOSD.push("輸入姓名", "姓名欄位必填");
notifyOSD.push("檢查電話格式", "電話號碼格式不符，請修正");

```

#### append

```javascript

notifyOSD.append(title, message)

```

新訊息放在訊息堆疊最下方。效果等同 push() 配上 `{"to_bottom": true}`。

* {string} title
* {string} message

#### remove

```javascript

notifyOSD.remove(title)

```

依訊息標題移除提示。

* {string} title

程式範例:

```javascript

notifyOSD.remove("輸入姓名");

```

#### pop

```javascript

notifyOSD.pop()

```

移除最上方的提示訊息。

