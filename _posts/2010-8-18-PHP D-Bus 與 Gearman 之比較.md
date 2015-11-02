---
title: PHP D-Bus 與 Gearman 之比較
category: programming
old-category: PHP
tags: [d-bus,gearman]
---

我先前介紹 php-dbus 時，曾捎帶提及 PHP 還支援 Gearman 與 WebSphere MQ Series 兩種訊息匯流排架構。前幾日，便有位同事問我關於 Gearman 的事，他參考的文章則是 jaceju 的《<a href="http://www.jaceju.net/blog/?p=1211">Gearman 心得 </a>》。
我們公司主要是使用 D-Bus 架構，他也熟悉 D-Bus 。我們公司運用 D-Bus 的途徑，大致如《<a href="{{ site.baseurl }}/archives/2010/D-Bus%20%E7%94%A8%E9%80%94%E8%AA%AA%E6%98%8E.html">D-Bus 用途說明</a>》所述，將其作為 API 機制。他在試用 Gearman 後，說 Gearman 不能傳 object 、方法的調用敘述不像一般函數，用起來不方便。

我看了 jaceju 的《<a href="http://www.jaceju.net/blog/?p=1211">Gearman 心得 </a>》後，就手癢用 php-dbus 寫了一個相同的範例程式。有興趣的人，可以看看這篇文章和 jaceju 那篇，比較一下 D-Bus 與 Gearman 的程式風格差異。

<!--more-->

### 安裝 php-dbus

php-dbus 擴充元件的安裝方式，參閱《<a href="{{ site.baseurl }}/archives/2010/Write%20a%20PHP%20DBus%20client.html">Write a PHP DBus client</a> 》，在此不複述。如同 Gearman 要啟動一個 job server 居中協調， DBus 也有一個 dbus-daemon 負責訊息匯流排的牽線工作。而 dbus-daemon 目前是 Debian/Ubuntu/Fedora Linux 的必裝套件，所以不必另行安裝。

### Client程式

仿 jaceju 的 client.php 。但我的 ResizeImage() 模擬非同步作業，它將直接回傳「處理中」的訊息。所以調用 ResizeImage() 之後，還會去傾聽信號 <dfn>ResizeDone</dfn>，等待處理完成。

###### t_client.php

{% highlight php linenos=table %}
<?php
//t_client.php
define('SERVICE_NAME', 'blog.rock');
define('OBJECT_PATH',  '/blog/rock');
define('MAIN_INTERFACE','blog.rock');

//$bus = new Dbus( Dbus::BUS_SESSION );
$bus = new Dbus( Dbus::BUS_SYSTEM );

$client = $bus->createProxy(SERVICE_NAME, OBJECT_PATH, MAIN_INTERFACE);

$result = $client->SendMail("rock", "web@example.com",
    "Hello\n  world\nsincerely, \nrock\n");
echo $result, "\n";

$result = $client->ResizeImage("/home/rock/test.png", 300, 200);
echo $result, "\n";

$bus->addWatch( MAIN_INTERFACE );
while (true) {
    echo "I could do something else.\n";
    $s = $bus->waitLoop(1000);
    if (!$s)
        continue;
    if ($s->matches(MAIN_INTERFACE, 'ResizeDone')) {
        echo "Resize really done\n";
        break;
    }
}
?>
{% endhighlight %}

### Worker程式

D-Bus 並不使用 worker 這個字眼。在 D-Bus 架構中，負責維護訊息匯流排(message bus)的稱為 dbus daemon ；而接上 D-Bus 並提供方法給其他行程調用的行程，才稱為 service 或 server 。所以這個 worker 程式，按 D-Bus 的術語，其實應該叫 server 程式。

仿 jaceju 的 worker.php 。但我的 ResizeImage() 方法將返回「處理中」的訊息，等5秒後，再發出「處理完成」的信號。此在模擬非同步作業的情形。

###### t_worker.php

{% highlight php linenos=table %}
<?php
// t_worker.php
class MyDbusService {
    static function SendMail($name, $email, $message) {
        echo "Name: $name\n";
        echo "EMail: $email\n";
        echo "===========\n";
        echo $message;
        echo "===========\n";
        return "Email sending is done.";
    }

    static $processing_seconds = 0;
    static function ResizeImage($filepath, $width, $height) {
        self::$processing_seconds = 5; //模擬處理時間
        echo "I am resizing image $filepath to ${width}x${height}.\n";
        return "Image resizing is doning...";
    }

    static function emitResizeDone() {
        echo "emit signal\n";
        self::$ResizeDone->send();
    }

    static $ResizeDone;
}

//$bus = new Dbus( Dbus::BUS_SESSION, true);
$bus = new Dbus( Dbus::BUS_SYSTEM, true);

define('SERVICE_NAME', 'blog.rock');
define('OBJECT_PATH',  '/blog/rock');
define('MAIN_INTERFACE','blog.rock');

// request service name.
$bus->requestName( SERVICE_NAME );

// register object path and interface.
$bus->registerObject( OBJECT_PATH, MAIN_INTERFACE, 'MyDbusService');

// add signal
MyDbusService::$ResizeDone = new DbusSignal(
    $bus, OBJECT_PATH, MAIN_INTERFACE, 'ResizeDone'/*signal name*/);

while (true) {
    try {
        $bus->waitLoop(1000);
        if (MyDbusService::$processing_seconds > 0) {
            --MyDbusService::$processing_seconds;
            if (MyDbusService::$processing_seconds == 0)
                MyDbusService::emitResizeDone();
        }
        //echo '.';
    }
    catch (Exception $e) {
        echo $e->getMessage();
    }
}
?>
{% endhighlight %}

D-Bus 將訊息匯流排分為兩種，即 System Bus 與 Session Bus ，分別採用不同的安全控管政策。本文範例的 worker 程式將把訊息管道接在 System Bus 上，根據 D-Bus 的控管政策，你必須準備下列的組態文件(<span class="Onote">只有 D-Bus service 程式才需要準備此一組態文件。 D-Bus client 程式不需要</span>)，並將它儲存在 /etc/dbus-1/system.d/blog.rock.conf (<span class="Onote">此文件的主檔名必須與 service name 相同</span>)。

###### blog.rock.conf

{% highlight xml %}
<!DOCTYPE busconfig PUBLIC
 "-//freedesktop//DTD D-BUS Bus Configuration 1.0//EN"
 "http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">
<busconfig>
  <!-- Only rock can own the service -->
  <policy user="rock">
    <allow own="blog.rock"/>
  </policy>

  <!-- Allow anyone to invoke methods (further constrained by
       PolicyKit privileges -->
  <policy context="default">
    <allow send_destination="blog.rock"
           send_interface="blog.rock"/>
  </policy>

</busconfig>
{% endhighlight %}

如果把訊息管道接在 Session Bus 上，則不須準備此一文件。但接在 Session Bus 的條件是你的 DBus 程式是在登入桌面環境後執行的，因為 Session Bus 接受 X window session 管制。由於大多數的 PHP 程式是由 Apache 啟動，並不是處於桌面環境的 session 內，所以不能接到 Session Bus 。故實務上，大多數 PHP 程式只能使用連接到 System Bus 的服務端。

### 執行結果

先執行 t_worker.php ，它會開始等待客戶端的要求。執行前，請先注意是否已經按上述要求，準備好 blog.rock.conf 文件了。

<pre class="language-term">
rock@desktop:~$ php t_worker.php
Name: rock
EMail: web@example.com
===========
Hello
  world
sincerely,
rock
===========
I am resizing image /home/rock/test.png to 300x200.
emit signal

</pre>


再執行 t_client.php ，調用 t_worker 提供的方法，並等待它的完成信號(ResizeDone)。

<pre class="language-term">
rock@desktop:~$ php t_client.php
Email sending is done.
Image resizing is doning...
I could do something else.
I could do something else.
I could do something else.
I could do something else.
I could do something else.
Resize really done
rock@desktop:~$
</pre>


其實在你執行 t_client.php 前，並不需要自己先啟動 t_worker.php 。只要設定好下列內容，說明如何執行你的 worker 程式，並將下列內容儲存在 <dfn>/usr/share/dbus-1/system-services/blog.rock.service</dfn> ，DBus daemon 就會幫你啟動 t_worker.php。

###### blog.rock.service

```text
[D-BUS Service]
Name=blog.rock
Exec=/usr/bin/php /home/rock/t_worker.php
User=rock
```

關於 .service 的細節，請參閱《<a href="{{ site.baseurl }}/archives/2010/D-Bus%20service%20activation.html">D-Bus service activation</a> 》。

### 結語

D-Bus 與 Gearman 相比較，D-Bus 具有下列優點:

* 可用性高: D-Bus 是目前主要 Linux 散佈版本的必裝套件。而且有許多現存的系統服務同時提供 D-Bus 介面。
* 抽象性高: D-Bus 服務的調用動作，抽象到 API 的層級。因此傳遞參數與回傳值的處理方式，皆與呼叫一般函數呼叫無異。
* 擴展性高: 支援 D-Bus 的程式語言數目，比 Gearman 多。

但是在 PHP 中，D-Bus 有一個主要缺點，就是它的 php-dbus 的成熟度比不上 php-gearman 。目前的 php-dbus 還只發展到 0.1.0 版，要避開某些情況才不會觸發錯誤。

###### 相關文章

* <a href="{{ site.baseurl }}/archives/2010/php-dbus%200.1.0%20%E6%92%B0%E5%AF%AB%20DBus%20service%20%E7%9A%84%E4%BD%BF%E7%94%A8%E7%B6%93%E9%A9%97.html">php-dbus 0.1.0 撰寫 DBus service 的使用經驗</a>
* <a href="{{ site.baseurl }}/archives/2011/php-dbus%20unboxing.html">php-dbus unboxing</a>

<div class="note">樂多舊網址: <a href="http://blog.roodo.com/rocksaying/archives/13478419.html">http://blog.roodo.com/rocksaying/archives/13478419.html</a></div>