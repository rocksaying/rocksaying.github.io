---
title: 使 Python 程式作為 Windows 服務執行之事項
category: programming
tags: [python,windows]
---

本文說明在 Windows 作業系統上，如何將 Python 程式以 Windows 服務 (Windows Service) 的模式執行。這可以讓程式於系統開機後，自動在背景中工作。

* 使用 [NSSM - the Non-Sucking Service Manager](https://nssm.cc/) 作為服務管理與啟動工具。
* 常用資料夾與 Python 程式執行時的帳號。

<!--more-->

#### 為何需要 nssm

在 Linux/Unix 系統的 Python 程序員眼中，想讓一個 Python 程式在開機後自動啟動於背景中工作，是一件很簡單的事 (<span class="note">這種開機後就在背景中工作的程式， Linux/Unix 稱為 *daemon* ，而在 Windows 上，就是 *Windows 服務 (Windows Service)* 。</span>) 最直覺的做法，不過是編輯 */etc/rc.local* ，加上一行 Python 指令，並在指令最後補上一個 `&` 字元。但同一件事，在 Windows 上就不是那麼簡單了。

首先， Windows 對服務程式要求不一樣的啟動方式。如果你使用 Python.org 釋出的 Windows 版本 Python ，按一般 Python 程式的寫法，你的程式並不能作為 Windows 服務啟動。這幾乎是所有 Windows 的解譯式開發工具都會碰上的狀況。這時，你需要一個發動器作為前導。將這個發動器以 Windows 服務啟動，再由它導入你的 Python 程式。

我個人試用過幾個發動器之經驗，以 [NSSM - the Non-Sucking Service Manager](https://nssm.cc/) 最容易使用。發動器中，最基礎的是微軟釋出的 [srvany](https://support.microsoft.com/zh-tw/help/137890/how-to-create-a-user-defined-service) ，但它實在太簡略，還得動用 regedit 編輯登錄檔。其他的發動器則有著太過老舊、與 Windows 10 不相容等狀況。但 NSSM 沒有這些問題。它不只有 GUI 介面，還可用命令列參數的形式，管理服務內容。

我們先來看看 Python 在 Linux/Unix 系統上的 daemon 程式典型寫法。程式會在一個迴圈內持續工作，直到管理者送出一個終止訊號或指令才跳出迴圈，停止服務。

<div class="note">
為了觀察程式在背景是否正常工作，我使用 MQTT 輸出訊息。關於 Python 使用 MQTT 的方式，請參考 [MQTT用戶端入門 - 三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %}) ，在此不多談。
</div>

###### v1 - python-service-sample

```python
#!/usr/bin/python3
import sys, os, time
import signal
import paho.mqtt.publish as publish

Service_Looping = False

def mq_print(msg):
    publish.single("tw/rocksaying/test", msg, hostname="iot.eclipse.org")

def stop_all(signum, frame):
    global Service_Looping
    Service_Looping = False
    mq_print("signal %d" % signum)

signal.signal(signal.SIGTERM, stop_all)
signal.signal(signal.SIGINT,  stop_all)  # Ctrl-C
# Windows: stop service will send SIGINT to process.

Service_Looping = True

# while Service_Looping:
for i in range(3):
    if not Service_Looping:
        break
    mq_print("heartbeat")
    time.sleep(3)

mq_print("exit")
sys.exit(0)
# 不論你的程式是否正常結束，nssm 都將重新執行此程式，
# 除非你在控制台的「服務」功能中，停止這個服務。
```

#### 使用 nssm 新增 Windows 服務

前述之示範程式配合 NSSM 的話，不必修改內容就可搬到 Windows 系統當 Windows 服務工作。

先列出我的 Windows 環境下之相關程式與文件的路徑。各位使用時，應按自己的情形調整。

* NSSM ，單一執行檔，我放在: C:\Windows\nssm.exe
* Python , 按預設安裝，會放一個執行檔在 Windows 系統目錄: C:\Windows\py.exe
* 範例程式目錄: D:\workspace\test

開啟一個命令視窗，輸入指令 `nssm install <service_name>` ，NSSM 就會出現 GUI 視窗，讓你輸入你要執行的程式和各項參數。 *service_name* 請換成你想用的服務名稱，名稱不能與系統中已經存在的服務相同。如下:

```term
C:> nssm install python-service-sample

```

NSSM GUI 如下圖:

![nssm install python-service-sample](https://i.imgur.com/Hp6R1S1.png)

NSSM GUI 可編輯項目相當多。但最主要的是第一頁 Application 應用程式的路徑、啟動後的工作目錄以及執行參數。

應用程式是指我們將要委托 nssm 發動的程式，而不是 nssm 自己。對 Python 程式而言，此處要填上 Python 解譯器的路徑。然後參數欄要填上 Python 程式文件的路徑，交給 Python 解譯器執行。我的環境就分別填入 <kbd>C:\Windows\py.exe</kbd> 和 <kbd>D:\workspace\test\python-service-sample.py</kbd>。按下 「Install service」鈕後就會在系統中新增一個服務了。

接著開啟「控制台／系統管理工具／服務」，找到剛剛新增的 Python 程式的服務。預設會在下次開機後自動啟動此服務。但此時應該還未啟動。如下圖:

![控制台／系統管理工具／服務](https://i.imgur.com/4ftABK5.png)

請按下「啟動」鈕啟動此服務，觀察 MQTT 主題，確認此示範程式是否正常工作。例如我用 mosquitto_sub 訂閱主題後，就會看到下列訊息:

```term
rock:~$ mosquitto_sub -v -h iot.eclipse.org -t tw/rocksaying/#
tw/rocksaying/test heartbeat
tw/rocksaying/test heartbeat
tw/rocksaying/test heartbeat
tw/rocksaying/test exit
tw/rocksaying/test heartbeat
tw/rocksaying/test heartbeat
tw/rocksaying/test heartbeat
tw/rocksaying/test exit
tw/rocksaying/test heartbeat
tw/rocksaying/test signal 2
tw/rocksaying/test exit
```

示範程式原本應該使用無限次數迴圈，但我故意使用一個執行三次就會結束的迴圈。觀察執行時的 MQTT 訊息，我們會查覺就算程式送出三次 heartbeat 訊息後結束了，但過幾秒後又會看到程式送出的訊息。這其實是 nssm 的輔助功能。不論你的程式是否正常結束，nssm 都將重新執行此程式，除非你在控制台的「服務」畫面中，停止這個服務。這可以保證程式作為背景服務的永續性。

我們再到「控制台／系統管理工具／服務」，停止 Python 程式的服務。 Windows 將對 nssm 和 Python 程式送出 *SIGINT* 訊號，程式接收到此訊號後便會設定迴圈狀態為 *False* 。而 nssm 也會結束，不會重新執行 Python 程式。

nssm 還提供了一些有用的輔助功能，例如:

* Dependencies: 可以指定相依服務。當指定的服務已經啟動了，才會執行你的程式服務。注意，此處要填入服務名稱，而不是顯示名稱。在「控制台／系統管理工具／服務」清單中，你看到的是顯示名稱。要查看服務的細項內容才會看到服務名稱。
* I/O: 可以將輸出入的內容重導向到指定的檔案中，這可以視為簡單 log 功能。你的程式服務必須擁有寫入檔案的權限。這點下面會再提。
* File rotation: 針對 I/O 重導向的 log 檔案設定循環動作。每幾秒或當記錄檔案超過多少位元組大小時，便將記錄檔案的內容歸零。避免檔案無限增長。

在「控制台／系統管理工具／服務」頁面調整的內容都是針對 nssm ，而不是我們委託 nssm 執行的 python 程式。針對委託程式的調整內容，應透過 nssm (使用 edit 或 set 參數)。

#### 常用資料夾與 Python 程式執行時的帳號

在 Linux/Unix 系統上設計 *daemon* 程式時，若我們的程式需要讀取或儲存本地的檔案，通常需要知道一些常用資料夾的路徑，例如 *TEMP* 資料夾、帳號的家資料夾和目前工作資料夾。這些資料夾一般都允許程式的執行帳號讀寫內容。 Python 為我們提供了函數模組取得這些常用資料夾的路徑，例如 `tempfile.gettempdir()`, `os.getcwd()` 。這些函數模組在 Windows 版本中也提供。基於程式跨平台設計之考量，我們應該儘可能使用這些函數。

Windows 服務執行時，預設的帳號身份是 *SYSTEM* 。當然你也可以在 nssm 的「Log on」頁面中指定其他的帳號身份。不同的帳號身份，主要影響了你的 Python 程式服務可以讀寫的檔案權限和可用資源多寡。例如程式執行時的家資料夾就因帳號身份而不同。

###### v2 - python-service-sample

將前面的示範程式改寫，加入常用資料夾路徑的取得函數，並顯示這些資料夾的讀寫權限。還顯示了帳號名稱、主機名稱和程式的參數清單。在設計服務程式時，一般都會需要這些資訊。

```python
#!/usr/bin/python3
import sys, os, time
import signal
import paho.mqtt.publish as publish
import tempfile
import platform
from socket import gethostname

Service_Looping = False

def mq_print(msg):
    publish.single("tw/rocksaying/test", msg, hostname="iot.eclipse.org")

def stop_all(signum, frame):
    global Service_Looping
    Service_Looping = False
    mq_print("signal %d" % signum)

signal.signal(signal.SIGTERM, stop_all)
signal.signal(signal.SIGINT,  stop_all)  # Ctrl-C
# Windows: stop service will send SIGINT to process.

mq_print("SYSTEM: %s" % platform.system())

mq_print("ARGV: %s" % sys.argv)
# 「控制台／系統管理工具／服務」的「啟動參數」只傳給 nssm ，
# 不是傳給委託 nssm 執行的 python 程式

home_dir = os.path.expanduser('~user')
# env_home = os.environ['HOME'] # Unavailable in Windows 
temp_dir = tempfile.gettempdir()
current_dir = os.getcwd()
mq_print("HOME:%s; TEMP:%s; Current:%s" % 
    (home_dir, temp_dir, current_dir))

if os.access(home_dir + "/..", os.W_OK):
    home_dir_state = "Writable"
else:
    home_dir_state = "Read Only"

if os.access(temp_dir, os.W_OK):
    temp_dir_state = "Writable"
else:
    temp_dir_state = "Read Only"

if os.access("C:/ProgramData", os.W_OK):
    programdata_dir_state = "Writable"
else:
    programdata_dir_state = "Read Only"

if os.access("C:/Windows", os.W_OK):
    windows_state = "Writable"
else:
    windows_state = "Read Only"

mq_print("HOME ACCESS: %s; TEMP ACCESS: %s" % 
    (home_dir_state, temp_dir_state))
mq_print("DATA ACCESS: %s; WINDOWS ACCESS: %s" % 
    (programdata_dir_state, windows_state))

try:
    username = os.getlogin()
except:
    username = os.environ['LOGNAME']
mq_print("USERNAME = " + username)
mq_print("HOSTNAME = " + gethostname())

Service_Looping = True

while Service_Looping:
    mq_print("heartbeat")
    time.sleep(3)

mq_print("exit")
sys.exit(0)

```

#### 平台移植注意事項

如果你的程式服務想在家資料夾下存取檔案的話，要注意這件事：當 Python 程式服務以預設的系統帳號執行時，家資料夾路徑可能是一個不存在的資料夾。例如在我的 Windows 10 系統上，系統服務帳號的家資料夾路徑是 C:\Windows\system32\config\user 。這個路徑不存在，但父資料夾 C:\Windows\system32\config 則可用且可寫入。

Linux/Unix 的 daemon 通常會以 root 身份執行，而且常用的資料夾會是 /etc, /var/log, /tmp 等系統資料夾。在 Python 函數模組中沒有對應的跨平台函數可用。如果你是想將使用這些系統資料夾的 Python 程式移植到 Windows 上使用，你會需要用到 `platform.system()` 作條件判斷，分別設定資料夾的路徑。

