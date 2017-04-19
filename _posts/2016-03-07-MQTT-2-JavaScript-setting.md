---
title: MQTT用戶端入門 - 二、JavaScript 用戶端程式設計
category: programming
tags: [IoT,MQTT,mosquitto,paho,javascript,websockets]
---

MQTT用戶端入門之二，本文說明 JavaScript 用戶端的程式設計內容。

你的 JavaScript 寄宿環境必須支持 WebSockets 介面。 WebSockets 是 HTML5 規範項目之一，主要網路瀏覽器近三年的版本基本都提供 WebSockets 介面。 node.js 使用者請自行確認。本文範例將以瀏覽器為操作環境。

###### 系列文章

* [MQTT用戶端入門 - 一、在 Debian 8 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [MQTT用戶端入門 - 三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})
* [MQTT qos 機制，發佈者如何確認訂閱者收到訊息？]({% post_url 2016-08-26-MQTT-qos_and_published %})

<!--more-->

### Mosquitto 昇級與設置

若你想要透過 JavaScript 連接 Mosquitto ，Mosquitto 的版本必須在 1.4 版以上。 Debian 8 提供的 mosquitto 套件版本僅為 1.3 版，不符需求。 Mosquitto 官方網站提供了 Debian 適用的套件庫。建議按照「[Mosquitto Debian repository](http://mosquitto.org/2013/01/mosquitto-debian-repository/)」的說明，將此套件庫加入 Debian 套件來源列表。步驟摘要如下:

1. wget http://repo.mosquitto.org/debian/mosquitto-repo.gpg.key
2. sudo apt-key add mosquitto-repo.gpg.key
3. sudo wget http://repo.mosquitto.org/debian/mosquitto-jessie.list -O /etc/apt/sources.list.d/mosquitto.list

更新 Mosquitto 版本之後，你需要編輯 mosquitto.conf ，啟用 WebSockets 協定功能。最重要的一點是，指定 WebSockets 連接使用的埠號。

以下為 /etc/mosquitto/mosquitto.conf 設置範例:

```
# for the default listener
bind_address localhost
port 1883

# for the websockets
listener 11883 127.0.0.1
protocol websockets
```

Mosquitto 的 WebSockets 功能使用另一個 <dfn>listener</dfn> 項目、佔用一個獨立的埠號。在上例中，<q>listener 11883 127.0.0.1</q> 表示分配 11883 埠給一個 <dfn>listener</dfn> ，此 <dfn>listener</dfn> 將提供 websockets 協定介面。 JavaScript 用戶端將使用此埠號連接 Mosquitto broker ，而不是 1883 埠。

埠號後的網址 127.0.0.1 表示只允許來自本地端的連線。若你允許遠端連線，則移除該網址。但你應該使用其他存取認證機制確保安全。

### JavaScript 用戶端程式庫用例

IBM 在開放 MQTT 協定時，也貢獻了多種程式語言可用的用戶端程式庫，統一歸於 [Paho 專案](https://eclipse.org/paho/)。在 Paho 專案中，也包含了 JavaScript 程式庫: [Paho JavaScript Client](https://eclipse.org/paho/clients/js/)。參考此網頁內容取得 JavaScript 程式庫 mqttws31-min.js 。


#### 基本範例

我寫了一個簡單的網頁範例 mqtt_js_demo.html 。示範建立 MQTT 用戶端、訂閱主題與發佈訊息三個基本工作。內容如下:

{% highlight javascript %}
<html>
<meta charset="utf-8">
<title>mqtt js client demo</title>

<script src="mqttws31-min.js"></script>
<script>
const TOPIC = "tw/rocksaying/";
var client = false;

// 用戶端成功連接 broker 時...
function onConnect() {
    // 確認連接後，才能訂閱主題
    console.log("onConnect then subscribe topic");
    client.subscribe(TOPIC + "#");
}

// 收到訊息時...
function onMessageArrived(message) {
    console.log("onMessageArrived:"+message.payloadString);
    document.getElementById("mqtt_monitor").innerHTML = message.payloadString;
}

// 發佈訊息
function publish_message() {
    var input_text = document.getElementById("mqtt_text");
    var payload = input_text.value;
    var message = new Paho.MQTT.Message(payload);
    message.destinationName = TOPIC + "text";
    client.send(message);
    input_text.value = '';
}

function init() {
    document.getElementById("mqtt_pub").addEventListener('click', publish_message);
    // 建立 MQTT 用戶端實體. 你必須正確寫上你設置的埠號.
    // ClientId 可以自行指定，提供 MQTT broker 認證用
    client = new Paho.MQTT.Client("ws://localhost:11883/", "myClientId");

    // 指定收到訊息時的處理動作
    client.onMessageArrived = onMessageArrived;

    // 連接 MQTT broker
    client.connect({onSuccess:onConnect});
}

window.addEventListener('load', init, false);
//document.addEventListener('DOMContentLoaded', init, false);
</script>
<body>
<p>
mqtt client test...
</p>

<div>
<input type="text" id="mqtt_text" />
<button id="mqtt_pub">Publish</button>
</div>

<div id="mqtt_monitor">
</div>

</body>
</html>
{% endhighlight %}

操作結果如下圖:

<img src="http://i.imgur.com/BqEktuQ.png" alt="mqtt_js_demo 操作圖" />

#### 進階用例

此節示範包裝 MQTT 用戶端，定義一個閘門控制類別。

此用例中，規劃了兩個主題子層級: status, command 。 status 用於接收來自閘門設備的狀態，而 command 則供用戶端發送閘門控制命令。定義 Gate 類別，包裝 MQTT 用戶端操作內容。此類別定義了:

* 狀態異動事件: onStatusChanged(status)
* 警鈴控制方法: alarm(switch)
* 開門命令: open()
* 關門命令: close()

Gate 類別內部包裝了 MQTT 的 'onMessageArrived' 事件，將收到的訊號再按頻道(主題子層級)觸發自訂事件。

基於安全考量，此用例的 MQTT broker 要求用戶提供用戶名稱與密碼。這組名稱與密碼於 mosquitto.conf 中設置。而 JavaScript 用戶端則在調用 MQTT `connect()` 方法時，加上 <var>userName</var> 和 <var>password</var> 兩個欄位內容。

{% highlight javascript %}
/**
topic 'tw/rocksaying/status':  接收閘門送來的狀態異動訊息。
topic 'tw/rocksaying/command': 發送控制指令。
 */
function Gate(host) {
    const TOPIC = 'tw/rocksaying/';

    var on_status = null; // function(status_string)

    var client = new Paho.MQTT.Client('ws://' + host + '/', 'my_client_id');

    client.onConnectionLost = function(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:"+responseObject.errorMessage);
        }
    }

    client.onMessageArrived = function(message) {
        //console.log("onMessageArrived:"+message.payloadString);
        var chn = message.destinationName.substring(message.destinationName.lastIndexOf('/')+1);
        if (on_status && chn == "status") {
            on_status(message.payloadString);
        }
    }

    client.connect({
        userName: "user",  // If your MQTT broker ask for user name/password.
        password: "password",
        onSuccess:function() {
            console.log("connectted");
            client.subscribe(TOPIC + "status"); // only subscribe status sub-topic.
        }
    });

    // Define my event property: 'onStatusChanged'.
    Object.defineProperty(this, "onStatusChanged", {
        get: function() {
            return on_status;
        },
        set: function(v) {
            on_status = v;
        }
    });

    this._command = function(cmd) {
        var message = new Paho.MQTT.Message(cmd);
        message.destinationName = TOPIC + "command";
        client.send(message);
    }
}

Gate.prototype = {
    alarm: function(sw) {
        this.send_command("alarm " + sw);
    },

    open: function() {
        this.send_command("open");
    },

    close: function() {
        this.send_command("close");
    }
}

// Example:
var gate = new Gate('localhost:11883');
gate.onStatusChanged = function(status) {
    console.log("Gate is " + status);
}
gate.open();

{% endhighlight %}


###### 參考項目

* [Mosquitto Debian repository](http://mosquitto.org/2013/01/mosquitto-debian-repository/)
* [Mosquitto websocksets setting](http://www.eclipse.org/mosquitto/man/mosquitto-conf-5.php)
* [Paho JavaScript Client](https://eclipse.org/paho/clients/js/)
