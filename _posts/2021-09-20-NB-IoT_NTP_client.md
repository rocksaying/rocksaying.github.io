---
title: 透過NB-IoT電信模組取得NTP網路時間，以Python為例
category: programming
tags: [IoT,ntp,NB-IoT,LTE-M,python]
lastupdated: 2021-09-20
---

我在「[透過NB-IoT電信模組發送MQTT訊息]({% post_url 2021-09-12-MQTT-6-NB-IoT_module %})」說到有些 NB-IoT 模組只提供最基本的 TCP/UDP 封包傳輸指令，不提供 MQTT 等應用協定的傳輸指令。大部份 NB-IoT 模組的也沒有 NTP 指令 (查詢網路時間) 。

本文說明在這種情形之下，取得網路時間的經驗。

<!--more-->

大多數 IoT 裝置並未內建計時元件，它們不知道今夕何夕。但是實務上，我們又希望透過 NB-IoT 之類的電信模組，將裝置「當時」的狀態資訊回傳到控制中心。簡單說就是裝置回報的狀態資料要包含年、月、日、時、分、秒。所以，我們送出資料前，必須先查詢「現在時間」。

使用 NB-IoT 電信模組時，查詢時間的可行方法通常是以下兩種之一。

1. NB-IoT 模組提供查詢 4G/LTE 基地台目前時間的指令。
2. 沒有查詢時間的指令，但有 UDP 封包傳輸指令。

正常來說， NB-IoT 模組接上 4G/LTE 基地台的電信網路後，可以直接向基地台詢問目前時間。所以大部份 NB-IoT 模組不提供 NTP 協定的 AT 指令。

查詢時間的 AT 指令似乎是共通的。以 u-blox 的 [SARA-N/SARA-R4系列](https://www.u-blox.com/en/product/sara-r4-series)，和 SIMCOM 的 [SIM7000系列](https://www.simcom.com/module/lpwa.html) 為例，它們查詢時間的 AT 指令都是 `AT+CCLK?` ，Python範例如下。

```python

serial_port.write(b'AT+CCLK?')

resp = serial_port.read()
# +CCLK: "14/07/01,15:00:00+01"
# OK

```

回傳的時間格式是 "年/月/日,時:分:秒+時區修正"。「年」是西元年後二碼。「時」是24小時制，1~24。時區修正視時區而定，可能是加幾小時，也可能是減幾小時。台灣的時區是加八小時(+08)。也有些模組總是回傳 UTC 標準時間 (+00)。

但我個人經驗，這個指令有時候查不到正確的時間。這和 NB-IoT 模組有關。如果碰到這種情形，那就自己透過 UDP 傳輸指令查 NTP 網路時間吧。

實作 NTP 客戶端查詢網路時間的範例，請看「[Python NTP Client example](https://github.com/shirock/rocksources/blob/master/python/iot/ntpc.py)」。主要內容如下：

```python

def NTP_get_seconds(host="pool.ntp.org", port=123):
    '''
    @return seconds (UTC time)
    '''
    unix_epoch = 2208988800  # 1970-01-01 00:00:00

    # ntp packet: at least 48 bytes
    # head = 0x1B => 00,011,011 (li = 0, vn = 3, mode = 3)
    ntp_packet = b'\x1B' + b'\0' * 47 

    client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    client.sendto(ntp_packet, (host, port))
    data, _ = client.recvfrom(48)

    seconds = struct.unpack("!12I", data)[10] - unix_epoch
    return seconds

```

其實 NTP 客戶端的查詢指令很簡單，就是一個 48 bytes 的資料封包，第一個 bytes 是 0x1B ，接著 47 個 bytes 都填 0 。然後用 UDP 協定把封包送到 NTP 伺服器。

回傳的資料格式， Python 可以用 `unpack()` 方法解析。它會得到一個基於西元元年的時間秒數。這和 Python 時間函數慣用的 unix 紀元時間不一樣。所以我寫的這個函數最後會減去 unix 紀元起始秒數，把它變成基於 unix 紀元的時間秒數。

中間的三行 socket 函數方法，請自行替換成 NB-IoT 模組的 UDP 傳輸 AT 指令。
