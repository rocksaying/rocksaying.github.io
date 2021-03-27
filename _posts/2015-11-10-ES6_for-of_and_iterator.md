---
title: 學習 ECMAScript/JavaScript 6 - for-of 與 iterator
category: programming
tags: [javascript,ecmascript,es6,iterator]
---

在 ECMAScript/JavaScript 6 之前， ECMAScript/JavaScript 的迭代迴圈有下列三種:

* 計數式 for 迴圈。
* 走訪個體屬性的 for-in 迴圈。
* ES5 為陣列增加的 forEach 方法。

ES6 定義了更多資料集合型態，為讓這些資料集合型態有一致的迭代操作方式， ES6 也同時新增了 for-of 迴圈並讓程序人員自訂類別的迭代行為。

<!--more-->

### 溫故知新

在介紹新的迭代規格之前，先複習原本的迭代操作方式。

{% highlight javascript %}
var a = [1,2,3];

// for loop
for (let i = 0; i < a.length; ++i) {
    console.log(a[i]);
}

// A common anti-pattern of for-in loop.
for (let i in a) {
    console.log(a[i]);
    /*
    i are strings: "0", "1", "2".
    and you may get some thing you don't expected.
    */
}

var o = {
    'a': 1,
    'b': 2,
    'c': 3
}

// for-in loop
for (let k in o) {
    console.log(k + ': ' + o[k]);
}
{% endhighlight %}

for-in 是初學 JavaScript 的人最常誤用的迭代操作，他們經常錯誤地使用 for-in 走訪陣列。直到 jQuery 出現之後，因為 jQuery 比較*酷* ，那些初學者改用 jQuery 的迭代方法操作陣列，這才讓 for-in 走訪陣列的錯誤用法逐漸消失。

為了讓陣列有更方便的迭代操作方式， ES5 為陣列增加了 `forEach()` 方法。<dfn>forEach</dfn> 定義為陣列方法亦是有意為之。為了避免程序人員將 forEach 誤用在非陣列個體上。

{% highlight javascript %}
var a = [1,2,3];

a.forEach(function(v, i, self){
    console.log(v);
});

var o = {
    'a': 1,
    'b': 2,
    'c': 3
}

// TypeError! non-array object does not have forEach method.
o.forEach(function(v, k, self){
});
{% endhighlight %}

### for-of

傳統的 for-in 迴圈是迭代取鍵／屬性名稱；而 ES6 增加的 for-of 迴圈則是取值／屬性值。下列示範兩者差異。

{% highlight javascript %}
for (k in a) {
    console.log(k); // '0', '1', '2'
}

for (v of a) {
    console.log(v); // 1, 2, 3
}

for (k in o) {
    console.log(k); // 'a', 'b', 'c'
}

for (v of o) { // error
    console.log(v);
}
{% endhighlight %}

上列範例的第四個 for-of 迴圈將會發生錯誤。因為你配置的單純個體 <var>o</var> 缺少兩個 for-of 必要方法。按照 Java 的說法就是 <var>o</var> 所屬類別沒有實作 Iterator 介面。這兩個方法分別是 <code>Symbol.iterator</code> 和 <code>next</code> 。下列解釋 for-of 的實際迭代過程。

{% highlight javascript %}
for (let v of o) {
    console.log(v);
}

// 等於下列動作

o[Symbol.iterator](); // init loop state
while (true) {
    _result = o.next();
    if (_result.done)
        break;
    v = _result.value;
    console.log(v);
}
{% endhighlight %}

方法 <code>Symbol.iterator</code> 負責初始迭代狀態。

方法 <code>next</code> 則負責取值，它需要回傳一個具有 '<var>done</var>' 和 '<var>value</var>' 兩個鍵的表。 value 自然是這次迭代取得的值，而 done 表示迭代完成與否／是否還有下一個值？ 當 done 之值為 <code>true</code> 時，表示迭代完成，此時 value 應設為 <code>undefined</code> 。

下列範例是我直接往 <var>o</var> 上添加這兩個方法，驗證 for-of 的操作過程。

{% highlight javascript %}
o[Symbol.iterator] = function() {
    this._iter = [];
    this._current = 0;
    for (k in o) {
        if (k != 'next' && k != '_iter' && k != '_current')
            this._iter.push(k);
    }
    return this;
}

o.next = function() {
    var done, value;
    if (this._current < this._iter.length) {
        done = false;
        value = this[this._iter[this._current]];
        ++this._current;
    }
    else {
        done = true;
        value = undefined;
    }
    return {'done': done, 'value': value};
}

for (v of o) {
    console.log(v); // 1,2,3
}
{% endhighlight %}

就程式碼的內容來說，上述範例實在蠢到不行。就為了套上 for-of 迴圈，反而寫了比 for-in 迴圈更多的程式碼。實際上當然不是這樣用的。

這個範例最主要的重點是告訴你設計這種迭代器時，你需要一些額外的項目保存現行步驟狀態。為了簡化設計步驟， ES6 又增加了 <dfn>yield</dfn> 特性，正式名稱是 <dfn>Generator</dfn> 。下次再講。

如果不會寫 <dfn>Generator</dfn> 是不是就用不上 for-of 了？ 這倒不是。因為除了陣列以外，任何實作了迭代方法的個體都可以用 for-of 。例如字串、 DOM NodeList ，以及 ES6 新增的資料集合型態 <dfn>Set</dfn> 與 <dfn>Map</dfn> 。這些才是 for-of 最常用的地方。

###### 相關文章

* [ES6 In Depth: Iterators and the for-of loop](https://hacks.mozilla.org/2015/04/es6-in-depth-iterators-and-the-for-of-loop/)
* 石頭閒語: [ECMAScript/JavaScript 6 - Template strings]({% post_url 2015-11-05-ES6_Template_strings %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Symbol]({% post_url 2015-11-09-ES6_symbol %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Generator]({% post_url 2015-11-13-ECMAScript 6 - Generator %})
* 石頭閒語: [ECMAScript/JavaScript 6 - 新函數語法 - Arrow functions, Rest and Spread parameters, Default value]({% post_url 2015-11-18-ECMAScript 6 - Arrow functions, Rest parameters %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Destructuring]({% post_url 2015-12-01-ES6_Destructuring %})
* 石頭閒語: [ECMAScript/JavaScript 6 - var, let 和 const]({% post_url 2015-12-04-ES6_var,let,const %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Proxy 和 Reflect]({% post_url 2015-12-08-ES6_Proxy_Reflect %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Class]({% post_url 2016-01-28-ES6_Class %})
* 石頭閒語: [ECMAScript/JavaScript 6 - 語法補遺]({% post_url 2017-01-17-ES6_語法補遺 %})
* [Functional enhancements in ECMAScript 6](http://www.ibm.com/developerworks/library/wa-ecmascript6-neward-p2/index.html)
