---
title: PHP2Sehll 安全漏洞與我知道的應對措施
category: programming
tags: [php,cve]
lastupdated: 2026-10-23
---

兩條 PHP 的 CVE 警示 - CVE-2026-109618 和 CVE-2026-109619 - 在 2026 年 10 月 21 日這天揭起一波網站資安風暴。風波大到日本首相發佈新聞呼籲網站管理者儘快處理，無數網站暫停運作。
目前，我們將之稱為「 [PHP2Shell](https://zh.wikipedia.org/wiki/PHP2Shell) 」事件。

我當天也發了推文，建議舊版 PHP 使用者如何 *暫時* 逃課，以免長時間關站。[推文連結](https://x.com/tw_rocksaying/status/2112893701584548162?s=20) 。

<!--more-->

#### 資料處理流程

為了說明 PHP2Shell 的影響範圍，先了解
用戶的 HTTP 請求送到 PHP 網站程式的流程。基本如下:

+ 第 1 步: HTTP Client (瀏覽器, wget, curl, 駭客工具等等) 送出資料封包到網站。
+ 第 2 步: 網站防火牆過濾封包。現在應該沒有公開網站在網路上裸奔了吧？
+ 第 3 步: Web server (如 Apache httpd, nginx) 接收資料，根據 URL 轉發給 PHP 解譯器。
+ 第 4 步: PHP 解譯器分析資料封包，拆解出表單資料、請求路徑等內容，如 $_SERVER, $_POST, $_GET 等等。
+ 第 5 步: PHP 解譯器按請求路徑，載入 PHP 程式碼解譯執行。

PHP2Shell 利用 PHP 解譯器在第 4 步處理 *multipart/form-data* 資料封包的 BUG ，實現遠端指令執行的攻擊行為。主要 BUG 藏在 [Session Upload Progress](https://www.php.net/manual/en/session.upload-progress.php) 這一段。

對 PHP 網站程式開發者來說，這是個好消息。因為它不是利用網站程式碼的 BUG ，所以網站程式開發者不用背這個鍋。
但壞消息是，只要你的網站系統後面跟著 PHP ，就有安全漏洞。
而 PHP 網站的普及率很高，於是形成了大規模關站維護的風暴。

除了更新 PHP 版本，目前最可靠的堵漏措施，就是從上列第 2 步的防火牆與第 3 步的 Web server 設置著手，直接過濾掉有危險的資料封包，不讓它轉發給 PHP 解譯器。
於是壓力轉到了防火牆與 Web server 管理者身上。
