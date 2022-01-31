---
title: Arduino Serial 與 String 使用經驗 - readString
category: programming
tags: [arduino,serial,lora,智慧農業]
cover: https://rocksaying.github.io/images/imgur/WhjgjLm.jpg
---

最近參與了一個智慧農業 4.0 相關的案子，這類案子通常都要整合環境感測模組（水位、氣溫）、無線訊號模組和自動控制系統。而且因為農地周圍常常沒有穩定的市電，故這些農業用途的設備基本都需要用電池供電。在低電力供應的限制下，我第一次用了 Arduino 控制週邊模組。 Arduino 開發工作本身並不困難，難在接上它的感測模組並沒有一定的資料輸出、入格式。幾乎每種感測模組都需要針對它的特性調整資料讀取動作。

![智慧農業 4.0 成果發表會現場](https://rocksaying.github.io/images/imgur/GycXRGQ.jpg)

本文案例，感測模組接上 Arduino 控制板的 Serial 針腳，透過 Serial 埠送出感測資料。當 Arduino 讀到感測資料後，要將資料透過無線訊號模組傳送給遠地的資料收集裝置。基於無線訊號模組的資料傳輸特性，應將資料先放入封包，以封包為單位傳送出去。

但本文案例的感測模組送出的資料內容沒有固定長度，也沒有固定的結束字元。一筆感測資料內容包含多行文字，但換行字元放在每行開頭，最後一行不附加換行字元。因此我也不能用換行字元判斷它是否送完一筆資料了。

<!--more-->

雖然這個感測模組有著這麼多不確定的內容，但還是有明確的動作。確定事項是:

* 此感測模組每隔一定時間送出一筆資料。間隔可調，本文案例設為十分鐘。
* 送出一筆資料的耗費時間不會超過 3 秒。

碰到這種資料來源會連續輸出字元但每次輸出有一定時間間隔的情形時，就可以考慮使用 [serial.readString()](https://www.arduino.cc/reference/en/language/functions/communication/stream/streamreadstring/) 讀取資料。至於 [serial.read()](https://www.arduino.cc/reference/en/language/functions/communication/serial/read/) 方法，由於資料沒有固定的結束字元，故派不上用場。

`readString()` 方法的行為是不論有無資料可讀取、也不論資料長度，都會等到 `serial.setTimeout()` 指定的工作時間截止後才返回。這段期間內讀取的資料全部放入字串 (*String*) 回傳。如果沒有資料，則字串長度為 0 。它的行為完全滿足本文案例需求。

此例使用 RF95 LoRa 無線訊號模組，但本文不說明此模組的用法。各位自行想像。

```c++
// -*- mode: C++ -*-
#include <SoftwareSerial.h>
#include <RH_RF95.h>
#include <LowPower.h>

// Singleton instance of the radio driver
SoftwareSerial ss(5, 6); // RX,TX
RH_RF95 rf95(ss);

void setup() 
{
    Serial.begin(19200);
    Serial.setTimeout(3000); // 根據本案例感測模組送出一筆資料的耗費時間上限

    if (!rf95.init()) {
        while(1);
    }
}

void loop()
{
    byte buf[RH_RF95_MAX_MESSAGE_LEN];
    int max_len = sizeof(buf) - 4;
    // RF95 LoRa 封包最大255 bytes, 4 bytes 被 library 作為 header

    String s;
    int cc = 0;
    int sub_from = 0;
    int sub_to = 0;
    int wlen = 0;

    if (Serial.available() > 0) {
        s = Serial.readString();
        cc = s.length();
    }
    else {
        // delay(15);
        LowPower.idle(SLEEP_15MS, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_OFF, 
            SPI_OFF, USART0_ON, TWI_OFF);
        return;
    }

    wlen = cc;
    sub_from = 0;
    sub_to = 0;

    // 封包長度有限，需要分段送出資料。
    while (wlen > 0) {
        if (wlen > max_len) {
            sub_to += max_len;
            wlen -= max_len;
        }
        else {
            sub_to += wlen;
            wlen = 0;
        }
        s.substring(sub_from, sub_to).getBytes(buf, sub_to - sub_from);

        // 呼叫 RF95 LoRa 訊號發送函數，送出訊息
        rf95.send(buf, sub_to - sub_from);
        rf95.waitPacketSent();
        rf95.waitAvailableTimeout(300); // NOTICE 太短會漏發封包

        sub_from = sub_to;
    }

    // 感測模組下次送出資料前，讓 Arduino 進入省電狀態
    rf95.sleep(); // wake up by send(), recv() or idle().
    for (cc = 0; cc < 74; ++cc) { // 省電狀態10分鐘
        LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
    }
    return;
}
```

目前我使用過的 LoRa 模組，它們的資料封包長度限制並不相同，而且都不長。短的只有 16 bytes ，長的也只到 255 bytes 。本案例的感測模組送出的資料一定會超過 16 bytes ，所以用上 `substring()` 把資料截成一段段地送出。

除了 `readString()` 方法之外， [serial.readBytes()](https://www.arduino.cc/reference/en/language/functions/communication/serial/readbytes/) 也適用本文案例。但 `readString()` 方法回傳的是 *String* ，此資料型態提供較易使用的操作方法，所以我優先採用。但缺點是記憶體空間需求大。我在記憶體空間只有 2 KB 的 Arduino 模組上，就碰過 String 方法在操作時 OOM ，導致我取到空字串的情形。我將在下一篇文章說明用 `readBytes()` 處理資料的經驗。

最後提一下 *LowPower* 的動作。資料動作間隔十分鐘 (600秒) ，但我只進入省電狀態 74*8 = 592 秒。這是因為這些模組的時鐘不同步，多少有些誤差。可能感測模組認為已經過十分鐘了，而 Arduino 這邊還差 3 秒。這樣就會變成感測模組送完資料後， Arduino 才醒過來就讀不到資料的狀況。故時間間隔不能抓太準。

![智慧農業 4.0 成果陳列區](https://rocksaying.github.io/images/imgur/WhjgjLm.jpg)

###### 參考資料

* [Arduino Serial 與 String 使用經驗 - readBytes]({% post_url 2017-12-08-Arduino_Serial_and_String_exp2-readBytes %})
* [Arduino String](https://www.arduino.cc/reference/en/language/variables/data-types/stringobject/)
* [Arduino Serial](https://www.arduino.cc/reference/en/language/functions/communication/serial/)
* [Arduino Stream](https://www.arduino.cc/reference/en/language/functions/communication/stream/)
* [Low Power Library for Arduino](https://github.com/rocketscream/Low-Power)
