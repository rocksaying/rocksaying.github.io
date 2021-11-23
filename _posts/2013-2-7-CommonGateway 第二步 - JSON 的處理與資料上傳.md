---
title: CommonGateway 第二步 - JSON 的處理與資料上傳
category: programming
tags: [php,restful,rest,common-gateway]
lastupdated: 2021-08-24
permalink: /archives/21334380.html
---

本文接續「<a href="{{ site.baseurl }}/archives/21320836.html">CommonGateway 初步</a>」的內容，說明 CommonGateway 如何處理 JSON 文件與資料上傳。

## HTTP協定關於要求與提交文件型態的規範

HTTP協定定義了兩項關於文件型態的標頭(header)，一為 <dfn>Accept</dfn>，二為 <dfn>Content-Type</dfn>。

在傳統的 REST-like 應用中，這兩個標頭的原始定義並沒有被廣泛採用。大多數程式人員都是透過自定的額外參數來決定服務端該回應什麼文件型態給客戶端。
但在 RESTful 服務的設計場合中，文件型態的交換方式則回歸到這兩個標頭的原始定義了。
所以程式人員必須先分清楚這兩個標頭的使用場合。

<!--more-->

### Accept

<dfn>Accept</dfn> 用於宣告客戶端要求服務端回應的文件型態。

<blockquote>
The Accept request-header field can be used to specify certain media types which are acceptable for the response.
<br/>
<cite>
HTTP/1.1: <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.1">14.1 Accept</a>
</cite>
</blockquote>

<dfn>Accept</dfn> 可以一次宣告多種文件型態，服務端會按照本身可回應的文件型態與客戶端宣告的期望值決定該回應什麼文件給客戶。例如瀏覽器通常會宣告 <code>Accept: text/html;q=0.9,application/json;q=0.8</code>；表示瀏覽器希望 Web 伺服器回應 HTML 或 JSON 文件給它，其中 HTML 型態優先於 JSON 型態 (比分 0.9 > 0.8)。如果 Web 伺服器的應用項目支援回應這兩種文件型態，則應該優先回應 HTML 文件給客戶。如果服務端只實作了 JSON 文件型態的回應內容，則可以忽略 HTML 的請求，徑自回應 JSON 文件給瀏覽器。

不過在 RESTful 應用場合，客戶端的 <dfn>Accept</dfn> 通常只會宣告一種文件型態：<code>Accept: application/json</code>。

### Content-Type

<dfn>Content-Type</dfn> 用於宣告遞送給對方的文件型態。此標頭用途較廣，客戶端用於宣告提交給服務端的文件型態，服務端用於宣告回覆客戶端的文件型態。

<blockquote>
The Content-Type entity-header field indicates the media type of the entity-body sent to the recipient
<br/>
<cite>
HTTP/1.1: <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.17">14.17 Content-Type</a>
</cite>
</blockquote>

舉例來說，瀏覽器的表單(FORM)要提交表單內容給服務端程式，會宣告文件型態會是 <code>Content-Type: multipart/form-data</code> 。服務端的 PHP 程式若要動態地產生一份 JPEG 圖檔內容回應給瀏覽器，則必須加上一行 <code>header('Content-Type: image/jpeg');</code> 。

在傳統的 Web 應用中，<dfn>Content-Type</dfn> 的使用頻率已然不低。在 RESTful 架構中，它的使用頻率就更高了。許多 RESTful 服務供應者直接限定它只接受 JSON 或 XML 型態的提交文件。若用傳統的表單遞交方法，根本無法提交內容給這類 RESTful 服務。

在 CommonGateway (以下簡稱 CG) 中，會儘量幫程式人員預先處理好這些事，讓 PHP 程式人員可以延續傳統的 Web 應用寫作經驗。

### RESTful 客戶端

為了簡化本文內容，本文不會告訴你如何設計一個 RESTful 客戶端。
請你自己找一個來用。 Firefox 的用戶可以考慮安裝擴充套件「<a href="https://addons.mozilla.org/en-us/firefox/addon/restclient/">RESTClient</a>」。

本文後續內容將使用這些 RESTful 客戶端操作。

<div class="note">
如果你想知道 PHP 上傳資料給 RESTful 服務的程式細節，可參考「<a href="{{ site.baseurl }}/archives/20068918.html">PHP 透過 HTTP POST 方法上傳資料與檔案給 RESTful 服務</a>」。
</div>

## 回應 JSON 文件給客戶端

CG 遵循 HTTP 協定內容，要求容戶端以標頭 <dfn>Accept</dfn> 描述它希望取得的文件型態。這也是大部份 RESTful 服務供應者所要求的使用方式。

在「<a href="{{ site.baseurl }}/archives/21320836.html">CommonGateway 初步</a>」中就提到，當客戶端送來的 Accept 標頭是 <code>application/json</code> 時， CG 會自動回傳 JSON 資料 (參考 <a href="{{ site.baseurl }}/archives/44123533.html">JSON 處理之自動回傳</a>)。

如果你認為 CG 自動處理的 JSON 資料格式不是你要的，那你就建立對應方法的 .pjs 視圖，自行處理。

## 回應 XML 文件給客戶端

先不修改任何程式碼，用 RESTClient 送出請求，但設置請求標頭 "Accept: application/xml" ，看看會回應什麼。

* Headers: Accept: application/xml
* Method: GET
* URL: index.php/book (此處省略了前面的位址)

Response Body:

```text
Template is missing. Missing views/book/index.pxml.
```

雖然前篇中我已經實作了 index.phtml 而且也確實會回應內容給客戶端。但這次我加上了 <code>Accept: application/xml</code> ，所以 CG 這次載入視圖時不是找 index.phtml 而是找 index.pxml 。

在前篇中，我已經知道在 index 視圖中，會有兩個資料，分別是 <var>$books</var> 和 <var>$time</var>。我決定 XML 文件中只需要用 <var>$books</var> 的內容就好。建立 views/book/index.pxml ，回傳的 XML 結構如下：

```xml

<xml>
  <books>
    <?php foreach ($books as $book): ?>
    <book isbn="<?=$book->isbn?>"><?=$book->title?></book>
    <?php endforeach ?>
  </books>
</xml>

```

CG 會依 <dfn>Accept</dfn> 載入對應的視圖，也會自動添加正確的 <dfn>Content-Type</dfn> 文件型態宣告。所以不用寫出 <code>header('Content-Type: application/xml');</code> 。

RESTClient 再送出一次請求。現在我就會看到預期的 <var>$books</var> 內容了，而且是 XML 文件。

## 提交文件給服務端

RESTful 提交文件給服務端的方法有兩種。一為 POST ，對應資料建立行為。二為 PUT ，對應資料更新行為。

而服務端取得文件內容的方法，則是傳統的 <var>$_POST</var> 和 <var>$_REQUEST</var> 變數。就算是 JSON 文件，CG 也會幫你處理好，放到 <var>$_POST</var> 和 <var>$_REQUEST</var> 。

### POST 實作

在 controllers/book.php 中添加 <dfn>post()</dfn> 內容。

```php

class Book {
    // ... 省略其他部份

    function post() {
        if (empty($_POST['isbn']) or empty($_POST['title']))
            HttpResponse::badRequest();

        $book = new BookModel($_POST['isbn'], $_POST['title']);
        file_put_contents(getenv('TEMP') . '/book-' . $book->isbn, serialize($book));
        return HttpResponse::OK;
    }
}

```

<div class="note">
Book.php 完整內容請見「<a href="https://github.com/shirock/common-gateway-framework/tree/main/demo/api-first-step">demo/api-first-step</a>」。
</div>

從 <var>$_POST</var> 中取得表單內容這件事，對 PHP 程式人員是常識。 CG 不會改變這項常識。
範例不打算用資料庫，所以我只是很簡單地把書籍資料儲存在個別的檔案中，以 ISBN 為檔名。

RESTful API 設計時，一般只需要回應狀態碼 200 (Ok) 或 201 (Created) 表示成功即可。錯誤通常回應狀態碼 400 (Bad request)、406 (Not acceptable) 或 409 (Conflict) 。所以我的方法直接回傳狀態碼 200 或 400 ，告訴 CG 僅需回應狀態碼，不必處理視圖。

### 以傳統表單新增書籍資料

為了示範 CG 無縫接軌傳統表單與 JSON 的提交工作，我先快速地實作一個 Book 表單，以便用傳統的表單新增書籍資料。

controllers/BookForm.php:

```php

<?php
class BookForm {
    function edit() {
        return;
    }
}
?>

```

views/bookForm/edit.phtml:

```html

<html>
<meta charset="utf-8">

<form action="<?=cg\html\request_url('book')?>" method="POST">
    <label for="isbn">ISBN: </label>
    <input type="text" id="isbn" name="isbn" />
    <br/>
    <label for="title">Title: </label>
    <input type="text" id="title" name="title" />
    <br/>
    <button type="submit">Submit</button>
</form>
</html>

```

<div class="note">
這裡出現的 <code>cg\html\request_url()</code> 用途請見「<a href="https://github.com/shirock/common-gateway-framework/blob/main/doc/cg-html-functions.md">CommonGateway 的 HTML 公用函數</a>」。
</div>

表單重點在於以 POST 方法提交表單內容給 index.php/book 。

在某些 RESTful 服務中，其實不提供這類傳統表單。它們僅提供 API ，而操作介面與表單等 UI 內容一律讓程式人員自己設計。

用瀏覽器開啟 index.php/bookForm/edit ，出現書籍資料表單。
填入 ISBN 與 Title ，然後送出。例如填寫 ISBN: 123456，Title: BookXyz 送出，瀏覽器會看到 200 OK 。若漏填 ISBN 或 Title ，瀏覽器會看到 400 Bad Request 。

PHP 程式人員都很熟悉這個操作了，不作說明。

### 以 JSON 文件新增書籍資料

接著，我要如何像一般 RESTful 服務讓使用者用 JSON 文件遞交將要新增的書籍資料呢？

答案是，你的程式什麼都不必寫。

你直接用 RESTClient 提交內容給 index.php/book 。但提交設置如下所示:

* Headers: Content-Type: application/json
* Method: POST
* URL: index.php/book
* Body: <code>{"isbn": 789, "title": "NO 789"}</code>

因為這次我用 POST 方法提交的文件型態是 JSON ，所以我要用 <dfn>Content-Type</dfn> 告訴服務端上傳的文件是 JSON 。當然文件內容(Body)也必須符合 JSON 格式。

CG 收到資料後，會根據 <dfn>Content-Type</dfn> 的宣告，從 <var>php://input</var> 讀取客戶端上傳的 JSON 文件內容，解碼它(<span class="note">CG目前僅支援傳統表單和JSON文件上傳</span>)。最後把解碼結果保存在 <var>$_POST</var> 與 <var>$_REQUEST</var> 變數中。

雖然這次的資料提交方式完全是 RESTful 的操作方式。但 CG 在不改變 PHP 語義的前提下，把客戶端提交的內容不著痕跡地轉變為 PHP 傳統的處理內容。所以 book.php 的內容不需要修改任何地方，就能按過去的表單處理方式處理掉 RESTful 的請求。

### PUT 實作

對 CG 而言，PUT 和 POST 的處理策略相同。同樣根據 <dfn>Content-Type</dfn> 將上傳資料保存在 <var>$_POST</var> 與 <var>$_REQUEST</var> 變數。

在 controllers/book.php 中實作 <dfn>put()</dfn> 內容如下:

```php

class Book {
    // ... 其他內容省略

    function put($isbn = false) {
        if (empty($isbn))
            HttpResponse::badRequest();

        $data_filepath = getenv('TEMP') . '/book-' . $isbn;
        if (!file_exists($data_filepath)) {
            HttpResponse::notFound();
        }
        $book = unserialize(file_get_contents($data_filepath));
        $book->title = $_REQUEST['title'];
        file_put_contents($data_filepath, serialize($book));
        return HttpResponse::OK;
    }
}

```

PUT 用於更新現有的書籍資料，所以需要一個參數 <var>$isbn</var> 告知它要更新的目標資料。
通常這也是一般 RESTful 服務中， POST 和 PUT 方法的差異：POST 不用 ID，而 PUT 要。

當客戶端沒有指定 ISBN 時，就按 HTTP 的語義，回應狀態碼 400 (Bad request) 。此外回應 404 (Not found) 也符合 HTTP 語義。這由設計者自己決定。

最後，以 RESTClient 提交下列內容到 index.php/book/789 :

* Headers: Content-Type: application/json
* Method: PUT
* URL: index.php/book/789
* Body: <code>{"title": "NO 789 2nd edition"}</code>

若你的 URL 最後一段漏了 ISBN ，服務會回應 400 Bad request 。若是無此記錄，則會回應 404 Not found 。成功修改則回應 200 。

## 結語

POST 是傳統的 Web 應用上傳方法中，最常被應用的途徑。甚至發展出了許多技巧。但在 RESTful 應用場合，它的作用很單純。傳統的 Web 程式人員通常要花一些時間改變過去的設計習慣。

CG 是針對 PHP 熟練者的 RESTful MVC 容器。它的目標是一方面消除 HTML 表單與 RESTful 的資料來源差異性，另一方面保留原本的程式寫法與工具，而不讓程式人員牽就 framework 所提供的方法。所以它會儘可能地在符合 PHP 語義的前提下，將資料轉變為 PHP 程式人員熟悉的傳統用法；例如用 <var>$_POST</var> 取得使用者上傳的文件內容。

###### 相關文章

* [CommonGateway 介紹]({{ site.baseurl }}/archives/21318202.html)
* [CommonGateway 初步]({{ site.baseurl }}/archives/21320836.html)
* [CommonGateway 第二步 - JSON 的處理與資料上傳]({{ site.baseurl }}/archives/21334380.html)
* [CommonGateway 控制項動作函數回傳狀態碼的作法]({{ site.baseurl }}/archives/44121826.html)
* [CommonGateway Authorize 認證註記功能教學]({% post_url 2021-08-22-CommonGateway_authorize %})
* [CommonGateway HTML公用函數與預設首頁]({% post_url 2021-08-23-CommonGateway_HTML公用函數與預設首頁 %})
* [CommonGateway 的 View 類別，讓控制項指定自己要用的視圖]({% post_url 2021-11-23-CommonGateway_View %})
