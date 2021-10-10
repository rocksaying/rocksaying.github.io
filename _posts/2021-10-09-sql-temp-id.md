---
title: SQL 與 ID 欄位的處理策略
category: programming
tags: [sql,php,serial,identity]
lastupdated: 2021-10-09
---

我們設計資料庫應用時，都會遇到新增資料後產生一個識別代號(ID)的設計需求。但遺憾的是， SQL Standard 並沒有定義任何產生識別代號的型態或函數。但這種需求實在普遍，於是各種資料庫系統都發展了自己的一套做法。

我在「[SQL Datatypes 相容性整理]({% post_url 2021-07-15-sql-datatypes %})」一文中，整理了 SQL Server, PostgreSQL, MySQL, SQLite 四種資料庫各自產生識別代號的方法。這種各家不相容的狀況，使得識別代號這種普遍的設計需求，存在可攜性陷阱。

<!--more-->

首先強調一件事。 SQL Standard 沒有定義識別代號的型態或函數並不是設計缺失。因為 SQL Standard 從資料可靠性出發，傾向於 *「在插入資料列前，你就要知道識別代號」* 的設計方式。簡單地說，在插入資料列前，你就要自己算出一個唯一的 id  ，並用這個 id 插入新資料列。

多年前，我就在「[新增資料時自動產生識別代號的一些方法]({% post_url 2008-6-24-新增資料時自動產生識別代號的一些方法 %})」說過這件事。而且我每次教育新人時，都要說一次。年年如此。

舉個例子來說，我有一張表單要儲存。表單資料會存入兩個表格， table1 和 table2。這兩個表格以 deal_id 建立關聯性。我先在 table1 新增一個資料列，而在 table2 新增的資料列要關聯到 table1 新增的這一筆資料列。

### 策略1:插入時自動產生id

假設我的 deal_id 定義為 serial 資料型態，採用插入資料列時自動產生 id 的作法。以 PHP 搭 PostgreSQL 為例，其操作如下:

```php

$pdo->beginTransaction();

$stat = $pdo->prepare('INSERT INTO table1 (name) VALUES (?)');

if ($stat->execute(['record1'])) {

    $stat = $pdo->prepare('SELECT currval(pg_get_serial_sequence(?, ?))');
    $stat->execute(['table1', 'deal_id']);
    $row = $stat->fetchObject();
    $id = $row->currval;

    $stat = $pdo->prepare('INSERT INTO table2 (deal_id, qty) VALUES (?, ?)');
    $stat->execute([$id, 11]);
}

$pdo->commit();

```

為了避免插入 table2 資料列之前，又有另一個插入 table1 的工作改變了 deal_id 最新的序號值，所以必須用 `beginTransaction() ... commit()` 把兩個插入動作打包成一個交易事務。

你不用 `beginTransaction() ... commit()` 鎖住資料庫，那麼操作過程中查詢的 deal_id 最新序號值就可能被其他工作改變，結果不可靠。但用了 `beginTransaction()` 又會犧牲資料庫的執行效率。所以 SQL Standard 不喜歡這種作法。

### 策略2:插入前先取得id

再來看看插入之前就先算好 id 的作法。

假設我的 deal_id 改成 character(8) 資料型態，用的是插入資料列之前就產生 id 的作法。而產生 id 的方法來自我寫的 [TempId.php](https://github.com/shirock/rocksources/blob/master/php/lib/TempId.php) 。那麼操作方式變化如下:

```php

require 'TempId.php';

$id = TempId::make(); // 先算出 id

$stat = $pdo->prepare('INSERT INTO table1 (deal_id, name) VALUES (?, ?)');

if ($stat->execute([$id, 'record1'])) {
    $stat = $pdo->prepare('INSERT INTO table2 (deal_id, qty) VALUES (?, ?)');
    $stat->execute([$id, 11]);
}

```

瞧瞧，對資料庫系統來說，這個操作簡單多了。完全都用標準語法，而且即可靠又有效率。只是應用軟體設計者就麻煩了，因為他得要弄出一個像 TempId 的東西。但 SQL Standard 就是認為產生識別代號(id)的工作應該是應用軟體設計者自己決定，而不該由資料庫系統承擔。

### 關於 TempId

我的 [TempId.php](https://github.com/shirock/rocksources/blob/master/php/lib/TempId.php) ，基礎按時序產生，包含年、月、日、時、分、秒、毫秒資訊。再用60進位法把時序資訊壓縮成 8 個字元長度的字串。並用檔案鎖產生時間間隔，避免同時有兩個人取得相同的 TempId 。

我刻意把 TempId 壓到 8 bytes 長度，這樣它的儲存空間就和 32 位元組 integer 一樣了。一般資料庫的自動序號型態，例如 PostgreSQL 的 serial ，所需儲存空間也是 8 bytes 。雖然字串為鍵值的索引效率不如整數鍵值，但至少不會浪費空間。

###### 相關文章

* [新增資料時自動產生識別代號的一些方法]({% post_url 2008-6-24-新增資料時自動產生識別代號的一些方法 %})
* [SQL Datatypes 相容性整理]({% post_url 2021-07-15-sql-datatypes %})
