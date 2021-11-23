---
title: CommonGateway HTML公用函數與預設首頁
category: programming
tags: [php,網站設計,common-gateway]
lastupdated: 2021-08-23
---

[CommonGateway]({% post_url 2013-1-29-CommonGateway 介紹 %}) 是我多年前設計的迷你框架。我最初用它實作 RESTful API 項目，並沒有放太多用於網頁設計的內容。最近兩年用它設計一些網站專案。為了方便工作，增加了兩項關於網頁設計的功能:

* HTML 公用函數
* 預設首頁控制項

<!--more-->

## HTML 公用函數

CommonGateway 這一年重構了一些程式碼，導入名稱空間 (namespace) 。規劃 cg\html 這一塊名稱空間作為網站設計公用函數的空間。這些函數主要用在 HTML 視圖 (.phtml)，目的是提供正確的資源 URL 。

* request_url($controller_path = false)
  取得基於 index.php 的控制項 URL 字串。
* home_url()
  取得首頁的URL。
* resource_url($path = false)
  取得網站指定資源的 URL (URL中不會包含 index.php)。
* stylesheet($srcs)
  CSS 文件的 HTML 載入代碼。可接受多個 css 檔案路徑。
* script($srcs)
  JavaScript 文件的 HTML 載入代碼。可接受多個 js 檔案路徑。

完整列表請看 CommonGateway 功能文件: [HTML 公用函數](https://github.com/shirock/common-gateway-framework/blob/main/doc/cg-html-functions.md)。

範例:

~~~html

<head>
<meta charset="utf-8">
<title>cg\html functions demo</title>

<?php
cg\html\stylesheet([
  'css/bootstrap.min.css',
  'css/theme/base.css',
  'css/theme/dark.css'
]);
?>
</head>

<body>
<div>
<img src="<?=cg\html\resource_url('images/logo.png')?>">
</div>

<p>goto: <a href="<?=cg\html\home_url()?>">home</a>.
</p>

<p>goto: <a href="<?=cg\html\request_url('profile')?>">profile</a>.
</p>

<?php
cg\html\script([
    'js/jquery-3.3.1.slim.min.js',
    'js/popper.min.js',
    'js/bootstrap.min.js'
    ]);
?>
</body>
</html>

~~~

假設 index.php 的 URL 是 http://your_host/myweb/index.php ，則上例視圖的實際產出內容如下:

~~~html

<head>
<meta charset="utf-8">
<title>cg\html functions demo</title>

<link rel="stylesheet" href="//your_host/myweb/css/bootstrap.min.css">
<link rel="stylesheet" href="//your_host/myweb/css/theme/base.css">
<link rel="stylesheet" href="//your_host/myweb/css/theme/dark.css">
</head>

<body>
<div>
<img src="//your_host/myweb/images/logo.png">
</div>

<p>goto: <a href="//your_host/myweb/index.php">home</a>.
</p>

<p>goto: <a href="//your_host/myweb/index.php/profile">profile</a>.
</p>

<script src="//your_host/myweb/js/jquery-3.3.1.slim.min.js"></script>
<script src="//your_host/myweb/js/popper.min.js"></script>
<script src="//your_host/myweb/js/bootstrap.min.js"></script>
</body>
</html>

~~~

## 預設首頁

CommonGateway 有兩種方式建立預設首頁。

1. 建立 views/index.phtml 。範例 [default-index-page](https://github.com/shirock/common-gateway-framework/tree/main/demo/default-index-page)。
2. 建立一個名為 Home 的控制項(controller): 定義 Home 類別，實作 index 方法。範例 [default-home-controller](https://github.com/shirock/common-gateway-framework/tree/main/demo/default-home-controller);

當使用者執行 CommonGateway 但沒有指定控制項時，若有 views/index.phtml 或 Home 控制項就會執行它。讓使用者不必輸入 your_site/index.php/home 這種 URL 。

如果你正利用 CommonGateway Framework 設計一組 RESTful API 服務，可以用第一種方式作 API 服務的索引頁。

當你用 CommonGateway Framework 設計一個網站時，建議用第二種方式建立你的網站首頁。此途徑可以使用 CommonGateway Framework 提供的所有資源。例如 @resource 、 @authorize 以及控制項的資源。

###### 相關文章

* [CommonGateway 介紹]({{ site.baseurl }}/archives/21318202.html)
* [CommonGateway 初步]({{ site.baseurl }}/archives/21320836.html)
* [CommonGateway 第二步 - JSON 的處理與資料上傳]({{ site.baseurl }}/archives/21334380.html)
* [CommonGateway 控制項動作函數回傳狀態碼的作法]({{ site.baseurl }}/archives/44121826.html)
* [CommonGateway Authorize 認證註記功能教學]({% post_url 2021-08-22-CommonGateway_authorize %})
* [CommonGateway HTML公用函數與預設首頁]({% post_url 2021-08-23-CommonGateway_HTML公用函數與預設首頁 %})
* [CommonGateway 的 View 類別，讓控制項指定自己要用的視圖]({% post_url 2021-11-23-CommonGateway_View %})
