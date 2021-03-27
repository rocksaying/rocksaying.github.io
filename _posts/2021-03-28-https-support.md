---
title: 現在可以用 HTTPS 開啟本站了
category: events
tags: [github,https]
---

忘記是從何時開始， GitHub Pages 用戶不需要自己申請 SSL 憑證，只需要在 repository 的 Settings 頁面中勾選 *Enforce HTTPS* ，就可以讓用戶的 Github Pages 個人網頁支持 HTTPS 連線傳輸。參考 [Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/github/working-with-github-pages/securing-your-github-pages-site-with-https)。

但是我之前沒有搞懂 GitHub Pages 關於自訂網域名稱的設定限制，它不讓我勾 *Enforce HTTPS* 。所以本站遲遲沒有支持 https 。前幾天我檢查 DNS 設定時，才注意到我的 CNAME 和 GitHub Pages 裡的設定不一致。修正 GitHub Pages 這邊的 CNAME 後，終於可以勾 *Enforce HTTPS* 。

現在石頭閒語可以用 https 連線了。這陣子也會開始將網站資料中使用到 http: 的連結修正為 https: 。
