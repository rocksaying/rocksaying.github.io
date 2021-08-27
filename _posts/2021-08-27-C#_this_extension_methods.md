---
title: C# 的 this 參數修飾字與 extension method 說明
category: programming
tags: [c#,csharp,擴充方法]
lastupdated: 2021-08-27
---

朋友前兩天問了個 C# 語法問題：

<blockquote>
問個蠢問題 

`public static byte[] xxxxxxxx(this short x)`

這種場合this的用意是甚麼?
</blockquote>

第一眼，我的想法是「很 Python 的語法」。

<!--more-->

事實上，打從 C++ 開始，我用過的 OOPL 的 method call ，其隱含的意義都是 `method(this)` 。
表面上，我們寫成 `個體.method()` ，但實際上，編譯器是弄成 `method(個體)` 。「個體」 是函數方法隱含的第一個參數。因為這樣，這個函數才知道操作對象是哪個東西。

同樣的做法，我們也可以在 event handler 看到。所有 event handler 都把「發生事件的個體」 擺在它的第一個參數。

C 語言的古老作法可看以下兩篇文章。所有當成 method 用的函數，其第一個參數總是代表 *this* 的 struct 指標:

* [在個體之間協議互動行為的多種形式]({% post_url 2007-6-30-程式語言中的介面，在個體之間協議互動行為的多種形式 %})
* [OpenSSL Library - BIO 概論]({% post_url 2011-8-8-OpenSSL Library - BIO 概論 %})

Python 保留了這個傳統。它定義方法的語法 `def method(self)` 就是是把其他 OOPL 編譯器的隱含行為寫在明處。例如:

```python

class MyClass:
    def __init__(self, s):
        self.content = s
    
    def __str__(self):
        return self.content

    def concat(self, s2):
        return self.__str__() + s2

s = MyClass('hello ')
print(s.concat('world'))
print(MyClass.concat('hello ', 'world'))

s.concat('1' , '2')
# TypeError: concat() takes 2 positional arguments but 3 were given

```

為什麼最後一行的錯誤訊息這麼奇怪？明明只放 2 個參數， Python 卻說我給了 3 個參數。

這不是 Python 算錯了，而是它把隱含的「操作對象」算進去了。最後一行在 Python 眼中實為 `MyClass.concat(s, '1', '2')`。

從程式語言的發展歷史中，我們知道這其實是一件很傳統的事。回頭看看 C# 關於這個語法的使用說明： [extension methods - C# 程式設計手冊](https://docs.microsoft.com/zh-tw/dotnet/csharp/programming-guide/classes-and-structs/extension-methods)。

<blockquote>
Extension methods enable you to "add" methods to existing types without creating a new derived type, recompiling, or otherwise modifying the original type. Extension methods are static methods, but they're called as if they were instance methods on the extended type.
</blockquote>

C# 在 LINQ 中大量運用這種技巧。

我自己寫的範例如下。project 內容在 [this-extension-methods](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/this-extension-methods)。

```csharp

using System;

namespace StringExt
{
    public static class MyString
    {
        //                          VVVV
        public static string concat(this string src1, string src2)
        {
            return src1 + src2;
        }
    }
}

namespace Example
{
    using StringExt; // 放在不同 namespace，所以要 using

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello ".concat("World!"));
            // C# 內建 string 類別並沒有 concat 這個方法。
            // 我從外面(MyString)掛一個上去。

            // 如果 concat 第一個參數宣告時沒有加上 this 修飾字。
            // 那呼叫時只能這樣寫:
            Console.WriteLine(MyString.concat("Hello ", "World!"));
        }
    }
}

```

C# 內建的 string 類別並沒有 concat 這個方法。這個方法是我定義在 MyClass 類別中的靜態方法。

在沒用 *this* 修飾字之前，我們只能按靜態方法的方式呼叫它，例如 `MyString.concat(a, b)` 。

但在第一個參數上加 *this* 修飾字後， C# 就會讓它看起來像一個實例方法，而可以寫成 `a.concat(b)` 。
從設計人員的角度看，就像是我把 MyString 裡的方法，外掛到 string 上面了。

具體來說， C# 編譯器的運作方式是從第一個參數有 *this* 修飾字的靜態方法中，找到符合型態簽章的靜態方法來用。
如果程式寫 `1.concat('xyz')` 那就會錯誤。因為 C# 編譯器找不到符合 `concat(this int)` 簽章的靜態方法。
