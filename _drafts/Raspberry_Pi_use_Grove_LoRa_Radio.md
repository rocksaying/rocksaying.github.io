---
title: Raspberry Pi 使用 Grove LoRa 無線模組
category: programming
tags: [raspberrypi,lora,mqtt,智慧農業]
cover:
---

本案例在 Raspberry Pi 使用 [Grove - LoRa Radio](http://wiki.seeed.cc/Grove_LoRa_Radio/) 模組，實作簡單的 LoRa 無線應用。 Raspberry Pi 的角色是 Gateway 。它負責收集其他 LoRa 模組的訊號，再透過 Internet 發佈到 MQTT 頻道上。

Grove LoRa Radio 模組的供應商並不提供 Raspberry Pi 使用的 SDK 。但 Alexander Krause 為它寫了一個 Python 套件，咼稱為 pyRFM 。各位可以在 Github 上取得 pyRFM 的源碼: [erazor83/pyRFM](https://github.com/erazor83/pyRFM)。

<!--more-->

#### 作業系統與硬體支援

拜 Python 的跨平台特性所賜， pyRFM 一舉打破了 Grove LoRa Radio 的供應商對其他硬體平台支援不足的困境。只要可以運行 Python 環境的作業平台，都可以透過 pyRFM 使用 Grove LoRa Radio 。我本人在下列作業平台中成功使用:

* Raspberry Pi 1/2/3: Raspbian 作業系統。
* x86 PC: Windows 10 作業系統 ，安裝 CPython3 for win32 。
* x86 PC: Bash on Ubuntu on Windows 子系統。
* x86 PC: Debian 作業系統。

我都使用 Python 3 。

#### 硬體連接

Grove LoRa Radio 模組被封裝為一個 serial 連接裝置。與 Raspberry Pi 連接時，要接在 GPIO 的 serial 埠針腳。與 PC 連接時，則需要使用 USB to TTL 轉接模組。我個人用 CP2102 晶片或 FTDI FT232R 晶片的轉接模組。


#### 接收 LoRa 訊號

{% highlight python %}
#!/usr/bin/python3
# -*- coding: utf-8 -*-
import sys, os, signal
# the path to pyrfm library.
#sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
import pyrfm

lora_settings = {
    'id': 255, # my lora id.
    'll':{
        'type':'rfm95'
    },
    'pl':{
        'type': 'serial_seed',
        'port': '/dev/ttyS0',
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

#### 發佈到 MQTT
