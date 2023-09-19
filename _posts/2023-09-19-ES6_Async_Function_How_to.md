---
title: 學習 ECMAScript/JavaScript 6 - Async Function 問答指引
category: programming
tags: [javascript,ecmascript,es6,promise,async,await]
lastupdated: 2023-09-19
---

注意，本文說的 *async function* 專指 JavaScript 的定義。

關於 *async function* (非同步函式)的使用方法，我想只需要回答三個問題就足夠了。

1. 如何設計與使用 async function (非同步函式)？
2. 我已經有使用 Promise 設計的函式了，如何改為非同步函式？
3. 隱性的非同步函式改成顯性宣告(加上 async)有什麼好處？

最後補充關於 async 帶來的 [color of function](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) 的影響。

<!--more-->

<div class="note">
各家 JavaScript 引擎並不是同時實現 Promise 和 async 兩個功能。基本上是先實現 Promise ，之後才實現 async 。主流三大家引擎，最晚到 2018 年就都實現了。所以 2019 年之前寫的程式碼，可能還停留在 Promise 而沒用 async 。當然現在用 async 不太需要擔心瀏覽器不支援的事了。
</div>

### 第一問，如何設計與使用 async function (非同步函式)？

答：你要會用 *Promise* 。

答案很精簡。因為可將 *async function* (非同步函式) 視為 *Promise* 的語法糖衣。
你懂 Promise 就會用非同步函式。關於 Promise 可參考我的 [Promise 學習六步]({% post_url 2021-07-29-ES6_Promise %})。

### 第二問，我已經有使用 Promise 設計的函式了，如何改為非同步函式？

答：*async function* (非同步函式)的基本要求是回傳 *Promise* 個體。
反過來說，任何函式只要會回傳 Promise 個體，直接在函式定義加上 *async* 修飾詞，就可宣告它為非同步函式。

一個回傳 Promise 的函式，其涵義就是「我不能現在告訴你結果，但我承諾待會給你」。
這就是一個隱性的非同步函式，當然可以加上 *async* 修飾詞變成顯性的非同步函式。

例如我在 [Promise 實際範例]({% post_url 2021-08-21-ES6_Promise_實例 %}) 這篇的 `Until()` 函式，直接加上 *async* ，其他地方一字不改，跑起來一模一樣。

```javascript

// 這個函式回傳 Promise ，故只要定義前加上 async 就變顯性的非同步函式
async function Until(expr, timeout)
{
    let _timeout = timeout ? timeout * 10 : undefined;

    let promise = new Promise((resolve, reject) => {
        let count = 0;
        let it = setInterval(() => {
            if (expr()) {
                clearInterval(it);
                resolve(count/10); // elapsed seconds
                return;
            }

            ++count;
            if (_timeout && count > _timeout) { // wait n seconds
                clearInterval(it);
                reject();
                return;
            }
        }, 100) // 0.1 second interval.
    });

    return promise;
}

Until(_ => true, 3)
.then(_ => {
    console.log('ok')
})
.catch(_ => {
    console.log('timeout')
});

```

### 第三問，隱性的非同步函式改成顯性宣告(加上 async)有什麼好處？

答：

1. 函式內部可以用 *await* 表達式簡化非同步工作同步化需求的程式碼。
2. 非同步函式默認回傳值是 *Promise* 實體。如果回傳值不是 Promise 實體，那會自動擴展成一個 Promise 。
3. 幫助 IDE 工具提醒使用者(你)正在呼叫非同步函式。

傳統上使用 Promise 設計的非同步工作若要同步化，會用 `then()` 串接起來。
具體內容請看 [Promise 學習六步第四步：串接實現非同步工作的同步化]({% post_url 2021-07-29-ES6_Promise %})。

例如:

```javascript

async function AFunc1a(i)
{
    return  Promise1(i)
            .then(x => Promise2(x))
            .then(y => Promise3(y));
}

// 改用 await 就可以簡化成下列易讀的形式:
async function AFunc1b(i)
{
    let x = await Promise1(i);
    let y = await Promise2(x);
    return Promise3(y);
}

```

再說回傳值。非同步函式的回傳值如果不是 Promise ，那會自動擴展成一個 Promise ，回傳值包在 `resolve()`。
這也是一個簡化程式碼的效果。

例如:

```javascript

async function AFunc2a(i)
{
    return new Promise(resolve =>{
        resolve(i+1);
        // 此例不可用後置 ++ ，可以前置 ++ 或 +1
    });
}

async function AFunc2b(i)
{
    // 當此函式宣告為非同步函式時，下列的表達式會自動擴展成上例的 Promise 程式碼。
    return i+1;
}

AFunc2a(1).then(v => console.log('afunc2a result:', v));

AFunc2b(2).then(v => console.log('afunc2b result:', v));

```

```term
$ node afunc2.js
afunc2b result: 3
afunc2a result: 2
```

還有，在非同步函式裡出現的 *throw* 表達式，它的擲出物會包進 `reject()` 。

例如:

```javascript

async function AFunc3b(i)
{
    throw i;
    return i+1;
}
// 等於:
async function AFunc3a(i)
{
    return new Promise((resolve, reject) => {
        reject(i);      // throw
        resolve(i+1);   // return
    });
}

AFunc3a(1).then().catch(v => console.log('afunc3a throw:', v));

AFunc3b(2).then().catch(v => console.log('afunc3b throw:', v));

```

### color of function

[color of function](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) 指的是在程式碼中使用 *async* ，會染色你的程式碼。

以我在 C# 語言中使用 *async* 的經驗，我的 A 函式要呼叫第三方類別的 B 函式，但 B 函式已經宣告 async 了。那麼我的 A 函式也要宣告 async 。接著任何呼叫 A 函式的函式，也要跟著宣告 async 。一層層回溯，最後連代表程式起點的 `main()` 也要宣告 async 。這還只是剛開始。在你的傳統程式碼中添加一個 async ，結果就像是朝一碗清水倒入一滴墨水。當然不想染黑也有解法，就是用 Task/Result 變成同步工作。我在 [.NET/C# 設計 MQTT 用戶端程式]({% post_url 2021-09-05-MQTT-5-C#-clients %}) 就這麼做了。

這個現象不只出現在 C# ，Java 也有。事實上，每個程式語言在加入 async 語法時，都不能避免染色現象。 JavaScript 在這方面的影響算是比較輕的吧。當然你要真不想用 async ，你依然可以用 Promise 。

###### 相關文章

* [MDN - async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
* 石頭閒語: [ECMAScript/JavaScript 6 - Promise 學習六步]({% post_url 2021-07-29-ES6_Promise %})
* 石頭閒語: [ECMAScript/JavaScript 6 - Promise 實際範例]({% post_url 2021-08-21-ES6_Promise_實例 %})
