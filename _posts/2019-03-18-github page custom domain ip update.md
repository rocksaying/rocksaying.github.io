---
title: 更新 Github Page 自訂網域名稱的 IP
category: events
tags: [github,dns]
lastupdated: 2019-03-18
---

今天更新部落格一份文件後， github 發了一封 "Page build warning" 的提示信，信中說我的網站域名指向一個過期的 IP 位址。

```
The custom domain for your GitHub Pages site is pointed at an outdated IP address. You must update your site's DNS records if you'd like it to be available via your custom domain. For more information, see https://help.github.com/en/articles/using-a-custom-domain-with-github-pages.
```

<!--more-->

只是信中的連結文章並未提供真正有幫助的說明。所以我到 DNS 服務商 (我向中華電信註冊) 的管理頁面查看，得知我原本登記的 IP 位址是 192.30.252.153 。再用這個 IP 位址配上 github 關鍵字去 google ，找到真正有用的文章: [Troubleshooting custom domains](https://help.github.com/en/articles/troubleshooting-custom-domains) 。

```
If you're using an A record that points to 192.30.252.153 or 192.30.252.154, you'll need to update your DNS settings for your site to be available over HTTPS or served with a Content Delivery Network. 
```

重點是原本登記的 IP 位址是由 CDN 服務商提供。而 CDN 服務商變更了提供內容的 IP 位址，所以我在 DNS 代管服務中登記的 IP 位址也必須更新。

可以用 *dig* 或 *ping* 指令去查 <var>你的 github 用戶名稱</var>.github.io 的新 IP 位址。我托管於 Github Page 的部落格實際分配的網域名稱是 *rocksaying.github.io* 。查詢指令結果如下所示:

```term
$ dig rocksaying.github.io

;; ANSWER SECTION:
rocksaying.github.io.   3599    IN      A       185.199.109.153
rocksaying.github.io.   3599    IN      A       185.199.111.153
rocksaying.github.io.   3599    IN      A       185.199.108.153
rocksaying.github.io.   3599    IN      A       185.199.110.153
```

或者用 <kbd>ping rocksaying.github.io</kbd> 也可。

dig 查詢結果的第一個 IP 位址就是我的第一順位 IP 位址。然後再到 DNS 服務商的代管頁面，將 A 類型的 IP 從過期的 192.30.252.153 改成 185.199.109.153 。提交設置後，會提示24小時內才會生效。
