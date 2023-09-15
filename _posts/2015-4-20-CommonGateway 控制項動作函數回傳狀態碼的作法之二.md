---
title: PHP框架 - CommonGateway 控制項動作函數回傳狀態碼的作法
category: programming
tags: [php,restful,common-gateway]
permalink: /archives/44121826.html
---

[CommonGateway]({% post_url 2013-1-29-CommonGateway 介紹 %}) 是我設計的一個 PHP 迷你框架。主要用於實作 RESTful API ，兼差網站設計。

在 CommonGateway 初期版本，如果你的控制項方法成功執行但不需要回傳資料文件時，你的方法應回傳 false ，讓 CG 不必繼續處理視圖工作。但這項要求違反一般函數的慣例，因為回傳 false 通常表示動作失敗。而在本文描述的情況中，你的控制項方法實際上成功了，卻要回傳 false ，語意有重大矛盾。

仔細探討 HTTP 和 CGI 規範，當一項客戶端要求圓滿完成時，至少要回傳一個表示成功的狀態碼標頭，例如常見的 "Status: 200" 。而 CG 實際上也是這麼做。當控制項方法正常地回傳 false 時， CG 視為控制項成功執行但不必載入視圖，並默認回報客戶端狀態碼 200 。

<!--more-->

考量回傳 false 形成語意矛盾， CG 擴充了一項規則：當控制項方法回傳介於 200~599 之間的整數 (*必須是整數，而不是字串*)，就將此回傳值視為控制項方法要回報給客戶端的狀態碼。並且認為這是一個只需要回報狀態碼而沒有後續內容的動作，故也不繼續載入視圖。如此一來，就可以在方法的回傳動作中明確表達設計意圖，同時讓 CG 理解此動作不必載入視圖。

```php

class Player
{
    // Before
    public function pause()
    {
        // Do something to pause player.

        // nothing to render. CG response 200 (OK) by default.
        return false;
    }

    // Now
    public function pause()
    {
        // Do something to pause player.

        // controller response 200 (OK). no addition content.
        return HttpResponse::OK;
    }
}

```

比較上例兩個新舊寫法，新寫法更直觀，語意更明確。

接著說明控制項方法回傳錯誤狀態的方法。根據 HTTP 規範，狀態碼 300 ~ 599 之間的數值，都是錯誤。從程式語言的觀點，這類狀態碼應視為例外錯誤。故 CG 提供了方法 `HttpResponse::exception()` 給控制項回報狀態。

例如參數不符時，應回報狀態 400 (Bad Request) ，那控制項就呼叫 `HttpResponse::exception(HttpResponse::BAD_REQUEST);`。此方法會提前中止程式，並回報狀態碼給客戶端。此時因為控制項方法不是正常返回 CG ，故 CG 就不會載入視圖。

但是 `HttpResponse::exception()` 表達方式太冗長了。 *HttpResponse::* 重複了兩次，天啊。CG 的 HttpResponse 也提供了下列回應方法:

* HttpResponse::badRequest($msg=false)
* HttpResponse::unauthorized($msg=false)
* HttpResponse::forbidden($msg=false)
* HttpResponse::notFound($msg=false)
* HttpResponse::internalServerError($msg=false)

完整列表請看 CommonGateway 技術文件：[HTTP 狀態碼與方法](https://github.com/shirock/common-gateway-framework/blob/main/doc/status_codes.md)。

因此舊寫法，如 `HttpResponse::exception(HttpResponse::NOT_FOUND);` ，現在可以寫成 `HttpResponse::notFound();`。意義不變，長度少一半。當然寫成 `return HttpResponse::NOT_FOUND;` 也一樣。但是回應方法可以接受一個狀態訊息參數，這是回傳值做不到的事。

```php

class Player
{
    // Before
    /**
    @param $track_number should >= 1.
     */
    public function play_track($track_number)
    {
        $number = intval($track_number);
        if ($number <= 0) {
            HttpResponse::exception(HttpResponse::BAD_REQUEST, "Bad Track Number");
        }

        // ...
    }

    // Now
    public function play_track($track_number)
    {
        $number = intval($track_number);
        if ($number <= 0) {
            HttpResponse::badRequest("Bad Track Number");
            // or
            return HttpResponse::BAD_REQUEST;
        }

        // ...
    }
}

```

附帶一提， CG 會檢查參數數量是否滿足控制項方法宣告。如果參數不夠，會直接回報狀態 400 (Bad request) 。所以範例的 `play_track()` 方法不需要先確認參數數量，則可以直接檢查 <var>$track_number</var> 的內容。

最後補充 HTTP 規範關於狀態碼的兩件事。

一、狀態碼 2xx ，如 200 (OK), 202 (ACCEPTED), 204 (NO_CONTENT) 等，都代表成功。在實務上，實作 RESTful API 時，一般都用 200 (OK) 概括。而 RESTful 客戶端也習慣以 200 判斷是否成功。不過有些客戶端甚至把其他 20x 狀態碼當成錯誤，這可不算好設計。

二、狀態碼標頭除了代碼部份，還可以接續一行狀態訊息。所以完整的狀態碼標頭應該像 "Statue: 200 OK" 。但有些 http 客戶端函數庫會直接忽略後續的狀態訊息，只讓設計者取得狀態代碼。而有些則可讓設計者取得這兩部份。以 JavaScript 中的 [XMLHttpRequest API](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) 為例， XMLHttpRequest.status 屬性只表示狀態代碼，例如 200 ；而 XMLHttpRequest.statusText 屬性則包含整行訊息，例如 "200 OK" 。

CG 的回應方法因此提供了一個狀態訊息參數，讓設計者可以更詳細地表達控制項的錯誤訊息。若未指定訊息參數，則 CG 會自行填入預設的狀態訊息。

###### 相關文章

* [CommonGateway 介紹]({{ site.baseurl }}/archives/21318202.html)
* [CommonGateway 初步]({{ site.baseurl }}/archives/21320836.html)
* [CommonGateway 第二步 - JSON 的處理與資料上傳]({{ site.baseurl }}/archives/21334380.html)
* [CommonGateway 控制項動作函數回傳狀態碼的作法]({{ site.baseurl }}/archives/44121826.html)
* [CommonGateway Authorize 認證註記功能教學]({% post_url 2021-08-22-CommonGateway_authorize %})
* [CommonGateway HTML公用函數與預設首頁]({% post_url 2021-08-23-CommonGateway_HTML公用函數與預設首頁 %})
* [CommonGateway 的 View 類別，讓控制項指定自己要用的視圖]({% post_url 2021-11-23-CommonGateway_View %})
