---
title: MQTT用戶端入門 - 四、在 Windows 10 安裝 mosquitto 補遺
category: programming
tags: [IoT,MQTT,mosquitto]
---

[Mosquitto](http://www.eclipse.org/mosquitto/) 提供 Windows 系統的安裝包。但是有些事沒說清楚，對首次接觸者帶來些許困擾。我在此補充一些事。

#### 缺少功能

Mosquitto 的 Windows 系統安裝包並未啟用 MQTT over websocket 功能。如果你需要這功能，你得要下載原始碼自行編譯。

#### 安裝時的必要項目

Mosquitto 安裝程式 (Native build) 會提示你在繼續安裝前，先複製與安裝兩個軟體。但我建議先中斷 Mosquitto 安裝程式，等安裝了下列三個軟體之後，才去執行 Mosquitto 安裝程式。喔，你沒看錯，是「三個」。

<!--more-->

##### 1. pthreadVC2.dll

來源 [ftp://sources.redhat.com/pub/pthreads-win32/dll-latest/dll/x86/](ftp://sources.redhat.com/pub/pthreads-win32/dll-latest/dll/x86/) 。下載 pthreadVC2.dll ，複製到 C:\Windows 目錄中。

##### 2. Win32 OpenSSL v1.0.2 Light 32 bits

來源 [https://slproweb.com/products/Win32OpenSSL.html](https://slproweb.com/products/Win32OpenSSL.html) 。下載 Win32OpenSSL_Light-1_0_2L.exe 。

注意，不要下載 v1.1.0f 版，這個較新的版本中並沒有 Mosquitto 需要的 *libeay32.dll* 和 *ssleay32.dll* 兩個檔案。也不要下載 Win64 版本。

安裝 OpenSSL 時，會有一個 **Copy OpenSSL DDLs to:** 的選項。你可以選擇將檔案複製到 Windows system 目錄。或者，先安裝到預設的 C:\OpenSSL-Win32\bin 目錄，再自己把該目錄中的 *libeay32.dll* 和 *ssleay32.dll* 複製到 C:\Windows 目錄。

如果你選擇自己複製那兩個 dll 檔案到 C:\Windows 的方式，複製完成後就可以移除 OpenSSL 套件。我們就只需要那兩個檔案而已。

##### 3. Visual C++ Redistributable for Visual Studio 2015

目前的 Mosquitto (v1.4.9) 使用 Visual Studio 2015 編譯，所以你實際上還需要安裝 Visual C++ 2015 可轉發套件 (Visual C++ Redistributable for Visual Studio 2015) 。安裝文件沒有說明這一點。

來源 [Microsoft Download Search](https://www.microsoft.com/en-us/search/result.aspx?q=+Visual+C%2B%2B+Redistributable+for+Visual+Studio+2015)

若未安裝 Visual C++ Redistributable for Visual Studio 2015 ，則 mosquitto 執行時會說缺少  *vcruntime140.dll* 。

###### 系列文章

* [MQTT用戶端入門 - 一、Debian 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [MQTT用戶端入門 - 二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
* [MQTT用戶端入門 - 三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})
* [MQTT qos 機制，發佈者如何確認訂閱者收到訊息？]({% post_url 2016-08-26-MQTT-qos_and_published %})

###### 參考項目

* [Mosquitto 正式網站](http://www.eclipse.org/mosquitto/)
