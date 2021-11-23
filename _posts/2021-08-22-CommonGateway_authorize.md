---
title: CommonGateway Authorize 認證註記功能教學
category: programming
tags: [php,restful,common-gateway]
lastupdated: 2021-08-22
---

多年前，我寫了一個 PHP 框架 [CommonGateway]({% post_url 2013-1-29-CommonGateway 介紹 %})。我一直都用這個迷你框架實作 RESTful API 。只不過，以往都是用在區網內專案，或者 OpenData/OpenAPI 的案子，所以一直都沒想過用戶認證授權的功能。

直到去年，我接了一個案子。案子要求用戶經認證授權後才能存取 API。所以我參考之前使用 ASP.NET Core 的經驗，為 CommonGateway 增加了一個 *@authorize* 的註記，用於註記控制項或控制項方法是否要求用戶授權。

本文說明以 CommonGateway 框架設計 RESTful API 或網站時，如何使用認證授權功能。

<!--more-->

## 概觀

由 CommonGateway 處理認證授權的流程。而設計人員需要設計認證控制項。並在其他要求授權的控制項方法的 doc 中加上 *@authorize* 註記。

三個要項:

1. 要求授權的控制項要註記 *@authorize* 。
2. 設計認證控制項 Authorize 或 Login 。
3. 設置 <var>$_SESSION['Authorization']</var> 。

## authorize 的作用範圍

一般控制項並不需要知道整個專案的認證機制內容。如果這個控制項要求用戶授權，它只要註記 *@authorize* 就好。 CommonGateway 會幫控制項處理認證流程。若用戶未經授權，CommonGateway 就直接幫控制項回應 UNAUTHORIZED (401)，或是轉向到認證表單。

如果控制項的所有方法都要求授權，就在控制項類別的 doc 區註記 *@authroize* 。註記方式如下所示:

```php
<?php
// controllers/Member.php
/**
 * 這個控制項的每個方法都要求授權。
 * @authorize
 */
class Member
{
    /**
     雖然這個方法沒有註記，但因為是 class 註記 authorize ，故此方法要求授權。
     */
    function index()
    {

    }

    // 以下略...
}
?>
```

如果僅控制項的部份方法要求授權，則在要求授權的控制項方法的 doc 區註記 *@authroize* 。沒有註記的方法則公開給所有人使用。

```php
<?php
// controllers/Product.php
class Product
{
    /**
     沒有註記，這是一個公開使用的方法。
     */
    function index()
    {

    }

    /**
     * @authorize
     */
    function post()
    {

    }

    // 以下略...
}
?>
```

基本上就這麼簡單。但如果你的控制項還想再細分用戶的代號或操作權限，那 CommonGateway 是不管的。你得要按照你設計的授權細節自行處理。

例如你把用戶的等級存在 <var>$_SESSION['Authorization']['UserLevel']</var> 這個 Session 變數，那麼你的控制項就要自己去讀這個變數判斷用戶的等級權限。CommonGateway 並不會看到這些細節。

例如，限制用戶等級大於等於 3 才能新增產品品項。

```php
<?php
// controllers/Product.php
class Product
{
    /**
     * @authorize
     */
    function post()
    {
        $userLevel = $_SESSION['Authorization']['UserLevel'];
        if ($userLevel < 3) {
            HttpResponse::forbidden();
        }
        else {
            $result = insertProduct($_POST);
            if ($result) {
                return $result;
            }
            else {
                HttpResponse::badRequest();
            }
        }
    }
}
?>
```

打個比方， CommonGateway 只看用戶有沒有拿到通行證，但它不管這通行證上面寫些什麼。甚至你要把通行證和使用者資料分開放也行。這些授權細節由設計者決定。

上一段提到的 <var>$_SESSION['Authorization']</var> 就是 CommonGateway 看的通行證、授權書。它由 CommonGateway 認定的認證用控制項定義、簽署。

接下來就說明如何設計 CommonGateway 的認證用控制項。

## 實作認證用控制項

認證用控制項之實作範例，有兩種情境。

1. 純 RESTful API: [demo/api-authorize](https://github.com/shirock/common-gateway-framework/tree/main/demo/api-authorize)
2. Web 網站: [demo/web-authorize](https://github.com/shirock/common-gateway-framework/tree/main/demo/web-authorize)

這兩種情境的認證用控制項，設計時的差別僅在最後的回應方式。 RESTful API 情境的認證用控制項只會回應 OK (200) 或 FORBIDDEN (403) 狀態碼；而 Web 網站情境時，則會回應視圖給瀏覽器，讓使用者知道認證結果。

### 控制項名稱與方法

CommonGateway 默認的認證用控制項為 *Authorize* 或 *Login* 。若同時有這兩個控制項，只會調用 *Authorize* 。

CommonGateway 不規定認證控制項必須提供哪些方法。但大部份設計者是用 HTTP POST 方法遞交身份認證資料，所以通常要提供 `post()` 方法。

若是 CommonGateway 用於網站設計，則認證控制項一般還要 `index()` 方法及對應的 index.phtml 視圖，提供使用者輸入認證資料的表單。

### 授權書

當認證控制項認證用戶的使用權利後，就要簽署授權書。 CommonGateway 認定的授權書就是必須設定 <var>$_SESSION['Authorization']</var> 為任意值，有效值甚至包括 false 。

CommonGateway 僅憑 `isset($_SESSION['Authorization'])` 這個條件判定是否授權。

所以撤消授權時，必須使用 `unset($_SESSION['Authorization'])` ，不能用指派方式。像 `$_SESSION['Authorization'] = null` 這種寫法， CommonGateway 認為不算撤消授權。

### 範例

這個認證控制項範例，取自 Web 網站情境 [demo/web-authorize](https://github.com/shirock/common-gateway-framework/tree/main/demo/web-authorize)。 所以它提供 index() 方法顯示用戶的登入表單。當撤消授權時，也會重導向到登入表單。

如果 RESTful API 的情境，那就不必做重導向的事。

這個控制項提供 delete() 方法作為用戶登出方法。網站模式是 GET index.php/Authorize/delete 。或者按正規的 RESTful 方式，以 DELETE 方法向 index.php/Authorize 送出請求。

```php
// controllers/Authorize.php
<?php
class Authorize
{
    function index()
    {
        // 只是為了讓 CGF 知道這個控制項提供 index 方法，以載入 index.phtml 
        // index.phtml 會顯示登入表單
    }

    function post()
    {
        if (isset($_POST['username']) and 
            isset($_POST['password']) and 
            $this->checkPassword($_POST['username'], $_POST['password']))
        {
            // 示範用。實務取自資料庫。
            $member_data = [
                'name' => 'rock',
                'address' => 'rocksaying',
                'level' => 99
            ];

            // 給予授權書
            $_SESSION['Authorization'] = $member_data;
        }
        else {
            // 認證失敗，取消授權
            unset($_SESSION['Authorization']);
        }
    }

    function delete()
    {
        unset($_SESSION['Authorization']);
        cg\html\redirect('Authorize');
    }

    private function checkPassword($username, $passwd)
    {
        // 示範用。實務取自密碼庫。
        return ($username == 'rock' and $passwd == 'hello');
    }
}
?>
```

Authorize 控制項的視圖內容，請看 [demo/web-authorize](https://github.com/shirock/common-gateway-framework/tree/main/demo/web-authorize)。 本文就不一一列出了。

其他細節，請看 CommonGateway 功能文件: [認證授權註記 Authorize annotation](https://github.com/shirock/common-gateway-framework/blob/main/doc/authorize-annotation.md)。

###### 相關文章

* [CommonGateway 介紹]({{ site.baseurl }}/archives/21318202.html)
* [CommonGateway 初步]({{ site.baseurl }}/archives/21320836.html)
* [CommonGateway 第二步 - JSON 的處理與資料上傳]({{ site.baseurl }}/archives/21334380.html)
* [CommonGateway 控制項動作函數回傳狀態碼的作法]({{ site.baseurl }}/archives/44121826.html)
* [CommonGateway Authorize 認證註記功能教學]({% post_url 2021-08-22-CommonGateway_authorize %})
* [CommonGateway HTML公用函數與預設首頁]({% post_url 2021-08-23-CommonGateway_HTML公用函數與預設首頁 %})
* [CommonGateway 的 View 類別，讓控制項指定自己要用的視圖]({% post_url 2021-11-23-CommonGateway_View %})
