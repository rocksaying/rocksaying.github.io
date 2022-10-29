---
title: .NET 筆記 - NamedPipe 與 Unix Domain Socket (.NET 6)
category: programming
tags: [".net","C#",csharp,pipe,socket,ipc]
lastupdated: 2022-10-29
---

**本文內容以 .NET 6 或更新版本為目標平台。 .NET Framework 不適用。**

Named pipe (具名管道) 在 .NET 上不是新玩意，早在 .NET Framework 3.5 時就已提供 [NamedPipeServerStream](https://learn.microsoft.com/zh-tw/dotnet/api/system.io.pipes.namedpipeserverstream) / [NamedPipeClientStream](https://learn.microsoft.com/zh-tw/dotnet/api/system.io.pipes.namedpipeclientstream)。
但是自 .NET 6 起，它的底層實作技術改變了。
如果你想讓其他程式語言開發的程式 (非 .NET 平台) 和 NamedPipeServerStream/NamedPipeClientStream 程式溝通，必須知道這件事。

我有一個用 .NET Core 3 寫的具名管道服務程式，前陣子想用 .NET 6 發佈到 Linux 跑。結果原先用 FIFO 寫的客戶端程式接不上。一番研究後，才知道 .NET 6 改了具名管道的底層實作技術。

<!--more-->

傳統上，Unix 嫡系 [UNIX System V](https://zh.wikipedia.org/wiki/UNIX_System_V) 使用 [FIFO](https://man7.org/linux/man-pages/man7/fifo.7.html) 檔案實作 named pipe (具名管道)；
BSD 家族則是從 socket 中衍生出 [Unix Domain Socket](https://en.wikipedia.org/wiki/Unix_domain_socket) ，作為具名管道。Linux 這個私生子同時提供 FIFO 和 Unix Domain Socket ，但因為它的風格偏向 System V ，所以選擇用 FIFO 實作具名管道。在類Unix體系的作業系統上， FIFO 和 Unix Domain Socket 就是替代品關係。真要說兩者有何不同的話，那就是 FIFO 是 kernel module ，而 Unix Domain Socket 則是 library function 。

了解這段技術歷史後，就會知道透過具名管道通訊之前，要先搞清楚對方所說的「具名管道」到底是用哪種技術。特別是在不同程式語言的程式之間。

由於 Windows 系統早先並不提供 Unix Domain Socket ，所以 .NET Framework 用 FIFO 實作 NamedPipeServerStream/NamedPipeClientStream 。但 Windwos 10 Insider Build 17063 (我記得被包含進 18H3) 開始提供 Unix Domain Socket ，所以稍後公開的 .NET 6 也隨之將 NamedPipe 底層實作技術從 FIFO 改成 Unix Domain Socket 。至於改變原因，我猜測是基於可攜性考量。由於 Linux 和 macOS (BSD family) 都提供 Unix Domain Socket ，故 .NET 6 的 NamedPipe 類別自此具備在 Linux, macOS, Windows 10 作業系統之間的可攜性。

本文一方面提供 .NET NamedPipeServerStream 的服務程式範例；另一方面，則是驗證不同程式語言的程式現在該透過何種途徑與 .NET 6 的具名管道溝通。我選擇用 PHP 寫一個使用 unix domain socket 的客戶端程式。

本文範例完整源碼在 [named-pipe-server](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/named-pipe-server)。

服務端與客戶端程式到上述連結查看，就不貼出了。

* 客戶端程式 (pipe-test.php) 用 PHP 撰寫，透過 unix domain socket 連接服務程式。
* 因為 Windows 建置版本的 PHP 不支援 unix domain socket ，所以示範工作在 Linux (Debian 11) 上進行。
* 服務端程式用 .NET 6 建置，在 Debian 11 上執行。
* 兩端執行時都要指定具名管道的路徑。本文範例是 /tmp/test-named-pipe 。
* 示範服務程式的工作是將客戶端送來的字串內容，轉成大寫字母後回轉。

執行範例如下圖所示：

![具名管道服務端與客戶端通訊範例圖](https://github.com/shirock/rocksources/raw/master/dotnet-core-example/named-pipe-server/snapshot.png)

這個範例證明 .NET 6 的 NamedPipeServerStream 確實是用 Unix Domain Socket 技術實作。

*注意! 不論是 FIFO 或是 Unix Domain Socket 都被視為一種檔案。所以使用時要注意讀寫權限。*

在 Linux/macOS 平台，建立 unix domain socket 時，讀寫權限預設是 644 (srwx-r-xr-x)，
這表示不同 UID 的程序不能開啟這個 socket 。
然而 .NET 對於讀寫權限的設置修改這事，目前還沒有跨平台性的方法。
所以 .NET 沒有方法在程式中設置具名管道的讀寫權限。

我目前的做法有兩種，提供各位參考。

1. 如果是在 Linux/macOS 上跑，用指令 chmod 修改 socket 的讀寫權限為 664 (ug+w) 或 666 (a+w)。
2. 讓服務端和客戶端都用同一個使用者身份執行。這是通用做法。提醒 Windows 使用者，如果你想把具名管道的服務端程式設為系統服務啟動的話，那不能用預設的 SystemService 身份。
 