---
title: .NET 筆記 - System.Threading.Timer 和 System.Timers.Timer 兩種計時器的差異
category: programming
tags: [".net","C#",csharp,timer,threading]
lastupdated: 2023-06-03
---

**本文內容以 .NET 6 或更新版本為目標平台。 .NET Framework 不適用。**

在 .NET 平台上，有兩種主要的計時器類別(Timer)，分別是：

* [System.Threading.Timer](https://docs.microsoft.com/en-us/dotnet/api/system.threading.timer)
* [System.Timers.Timer](https://docs.microsoft.com/en-us/dotnet/api/system.timers.timer)

在一些 .NET Framework 文件中，還會提到其他種類的計時器類別，例如 System.Windows.Forms.Timer 。但看名字就知道，那些計時器類別綁定在 UI 庫或 Windows 系統上。而本文提到的這兩種計時器則具有普遍性，不會妨礙 .NET 程式的跨平台運行能力。

<!--more-->

對於 Unix/Linux 的開發人員來說， System.Timers.Timer 是傳統意義的計時器實作方式，也就是為每一個定期反覆執行的工作各自配置一個執行緒 (thread) 負責。

System.Threading.Timer 自然也是用執行緒實作，但差別在執行緒的管理方式不一樣。 System.Threading.Timer 會預先配置一組執行緒，稱之為 Thread pool 。由 Thread pool 自己管理執行緒和分派工作。使用者再以事件委派方式，將定期反覆的工作交給 Thread pool 處理。

用實際物品作譬喻的話，System.Timers.Timer 是你兩手空空出門工作。碰到需要計時處理的工作時，才跑去商店買一個鬧鐘來用。而且每件不同的計時工作，各自用一個鬧鐘來計時。

至於 System.Threading.Timer 則是你出門工作時，口袋裡就已經放了兩、三個鬧鐘 (Thead pool)。所以碰到需要計時處理的工作時，直接從口袋裡掏出鬧鐘就行了。節省跑去買鬧鐘的時間。

#### System.Timers.Timer

在先前的譬喻中說過 System.Timers.Timer 是為每個定期工作各自配置一個執行緒。所以它的使用情境，主要用於伴隨主要工作程式同時存在的支線工作。例如在主線工作執行期間，同時持續回報系統狀態的支線工作就很適合用 System.Timers.Timer 。這些支線工作基本上會和主線工作存在時間一樣久。

一般來說，服務程式內存在許多這種情境。故 .NET 文件對此類別的說明是 <q>The class is intended for use as a server-based or service component</q>。

下列範例是一個 HeartBeat 計時器。每隔一秒就在畫面上印一個 . ，讓使用者知道這個程式還活著。

```csharp

System.Timers.Timer HeartBeatTimer;

/*
計時器設置:
1. 建立後立即計時: 接著呼叫 Start()
2. 計時後1秒執行內容: interval = 1000
3. 定期重複執行: AutoReset = true
*/
HeartBeatTimer =  new System.Timers.Timer(1000)
{
    AutoReset = true
};
HeartBeatTimer.Elapsed += (s, e)=>{
    Console.WriteLine(".");
};
HeartBeatTimer.Start();

Console.ReadKey();

```

本文範例完整源碼在 [Server-based timer example](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/timer/server-based-timer)。

在完整源碼中，還示範了另外兩種情境的用法，即需要計時一次的情境 (TriggerOnce)，或者先擱置、等要用時才呼叫的情境 (Standby)。
但那兩種情境的計時工作更適合用 System.Threading.Timer 來做。
我只是為了比較兩種計時器的程式寫法才寫出來。在此就不列出程式碼了。有興趣者自己深入看吧。

#### System.Threading.Timer

System.Threading.Timer 的實作機制是由 .NET 配置並管理一組用於計時工作的執行緒 (Thread pool)，所以程式碼寫法是使用者以事件委派方式，委派工作給 Thread pool 。它適合用來處理需要計時一次的情境 (TriggerOnce)，或者先擱置、等要用時才呼叫的情境 (Standby)。

System.Threading.Timer 可以回收使用執行緒，而不是要用時才配置執行緒、工作完就銷毀。當你的程式中有大量突發性的計時工作需求時，這種機制可以為作業系統節省許多執行緒管理成本。故 .NET 文件對此類別的說明是 <q>a simple, lightweight timer</q>。

下列範例是一個 TriggerOnce 計時器。當你開始某件事，並希望在固定時間時回報時，可以用這種計時器。

```csharp

/*
計時器設置:
1. 建立後先擱置: dueTime = Infinite, period = Infinite
2. 計時後3秒執行內容: dueTime = 3000
3. 只執行一次: period = Infinite
*/
var TriggerOnceTimer = new System.Threading.Timer((state)=>{
    Console.WriteLine($"計時器1結束 {DateTime.Now}");
}, null, Timeout.Infinite, Timeout.Infinite);

while (true)
{
    Console.WriteLine("按 1 啟動計時器1，其他鍵則結束程式.");
    var ckey = Console.ReadKey();
    if (ckey.KeyChar == '1')
    {
        // 計時器1是靜態實體，重複按1只會啟動同一個計時器
        // 當計時器已經啟動時，再次呼叫 Start() 不會做任何事。
        Console.WriteLine("啟動計時器1 (3秒後)。");
        TriggerOnceTimer.Change(3000, Timeout.Infinite);
    }
    else
    {
        break;
    }
}

```

上述範例重複按 1 不會啟動複數的計時器。如果想要同時存在多個相同的計時器，那可以改用下列寫法。

```csharp

static void StartOnceTimer()
{
    /*
    計時器設置:
    1. 建立後立即計時: dueTime is not Infinite
    2. 計時後2秒執行內容: dueTime = 2000
    3. 只執行一次: period = Infinite
    */
    var onceTimer = new System.Threading.Timer((state)=>{
        Console.WriteLine($"計時器2結束 {DateTime.Now}");
    }, null, 2000, Timeout.Infinite);
}

while (true)
{
    Console.WriteLine("按 1 啟動計時器1，其他鍵則結束程式.");
    var ckey = Console.ReadKey();
    if (ckey.KeyChar == '1')
    {
        StartOnceTimer();
    }
    else
    {
        break;
    }
}

```

本文範例完整源碼在 [Thread pool timer example](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/timer/threading-timer)。

在完整源碼中，還示範 HeartBeat 情境的寫法。以及在計時器中再設置另一個計時器的寫法。

另外一提，在多工環境或即時環境中，這種計時器就是取代 sleep 的工具。
Thead.Sleep() 方法會擱置該執行緒的動作，設計不當就會發生程式停止而不能同時回應使用者的狀況。
這就是為什麼 WindowsForm 這類 GUI 程式中都不應該使用 Sleep() 方法的原因。

有 JavaScript 設計經驗的程式人員可以這麼想， Sleep 就是 setTimeout()；而此處示範的 TriggerOnce Timer 相當於 setInterval()。

就算在寫 WindowsForm 程式，我個人習慣也不用 System.Windows.Forms.Timer ，而是用 System.Threading.Timer。
