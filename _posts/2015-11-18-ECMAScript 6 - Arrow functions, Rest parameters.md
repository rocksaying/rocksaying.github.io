---
title: 學習 ECMAScript 6 - 新函數語法 - Arrow function, Rest and Spread parameters, Default value
category: programming
tags: [javascript,ecmascript,es6,function]
lastupdated: 2017-01-13
---

ECMAScript 6 為函數定義與操作增加了一些新的語法，在此一併介紹。它們分別是:

* 匿名函數箭形語法 (箭頭函數): Arrow functions
* 不定數量參數: Rest parameters / Spread parameters
* 指定參數預設值: Parameters default value

<!--more-->

### Arrow functions 箭頭函數

ECMAScript 傳統的匿名函數定義語法只是去掉一般函數定義中的名稱部份。 ES6 則從 C# 借來了新的匿名函數語法，讓設計者少打一些字。並稱此新語法為 <dfn>Arrow functions (箭頭函數)</dfn>。因為我本來就會 C# ，這個 ES6 的新語法在我眼中反而有著熟悉感。

<div class="note">
在 C# 中，此語法就稱為「匿名函數」。但 ECMAScript 原本就有匿名函數語法。為了區別新舊，ES6 造了一個象形字 <dfn>Arrow functions</dfn> ，以新語法中的主要符號 <code>=&gt;</code> 的箭頭形狀稱呼這項新語法。我叫它匿名函數箭形語法。一般稱為<dfn>箭頭函數</dfn>。
</div>

{% highlight javascript %}
// ECMAScript 傳統函數定義語法
function(parameter_list) {
    return result;
}

// ES6 新語法，注意中間的箭頭 => ，口語可讀作將左邊的參數交給右邊的程式區塊處理。
(parameter_list) => {
    return result;
}

// 簡寫原則1: 有一個以上的參數時，可以省略表示參數清單的 () 。
(x) => {}
  // or
x => {}

(x,y) => {}
  // or
x,y => {}

// 簡寫原則1但書: 但沒有參數時，不可省略 () 。
() => {}

// 簡寫原則2: 函數本體只有一行敘述時，可以省略表示函數區塊的 {} 。
//   而且這時自動將該行執行結果作為函數回傳值，不能使用 return 。
x,y => {
    return x+y;
}
  // or
x,y => x+y

{% endhighlight %}

箭形函數有一點和傳統函數不同，那就是箭形函數內部不會配置一個代表自己的 <var>this</var> 。如果你在箭形語法中使用了 <var>this</var> ，它指的是包覆這個箭形語法敘述區塊的函數，也就是外面的 <var>this</var> 。所以箭形語法基本上不能動態地被指定為個體方法。


### ... 不定數量參數

ES6 為不定數量參數的使用場合增加了一個 <code>...<var>symbol</var></code> 新語法。但這個新語法依使用場合分別有兩個不同的意義。

* 函數定義參數清單時，稱為 <dfn>Rest parameters (其餘參數)</dfn>。
* 調用函數傳遞參數時，稱為 <dfn>Spread parameters (攤開參數)</dfn>。

我在 [COSCUP 2014 遊記]({% post_url 2014-7-21-COSCUP 2014 遊記 %}) 中已記述了一些 `...` 的內容。

#### Rest parameters

在 ECMAScript3 時代，就已經定義了基本的不定數量參數項目，它叫做 <dfn>Arguments</dfn> 。 每當函數被調用時，其內部都會配置一個型態為 <dfn>Arguments</dfn> 的 <var>arguments</var> 變數，用於存放傳給這個函數的所有參數內容。它以 key/value 形式存放參數清單項目，可用 <code>arguments[n]</code> 的方式取得參數。並具有 <dfn>length</dfn> 屬性。

現在 ES6 增加了 Reset parameters (其餘參數)功能，讓使用者自己命名了。而 Rest parameters 和 arguments 差別在於 arguments 存有全部參數清單項目，而 Rest parameters 只包含了沒有單獨賦於名稱的其餘參數。

其餘參數顧名思義，必須是函數定義的參數清單內容最後一項。而 `...` 後緊跟著的符號名稱，就是函數內儲存其餘參數的陣列名稱。

<div class="note">
<p>arguments 的行為看起來很像陣列，其實不是。而 rest parameters 就真的是陣列了。
</p>
<p>Firefox 30 不允許 rest parameter 和 arugments 同時使用。在一個宣告了 rest parameters 的函數中，若是使用了 arugments 會被視為語法錯誤。
</p>
</div>

以下示範其餘參數與 arguments 的使用方式與差異。

{% highlight javascript %}
// arguments 的結果
function func1(x, y)
{
    console.log('count:', arguments.length, '. ', arguments);
}

func1(1, 2, 'other', 'parameters');
//輸出: count: 4. Arguments {0:1, 1:2, 2:'other', 3:'parameters'}

// rest parameters 的結果
function func2(x, y, ...z)
{
    console.log('count:', z.length, '. ', z);
}

func2(1, 2, 'other', 'parameters');
//輸出: count: 2. Array[ 'other', 'parameters' ]

// rest parameter 用例
function add_all(...vs)
{
    var result = 0;
    vs.forEach(v => result += v); // arrow function
    return result;
}

add_all(7,6,4,3,9,5,1);
{% endhighlight %}

#### Spread parameters

Spread parameters (攤開參數) 意指調用函數時，將緊跟著 `...` 的那個集合內容，攤開成獨自的參數(<span class="note">攤開對象必須是陣列或迭代器</span>)。而且它可以放在參數列的任何位置。

{% highlight javascript %}
var a = [1,2,3];
var b = ['x', 'y'];

var s = 'hello '.concat('spread ', ...a, ' and ', ...b, ' end');
console.log(s);
// 輸出: hello spread 123 and xy end

// 你也可以觀察沒有攤開參數時的差異，一定不一樣。

// 你可以將 ...a 和 ...b 想像成手動輸入:
'hello '.concat('spread',
  a[0], a[1], a[2], // ...a
  ' and ',
  b[0], b[1], // ...b
  ' end');

{% endhighlight %}

攤開參數是一個很實用的改變。在 ECMAScript5 以前，要把一組參數攤開傳給函數時，只能用 <code>apply()</code> 。 但 <code>apply()</code> 同時也有改變函數內部 <var>this</var> 指涉對象的效果，而且這才是它的主要目的，故語意不清晰。對單純想要使用函數的人來說，這是個麻煩的副作用。

對 library/framework 的設計者來說，攤開參數提供了很多設計與使用上的彈性。

#### ... 運算子使用技巧

除了「Reset parameters (其餘參數)」和「Spread parameters (攤開參數)」這兩個一般用法， `...` 運算子還可以用於陣列／個體的複製與合併。

{% highlight javascript %}

var a = [1,2,3];
var b1 = a;  // a 和 b1 實際上參照到同一個陣列
var b2 = [...a];  // 複製陣列。這種寫法才會產生一個新的複製體
var b3 = [...a, ...b2];  // 合併陣列。相當於下列的 concat() 寫法。
var b4 = [].concat(a, b2);

var o1 = {'a': 1, 'b': 2};
var o2 = {'x': 3, 'y': 4};
var o3 = {...o1};  // 複製個體。
var o4 = {...o1, ...o2};  // 合併個體。

{% endhighlight %}

### Parameters default value 指定參數預設值

ECMAScript 原本就規定沒有傳值的參數，默認其值為 <dfn>undefined</dfn>。現在， ES6 允許使用者自己決定參數的預設值。它的語法很簡單，就是函數定義時，在參數後面加上 <code>=預設值</code>。而且預設值可以使用變數或另一個參數。

另外，在其他提供指定參數預設值功能的程式語言中，多數限定帶有預設值的參數必須放在參數清單後半部，不可將有預設值與無預設值的參數夾雜一起。但是 ECMAScript 無此限制。因為 ECMAScript 隱含規定每一個參數都有預設值 <dfn>undefined</dfn> 。

{% highlight javascript  %}
function xyz(x, y, z) {
    if (y == undefined) // before ES6
        y = 1;
}

// 每個參數的隱含預設值都是 undefined ，等於下行:
function xyz(x = undefined, y = undefined, z = undefined) {
    if (y == undefined) // before ES6
        y = 1;
}

// 現在 ES6 允許設計者指定預設值。不打算自己指定預設值的參數，可以不加 = ，套用隱含的定義。
// 下行指定 y 的預設值為 1 ，其他參數不變:
function xyz(x, y = 1, z) {
    console.log(x, y, z);
}
{% endhighlight %}

注意，調用函數時，就算使用者傳遞的參數數目少於參數清單定義的數目，參數值仍然會由左到右依序指派，並不會跳過帶有自定預設值的參數項。承上例的 <code>xyz()</code> ，使用時:

{% highlight javascript %}
xyz('x', 'z');
// 會是 x = 'x', y = 'z', z = undefined
// 而不是 x = 'x', y = 1, z = 'z' 。
{% endhighlight %}

指定參數預設值大幅簡化了設計函數時的初始工作。以往設計函數時，如果希望函數的某些參數可在省略不傳的情形就套用指定值的話，我們要在函數開頭寫上一堆 <code>if (y == undefined) y =1</code> 之類的程式碼。現在只要在參數清單中直接指定即可，語意更明確。

###### 相關文章

* [ES6 In Depth: Arrow functions](https://hacks.mozilla.org/2015/06/es6-in-depth-arrow-functions/)
* [ES6 In Depth: Rest parameters and Defaults](https://hacks.mozilla.org/2015/05/es6-in-depth-rest-parameters-and-defaults/)
* [COSCUP 2014 遊記]({% post_url 2014-7-21-COSCUP 2014 遊記 %})
* 石頭閒語: [ECMAScript 6 - Template strings]({% post_url 2015-11-05-ES6_Template_strings %})
* 石頭閒語: [ECMAScript 6 - Symbol]({% post_url 2015-11-09-ES6_symbol %})
* 石頭閒語: [ECMAScript 6- for-of 與 iterator]({% post_url 2015-11-10-ES6_for-of_and_iterator %})。
* 石頭閒語: [ECMAScript 6 - Generator]({% post_url 2015-11-13-ECMAScript 6 - Generator %})
* 石頭閒語: [ECMAScript 6 - Destructuring]({% post_url 2015-12-01-ES6_Destructuring %})
* 石頭閒語: [ECMAScript 6 - var, let 和 const]({% post_url 2015-12-04-ES6_var,let,const %})
* 石頭閒語: [ECMAScript 6 - Proxy 和 Reflect]({% post_url 2015-12-08-ES6_Proxy_Reflect %})
* 石頭閒語: [ECMAScript 6 - Class]({% post_url 2016-01-28-ES6_Class %})
* 石頭閒語: [ECMAScript 6 - 語法補遺]({% post_url 2017-01-17-ES6_語法補遺 %})
* [Functional enhancements in ECMAScript 6](http://www.ibm.com/developerworks/library/wa-ecmascript6-neward-p2/index.html)
