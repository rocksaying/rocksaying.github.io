---
title: 網頁UI元件 - LimitedCheckbox，複選但有限項目的表單元件
category: programming
tags: [網頁UI,javascript,checkbox]
cover: https://github.com/shirock/images/raw/main/2025/06-19-limited-checkbox-1.png
lastupdated: 2025-06-19
---

當網頁表單需要提供使用者可複選的選項時，我們會用 *Select* (配上 multiple) 或 *Checkbox* 元件。
但若想進一步限制可勾選的項目數量，例如五項中最多選三項又或是最少選兩項，則目前的內建行為做不到。
我們要自己寫程式控制。

我根據我碰到的需求情境，設計了一個允許使用者複選但有限項目的表單元件。
因為這個元件是基於 *Checkbox* ，所以取名 *LimitedCheckbox*。

我不用 *Select* 設計這個複選元件的原因，在於 *Select* 需要配合鍵盤按住 ctrl 或 shift 才可複選。
但現在很多人不知道這種鍵盤搭配滑鼠的操作技巧。隨著成長於手機世代的使用者愈來愈多，不知道的人會更多。
而 *Checkbox* 的操作方式則符合現代使用者的「日常經驗」，所以選它。

<!--more-->

#### LimitedCheckbox 的設計與運作

首先，要將 *Checkbox* 包進 *Fieldset* 。或說用 *Fieldset* 劃分 *Checkbox* 群組。

*Select* 元件會將選項包起來形成群組。但 *Checkbox* 元件本身是獨立的，基本上各不相干。
若要滿足可以五項中最多選三項，又或是最少選二項此類設計需求，我就需要把原本獨立的 *Checkbox* 分組。
分了組，我的程式才能做出「這五個是同組，限制最多選三個」或者「這幾個是一組，至少要勾兩個」等等判斷。
我用 *Fieldset* 做這件事。

1. Fieldset 用 id 對應 Checkbox 的 name。並自定 *maxlenth* 和 *minlength* 兩個屬性。
   *maxlength* 定義最多勾選項目的限制條件。*minlength* 定義最少勾選項目的限制條件。兩個限制條件可同時存在。
2. 呼叫 `LimitedCheckbox.initial()` 初始化。它會傾聽 `document.change` 和 `document.submit` 事件。
3. 當使用者勾選項目後，呼叫 `LimitedCheckbox.updateStatus()` 檢查 *maxlength* 限制。
   它根據 Fieldset 的 *maxlength* 決定同組 Checkbox 元件的狀態。
   當已勾選的項目數量等於 *maxlength* 時，就變更未勾選 Checkbox 屬性為 *disabled*，讓使用者不能勾選更多項目。
4. 使用者送出表單時，呼叫 `LimitedCheckbox.checkValidity()` 檢查 *minlength* 限制。
   若已勾選的項目數量少於 *minlength* 便中斷送出動作，並觸發 `invalid` 事件。

LimitedCheckbox 的源碼: [limited-checkbox.js](https://github.com/shirock/non-jquery-ui/blob/master/ui/limited-checkbox.js)」。

#### HTML 範例

說到 *Fieldset*，這是一個幾乎被人遺忘的東西。
但它確實是 HTML 規範中，用於表單元素分組的東西。
然而它除了一個框起來的視覺效果之外便沒有其他用處，致使它長期被遺忘。

例如我一開始問 Copilot AI 給個可多選項目的範例時，連 Copilot 都沒有用 *Fieldset* 分組。
並且 Copilot 把所有複選限制條件都直接寫在 JavaScript 程式內，而不是透過元件屬性注入程式。
這使得程式碼難以重用。

我思考之後，決定用 *Fieldset* 分組，並把複選限制條件綁在 Fieldset 的屬性上。
我的程式去讀 Fieldset 的屬性，就可得知每個組別的最多可勾項目和最少可勾項目的限制條件。

按照上述設計要點， LimitedCheckbox 的 HTML 範例如下。

```html
<fieldset id="A組[]" maxlength="3">
    <legend>A組：最多三項</legend>

    <input type="checkbox" id="A組-項目1" name="A組[]" value="A001" form="form">
    <label for="A組-項目1">A項目1</label><br>

    <input type="checkbox" id="A組-項目2" name="A組[]" value="A002" form="form">
    <label for="A組-項目2">A項目2</label><br>

    <input type="checkbox" id="A組-項目3" name="A組[]" value="A003" form="form">
    <label for="A組-項目3">A項目3</label><br>

    <input type="checkbox" id="A組-項目4" name="A組[]" value="A004" form="form">
    <label for="A組-項目4">A項目4</label><br>

    <input type="checkbox" id="A組-項目5" name="A組[]" value="A005" form="form">
    <label for="A組-項目5">A項目5</label><br>
</fieldset>

```

更多範例請見 [範例網頁源碼](https://github.com/shirock/non-jquery-ui/blob/master/sample/limited-checkbox1.html)」。

<div class="note">
我的後端是 PHP。回送給 PHP 的表單項目若是複數資料，那麼的 name 的內容必須後綴 `[]` 才會解析成包含複數資料的陣列。
</div>

![範例圖](https://github.com/shirock/images/raw/main/2025/06-19-limited-checkbox-1.png)

#### JavaScript 的部份

網頁載入後，需要呼叫 `LimitedCheckbox.initial()` 啟用 LimitedCheckbox。

`LimitedCheckbox.initial()` 有兩個可選的回呼函數參數，讓設計者處理不合限制時的外觀效果。

* valid_callback - 當一組複選元件的勾選結果符合限制時，呼叫此函數。
* invalid_callback - 當一組複選元件的勾選結果不符合限制時，呼叫此函數。

這兩個參數對應屬性 `LimitedCheckbox.validCallback` 和 `LimitedCheckbox.invalidCallback`。

基本上，只需要寫一行 `LimitedCheckbox.initial()` 就行了。
但實際上，還是會指定 `validCallback` 和 `invalidCallback` 處理外觀效果。
畢竟我們不能讓使用者看不出為什麼表單送不出去。

啟用 LimitedCheckbox 的範例如下:

```javascript
<script>
window.addEventListener('load', () => {
    LimitedCheckbox.initial(
        valid_set   => valid_set.querySelector('legend').classList.remove('bg-warning'),
        invalid_set => invalid_set.querySelector('legend').classList.add('bg-warning')
    );
    // LimitedCheckbox.validCallback =   valid_set   => valid_set.querySelector('legend').classList.remove('bg-warning');
    // LimitedCheckbox.invalidCallback = invalid_set => invalid_set.querySelector('legend').classList.add('bg-warning');

    document.addEventListener('invalid', ev => {
        console.log('invalid event', ev.target, ev.message);
    });

});
</script>

```

不合限制時，將複選表單元件組的標題 (legend) 背景色變為 bg-warning。合於限制時，移除背景色。

不指定 `invalidCallback` 時，也可以透過 `invalid` 事件處理不合限制的狀況。

雖然實作中出現了 `checkValidity()` 方法和 `invalid` 事件，但我並沒有實作整套 [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation)。
也還不想按照 [Web Component](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components) 訂一個新的網頁元件。

因為整套弄起來太複雜，超出我需要的功能。
我用不到的功能，就不會使用測試。不測試，就不能保證這些功能的程式碼的可用性。
那還是別寫了。

##### 相關資源

LimitedCheckbox 儲放在我的 [non-jquery-ui 源碼庫](https://github.com/shirock/non-jquery-ui):

* [limited-checkbox.js](https://github.com/shirock/non-jquery-ui/blob/master/ui/limited-checkbox.js)」。
* [本文範例網頁源碼](https://github.com/shirock/non-jquery-ui/blob/master/sample/limited-checkbox1.html)」。

API 參考:

* [fieldset: The Field Set element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset)
* [Element: checkVisibility() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/checkVisibility)
* [ErrorEvent](https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent/message)
