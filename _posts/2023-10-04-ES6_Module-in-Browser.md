---
title: 學習 ECMAScript/JavaScript 6 - Module 在瀏覽器環境的使用說明
category: programming
tags: [javascript,ecmascript,es6,module,import,export]
cover: https://github.com/shirock/rocksources/raw/master/web/javascript-module-example/meme.png
lastupdated: 2023-10-04
---

JavaScript 的 *module (模組)* 概念，整體上與其他程式語言沒有差別。
但是 JavaScript 的主流用途是作為瀏覽器的嵌入式語言，在瀏覽器的環境中使用 module 就帶來一些特殊的問題。
此為本文重點。

1. [module 特性]({{page.url}}#module-特性)
2. [script type 的影響]({{page.url}}#script-type-的影響)
3. [避免名稱衝突]({{page.url}}#避免名稱衝突)

本文不會詳細介紹 *module (模組)* 功能的程式語法。語法細節推薦看 Mozilla 開發者文件的「[Modules Guide][]」。

<!--more-->

### module 特性

首先，*module (模組)* 視為獨立的活動空間 (space or scope) 。所以本文會一直用「*模組空間*」這個稱呼。

JavaScript 的模組空間具有下列特性:

1. 每一個 js 檔案都視為獨立的模組空間。
2. 在 HTML 的 *script type="module"*，每個標籤區塊也是獨立的模組空間。
3. 模組空間的內容預設不公開 (private)。
4. 變數、函式、類別、迭代器等內容，都可以用 [export][] 敘述宣告公開給外界使用 (public)。
5. 要使用其他模組空間的公開內容，必須先用 [import][] 敘述匯入。
6. export/import 只能在模組空間內使用，且必須寫在空間頂層，不能寫在函式與類別內。
7. 模組空間可以存取全域空間的內容，但全域空間不能存取模組空間內容。

第 2 點是瀏覽器環境才有的特性。

我寫了幾組 html 試驗我上面說的特性。請看「[rocksources: javascript-module-example](https://github.com/shirock/rocksources/tree/master/web/javascript-module-example)」。

### script type 的影響

![import語法錯誤啊](https://github.com/shirock/rocksources/raw/master/web/javascript-module-example/meme.png)

初學 module (模組) 功能會撞牆的點，就是不知道 script type 影響你能不能用 import/export 敘述。
明明都照語法寫 import/export 啊，為什麼瀏覽器會說語法錯誤？
*因為外面沒宣告 type="module"*。早說啊，為什麼不早說？

所以我把這件事放在開頭講。
一但知道這件事後， JavaScript 的模組功能用起來就和其他程式語言的模組化功能差不多，毋需多言。

在瀏覽器內，我們透過 HTML 的 *script* 標籤執行 JavaScript。可以直接在 *script* 標籤區塊內寫程式碼，也可以透過 *src* 屬性載入 js 檔案。
在過去很長一段時間裡，由於 *script* 標籤使用的型態內容只有一種，就是 *text/javascript* ，所以我們通常都省略不寫 *type* 屬性。然而瀏覽器加入模組功能時，它要求 *script* 標籤的 *type* 屬性指定 *module* 的才視為模組空間。
至於不在模組空間的內容，也就是 *script type="text/javascript"* 的內容，本文接下來都會說它們位在全域空間。這樣稱呼比較方便。

在說明模組空間和全域空間的區分後，接著談實務上有什麼影響。

JavaScript 的模組功能有兩個關鍵字，即 [export][] 和 [import][]。[export][] 負責宣告模組有哪些內容公開給外界用；[import][] 將其他模組的內容匯入本地模組空間。而本文列舉的第 6 點特性強調「*export/import 只能在模組空間內使用*」。這句話看似沒什麼問題，但其實在瀏覽器環境有些複雜。

我們過去寫的那一堆沒有 *type* 屬性的 *script* 標籤內容都算全域空間。由於全域空間不是模組空間，所以不能用 `import` 敘述，也就不能存取任何模組的內容。

那為每個 *script* 標籤加上 *type="module"* 就行了嗎？

否。每個 *script* 標籤的模組空間也是各自獨立，所以想把 script type 從 "text/javascript" 直接改成 "module" 也不行。
原有的程式如果想要導入模組功能，那一定要大改程式碼的撰寫結構。不是在每一個 script 加個 `import xxx` 敘述就行了。
想在原有的 Web 應用導入模組功能的話，通常第一件事就是在原來的 index.html 內，加一個 *script type="module"* 的進入點。

<div class="note">
Node.js 也有類似的要求。作為模組的 js 檔案要在 package.json 宣告其 type 為 module；又或者用副檔名 .mjs 表示這是一個模組。不同的 JavaScript 宿體會有不同的要求。
</div>

我們來看看實際怎麼寫。

先看沒有模組之前的傳統用法。

```html
<script type="text/javascript">
function abc() {
    console.log("say ABC");
}

// script type 為 text/javascript 的程式碼，不能用 export 敘述
// export { abc };
console.log("abc module loaded");
</script>
```

要用模組的話，則要指定 *type="module"* 。就是要求 JavaScript 解譯器將裡面的內容放在模組空間中處理。同時也自動宣告 *strict mode*。

```html
<script type="module">
function abc() {
    console.log("say ABC");
}

// script type 為 module 的程式碼，才能用 export 敘述
export { abc };
console.log("abc module loaded");
</script>
```

<div class="note">
直接在 script 標籤區塊內寫 export 其實沒有意義。
因為這個區塊沒有名字，其他模組不知道怎麼 import 它的內容。
</div>

只看 JavaScript 內容的話，這兩個檔案基本沒有差異。但一個不能寫 `export` ，另一個可以。
差一行 `export` 的原因是外部宣告的 *type* 不同。

我們可以把直接寫在 *script* 標籤內的程式碼分離放在單獨的 js 檔案，再用 *src* 屬性讓瀏覽器載入。
但是 *script* 標籤的 *type* 屬性依然影響 js 檔案的對待方式。
宣告 *module* 的才能用 `export` 敘述；未宣告的不行。

#### 傳統載入 js 的方式

傳統用法將程式碼分離到 js 檔案，如下所示：

```javascript
// abc-script-type-javascript.js
function abc() {
    console.log("say ABC");
}

// 因為載入的 script type 為 text/javascript ，故不能用 export 敘述
// export { abc };
console.log("abc module loaded");
```

HTML 中用 script src 讓瀏覽器載入它。

```html
<script type="text/javascript" src="modules/abc-script-type-javascript.js">
</script>

<script type="text/javascript">
window.addEventListener('load', _=>{
    abc();
});
</script>
```

傳統方式，所有程式碼定義的內容都在全域空間。
載入 abc-script-type-javascript.js 後，我們可以在任何地方呼叫 `abc()`。但因為瀏覽器的載入工作並非同步進行，所以會等 window.load 事件後才呼叫。

範例: [index-without-module.html](https://github.com/shirock/rocksources/blob/master/web/javascript-module-example/index-without-module.html)。

![執行圖例](https://github.com/shirock/rocksources/raw/master/web/javascript-module-example/index-without-module.png)

#### 用模組的方式

使用模組的話，如下所示：

```javascript
// abc-script-type-module.js
function abc() {
    console.log("say ABC");
}

// script type 為 module 的程式碼，才能用 export 敘述
export { abc };
console.log("abc module loaded");
```

導入模組後， HTML 中每個 *script type="module"* 標籤的內容都是分別獨立的模組空間。
所以這些 *script* 區塊或 js 檔案內，要呼叫 `abc()` 之前都得先寫上 `import {abc} from './modules/abc-script-type-module.js'`。敘述相對路徑時，要加前綴 `./`。
所下所示：

```html
<script type="module">
import { abc } from './modules/abc-script-type-module.js';

abc();

</script>
```

範例: [index-with-module.html](https://github.com/shirock/rocksources/blob/master/web/javascript-module-example/index-with-module.html)。

![執行圖例](https://github.com/shirock/rocksources/raw/master/web/javascript-module-example/index-with-module.png)

從上圖的網路資源載入狀態中，可以看出 `import` 敘述就會讓瀏覽器從伺服器取回 js 檔案。我們不必像傳統方式，為所有需要的 js 檔案都寫一行 script src 。控制其他 js 檔案下傳行為的點在模組內部，而不是模組外部的 HTML 。傳統方式使用第三方函式庫時，我們必須先查清楚它需要載入哪些 js ，並在每個 HTML 檔案中寫上一排 script src 。函式庫用得愈多，依賴維護工作就愈麻煩。 JavaScript 的模組功能可以減少依賴維護工作的成本。

#### 主程式進入點

傳統上，我們在全域空間定義一個 `window.load` 事件作為主程式進入點。
但是全域空間的函式不能呼叫模組空間的內容。
故一但你用了模組，就不適合將位於全域空間的 `window.load` 事件作為主程式進入點。
你必須把程式進入點也放在模組空間。當然模組空間內還是可以定義 `window.load` 事件。

最後，我們可以把 index.html 內的 module 程式碼，也放在另一個 js 檔案。
因為這是主程式進入點，習慣上將這個檔案取名為 main.js 。

```html
<script type="module" src="main.js">
</script>
```

範例: [index-with-module-2.html](https://github.com/shirock/rocksources/blob/master/web/javascript-module-example/index-with-module-2.html)。

### 避免名稱衝突

模組兼有避免名稱衝突的功用，可以視為簡化的 *namespace*。我們將不同模組的內容匯入本地模組空間時，可用 `import ... as` 避免不同模組的內容撞名。

常見的 `import ... as` 用法有兩種:

1. `import * as name from "module";`  
   為整個模組冠名。存取已冠名的模組內容時，要帶上名稱，如 `MyModule.abc()` 。
2. `import { export1 as alias1 } from "module";`  
   為匯入項目單獨取別名。

範例: [index-different-import-modules.html](https://github.com/shirock/rocksources/blob/master/web/javascript-module-example/index-different-import-modules.html)。

[Modules Guide]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules "MDN - Modules Guide"
[export]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export "export statement"
[import]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import "import statement"
