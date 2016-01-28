---
title: 學習 ECMAScript 6 - Module
category: programming
tags: [javascript,ecmascript,es6,module]
---

本文將介紹 ECMAScript 6 新增的 Module (模組) 語法。但直到本文發布時，實作支持此語法的瀏覽器還不多。想要練習本文內容，你需要使用 JavaScript compiler ，例如 [Babel](http://babeljs.io/)，將包含 ES6 語法的 JavaScript 程式碼，轉譯為現在的瀏覽器認得的語法。

各位或許曾經在 JavaScript 的程式碼用過 <dfn>require</dfn> 或 <dfn>module</dfn> 這兩個功能。並且認為這兩個字是關鍵字。但是，並非如此。這兩個字不是 ECMAScript 關鍵字，本文也不會再提到它們。因為那兩項是早先時候由 CommonJS/RequireJS/AMD module 等 API 規格各自定義的項目。事實上， ES6 定義的 <dfn>Module</dfn> 語法使用的兩個關鍵字是 <dfn>export</dfn> 和 <dfn>import</dfn>。
