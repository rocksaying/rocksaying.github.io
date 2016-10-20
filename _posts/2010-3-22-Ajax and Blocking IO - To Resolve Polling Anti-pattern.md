---
title: Ajax and Blocking IO - To Resolve Polling Anti-pattern
category: programming
old-category: Programming
tags: [javascript,PHP,ajax,polling,Blocking IO,D-Bus]
permalink: /archives/12010463.html
---

在 Web 應用上，當瀏覽器向伺服端索取資料，而資料尚未存在或尚未被輸入時，我們通常令伺服端回傳代表目前無資料的訊息，並告知使用者稍候再讀取。當 JavaScript 被帶入 Web 應用程式開發領域後，我們在客戶端設計上，便運用 JavaScript 在間隔一段時間後，主動地向伺服端查詢是否有資料可以讀取。由於這個動作是放在一個無窮迴圈中，令它反覆地向伺服端執行查詢動作，故而我們將之稱為「輪詢」(polling)。


然而這種普遍地解法，實際上是一種反模式(Anti-pattern)，也就是把反面的例子當成正確的做法(<span class="note">當我正在思考該如何表達這種普遍地錯誤形式時，我剛好瞄到桌上的《Java AntiPattern》， Anti-pattern 正是貼切描述這種情形的詞語</span>)。在早期，瀏覽器的功能還很單純時，我們沒有別的選擇，只能使用這種輪詢式的解法。但隨著瀏覽器的功能強化與 Ajax 技術的普及，繼續使用輪詢式解法，就是反模式。正確地做法是，我們要在 Ajax 這種非同步設計模式中，導入同步 I/O 行為。在本文中，將說明如何運用 Blocking IO 解決 Ajax 設計中的輪詢反模式。

<!--more-->

### Polling anti-pattern

我先用 Ajax 設計一個輪詢反模式的範例。

<div class="note">
本文所有程式碼，都是設定放置於 <var>/workspace/blocking_io/</var> 的 URL 目錄下。實際操作時，請按你自己的 Web server 設定修改。
</div>

###### nonblocking_io_get.php

下列程式碼段落是伺服端內容。它的工作很簡單，當它被調用時，若有資料就讀出來回傳給瀏覽器，沒資料就回傳空資料。很典型的處理方式。

{% highlight php %}
<?php
if (file_exists('/tmp/nonblocking_io_get.txt')) {
    $s = file_get_contents('/tmp/nonblocking_io_get.txt');
    echo $s;
}
else {
    exit(0);
}
?>
{% endhighlight %}

###### nonblocking_io_get.html

接著是瀏覽器(客戶端)的輪詢做法。

{% highlight html %}
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8">

<script type="text/ecmascript">
var board;
function handler() {
    if (this.readyState == 4 && this.status == 200) {
        if (this.responseText.length > 0) {
            board = document.getElementById('board');
            board.innerHTML = '<pre class="language-text">' + this.responseText + '</pre>';
        }
        nonblocking_get();
        //alert('time out');
        //setTimeout(nonblocking_get, 1000);
    }
}

function nonblocking_get() {
    var client = new XMLHttpRequest();
    client.onreadystatechange = handler;
    client.open("GET", "/workspace/blocking_io/nonblocking_io_get.php");
    client.send();
}

nonblocking_get();
//setTimeout(nonblocking_get, 1000);

</script>
<style type="text/css">
.board {
  border: 1px solid black;
  padding: 5px;
  margin: 5px;
  float: left;
}
</style>
</head>
<body>
<div id="board" class="board">Waiting (Nonblocking mode)</div>
</body>
</html>
{% endhighlight %}

客戶端使用 <dfn>XMLHttpRequest</dfn> 以非同步方式向伺服端輪詢資料。這種做法的最大問題就在於它絕大多數時候索取到的內容是空資料，於是它不停地產生新的 XMLHttpRequest 探詢資料，又繼續得到空資料。整個行程的執行週期都浪費在產生 XMLHttpRequest 與探詢資料上了。我們可以監看 CPU 的使用率觀察這點。如下圖所示，儘管什麼資料都沒拿到，瀏覽器仍然佔用了 70% 的 CPU 使用率。它全用在輪詢動作。

<img src="{{ site.baseurl }}/images/91b9b054.png" alt="輪迴模式下的 CPU 使用狀態" />

在這個反模式下，稍微聰明的做法是設定時間間隔，例如用 <code>setTimeout()</code> ，令程式每隔一段時間才執行下一次探詢動作。但它仍然沒有徹底地消除不必要的輪詢行為與其資源耗費。

### Blocking IO

讓我們暫時放下 Web 程式，回到最基礎的終端機(文字模式)程式上。當我們的文字模式程式需要讀取使用者或另一端輸入的資料時，我們往往直覺地使用 read 方法，而且結果通常都如我們所願。編程初學者甚至不會注意到當程式執行到 read 方法，而資料來源尚無資料可讀取時，系統會發生什麼事？我們能夠用如此簡單的模式設計資料輸入動作的原因，在於作業系統預設的資料輸出入模式是 Blocking IO ，一種基本的同步輸出入模式。

在 Blocking IO 模式下，當設備內容中沒有資料可供讀取時，所有對此設備的資料讀取動作都會被作業系統擱置。直到有資料被寫入設備中時，作業系統才會主動喚醒被擱置的行程，讓它繼續執行資料讀取動作。這種處理策略在多工模式下更顯重要，作業系統介入輸出入過程中的行程等待行為，主動擱置與喚醒行程，有效地避免行程執行多餘地輪詢動作。對程序員而言，它也簡化許多設計工作。可閱讀《<a href="{{ site.baseurl }}/archives/2333878.html">select() - I/O Multiplexer</a> 》了解更多內容。

接下來我將以 POSIX Named Pipe (具名管線)為例，示範如何在伺服端運用 Blocking IO 機制，解決 Ajax 的輪詢反模式。

<div class="note">
我在本文中採用 PHP5 設計伺服端程式。雖然 Windows 也支援 POSIX 所規範的 Named Pipe ，但是而 PHP5 Win32 的 POSIX 模組並不支援 Windows 的 Named Pipe 。所以本文的伺服端程式只能運作在 Unix 家族平台。
</div>

### Under reading...

HTTP 協定基本上是以「文件」為處理單位。客戶端發出的每一次請求，就是要在一個連線動作中拿回一份文件。在一般的 Web 應用系統中，客戶端會持續從連線中讀取資料，當伺服端關閉連線時，客戶端就認為伺服端已經將文件內容完整送出了(<span class="note">如果伺服端有送出 <dfn>Content-Length</dfn> 標頭，那客戶端就以其指示的資料位元組數判斷文件是否完整</span>)。

由於 Web 應用系統是建構在 HTTP 協定之上，也就承繼了這種以「文件」為單位的處理策略。在以往，我們只關心文件完整取回後的工作。所以在 <dfn>XMLHttpRequest</dfn> 的事件處理方法中，我們總是把後續的資料處理工作放在 <code>if (this.readyState == 4 && this.status == 200)</code> 的段落中。如果你曾研讀過 <a href="http://www.w3.org/TR/XMLHttpRequest/">XMLHttpRequest 規範</a>，你當知道上述條件式代表著文件被完整讀取了。

但我們應當知道，文件並不是一瞬間就被伺服端送出，也不是一瞬間就被客戶端讀取。那麼在這段送出與讀取的時間中，發生了什麼事？答案是，伺服端會一塊一塊地送出資料，而客戶端也是一塊一塊地讀取資料。在 Ajax 中，客戶端指的是 <dfn>XMLHttpRequest</dfn>，所以 <dfn>XMLHttpRequest</dfn> 將一塊一塊地讀取資料。每當它讀到一塊資料時，就會觸發一次 <code>onreadystatechange</code> 事件。此時  <var>readyState</var> 之值將被設定為 3；而新讀到的資料塊，將被添加到 <var>responseText</var> 的尾端。

###### blocking_io_get.php

下列的伺服端程式，讀取自己的內容，然後一行一行地輸出到客戶端。但是在每一行之間，停頓1秒，以便我們觀察 <code>onreadystatechange</code> 被觸發的現象。

{% highlight php %}
<?php
$fh = fopen(__FILE__, 'r');
while ($buf = fgets($fh)) {
    echo htmlentities($buf);
    flush();
    sleep(1);
}
fclose($fh);
?>
{% endhighlight %}

###### blocking_io_get.html

下列客戶端程式示範了在資料讀取過程中的 <var>readyState == 3</var> 的狀態。由於伺服端故意在傳送每行資料之間停頓一秒，所以我們可以很明顯地觀察到 <code>onreadystatechange</code> 被觸發的現象: 每隔一秒，頁面上的區塊內容就會增加一行。

{% highlight html %}
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8">

<script type="text/ecmascript">
function handler() {
    if (this.readyState == 4 && this.status == 200) {
        alert(this.status + ' : ' + this.responseText);
        //blocking_get();
    }
    else if (this.readyState == 3) {
        //alert(this.status + ' : ' + this.responseText);
        var board = document.getElementById('board');
        board.innerHTML = '<pre class="language-text">' + this.responseText + '</pre>';
    }
}

function blocking_get() {
    var client = new XMLHttpRequest();
    client.onreadystatechange = handler;
    client.open("GET", "/workspace/blocking_io/blocking_io_get.php");
    client.send();
}

blocking_get();

</script>
<style type="text/css">
.board {
  border: 1px solid black;
  padding: 5px;
  margin: 5px;
  float: left;
}
</style>
</head>
<body>
<div id="board" class="board">Waiting</div>
</body>
</html>
{% endhighlight %}

<img src="{{ site.baseurl }}/images/f9a14ea4.png" alt="blocking_io_get.html 的執行過程畫面" />

### Working with Pipe

我將設計一個模擬聊天室，它有一個頁面做為訊息顯示版面，它實際上是透過 <dfn>XMLHttpRequest</dfn> 調用伺服端的 board_get.php 取得新訊息。另一個頁面則是 board_post.php ，用於輸入與張貼訊息。board_get.php 和 board_post.php 是透過一個具名管線(Named Pipe)來傳遞訊息。 board_post.php 向管線寫入訊息，故我將它稱為管線的 poster ；board_get.php 自管線讀取訊息，故我將它稱為管線的 getter 。

###### board.html

下列是模擬聊天室的訊息顯示版面，我設定了2個發話者: rock 與 john。他們的發話內容各自顯示在自己的區塊上。

{% highlight javascript %}
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8">

<script type="text/ecmascript">
function handler(xhr, recipient) {
    if (xhr.readyState == 4 && xhr.status == 200) {
        //alert(xhr.status + ' : ' + xhr.responseText);
        var board = document.getElementById(recipient.name);
        board.value = xhr.responseText + board.value;
        recipient.blocking_get();
    }
}

function Recipient(name) {
    this.name = name;
}

Recipient.prototype.blocking_get = function() {
    var client = new XMLHttpRequest();
    var recipient = this;
    client.onreadystatechange = function() {
        handler(this, recipient);
    };
    client.open("GET", "/workspace/blocking_io/board_get.php?name=" + this.name);
    client.send();
}

recipient1 = new Recipient('rock');
recipient2 = new Recipient('john');
recipient1.blocking_get();
recipient2.blocking_get();
</script>

<style type="text/css">
.board {
  border: 1px solid black;
  padding: 5px;
  margin: 5px;
  float: left;
}
</style>
</head>
<body>
<div class="board">
  <label for="rock">rock say:</label><br/>
  <textarea id="rock"></textarea>
</div>

<div class="board">
  <label for="john">john say:</label><br/>
  <textarea id="john"></textarea>
</div>

</body>
</html>
{% endhighlight %}


###### board_get.php

在這個模擬聊天室中，每一個發話者實際上配置一個具名管線。 getter 將會從管線上讀取發話者透過 poster 送來的訊息。藉由 Blocking IO 機制，當發話者尚未送來訊息前，它會被擱置在 <code>fgets($fh)</code> 處，等待系統喚醒。在擱置期間，此 HTTP 連線仍持續存在，而客戶端也會被擱置在等待接收資料處，不會觸發任何 XMLHttpRequest 事件。換句話說，伺服端與客戶端都處於閒置狀態，不會執行任何動作。

{% highlight php %}
<?php
require_once 'board_init.php';

$fh = fopen(PIPE, 'r');
while ($buf = fgets($fh)) {
    echo $buf;
}
fclose($fh);

?>
{% endhighlight %}

###### board_post.php

用瀏覽器開啟 poster ，它會顯示一個文字欄位表單供使用者輸入訊息。送出表單後，poster 就會開啟伺服端的具名管線，將訊息寫入管線。

{% highlight php %}
<?php
require_once 'board_init.php';

if (isset($_POST['message']) and !empty($_POST['message'])) {
    $fh = fopen(PIPE, 'a');
    fputs($fh, $_POST['message']);
    fclose($fh);
}

?>
<html>
<script type="text/ecmascript">
window.onload = function() {
    document.getElementById('message').focus();
}
</script>
<?php if (isset($_GET['name']) and !empty($_GET['name'])):?>
  <form method="post">
    <label for="message"><?=$_GET['name']?></label>
    <input id="message" name="message" type="text" />
    <button type="submit">Send</button>
  </form>
<?php else:?>
  <a href="<?=$_SERVER['REQUEST_URI'].'?name=rock'?>">Rock speaking...</a><br/>
  <a href="<?=$_SERVER['REQUEST_URI'].'?name=john'?>">John speaking...</a><br/>
<?php endif;?>
</html>
{% endhighlight %}

###### board_init.php

下列為 getter 與 poster 共用的管線初始化程式。

{% highlight php %}
<?php
if ( !isset($_GET['name']))
    $_GET['name'] = '';

define('PIPE', '/tmp/board_fifo_' . $_GET['name']);

if ( !function_exists('posix_mkfifo')) {
    echo "Your PHP environment does not support POSIX FIFO.\n";
    exit(1);
}

if ( !file_exists(PIPE)) {
    if ( !posix_mkfifo(PIPE, 0666)) {
        echo "Create " . PIPE . " error\n";
        exit(1);
    }
}
?>
{% endhighlight %}

<img src="{{ site.baseurl }}/images/d4b46c19.png" alt="模擬聊天室的執行畫面" />

###### 結語

上列程式以精簡的方式展現了 Blocking IO 在 Ajax 設計上的應用，解決了輪詢反模式(Polling anti-pattern)問題。不過在實際應用上， Pipe 是有所不足的，我們通常要規劃另一種行程間通訊機制。以本文的模擬聊天室為例，它之所以是「模擬」的，就在於 Pipe 中的每一筆資料，只能被一個行程讀取一次而己，它不能把一筆訊息送給每一個等待中的行程。如果你開啟兩個訊息顯示頁面視窗，那麼你將發現 poster 送出的訊息，只會在其中一個顯示頁面中出現。

在我眼中，PHP 是最方便用於示範與驗證 Web 設計概念的工具。所以本文的伺服端程式，我選擇用 PHP 實作。但在應用上，我將用 Ruby on Rails 配合 Ruby-dbus 實作。用 Ruby 撰寫一個 D-Bus service 取代 Pipe 。 getter 將會是此 D-Bus service 的 signal recipient ， poster 則負責發送此 D-Bus service signal 。有興趣了解 Ruby-dbus 的讀者，可閱讀《<a href="{{ site.baseurl }}/archives/11949071.html">Write a D-Bus service by Ruby  </a> 》。

###### 相關文章

* <a href="{{ site.baseurl }}/archives/12063807.html">Ajax and Blocking IO - Server side performance tuning memo</a>

<div class="note">樂多舊網址: http://blog.roodo.com/rocksaying/archives/12010463.html</div>