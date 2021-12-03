---
title: Unix/Linux 系統程式 - deamon 程式的初始動作
category: programming
tags: [unix,linux,posix,service]
lastupdated: 2021-11-30
---

由於 deamon 有下列的特殊行為，所以最好進行初始動作，才不會產生問題。

* 通常在系統啟動時即開始活動，而且不會結束。
* 通常是以 root 的身份啟動的。
* 通常在背景執行。
* 通常不受終端機控制，也不對終端機做輸出入。

<!--more-->

初始動作有下列幾項，順序不固定，也不是每個動作都需要。

#### 1. 變更工作目錄

一般說來最好是變更到根目錄，這是因為根目錄不會或不可能被卸下的緣故。

如果沒有變更工作目錄，或將工作目錄變更到一個子目錄下，則會產生無法將該目錄卸下的副作用。

另外一個好處時，當這個 deamon 需要處理到檔案時，先變更工作目錄到一個明確的地方，可以避免在處理檔案時，找不到檔案或搞錯路徑。

變更到根目錄下:

```c

chdir("/");

```

#### 2. 設定新的 umask (檔案建立時的屬性遮罩)

設定新遮罩值一般有兩種選擇。

```c

/* (1) 高限制、高安全性 */

umask( 077 );

/* (2) 無限制 */
umask( 0 );

```

#### 3. 關閉所有設備

避免從父程序處繼承了已開啟的設備，影嚮其他程序對該設備的存取。
因為一個 deamon 是一直在系統中活動的，如果它握有一個設備卻又不使用的話，
除了增加系統負擔外，也會影嚮其他程序處理該設備的動作。

想得知系統最大可開啟的設備數並關閉的話，在 POSIX 相容系統的作法如下:

```c

int nfds = sysconf(_SC_OPEN_MAX);
for (i=0; i < nfds; i++)
    close(i);

```

`sysconf(_SC_OPEN_MAX)` 可用一個巨集 `_POSIX_OPEN_MAX` 替代，但是 `sysconf(_SC_OPEN_MAX)` 是執行時期取得，而 `_POSIX_OPEN_MAX` 卻是編譯時期即已決定，缺少彈性，不建議使用。例如原先系統的最大可開啟設備數為 32 ，但更新或升級系統後，此值增加到 64 。如果程式是用 `_POSIX_OPEN_MAX` 的話，就需要重新編譯一次。而用 `sysconf()` 的話就不需要。

在 BSD 系統的作法如下:

```c

int nfds = getdtablesize();
for(i=0; i < nfds; i++)
    close(i);

```

#### 4. 切換至背景執行

產生一個子程序，則這個子程序就會自動進入背景執行，而父程序則結束。如此即可讓 deamon 切換至背景執行。

```c

if ( fork() ) {
    exit(0);
}

... // 背景執行。以下才是 daemon 工作內容

```

#### 5. 設定程序的有效使用者及使用群 ID

除非必要，不要設為 0 (root) 。

早期要自己建立一個無用的使用者和群組。但 Linux 和 BSD 目前都會建立 *nobody* 使用者和群組。這一般就是給 daemon 這類工作用的。

```c

if ( setuid( new_uid ) )
    exit(0);
if ( setgid( new_gid ) )
    exit(0);

```

如果無法設定的話，最好將程序結束，避免程序以一般身份執行產生安全漏洞。

#### 6. 建立新的活動期間 (session) ，並脫離原控制終端機

將自已設為一個活動期間，脫離原來的活動期間，如此將使自已脫離原來的程序群。
脫離原來的程序群意味的是，自已將形成一個新的程序群，使自已不受舊有的工作控制訊號的影嚮。

由於 deamon 都是在背景執行的，不需要終端機，同時為了避免受到控制終端機的影嚮，最好脫離控制終端機。

```c

setsid();

```

呼叫 `setsid()` 的結果是:

1. 將擁有新的活動期間以及處理程序群，同時自已將成為新處理程序群的領導。
2. 將脫離原來的控制終端機，但不會再產生一個新的控制終端機。

`setsid()` 是 POSIX 所定義的方法，BSD 及 SVR4 的方法則是 `setpgrp()`，但兩者雖然名稱相同，卻用法不同，我也忘了如何用。

#### 7. 設定工作控制訊號的處理方式 - 不理會

必須設定 SIGTSTP, SIGTTIN, SIGTTOU 三個來自控制終端機的工作訊號的處理方式為不理會。
這是因為這三個工作訊號的預設方式為暫停程序動作，這對一個 deamon 程序而言，是不必要的。

設定方式:

(1) Standard ANSI C: signal()

```c

#ifdef SIGTSTP
signal( SIGTSTP, SIG_IGN );
#endif
#ifdef SIGTTIN
signal( SIGTTIN, SIG_IGN );
#endif
#ifdef SIGTTOU
signal( SIGTTOU, SIG_IGN );
#endif

```

(2) POSIX.1 : sigaction()

```c

struct sigaction act;
act.sa_handler = SIG_IGN;
#ifdef SIGTSTP
sigaction( SIGTSTP, &act, NULL );
#endif
#ifdef SIGTTIN
sigaction( SIGTTIN, &act, NULL );
#endif
#ifdef SIGTTOU
sigaction( SIGTTOU, &act, NULL );
#endif

```

在 POSIX 中，並沒有定義 `signal()` ，它是 ANSI C 定義的。 POSIX 規範建議使用 `sigaction()` 。
不過既然 `signal()` 在 ANSI C 中有定義，同時在不理會訊號 (SIG_IGN) 的處置方式上並沒有系統差異，所以設定忽略訊號時，用 `signal()` 比較方便。

雖然 SIGTSTP, SIGTTIN, SIGTTOU 三個訊號在 POSIX 中有定義，但因為這三個屬於工作控制訊號，有些系統並不需要或沒有定義，因此判斷其是否已定義可以減少移植上的困擾。

另外，有兩個訊號可以設定用途。

1. `SIGTERM`:
  軟體終結訊號。daemon 一般會設計捕捉這個訊號以進行終止服務前的資源釋放動作。這個訊號是指令 kill 預設送出的訊號。此訊號在 ANSI C 中即有定義，其值為 15 。
2. `SIGHUP`:
  掛斷訊號。原本此訊號來自終端機離線，對一個已脫離終端機的 daemon 來說，這個訊號沒有意義。但一般都會捕捉這個訊號，把這個訊號當作暫停(stop)或重新啟動(restart)、載入(reload)的通知。這個訊號在 ANSI C 中有定義，其值為 1 。
