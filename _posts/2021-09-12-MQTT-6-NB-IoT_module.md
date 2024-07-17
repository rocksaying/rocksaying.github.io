---
title: MQTT用戶端入門 - 六、透過NB-IoT電信模組發送MQTT訊息，以Python和PHP為例
category: programming
tags: [IoT,MQTT,mosquitto,NB-IoT,LTE-M,python,php]
lastupdated: 2021-09-12
---

[NB-IoT 或 LTE-M](https://en.wikipedia.org/wiki/LTE-M) 都是 3GPP 電信組織針對 IoT 應用制訂的低功耗廣域無線電技術(LPWAN)。NB-IoT 資料透過 LTE/4G 電信網路傳遞。簡單說就是和 LTE/4G 共用基地台。你的手機收得到 LTE/4G 訊號的地方，你的 IoT 裝置就能使用 NB-IoT 電信模組發送資料。而 NB-IoT 模組也可以直接插一般 LTE/4G SIM 卡使用，只是資費比 NB-IoT 貴。

我在前公司接觸過兩家廠商的 NB-IoT 模組，一為 u-blox 的 [SARA-N/SARA-R4系列](https://www.u-blox.com/en/product/sara-r4-series)，另一為 SIMCOM 的 [SIM7000系列](https://www.simcom.com/module/lpwa.html)。因為是公司產品，不是我的著作權，所以不能公開程式碼。但可以說使用經驗，以及如何透過 NB-IoT 模組的 AT 指令發送原始的 MQTT 封包。

<!--more-->

就價位上來說，[SIMCOM SIM7000系列](https://www.simcom.com/module/lpwa.html) 最便宜。但功能和穩定度，還是 [u-blox SARA-R4系列](https://www.u-blox.com/en/product/sara-r4-series) 比較好。一分錢一分貨。

設計程式時，我認為 u-blox 規劃的 AT 指令規律整齊， SIM7000 的 AT 指令就有些混亂了。

更進一步閱讀這兩家廠商的產品規格表，我們看到他們的產品價格是按功能豐富程度而定。最貴的產品提供 HTTP, MQTT 等協定的 AT 指令，我們可以用 AT 指令送出 HTTP 或 MQTT 資料。但最便宜的產品，只提供最基本的 TCP 支援，我們需要自己打包 HTTP 或 MQTT 資料。如何因應後者的狀況，就是本文的主要內容。

先看下圖的軟體技術堆疊。

![網路傳輸的軟體技術堆疊](https://rocksaying.github.io/images/2021-09-12-NB-IoT_programming_stack.png)

左側是我們在一般作業系統下的工作情形，作業系統的硬體驅動程式和 Socket API 提供一致的網路傳輸介面。程式設計者在這之上設計各種網路協定的函數庫。最後我們直接利用這些現成的函數庫傳送資料。

但在 NB-IoT 情境，我們的 IoT 裝置通常沒有作業系統，例如 Arduino 微控制器。就算有作業系統，例如 Raspberry Pi 跑 Rasbian 系統時，我們使用的 NB-IoT 模組也沒有驅動程式。沒有驅動程式，自然疊在它上面的 Socket API 和現成函數庫就通通不能用。所以在 NB-IoT 情境，我們只能走右側的方式，直接透過 NB-IoT 模組提供的 AT 指令發送資料封包。

只是各種模組的 AT 指令並不統一，這要自己看廠商提供的 AT 指令手冊。如果 NB-IoT 模組支援高階應用協定 (HTTP,MQTT) 的 AT 指令，那當然是直接用。如果不支援 HTTP, MQTT 這些應用協定，那就要先用 TCP 連接的 AT 指令，再用傳送資料的 AT 指令。

SARA-R4系列的 TCP/Internet 連接指令範例：

```python

serial_port.write(b'AT+USOCR=6') # 6 = TCP

resp = serial_port.read()
# +USOCR: 2
# OK

# socket id is 2

serial_port.write(b'AT+USOCO=2,"203.75.129.103",1833')
resp = serial_port.read()
# OK

```

SIM7000系列的 TCP/Internet 連接指令範例：

```python

serial_port.write(b'AT+CIPSTART="TCP","203.75.129.103",1883')
resp = serial_port.read()
# CONNECT OK

```

注意，有些 NB-IoT 模組不支援 DNS 查詢。此類模組指定目的地時，只能用 IP ，不能用網域名稱。

透過上述的 AT 連接指令，NB-IoT 模組就處於 TCP/Internet 可用狀態。接著我們再用 AT 傳送指令送出我們打包的資料。

SARA-R4系列的 TCP/Internet 資料封傳送指令範例：

```python

# if socket_id is 2
serial_port.write(b'AT+USOWR=2,5,"Hello"')

resp = serial_port.read()
# +USOWR: 2,5
# OK

```

SIM7000系列的 TCP/Internet 資料封傳送指令範例：

```python

serial_port.write(b'AT+CIPSEND=5')
resp = serial_port.read()
# SEND OK

serial_port.write(b'hello')
serial_port.write(b'\x1A') # Ctrl+Z to send

```

上述範例只是往遠端送出一個 'hello' 字串。正式場合，我們要按網路協定規定的格式打包資料。

打包 MQTT publish 資料封包的範例，我已經放在 rocksources@github 。請看下列兩個連結的內容：

* [Python MQTT publish example](https://github.com/shirock/rocksources/blob/master/python/iot/mqtt-publish-flow.py)
* [PHP MQTT publish example](https://github.com/shirock/rocksources/blob/master/php/iot/mqtt-publish-flow.php)

刪減過的 MQTT publish 封包範例如下。QoS 為 0 ，不含 MQTT 伺服器身份認證。

```python

def mqtt_publish(conn, topic, message, client_id):
    def str_content(binstr):
        slen = len(binstr)
        msb = slen >> 8
        lsb = slen & 0xff
        return bytearray((msb, lsb)) + binstr

    # MQTT CONNECT
    variable_header = bytearray(b"\x00\x04MQTT\x04\xC2\x00\x0A")
    variable_header += str_content(client_id.encode())
    fixed_header = bytearray((0x10, len(variable_header)))

    conn.send(fixed_header + variable_header):

    # MQTT CONNACK
    rsp = conn.readline()

    # MQTT PUBLISH
    payload = bytearray(str_content(topic.encode())) + message.encode()

    payload_len = len(payload)
    digest = bytearray()
    while payload_len > 0:
        digit = payload_len % 128
        payload_len >>= 7
        if payload_len > 0:
            digit |= 0x80
        digest.append(digit)

    cmd = 0x30 # qos is 0
    fixed_header = bytearray(chr(cmd).encode()) + digest

    conn.send(fixed_header + payload):

```

###### MQTT用戶端入門系列文章

* [一、在 Debian 8 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
* [三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})
* [四、MQTT用戶端入門 - 四、在 Windows 10 安裝 mosquitto ]({% post_url 2017-10-17-MQTT-4-Install-mosquitto-on-windows %})
* [五、Python 用戶端程式設計]({% post_url 2021-09-05-MQTT-5-C#-clients %})
* [六、透過NB-IoT電信模組發送MQTT訊息]({% post_url 2021-09-12-MQTT-6-NB-IoT_module %})
* [MQTT qos 機制，發佈者如何確認訂閱者收到訊息？]({% post_url 2016-08-26-MQTT-qos_and_published %})
