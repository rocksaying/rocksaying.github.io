---
title: .NET 筆記 - ASP.NET Core 上傳檔案的檔案大小限制
category: programming
tags: ["asp.net core","iis"]
lastupdated: 2019-04-30
---

當使用者上傳檔案，卻碰到 *403 Not Found*  檔案找不到的錯誤時，基本上就是碰到檔案大小錯誤。很奇怪吧，但這是 IIS 的錯。可以先問問使用者是不是一次選取多個檔案上傳？ 如果是，請他們分成幾次上傳，每次只選兩、三個檔案。

關於上傳檔案的限制，請看 MSDN 文章 [File uploads in ASP.NET Core](https://docs.microsoft.com/zh-tw/aspnet/core/mvc/models/file-uploads?view=aspnetcore-2.2) 後半段。

<!--more-->

當你在本機開發與測試 ASP.NET Core 專案時，應該會用內建的 *Kestrel* HTTP 服務模組。它沒有限制單次上傳工作的檔案大小，所以你不會覺得有限制。但當你部署到 IIS 主機時，要注意 IIS 有單次上傳檔案大小總量上限。而且超過此容量上限時， IIS 回應的狀態碼是 *403 Not Found* ，完全誤導使用者。

IIS 預設限制單次上傳工作的檔案大小總量是 30000000 bytes ，大約是 28.6 MB 。此上限限制的是大小總量，不是單一檔案。所以以下兩種情境都會觸發 *403* 錯誤。

1. 單一檔案超過 28.6MB ，觸發錯誤。
2. 如果每個檔案大小都不超過 28.6MB ，但合計超過時，也會觸及上限。所以請使用者分成多次上傳，或一次只上傳一個檔案，就可避免這事。

或者修改 web.config 的 *maxAllowedContentLength* 設置，調高上限。例如:

```xml
<system.webServer>
  <security>
    <requestFiltering>
      <!-- This will handle requests up to 50MB -->
      <requestLimits maxAllowedContentLength="52428800" />
    </requestFiltering>
  </security>
</system.webServer>
```

還有一個更好的解決方法，那就是不要將 ASP.NET Core 應用托管在 IIS 下。 Nginx 或者 Apache http server 都有 Windows 系統的安裝包。
