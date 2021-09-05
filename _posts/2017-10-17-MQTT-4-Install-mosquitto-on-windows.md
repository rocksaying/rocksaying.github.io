---
title: MQTT用戶端入門 - 四、在 Windows 10 安裝 mosquitto 補遺
category: programming
tags: [IoT,MQTT,mosquitto]
lastupdated: 2018-09-12
---

[Mosquitto](http://www.eclipse.org/mosquitto/) 提供 Windows 系統的安裝包。但是有些事沒說清楚，對首次接觸者帶來些許困擾。我在此補充一些事。 v1.5.1 (2018-08-16) 有重要變動。

#### 缺少功能

Mosquitto 的 Windows 系統安裝包在 v1.5.1 之前並未啟用 MQTT over websockets 功能。如果你需要這功能，你得要下載原始碼自行編譯。

而在 v1.5.1 (2018-08-16) 起，將 websockets 功能編入了。你只需要按 [MQTT用戶端入門 - 二]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %}) 的說明，在組態檔中啟用 websockets 。

至於我個人的作法則不一樣。因為是 Windows 10 ，所以我啟用 Windows Subsystem for Linux (WSL) 安裝 Ubuntu on Windows 。然後在 Ubuntu on Windows 中直接用 apt-get 安裝 mosquitto 套件，同 [Debian 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})。本文寫作時， Ubuntu on Windows 運行的散佈版本為 16.04 ， mosquitto 套件版本為 1.4.8 ，已可使用 MQTT over websockets 。

Windows Subsystem for Linux 是好東西啊。

#### 安裝時的必要項目

Mosquitto 安裝程式 (Native build) 會提示你在繼續安裝前，先複製與安裝兩個軟體。但我建議先中斷 Mosquitto 安裝程式，等安裝了下列三個軟體之後，才去執行 Mosquitto 安裝程式。喔，你沒看錯，是「三個」。

<!--more-->

#### Mosquitto 1.5.1 之後的版本

Mosquitto 的 Windows 安裝包，在 v1.5.1 起有下列變動。簡化安裝步驟，並提供 websockets 功能。

<blockquote>
<ul>
    <li>There are now 64-bit and 32-bit native packages.</li>
    <li>Websockets support is included.</li>
    <li>Threading support is not included in libmosquitto to simplify installation, alternative solutions are being looked into for the future.</li>
    <li>The only external dependency is now OpenSSL.</li>
</ul>
<cite><a href="http://mosquitto.org/blog/2018/08/version-151-released/">Version 1.5.1 released</a></cite>
</blockquote>

v1.5.1 起，只需要一個額外的軟體，即 Win32 OpenSSL 。到 [Win32 OpenSSL](http://slproweb.com/products/Win32OpenSSL.html) 取得 "Win32 OpenSSL 1.1.0* Light" 或 "Win64 OpenSSL 1.1.0* Light" (Win32OpenSSL_Light-1_1_0i.exe 或 Win64OpenSSL_Light-1_1_0i.exe)。安裝時，會問你想將 dll 檔案複製到何處？建議選 Windows System 資料夾。


#### Mosquitto 1.5.0 與之前的版本

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

#### 組態設定

組態檔 mosquitto.conf 位於 Mosquitto 的安裝目錄。若按預設安裝內容，會是 *C:\Program Files\mosquitto\mosquitto.conf* 。

至於密碼檔 (password_file) 和存取控制檔 (acl_file) 等其他檔案的路徑，則一律在 mosquitto.conf 指定。建議用絕對路徑表示。

你可以在命令列視窗中，執行 `mosquitto.exe -v -c mosquitto.conf` 。以檢測模式，確認你的組態設定可以運作。

如果沒有錯誤，以系統管理員身份，執行 `mosquitto.exe install` 就會在系統服務中，增加 *Mosquitto broker* 項目。以後開機時，就會自動啟動 MQTT 服務。

如果你不再需要於自己的電腦啟動 MQTT 服務，則以系統管理員身份，執行 `mosquitto.exe uninstall` 移除服務。

###### 參考項目

* [Mosquitto 正式網站](http://www.eclipse.org/mosquitto/)

###### MQTT用戶端入門系列文章

* [一、在 Debian 8 安裝 mosquitto]({% post_url 2016-03-04-MQTT-1-Debian8安裝mosquitto %})
* [二、JavaScript 用戶端程式設計]({% post_url 2016-03-07-MQTT-2-JavaScript-setting %})
* [三、Python 用戶端程式設計]({% post_url 2016-03-09-MQTT-3-Python-clients %})
* [四、MQTT用戶端入門 - 四、在 Windows 10 安裝 mosquitto ]({% post_url 2017-10-17-MQTT-4-Install-mosquitto-on-windows %})
* [五、Python 用戶端程式設計]({% post_url 2021-09-05-MQTT-5-C#-clients %})
* [MQTT qos 機制，發佈者如何確認訂閱者收到訊息？]({% post_url 2016-08-26-MQTT-qos_and_published %})
