---
title: 學習 ECMAScript/JavaScript 6 - Proxy 和 Reflect
category: programming
tags: [javascript,ecmascript,es6,proxy,reflect,tdd]
---

本篇要介紹 ECMAScript/JavaScript 6 新增的兩項罕用功能，即 <dfn>Proxy</dfn> (代理者) 和 <dfn>Reflect</dfn> (鏡像)。在本篇發表時，應該只有 Firefox 實作了這兩項。

<!--more-->

#### Proxy

<dfn>Proxy</dfn> 是一個建構者函數，它接受兩個參數。第一個參數是委託者(代理目標)，第二個參數則是一組代理行為表。 Proxy 會建立一個代理者，這個代理者可以視為委託者的分身，但是代理者的行為將根據代理行為表的內容表現，而不是委託者應有的行為。

例如 <var>document.location</var> 的屬性 <var>href</var> 的實際內容為 "http://localhost/" 。你以 <var>document.location</var> 建立了一個代理者 <var>ag_location</var> 。當你透過 <var>ag_location</var> 查看 <var>href</var> 的屬性內容時，它可能會傳回 "http://rocksaying.tw/" ，而不是委託者應該傳回的內容。以下程式碼實作了此一情況。

{% highlight javascript %}
console.log("Href: ", document.location.href);

var ag_location = new Proxy(document.location /*第一個參數: 委託者*/,
{ /*第二個參數: 代理行為表 */
    get: function(target, key) {
        // 取 href 屬性時，一律回傳 http://rocksaying.tw/ ，而不是委託者的實際內容。
        if (key == "href")
            return "http://rocksaying.tw/";
        return target[key];
    }
});

console.log("Href: ", ag_location.href);
{% endhighlight %}

這個代理者有什麼用？

以此例來說。當你在撰寫一個關於網頁在 "http://rocksaying.tw/" 網址上實際執行時的測試案例，你會碰到一個麻煩。那就是大多數時候，你的瀏覽器其實是打開本機網頁執行測試案例，而不是打開真正的 http://rocksaying.tw 網頁。此時瀏覽器的 <var>document.location.href</var> 一定回傳 "http://localhost/" ，故你的測試案例中關於 <var>document.location.href</var> 的斷言都不成立，也就不能跑完測試案例。這個時候，你就需要用上一段程式碼所實作的代理者充當測試目標了，也就是測試案例術語中常說的 <dfn>mock object</dfn>。

反過來說， Proxy 為 TDD (測試驅動開發) 帶來一個抽象化的彈性設計觀念。那就是在測試案例中，應該儘量為測試對象指派代理者，以代理者作為測試目標，而不是直接操作測試對象。

Proxy 提供了十四種可以代理的抽象行為，請參考 [Proxy - Methods of the handler object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Methods_of_the_handler_object)。<dfn>get</dfn> 是最常用的。

#### Reflect

ES6 新增的 <dfn>Reflect</dfn> 與 Java/C# 中的不一樣。在動態語言中，你可以輕易地用各種方式探知與操作一個個體的屬性與方法，實在沒必要像 Java/C# 那麼麻煩。所以 ES6 新增的 Reflect 並不是一個建構者，而是一組靜態方法集合。ES6 是為了 Proxy 而增加 Reflect 。基於 Proxy 可代理的抽象行為， Reflect 也提供了相對應的十四種靜態方法。請參考 [Reflect methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)。Reflect 的靜態方法的第一個參數，通常是 Proxy 的委託者。

Reflect 可以簡化代理行為表的設計工作。以上述程式碼為例，它其實應該寫成下列形式:

{% highlight javascript %}
var ag_location = new Proxy(document.location /*第一個參數: 委託者*/,
{ /*第二個參數: 代理行為表 */
    get: function(target, key) {
        // 取 href 屬性時，一律回傳 http://rocksaying.tw/ ，而不是委託者的實際內容。
        if (key == "href")
            return "http://rocksaying.tw/";
        // 透過抽象的 get 方法回傳委託者的實際內容
        return Reflect.get(target, key);
    }
});

console.log("Href: ", ag_location.href);

{% endhighlight %}

Proxy 的用途並不廣泛，它主要用於設計測試框架。而 Reflect 也是配合 Proxy 而增加的新功能。當你在其他場合使用了這兩項功能時，你可能要多想一想是不是用錯場合、或是多繞遠路。

###### 相關文章

* [ES6 In Depth: Proxies](https://hacks.mozilla.org/2015/07/es6-in-depth-proxies-and-reflect/)
* MDN: [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
* MDN: [Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
* 石頭閒語: [ECMAScript/JavaScript 6 - Template strings]({% post_url 2015-11-05-ES6_Template_strings %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Symbol]({% post_url 2015-11-09-ES6_symbol %})
* 石頭閒語: [ECMAScript/JavaScript 6 - for-of 與 iterator]({% post_url 2015-11-10-ES6_for-of_and_iterator %})。
* 石頭閒語: [ECMAScript/JavaScript 6 - Generator]({% post_url 2015-11-13-ECMAScript 6 - Generator %})
* 石頭閒語: [ECMAScript/JavaScript 6 - 新函數語法 - Arrow functions, Rest and Spread parameters, Default value]({% post_url 2015-11-18-ECMAScript 6 - Arrow functions, Rest parameters %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Destructuring]({% post_url 2015-12-01-ES6_Destructuring %})
* 石頭閒語: [ECMAScript/JavaScript 6 - var, let 和 const]({% post_url 2015-12-04-ES6_var,let,const %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Proxy 和 Reflect]({% post_url 2015-12-08-ES6_Proxy_Reflect %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Class]({% post_url 2016-01-28-ES6_Class %})
* 石頭閒語: [ECMAScript/JavaScript 6 - 語法補遺]({% post_url 2017-01-17-ES6_語法補遺 %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Promise]({% post_url 2021-07-29-ES6_Promise %})
