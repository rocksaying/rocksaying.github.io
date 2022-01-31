---
title: Raspberry Pi 使用 Grove LoRa 無線模組負擔 LoRa Gateway 角色
category: programming
tags: ["raspberry pi",rpi,lora,mqtt,iot,智慧農業]
lastupdated: 2018-03-17
cover: https://rocksaying.github.io/images/imgur/ZRfesO9.jpg
---

本案例於 Raspberry Pi 使用 [Grove - LoRa Radio](https://wiki.seeed.cc/Grove_LoRa_Radio/) 模組，實作基本的 LoRa 無線應用。 Raspberry Pi 的角色是 LoRa Gateway 。它負責收集其他 LoRa 設備的訊號，再透過 Internet 發佈到 MQTT 頻道上。

#### 作業系統與硬體支援

Grove LoRa Radio 模組的產品說明它不提供 Raspberry Pi 使用的 SDK 。但 Alexander Krause 為它寫了一個 Python 套件，名稱為 pyRFM 。各位可以在 Github 上取得 pyRFM 的源碼: [erazor83/pyRFM](https://github.com/erazor83/pyRFM)。拜 Python 的跨平台特性所賜， pyRFM 一舉打破了 Grove LoRa Radio 的供應商對其他硬體平台支援不足的困境。只要可以運行 Python 環境的作業平台，都可以透過 pyRFM 使用 Grove LoRa Radio 。

<!--more-->

我本人在下列平台中成功使用:

* Raspberry Pi 1/2/3: Raspbian 作業系統。
* x86 PC: Windows 10 作業系統 ，安裝 Python3 for win32 。
* x86 PC: Bash on Ubuntu on Windows 子系統。
* x86 PC: Debian 作業系統。

我都使用 Python 3 。

#### 硬體連接

Grove LoRa Radio 模組被封裝為一個 UART 裝置。與 Raspberry Pi 連接時，要接在 GPIO 的 UART (serial 埠) 針腳。與 PC 連接時，則需要使用 USB to TTL 轉接模組。我個人用 CP2102 晶片或 FTDI FT232R 晶片的 USB to TTL 轉接模組。

Grove 模組隨附的連接線的母座規格不是 GPIO 用的杜邦端子規格，不能直接插上 GPIO 。所以你得準備 4 個杜邦母頭端子，動手剪掉連接線的其中一頭，壓接上杜邦母頭端子。

Grove LoRa Radio 支援 3.3V 與 5V 工作電壓，所以它的 VCC 接在 GPIO 的 3.3V 或 5V 針腳皆可。它的 TX 接到 GPIO 的 RX ； RX 接到 GPIO 的 TX 。 TX/RX 互接雖然是基本知識，但還是要再次提醒初學者。

![接線實例](https://rocksaying.github.io/images/imgur/iAiYVil.jpg)


#### Raspberry Pi 3 的 UART

Raspberry Pi 3 內建了藍牙模組，為此它改變了過去的硬體 UART 設置，改為 mini UART 。為了使用 Grove LoRa Radio ，我建議打開硬體 UART 設置。使用命令列工具 *raspi-config* ，選擇 *Interfacing options* 中的 *Serial* 項目。關閉 serial login shell 但啟用 serial port hardware 。這相當於在 config.txt 中加上 `enable_uart=1` 。

不論你是否啟用硬體 UART ， Pi 3 都會建立 */dev/serial0* 這個設備符號指向真正的 UART 設備。所以使用 pyRFM 時，應該以 */dev/serial0* 作為連接埠參數。不建議直接用 */dev/ttyS0* 或 */dev/ttyAMA0* 。

UART 設備預設不允許一般使用者開啟。如果你想用一般使用者身份執行本文的程式，請將你的使用者 — 例如 pi — 加入 *dialout* 使用群組。指令如下:

~~~term
$ sudo usermod -a -G dialout pi
~~~

<div class="note">
對於 UART 的變動與調整設置，官方文件 <a href="https://www.raspberrypi.org/documentation/configuration/uart.md">The Raspberry Pi UARTs</a> 有詳細的說明。隨著 UART 和 藍牙設備的設置參數不同， /dev/ttyS0 和 /dev/ttyAMA0 連接的設備可能會互換。為了避免使用上的困擾， Pi 3 固定讓 /dev/serial0 指向 UART ，讓 /dev/serial1  指向藍牙設備。
</div>

#### LoRa 訊號接收程式

首先，你需要取得 [pyRFM 源碼](https://github.com/erazor83/pyRFM)，或者從本文完整範例取得。然後手動安裝到 Python3 的套件目錄內。在 Pi 3 ，我安裝在 /usr/lib/python3.5/pyrfm 。如果你不是安裝在 Python3 預設的套件目錄內，你得在程式中用 `sys.path.append()` 加入 pyRFM 的路徑。

pyRFM 初始化時必須指定 serial port 參數。在 x86 PC 的 Linux 系統上，預設是 */dev/ttyS0* ；但在 Pi 3 ，則應該用 */dev/serial0* 。原因在上節中說明了。至於 Windows 系統的話，參數的字串格式是 *COM2* 之類。數字部分則需自己到裝置管理員中查看。

基礎的 LoRa 訊號接收程式碼如下所示。完整範例可從我的源碼庫取得: [LoRa-gateway](https://github.com/shirock/rocksources/tree/master/raspberry_pi/LoRa-gateway) 。

{% highlight python %}
#!/usr/bin/python3
# -*- coding: utf-8 -*-
import sys, os, signal
# the path to pyrfm library.
#sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import pyrfm

lora_settings = {
    'id': 255, # my (gateway) lora id.
    'll':{
        'type':'rfm95'
    },
    'pl':{
        'type': 'serial_seed',
        'port': '/dev/serial0',  # default UART port in Raspberry Pi 3
    }
}

if len(sys.argv) >= 2:
    lora_settings['pl']['port'] = sys.argv[1]

service_looping = False

def stop_all(*args):
    global service_looping
    service_looping = False

signal.signal(signal.SIGTERM, stop_all)
signal.signal(signal.SIGINT,  stop_all)  # Ctrl-C


print("LoRa Port: ", lora_settings['pl']['port'])
print("LoRa ID: ", lora_settings['id']) # 非必要

ll = pyrfm.getLL(lora_settings)
print("HW-Version: ", ll.getVersion())

if ll.setOpModeSleep(True, True):
    ll.setFiFo()
    ll.setOpModeIdle()
    ll.setModemConfig('Bw125Cr45Sf128');
    #ll.setModemConfig('Bw31_25Cr48Sf512');  # slow/long, and more than 2 seconds timeout
    ll.setPreambleLength(8)
    ll.setFrequency(434) # 頻率依你使用的 LoRa 模組規格而定
    ll.setTxPower(13) # useRFO default is false.

    service_looping = True
    while service_looping:
        if ll.waitRX(timeout=3):
            data = ll.recv()

            header = data[0:4]
            # <to> <from> <id> <flags>
            msg = array.array('B', data[4:]).tostring()
            print("read %d bytes" % len(data))
            print("header: ", header)
            print("message: ", msg)

            from_id = header[1]

            if header[0] != lora_settings['id']:
                print("recv_id is not matched")
                continue
                
            print("TODO received task")

    sys.exit(0)

{% endhighlight %}

Grove LoRa Radio 模組的單一訊息封包的資料量最長是 255 bytes (`RFM_MAX_PAYLOAD_LEN`)。但這之中包含了 pyRFM 用於表示封包標頭的 4 bytes 。所以實際上每個封包可以讓使用者放 251 bytes 。如果你的資料量超過 251 bytes ，就要拆開收發。

封包標頭的 4 bytes 預設分別代表 to, from, id, flags 。但實際上，這 4 個欄位的意義完全可由使用者自己決定。只要接收端和發送端的設計者先講好就行。

Grove LoRa Radio 的訊號發送模式是廣播模式，任何位在有效距離內的 LoRa 接收設備都可以收到訊號。所以在設計時，得要自己定義好訊號標頭欄位的意義，讓訊號接收程式可以判斷訊號要不要由自己處理。

我是按照 pyRFM 預設的欄位意義使用。用 to 欄位表示 LoRa 訊號的目標設備代號，用 from 欄位表示 LoRa 訊號的發送設備代號。至於 id 和 flags 欄位則未使用。在本案例中， Pi 3 的角色是 LoRa 接收設備，所以它的設備代號就是其他 LoRa 設備送出訊號的 to 設備代號。其他 LoRa 設備要在 to 欄位中填上你派給 Pi 3 的 LoRa 代號，這樣你的程式才可以根據訊號的 to 欄位內容，判斷這個訊號是不是自己要處理。

至於發送設備的設計內容，請參考 [Arduino Serial 與 String 使用經驗](https://rocksaying.tw/archives/2017/Arduino_Serial_and_String_exp2-readBytes.html) 這篇文章。這篇文章提到它如何指定 to 欄位與 from 欄位的內容。

藉由定義 to 與 from 欄位的用途，就可以讓 Pi 3 的 LoRa 接收程式負擔起 LoRa Gateway 的角色。

#### 發佈到 MQTT

Python 使用 MQTT 的方法，請參考 [MQTT用戶端入門 - 三、Python 用戶端程式設計](https://rocksaying.tw/archives/2016/MQTT-3-Python-clients.html) 。但配合 LoRa 使用時，則要注意程式的同步性。

Python 的 *paho-mqtt* 在發佈訊息時採用同步操作模式。這表示當它在連接網路、交握 MQTT 協定與讀寫 MQTT 封包內容的期間，其執行緒不能接收 LoRa 訊號。但其他 LoRa 發送設備可不會知道接收端程式現在有沒有空接收訊號，仍然照自己的步調發出 LoRa 訊號。為了避免漏接訊號，接收端程式應該運用 *threading* 和 *queue* 實作多線非同步設計。

本文的設計方式是主線接收 LoRa 訊號後，將訊號內容放入 queue 。另一條線則循環讀取 queue 的內容後發佈到 MQTT 頻道上。 Python 的 *queue* 容器支援資料同步操作。當程式呼叫 `get()` 方法時，若 queue 中沒有資料，就會被攔置等待資料。如此即可實現 LoRa 訊號接收執行緒與 MQTT 發佈執行緒之間的同步動作。

{% highlight python %}
#!/usr/bin/python3
.
.
import threading, queue
import paho.mqtt.publish as publish

publishing_messages = queue.Queue(10000)

def append_publishing_message(topic, id, data):
    if publishing_messages.full():
        # drop oldest message.
        publishing_messages.get()
        publishing_messages.task_done()
    publishing_messages.put((topic, id, data))

def publish_worker():
    '''
    daemon thread.
    它會從 publishing_messages 中取出一筆待發佈訊息 (如果沒有則等待)。
    接著會嘗試發佈這一筆訊息，直到成功或 publishing_messages 滿了為止。
    在這一筆訊息發佈成功前，主執行緒仍然可以持續往 publishing_messages 中增加訊息。
    若發佈失敗，且 publishing_messages 已滿，就會放棄這筆訊息，取出下一筆訊息。
    否則等待重試。
    '''
    topic = None
    data = None
    sensor_id = 0

    while True:
        if data == None or publishing_messages.full(): # 佇列已滿時，則放棄尚未發佈的舊訊息
            topic, sensor_id, data = publishing_messages.get()
            publishing_messages.task_done()
            # 待發佈訊息已由 data 保存，故現在就可釋放佇列，讓主執行緒繼續堆放訊息。

        full_topic = "%s/sensor/%s/%d" % (mqtt_settings['topic_base'], topic, sensor_id)
        # mqtt_auth = {
        #     'username': mqtt_settings['username'],
        #     'password': mqtt_settings['password']
        # }
        try:
            publish.single(full_topic, data, qos=1,
                hostname=mqtt_settings['host'], client_id=gethostname(), auth=mqtt_settings)
            print("published")
            topic = None
            data = None
            sensor_id = 0
        except Exception as e:
            logging.error("%s Retry publish later." % e)
            time.sleep(10)


publish_thread = threading.Thread(target=publish_worker, daemon=True)
publish_thread.start()

if ll.setOpModeSleep(True, True):
    .
    .

    while service_looping:
        if ll.waitRX(timeout=3):
            data = ll.recv()
                .
                .

            # print("TODO received task")
            append_publishing_message(topic, id, data)

{% endhighlight %}

上列是參考設計。完整程式碼請看 [LoRa-gateway@rocksources](https://github.com/shirock/rocksources/tree/master/raspberry_pi/LoRa-gateway) 。

![實際運用情形](https://rocksaying.github.io/images/imgur/ZRfesO9.jpg)

上圖是配合完整範例附的 lora-sender.py 運作的情形。

![使用案例圖](https://rocksaying.github.io/images/imgur/80jMWdF.jpg)

上圖是配合繼電器控制其他設備開關的案例。

###### 程式資源

* [本文完整範例](https://github.com/shirock/rocksources/tree/master/raspberry_pi/LoRa-gateway) 。我修改過的 pyRFM ，增加了 `setHeaderTo()` 和 `setHeaderFrom()` 方法。這是 Grove LoRa Radio Arduino 套件已實作，但 pyRFM 原作者未實作的方法。我加以補全。
* [erazor83/pyRFM](https://github.com/erazor83/pyRFM)

###### 參考文件

* [Grove - LoRa Radio](https://wiki.seeed.cc/Grove_LoRa_Radio/)
* [The Raspberry Pi UARTs](https://www.raspberrypi.org/documentation/configuration/uart.md)
* [Arduino Serial 與 String 使用經驗](https://rocksaying.tw/archives/2017/Arduino_Serial_and_String_exp2-readBytes.html)
* [MQTT用戶端入門 - 三、Python 用戶端程式設計](https://rocksaying.tw/archives/2016/MQTT-3-Python-clients.html)
