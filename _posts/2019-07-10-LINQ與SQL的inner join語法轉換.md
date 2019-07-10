---
title: LINQ 與 SQL 的 inner join 語法轉換
category: programming
tags: [c#,linq,sql]
lastupdated: 2019-07-10
---

我個人用 C# 撰寫資料庫存取程式時，習慣先用 SQL 敘述直接查詢資料庫，確認結果如我預期之後，再把這段 SQL 敘述在程式碼中寫成 LINQ 表達式。
而除錯或維護程式時，則反過來操作，把我覺得結果不如預期的 LINQ 表達式複製出來，改成 SQL 敘述去查資料庫。

這兩件事是我常常在做的，也就有些心得。LINQ 的 inner join 是不錯的範例。很常用，敘述有些長，但格式工整容易對應 SQL 。

<!--more-->

#### Inner Join

先看看兩段分別用 LINQ 和 SQL 寫的聯結查詢。這兩個查詢句是同義敘述，預期結果相同。

##### LINQ

```csharp
from pt in db.ProductionTickets
join pdName in db.ProductionNames on pt.Name equals pdName.Name 
    where pdName.IsValid == true
join ttj in db.TrolleyTicketJoin on pt.ID equals ttj.TicketID
join tp in db.TrolleyCurrentPlace on ttj.TrolleyID equals tp.ID
where tp.PlaceID == "101"
select (new
{
    tp.PlaceID,
    ttj.TrolleyID,
    pt.Name
})
```

##### SQL

```sql
select 
    tp.PlaceID, 
    ttj.TrolleyID, 
    pt.Name
from db.ProductionTickets as pt
join db.ProductionNames as pdName on pt.Name = pdName.Name
    where pdName.IsValid = 'TRUE'
join db.TrolleyTicketJoin as ttj on pt.ID = ttj.TicketID
join db.TrolleyCurrentPlace as tp on ttj.TrolleyID = tp.ID
where tp.PlaceID = '101'
```

接著將這兩段同義文字拆解說明。

#### 字串

在 SQL 中，謹記這句口訣：

<blockquote>
Single quotes are for Strings; Double quotes are for Database identifiers.
</blockquote>

LINQ 中的字串值，寫成 SQL 時要把雙引號改成單引號。

#### 迭代與別名 

可以把 LINQ 中的迭代敘述 (object in Objects) 視同 SQL 的資料項別名 (Table as alias) ，只是位置相反。
LINQ 迭代取出的單一元素名稱，成了 SQL 敘述的資料項別名。

LINQ 的 `pt in ProductionTickets` 相當於 SQL 的 `ProductionTickets as pt` 。其餘類推。

雖然在 SQL 敘述中，不是一定要用別名。但考慮到改寫成 LINQ 的事，就變必要的了。

#### where 與 join

SQL 搜尋條件運算子的 `=` ，在 LINQ 則分成 `where` 子句的 `==` 和 `join` 子句的 `equals` 兩個寫法。
LINQ 的用字差別在於 `join` 子句的 `equals` 並不是運算子，它和 `where` 都是函數。再細分， `where` 是方法， `equals` 是委派。

LINQ 的 `where` 方法接受一個 lambda 參數。在作為參數的 lambda 內，自然要用 C# 表達式的比較運算子。將 LINQ 語法擴展為 C# 一般語法時，如下所示。

```csharp
where tp.PlaceID == "101"

// =>

where(()=>{
    tp.PlaceID == "101"
})
```

看到這個擴展結果，也就知道 `where` 為何可以接受更複雜的比較條件。

`equals` 則是 `join` 方法的委派，負責比較兩個對象是否相等。C# 一般語法如下所示。

```csharp
join ttj in db.TrolleyTicketJoin on pt.ID equals ttj.TicketID

// 迭代用法大致如下

var results = new List<T>();
foreach (var pt in ProductionTickets) {
    // do something for pt...
    foreach (var ttj in TrolleyTicketJoin) {
        if (comparer.Equals(pt.ID, ttj.TicketID))
            resultSelector(pt, ttj, results)
    }
}
```

這也多少說明了為什麼 `equals` 左、右兩邊的對象不能對調。如果寫成 `ttj.TicketID equals pt.ID` 就變成在迭代 TrolleyTicketJoin 之前，你就想操作 ttj 了。

細節參考 [Enumerable.Join Method](https://docs.microsoft.com/zh-tw/dotnet/api/system.linq.enumerable.join?view=netcore-2.2) 。或是 [stack overflow 的解釋](https://stackoverflow.com/a/1123896)。