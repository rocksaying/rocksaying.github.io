---
title: MQTT用戶端入門 - 五、.NET/C# 用戶端程式設計
category: programming
tags: [IoT,MQTT,mosquitto,C#,csharp,.net]
lastupdated: 2022-08-26
---

.NET 平台可以使用套件 [System.Net.Mqtt](https://www.nuget.org/packages/System.Net.Mqtt) 設計 MQTT 用戶端程式。從套件的名稱空間可知，這是 .NET 平台正式的 MQTT 套件。由微軟旗下的 xamarin 團隊負責開發，專案托管於 [System.Net.Mqtt 專案](https://github.com/xamarin/mqtt)。

MQTT 概觀請看 [一、在 Debian 8 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})。

本文範例使用 C# 語言撰寫。並且說明三點使用須知：

1. client ID
2. 同步方法 Connect
3. 分別主題處理方法

<!--more-->

本文範例完整程式碼：

* [mqtt-publish](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt-publish)
* [SimpleMqttClient](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt)

因為 [System.Net.Mqtt](https://www.nuget.org/packages/System.Net.Mqtt) 並不包含在 .NET SDK 預裝內容之中，所以想在 .NET 專案中使用 MQTT 套件時，首先要從套件庫取得並加入專案檔。我習慣使用 dotnet 命令列工具操作。操作指令如下：

```term

dotnet add package System.Net.Mqtt --version 0.6.3-beta

```

## client ID

使用 System.Net.Mqtt 時，如果目標 MQTT broker 要求連線認證的話，則我們需要先配置 MqttClientCredentials 實例。 MqttClientCredentials 建構方法有三個參數：

* clientId - 連線時，在 MQTT broker 註冊的用戶端識別代號。
* username - MQTT broker 的連線用戶名稱。
* password - MQTT broker 的連線用戶密碼。

在這三個參數之中，需要特別說明 clientId 的用途。 MQTT 規範 clientId 的主要用途是避免我的程式收到自己發佈的訊息。換句話說，如果有多個 MQTT 用戶端使用了同樣的 clientId ，那麼他們不會收到彼此發佈的訊息。

基本上，clientId 是選擇性參數，如果 clientId 為 null 或空字串，則套件庫會隨機產生一個。但是，如果我們要指定一個具規律性的識別代號的話，System.Net.Mqtt 就不太方便了。

MQTT 規格對 clientId 的用字有些限制。 Python, JavaScript 的 MQTT 套件庫會對我們傳入的 clientId 字串做一些處理，以免違背 MQTT 規格。但是 .NET 的 System.Net.Mqtt 套件庫不會這麼做。如果我們使用了不合規格的 clientId ，則 System.Net.Mqtt 會擲出錯誤。

System.Net.Mqtt 按照 MQTT 規格， clientId 有下列限制：

1. 只允許使用 a-z, A-Z, 0-9 字元。
2. MQTT 規格早期版本限制 clientId 長度 23 字元。

基於 Python 和 JavaScript 的使用經驗，我在配置 MqttClientCredentials 前，會將 clientId 用 MD5 編碼後取固定長度內容，免除使用者限制。我的第一個範例 [mqtt-publish](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt-publish) 設計的 Publisher 類別，就是這麼做。

```csharp

class Publisher
{
    public Publisher(
            string broker, 
            int port, 
            string username, 
            string password, 
            string clientId=null) 
        : this(broker, port)
    {
        if (!string.IsNullOrEmpty(clientId)) {
            var data = MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(clientId));
            // 用 MD5 將使用者輸入的 client id 轉成可用字元。
            StringBuilder sbuf = new StringBuilder();
            // 從雜湊結果取22字元(11位元組)。
            for (var i = 0; i < 11; i++) {
                sbuf.Append(data[i].ToString("x2"));
            }
            clientId = sbuf.ToString();
        }

        // 若省略 clientId (null or "")， MqttClientCredentials 會自己編一個
        this.credentials = new MqttClientCredentials(clientId, username, password);
    }

    public async void PublishAsync(
        string topic, 
        byte[] payload, 
        MqttQualityOfService qos = MqttQualityOfService.AtMostOnce)
    {
        var sessionState = await Client.ConnectAsync(Credentials);
        var message = new MqttApplicationMessage(topic, payload);

        await Client.PublishAsync(message, qos);
        
        await Client.DisconnectAsync();
        return;
    }
}

class Program
{
    static void Main(string[] args)
    {
        var broker = "localhost";
        var clientId = "mqtt-publisher_test.pid";
        // 我呼叫前會把 client id 用 MD5 編碼後取固定長度內容，不受規格限制。
        var username = "test";
        var password = "testtest";

        var pub = new Publisher(
            broker, 
            1883,
            username,
            password,
            clientId
        );

        pub.PublishAsync("/test", Encoding.UTF8.GetBytes("hello"));
    }
}

```

Publisher 類別不連續發佈訊息，也不訂閱主題。它適用於偶爾發佈一次訊息的情境。例如使用電池的 IoT 裝置，通常就用此方法發佈裝置狀態。
完整內容在 github 上：[mqtt-publish](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt-publish)。

## 同步方法 Connect 

System.Net.Mqtt 設計的服務連接方法 `ConnectAsync()` 不太好用。

顧名思義，`ConnectAsync()` 是非同步方法。在和 MQTT broker 完成連線交握前，方法就返回了。然而：

1. 在完成連線前，我們呼叫 `PublishAsync()` 發佈的內容成了空包彈。
2. 在完成連線前，不能訂閱主題。如果在 `ConnectAsync()` 之後立即呼叫 `SubscribeAsync()` ，會擲出錯誤。

基於以上兩點，所以我們實際上得要把 `ConnectAsync()` 變成同步工作才行。

在非同步方法中呼叫 `ConnectAsync()` 時，固定寫法如下:

```csharp

var sessionState = await mqClient.ConnectAsync();

```

在同步方法中呼叫 `ConnectAsync()` 時，寫法如下:

```csharp

var sessionState = Client.ConnectAsync().Result;

```

在同樣以非同步模式設計的 JavaScript MQTT 庫中，提供了 Connected 事件。我們可以利用此事件訂閱主題。請看 [MQTT用戶端入門 - 二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})。但我不知道為何 System.Net.Mqtt 雖有 Disconnected 事件，但從 v0.5 一直到 v0.6.3，都不提供 Connected 事件。

因為 `ConnectAsync()` 並不實用。所以我寫的 [SimpleMqttClient](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt) 直接提供了同步方法。

```csharp

public class SimpleMqttClient
{
    internal static string GetAnonymousClientId() =>
        string.Format(
            "anonymous{0}",
            Guid.NewGuid().ToString().Replace("-", string.Empty).Substring(0, 10)
        );

    /*
    我不知道為何 System.Net.Mqtt (~v0.6.3) 沒有 Connected 事件。
    */
    public SessionState Connect()
    {
            // Task.Run(()=>this.Client.ConnectAsync(Credentials)).Wait();
        return Client.ConnectAsync(Credentials, cleanSession: true).Result;
    }

}

```

除了同步方法 `Connect()` 之外， SimpleMqttClient 也改良了產生隨機 clientId 的方式。當參數省略 clientId 時，其內部方法 `GetAnonymousClientId()` 使用 Guid 作為隨機 clientId 的基底內容。

## 區分不同主題的處理方法

System.Net.Mqtt 採用 observer 設計模式處理訊息接收工作。先用 client 的 `SubscribeAsync()` 方法訂閱主題。再用 client 的 `MessageStream.Subscribe()` 指派訊息處理方法。我們可以在 client 串好幾個方法負責處理收到的訊息。

*注意，`SubscribeAsync()` 的 qos 參數必須小於或等於 MqttConfiguration 的 `MaximumQualityOfService`*。
詳情請看 [.NET MQTT 用戶端訂閱方法使用時的陷阱，關於 MaximumQualityOfService]({% post_url 2022-08-24-MQTT-dotNET-subscribe-trap %})。

但 MQTT 客戶端有時會同時訂閱好幾個主題，而附加訊息處理方法的 `Subscribe()` 方法並沒有指定主題的參數。那麼我們的訊息處理方法要如何區分訊息主題呢？實務上，訊息處理方法會按照主題切割成好幾個小方法。每個方法各自處理自己感興趣的主題的訊息。

第一個直接做法，就是在處理方法中判斷訊息的 <var>Topic</var> 屬性。如下：

```csharp

var mqClient = new SimpleMqttClient();

// 假設此處理方法只負責 tw/test/1 主題的訊息
mqClient.Client.MessageStream
    .Subscribe(msg => {
        if (msg.Topic != "tw/test/1")
            return;

        Console.WriteLine(String.Format("topic {0}\n{1}", 
            msg.Topic,
            Encoding.UTF8.GetString(msg.Payload)));
        return;
    });

```

第二個做法是引入 System.Reactive.Linq ，使用 LINQ 提供的擴充方法 `Where()`。

```csharp

using System.Reactive.Linq;
// 加上這個 Linq 套件， MessageStream 才能接 Where

var mqClient = new SimpleMqttClient();

// 用 Where 過濾其他主題的訊息，所以處理方法只會看到 tw/test/2 主題的訊息
mqClient.Client.MessageStream
    .Where(msg => msg.Topic == "tw/test/2")
    .Subscribe(msg => {
        Console.WriteLine(Encoding.UTF8.GetString(msg.Payload));
    });

```

完整內容在 github 上：[SimpleMqttClient](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt)。

###### MQTT用戶端入門系列文章

* [一、在 Debian 8 安裝 mosquitto 與 MQTT 基本觀念]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
* [三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})
* [四、在 Windows 10 安裝 mosquitto]({% post_url 2017-10-17-MQTT-4-Install-mosquitto-on-windows %})
* [五、.NET/C# 用戶端程式設計]({% post_url 2021-09-05-MQTT-5-C#-clients %})
* [MQTT qos 機制，發佈者如何確認訂閱者收到訊息？]({% post_url 2016-08-26-MQTT-qos_and_published %})
* [透過NB-IoT電信模組發送MQTT訊息]({% post_url 2021-09-12-MQTT-6-NB-IoT_module %})
