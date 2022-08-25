---
title: .NET MQTT 用戶端訂閱方法使用時的陷阱，關於 MaximumQualityOfService
category: programming
tags: [IoT,MQTT,Xamarin,".net"]
lastupdated: 2022-08-26
---

我有個用 .NET Core 開發的案子，需要透過 MQTT 取得設備狀態後顯示在螢幕上。
最近在新增可用設備後，遭客戶回報主程式顯示設備未回應，但指定設備實際上還在運作的狀況。
我仔細分析了程式工作期間的 log 內容，發現是主程式訂閱的訊息中途失聯了。
主程式剛開始都有收到設備發佈的狀態，一段時間後就收不到了。而執行緒仍然活著好好的，顯然不是程式錯誤。

在解決過程中，我才發現被 System.Net.Mqtt 套件坑了。
它有一個不知該說是臭蟲、或是陷阱的特性。
若沒有正確設置 *MqttConfiguration* 的 *MaximumQualityOfService* 屬性，則訂閱者收到 20 次訂閱訊息後，就不再通知訂閱者新的訊息。

<!--more-->

最初我的程式使用 .NET MQTT 套件時，沒有指定訊息的 qos ，採用預設組態。

1. 配置 MqttClient 時，其 `MqttConfiguration` 省略 `MaximumQualityOfService` 屬性；此時預設值是 `AtMostOne` (0)。
2. 調用 `SubscribeSync()` 訂閱主題時省略 qos 參數；此時 qos 預設值也是 `AtMostOne` (0)。
3. 設備發佈的訊息，它則明確指定 qos 為 `AtLeastOne` (1)。

在這種條件下，程式跑起來都很正常，訂閱者擺著幾小時仍然持續收到訊息。

但是我更新程式時，手癢把 `SubscribeSync()` 加上 qos 參數，指定為 `ExactlyOne` 。
跑幾次單元測試都沒問題，就部署到客戶端。第二天，客戶就回報狀況了。

為了重現狀況，我寫了兩個測試程式，分別負責訂閱者和發佈者的工作。

1. [發佈者程式碼](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt-cases/subscribe-trap/publisher)。
2. [訂閱者程式碼](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/mqtt-cases/subscribe-trap/subscriber)。

這兩個程式是用 .NET 6 寫的。取回程式碼後，執行 `dotnet run` 就能跑了。

#### 發佈者的參數

發佈者程式碼使用 MQTT 參數節錄於下，這部份在測試過程中不動。

```csharp

var configuration = new MqttConfiguration 
{
    MaximumQualityOfService = MqttQualityOfService.AtMostOnce
};

mqClient.PublishAsync(msg, MqttQualityOfService.AtLeastOnce);

```

注意 MqttConfiguration 的 `MaximumQualityOfService` 為 `AtMostOne` ，而發佈時的 qos 是 `AtLeastOnce` 。
儘管兩者不匹配，但對發佈工作沒有任何影響。

#### 訂閱者的 qos 與 MaximumQualityOfService 符合時

訂閱者先測試 MQTT 套件預設值的情形。其程式碼的 MQTT 參數節錄於下。

```csharp

var configuration = new MqttConfiguration 
{
    MaximumQualityOfService = MqttQualityOfService.AtMostOnce
};

mqClient.SubscribeAsync(topic);
// 省略 qos 參數時採用預設值 AtMostOne

```

我分別開兩個視窗，一個跑訂閱者，一個跑執行者。觀察執行結果一小時都很正常。

#### 訂閱者的 qos 與 MaximumQualityOfService 不相符時

接著，來看看只有 `SubscribeAsync()` 的 qos 參數指定為 `ExactlyOne` 的情形。

MQTT 參數節錄於下。

```csharp

var configuration = new MqttConfiguration 
{
    MaximumQualityOfService = MqttQualityOfService.AtMostOnce
};

mqClient.SubscribeAsync(topic, MqttQualityOfService.ExactlyOnce);

```

然後我就看到訂閱者收到 20 次訊息後，就不再收到新訊息了。如圖:

![測試過程畫面](https://rocksaying.github.io/images/2022-08-24-MQTT-dotNET-subscribe-trap.png)

我本來猜測是不是跟連線時間有關。
接著調整了發佈者發佈訊息的時間間隔，看看時間有無影響。
而結果不論是隔 10 秒、 20 秒、甚至隔 1 分鐘。訂閱者都是收到 20 次訊息。

面對這個結果，我心中只想著這是不是在惡整人啊？

但只要把 `MaximumQualityOfService` 也配合調整為 `ExactlyOnce` ，那麼訂閱者又正常了。

#### 結論

首先，對發佈者來說， `PublishAsync()` 的 qos 參數不受 `MaximumQualityOfService` 影響。

而對訂閱者來說， `SubscribeAsync()` 的 qos 參數必須小於或等於 `MaximumQualityOfService` 。
否則的話，訂閱者最多可收到 20 次訊息。超過就會失效。
但我不知道為什麼定這個數目。也不知道為何不擲出例外。

這真是令人困惱的特性。 `SubscribeAsync()` 不擲出例外就算了，但訂閱者竟然還可以正常收到 20 次訊息？
我實在不知這是臭蟲還是陷阱。

我的實際案例使用的設備，回報狀態的週期最少是 2 分鐘以上。這表示至少前 40 分鐘都會正常運作。
而我在做單元測試時，可不會測到 40 分鐘後才出現的錯誤狀況啊。著實被它耍了一把。

##### 相關文章

* [MQTT用戶端入門 - 五、.NET/C# 用戶端程式設計]({% post_url 2021-09-05-MQTT-5-C#-clients %})
