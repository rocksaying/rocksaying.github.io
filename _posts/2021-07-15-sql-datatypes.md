---
title: SQL Datatypes 相容性整理
category: programming
tags: ["sqlite","postgresql","sql server", mariadb", "mysql"]
lastupdated: 2021-07-15
---

# SQL Datatypes 相容性整理

我只整理數值、序號、文字和日期這四種類型。至於 BINARY, BIT, MONEY, 地理位置, XML 等通用性太低的類型，則不使用。

下列是個人使用的資料庫系統，按個人喜好程度排列：

* SQLite 3 (sqlite)
* PostgreSQL 9.6 或更新版本 (pgsql)
* SQL Server 2019 或更新版本 (mssql)
* MariaDB 10.3 或更新版本 (mysql)

<!--more-->

## 數值

高相容性。

|        | INTEGER | SMALLINT | BIGINT | NUMERIC | REAL |FLOAT |
|--------|---------|----------|--------|---------|------|------|
| sqlite |   yes   |   yes    |  yes   |   yes   |double|double|
| pgsql  |   yes   |   yes    |  yes   |   yes   |single| yes  |
| mssql  |   yes   |   yes    |  yes   |   yes   |single| yes  |
| mysql  |   yes   |   yes    |  yes   |   yes   |double| yes  |

### INTEGER, INT

INTEGER 和 INT 是同義字。精準的整數數值。

INTEGER 一般使用 4 bytes 儲存容量，有效數值介於 -2147483648 到 2147483647 之間。
超過此區間的整數字面，通常會被 DBMS 轉型為 NUMERIC 型態，而不是 INTEGER 型態。

SAMLLINT 使用 2 bytes 儲存容量； BIGINT 使用 8 bytes 儲存容量。

* sqlite 依數值自動調整 INTEGER 型態的儲存容量，介於 1 ~ 8 bytes 間。

### NUMERIC, DECIMAL

NUMERIC 和 DECIMAL 是同義字。適用於帶小數點的精準數值，或比 INTEGER 更大的整數。

NUMERIC/DECIMAL 可用引數:

* precision 包含小數點左右兩側數目的有效位數。每家 DBMS 的最大範圍不同。
* scale 小數位數。

```sql

NUMERIC(precision, scale)

-- 省略小數位數。SQL 標準預設是 0 。
NUMERIC(precision)

-- 使用此 DBMS 的最大有效位數。
NUMERIC

```

* pgsql 省略 scale 引數時，預設為小數位數的上限，而不是 0 。

### REAL, FLOAT

REAL 和 FLOAT 用於儲存浮點近似數值。兩者不是同義字。差別在 REAL 沒有引數；而 FLOAT 接受一個引數，用於指定有效位數。

REAL 按 SQL 標準是單精度浮點數(single-precision)。有效數值介於 - 3.40E + 38 到 -1.18E - 38、0 及 1.18E - 38 到 3.40E + 38 。

FLOAT 可用引數:

* precision 有效位數。範圍是 1 到 53 。SQL 標準預設為 53 。

按照 SQL 標準，FLOAT(24) 佔 4 bytes 儲存容量，與 REAL 同義。 FLOAT(53) 佔 8 bytes 儲存容量，與 *DOUBLE PRECISION* 同義。

```sql

-- 有效位數。範圍是 1 到 53 。
FLOAT(precision)

-- 省略有效位數。與 DOUBLE PRECISION 同義。
FLOAT

```

* sqlite 的 REAL 佔 8 bytes 儲存容量，與 FLOAT(53)/DOUBLE PRECISION 同義。
* mysql 的 REAL 與 FLOAT(53) 同義。設定 sql_mode 為 ansi 時，REAL 才與 FLOAT(24) 同義。
* mysql 的 FLOAT 省略引數時，預設為 FLOAT(24) ，而不是 FLOAT(53) 。

## 序號

不具相容性。

sqlite 自動建立為表格中每一筆資料行建立 rowid/oid/\_rowid\_ ，除非表格宣告不用 (WITHOUT ROWID)。
若表格欄位的型態是 *INTEGER PRIMARY KEY* ，則此欄位自動代替 rowid/oid 成為資料行序號。
注意，sqlite 不會將 *INT PRIMARY KEY* 視為 *INTEGER PRIMARY KEY* 。

```sql

-- sqlite
CREATE TABLE s (v INTEGER);
INSERT INTO s VALUES (11), (22);
SELECT rowid,* FROM s;

CREATE TABLE s2 (id INTEGER PRIMARY KEY, v INTEGER);
INSERT INTO s2 (v) VALUES (33), (44);
SELECT * FROM s2;

```

pgsql 使用 SERIAL 資料型態產生自動序號(4 bytes)。需要更大範圍的序號時，可用 BIGSERIAL 資料型態 (8 bytes)。

mssql 使用 IDENTITY 資料型態屬性產生序號，通常配合 INTEGER 或 BIGINT 資料型態。例如:

```sql

-- mssql
CREATE TABLE t1 (id INTEGER IDENTITY);

```

mysql 使用 AUTO_INCREMENT 資料型態屬性產生序號。它也提供 SERIAL 資料型態，等同於 *BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE*。例如:

```sql

-- mysql
CREATE TABLE t1 (id SERIAL);
-- 等於
CREATE TABLE t1 (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE);

```

## 字元、文字

高相容性。

|        | CHAR | VARCHAR | TEXT |
|--------|------|---------|------|
| sqlite | yes  |   yes   | yes  |
| pgsql  | yes  |   yes   | yes  |
| mssql  | yes  |   yes   | note |
| mysql  | yes  |   yes   | yes  |

CHAR 和 CHARACTER 是同義字。VARCHAR 和 CHARACTER VARYING 是同義字。

CHAR 和 VARCHAR 都接受最大長度的引數，省略時為 1。不同 DBMS 的最大儲存容量 (最大長度限制) 並不相同。

按現今 DBMS 普遍支援 UTF-8 編碼的情況，似乎沒有必要使用 NCHAR/NVARCHAR 。

### sqlite 的文字

sqlite 忽視長度引數，也就是它沒有長度限制。所以 VARCHAR  等於 TEXT 。

### pgsql 的文字

* 最大可用儲存容量大約為 1 GB。
* 這三種型別之間並沒有效能差異。事實上，由於額外的儲存成本，CHARACTER(n) 通常是三者中最慢的。在大多數情況下，應使用 TEXT 或 CHARACTER VARYING。

### mssql 的文字

* VARCHAR 最大長度為 8000 。超過此長度則應指定 VARCHAR(max) 。
* 未來版本計劃移除 TEXT 型態，改用 VARCHAR (max) 取代。
* SQL Server 2019 起，CHAR/VARCHAR  可指定 UTF-8 encoding 。

### mysql 的文字

* CHAR 最長 255 。
* VARCHAR 最大儲存容量 64KB ，所以用 UTF-8 編碼時，可指定的最大字元長度小於 21844。超過此限制時，應改用 MEDIUMTEXT。
* TEXT 最大儲存容量和 VARCHAR  一樣。早先的版本不能對 TEXT 型態的欄位建立全文索引。

## 日期、時間

低相容性。

|        | DATE | TIME | TIMESTAMP | DATETIME | DATETIME2 |
|--------|------|------|-----------|----------|-----------|
| sqlite | text | text |   text    |   text   |   text    |
| pgsql  | yes  | yes  |   yes     |    no    |    no     |
| mssql  | yes  | yes  |    no     |    no    |   yes     |
| mysql  | yes  | yes  |   note    |   yes    |    no     |

日期和時間的型態與定義在 DBMS 差異很大。但所有 DBMS 都承認 ISO-8601 的表達格式。如下列所示：

* 日期: yyyy-mm-dd 。例如 2021-07-14 (西元2021年7月14日)。
* 時間: hh:mm:ss\[.fff\] 。例如 01:23:45 (1時23分45秒) 或 01:23:45.678 (1時23分45秒又678毫秒)。
* 時區: 在時間後加上正負時數。例如台北時間 +08:00 。
* 日期和時間: *dateTtime* ，'T' 是分隔字元。例如 2021-07-14T01:23:45 。有些 DBMS 接受用空格分隔日期和時間。

如果你不打算讓 DBMS 進行日期時間運算 (例如搜尋自某日起一週的資料) ，可以考慮用 CHAR(n) 或 TEXT 儲存日期和時間。
sqlite 就是這麼做的。

```sql

-- pgsql
CREATE TABLE dt (d DATE, t TIME, dt TIMESTAMP);

INSERT INTO dt VALUES (
    '2021-07-14', 
    '01:23:45.678', 
    '2021-07-14T01:23:45');

```

### sqlite 的日期與時間

sqlite 接受 DATE, DATETIME 等型態名稱，但沒有對應的儲存類別。實務上是用 TEXT 或 INTEGER 儲存，再用它內建的日期與時間函數轉換。

### DATE, TIME

DATE 儲存日期，TIME 儲存時間。一般不包含時區。

### DATETIME, TIMESTAMP

當你想在一個欄位中同時儲存日期和時間，各 DBMS 給的資料型態名稱都不一樣。

pgsql 是 TIMESTAMP ，mssql 是 DATETIME2 ，mysql 則是 DATETIME 。
mysql 有 TIMESTAMP 型態，但這是自動產生資料，不可修改。

## 參考來源

* SQLite: [Datatypes In SQLite Version 3](https://www.sqlite.org/datatype3.html)
* PostgreSQL: [Chapter 8. Data Types](https://www.postgresql.org/docs/current/datatype.html)
* SQL Server: [T-SQL 參考](https://docs.microsoft.com/zh-tw/sql/t-sql/language-reference)
* MariaDB: [Data Types in MariaDB](https://mariadb.com/kb/en/data-types/)
