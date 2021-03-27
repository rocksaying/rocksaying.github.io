---
title: 學習 ECMAScript/JavaScript 6 - Destructuring
category: programming
tags: [javascript,ecmascript,es6]
lastupdated: 2015-12-02
---

在 JavaScript 的設計場景中，我們使用了大量的陣列內容與屬性值操作。甚至在定義函數時也會使用屬性表作為參數，以換取選用性參數與擴充參數項目的彈性。例如:

{% highlight javascript %}
function func1(props) {
    if (props.width && props.height)
        set_size(props.width, props.height);
    if (props.x && props.y)
        set_pos(props.x, props.y);
}

func1({width:100, height:50});
{% endhighlight %}

為了簡化陣列內容與屬性值的操作， ES6 新增了 <dfn>Destructuring (解構)</dfn> 語法。 <dfn>Destructuring</dfn> 的用法簡單地說就是左值(等號左邊的對象)可以放一組由變數組成的結構，由 ES6 將右值的陣列內容指派給左值的每個變數。

<!--more-->

在 ES 的語法中， <code>[]</code> 就代表配置一個陣列，<code>{}</code> 就代表配置一個標準個體 (standard object)。此兩者都是一種結構。依設計者使用的結構， ES6 的 Destructuring 敘述也有些差別。

#### 解構陣列或迭代器

按照 Destructuring 的做法，當設計者要為多個變數賦值時，可以把這些變數放進一個陣列，再把這個陣列放在等號左邊。至於要指派的值，則用陣列與迭代器放在等號右邊。 ES6 就會解開兩邊的結構，將它擴展為多次賦值操作。設計者就不需要寫那麼多行賦值敘述了。如下所示:

{% highlight javascript %}
// I want assign value to x and y.
var [x, y] = [1, 2];

// destructure to

var x = 1;
var y = 2;
{% endhighlight %}

ES6 還允許兩邊結構的項目數量不一致，或者左值的結構項目可以放空位跳過用不到的內容。當右值的項目數量少於左值時，不足的部份之預設值為 <dfn>undefined</dfn>，或者設為你指定的預設值。

{% highlight javascript %}
// 右值少於左值
var [x, y, z] = [1, 2];
// destructure to
var x = 1;
var y = 2;
var z = undefined;

// 右值少於左值，但左值有設定預設值
var [x, y, z = 100] = [1, 2];
// destructure to
var x = 1;
var y = 2;
var z = 100;

// 左值少於右值
var [x, y] = [1,2,3];
// destructure to
var x = 1;
var y = 2;

// 左值放空位 (第二位放空)
var [x, ,y] = [1, 2, 3];
// destructure to
var x = 1;
var y = 3;
{% endhighlight %}

<div class="note">
如果你同時熟悉 PHP 或 Python 的話，要注意 ES6 在這些地方比 PHP, Python 更寬鬆些。PHP 可以放空位，但只允許右邊的項目數量比左邊多；如果右邊的項目數量少於左邊則會發生 <q>Undefined offset</q> 錯誤。 Python 要求兩邊的項目數量必須一致，多或少都視為 <dfn>ValueError</dfn> 例外。至於放空位的做法，Python 是技巧性地使用 <var>_</var> 變數達成。

{% highlight python %}
list($x, , $y) = [1, 2, 3];

x, _, y = [1, 2, 3]
{% endhighlight %}
</div>

ES6 也允許你用多層結構或 <dfn>Rest parameters</dfn> 。

{% highlight javascript %}
var [x, y, [a,b,c]] = [1, 2, [10,11,12]];

var [x, ...y] = [1, 2, 3]
// destructure to
var x = 1;
var y = [2,3];
{% endhighlight %}


#### 解構個體屬性

上節範例都是用陣列結構。若是操作屬性結構，你必須改用 <code>{}</code> 。ES6 解構時，將會按照屬性名稱賦值。沒有對應的屬性名稱的左值項目，則指派為 <dfn>undefined</dfn> 或設計者指定的預設值。

{% highlight javascript %}
var {x, y, z} = {h:1, w: 2, x:100, y:200};
// destructure to
var x = 100;
var y = 200;
var z = undefined;

{% endhighlight %}

當你的左值是一個屬性結構時，ES6 的解構行為是走訪屬性。所以右值雖然可以放陣列，但基本上沒有作用。下例給各位一個思考空間:

{% highlight javascript %}
var {x, length} = [10, 20];
console.log(x);      // undefined
console.log(length); // 2; 因為陣列一定有表示長度的屬性 length ，而 [10,20] 這個陣列的長度是 2 。
{% endhighlight %}


#### 應用情境

通常我們會將解構語法用於接收函數回傳值是陣列時。如下:

{% highlight javascript %}
function get_image_size() {
    // do something...
    return [w, h, x, y];
}

// without destructuring:
var result = get_image_size();
var width = result[0];
var height = result[1];

// with destructuring:
var [width, height] = get_image_size();

{% endhighlight %}

for-of 也是解構語法的常用場合。例如 ES6 新增的集合型態 <dfn>Map</dfn> 每次迭代回傳的值都是一組 <code>[key, value]</code> 結構，所以 for-of 時可以用解構語法將迭代結果分別指派給兩個變數。如下:

{% highlight javascript %}
var map = new Map();
map.set('a', 1);
map.set('b', 2);

for (let [k, v] of map) {  // [k, v] = [key, value]
    console.log(k, ' => ', v);
}

// without destructuring
for (let v of map) {
    console.log(v[0], ' => ', v[1]);  // 可讀性差了許多
}
{% endhighlight %}

Destructuring 是一個語法糖衣。介紹到此也就差不多了。


###### 相關文章

* [ES6 In Depth: Destructuring](https://hacks.mozilla.org/2015/05/es6-in-depth-destructuring/)
* 石頭閒語: [ECMAScript/JavaScript 6 - Template strings]({% post_url 2015-11-05-ES6_Template_strings %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Symbol]({% post_url 2015-11-09-ES6_symbol %})
* 石頭閒語: [ECMAScript/JavaScript 6 - for-of 與 iterator]({% post_url 2015-11-10-ES6_for-of_and_iterator %})。
* 石頭閒語: [ECMAScript/JavaScript 6 - Generator]({% post_url 2015-11-13-ECMAScript 6 - Generator %})
* 石頭閒語: [ECMAScript/JavaScript 6 - 新函數語法 - Arrow functions, Rest and Spread parameters, Default value]({% post_url 2015-11-18-ECMAScript 6 - Arrow functions, Rest parameters %})
* 石頭閒語: [ECMAScript/JavaScript 6 - var, let 和 const]({% post_url 2015-12-04-ES6_var,let,const %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Proxy 和 Reflect]({% post_url 2015-12-08-ES6_Proxy_Reflect %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Class]({% post_url 2016-01-28-ES6_Class %})
* 石頭閒語: [ECMAScript/JavaScript 6 - 語法補遺]({% post_url 2017-01-17-ES6_語法補遺 %})
* [Functional enhancements in ECMAScript 6](http://www.ibm.com/developerworks/library/wa-ecmascript6-neward-p2/index.html)
* [Variable declarations and more in the new JavaScript](http://www.ibm.com/developerworks/web/library/wa-ecmascript6-neward-p1/index.html?ca=drs-&ce=ism0070&ct=is&cmp=ibmsocial&cm=h&cr=crossbrand&ccy=us)
