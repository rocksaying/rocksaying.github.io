---
title: PostgreSQL 操作筆記，使用 pg_basebackup 的備份檔案快速還原資料庫系統
category: computer
tags: [postgresql,backup,restore]
lastupdated: 2024-09-25
---

pg_basebackup 是 PostgreSQL 提供的常規備份工具。

> pg_basebackup 用於對正在執行的 PostgreSQL 資料庫叢集進行基礎備份。採取這些措施不會影響資料庫的其他用戶端，並且可以用於時間點隨選還原，也可以用於日誌傳送或串流複寫備用伺服器的起點。
>
> pg_basebackup 製作資料庫叢集檔案的二進位副本，同時確保系統自動進入和退出備份模式。只能對整個資料庫叢集進行備份；無法備份單個資料庫或資料庫物件。
>
> [pg_basebackup - PostgreSQL 使用手冊](https://docs.postgresql.tw/v/13/reference/client-applications/pg_basebackup)

雖然使用手冊中說明了 pg_basebackup 的備份用法，但卻沒有具體說明如何還原。
我查到的網路資料，按照文中的指令實際操作後並不能復原。可說那些已經是過期文件，大約僅適用於 PostgreSQL 10 版之前。
本文說明的操作內容，則在 PostgreSQL 13 版及更新版本中實際操作過。

<!--more-->

### 準備工作

pg_basebackup 是為了快速還原營運中的資料庫系統而設計的備份工具。
它產生的備份檔案只能用於相同版本的 PostgreSQL 系統，不能用於資料庫系統升級或遷移。
如果你要升級 PostgreSQL 版本，又或者是遷移到別家資料庫系統，請用 pg_dump。

本文的操作環境是 Debian 12。Debian 12 設定 PostgreSQL 資料檔案的擁有者身份是 *postgres*。
所以操作 PostgreSQL 資料檔案時，需要切換使用者身份為 postgres。

首先查看 PostgreSQL 組態檔內容，確認資料儲放位置。
以 Debian 12 為例，組態檔路徑是 */etc/postgresql/15/main/postgresql.conf*，
組態項目 *data_directory* 就是資料儲放位置。預設為 */var/lib/postgresql/15/main*。
這個目錄的擁有者是 postgres, 屬性是 700 (xrw------)。

### 備份

本文備份工作是時間點隨選還原。固定時間備份資料，日後可選擇指定時間點還原。

假設我每天都會建立一個備份。備份檔案儲放在另一顆資料備份磁碟。此資料備份磁碟掛載在 /mnt。
(透過 sshfs 掛載遠端 NAS 的磁碟也行)

備份指令範例如下：

```term
sudo su postgres
cd /var/lib/postgresql/15
pg_basebackup -v -P -Ft -Z5 -D /mnt/postgresql/backup-$(date +%F)
```

此範例建立的目錄名稱會包含年月日。例如 backup-2024-09-25。

這個 pg_basebackup 指令同時備份了 WAL 資料。
所以在備份目錄內應該看到兩個壓縮檔。一是 base.tar.gz，二是 pg_wal.tar.gz。

### 還原

假設要用 2024 年 9 月 25 日建立的備份點還原資料庫系統。
那麼備份目錄是 /mnt/postgresql/backup-2024-09-25。
操作過程需要停止資料庫服務，並切換使用者身份為 postgres。

還原指令範例如下：

```term
# 先停止資料庫服務
sudo systemctl stop postgresql

# 切換操作者身份為 postgres
sudo su postgres

# 切換工作目錄
cd /var/lib/postgresql/15

# 先將目前的資料目錄改名
mv main main-old

# 建立空白的資料目錄，以便放置還原內容
# /var/lib/postgresql/15/main
mkdir main

# 解壓資料檔 (base.tar.gz) 到 /var/lib/postgresql/15/main
cd main
tar -xzvf /mnt/postgresql/backup-2024-09-25/base.tar.gz

# 解壓 WAL 檔 (pg_wal.tar.gz) 到 /var/lib/postgresql/15/main/pg_wal
cd pg_wal
tar -xzvf /mnt/postgresql/backup-2024-09-25/pg_wal.tar.gz

# 退出 postgres 身份，回到原本的操作者
exit

# 啟動資料庫服務
sudo systemctl start postgresql
```

這整個操作過程，通常在數分鐘內就可以完成。主要時間是耗在資料解壓。

如果想用絕對路徑操作 tar 解壓縮工作，寫法如下：

```term
tar --directory=/var/lib/postgresql/15/main -xzvf /mnt/postgresql/backup-2024-09-25/base.tar.gz
tar --directory=/var/lib/postgresql/15/main/pg_wal -xzvf /mnt/postgresql/backup-2024-09-25/pg_wal.tar.gz
```

### 經驗談

pg_basebackup 沒有對應的還原工具。需要自己操作壓縮檔管理工具。
通常寫指令稿時，會用最基礎的 tar 工具。
當然你也可以用其他的壓縮檔管理工具，只要它可以處理 tar 和 gzip 格式內容。

整個還原工作的操作概念，其實就是把檔案解壓放在正確的位置。
但是 PostgreSQL 使用手冊上沒有說明該放在哪裡。
而且，舊版 PostgreSQL 的檔案存放結構顯然和現在不一樣，故以前的操作方法就過期了。
我也是結合前人經驗再加上實際嘗試錯誤後，才確定該怎麼做。

pg_basebackup 的使用情境除了本文提到的時間點隨選還原，還有複寫營運伺服器的狀態到備用伺服器的高可用性（HA）的配置，又稱熱備份（warm standby）或日誌轉送(Log-Shipping)。
這部份的配置變化就很多了。請各位看 [日誌轉送備用伺服器 - PostgreSQL使用手冊](https://docs.postgresql.tw/v/13/server-administration/high-availability-load-balancing-and-replication/log-shipping-standby-servers)，自行參詳領悟。
