---
title: .NET Core 筆記 - ASP.NET Core appsettings.json 與執行環境
category: programming
tags: [".net","asp.net core"]
lastupdated: 2019-03-26
---

一般進行程式開發工作時，至少會分成兩個階段，或說兩個工作會期。開發期/Development/Debug 和 發布期/Production/Release 。並針對這兩個階段，設定不同的執行環境。

例如設定開發期執行環境的資料庫來源是 SQLite ，而發布期執行環境則用客戶指定的資料庫來源 SQL Server 。如此一來，開發人員僅須切換組態檔，就能改變程式的執行環境與參數。方便應付開發、測試、正式部署等工作。

ASP.NET Core 選擇用 *Development* 和 *Production* 這兩個稱呼區分兩階段。

<!--more-->

#### 兩個 appsettings

為什麼 .NET Core 新建 Web 專案時，會有 *appsettings.json* 和 *appsettings.Development.json* 兩個內容很相似的檔案？程式啟動時會用哪一個？

這兩個檔案其實都是 Web 專案啟動時的組態設定。它們的組態值，也會傳給 Controller 元件的建構參數 <var>config</var>。

Web 專案啟動時，將依據執行環境決定只讀取 *appsettings.json*  或是兩個都讀。

若執行環境為 *Production* ，只讀 *appsettings.json* 。

若執行環境為 *Development* ，先讀取 *appsettings.json* 再讀取 *appsettings.Development.json* 。並合併兩檔的組態。若組態項目重複，則以後來者覆蓋先前設定，亦即以 *appsettings.Development.json* 為準。

例如 *appsettings.json* 和 *appsettings.Development.json* 兩個檔案皆設定 *Logging:LogLevel:Default* 組態時，將以 *appsettings.Development.json* 之設定為準。

#### 如何決定執行環境

執行環境由環境變數之值決定，預設是看 <var>ASPNETCORE_ENVIRONMENT</var> 之值。

你可以為執行環境取任何名稱。但 ASP.NET core 主要使用以下三個環境名稱: 

+ Development
  代表開發環境。
+ Staging
  代表測試環境。
+ Production
  代表產品環境 (公開發表的作品)。

如果沒有指定 <var>ASPNETCORE_ENVIRONMENT</var> 環境變數，則預設的執行環境是 *Production* 。因此 *appsettings.json*  是 *Production* 執行環境的組態，而 *appsettings.Development.json* 就是 *Development* 執行環境的組態。

#### 為何本機專案目錄的執行環境是 Development ?

上一段說未指定執行環境時，預設為 *Production* 。但你會發現在本機的專案目錄下，以指令 `dotnet run` 啟動時，儘管未指定執行環境，但執行環境卻是 *Development* 。

指令 `dotnet new` 建立新 Web 專案時，會產生 *Properties\launchSettings.json* 。在 launchSettings.json 預設必有一段:

```json
    "commandName": "Project",
    "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
    }
```

指令 `dotnet run` 不加參數時，會找第一個 commandName 為 "Project" 的 profile 項目。 `dotnet run` 便按此項目的預設內容設定環境變數 <var>ASPNETCORE_ENVIRONMENT</var> 為 *Development* ，再執行你的程式。這就是在本機專案目錄下啟動程式時，執行環境是 *Development* 的原因。

還有 2 件事:

+ 可用 `dotnet run --launch-profile [profile]` 指定使用 launchSettings.json 的哪一組設定資料。
+ 對 Web 專案，指令 `dotnet run -c Release` 並不會改變預設的執行環境。

#### 部署在目標主機

用 `dotnet publish` 部署在目標主機的內容不會包含 *Properties\launchSettings.json* ，也就不會設定環境變數 <var>ASPNETCORE_ENVIRONMENT</var> 。故採用預設的 *Production* 執行環境。因此你部署在目標主機的程式啟動時只會讀取 *appsettings.json* 。

你可以在不同的目標主機上，設定不同的 *Properties\launchSettings.json* 並指定自訂的執行環境名稱，配合 appsettings.{ENVIRONMENT}.json ，讓每個目標主機擁有各自的執行環境。

但反過來說，你也要自己記得不同目標主機可能擁有各自的組態檔。我曾碰到有人問為什麼已經修改 *appsettings.json* 並上傳到目標主機了，卻依然使用舊的組態？那是因為他忘記目標主機上還擺了一組 launchSettings.json/appsettings.Custom.json 。而這組自訂的執行環境組態將覆蓋他修改過的組態。

再舉一個應用範例。如果你有一台專門負責自動測試的虛擬主機，你可以在那台主機的環境變數中設定 <var>ASPNETCORE_ENVIRONMENT=Testing</var> ，那麼所有部署到這台自動測試主機上的 Web 專案都會進一步嘗試讀取 *appsettings.Testing.json* ，套用自動測試環境的組態。

+ [ASP.NET Core 的設定](https://docs.microsoft.com/zh-tw/aspnet/core/fundamentals/configuration/?view=aspnetcore-2.2)
+ [Use multiple environments in ASP.NET Core](https://docs.microsoft.com/zh-tw/aspnet/core/fundamentals/environments?view=aspnetcore-2.2)
