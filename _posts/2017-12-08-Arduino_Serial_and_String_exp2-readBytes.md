---
title: Arduino Serial 與 String 使用經驗 - readBytes
category: programming
tags: [arduino,serial,lora,智慧農業]
cover: https://i.imgur.com/WhjgjLm.jpg
---

![智慧農業 4.0 成果陳列區](https://i.imgur.com/WhjgjLm.jpg)

繼前文「[readString 使用經驗]({% post_url 2017-12-07-Arduino_Serial_and_String_exp1-readString %})」，本文將談 [serial.readBytes()](https://www.arduino.cc/reference/en/language/functions/communication/serial/readbytes/) 的使用經驗。

前文的感測模組屬於定時主動回報模式。而本文案例用的感測設備，則是終端指令互動模式。它不會主動回報任何資料。使用者必須透過 serial 埠連接進入它的 console ，輸入指令取得它的回應內容。理論上，用 `readString()` 方法同樣能處理它的輸出資料。只是它原本是設計和 PC 互動，並不考慮另一端的記憶體用量需求，導致它的輸出資料很長。當我使用 Arduino Pro Mini 控制板，在讀出它的資料接著呼叫字串方法加工時，會 OOM (Out of memory)。使我不得不換用 `readBytes()` 方法。

<!--more-->

本案例感測設備的輸出方式是:

* console 會回應你輸入的命令，所以命令是第一行。
* 第二行開始的內容皆為回應資料，資料結束字元為 **>** 。
* 回應資料會有多行，換行是 **\n\r** 。
* 為了在 console 上看起來明觀，資料都會格式化，用空白字元對齊數值。
* 數值後方會加上單位描述。

前三點都很好，但最後兩點對自動控制設備就是多此一舉了。而且是 Arduino 控制程式發生 OOM 狀況的凶手。

舉例來看。當我要讀取感測設備的設定的設備代號時，我要輸入命令 <kbd>device_id</kbd> ，然後它回傳設備代號。我在 console 上看到的內容，如下所示 (**⏎** 代表 **\n\r**，實際上不可見):

```term
device_id⏎
device :  12⏎
PASS⏎
>
```

如果命令錯誤或感測設備故障，則回應錯誤。如下所示:

```term
hello⏎
FAILED⏎
>
```

輸入命令 <kbd>sensor1</kbd> ，回傳  sensor1 的資料 (此感測設備有多個模組)。如下所示:

```term
sensor1⏎
water_temp1  :     23.5 [degC]⏎
water_press1 :  1017.16 [hPa]⏎
  .
  略
  .
PASS⏎
>
```

讀取各 sensor 的命令，就是 OOM 的地方。為了對齊欄位，它加了很多空白字元。

一開始，我為了節省 LoRa 封包的字數，所以用 `readString()` 讀到字串後，打算用 `replace()` 將字串中的所有空白字元和單位都刪掉。我在 PC 上寫測試程式碼時，都很正常。我可以拿到不含空白字元的資料傳送出來。但實際上傳到 Arduino Pro Mini 控制板執行時，呼叫 `replace()` 總是得到空白字串。但我讀取 device_id, battery 等輸出資料只有一行的狀態時，同樣的程式碼卻是正常的。在我修改測試多次讀取程式碼之後，我才確定是 OOM 的錯誤。

既然 `readString()` 不適合，那就換別的方法吧。 [serial.readBytesUntil()](https://www.arduino.cc/reference/en/language/functions/communication/serial/readbytesuntil/) 雖然適合用在這種有固定的資料結束字元的情形，但它同樣要先把內容都讀入 buffer ，之後再要求額外記憶體用於過濾空白字元。還是 OOM 。

那用 `serial.read()` 一字一字讀總行了吧？還是不行，因為感測設備輸出 sensor 資料時，每一行之間都會有停頓一下。大約 0.3 到 1 秒左右。用 `serial.read()` 讀到停頓時，就會認為沒有資料而立即返回，不會稍等。要一字一字讀，又能處理每行之間停頓一下的情形，看來看去，就是接受 timeout 設定的 [serial.readBytes()](https://www.arduino.cc/reference/en/language/functions/communication/serial/readbytes/) 可用了。`readBytes()` 的動作是讀到指定字數或工作時間截止後返回。我要求它一次只讀一個字元，再設定 timeout 為 2 。就可以滿足我的需求了。

至於記憶體用量，我在讀出一個字元後，就立即過濾，不將空白字元和不想要傳送的內容存入 buffer 。如此一來，就沒有額外的記憶體用量需求。終於解決了 OOM 困境。

以 sensor1 的資料為例。過濾之後，我實際透過 LoRa 封包送出的字串內容如下:

```
water_temp1:23.5⏎
water_press1:1017.16⏎
  .
  略
  .
PASS
```

**範例程式:**

```c++
// -*- mode: C++ -*-
#include <SoftwareSerial.h>
#include <RH_RF95.h>
#include <LowPower.h>

// Singleton instance of the radio driver
SoftwareSerial ss(5, 6); // RX,TX
RH_RF95 rf95(ss);

// 輸入命令後，在回應之前，要等一段處理時間
void write_command(char *cmd) {
    Serial.flush();
    delay(10);

    Serial.write(cmd);
    while (true) {
        delay(50);
        if (Serial.available() > 0)
            break;
    }
}

void send_packet(byte *buf, byte *cp) 
{
    uint8_t len = (unsigned int)cp - (unsigned int)buf;
    rf95.send(buf, len);
    rf95.waitPacketSent();
    rf95.waitAvailableTimeout(300);
}

int get_id()
{
    byte buf[RH_RF95_MAX_MESSAGE_LEN];
    byte *cp = buf;
    byte rbuf[2];
    byte c;
    bool fail = false;

    write_command("device_id\n\r");
    while (true) {
        if (Serial.readBytes(rbuf, 1) == 0) {
            continue;
        }
        c = rbuf[0];

        if (c == '>') { // end data
            break;
        }
        else if (c == 'F') { // FAILED
            fail = true;
        }
        if (c >= '0' && c <= '9') // valid char 0-9
            *cp++ = c;
    }
    *cp = 0;

    if (fail || cp == buf)
        return -1;
    return atoi((char*)buf);
}

bool send_sensor_data(char sensor_no)
{
    byte buf[RH_RF95_MAX_MESSAGE_LEN];
    byte *cp = buf;
    byte rbuf[2];
    byte c;
    bool fail = false;
    bool q = false;
    int count_nl;
    char cmd[] = {'s', 'e', 'n', 's', 'o', 'r', '?', '\n', '\r'};

    cmd[6] = sensor_no;
    write_command(cmd);

    count_nl = 0; // 記錄現在是第幾行
    while (true) {
        if (Serial.readBytes(rbuf, 1) == 0) {
            continue;
        }
        c = rbuf[0];

        if (c == '>') { // end data
            break;
        }
        else if (c == 'F') { // FAILED
            fail = true;
        }
        else if (c == '\n') {
            ++count_nl;
        }
        else if (c == '[') { // 單位開始
            q = true;
        }
        else if (c == ']' && q) { // 單位結束
            q = false;
            continue;
        }

        // 代表換行的 \n\r 只留下 \n, 空白字元和單位也不留
        if (c == '\r' || c == ' ' || q)
            continue;

        if (count_nl >= 1) // 第二行開始才是感測資料
            *cp++ = c;
    }
    *cp = 0;
    
    if (fail)
        return false;
    send_packet(buf, cp);
    return true;
}

void serial_up()
{
    Serial.begin(19200);
    Serial.setTimeout(2000);
}

void save_power()
{
    int c;

    Serial.end();
    rf95.sleep(); // wake up by send(), recv() or idle().

    // 本例設定每10分鐘讀取並發送資料
    for (c = 0; c < 74; ++c) { 
        LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
    }
    LowPower.powerDown(SLEEP_4S, ADC_OFF, BOD_OFF);
}

void setup() 
{
    if (!rf95.init()) {
        while(1);
    }
}

void loop()
{
    int device_id;

    serial_up();

    device_id = get_id();
    rf95.setHeaderFrom((uint8_t) device_id);

    send_sensor_data('1');
    send_sensor_data('2');

    save_power();
    return;
}
```

關於 OOM 的判斷經驗。 Arduino Pro Mini 配給函數內部的記憶體用量是 2 KB 。當我讀出的字串長度超過 500 字元時，接下來呼叫 `replace()`, `trim()`, `substring()` 等會修改字串內容或回傳新字串的方法便很容易 OOM 。而 Arduino 碰到 OOM 的狀況時，它不會當機，但也不會告訴你發生錯誤了。它就只是回傳一個空字串。程序人員得要花上一些功夫，先排除感測模組沒送出資料或讀取方法不對等嫌疑後，才會想到可能是 OOM 。

在 LoRa 的部分，因為本例的環境安置了多隻裝有 LoRa 模組的相同感測設備。所以本例多了 `rf95.setHeaderFrom()` 的動作，將感測設備的 ID 寫入 LoRa 封包的標頭中，讓資料收集中心知道它收到的是哪隻感測設備的資料。

因為 LoRa 的無線訊號傳送範圍很大。資料收集中心可能不小心收到其他客戶的感測設備的資料封包。我自己在專案過程中，資料收集中心就經常收到不知哪來的 LoRa 封包。如果你有多個資料收集中心的話，你可以再用 `rf95.setHeaderTo()` 設定代表資料接收端的 ID 。讓各個資料收集中心從封包標頭中知道由誰收集這個封包。

並非每種 LoRa 模組提供的函數庫都提供類似的方法。但我們可以自訂封包格式，加入標頭的 from 和 to 資料的 ID ，就可以建構簡單的 LoRa gateway 。

###### 參考資料

* [Arduino Serial 與 String 使用經驗 - readString]({% post_url 2017-12-07-Arduino_Serial_and_String_exp1-readString %})
* [Arduino String](https://www.arduino.cc/reference/en/language/variables/data-types/stringobject/)
* [Arduino Serial](https://www.arduino.cc/reference/en/language/functions/communication/serial/)
* [Arduino Stream](https://www.arduino.cc/reference/en/language/functions/communication/stream/)
* [Grove - LoRa Radio](http://wiki.seeed.cc/Grove_LoRa_Radio/) - 本案例使用的 LoRa 模組。
