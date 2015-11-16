---
title: ECMAScript 6 - 新函數語法 - Arrow functions, Rest parameters 與參數預設值
category: programming
tags: [javascript,ecmascript,es6,function]
---

ECMAScript 6 為函數定義增加了一些新的語法，在此一併介紹。它們分別是:

* 新的匿名函數語法: Arrow functions
* 其餘參數表達語法: Rest parameters
* 自定參數預設值: Parameter default value

<!--more-->

Arrow functions
---------------

ECMAScript 傳統的匿名函數定義語法只是把一般函數定義中的名稱部份去掉。 ES6 則從 C# 借來了新的匿名函數語法，讓設計者少打一些字。因為我本來就會 C# ，這個 ES6 的新語法在我眼中反而有著熟悉感。

{% highlight javascript %}
// ES3
var f1 = function(x) {
    return x+1;
}

var f2 = function(x,y) {
    var t = x;
    x = y;
    y = t;
}

var f3 = function() {
    return something;
}

// ES6
var nf1 = x => x+1;

var nf2 = (x,y) => {
    var t = x;
    x = y;
    y = t;
}

var nf3 = () => something;
{% endhighlight %}

<div class="note">
在 C# 中，這個語法就稱為「匿名函數」。但 ECMAScript 原本就有匿名函數語法。為了區別新舊，ES6 造了一個象形字 <dfn>Arrow function</dfn> ，以新語法中的主要符號 <code>=&gt;</code> 的箭頭形狀稱呼這項新語法。
</div>


Rest parameters
---------------

我在 [COSCUP 2014 遊記]({% post_url 2014-7-21-COSCUP 2014 遊記 %}) 中並記述了一些「其餘參數」(Rest parameters) 的內容。

* ... 的符號來自是 C 語言，但它用法倒比較像 Python 。
* declare parameters list: function func(named_argN, ...args){}
* rest parameter 必須放在參數清單最後一項。
* spread parameters: a = [1,2,3]; func(...a); 就是 Python 的擴展參數用法。

我補充一下， rest parameter 在 ECMAScript3 時代，可以用函數內的 arguments 實現。 arguments 是語言內建項目，型態名稱為 Arguments ，只在函數內存在。它以 key/value 形式存放參數清單項目，可用 arguments[n] 的方式取得參數。並具有一個 length 屬性，可得參數清單數目。

reset parameter 現在則讓使用者自己命名了。但是 rest parameters 和 arguments 差別在於 arguments 存有全部參數清單項目，而 rest parameters 只包含了沒有賦名的參數項目。

Firefox 30 不允許 rest parameter 和 arugments 同時使用。在一個宣告了 rest parameter 的函數中，若是使用了 arugments 會被視為語法錯誤。

舉例來說:

{% highlight javascript %}
function func1(x, y)
{
    console.log(arguments, 'count:', arguments.length);
}

func1(1, 2, 'other', 'parameters');

//輸出: Arguments {0:1, 1:2, 2:'other', 3:'parameters'} count: 4


function func2(x, y, ...z)
{
    console.log(z, 'count:', z.length);
}

func2(1, 2, 'other', 'parameters');

//輸出: Array[ 'other', 'parameters' ] count: 2
{% endhighlight %}

呼叫函數時的參數擴展(spread)倒是比較好用的改變。 ECMAScript5 以前，要把一組參數傳入一個已經確定參數清單的函數時，只能用 apply() 。 但 apply() 同時也有改變函數內部活動目標(<var>this</var>)的效果，故語意不清晰；對單純想要呼叫函數的人來說，這是個麻煩的副作用。


Parameter default value
-----------------------

###### 相關文章

* [COSCUP 2014 遊記]({% post_url 2014-7-21-COSCUP 2014 遊記 %})
