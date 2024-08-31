---
title: Debian系統的PHP Session生命期為何不到30分鐘
category: computer
tags: [debian,ubuntu,php]
lastupdated: 2024-08-24
---

我用 PHP 寫的 Web 網站採用 Session 記錄使用者登入狀態。
並希望保持登入狀態直到使用者主動登出或關閉瀏覽器。

網站主機已經按照 PHP 手冊 [PHP Manual:Runtime Configuration ](https://www.php.net/manual/en/session.configuration.php#ini.session.cookie-lifetime)，
將 session.cookie_lifetime 設為 0 了。
但使用者反應每次登入超過 30 分鐘後，就會變成未登入狀態。他們必須再次登入帳號。
而且只有在 Debian 系統運作的網站會出現這種情形。在 Windows 系統上跑的測試網站不會。

造成此情形的原因不在 PHP 組態，而是 Debian/Ubuntu 另有安排刪除逾期檔案的定期工作。

<!--more-->

在 Debian/Ubuntu 系統，有兩個影響 PHP Session 生命期的組態項目。

1. session.cookie_lifetime
--------------

Debian/Ubuntu 的 PHP 套件預設 session.cookie_lifetime 是 0，
意即存活到瀏覽器關閉為止。

所以這個項目基本上不用管。

2. session.gc_maxlifetime
--------------

Debian/Ubuntu 的 PHP 套件預設 session.gc_maxlifetime 是 1440，
即每 1440 秒 (24 分鐘) 進行垃圾收集。

這項設置原本不會顯著影響 Session 生命期。
但 Debian/Ubuntu 另外安排了定期工作 /etc/cron.d/php ，每 30 分鐘強制刪除逾期檔案。
這些檔案包含了 PHP 保存在服務端的 Session 資料。
就是這個工作，導致網站使用者幾乎每 30 分鐘就得登入一次。

/etc/cron.d/php 直接讀取 php.ini 的 session.gc_maxlifetime 決定逾期時間。

所以應修改延長 session.gc_maxlifetime 的時間。
例如 28800 (8 小時)。

PHP 組態文件 php.ini 的依工作模式，分成數個獨立的文件。
配合 Apache2 架站時，一般是 /etc/php/apache2/php.ini ；
配合 ngnix 架站時，一般是 /etc/php/fpm/php.ini 。

不建議取消 /etc/cron.d/php ，因為時間一久就會留下很多垃圾檔案。

大型網站建議自行管理 Session 資料。
相關作法請看手冊 
[PHP Manual: session_set_save_handler](https://www.php.net/manual/en/function.session-set-save-handler.php)。
