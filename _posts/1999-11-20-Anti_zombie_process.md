---
title: Unix/Linux 系統程式 - 防止 zombie 程序產生
category: programming
tags: [unix,linux,posix,service]
lastupdated: 2021-11-30
---

### 前言

在 Unix 系統中，程序間有父子關係存在，當程序經由系統呼叫 `fork()` 產生另一個程序時，這兩個程序間就存在了父子關係。

當子程序結束時，系統會將子程序的結束狀態保存起來，接著發出訊號 `SIGCHLD` 通知父程序來取子程序的結束狀態碼，通常是透過系統呼叫 `wait()` 取得。如果父程序比子程序早結束的話，則子程序將成為孤兒，那麼系統會將此孤兒交給程序 *init* (unix 系統第一個執行的程序，一定叫 init ，因此它的 pid 為 0) ，由 init 程序取得子程序的結束狀態碼。

不論是由父程序還是 init 程序取得，當子程序的結束狀態碼被取出後，系統就會將子程序的狀態資訊從處理程序表中移除。到此，一個程序才算是整個結束掉。

如果父程序仍然存在，但是卻忘了處理子程序結束的事情，那麼系統會將此子程序的結束狀態碼一直保存在處理程序表中，直到父程序處理為止。在父程序處理之前，就會形成一個 zombie 程序。已經完全沒有活動，所使用的資源也都被系統回收了，但是仍然佔了處理程序表的一筆記錄。

<!--more-->

因為系統對於 `SIGCHLD` 訊號的處理方式預設是不理會，如果父程序忘了設定捕捉 `SIGCHLD` 訊號，也沒有使用 `wait()` 去等待子程序結束的話，就會出現 zombie 程序。

這種情形通常發生在 deamon 程式或專門在背景運作的程式的身上。由於設計者的疏失，導致 zombie 程序的產生，消耗處理程序表的空間。當處理程序表的空間被佔滿後，則系統將無法將產生任何程序執行新的工作。

一般的程式由於生命週期有限，所以通常不需在意這個問題。當父程序的生命週期結束後，子程序就成為孤兒，被系統交給 init 程序處理掉了。

但對一個 deamon 來說，由於生命週期無限，這個問題就不得不處理了。以下有幾個方法可以解決這個問題:

### 1. 利用兩次 fork() 形成祖孫關係

由於系統只承認程序間的父子關係，並不承認祖孫關係，這樣可讓新生的程序在結束時自然地形成孤兒，由系統交給 init 程序執行。

```c

if ( fork() ) {
    if ( fork() ) {
        exit(0); // (父程序) 
    }
    else {
        . . . // (孫程序) 
    }
}
else {
    . . . // (祖程序) 
}

```

這個方法，適用在所有的系統中，不管是 BSD 還是 System V (SVR) 都可以，缺 點是要跑兩次 `fork()`。但使用這個方法時，請確定父程序完全不需要知道子程序的結束狀態。 

註:

* System V Release = SYSV = SVR
* SVR4 = System V Release 4.0
* Linux 的 signal 處理策略偏向 SYSV 。

### 2. SYSV 可忽略子程序的結束狀態

在 SYSV 系統，如果不需要知道子程序的結束狀態，父程序可以明確地告訴作業系統它忽略子程序的結束狀態。作業系統在子程序結束時，就會直接將子程序的資訊從處理程序表中移除，不再通知父程序。 

```c

signal(SIGCHLD, SIG_IGN); 

```

特別注意的是，雖然 `SIGCHLD` 的預設處理方式就是忽略，但對作業系統而言，預設處理方式是 `SIG_DFL` ，跟設定為 `SIG_IGN` 的意義不同。如果不明確地設定 `SIGCHLD` 訊號的處理方式為 `SIG_IGN` ，作業系統仍然會通知父程序。

由於 POSIX 中，沒有定義 `SIGCHLD` 設定為 `SIG_IGN` 的後續動作，因此這個方法不能用於非 SYSV 的系統。

### 3. BSD 系統要捕捉 SIGCHLD

BSD 系統則必須捕捉 `SIGCHLD` 訊號，如下:

```c

void reapchild() { 
    while( wait(NULL) <= 0 ) {
        /*NOTHING*/; 
    }
} 
.
.
.

signal(SIGCHLD, reapchild);

```

這個方法仍然是在父程序確定不需要子程序結束狀態時用的。

這個方法只適用於 BSD 系統。這是由於 `signal()` 的處理策略存在系統間的差異。在 BSD 系統上，當一個訊號發生並且被捕捉後，系統仍然會繼續使用舊的設定。但在 SYSV 的系統上，當一個訊號發生並被捕捉後，系統會自動重設此訊號的處理方式為 `SIG_DFL` ，這樣上面的寫法就會有問題: `reapchild()` 只能用一次。

在 SYSV 系統中，應用第二種方法，或改用 POSIX 定義的 `sigaction()` 取代 `signal()`、或修改 `reapchild()` 的寫法，改成:

```c

void reapchild() { 
    signal( SIGCHLD, reapchild); // 加上再設定的動作。 
    while( wait(NULL) <= 0 ) {
        /*NOTHING*/; 
    }
} 

```

修改後的內容，可以同時適用在 BSD 或 SVR 的系統上。

### 4. 使用 sigaction 捕捉結束狀態

如果父程序想知道子程序的結束狀態，那只有捕捉 `SIGCHLD` 的方法可用了。為了避免 `signal()` 在系統上的行為差異，這裡是用 `sigcation()` 。

```c

int child_stat; 

void reapchild() { 
    while( wait(&child_stat) <= 0 ) {
        /*NOTHING or your code*/; 
    }
} 

struct sigaction act; 
act.sa_handler = reapchild; 
act.sa_flags = SA_NOCLDSTOP; 
sigaction( SIGCHLD, &act, NULL); 

```

由於 `SIGCHLD` 在子程序暫停時也會產生，但這裡要處理的是子程序結束的情形，而不是子程序暫停，所以加上了 `SA_NOCLDSTOP` 的設定，要求系統在子程序暫停時，不要對父程序發出 `SIGCHLD` 訊號。

PS. sigaction(), struct sigaction, SIGCHLD, SA_NOCLDSTOP 都是 POSIX 有定義的。

如果真的想用 `signal()` (雖然我不知道有什麼理由非用不可)，請參考第三種方法中，關於 SVR 適用問題的修改內容。

最後在補充一點。這裡討論的方法是假設這是一個非同步多工程式，在同一時間需要產生多個子程序同時工作。在此非同步工作的情形下，父程序為了掌握子程序的動態，只有捕捉 `SIGCHLD` 訊號。

而如果這是一個同步工作程式，父程序需等待子程序完成才能繼續後來的工作時，就不需要捕捉 `SIGCHLD` ，直接利用系統呼叫 `wait()` 即可。

例如:

```c

if( fork() == 0 ) { 
    /* 子程序 */
} else { 
    /* 父程序 */
    while( wait(NULL) < 0 ) { 
        /* 等待子程序結束 */ 
        if( errno == EINTR ) {
            continue; 
        }
        else if ( errno == ECHILD ) {
            FATAL("There are no children process!"); 
        }
    } 

    /* 子程序結束後，才可進行的工作 */ 
} 

```
