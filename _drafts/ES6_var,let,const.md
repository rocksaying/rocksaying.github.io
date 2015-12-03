---
title: ECMAScript 6 - var, let 和 const
category: programming
tags: [javascript,ecmascript,es6]
---

各位，又到了文字訓詁時間。在介紹 <dfn>let</dfn> 之前，我們需要先區分 <dfn>block</dfn> 和 <dfn>scope</dfn> 這兩個字在程式語言中的含義。ECMAScript/JavaScript 是 C 式語系的一枝，但是它對 <dfn>block</dfn> 和 <dfn>scope</dfn> 的定義，與大部份 C 式語系的語言不同。

<dfn>block</dfn> 就是區塊，是程式文章中的一塊獨立段落。 C 式語系中，由 <code>{ }</code> 包起的內容就屬於一個 <dfn>block</dfn> (區塊)，而在區塊之中還可以有小區塊。層層區塊組成文章的巢狀結構。在程式語言的演進歷史中，這是一個重要的足跡。伴隨著區塊而來的還有稱為 <dfn>scope</dfn> 的變數活動範圍、或稱作用域的觀念。程式語言用變數活動範圍劃分各個變數的可用範圍，讓符號名稱可以在不同的活動範圍中繫結不同的變數，也才有現在的區域變數常識。

<!--more-->

在 C 式語系的通則中，一個區塊就等於一個活動範圍。我在程式文章的任何地方寫下一對 <code>{ }</code> 表示在此劃出一個新的活動範圍。例如下面的 C 語言範例，我在 main 區塊中，又寫了一對 <code>{ }</code> 劃出一個小區塊，也表示一個新的活動範圍，所以我可以在這個小區塊中再宣告一次 <var>i</var> 。符號 <var>i</var> 在這一大一小兩區塊中，分別繫結兩個不同活動範圍的變數。所以小區塊中令 <var>i</var> 為 1 的敘述，並不會影響到大區塊的 <var>i</var> 值。一前一後的兩行輸出指令，也就分別輸出 1 和 0 兩個結果。

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

