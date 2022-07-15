---
title: .NET 筆記 - ASP.NET Core 應用程式托管於IIS服務
category: programming
tags: ["asp.net core","iis"]
lastupdated: 2019-04-10
---

#### 基礎知識

首先，請參考微軟的 [Host ASP.NET Core on Windows with IIS](https://docs.microsoft.com/zh-tw/aspnet/core/host-and-deploy/iis/) 。但這篇文章資訊(廢話)很多，不容易找到重點。

ASP.NET Core 內建且默認用 *Kestrel* HTTP 服務模組。本文以此為準。

由於 ASP.NET Core 應用程式啟動時自帶 *Kestrel* HTTP 服務模組，本身不需要搭配 IIS 亦可獨立運作。但這種作法偏向微服務形式，而且負載分擔能力不如專業的 Nginx, Apache 或 IIS 。若你需要在一台主機上提供多個不同的 ASP.NET Core 應用程式服務，必須在 *Kestrel* 之前再加一道 HTTP 服務器，利用反向代理機制 (reverse proxy) ，溝通 *Kestrel* 與瀏覽器之間的通訊。

IIS 服務主機必須安裝 *.NET Core Runtime & Hosting Bundle for Windows*  。請到 [.NET Core 網站下載](https://dotnet.microsoft.com/download/dotnet-core)。

<!--more-->

#### 新增應用程式集區

開啟 IIS 管理控制台，新增應用程式集區。

##### 基本設定

* .NET CLR 版本: 沒有 Managed 程式碼。
* Managed 管線模式: 整合式。

##### 進階設定

1. 識別: 不要 *ApplicationPoolIdentity* 。此為 IIS 服務預設執行身份，但這個身份不足以讓 *dotnet* 讀取檔案，自然跑不動 .NET Core 應用。
2. 建議: *NetworkService* 。
3. 若你的應用程式需要讀寫或背景呼叫 script (如 PowerShell, Python 等)，則應選擇一般使用者帳號。
4. 選擇一般使用者帳號，需要輸入密碼， IIS 會儲存起來。

舉例來說，ASP.NET Core 應用程式以 `Startup()` 呼叫 python.exe 執行 python script 時，若發生錯誤且 HTTP 狀態碼為 103 時，就表示你執行 ASP.NET Core 的應用程式集區的使用者權限不夠。要用一般使用者帳號。

#### 部署除錯

ASP.NET Core 開發時有個方便的地方，開發者通常使用 <kbd>dotnet run</kbd> 啟動。此時你可以在終端視窗上直接看到 `Console.WriteLine()` 輸出的各種訊息，這裡可以抓到很多與程式邏輯無關的錯誤。

當你的 ASP.NET Core 應用程式第一次部署到 IIS 上的時候，強烈建議修改你的應用程式所在目錄的 web.config ，設 `stdoutLogEnabled=true` ，並建立 *logs* 子目錄保存記錄檔案。這將啟用 IIS 的標準輸出資料的記錄功能，保存 `Console.WriteLine ()` 輸出的訊息。

當 IIS 顯示找不到服務或服務內部發生錯誤時，你一定需要去看看記錄。

當確認你的 ASP.NET Core 應用程式成功托管於 IIS 服務後，你應該將 `stdoutLogEnabled` 再設回 `false` 。

##### web.config

~~~xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <aspNetCore processPath="dotnet" arguments=".\webapp.dll" 
        stdoutLogEnabled="true" 
        stdoutLogFile=".\logs\stdout" />
    </system.webServer>
  </location>
</configuration>
~~~
