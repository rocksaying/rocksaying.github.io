---
title: How to use the select(), an I/O Multiplexer
category: programming
old-category: C/C++/C#/Java
tags: [unix,linux,select,ipc,multi-process]
---

根據《<a href="http://www-128.ibm.com/developerworks/linux/library/l-async/">Boost application performance using asynchronous I/O</a>》一文所做的區分，在 POSIX 上的 I/O 處理模式可分為四種。該文所舉的 POSIX AIO API 是晚近較新的處理模式，是 POSIX.1b 基於 realtime system (即時系統、實時系統) 之需求而定的規範內容，其概念是事件驅動模式， AJAX 中的 XMLHttpRequest 調用方式就是這種模式。在 POSIX 傳統上的非同步 I/O 模式 (即 Asynchronous blocking I/O) ，則是使用 select() 來達成。本文將說明這種傳統模式的使用方式。

<!--more-->

### Synchronous I/O

讓我們回想一下，當我們需要從一個設備中讀取或寫入資料時，我們通常很直覺地使用輸出入函數，如系統呼叫 read() 及 write() 等，而沒有想到先確認目標設備中是否已經存有資料可供處理。例如:

{% highlight c linenos=table %}
read(fd, buf, len);

write(fd, buf, len);
{% endhighlight %}

這是因為系統也很清楚不能預期每次要對設備進行資料的輸出入時，設備裡都剛好有資料可以處理。有太多理由使得系統必須等待設備，因此每當目標設備無法立即處理待輸出入的資料時，系統便會自動擱置 (blocking) 目前的工作，亦即將目前工作的工作進程停在輸出入函數的地方，如 read(), write() 處，等到目標設備可以處理資料時，才結束等待的動作，繼續下一個步驟。這樣的做法很合理，也是大多數程式常碰見的情形，程式一次只需要處理一個設備的輸出入即可，例如從鍵盤取得使用者輸入，從檔案讀取記錄，再寫入另一個檔案，都是一個步驟只需處理一個設備，當這個設備暫時無法處理資料時，自然希望它能自動停在那邊，等資料來到。例如:

{% highlight c linenos=table %}
puts("Do you sure? (Y/N):");
if( getchar() != 'Y' )
    return;
read(fin, buf, len);
write(fout, buf, len);
{% endhighlight %}

上面的程式碼是很典型的設計模式。 Programmer 預期能先從 getchar() 取得使用者的輸入內容後，才開始做 read() ，再做 write() ，系統的動作也很符合設計者的預期，先停在 getchar() 處，等使用者從鍵盤輸入一個字元後，才決定要不要繼續下一個步驟。由於程式碼中的每一個動作，都必須等待上一行的動作結束才會跟著執行，前面的進一步，後面的才能跟進一步，因此這種處理方式被稱為「同步處理 (Synchronous process)」。

不過也有上面的情形無法處理的時候，例如，你正在寫一個使用者對談程式，此時你將有至少兩個資料輸入來源，一個來自本地使用者的鍵盤輸入，及一個來自交談對方的鍵盤輸入，更糟的是，你無法預期哪個設備何時會有資料進入。以下列程式碼為例，說明程式將會碰到哪些典型狀態。

{% highlight c linenos=table %}
fgets(mystr, sizeof(mystr), stdin);
fputs(mystr, strlen(mystr), hisout);
printf("I say: %s", mystr);

fgets(hisstr, sizeof(hisstr), hisin);
printf("He says: %s", hisstr);
{% endhighlight %}

1. 當本地使用者尚未輸入一行文字時，本地行程將會擱置在第 1 行 fgets(mystr ...) ，等本地使用者輸入。
2. 然而當本地行程正在等待本地使用者輸入時，對方的行程可不知道這種情形，且對方比本地使用者早輸入完一行文字。亦即對方比本地使用者更早進行到第 5 行 fgets(hisstr ...) 處，等待本地使用者送來的資料。
3. 雖然對方已經輸入完一行文字了，但是本地使用者還沒輸入，本地行程仍然擱置在第一行   fgets(mystr ...) ，因此本地使用者還看不到對方輸入的內容。
4. 結果當本地使用者還沒輸入一行文字前，本地使用者看不到對方輸入的內容。同時，對方也在等取得本地使用者輸入的文字，而無法繼續輸入。

### Asynchronous blocking I/O

對於這種情形。在 Unix 系統中的 SVR4 及 BSD 家族，都提供了一個 API: select() ，處理需要同時面對多個輸出入設備時的情形。簡單地說， select() 是一個多重發訊器 (multiplexer) ，可以同時監視多個輸出入設備，並且選出最快能處理資料的設備，讓行程可以順利的進行下一個工作，減少等待的時間。再以剛說的對談程式為例，利用 select() 改寫後如下:

{% highlight c linenos=table %}
FD_SET(fileno(stdin), &readmask);
FD_SET(fileno(hisin), &readmask);
select(2, &readmask, NULL, NULL, NULL);
if( FD_ISSET(fileno(stdin), &readmask) ) {
    fgets(mystr, sizeof(mystr), stdin);
    fputs(mystr, strlen(mystr), hisout);
    printf("I say: %s", mystr);
}
else if( FD_ISSET(fileno(hisin), &readmask) ) {
    fgets(hisstr, sizeof(hisstr), hisin);
    printf("He says: %s", hisstr);
}
{% endhighlight %}

* 第 1 行: 將 stdin 加入 readmask 變數中，此 readmask 變數將傳給 select() ，告訴 select() 有 stdin 這個設備等著要讀取資料。
* 第 2 行: 將 hisin 加入 readmask 變數中，告訴 select() 有 hisin 這個設備等著要讀取資料。
* 第 3 行: 執行 select() ，此時 select() 將會等待 stdin 及 hisin 兩個設備，並將最快有資料可處理的設備代號，儲在 readmask 中傳回。
* 第 4-8 行: 如果目前有資料可處理的設備是 stdin ，則讀取目前使用者的輸入。
* 第 9-12 行: 如果目前有資料可處理的設備是 hisin ，則讀取對方的輸入。

透過 select() ，程式將可以馬上處理已經有資料到來的設備，而不必枯等尚無資料到來的設備。上述運用 select() 的模式是 Unix 系統傳統的非同步 I/O 處理模型 (Asynchronous blocking I/O) ，然而 select() 雖然是一個具普遍性的 API ，在 SVR4 及 BSD 中都有提供，但卻是一個行為多變的 API ，在不同系統間存在不同的行為表現。 <a href="http://man-wiki.net/index.php/2:select">select() 的原型</a>及其行為異同如下列。

{% highlight c linenos=table %}
/* According to POSIX 1003.1-2001 */
#include <sys/select.h>

/* According to earlier standards */
#include <sys/time.h>
#include <sys/types.h>
#include <unistd.h>

int select(int maxfd, fd_set *readfds, fd_set *writefds,
    fd_set *execptfds, struct timeval *tvptr);

FD_CLR(int fd, fd_set *set);
FD_ISSET(int fd, fd_set *set);
FD_SET(int fd, fd_set *set);
FD_ZERO(fd_set *set);
{% endhighlight %}

### 共同行為

1. maxfd 表示放入三組 fd_set 中的設備代號中，號碼最大的那個再加 1 <del>共有幾個設備要 select() 處理</del>，這樣 select() 才方便決定它要探詢的設備範圍。
2. readfds 儲存要處理的輸入設備的檔案描述詞的集合。
3. writefds 儲存要處理的輸出設備的檔案描述詞的集合。
4. execptfds 儲存有突發狀態發生的設備的檔案描述詞的集合。
5. tvptr 表示要求 select() 等待的時間。
6. 在回傳值上，當有錯誤發生時，回傳 -1 並設定 errno 的值。當超過 select() 的等待時間時，回傳 0 ，表示處理逾時。當有設備可以處理時，則回傳大於 0 的值。

### 各平台間的差異

1. 在 BSD 上，如果同一個檔案描述詞在兩個檔案描述詞的集合都可以處理時(例如 readfds 及 writefds) ，則 BSD 將回傳 2 ，表示有兩個設備可以處理了。而在 SVR4 上，永遠只回傳 1 ，視為一個。
2. 在 BSD 系統中， tvptr 的內容，被視為唯讀的，當 select() 回傳結果後， tvptr 的內容不會被改變。即使 select() 是被 signal 所中斷，系統也不會改變 tvptr 的內容。在 Linux 中 (不是指 SVR4 ，我不知道 SVR4 是如何處理 tvptr 的) ，則會改變 tvptr 的值，將可等待的時間減掉實際等待的時間，所得到的剩餘時間存在 tvptr 中回傳。這個做法在碰到 select() 被 signal 中斷時，是相當有用的。
3. 在 winsock 中， maxfd 沒有意義，純粹為了相容 unix 系統而存在。

#### 通用性 select() 使用模式

{% highlight c linenos=table %}
struct timeval timeout;
#if !defined( LINUX )
time_t lasttime;
#endif
/* 在 LINUX 系統中， lasttime 不需要用到，下面會說明 */

#if !defined( LINUX )
lasttime = time(NULL);  /* 保存目前時間(秒數) */
#endif
timeout.tv_sec = nsec;  /* 設定要 select() 等待的時間 */
timeout.tv_usec = 0;

while( some_condition ) {
  rc = select( nfds, &readfds, &writefds, &execptfds, &timeout );
  if( rc < 0 ) { /* 有錯誤發生 */
    if( errno == EINTR ) { /* 被 signal 中斷了 */
      /* 扣掉已經等待的時間後，再繼續呼叫 select() 等待剩餘的時間。
         由於 LINUX 系統會自動扣掉已等待的時間，所以我們不需要自已動手。*/
      #if !defined( LINUX )
      timeout.tv_sec -= (time(NULL) - lasttime);
      lasttime = time(NULL);
      #endif
      continue;
    }
    else
      abort();
  }
  else if( rc == 0 ) {  /* TIMEOUT */
    . . .
  }
  else { /* 有設備可以處理 */
    if( FD_ISSET( . . . ) )  /* 判斷是哪個設備可以處理 */
      . . .
  }
  #if !defined( LINUX )
  lasttime = time(NULL);
  #endif
  timeout.tv_sec = nsec;
  timeout.tv_usec = 0;
  /*
  雖然已知目前的 BSD 系統不會變更 timeout 的內容，但是不保證未來的
  BSD 系統及其他的系統如 SVR 等也不會變更 timeout 的內容，因此還是
  再設定一次後，才繼續使用 select() 等待下一個可處理的設備，是比較
  可靠的做法。
  */
}
{% endhighlight %}

###### 相關文章

* <a href="{{ site.baseurl }}/archives/2010/Ajax%20and%20Blocking%20IO%20-%20To%20Resolve%20Polling%20Anti-pattern.html">Ajax and Blocking IO - To Resolve Polling Anti-pattern</a>

<div class="note">樂多舊網址: <a href="http://blog.roodo.com/rocksaying/archives/2333878.html">http://blog.roodo.com/rocksaying/archives/2333878.html</a><br/>
First edition: 1998-10-01 [<a href="http://home.educities.edu.tw/shirock/comp/How_to_use_select.txt">How to use select()</a>]</div>