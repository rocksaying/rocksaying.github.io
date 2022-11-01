---
title: SQL 更新欄位回傳更新之值
category: programming
tags: [sql,postgresql,sql_server,php]
lastupdated: 2022-04-30
---

標準的 SQL UPDATE 敘述只回傳受到影響的資料筆數。
如果更新敘述是 `UPDATE table SET n = n + 1` 這種更新動作，你得要再下一個 SELECT 敘述撈出新的資料結果。

但是各家資料庫系統通常有自已獨特的擴充語法，可讓 UPDATE 敘述直接回傳更新後的資料結果。
本文只說明 PostgreSQL 和 MS SQL Server 兩家的更新欄位並回傳資料結果的擴充語法。

<!--more-->

本文先建立一個示範用的表格，其結構如下:

```sql

CREATE TABLE myid
(
    id1 INTEGER
);
INSERT INTO myid VALUES (1);

```

### PostgreSQL

#### 回傳更新前的值

這個要求可以用 WITH 子查詢做到。但不是每家資料庫系統都能把 UPDATE 放在 WITH 子查詢裡。

例如下列敘述， id1 值原為 1 。執行後，id1 值更新為 2 ，而回傳查詢結果為 1 。

```sql

WITH t AS (UPDATE myid SET id1 = id1 + 1)
SELECT id1 FROM myid;

```

從敘述的動作順序上，大家可能會認為 SELECT 會得到更新後的結果。
其實不然，這要從交易機制解釋。
PostgreSQL 預設的交易機制是 [READ COMMITTED](https://www.postgresql.org/docs/10/sql-set-transaction.html) 。

<blockquote>

A statement can only see rows committed before it began. This is the default.

</blockquote>

它的意思是說在此範例的交易中，雖然會先做子查詢 UPDATE ，但因為交易還沒結束，所以 SELECT 只能看到更新前的狀態。
不然換另一種容易理解的說法，這敘述是先 SELECT 目前狀態，然後才做子查詢的 UPDATE 。

所以 `select id1 from myid` 查詢取得的內容是 `update myid` 更新前的值。

#### 回傳更新後的值

PostgreSQL 的 UPDATE 敘述加上 `RETURNING` 子句就能回傳更新後的結果。
詳情請見 [PostgreSQL docs: UPDATE](https://www.postgresql.org/docs/10/sql-update.html)。

例如下列敘述， id1 值原為 2 。執行後，id1 值更新為 3 ，而回傳查詢結果為 3 。

```sql

UPDATE myid SET id1 = id1 +1
    RETURNING myid.id1;

```

### MS SQL Server

MS SQL Server 的 T-SQL 語法不能像 PostgreSQL 那樣在 WITH 子查詢中使用 UPDATE 敘述；它的 UPDATE 語法也不提供 RETURNING 。
T-SQL 對應 PostgreSQL RETURNING 的等義語法是 `OUTPUT` ，並且搭配前置詞 `deleted` 與 `inserted` 。
`deleted` 代表更新前的內容，`inserted` 代表更新後的內容。
詳情請見[T-SQL UPDATE - 擷取 UPDATE 陳述式的結果](https://docs.microsoft.com/zh-tw/sql/t-sql/queries/update-transact-sql?view=sql-server-ver15#CaptureResults)。

例如 myid.id1 之值原為 1 。則下列敘述將會回傳兩個不同狀態欄位的 id1 ，第一個表示更新前，第二個表示更新後。

```sql

UPDATE myid SET id1 = id1 +1
    OUTPUT deleted.id1, inserted.id1;

```

上列敘述回傳兩個值 (1, 2)。第一個是更新前的 id1 值，第二個是更新後的 id1 值。

當然也可以只回傳其中一個狀態。例如下列敘述只回傳更新後的值:

```sql

UPDATE myid SET id1 = id1 +1
    OUTPUT inserted.id1;

```

### PHP 使用範例

本文的 UPDATE 敘述用法應用在程式語言內，也需要改變相對應的呼叫方法。

以 PHP 為例，一般的 UPDATE 敘述只回傳受影響的筆數，而不回傳資料結果，所以我們用 `exec()` 方法。
但本文的 UPDATE 敘述會回傳資料結果，所以和 SELECT 敘述一樣用 `query()` 方法。

下列範例就是在 PHP 中使用 PostgreSQL 的 RETURNING 語句回傳更新後的資料結果。

```php

$pdo = new PDO($dbsource, $dbuser, $dbpassword);

$qs = 'UPDATE myid SET id1 = id1 +1 RETURNING myid.id1';

// 要取得 returning 結果，需用 PDO::query() 而不是 PDO::exec()。
$stat = $pdo->query($qs);
if ($stat === false) // 無此表格
    return false;

// returning myid.id1 結果只有一列一欄(id1)
$row = $stat->fetchObject();
print_r($row);
echo $row->id1;

```
