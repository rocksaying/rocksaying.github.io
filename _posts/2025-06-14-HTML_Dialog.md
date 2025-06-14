---
title: 如何使用新式網頁UI元件 Dialog
category: programming
tags: [網頁UI,html,dialog]
cover: https://github.com/shirock/images/raw/main/2025/06-14-HTML_Dialog-2.png
lastupdated: 2025-06-14
---

[Dialog] 是 WHATWG 規範的 HTML 對話框元件。只要各家瀏覽器按照規範內容實作，就可以保證在不同瀏覽器與前端工具之間仍有相同的行為。
按 Mozilla MDN 文件所述，在 2022 年 3 月之後的瀏覽器皆已實作此元件。
在此之前，這類 UI 元件是由前端工具 - 如 bootstrap - 利用 CSS 和 JavaScript 自行設計。但不同前端工具之間定義的對話框行為並不相同。

注意，本文使用「對話框」一詞時，是一般概念。使用 [Dialog] 一詞時，專指 HTML5 規範的對話框元件。

專案開發者手上的舊專案仍可繼續使用前端工具自定的對話框元件。
但新建專案，則建議使用 Dialog 元件。因為它有標準化的好處。
A 前端工具的對話框元件和 B 前端工具的對話框元件一定不同，如果你們中途變更前端工具，那就要修改對話框元件的程式碼。
而 [Dialog] 不與前端工具綁定，不受前端工具更迭影響。

<!--more-->

#### Dialog 標準行為

* 具有方法: `show()`, `showModal()` 和 `close()`。
  事件: `close`。
  屬性: `open`、`returnValue`。
* 預設不顯現，即屬性 `open` 為 `false`。
* 有兩種行為型態: 一般型態和互動型態 (modal)。
  這兩種行為區別是由顯現方法決定。呼叫 `show()` 方法顯現時，為一般型態；呼叫 `showModal()` 方法則為互動型態。
* 一般型態只會浮現在畫面上層，但不阻礙使用者和其他元件互動，使用者可以忽視它。
* 互動型態則強制使用者必須與其互動，不能忽視它。
  互動型態 Dialog 顯現時會阻擋使用者和其他元件互動，使用者必須優先處理 Dialog 內容並關閉它。
* 一般型態 Dialog 顯現時只會水平置中於可視區域。而互動型態的 Dialog 則是水平與垂直置中。
* Dialog 可透過其內部表單 (Form) 關閉。
  透過表單關閉時，觸發 `close` 事件，並改變 `returnValue` 屬性之值。
* 有標準的鍵盤互動方式。互動型態的 Dialog 可以按鍵盤的 Esc 鍵關閉它。
  但按下 Esc 鍵關閉時，不會觸發 `close` 事件、不會改變 `returnValue` 屬性。

#### 基本設計組合

Dialog 的 HTML 基本內容通常搭配一個觸發其顯現的按鈕。
其內部則安排一個表單與使用者互動，例如讓使用者選擇動作。
內部表單的 `method` 應為 `dialog`，安排至少一個呈送按鈕 (submit)。
點擊呈送按鈕後關閉對話框，依呈送按鈕的 `value` 設定 Dialog 的 `returnValue` 屬性，並觸發 `close` 事件。

範例如下:

```html
<button onclick="document.getElementById('myDialog1').show()">
    Open Dialog
</button>

<dialog id="myDialog1" onclose="alert(`點擊 ${this.returnValue}`)">
    <div>
        Hello Dialog!
    </div>
    <hr>
    <div>
        <form method="dialog">
            <button type="submit" value="Yes">
                是
            </button>
            <button type="submit" value="No">
                否
            </button>
        </form>
    </div>
</dialog>

```

#### Dialog 外觀

設計者可用 CSS 宣告 Dialog 外觀。主要設計 Dialog 的視窗寬度和邊框樣式。瀏覽器會按 HTML 規範將 Dialog 置中，所以不必宣告 Dialog 位置。

對於互動型態 Dialog，則有虛擬元素 *backdrop* 可設計背景外觀 (被其阻擋的畫面區域)。通常我們會宣告背景色和透明度。

CSS 範例如下:

```css
<style>
dialog {
    min-width: 25%;
    border: solid 3px #fd7e14;
    padding: 1.5rem;
    border-radius: 10px;
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
    /* backdrop-filter: blur(1px); */
}
</style>
```

外觀如下圖:

![範例圖](https://github.com/shirock/images/raw/main/2025/06-14-HTML_Dialog-1.png)

#### 打造自己的 Dialog

接下來我要結合 HTML 元件自定屬性和 JavaScript 配合，簡化 dialog 的程式編寫工作。

自定屬性:

* rock-dialog: 對應 Dialog 的 id。點擊有此屬性的元件便呼叫 `show()` 顯現指定的 Dialog。
* rock-dialog-modal: 若有此屬性，則呼叫 `showModal()` 顯現互動型態 Dialog。
* rock-dialog-message: 此值將傳給 Dialog，為其顯示的訊息內容。
* rock-dialog-label: 如果 Dialog 內部有一個連結元件 (anchor, a)，此屬性將是此連結的顯示文字。
* rock-dialog-action: 如果 Dialog 內部有一個連結元件 (anchor, a)，此屬性將是此連結的跳轉 URL。

自定類別:

* dialog-close: 點擊任何位在 Dialog 內部且有 dialog-close 類別的元件，都可關閉其所在的 Dialog。

下列為實作這些內容的 JavaScript 程式碼:

```javascript
<script>

function confirmDialogChangeContent(trigger, dialog)
{
    const message = dialog.querySelector('.dialog-body');
    if (message == null) {
        return;
    }

    message.innerHTML = decodeURIComponent(
        trigger.getAttribute('rock-dialog-message'));

    const link_btn = dialog.querySelector('a');
    
    link_btn.innerText = trigger.getAttribute('rock-dialog-label');
    link_btn.href = trigger.getAttribute('rock-dialog-action');
}

window.addEventListener('click', ev => {
    // 點擊任何具有 rock-dialog 屬性的元件，都可顯現指定的 Dialog
    // 若點擊的元件同時帶有 rock-dialog-modal 屬性， Dialog 將以 modal 模式顯現。
    const dialogId = ev.target.getAttribute('rock-dialog');
    if (dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog.open) {
            return;
        }
        
        confirmDialogChangeContent(ev.target, dialog);

        if (ev.target.getAttribute('rock-dialog-modal') != null) {
            dialog.showModal();
        }
        else {
            dialog.show();
        }
        return;
    }

    // 點擊任何具有 dialog-close 類別的元件，都可關閉其所在的 Dialog
    // PS. 這個元件必須位在 Dialog 內部
    if (ev.target.classList.contains('dialog-close')) {
        ev.target.closest('dialog').close();
    }
});
</script>

```

以下為自訂內容的使用範例。此範例也用了 bootstrap5 設計元件外觀。

```html
<button rock-dialog="myDialog1" class="btn btn-primary">Open Dialog</button>

<button rock-dialog="myDialog1" rock-dialog-modal class="btn btn-primary">Open Modal</button>

<dialog id="myDialog1">
    <div>
        <p>這是對話框。</p>
        <p>利用內部表單的 submit 按鈕關閉。表單的 method 必須指定 "dialog"。</p>
    </div>

    <div class="d-flex justify-content-center gap-2 m-3">
        <form method="dialog">
            <button type="submit" class="btn btn-primary">關閉</button>
        </form>
    </div>
</dialog>

<button rock-dialog="confirmDialog" rock-dialog-modal class="btn btn-warning"
        rock-dialog-message="前往石頭閒語"
        rock-dialog-label="跳吧"
        rock-dialog-action="https://rocksaying.tw/">
    跳到石頭閒語
</button>

<dialog id="confirmDialog">
    <div class="dialog-body">
        $message
    </div>
    
    <hr>
    <div class="d-flex justify-content-center gap-2 m-3">
        <a href="$action" class="btn btn-primary">
            $label
        </a>

        <button class="btn btn-secondary dialog-close">
            關閉(close())
        </button>
        
        <form method="dialog">
            <button class="btn btn-secondary">
                關閉(form)
            </button>
        </form>
    </div>
</dialog>

```

此例的執行效果如下圖:

![範例圖](https://github.com/shirock/images/raw/main/2025/06-14-HTML_Dialog-2.png)

專案開發者手上的舊專案仍可繼續使用前端工具自定的對話框元件。
但新建專案，則建議使用 [Dialog] 元件。因為它有標準化的好處。不與前端工具綁定，不受前端工具更迭影響。

[Dialog]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog "<dialog>: The Dialog element"
