---
title: ECMAScript 6 - Generator
category: programming
tags: [javascript,ecmascript,es6,iterator,generator,yield]
---

<dfn>Generator</dfn> 是 ECMAScript 6 新增的一項頗為有趣的語法功能。它的關鍵字是 <dfn>yield</dfn> 。

在上篇 [介紹 for-of 與迭代器]({% post_url 2015-11-10-ES6_for-of_and_iterator %}) 時，我提到設計一件具有迭代能力的個體或類別時，需要添加額外資料以保存現行狀態。而 Generator 就是為了簡化這項設計工作而導入的新功能。

<div class="note">
根據維基百科的說法， Generator 就是一種 Iterator (迭代器)。而 ECMAScript 算是很晚才加入這功能的主流程式語言。 C 語言也可以用 setjmp()/longjmp() 實現這功能，只是 setjmp() 是 POSIX 系統呼叫，不算程式語言功能。
</div>

<!--more-->

我在 [介紹 for-of 與迭代器]({% post_url 2015-11-10-ES6_for-of_and_iterator %}) 一文最後往 <var>o</var> 加了兩個方法，把它變成了可以套用 for-of 的 iterator (迭代器)。在此我用 generator 改寫，可簡化為下列程式碼:

{% highlight javascript %}
var o = {
    'a': 1,
    'b': 2,
    'c': 3
};

function* OG(obj) {
    for (var k in obj) {
        yield obj[k];
    }
}

for (var v of OG(o)) {
    console.log(v); // 1,2,3
}
{% endhighlight %}

上述範例有新朋友，就是 <code>function* / yield</code>。 ECMAScript 不想創造新的關鍵字，所以假借 <dfn>function</dfn> 為字眼，再加上一個 <code>*</code> 偏旁，造出 <code>function*</code> 表示 Generator 。而 generator 也不能用 <dfn>return</dfn> 返回，要用 <dfn>yield</dfn> 跳出。因為對 generator 而言，它只是暫時讓出(yield)執行權利給外部，並不是完工返回。

瞧瞧改寫的範例改變了什麼。<code>[Symbol.iterator]()</code> 和 <code>next()</code> 用 generator 一次搞定。原來為了保存現行狀態而由我添加 <var>_iter</var> 和 <var>_current</var> 也不用自己處理了。

簡而言之，上列範例告訴我們， ECMAScript 中的 <dfn>Generator</dfn> 就是一個在跳出執行工作前會保存現行狀態的程式區塊。當使用者再次調用這個程式區塊時，它便會根據上次保存的資訊恢復狀態，再繼續執行下一步。正式說法則是 <dfn>Generator</dfn> 就是定義一個具有 <code>[Symbol.iterator]()</code> 和 <code>next()</code> 方法的迭代器。它隱藏了 <code>[Symbol.iterator]()</code> 和恢復狀態的工作，讓設計者專注在 <code>next()</code> 該做的事。

前面的例子可能跳得有點快。再來一個範例，我用一般的函數敘述表達 Generator 的工作概念。我定義了一個函數 <code>hello()</code> ，希望第一次執行時給我 'hello' 、第二次執行給我 'world' 。所以它本身必須知道它是第幾次被調用。我配置了一個狀態保存區 <var>state</var> 給它，這讓它可以記憶現在它執行到第幾步了。

對了，雖然 generator 內只寫 <code>yield <var>value</var></code> ，但調用者實際上是調用 <code>next()</code> 方法，所以 <code>hello()</code> 函數也模仿這一動作回傳 done/value 。當它沒有下一個步驟時，它就會回傳 <code>{'done':true, 'value':undefined}</code>。

{% highlight javascript %}
function hello(state) {
    var v = undefined;
    var done = false;
    if (!state.step)
        state.step = 0;
    switch (state.step) {
    case 0:
        v = 'hello';
        break;
    case 1:
        v = 'world';
        break;
    default:
        done = true;
        break;
    }
    if (!done)
        ++state.step;
    return {'done': done, 'value': v};
}

var state = {}; // init state. like [Symbol.iterator]().
console.log(hello(state)); // log 'hello'.
console.log(hello(state)); // log 'world'.
console.log(hello(state)); // log undefined.
{% endhighlight %}

同樣的事，由 Generator 來做就可以簡化成:

{% highlight javascript %}
function* hello_g() {
    yield 'hello'; // when step 0
    yield 'world'; // when step 1
    // no more.
}

var iter = hello_g();
console.log(iter.next()); // log 'hello'.
console.log(iter.next()); // log 'world'.
console.log(iter.next()); //
{% endhighlight %}

因為 Generator 是定義一個迭代器，所以你調用 generator 時，它會回傳一個迭代器給你。你接著只需要調用這個迭代器的 <code>next()</code> 方法。

當你在 <code>for-of</code> 中使用 generator 時，<code>for-of</code> 會檢查 'done' 之值。在這以外的使用場合，你得要記得檢查 <code>next()</code> 方法回傳的 'done' 內容。

Generator 具有相當強大的應用威力，不過它使用在迴圈以外的場合時有些違反過往的編程習慣。先從設計可走訪的資料集合開始練習吧。

###### 相關文章

* 更多關於 Generator 的事，可進一步閱讀 [ES6 In Depth: Generators](https://hacks.mozilla.org/2015/05/es6-in-depth-generators/) 。
* 石頭閒語: [ECMAScript 6 - Symbol]({% post_url 2015-11-09-ES6_symbol %})
* 石頭閒語: [ECMAScript 6 - Template strings]({% post_url 2015-11-05-ES6_Template_strings %})
* 石頭閒語: [ECMAScript 6- for-of 與 iterator]({% post_url 2015-11-10-ES6_for-of_and_iterator %})。
