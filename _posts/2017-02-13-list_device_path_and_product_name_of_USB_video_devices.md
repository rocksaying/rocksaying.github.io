---
title: List device path and product name of USB video devices
category: computer
tags: [linux,uvc]
---

UVC ([USB video class - wikipedia](https://zh.wikipedia.org/wiki/USB%E8%A6%96%E9%A0%BB%E9%A1%9E%E5%88%A5)) 泛指使用 USB 連接介面的影像產品。一般使用者最熟悉的 UVC 設備就是 WebCam 。除了 WebCam ，還有數位攝影機、電視卡、或具有照相功能的設備。故一台電腦接了兩台以上的 UVC 設備並非罕見。

在 Linux 核心中，會為可用的 UVC 設備各自分配一個 dev 路徑，檔名為 video 編號。例如 */dev/video0*, */dev/video1* 。但是當你的電腦接了兩台以上不同的 UVC 設備時，你將發現系統缺乏清楚的訊息告訴你這些 dev 路徑與 UVC 設備的關係。你不知道這些 dev 路徑各自代表哪一台 UVC 設備。當你的應用軟體需要用 dev 路徑開啟特定設備時，這會帶給你一些小麻煩。

本文以 shell script 和 python 分別實作了一個列出 dev 路徑與其代表的 UVC 設備名稱的小工具。

<!--more-->

### shell script

ls-uvc.sh

{% highlight sh %}
#!/bin/sh
# list device path and product name of USB video devices (WebCam).
UVCROOT=/sys/bus/usb/drivers/uvcvideo

if [ ! -d $UVCROOT ]; then
    echo "No UVC device!"
    exit 0
fi

for FILE in `ls $UVCROOT`; do
    V4LPATH=$UVCROOT/$FILE/video4linux
    if [ -d $V4LPATH ]; then
        # there should be only one folder.
        DEVNAME=`ls $V4LPATH | grep video`
        PRODUCT_NAME=`cat $V4LPATH/$DEVNAME/name`
        echo "* /dev/$DEVNAME is \"${PRODUCT_NAME}\""
    fi
done

{% endhighlight %}


### python

ls-uvc.py

{% highlight python %}
#!/usr/bin/python
'''
List device path and product name of USB video devices (WebCam).
'''
import os
from glob import glob

def list_uvc_devices():
    uvc_root = '/sys/bus/usb/drivers/uvcvideo'

    results = []
    for fn in glob('%s/*' % uvc_root):
        v4l_path = '%s/video4linux' % fn
        if not os.path.isdir(v4l_path):
            continue

        _ = glob('%s/video*' % v4l_path)
        dev_name = os.path.basename(_[0])
        dev_path = '/dev/%s' % dev_name

        _ = '%s/%s/name' % (v4l_path, dev_name)
        product_name = open(_).readline().strip()

        results.append((dev_path, product_name))

    return results


for dev_path, product_name in list_uvc_devices():
    print '* %s is "%s"' % (dev_path, product_name)

{% endhighlight %}

