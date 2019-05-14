---
title: .NET Core 筆記 - Anonymous Type List
category: programming
tags: [".net core","C#","csharp","型別"]
lastupdated: 2019-05-13
---

如何配置一個匿名型別串列。

首先，複習下列定義已知型別串列的語法。

```csharp
int[] int_list1 = new int[] {1, 3};

var int_list2 = new int[] {1, 3};

var int_list3 = new [] {1, 3};
```

第一個例子是明確宣告等號兩邊型別的語法，也是最傳統的語法。

第二個例子引入型別推斷語法，等號右邊明確宣告此處將配置一個整數型別的陣列。所以明眼即可推斷左值之型別必為整數型別陣列。

第三個例子則更進一步，連等號右邊也不明確宣告資料型別。而讓 C# 編譯器先從陣列的資料內容推斷右邊的陣列型別，再依此推斷左邊的型別。這語法要求陣列的所有元素之型別皆可互相隱含轉換，編譯器再從中選出一個不會損失資料精度的型別。例如 `new [] {1, 3, 5.5}` 將推斷為 `double[]` 而非 `int[]` 以保證 5.5 不會變成 5 。若有一個元素的型別不合群，那編譯器就會拋出無法決定最適型別的錯誤。

<!--more-->

當有兩個或多個匿名型別之欄位型別與順序相同時，編譯器內部會將它們視為同一型別。因此，當多個匿名型別變數的宣告內容相同時，也允許將它們放在一個串列中，如此就得到一個匿名型別串列。如下例：

```csharp
using System;
using System.Linq;

var data1 = new {
    name = "a", 
    latitude = 0.0, 
    longitude = 0.0
};

var data2 = new {
    name = "b", 
    latitude = 1.0, 
    longitude = 1.0
};

var data_list = new [] {data1, data2}.ToList();
```

1. 如果我們在配置匿名串列時，還不知道各元素的具體值，那麼我們需要先定義一個初始元素。這個初始元素只是為了讓編譯器推斷型別。
2. 匿名型別實體的欄位皆是唯讀，因此提供編譯器推斷型別的初始元素無法重用。實際使用時，配置串列後就會移除。
3. 後續加入匿名型別串列的元素，也要保持相同的欄位順序。

```csharp
using System;
using System.Linq;

var data_list = new [] { 
    new {
        name = "", 
        latitude = 0.0, 
        longitude = 0.0
    }
}.ToList();
data_list.RemoveAt(0);

for (var i = 0; i < 10; ++i) {
    data_list.Add(new {
        name = $"pos {i}",
        latitude = i,
        longitude = i
    });
}
```

如果是熟悉 PHP, Python, JavaScript 等動態型別語言的使用者，應該會覺得這樣的語法有些彆扭。這算是一個動態型別語言和靜態型別語言之語法差異的例子。寫這些彆扭的語法，是為了方便編譯器判斷型別。

參考:

* [Anonymous Types (C# Programming Guide)](https://docs.microsoft.com/zh-tw/dotnet/csharp/programming-guide/classes-and-structs/anonymous-types)
