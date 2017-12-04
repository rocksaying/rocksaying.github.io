---
title: 使 Python 程式作為 Windows 服務執行之事項
category: programming
tags: [python,windows]
---

本文說明在 Windows 作業系統上，如何將 Python 程式以 Windows 服務 (Windows Service) 的模式執行。這可以讓程式於系統開機後，自動在背景中工作。

* 使用 [NSSM](https://nssm.cc/) 作為服務管理與啟動工具。
* Python 程式執行時的帳號與常用資料夾。

<!--more-->

對於 Linux/Unix 系統的 Python 程序員，要將一個 Python 程式在開機後自動啟動於背景中工作，是一件很簡單的事 (<span class="note">這種開機後就在背景中工作的程式， Linux/Unix 稱為 *daemon* ，而在 Windows 上，就是 *Windows 服務 (Windows Service)* 。</span>)。最直覺的做法，不過就是編輯 */etc/rc.local* ，加上一行指令，並在指令最後補上一個 `&` 字元。但同一件事，在 Windows 上就不是那麼簡單了。

首先，在 Windows 上，服務程式要求不一樣的啟動方式。如果你使用 Python.org 釋出的 Windows 版本 Python ，按一般 Python 程式的寫法，你的程式並不能作為 Windows 服務啟動。這幾乎是所有在 Windows 上的直譯式開發工具都會碰上的狀況。這時，你需要一個發動工具作為導入器。首先將這個發動工具以 Windows 服務啟動，再由它導入你的 Python 程式。

我個人試用過幾個發動工具之經驗，以 [NSSM - the Non-Sucking Service Manager](https://nssm.cc/) 最容易使用。發動工具中，最基礎的是微軟釋出的  *svrany* ，但它實在太簡略，還得動用 regedit 自行編輯登錄檔。其他的發動工具則有著太過老舊、與 Windows 10 不相容等狀況。唯有 NSSM 沒有這些問題。它不但有著 GUI 介面，也可以用命令列參數的形式，管理服務的執行內容。

以下的 Python 程式，是 Linux/Unix 系統上的 daemon 典型寫法。程式會在一個迴圈內持續工作，直到管理者送出一個終止訊號或指令才跳出迴圈，停止服務。此程式搬到 Windows 系統上，配合 NSSM 的話，不必修改內容就可在當 Windows 服務工作。

為了觀察程式在背景是否正常工作，我使用 MQTT 輸出訊息。關於 Python 使用 MQTT 的方式，請參考 [MQTT用戶端入門 - 三、Python 用戶端程式設計](http://rocksaying.tw/archives/2016/MQTT-3-Python-clients.html) ，在此不說明。 

```python
#!/usr/bin/python3
import sys, os, time
import signal
import paho.mqtt.publish as publish

Service_Looping = False

def mq_print(msg):
    publish.single("tw/rocksaying/test", msg)

def stop_all(signum, frame):
    global Service_Looping
    Service_Looping = False
    mq_print("signal %d" % signum)

signal.signal(signal.SIGTERM, stop_all)
signal.signal(signal.SIGINT,  stop_all)  # Ctrl-C
# Windows: stop service will send SIGINT to process.

Service_Looping = True

# while Service_Looping:
for i in range(10):
    if not Service_Looping:
        break
    mq_print("heatbeat")
    time.sleep(3)

sys.exit(0)
# 不論你的程式是否正常結束，nssm 都將重新執行此程式，除非你在控制台的「服務」功能中，停止這個服務。
```

服務頁面調整的內容都是針對 nssm ，而不是委託 nssm 執行的 python 程式。
python 程式的調整內容是應透過 nssm 的 GUI 或 set 指令。
或者直接調出 regedit 編輯註冊內容。






Windows 服務的工作模式，相當於
相當於 Linux/Unix 系統上的 Deamon 工作方式。
