---
title: PHP框架 - CommonGateway - 用 URL 重寫規則隱藏 CGF
category: programming
tags: [php,restful,common-gateway]
lastupdated: 2024-11-30
---

Common Gateway Framework (CGF) 設計的所有服務 (RESTful API 或網頁) 都是透過主程式 *index.php*  轉發使用者的請求給控制項。
因此正常的 URL 總是會包含 index.php。

但有些客戶並不希望在 URL 中看到 index.php 這個字眼。
他們可能想要改善 SEO 的搜尋結果，又或是不想暴露低層的運作軟體。
我們可以利用 URL 改寫規則實現此目的。

<div class="note">
有些功能龐大的框架會內建一套 URL 規則，例如 Laravel。
這類框架請照它們的規則來做。
</div>

<!--more-->

修改主程式檔名
--------------

改變 URL 結構形式最簡單的方式是修改主程式檔名。

CGF 的 URL 結構形式正常如下:

```text
https://your_server/api/index.php/Item
https://your_server/shop/index.php/Item/123
```

你可以按你的喜好修改 index.php 檔名，這不會影響 CGF 運作。
例如你可以改名為 router.php，或者是 main.php。此時你的服務 URL 形式就變成:

```text
https://your_server/api/router.php/Item
https://your_server/shop/main.php/Item/123
```

若想更進一步隱藏 CGF 主程式，不讓使用者看到 URL 內容中有 index.php 或 main.php。
則需要借助網站服務程式的 URL 重寫規則 (rewrite rule)。

URL 重寫規則
------------

這個方法不僅適用 CGF，也適用其他框架。
例如 CodeIgniter 框架也用 URL 重寫規則移除 URL 中的 index.php: [CodeIgniter URLs](https://codeigniter.com/user_guide/general/urls.html#urls-remove-index-php-apache)。

常見的網站服務程式，如 Apache, Nginx 甚至 IIS，都提供了 URL 重寫規則 (rewrite rule) 功能。
但每家的用法不一樣。底下以 Apache 2.4 為例說明 URL 重寫規則。

舉例來說，你想將 RESTful API 的 URL 結構變成 https://your_server/api/Item 。

你可以選擇將 URL 重寫規則寫在 .htaccess。重寫規則如下:

```text
# .htaccess
RewriteEngine on

RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule "(.*)" "index.php/$1" [PT,L]
```

.htaccess 應該放在 CGF 程式根目錄，和 index.php 在一起。
而且你的 *Directory* 組態至少要設 *AllowOverride FileInfo* 才能使 .htaccess 生效。

這個 URL 重寫規則使用 PT (Pass through) 旗標， URL 只會在伺服器內部轉換。使用者端不會改變。

.htaccess 用法僅應用於軟體開發與測試階段。
基於執行效率的考量，正式運作階段建議將 URL 重寫規則寫在 *VirtualHost* 或 *Directory* 區段中。 
只是寫在 *VirtualHost* 或 *Directory* 區段時，要再考慮目錄位置。
例如: 

```text
<Directory>
    RewriteEngine on

    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule "^api/(.*)" "api/index.php/$1" [PT,L]
</Directory>
```

若你的程式只提供 RESTful API，那你做到這一步就夠了。
但若你是用 CGF 設計網站，那你還需要在 Apache 組態中加入環境變數 *CGF_REQUEST_ROOT*，指示 URL 重寫規則的根點 (root)。

CGF_REQUEST_ROOT
----------------

當你用 CGF 設計網站時，勢必要在網頁中提供連結指向不同功能網頁(控制項)。
CGF 為此提供了函數 `\cg\html\request_url()` 產生控制項的正確 URL。
但這個函數是按正常規則產生 URL。也就是 https://your_server/api/index.php/Item 或 https://your_server/shop/main.php/Item/123 這種形式。

當你使用 URL 重寫規則後，就會分出使用者看到的外顯 URL 和伺服器內部轉換後的真實 URL。
你必須用環境變數 *CGF_REQUEST_ROOT* 讓 `request_url()` 知道外顯 URL 的根點，它才能產生控制項的外顯 URL。
未指定 CGF_REQUEST_ROOT 時，`cg\request_url()` 將產生真實 URL，而不是你想要的。

如果你的外顯 URL 結構像是 https://your_server/shop/Item/123 ，則應設 CGF_REQUEST_ROOT 為 */shop* 。

Apache2:

```text
SetEnv CGF_REQUEST_ROOT /shop
```

Nginx:

```text
fastcgi_param CGF_REQUEST_ROOT /shop
```

設計說明
--------

CGF 的設計原則是「零組態」。我希望能夠從現有資源中找出 URL 的 root。

使用 apache2 時，符合 rewrite 規則的結果會加上 $_SERVER['REDIRECT_URL'] 項目。
但 nginx 時沒這項目。
查了 CGI 規範，並沒有 REDIRECT_URL。所以這是 Apache2 特有項目。

轉念一想，既然 rewrite 規則必須寫在 web server 的組態中，
那乾脆順便在 web server 組態裡加一個自定環境變數 CGF_REQUEST_ROOT，指定 URL 的 root。
PHP 執行時會將環境變數的內容放入 $_SERVER，那麼 CGF 就可以從外部得到這個參數。
至少不用修改 index.php 本身。

###### 相關文章

* [CommonGateway 功能索引: URL rewrite](https://github.com/shirock/common-gateway-framework/blob/main/doc/url-rewrite.md)
* [CommonGateway 初步]({{ site.baseurl }}/archives/21320836.html)
* [CommonGateway HTML公用函數與預設首頁]({% post_url 2021-08-23-CommonGateway_HTML公用函數與預設首頁 %})
