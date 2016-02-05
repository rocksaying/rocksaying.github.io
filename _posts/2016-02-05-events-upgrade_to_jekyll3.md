---
title: github pages 升級 jekyll3
category: events
tags: [blog,jekyll,github pages]
---

先說一聲春節快樂，年年有餘。

這幾天發現文章裡互相連結的內容，都找不到網頁。原來 github pages 的 jekyll 升級到 3.x 版，結果新版產生的 permalink 網址似乎不一樣。總之先[更新本地端的 jekyll 版本]({% post_url 2015-10-20-debian_github_pages %})。然後我決定玩大一點，把所有從樂多搬過來的舊文章都改為和樂多文章編號對應的 permalink ，而不用 jekyll 預設的規則。現在舊文章連結就是 http://blog.roodo.com/rocksaying/archives/文章編號.html => http://rocksaying.tw/archives/文音編號.html 。並加上 sitemap.txt 讓搜尋引擎更快更新此處的索引。

最後，我寫了一個自動更新程式，把樂多上所有文章的內容都改成指示讀者連到此處對應文章的連結資訊。
