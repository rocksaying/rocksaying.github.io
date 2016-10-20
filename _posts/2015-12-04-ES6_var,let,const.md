---
title: 學習 ECMAScript 6 - var, let 和 const
category: programming
tags: [javascript,ecmascript,es6]
---

各位，又到了文字訓詁時間。在介紹 <dfn>let</dfn> 之前，我們需要先區分 <dfn>block</dfn> 和 <dfn>scope</dfn> 這兩個字在程式語言中的含義。ECMAScript/JavaScript 是 C 式語系的一枝，但是它對 <dfn>block</dfn> 和 <dfn>scope</dfn> 的定義，與大部份 C 式語系的語言不同。

<dfn>block</dfn> 就是區塊，是程式文章中的一塊獨立段落。 C 式語系中，由 <code>{ }</code> 包起的內容就屬於一個 <dfn>block</dfn> (區塊)，而在區塊之中還可以有小區塊。層層區塊組成文章的巢狀結構。在程式語言的演進歷史中，這是一個重要的足跡。伴隨著區塊而來的還有稱為 <dfn>scope</dfn> 的變數活動範圍、或稱作用域的觀念。程式語言用變數活動範圍劃分各個變數的可用範圍，讓符號名稱可以在不同的活動範圍中繫結不同的變數，也才有現在的區域變數常識。在計算機概論中，<dfn>scope</dfn> 通常也被視為 <dfn>context</dfn>。

<!--more-->

#### 區塊和活動範圍

在 C 式語系的通則中，一個區塊(block)就等於一個活動範圍(scope)。我在程式文章的任何地方寫下一對 <code>{ }</code> 就是在此劃出一個新的活動範圍。例如下面的 C 語言範例，我在 main 區塊中，又寫了一對 <code>{ }</code> 劃出一個小區塊，亦即一個新的活動範圍。所以我可以在這個小區塊中再宣告一次 <var>i</var> 。符號 <var>i</var> 在這一大一小兩區塊中，分別繫結兩個不同活動範圍的變數。所以小區塊中令 <var>i</var> 為 1 的敘述，並不會影響到大區塊的 <var>i</var> 值。一前一後的兩行輸出指令，也就分別輸出 1 和 0 兩個結果。

{% highlight c linenos=table %}
// gcc -o $@ $<
#include <stdio.h>

int main()
{
    int i = 0;

    {
        int i = 1;
        printf("inner scope: %d\n", i);
    }

    printf("main scope: %d\n", i);
    return 0;
}
{% endhighlight %}

如果你把這個 C 語言範例中的第8行和第11行的角括號拿掉的話，編譯器會直接告訴你重複宣告變數。

但是同樣的想法，用在 JavaScript 就錯了。先看看下面的 JavaScript 範例:

{% highlight javascript %}
{
    var i = 0;

    {
        var i = 1;
        console.log("inner block: ", i);
    }

    console.log("host block: %d", i);
}
{% endhighlight %}

前後兩行都顯示 1 ，也就是在小區塊中第二次宣告 <var>i</var> 並賦值為 1 的敘述，其實作用在第一次宣告的 <var>i</var> 身上。這表示在 JavaScript 中，區塊並不等於活動範圍。一大一小兩區塊的 <var>i</var> 都繫結到同一個變數了。

#### JavaScript 的範圍定義

在 ES6 之前的 ECMAScript 規範中，對於 <dfn>scope</dfn> 的定義只有兩種，一為全域活動範圍(global scope)，一為函數活動範圍(function scope)。你每定義一個函數，就會建立一個屬於這個函數的活動範圍；不在函數內的資源就屬於全域活動範圍。ECMAScript 並沒有採用區塊即活動範圍的定義。所以像 C 語言那樣的區塊用法，在 JavaScript 中就是錯的。

ES6 以前，也只有 <dfn>var</dfn> 一種變數宣告方式。它的用途和函數活動範圍有關。在函數內以 <dfn>var</dfn> 宣告的變數，僅限函數活動範圍內可用，外部看不到。而沒有用 <dfn>var</dfn> 或在函數外宣告的變數，就屬於全域範圍了。<dfn>var</dfn> 是看函數，而不是區塊。所以像下列從 C++/Java/C# 使用者帶來的使用習慣，其實在 JavaScript 中皆無預期效果，甚至會是 bug 。

{% highlight javascript %}
function func(ar)
{
    for (var i = 0; i < ar.length; ++i) {
        // do something.
        for (var i = 0; i < 10; ++i) { // bug in javascript
            console.log(i);
        }
        console.log("ar %d => %d", i, ar[i]);
    }
}
{% endhighlight %}

#### let

隨著函數式編程技巧大量地應用在 JavaScript 工作，人們漸漸感到原本的活動範圍定義不夠用了。操作變數時常常無意中碰觸到預期區域以外的變數。人們需要一個更區域、更細小的變數活動範圍。於是過去僅被少數瀏覽器實作的 <dfn>let</dfn> 語法在 ES6 被定為正式規範。

<dfn>let</dfn> 和 <dfn>var</dfn> 不同之處在於它帶來了以區塊為活動範圍的定義。在 ES6 中，你可以在 for 區塊、if 區塊、或者是不帶任何控制目的純區塊中，使用 <dfn>let</dfn> 宣告以區塊為活動範圍的變數。因此若將前述兩個 JavaScript 的範例程式碼中以 <dfn>var</dfn> 宣告的變數全改為以 <dfn>let</dfn> 宣告，就會跑出正確的結果。

事實上， ES6 規範的 <dfn>let</dfn> 語法帶來的是全套 C 式語系的通用規則。除了以區塊為活動範圍的效果外，它還有下列 <dfn>var</dfn> 沒有的效果與限制:

* let 禁止在同一活動範圍中再次宣告相同名稱的變數。var 會無視第二次宣告，只管指派變數值。但 let 視為重複宣告的語法錯誤。
* let 禁止在宣告變數之前就使用它。
* 在全域範圍以 let 宣告的變數，不會成為全域個體(global object)的屬性。但以 var 宣告的變數同時也會是全域個體的屬性。因此 let 變數是真正的區域變數，你用 module 或其他方式載入的程式碼看不到那些 let 變數。註: 在瀏覽器中運行的 JavaScript 之全域個體一律是 <var>window</var> 。

#### const

在 ES6 之前，JavaScript 並沒有常數這種東西。大多數時候，人們會按照命名慣例，將一個全部以英文字母大寫表示的變數當作一個常數。小心留意不將它們放在左值。但是一個還沒接觸命名慣例的初學者，隨時可能搞砸它們。

所以 ES6 也增加了 <dfn>const</dfn> 這個定義。凡是用 <dfn>const</dfn> 定義的符號，其繫結的內容僅能在定義時設定初值，之後不允許再改變。這就是常數了。試圖改變 const 常數的敘述，都是語法錯誤。除此之外，<dfn>const</dfn> 的語法限制和 <dfn>let</dfn> 相同，不允許重複宣告、不允許宣告前使用。

const 常數還有一點要注意，它可以在定義時計算初值。所以定義時的初值部份不限定為字面內容，而可以使用變數或函數等運算敘述。若初值部份用了變數或運算敘述， JavaScript 會將計算結果作為初值。即使你之後改變了那個變數，也不會影響 const 常數的內容。

{% highlight javascript %}
const PROGRAM_TITLE = "hello";

const MAX1 = 1;

let i = 100;
const MAX100 = i + 1; // 計算 i+1 之現值後存入，故為 101

i += 20;
console.log(MAX100); // 仍為 101

const AR = [1,2];
AR.push(3);
console.log(AR); // Firefox: 改變了... 我不確定這是否為 bug

{% endhighlight %}

雖然 <dfn>const</dfn> 並不要求符號名稱全大寫，但繼續依循這個命名慣例仍然是件好事，可以提高可讀性。

###### 相關文章

* [ES6 In Depth: let and const](https://hacks.mozilla.org/2015/07/es6-in-depth-let-and-const/)
* 石頭閒語: [ECMAScript 6 - Template strings]({% post_url 2015-11-05-ES6_Template_strings %})
* 石頭閒語: [ECMAScript 6 - Symbol]({% post_url 2015-11-09-ES6_symbol %})
* 石頭閒語: [ECMAScript 6 - for-of 與 iterator]({% post_url 2015-11-10-ES6_for-of_and_iterator %})。
* 石頭閒語: [ECMAScript 6 - Generator]({% post_url 2015-11-13-ECMAScript 6 - Generator %})
* 石頭閒語: [ECMAScript 6 - 新函數語法 - Arrow functions, Rest and Spread parameters, Default value]({% post_url 2015-11-18-ECMAScript 6 - Arrow functions, Rest parameters %})
* 石頭閒語: [ECMAScript 6 - Destructuring]({% post_url 2015-12-01-ES6_Destructuring %})
* 石頭閒語: [ECMAScript 6 - Proxy 和 Reflect]({% post_url 2015-12-08-ES6_Proxy_Reflect %})
* 石頭閒語: [ECMAScript 6 - Class]({% post_url 2016-01-28-ES6_Class %})
* [Variable declarations and more in the new JavaScript](http://www.ibm.com/developerworks/web/library/wa-ecmascript6-neward-p1/index.html?ca=drs-&ce=ism0070&ct=is&cmp=ibmsocial&cm=h&cr=crossbrand&ccy=us)
