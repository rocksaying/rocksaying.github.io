---
title: 網頁UI元件 - NumberInputElement，自訂增減值按鈕，以及用滑鼠滾輪修改數字
category: programming
tags: [網頁UI,javascript,html]
lastupdated: 2025-02-23
---

當設計師碰到限定輸入數值的輸入欄位時，可以用 *NumberInputElement* 網頁 UI 元件讓輸入框呈現更美觀的增加數值按鈕與減少數值按鈕。這是目前流行的數值輸入形式。

![範例圖](https://github.com/shirock/images/raw/main/2025/02-23-number-input-element-1.png)

NumberInputElement 元件具備以下特性：

1. 只綁定型態為 number 的 input 控制項 (input type="number")。
2. 加入使用滑鼠滾輪改變數值的行為。上滾增值，下滾減值。
3. 擴充 label 控制項的行為，使其具備對關聯控制項的增值行為或減值行為。
  使用 type 屬性定義點擊 label 時的行為， inc 表示增值，dec 表示減值。
4. 若不想用 label 改變 input 控制項的值 ，則可用 labelSelector 自行定義控制項的選擇器。
  例如用 button 控制項處理增值或減值。
5. 增值與減值行為都會參考 input 控制項的 max, min, step 三項標準屬性。

這個元件不會主動在 input 控制項旁邊增加控制按鈕，而是交給設計師決定。
如果設計師沒有放上代表增值或減值的按鈕／控制項，將只有滑鼠滾輪的擴充行為生效。

NumberInputElement 儲放在我的 [non-jquery-ui 源碼庫](https://github.com/shirock/non-jquery-ui): 「[取得 NumberInputElement](https://github.com/shirock/non-jquery-ui/blob/master/ui/number-input-element.js)」。

<!--more-->

沒想到事至今日還有機會寫這種網頁 UI 。我本來以為是我目前用的前端框架太輕量簡化，所以沒有這種 UI。但網路上搜了一遍，才發現功能更複雜的前端框架也經常忽視這種 UI 的使用需求。設計師往往要自己額外去找 UI 元件拼湊。

先說明一點，在手機或平板等觸控式操作環境中，瀏覽器已經針對數值型態的 input 控制項提供明顯特化的輸入介面，讓使用者輕鬆輸入數字。所以在這類環境下，不需要使用這個 UI 元件。但這個元件的擴充內容也不會干涉內建行為。

在 PC 環境下，瀏覽器似乎就沒有那麼用心了。像 Edge 或 Firefox 的電腦版碰到數值型態的 input 控制項，只是在輸入框邊緣加上兩個很小的上下箭頭 (如範例圖所示)，讓只用滑鼠的使用者點擊箭頭調整數值。但這兩個小箭頭實在小到很難點擊，所以主流的設計方式就是自己加兩個更大的按鈕來做這件事。

喔，對了。針對鍵盤使用者，瀏覽器電腦版還為數值型態 input 控制項加了按上下方向鍵調整數值的操作行為。既然可以按方向鍵調整數值，那是不是也該讓滑鼠滾輪這麼做？

NumberInputElement 元件就要滿足上述兩項需求。

首先對應觸控式操作環境使用上下滑動調整數值的操作習慣，必須加上滾動滑鼠滾輪調整數值的操作行為。這一點只需要傾聴代表滑鼠滾輪滾動的 wheel 事件，然後根據 deltaY 判斷滾輪是上滾或下滾調整數值。上滾增值，下滾減值。

```javascript
document.querySelectorAll('input[type="number"]').forEach(elm => {
    elm.addEventListener('wheel', NumberInputElement.wheelHandler);
});

static wheelHandler(ev)
{
    ev.preventDefault();
    const input = ev.target;
    const delta = ev.deltaY;
    if (delta > 0) {
        // console.log('wheel down');
        NumberInputElement.change(input, 'dec');
    } else {
        // console.log('wheel up');
        NumberInputElement.change(input, 'inc');
    }
}

```

至於增加兩個大按鈕分別負責增值與減值的部份，我的設計考量是讓設計師決定按鈕外觀和位置，而不是 NumberInputElement 自己生成按鈕。設計師只要讓 NumberInputElement 知道是哪些按鈕，然後 NumberInputElement 負責綁定增值和減值的擴充行為。

為了讓 UI 行為一致，我決定用 label 作為增值按鈕與減值按鈕的基底，而不用 button。因為增值按鈕與減值按鈕要像內建的兩個小箭頭一樣關聯 input 控制項，而且點擊時要改變輸入焦點到 input 控制項(輸入框內)，而不是把焦點放在按鈕上。label 本身就具有這些特性。

Label 的 for 標準屬性可以指定關聯控制項。我再另外添加 type 屬性指定 label 負責的調整行為。若 type 為 inc 表示增值，dec 表示減值。

具體來說，就是像下列的 HTML 碼：

```html
<label for="input1">數值欄位: </label>
<label for="input1" type="inc">➕</label>
<input type="number" id="input1" max="10" min="-15">
<label for="input1" type="Dec">➖</label>

```

這個 HTML 就是範例圖呈現的第一組數值型態輸入元件。

![範例圖](https://github.com/shirock/images/raw/main/2025/02-23-number-input-element-1.png)

第一個 label 沒有添加 type 屬性，所以它只觸發原本的行為，亦即改變輸入焦點到輸入框。

第二個 label 添加了 type="inc" 屬性，點擊時除了改變輸入焦點，還會增加數值一步。第三個 label 添加了 type="dec" 屬性，所以點擊就減少數值一步。一步的量由 input 的標準屬性 step 決定，預設一步為 1 。

不論是 label 的 for 還是 input 的 step, min, max 等屬性，都是 HTML 規範的標準屬性。我的設計思路都是按照 HTML 規範原則擴充操作行為，從而保持 UI 行為一致。

當設計師完成 HTML 碼之後，再呼叫 `NumberInputElement.initial()`，就可以讓他設計的增值按鈕或減值按鈕如預期般生效。

```html
<script src="number-input-element.js"></script>

<script>
window.addEventListener('load', function(){
    NumberInputElement.initial();
}, false);

```

NumberInputElement 在 Firefox 和 MS Edge 瀏覽器電腦版測試相容。
本文範例沒有套用任何 CSS，所以 label, input 或 button 控制項都是預設外觀。設計師應自己套用 bootstrap 這些 CSS 工具，美化外觀。

基本上，我的設計目標到此就實現了。不過說到自訂點擊行為，大家通常都是用 button。所以我又為 `NumberInputElement.initial()` 加入 labelSelector 函數參數，讓設計師自己決定綁定增值行為與減值行為的控制項。

#### 自訂選擇器

下例混用 label 和 button 設計增值按鈕與減值按鈕。為了突顯自訂性，我還特意讓兩組數值輸入控制項的按鈕位置不一樣。第一組把兩個按鈕分放兩邊，第二組則都放右側。

本例為了讓作為增值按鈕與減值按鈕的 button 控制項被選中，在呼叫 `NumberInputElement.initial()` 時，傳入了自訂選擇器的 callback 函數參數。

```html
<div>
    <label for="input1">數值欄位: </label>
    <label for="input1" type="inc">➕</label>
    <input type="number" id="input1" max="10" min="-15">
    <label for="input1" type="Dec">➖</label>
</div>
<br/>
<div>
    <input type="number" id="input2">
    <button for="input2" type="dec">➖</button>
    <button for="input2" type="inc">➕</button>
</div>

<script src="number-input-element.js"></script>

<script>
window.addEventListener('load', function(){
    NumberInputElement.initial(id => {
        return document.querySelectorAll(`[for="${id}"]`);
    });
}, false);

```

如果設計師不想用 for 屬性指定關聯控制項，而想用別的屬性也行。
下例就是用 `NumberInputElement.relatedAttribute` 屬性指定用 target 屬性名稱。

```html
<div>
    <button target="input3" type="dec">➖</button>
    <input type="number" id="input3">
    <button target="input3" type="inc">➕</button>
</div>

<script src="number-input-element.js"></script>

<script>
window.addEventListener('load', function(){
    NumberInputElement.relatedAttribute = 'target';
    NumberInputElement.initial(id => {
        return document.querySelectorAll(`button[target="${id}"]`);
    });
}, false);

```

#### 整合前端框架

目前前端框架的主流設計方式，不是分別在控制項上綁處理函數，而是直接在 document 綁定處理函數，然後在處理函數內根據事件主體判斷分流。

如果設計師要把 NumberInputElement 整合到採用這種設計原則的框架內，則不要呼叫 `NumberInputElement.initial()`，而須分別使用 `NumberInputElement.wheelHandler()` 和 `NumberInputElement.labelHandler()`。

##### HTML 規範參考

NumberInputElement 儲放在我的 [non-jquery-ui 源碼庫](https://github.com/shirock/non-jquery-ui): 「[取得 NumberInputElement](https://github.com/shirock/non-jquery-ui/blob/master/ui/number-input-element.js)」。

* [input type="number"](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement)
* [label](https://developer.mozilla.org/en-US/docs/Web/API/HTMLLabelElement)
* [mouse wheel event](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent)
* [click event](https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event)
