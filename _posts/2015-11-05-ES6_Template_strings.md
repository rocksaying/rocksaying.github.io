---
title: ECMAScript 6 - Template strings
category: programming
tags: [javascript,ecmascript,es6]
lastupdated: 2015-11-09
---

<dfn>Template strings</dfn> 之用法可參考 <cite>[ES6 In Depth: Template strings](https://hacks.mozilla.org/2015/05/es6-in-depth-template-strings-2/)</cite>。基本的 template string 用法是字串內容必須用反引號 (\`) ，而要插值的變數名稱則要包進 <code>${}</code> 括號中。例如 <code>`Hello ${myName}, template string.`</code> 。

此語法功能之基礎，和我在 <cite>[JavaScript print format]({% post_url 2013-11-6-JavaScript print format %})</cite> 做的事大致相同。差別在於我實作的 `interpolate()` 和要插值的變數內容不在同一個作用域，故我必須將那些變數作為參數傳入。而 ES6 的 template strings 則是原地擴展，可直接取得要插值的變數。

<!--more-->

進一步看 <dfn>tagged templates</dfn> 的工作方式，那就和我實作 `interpolate()` 的方式更像了。所謂 <dfn>tag</dfn> 實際是一個可執行敘述，通常是一個函數，所以解釋時也是將要插值的變數作為參數傳入。

例如:

{% highlight javascript %}
function SaferHTML(templateData) {
  var s = templateData[0];
  for (let i = 1; i < arguments.length; i++) {
    let arg = String(arguments[i]);
    // ...
    s += templateData[i];
  }
  return s;
}

var message =
  SaferHTML`<p>${bonk.sender} has sent you a bonk.</p>`;
{% endhighlight %}

實際上會解釋為:

{% highlight javascript %}
function SaferHTML(templateData) {
  // ...
}

var message =
  SaferHTML(['<p>', ' has sent you a bonk.</p>'], $bonk.sender);
{% endhighlight %}

ES6 會先將 template string 中不插值的部份拆段，變成一個集合作為 tag 函數的第一個參數。再將要插值的變數添加到參數清單中。在 tag 函數內，你可以選擇用傳統的 `arguments` 個體取得參數清單中要插值的內容，也可以用 ES6 增加的 rest parameters 語法。範例 `SaferHTML()` 是用 `arguments` 。

tag 允許設計者做更多的事。你可以自己解釋如何使用要插值的內容，也可以更進一步地對不插值的 <var>templateData</var> 添加自己定義的處理規則。對了，最後別忘了將這些字串連接在一起。我個人傾向用 `concat()` 連接字串，而不是 `+=` 。

###### 相關文章

* 石頭閒語: [JavaScript print format]({% post_url 2013-11-6-JavaScript print format %})
* [ES6 In Depth: Template strings](https://hacks.mozilla.org/2015/05/es6-in-depth-template-strings-2/)
* 石頭閒語: [ECMAScript 6 - Symbol]({% post_url 2015-11-09-ES6_symbol %})
* 石頭閒語: [ECMAScript 6 - for-of 與 iterator]({% post_url 2015-11-10-ES6_for-of_and_iterator %})
