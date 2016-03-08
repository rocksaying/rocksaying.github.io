---
title: 體驗 MQTT - 三、Python 用戶端設計
category: programming
tags: [IoT,MQTT,mosquitto,paho,python]
---

Debian 8 套件庫中提供了 python-mosquitto 作為 Mosquitto 的用戶端程式庫。但我不說這個。現在建議改用 [Paho 專案](https://eclipse.org/paho/) 提供的 Python 用戶端程式庫: [Paho Python Client](https://eclipse.org/paho/clients/python/)。此程式庫具有泛用性，連接對象不限於 mosquitto ，亦可連接支援 MQTT 協定的其他 MQ 服務。

<!--more-->

python-stdeb:

* pypi-download
* py2dsc-deb


```term
rock@rock:~/Downloads$ pypi-download paho-mqtt
OK: paho-mqtt-1.1.tar.gz

rock@rock:~/Downloads$ py2dsc-deb paho-mqtt-1.1.tar.gz
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
running the following command in directory: deb_dist/tmp_py2dsc/paho-mqtt-1.1
/usr/bin/python setup.py --command-packages stdeb.command sdist_dsc --dist-dir=/

dpkg-deb：把套件 python-paho-mqtt 製作為 ../python-paho-mqtt_1.1-1_all.deb。

rock@rock:~/Downloads$  ls
deb_dist  paho-mqtt-1.1.tar.gz
rock@rock:~/Downloads$ ls deb_dist/
paho-mqtt-1.1                  paho-mqtt_1.1-1_source.changes
paho-mqtt_1.1-1_amd64.changes  paho-mqtt_1.1.orig.tar.gz
paho-mqtt_1.1-1.debian.tar.xz  python-paho-mqtt_1.1-1_all.deb
paho-mqtt_1.1-1.dsc

```

###### 參考項目

* [Python Package Index - paho-mqtt](https://pypi.python.org/pypi/paho-mqtt)
* [Python Package Index - stdeb](https://pypi.python.org/pypi/stdeb)

###### 系列文章

* [體驗 MQTT - 一、在 Debian 8 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [體驗 MQTT - 二、JavaScript 用戶端設置]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
