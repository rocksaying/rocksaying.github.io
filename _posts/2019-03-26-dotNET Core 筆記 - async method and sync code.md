---
title: .NET 筆記 - async method and sync code; await and Task.Result
category: programming
tags: [".net",".net core","C#",csharp]
lastupdated: 2019-03-26
---

我用 .NET Core 實作一個呼叫 RESTful API 的簡單程式時，碰到一個小麻煩。 .NET Core 的 HttpClient 類提供的方法都是非同步方法 (async method)。
但我是在同步形式的程式碼用到 HttpClient 。我不想回頭去改程式碼加上 `async Task` 的宣告。所以我得要呼叫非同步方法，但用同步形式程式碼取得結果。

<!--more-->

#### 非同步形式程式碼 (asynchronous code)

先看一下非同步形式程式碼範例，取自 [HttpClient Class Example](https://docs.microsoft.com/zh-tw/dotnet/api/system.net.http.httpclient?view=netcore-2.2)。

```csharp
static async Task Main()
{
   // Create a New HttpClient object and dispose it when done, so the app doesn't leak resources
   using (HttpClient client = new HttpClient())
   {
      // Call asynchronous network methods in a try/catch block to handle exceptions
      try
      {
         HttpResponseMessage response = 
            await client.GetAsync("http://www.contoso.com/");
         response.EnsureSuccessStatusCode();
         string responseBody = 
            await response.Content.ReadAsStringAsync();
         // Above three lines can be replaced with new helper method below
         // string responseBody = await client.GetStringAsync(uri);

         Console.WriteLine(responseBody);
      }  
      catch(HttpRequestException e)
      {
         Console.WriteLine("\nException Caught!");
         Console.WriteLine("Message :{0} ",e.Message);
      }
   }
}
```

針對回傳值為 `Task<TResult>` 的非同步方法，加上 *await*  關鍵字去接。而 *await* 會令 C# 編譯器拓展一段程式碼，插入 `Task<TResult>.GetAwaiter()` ，等待被呼叫方法的執行緒回傳結果。

#### 同步形式程式碼 (synchronous code)

但在同步形式程式碼中，不能使用 *await* 關鍵字。此時，`Task<TResult>.Result` 提供了在同步形式程式碼中呼叫非同步方法的途徑。`Task.Result` 這個屬性取值器將擱置呼叫方的執行緒(就是自己現行執行緒)，直到非同步方法傳回結果解除呼叫方執行緒的閒置狀態，再將結果存入 `Result` 屬性，繼續下一步。

將上例的非同步形式程式碼改成同步形式程式碼，如下:

```csharp
static void Main()
{
   using (HttpClient client = new HttpClient())
   {
      try
      {
         HttpResponseMessage response = 
            client.GetAsync("http://www.contoso.com/").Result;
         response.EnsureSuccessStatusCode();
         string responseBody = 
            response.Content.ReadAsStringAsync().Result;

         Console.WriteLine(responseBody);
      }  
      catch(HttpRequestException e)
      {
         Console.WriteLine("\nException Caught!");
         Console.WriteLine("Message :{0} ",e.Message);
      }
   }
}
```

首先， `main()` 的宣告不用加上 `async Task` 。

接著，因為非同步方法宣告的回傳值型別是 `Task` ，而我們要操作的正是 `Task` 的屬性 `Result` ，所以用方法串接語法接起來就好。例如 `GetAsync().Result`。

`Task<TResult>.Result` 是平台特性而不是 C# 語言特性。在 .NET 平台上運作的其他程式語言，也適用這個模式處理 .NET Core 的非同步方法。

+ [await (C# Reference)](https://docs.microsoft.com/zh-tw/dotnet/csharp/language-reference/keywords/await)
+ [Task.Result Property](https://docs.microsoft.com/zh-tw/dotnet/api/system.threading.tasks.task-1.result?view=netcore-2.2)
