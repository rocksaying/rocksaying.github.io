---
title: MQTT qos 機制，發佈者如何確認訂閱者收到訊息？
category: programming
tags: [IoT,MQTT,mosquitto]
---

在 COSCUP 2016 [無人機空汙監控物聯網](http://coscup.org/2016/schedules.html#R03) 這場關於 IoT 實作經驗的議程中，與會者向講者提問了一個問題。大意是說透過 MQTT 發出控制命令後，有沒有辦法確認感應器收到命令了？

MQTT 的 qos 機制可以確保訂閱者收到訊息。但發佈方法是非同步動作，當方法返回時，並不等於訂閱者都收到訊息了。若發佈者想知道訂閱者是否收到或何時收到訊息時，確實需要多一道工作。

<!--more-->

#### 監看狀況回報頻道

如果像瓦斯監控這種非常關注訂閱者(亦即瓦斯監控器)是否收到訊息的場合，設計者可考慮設兩個頻道。一個用於發佈命令給監控器，另一個用於監控器回報狀況。發佈者在發佈命令後，就監看狀況回報頻道。若在一定時間內未收到新的狀況，那麼就可以判定監控器故障或網路有問題。

在我碰過的案例 監控器正常時都會定時回報最新狀況。只要逾時未回報，一般就是故障了。在 MQTT 和監控感應裝置結合的案例中，幾乎都如此。

我先前兩篇關於 MQTT 客戶端的實作範例，設計藍圖就是這種方式。請參考:

* [MQTT用戶端入門 - 二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
* [MQTT用戶端入門 - 三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})


#### 檢查發佈事件

MQTT 有能力讓發佈者追踪 qos 為 1 或 2 的訊息是否符合 quality 所指示地讓每個訂閱者讀到。但不保證時間。交握細節可參考此文「[MQTT Essentials Part 6: Quality of Service](http://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels)」。

MQTT 在傳遞發佈者的訊息(payload)時，會附加控制命令訊息(command message)指示 MQTT 內部的工作狀態。為了有別於使用者傳送的訊息，以下稱這些控制命令訊息為「回執」。請想像當你收到郵差送來的掛號信時，郵差會請你簽收一張單據，那就是回執。

以 qos 為 1 的情形為例。當發佈者調用發佈方法送出訊息給 broker 時， broker 會先給發佈者一個 Messasge ID 回執，這相當於這筆訊息的處理號碼牌。接著 broker 將訊息發送給每一個訂閱者。等到 broker 收到每個訂閱者的回執後，再傳給發佈者一個標記為 <dfn>PUBBACK</dfn> 的回執。發佈者內部接收到這個回執時，就會觸發一個「訊息已發佈」的事件。此時才算完成整個 qos 為 1 的訊息之發佈與接收工作。

故發佈者想確認訂閱者是否收到訊息，就去傾聽這個事件。在 Python paho 庫中，這個事件名稱是 <dfn>on_publish</dfn> 。事件方法的第三個參數就是 Message ID ，讓發佈者可以識別是哪個訊息被訂閱者接收到。

基於 MQTT 的設計，發佈者不能單獨得知是哪個訂閱者收到訊息。


#### 使用經驗

我個人偏好一開始提出的監看狀況頻道的解法。因為 MQTT 的「訊息已發佈」事件只表示訂閱者收到訊息了。而某些感應器或控制機關，從收到命令到執行完成需要耗費一些時間，甚至會失敗。因此收到訊息並不等於對方成功執行命令。故監看感應器或控制機關狀況異動，才能真正得到你想要的。

另外一個尷尬的可能狀況是，發佈者只發出一個訊息，且只有一個訂閱者。當這個訂閱者遲遲無法回復 broker 它收到訊息時，發佈者就不會收到 <dfn>PUBBACK</dfn> 或 <dfn>PUBCOMP</dfn> 回執，也就無法觸發事件開始檢查動作。

還有一件事要說。上述方法都只提到訂閱者收到訊息了，但不保證訂閱者是在你期望的時間內收到訊息。若你期望感應器或控制機關在你發佈命令後一秒內完成動作，那麼你通常需要再分出一條定時在一秒後喚起的執行緒去檢查這個狀況。


###### 相關連結

* [推文1](https://twitter.com/tw_rocksaying/status/766897711173869568)
* [推文2](https://twitter.com/tw_rocksaying/status/766898657643769856)
* [推文3](https://twitter.com/tw_rocksaying/status/766899286562844672)
* [推文4](https://twitter.com/tw_rocksaying/status/767200431072083968)
* [MQTT Essentials Part 6: Quality of Service](http://www.hivemq.com/blog/mqtt-essentials-part-6-mqtt-quality-of-service-levels)
