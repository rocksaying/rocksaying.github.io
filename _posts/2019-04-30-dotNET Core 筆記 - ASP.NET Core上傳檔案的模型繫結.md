---
title: .NET 筆記 - ASP.NET Core 上傳檔案的模型繫結
category: programming
tags: ["asp.net core"]
lastupdated: 2019-04-30
---

上傳檔案的設計內容請看 MSDN 文章 [File uploads in ASP.NET Core](https://docs.microsoft.com/zh-tw/aspnet/core/mvc/models/file-uploads?view=aspnetcore-2.2)。

但模型繫結的型態似乎是文件錯誤。微軟文件寫多檔上傳可用 `List<IFormFile>` 繫結，但 ASP.NET Core 2 會顯示錯誤訊息 <q>The input was not valid</q>，不能處理。改用 `IFormFileCollection` 取代 `List<IFormFile>` 才正確。

如果表單中除了檔案欄位還有其他輸入欄位，則 API 參數清單加上一個 `[FromForm]` 參數去接其他輸入欄位的內容。這個參數的型態通常可用 `Dictionary<string,string>` 。

<!--more-->

##### HTML Form

HTML 方面， form 表單的 *method* 須為 `POST` ，且 *enctype* 須為 `multipart/form-data` 。 HTML 表單範例如下，同時包含文字欄位與檔案欄位。

```html
<form method="POST" enctype="multipart/form-data" action="api/upload">
  <div class="form-group">
    <div>
      Comment: <input type="text" name="comment">
    </div>
    <div>
      E-Mail: <input type="email" name="email">
    </div>
    <div>
      <p>上傳一個或多個檔案:</p>
      <input type="file" name="files" multiple />
    </div>
  </div>
  <div class="form-group">
    <div>
      <button type="submit" class="btn btn-primary">上傳</button>
    </div>
  </div>
</form>
```

##### WEB API

`IFormFileCollection` 是 `IFormFile` 的集合。 `IFormFile` 常用屬性與方法如下:

* IFormFile.Name: 此檔案欄位在表單中的名稱。若此檔案欄位允許選取多個檔案，屬於同一欄位的檔案會是相同名稱。
* IFormFile.FileName: 檔案來源名稱 (無路徑)。
* IFormFile.Length: 檔案大小。
* IFormFile.CopyTo(): 將檔案複製到指定 stream ，你應該這樣取得檔案內容。

```csharp
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http; // for IFormFile and IFormFileCollection

[Route("api/[controller]")]
[ApiController]
public partial class UploadController : Controller
{
    [HttpPost]
    // public IActionResult Post(List<IFormFile> files) // The input was not valid
    public IActionResult Post([FromForm] Dictionary<string,string> fields, IFormFileCollection files)
    {
        foreach (KeyValuePair<string,string> field in fields) {
            Console.WriteLine($"fields[{field.Key}]: {field.Value}");
        }

        // IFormFile.Name: 此檔案欄位在表單中的名稱
        // IFormFile.FileName: 檔案來源名稱 (無路徑)
        // IFormFile.Length: 檔案大小
        foreach (var file in files) {
            Console.WriteLine($"{file.FileName}, {file.Length}");

            if (file.Length > 0) {
                using (var stream = new FileStream(Path.GetTempFileName(), FileMode.Create)) {
                    file.CopyTo(stream);
                }
            }
        }
    
        return Redirect("api/upload");  // the url to list uploaded files.
    }
}
```
