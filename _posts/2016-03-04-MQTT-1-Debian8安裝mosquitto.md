---
title: MQTT用戶端入門 - 一、在 Debian 8 安裝 mosquitto 與 MQTT 基本觀念
category: programming
tags: [IoT,MQTT,mosquitto,paho]
---

本文簡單說明在 Debian 8 上安裝 MQTT 實作品 mosquitto 的經驗。

MQTT 是用於遙測裝置或行動式應用程式之間傳送訊息的協定。它最早由 IBM 規劃實作，並在 2013 年提交給 OASIS (結構化資訊標準促進協會) 成為現在 IoT (Internet of Thing) 領域的訊息傳輸標準之一。

> MQTT 通訊協定預期用於無線及低頻寬網路。可針對行動式應用程式可靠地處理遞送訊息的複雜性，並保持低成本地進行網路管理。 MQTT 用戶端程式庫比較小。程式庫如同郵箱，使用連接至 MQTT 伺服器的其他 MQTT 應用程式傳送及接收訊息。透過傳送訊息（而不是保持連接至等待回應的伺服器），MQTT 應用程式可節約電池壽命。
> <cite><a href="http://www-01.ibm.com/support/knowledgecenter/SSFKSJ_7.5.0/com.ibm.mm.tc.doc/tc00000_.htm?lang=zh-tw">IBM WebSphere MQ 資訊中心 MQTT 簡介</a></cite>

<!--more-->

### Debian 套件

[Mosquitto](http://www.eclipse.org/mosquitto/) 是完整且輕量的 MQTT 伺服端軟體。但在 MQTT 術語中， 稱  mosquitto 的角色為 broker (中間人)。它是基於 Eclipse Foundation Contributor License 的開放源碼軟體。在它的正式網站上，你也可以取得供 Windows, Linux, Mac 等平台的安裝包。設置簡便，是理想的 MQTT 入門磚。

Debian 8 套件庫中提供了 mosquitto 1.3 版套件，此版支持 MQTT 3.1/3.1.1 規格。相關套件於下列出:

* mosquitto: MQTT broker.
* mosquitto-clients: command line clients.
* python-mosquitto: Python 用戶端程式庫，但現在建議改用 [Paho](http://www.eclipse.org/paho/clients/python/) 的程式庫。
* libmosquitto-dev: C API
* libmosquittopp-dev: C++ API

通常你只需要安裝 mosquitto 與 mosquitto-clients 套件即可。

安裝之後， mosquitto 就會作為背景服務自動執行。可以查看 /etc/mosquitto/mosquitto.conf 了解設置內容。如果你的電腦位於公用網路上，建議加上 <q>bind_address localhost<q> 避免外部電腦連入。請參考 [mosquitto.conf](http://mosquitto.org/man/mosquitto-conf-5.html) 了解其他設置項目。修改設置後，再以 root 身份於命令列下達 <kbd>/etc/init.d/mosquitto restart</kbd> 重啟服務。

如果你想安裝 mosquitto 最新的版本或需要 MQTT over websocket 功能，請參考「 [MQTT用戶端入門 - 二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %}) 」的昇級設置。

### topic, payload 與 qos

MQTT 的基本觀念請參考 [HiveMQ MQTT Essentials](http://www.hivemq.com/blog/mqtt-essentials/)。而一般用戶則需要知道一道訊息分成三個部份，即 <dfn>topic</dfn>, <dfn>payload</dfn> 和 <dfn>qos</dfn> 。

#### topic

<dfn>topic</dfn> 表示訊息主題或頻道，它的用途類似郵箱地址或廣播頻道，可以讓訊息使用者區分訊息種類。它的表達格式是用 `/` 字元構成樹狀層次。你可以使用 `#` 和 `+` 這兩個字元以外的任何字元組成 <dfn>topic</dfn> 名稱。中文字也可用。合法的 <dfn>topic</dfn> 名稱外觀如下:

* finance/stock/ibm
* finance/stock/ibm/closingprice
* finance/stock/ibm/currentprice
* finance/stock/mbi/currentprice

在 <dfn>topic</dfn> 中， `#` 和 `+` 字元是萬用字元，於用戶端訂閱主題時使用。 `#` 表示此主題以下的所有子節點。 `+` 則代表此一層級的任何名稱。

例如:

* 訂閱 "finance/stock/ibm/#" 則送往主題開頭為 "finance/stock/ibm" 的訊息都可收到。
* 訂閱 "finance/stock/+/currentprice" 則會收到主題如 "finance/stock/ibm/currentprice", "finance/stock/mbi/currentprice" 的訊息。

#### payload

<dfn>payload</dfn> 就是訊息承載的資訊內容。它的內容可為任何字元，甚至是未結構化的二進位資料。

#### qos

<dfn>qos</dfn> 表示重要等級。 MQTT 規劃了三種重要等級，如下:

* 0: 最多一次 (at most once)。此等級不保證送出訊息，會遺失訊息。通常用於回報即時感測資料的場合。因為感測裝置會持續地回報最新狀態，故不在乎漏失訊息。這也是預設的等級。
* 1: 至少一次 (at least once)。訊息一定會送出一次。但因為 broker 不會確認訂閱者是否收到訊息，所以它可能會重複發送訊息以確保送出一次。
* 2: 確定一次 (exactly once)。訊息一定且只送出一次。 broker 會確認所有此主題的訂閱者都收到訊息。

### mosquitto 用戶端工具

mosquitto-clients 套件提供了兩個用戶端工具，方便使用者練習與開發時的測試工作。

* mosquitto_sub 是主題訂閱工具。它可以讓使用者訂閱並監看主題內容。
* mosquitto_pub 是訊息發送工具。它可以讓使用者送出訊息。

練習時，可以打開兩個終端機視窗，其中一個執行 mosquitto_sub 監聽頻道。另一個執行 mosquitto_pub 了解訊息發送方式。例如:

訂閱主題 "tw/rocksaying/#" :

```term
$ mosquitto_sub -t "tw/rocksaying/#"

```

發送訊息:

```term
$ mosquitto_pub -t "tw/rocksaying" -m "test1" -q 0
$ mosquitto_pub -t "tw/rocksaying/level1" -m "test2" -q 1
$ mosquitto_pub -t "tw/rocksaying/text" -m "test3" -q 2

```

<div class="note">
實際操作時， qos 為 0 的訊息，可能不會在 mosquitto_sub 的監聽畫面中出現。
</div>

###### 參考項目

* [Mosquitto 正式網站](http://www.eclipse.org/mosquitto/)
* [mosquitto.conf](http://mosquitto.org/man/mosquitto-conf-5.html)
* [HiveMQ MQTT Essentials](http://www.hivemq.com/blog/mqtt-essentials/)
* [MQTT V3.1 Protocol Specification](http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html)
* [IoT Standards](http://iot.eclipse.org/standards)

###### MQTT用戶端入門系列文章

* [一、在 Debian 8 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
* [三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})
* [四、MQTT用戶端入門 - 四、在 Windows 10 安裝 mosquitto ]({% post_url 2017-10-17-MQTT-4-Install-mosquitto-on-windows %})
* [五、Python 用戶端程式設計]({% post_url 2021-09-05-MQTT-5-C#-clients %})
* [六、透過NB-IoT電信模組發送MQTT訊息]({% post_url 2021-09-12-MQTT-6-NB-IoT_module %})
* [MQTT qos 機制，發佈者如何確認訂閱者收到訊息？]({% post_url 2016-08-26-MQTT-qos_and_published %})
