---
title: .NET 筆記 - C# 自定義事件範例
category: programming
tags: [".net","C#",csharp,event,callback]
lastupdated: 2022-07-15
---

**本文內容以 .NET Core 3 / .NET 5 或更新版本為目標平台。我不用 .NET Framework ，不保證適用。**

現代程式語言很強調 callback 能力， JavaScript 是其中代表。
雖然 callback 本質上是把函數當一個參數傳遞給另一個函數，連 C 語言都能做這事。
但有些程式語言並不把函數與變數視為同等地位，因此不能直接把函數當參數傳遞，而需要特定的語法支持。
C# 就是這類程式語言。

對於 callback 能力，C# 基本上提供了兩種語法支持。
其一是委派(delegate)，其二是事件(event)。事件也可說是較複雜的委派。
本文示範如何為自己的類別添加自行定義的事件。

<!--more-->

為自己的類別添加自行定義的事件，可分三個步驟。

第一步，自 [EventArgs](https://docs.microsoft.com/zh-tw/dotnet/api/system.eventargs) 類別衍生一個新的事件類別。
或者選擇現有的事件類別，例如 `NotifyInputEventArgs` 等等。

第二步，使用成員修飾詞 *event* 為你的類別增加事件成員。

第三步，在你的類別中，定義觸發事件的方法。
或者說定義一個呼叫 callback 方法的方法。

本文範例完整源碼在 [callback-function/custom-event](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/callback-function/custom-event)。
以下分段說明。

#### 第一步、衍生新的事件類別

本文將定義一個 Keyboard 類別，用於分派使用者輸入文字的處理工作。
輸入一行就觸發一次輸入事件，此事件有一個屬性存放使用者輸入的文字。

按此需求，我定義新的 `CustomEventArgs` 類別，建構參數是此次鍵盤輸入的文字。
定義屬性 `Text` 讓事件處理方法取得文字內容。

```csharp

// 自 EventArgs 衍生新的事件類別 CustomEventArgs
// 這個名稱在實務上不好，我只是強調自定義才取這名字
public class CustomEventArgs: EventArgs
{
    // 建構參數 text 是鍵盤輸入的文字
    public CustomEventArgs(string text)
    {
        // 保存使用者此次輸入的文字
        this.text = text;
    }

    private string text;

    // 透過屬性 Text 取得此次輸入事件的文字
    public string Text
    {
        get => text;
    }
}

```

你也可以從現有的事件類別中選擇合適的來用。不一定要增加事件類別。

#### 第二步、定義事件成員

定義一個 Keyboard 類別，負責處理使用者自鍵盤輸入的文字段落。
針對輸入事件，在 Keyboard 類別中需要定義一個成員和一個方法。

首先使用成員修飾詞 *event* 為 Keyboard 類別增加事件成員 `Inputted`。
事件成員的用途是讓外部委派事件處理方法。
成員型別選擇用泛型版本 [EventHandler&lt;TEventArgs&gt;](https://docs.microsoft.com/zh-tw/dotnet/api/system.eventhandler-1)。

```csharp

// class Keyboard
    public event EventHandler<CustomEventArgs>? Inputted = null;

```

事件發生時可選擇處理或忽視。
忽視就是不委派任何事件處理方法，因此事件成員必定是 nullable ，以 null 表示沒有委派事件處理方法。

#### 第三步、定義觸發事件的方法

當使用者輸入一行文字後， Keyboard 類別實例就要觸發 `CustomEventArgs` 事件，或者說是將事件參數 `CustomEventArgs` 發送給被委派的事件處理方法。

固定的寫法樣版是: `事件成員?.Invoke(this, new EventArgs())`，直接呼叫被委派的方法。
但實務上，我們會把這一行放在一個專責方法中，也就是我說的觸發事件的方法。

針對 `Inputted` 事件，我定義了 `OnInputted` 方法。

```csharp

// class Keyboard
    // 觸發事件的方法，名稱慣例會在事件名稱前加個 On
    public void OnInputted(CustomEventArgs e)
    {
        // Safely raise the event for all subscribers
        Inputted?.Invoke(this, e);
    }

```

或者

```csharp

// class Keyboard
    public void OnInputted(string text)
    {
        Inputted?.Invoke(this, new CustomEventArgs(text));
    }

```

Keyboard 類別的 `Loop()` 方法負責處理使用者輸入文字的動作。
在使用者輸入一行文字後，就呼叫 `OnInputted()` 觸發事件。

```csharp

// class Keyboard
    public void Loop()
    {
        Console.WriteLine("Ctrl+C 中止");
        while (true)
        {
            Console.Write("輸入一行> ");
            var text = Console.ReadLine();
            if (!string.IsNullOrEmpty(text))
            {
                // 觸發事件
                OnInputted(new CustomEventArgs(text));
            }
        }
    }

```

#### 如何委派事件處理方法

事件處理方法可以用一般方法定義，也可以用 lambda 。
它需要兩個參數。第一個是 sender 表示誰發出這個事件；第二個是事件參數，在本例就是 `CustomEventArgs` 實體。

因為事件可以委派給多個處理方法，所以委派時使用 `+=` 運算符。

委派範例如下:

```csharp

var kb = new Keyboard();

// 以一般方法定義事件處理方法的內容
void HandleInputted(object sender, CustomEventArgs e)
{
    Console.WriteLine($"subscriber1 收到資料: {e.Text}");
}

// 用 += 將方法委派給 Keyboard 的 Inputted 事件成員
kb.Inputted += HandleInputted;

// 以 lambda 定義事件處理方法
// 添加第2個事件處理方法
kb.Inputted += (_, e) => {
    Console.WriteLine($"subscriber2 收到資料: {e.Text}");
};

```

完整源碼在 [callback-function/custom-event](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/callback-function/custom-event)。

#### 使用 event 有什麼好處

以本文 Keyboard 類別為例。

未使用 event 之前，如果使用者輸入的文字要呼叫兩個處理方法，我們需要打開 Keyboard 的 `Loop()` 方法，添加下列程式內容：

```csharp

public void Loop()
{
    Console.WriteLine("Ctrl+C 中止");
    while (true)
    {
        Console.Write("輸入一行> ");
        var text = Console.ReadLine();
        if (!string.IsNullOrEmpty(text))
        {
            // 第一個處理方法
            HandleInputted(this, new CustomEventArgs(text));

            // 第二個處理方法
            Console.WriteLine($"subscriber2 收到資料: {text}");
        }
    }
}

```

如果將來要添加更多處理方法，就要持續往 Keyboard 類別添加程式碼。
從封裝性和再用性等各種角度考量，都很不利。

改用 event 之後，我們將來不論是增加、修改或刪除處理方法，都不需要打開 Keyboard 類別了。

###### 參考

* [如何發行符合 .NET 指導方針的事件 (c # 程式設計手冊)](https://docs.microsoft.com/zh-tw/dotnet/csharp/programming-guide/events/how-to-publish-events-that-conform-to-net-framework-guidelines)
