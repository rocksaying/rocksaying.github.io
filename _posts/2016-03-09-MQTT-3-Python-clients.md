---
title: MQTT用戶端入門 - 三、Python 用戶端程式設計
category: programming
tags: [IoT,MQTT,mosquitto,paho,python,dbus]
---

Debian 8 套件庫中提供了 python-mosquitto 作為 Mosquitto 的用戶端程式庫。但現在不用這個，改用 [Paho 專案](https://eclipse.org/paho/) 提供的 Python 用戶端程式庫: [Paho Python Client](https://eclipse.org/paho/clients/python/)。此程式庫具有泛用性，連接對象不限於 mosquitto ，亦可連接支援 MQTT 協定的其他 MQ 服務。

<!--more-->

### 安裝 Python 用戶端程式庫

安裝 [Paho Python 用戶端程式庫](https://eclipse.org/paho/clients/python/) 最簡單的方式，就是透過 Python 官方的 [Python Package Index (PyPI)](https://pypi.python.org/pypi) 服務。

Debian 用戶可安裝 python-stdeb 套件，再執行 <kbd>pypi-install paho-mqtt</kbd> 。就會自 PyPI 下載並安裝 Paho Python 用戶端程式庫。安裝後顯示的套件名稱為 python-paho-mqtt 。

pypi-install 實際上由下列兩工具合作:

* pypi-download - 自 PyPI 下載 Python 套件的 tarball 文件。
* py2dsc-deb - 將 PyPI 的 tarball 文件打包為 Debian 套件 (.deb)。

我的作法是由一位負責人管理這類不是由作業系統維護者提供的套件，將它們上傳到公司內部的套件庫。公司內部其他開發人員再從公司套件庫安裝這些庫件，而不是讓他們自己去下載這些套件。所以我接下來將說明 <dfn>pypi-download</dfn> 和 <dfn>py2dsc-deb</dfn> 的操作過程，示範如何將 PyPI 套件打包成 Debian 套件後安裝。

Paho Python 用戶端程式庫在 PyPI 註冊的套件名稱是 paho-mqtt ，所以第一步先執行 <kbd>pypi-download paho-mqtt</kbd> 下載 tarball 文件。在此例中，我下載得到 paho-mqtt-1.1.tar.gz 。

第二步用 py2dsc-deb 將剛剛下載得到的 tarball 打包成 Debian 套件。預設打包為 Python 2 套件。如果你是 Python 3 用戶，你得要加上選項 <em>--with-python3</em> 。在此例中，打包好的套件放在 deb_dist 子目錄下，檔名是 python-paho-mqtt_1.1-1_all.deb 。

最後將此 deb 檔上傳到公司內部套件庫並安裝。操作過程如下所示:

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


### 入門

#### 發佈訊息

用戶端程式偶爾需要發佈訊息，不須與 mqtt broker 保持連線的情形，可用 `single()` 或 `multiple()` 方法。這種作法比較省電。

{% highlight python %}
import paho.mqtt.publish as publish

# publish a message then disconnect.
host = "localhost"
topic = "tw/rocksaying"
payload = "hello mqtt"

# If broker asks user/password.
auth = {'username': "", 'password': ""}

# If broker asks client ID.
client_id = ""

publish.single(topic, payload, qos=1, hostname=host)

#publish.single(topic, payload, qos=1, host=host,
#    auth=auth, client_id=client_id)

{% endhighlight %}

當用戶端程式，例如感應器服務程式，經常或短週期地持續發佈訊息時，則應用連線式設計。

{% highlight python %}
# coding: utf-8
import sys, os, time
reload(sys)
sys.setdefaultencoding('utf-8')

import paho.mqtt.client as mqtt

# If broker asks client ID.
client_id = ""

client = mqtt.Client(client_id=client_id)

# If broker asks user/password.
user = ""
password = ""
client.username_pw_set(user, password)

client.connect("localhost")

topic = "tw/rocksaying"
payload = "你好 mqtt"

for i in xrange(10):
    client.publish(topic, "%s - %d" % (payload, i))
    time.sleep(0.01)
    # 當 qos = 0, 若訊息間隔太短，就可能會漏發訊息。這是正常現象。

{% endhighlight %}

<div class="note">
實作時，可先用 mosquitto_sub 訂閱主題，以監看訊息是否送出。
</div>

#### 訂閱主題

本節實作一個類似 mosquitto_sub 的程式，訂閱主題 "tw/rocksaying/#" 。它也是一個服務程式的基礎骨架。

{% highlight python %}
# coding: utf-8
import sys, os, time, signal
reload(sys)
sys.setdefaultencoding('utf-8')
import paho.mqtt.client as mqtt

client = None
mqtt_looping = False

TOPIC_ROOT = "tw/rocksaying"

def on_connect(mq, userdata, rc, _):
    # subscribe when connected.
    mq.subscribe(TOPIC_ROOT + '/#')

def on_message(mq, userdata, msg):
    print "topic: %s" % msg.topic
    print "payload: %s" % msg.payload
    print "qos: %d" % msg.qos

def mqtt_client_thread():
    global client, mqtt_looping
    client_id = "" # If broker asks client ID.
    client = mqtt.Client(client_id=client_id)

    # If broker asks user/password.
    user = ""
    password = ""
    client.username_pw_set(user, password)

    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect("localhost")
    except:
        print "MQTT Broker is not online. Connect later."

    mqtt_looping = True
    print "Looping..."

    #mqtt_loop.loop_forever()
    cnt = 0
    while mqtt_looping:
        client.loop()

        cnt += 1
        if cnt > 20:
            try:
                client.reconnect() # to avoid 'Broken pipe' error.
            except:
                time.sleep(1)
            cnt = 0

    print "quit mqtt thread"
    client.disconnect()

def stop_all(*args):
    global mqtt_looping
    mqtt_looping = False

if __name__ == '__main__':
    signal.signal(signal.SIGTERM, stop_all)
    signal.signal(signal.SIGQUIT, stop_all)
    signal.signal(signal.SIGINT,  stop_all)  # Ctrl-C

    mqtt_client_thread()

    print "exit program"
    sys.exit(0)

{% endhighlight %}

執行此範例程式後，就會進入待命狀態，等待來自 broker 發放的訊息。你可以用 mosquitto_pub 或上一節的範例程式發送訊息。同時查看此程式的輸出內容。

在實作過程中，我有時會遇到 'Broken pipe' 的錯誤狀況。故我在處理 `client.loop()` 的迴圈中，加上了一個重連計數動作。

個人經驗，如果服務程式是固定短週期(例如每秒一次)就會發佈或接受到訊息的情形，就不會碰到 'Broken pipe' 的狀況。這時你可以直接選擇用 `client.loop_forever()` 進入待命狀態，而不必用 `while` 配合 `client.loop()/client.reconnect()` 。


### 進階

#### 用戶端服務

大部份 MQTT 用戶端服務程式需要同時監看與發佈訊息。例如一個感應器服務程式，它一邊得監看主題以接收來自其他程式的動作請求；另一邊得讀取感應器狀態後發佈到主題上。

Paho 提供的範例程式使用 `loop_start()` 方法進入內建的待命執行緒，再讓設計者於主執行緒中讀取感應器狀態與發佈訊息。如下所示:

{% highlight python %}
mqttc.loop_start()  # enter a looping thread.

# main thread
while True:
    temperature = sensor.blocking_read()
    mqttc.publish("paho/temperature", temperature)
{% endhighlight %}

但我將示範另一種設計方式。延續上節訂閱主題的程式骨架，於主執行緒中處理待命迴圈。另外分出一支執行緒讀取狀態與發佈訊息。

在「[MQTT用戶端入門 - 二、JavaScript 用戶端設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})」中，我設定了一個閘門裝置。此節我將套用此設定，設計一個閘門服務程式。此服務程式必須:

* 發佈閘門狀態到主題 'tw/rocksaying/status' 上。
* 監看主題 'tw/rocksaying/command' ，處理客戶的 open/close/alarm 命令請求。

衍用上節範例程式碼，增補 `status_reading()` 等內容如下:

{% highlight python %}
# coding: utf-8
import sys, os, time, signal
reload(sys)
sys.setdefaultencoding('utf-8')
import threading
import paho.mqtt.client as mqtt

client = None
mqtt_looping = False
reading_thread = None

def status_reading():
    while True:
        #status = gate.read()
        time.sleep(1)   # 假設讀取狀態
        status = "noop"

        if mqtt_looping:
            client.publish(TOPIC_ROOT + '/status', status, qos=1)
        else:
            print "quit status reading thread"
            return

def on_message(mq, userdata, msg):
    print "topic: %s" % msg.topic
    print "payload: %s" % msg.payload
    print "qos: %d" % msg.qos

    chn = msg.topic.rpartition('/')[-1]
    if chn == 'command':
        print "Should invoke gate %s function" % msg.payload

        # 假裝開門狀態
        client.publish(TOPIC_ROOT + '/status', "opening", qos=1)
        time.sleep(0.5)
        client.publish(TOPIC_ROOT + '/status', "opened", qos=1)

def mqtt_client_thread():
    #
    # 省略前後文
    #
    print "Looping..."

    reading_thread = threading.Thread(target=status_reading)
    reading_thread.start()

    #mqtt_loop.loop_forever()
    cnt = 0
    while mqtt_looping:


if __name__ == '__main__':
    #
    # 省略前後文
    #
    mqtt_client_thread()

    reading_thread.join()
    print "exit program"
    sys.exit(0)

{% endhighlight %}

在你監看 'tw/rocksaying/#' 時，你會發現這個模擬服務程式會每秒送出一個 'noop' 狀態。如果你在主題 'tw/rocksaying/command' 上發佈一道 'open' 文字，此服務程式將模擬非同步地送出開門異動狀態。

在此設定的閘門工作方式為，送出控制指令後，並不會同步等待閘門動作完畢才回返。用戶端程式必須查看閘門狀態確認動作結果。


#### 與 D-Bus 協作

[D-Bus]({% post_url 2010-7-13-D-Bus 用途說明 %}) 是 Linux 系統的標準高階 IPC 機制，它也是 Message Queue 架構。但基於其實作限制，它不能或不方便處理下列工作:

* 它並未實作網路匯流排模式(net bus)，故不支持 RPC 。
* 它的用戶端採用 API 形式溝通，要求訊息必須使用它規定的方式封箱(boxing)。至於它未規定封箱方式的資料型態，你就不能透過 DBus 傳遞。
* 基於它的封箱方式，處理容器型態資料時，效率極差。特別是 byte array ，它並不是用連續排列的方式封箱。

但是它的 API 工作形式，非常方便程式碼再用，並利於混合各種程式語言的設計工作。同時，它也是 Linux 桌面環境的行程互動標準機制。故在 Linux 環境中，仍有 MQTT 不可取代之處。 Linux 程式設計者仍有機會在服務程式中同時使用 MQTT 與 D-Bus 內容。

本節繼續使用上節服務程式碼作為範例，增加下列 D-Bus 工作內容:

* 服務名稱: tw.rocksaying.Gate
* 服務路徑: /tw/rocksaying/Gate
* 服務介面: tw.rocksaying.Gate
* 信號: StatusChanged(s:payload)
* 方法: Open()

{% highlight python %}
#
# 省略前後文
#
import paho.mqtt.client as mqtt
import gobject, dbus, dbus.service, dbus.mainloop.glib

reading_thread = None
dbus_service = None
dbus_loop = None

def status_reading():
    while True:
        #status = gate.read()
        time.sleep(1)
        status = "noop"

        if mqtt_looping:
            client.publish(TOPIC_ROOT + '/status', status, qos=1)
            if dbus_service:
                dbus_service.StatusChanged(status)
        else:
            print "quit status reading thread"
            return

def mqtt_client_thread():
    #
    # 省略前後文
    #
    while mqtt_looping:
        client.loop()

        cnt += 1
        if cnt > 20:
            try:
                client.reconnect() # to avoid 'Broken pipe' error.
            except:
                time.sleep(1)
            cnt = 0

    print "quit mqtt thread"
    dbus_loop.quit()
    client.disconnect()

class DbusService(dbus.service.Object):
    NAME = "tw.rocksaying.Gate"
    PATH = '/'+NAME.replace('.','/')

    def __init__(self, event_loop):
        self.event_loop = event_loop
        self.bus = dbus.SystemBus()
        bus_name = dbus.service.BusName(DbusService.NAME, bus=self.bus)
        dbus.service.Object.__init__(self, bus_name, DbusService.PATH)

    @dbus.service.signal('tw.rocksaying.Gate', signature='s')
    def StatusChanged(self, msg):
        pass

    @dbus.service.method('tw.rocksaying.Gate')
    def Open(self):
        print "Invoke gate open function"

def dbus_service_thread():
    try:
        print "dbus looping"
        dbus_loop.run()
    except:
        pass
    print "quit dbus thread"

if __name__ == '__main__':
    signal.signal(signal.SIGTERM, stop_all)
    signal.signal(signal.SIGQUIT, stop_all)
    signal.signal(signal.SIGINT,  stop_all)  # Ctrl-C

    gobject.threads_init()
    dbus.mainloop.glib.threads_init()
    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
    dbus_loop = gobject.MainLoop()
    dbus_service = DbusService(dbus_loop)

    dbus_thread = threading.Thread(target=dbus_service_thread)
    dbus_thread.start()

    mqtt_client_thread()

    dbus_thread.join()
    reading_thread.join()
    print "exit program"
    sys.exit(0)

{% endhighlight %}

Python D-Bus 設計內容請參考「[Python DBus 教學精要]({% post_url 2011-4-14-Python DBus 教學精要 %})」。

本節的服務程式範例，可以配合前文「[MQTT用戶端入門 - 二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})」中的 mqtt_js_demo.html 操作。

我個人選擇用 thread 在 MQTT 用戶端程式中加入 D-Bus 項目。當然你也可以簡單地分成兩個程式來寫。以 MQTT 服務程式主控感應器，讓 D-Bus 服務程式透過 MQTT 向主服務程式發佈訊息(下達命令)與訂閱主題(取得狀態回執)。


###### 參考項目

* [Paho Python Client](https://eclipse.org/paho/clients/python/)
* [Python Package Index - paho-mqtt](https://pypi.python.org/pypi/paho-mqtt)
* [Python Package Index - stdeb](https://pypi.python.org/pypi/stdeb)
* [DBus 用途說明]({% post_url 2010-7-13-D-Bus 用途說明 %})
* [Python DBus 教學精要]({% post_url 2011-4-14-Python DBus 教學精要 %})

###### MQTT用戶端入門系列文章

* [一、在 Debian 8 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
* [三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})
* [四、MQTT用戶端入門 - 四、在 Windows 10 安裝 mosquitto ]({% post_url 2017-10-17-MQTT-4-Install-mosquitto-on-windows %})
* [五、Python 用戶端程式設計]({% post_url 2021-09-05-MQTT-5-C#-clients %})
* [六、透過NB-IoT電信模組發送MQTT訊息]({% post_url 2021-09-12-MQTT-6-NB-IoT_module %})
* [MQTT qos 機制，發佈者如何確認訂閱者收到訊息？]({% post_url 2016-08-26-MQTT-qos_and_published %})
