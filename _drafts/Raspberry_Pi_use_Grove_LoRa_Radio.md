---
title: Raspberry Pi 使用 Grove LoRa 無線模組
category: programming
tags: [raspberrypi,lora,智慧農業]
cover:
---


<!--more-->


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


