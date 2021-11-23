---
title: CommonGateway 的 View 類別，讓控制項指定自己要用的視圖
category: programming
tags: [php,restful,common-gateway]
lastupdated: 2021-11-23
---

CommonGateway 在 cg namespace 內定義了一個 View 類別 (cg\View)。

使用 cg\View 類別，讓控制項方法自行指定視圖，而不是由 CommonGateway Framework 決定視圖，減少重複的視圖文件。

<!--more-->

[CommonGateway Framework]({% post_url 2013-1-29-CommonGateway 介紹 %}) 預設規則是按照控制項方法名稱載入同名視圖。
例如調用 App1.index() 控制項方法之後，默認載入 views/App1/index 視圖。

但在網站設計的場合，這可能會產生很多重複內容的視圖文件。
舉例來說，你的網站有五個控制項提供了表單編輯頁面，這五個表單編輯頁都需要一個用於顯示表單儲存結果的視圖。
所以按照 CommonGateway Framework 的預設視圖規則，你將要準備五個視圖文件，如下:

* views/Form1/save.phtml
* views/Form2/save.phtml
* views/Form3/save.phtml
* views/Form4/save.phtml
* views/Form5/save.phtml

這五個視圖可能內容還一樣，只是顯示儲存成功或失敗的訊息。

在 RESTful API 的場合，並不需要準備大量的視圖。回傳狀態碼或是預設的 `json_encode()` 就足以表達不同結果。
但在網站設計的場合， CommonGateway Framework 的視圖規則會產生大量重複內容的視圖文件。
為了減少重複視圖的情形，我增加了一個視圖規則:
*若控制項方法回傳值為 cg\View 實體 (instance of cg\View class)，則根據 View 實體的 viewName 屬性載入指定的視圖。*

此方式讓不同的控制項方法共用同一個視圖，減少重複的視圖文件。例如不同的控制項共用同一個錯誤訊息視圖。

cg\View 的建構方法有兩個參數:

* string $view_name
  必要參數。指定視圖名稱。注意，視圖名稱不包含副檔名。
* var $model
  選擇性參數。傳給視圖的 Model 內容。若省略時，表示控制項本身就是 Model 。

完整使用範例: [demo/web-cg-view](https://github.com/shirock/common-gateway-framework/tree/main/demo/web-cg-view)

範例1，回傳 View 實例，指定使用 Common/ok 視圖，並將資料內容作為建構參數 model 傳給視圖。

```php

<?php
class App1
{
    function index()
    {
        $model = [
            'title' => 'App1',
            'message' => 'Hello'
        ];

        // 這是載入默認的 views/App1/index.phtml 處理 $model
        // return $model;

        // 回傳 cg\View 實例，必要建構參數是視圖名稱。
        // 載入 views/Common/ok.phtml 視圖
        return new cg\View('Common/ok', $model);
    }
}
?>

```

範例2，回傳 View 實例，指定使用 Common/ok 視圖。控制項本身就是 Model 。

```php

<?php
class App2
{
    function index()
    {
        $this->title = 'App2';
        $this->message = '另一個app的索引頁面訊息';

        // 這是載入默認的 views/App2/index.phtml 處理本控制項
        // return;

        // 回傳 cg\View 實例，必要建構參數是視圖名稱。
        // 載入 views/Common/ok.phtml 視圖，model 就是本控制項
        return new cg\View('Common/ok');
    }
}
?>

```

###### 相關文章

* [CommonGateway 介紹]({{ site.baseurl }}/archives/21318202.html)
* [CommonGateway 初步]({{ site.baseurl }}/archives/21320836.html)
* [CommonGateway 第二步 - JSON 的處理與資料上傳]({{ site.baseurl }}/archives/21334380.html)
* [CommonGateway 控制項動作函數回傳狀態碼的作法]({{ site.baseurl }}/archives/44121826.html)
* [CommonGateway Authorize 認證註記功能教學]({% post_url 2021-08-22-CommonGateway_authorize %})
* [CommonGateway HTML公用函數與預設首頁]({% post_url 2021-08-23-CommonGateway_HTML公用函數與預設首頁 %})
* [CommonGateway 的 View 類別，讓控制項指定自己要用的視圖]({% post_url 2021-11-23-CommonGateway_View %})
