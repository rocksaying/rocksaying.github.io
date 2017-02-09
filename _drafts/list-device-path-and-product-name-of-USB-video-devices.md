---
title: List device path and product name of USB video devices
category: computer
tags: [linux,uvc]
---

### shell script

ls-uvc.sh

{% highlight sh %}
#!/bin/sh
# list device path and product name of USB video devices (WebCam).
UVCROOT=/sys/bus/usb/drivers/uvcvideo

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

