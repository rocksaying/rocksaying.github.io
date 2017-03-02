---
title: 台灣 119 求救簡訊 APP 使用說明與開發筆記
category: programming
tags: [html5,gps,webapp,uwp]
lastupdated: 2017-03-02
cover: http://rocksaying.tw/webapp/119/taiwan-119-gps-snapshot.png
comment: taiwan119gps
---

「台灣 119 求救簡訊」是整合了 GPS 定位與 SMS 文字簡訊功能的應用程式。當使用者遇難需要向 119 消防局報案求助時，這個應用程式可以利用 SMS 文字簡訊送出求救訊息和 GPS 位置，讓消防局更快掌握受困者的地點。

此類工具對經常從事戶外活動的人頗有用處，各地方政府亦有發行類似的 App 。例如新聞「[定位神準！119APP救出摸黑的登山客](http://tw.hiking.biji.co/index.php?q=news&act=info&id=8839)」。但受限於我國政府單位的短淺目光，僅在 Android 和 iOS 的軟體市集上發布此類 App 。

我用 HTML5 和 JavaScript 設計了「台灣 119 求救簡訊」這個純網頁版本的 Webapp 。此外，受益於微軟在 Windows 10 時增加了 UWP (Universal Windows Platform, 通用 Windows 平台) 的應用程式模式，同樣的源碼可以直接包裝成 UWP App 供 Windows 安裝。

<!--more-->

### 使用說明

「台灣 119 求救簡訊」啟動時就會偵測用戶目前所在的地理位置。若以 Webapp 啟動，則用戶的瀏覽器會提示你是否允許瀏覽器提供地理位置。請允許。

偵測地點的動作大約會持續 5 秒鐘。在這段期間，用戶可以先選擇離所在區域最近的消防局。如果迷路狀況很嚴重，完全不清楚自己目前在哪個縣市範圍的話，可以猜一個。收到你的求救簡訊和 GPS 位置的消防局會轉達給最近的單位處理。

接著，在求救訊息欄位中，請輸入受困狀況和個人穿著特徵。此處的文字內容是按照內政部消防署建議的格式。如果用戶在野外受困，這些訊息可以幫助救難人員尋找你。你可以在出門前先輸入你的姓名和穿著特徵，「台灣 119 求救簡訊」會儲存此處內容。

當 GPS 位置偵測完成後，就會在畫面下方顯示用戶目前所在地點的經緯度，並出現 Google 地圖讓你確認地點(如果網際網路可用)。如果地點無誤，你就可以按下「發送求救簡訊」的按鈕，然後用戶的畫面就會切換到簡訊系統，並帶入簡訊內容和 GPS 位置。你只需要再確認一次內容，然後按下發送即可。

注意:

* 啟動程式時，最好在空曠或看得到天空的地點，提高 GPS 偵測位置準確度。
* 發送簡訊使用 SMS 電信系統。你的設備必須提供 SMS 簡訊功能，如手機。如果你使用的手機收不到訊號的話，你需要移動到通信訊號良好的地方。

![使用圖例](http://rocksaying.tw/webapp/119/taiwan-119-gps-snapshot.png)


### 安裝方式

你可以選擇下列其中一種:

1. 下載源碼自行修改。
2. 直接以瀏覽器開啟 Webapp 。
3. Windows 10 用戶可以安裝 UWP 版本。

#### 源碼

* 取得 [台灣 119 求救簡訊 源碼](https://github.com/shirock/rocksources/tree/master/web/taiwan-119-gps) 。
* 以 GNU GPL 3.0 軟體授權證授權使用者利用。

#### Webapp

台灣 119 求救簡訊 Webapp 網址: [http://rocksaying.tw/webapp/119/](http://rocksaying.tw/webapp/119/index.html) 。將此網址保存在瀏覽器書籤。

由於這是單一網頁版本，只需要儲存單一的 html 文件就可使用。故也可選擇儲存離線網頁在手機中，就可在不連接網際網路的狀態下用瀏覽器開啟。


#### Windows UWP App

此工具未在「Windows 市集」上發佈。因為在「Windows 市集」上發行 App 前，必須先註冊微軟開發人員帳號，且最基本的個人帳號也要收一筆註冊費。而我沒有註冊開發人員帳號，也完全不想為這個免費的工具花錢註冊，所以我不打算自己上傳「台灣 119 求救簡訊」到 Windows 市集。但我歡迎具有微軟開發人員帳號的朋友，將它打包上傳到 Windows 市集。 **請記得維持 GNU GPL 的自由軟體授權聲明** 。

我僅提供 UWP 的 .appx 安裝檔供人安裝。想透過 .appx 安裝的用戶，需要啟用 Windows 10 系統設定的「更新與安全性 > 開發人員專用 > 側載應用程式」。

* 下載 [Appx 安裝檔](http://rocksaying.tw/webapp/119/Taiwan119GPS_1.0.0.0_AnyCPU.appx) 。

Windows UWP 版本的「台灣 119 求救簡訊」比 Webapp 版本多了一個功能。因為在 UWP 環境上，允許跨來源資料請求 (cross domain access)，所以它每次執行時，都會嘗試從內政部的「開放資料平台」更新各地消防局簡訊號碼。


### 開發筆記

#### HTML5 與 SMS 簡訊

URL 格式第一個欄位的意義是傳送協定 (scheme)。用戶可以根據傳送協定執行指定的應用軟體。最為大眾所知的傳送協定是 *http* ，此協定的指定執行的應用軟體就是網頁瀏覽器。

除了 *http* 之外，還有一些正式定義的傳送協定，例如 *mail* 可執行電子郵件軟體， *sms* 可執行 SMS 簡訊軟體,  *tel* 可執行電話撥號軟體。規範如下:

* SMS : [RFC5724](https://tools.ietf.org/html/rfc5724)
* Telphone : [RFC3966](https://tools.ietf.org/html/rfc3966)
* [撥號操作 - Google 的 Web 開發者基礎](https://developers.google.com/web/fundamentals/native-hardware/click-to-call/)

我需要發送用戶所在位置的經緯度資訊，這麼長長一串的數字座標，看來用 SMS 簡訊發送最好。用電話來講，似乎不是好主意。

基本上，我只要放一個 URL 協定是 *sms* 加上簡訊號碼的連結讓用戶點擊就可。但如果可以帶入用戶事先輸入的求救訊息，就更好了。所以我還需要用 *body* 參數代入訊息文字。完整的 SMS URL 範例如下:

{% highlight html %}

<a href="sms:0932-299-702?body=求救">SMS</a>

{% endhighlight %}

在 JavaScript 中操作時， *body* 的文字內容必須經過 `encodeURIComponent()` 編碼。


#### 消防局簡訊號碼

在 [政府資料開放平臺](http://data.gov.tw/) 上，可以找到不少政府單位的開放資料。

* [119聽語障人士簡訊及傳真報案專線 資訊網頁](http://data.gov.tw/node/7917)
* [各地消防局的簡訊號碼 開放資料](http://od.moi.gov.tw/api/v1/rest/datastore/301060000C-000384-003)


#### 偵測所在地點

HTML5 規範了地理位置定位功能。參考 Mozilla Developer Network 的「[navigator.geolocation 地理位置定位](https://developer.mozilla.org/zh-TW/docs/Web/API/Geolocation/Using_geolocation)」文件。此文件有充足的說明資訊與範例。

在不具地理位置感應器 (如 GPS ) 的設備上，會使用網路基地台或 WiFi 定位取得地理位置，此時的準確度可能誤差很大。

在下列環境，啟動時可成功偵測位置，但按「定位」鈕再次定位時會失敗:

* Microsoft Edge 瀏覽器
* UWP App (PC 與 Windows 10 Mobile)

但用 Firefox 或 Chrome 瀏覽器時，不論作業系統是 Windows 10 或 Linux 各版，都能再次定位。

以 JavaScript 開發的 UWP App 和 Microsoft Edge 瀏覽器使用相同的 HTML 引擎，因此再次定位功能失敗的原因，可能出在這上頭。


#### Google 地圖

原本考慮用 [Google Maps API](https://maps.googleapis.com) ，但它要求我註冊一個 Goole API Key 。 Google 可以根據這個 API key 追蹤記錄我的 App 使用 Google 資源的用量，決定要不要向我收費。對我來說不必要。所以我選擇用 *iframe* 的 src 指定 URL 參數開啟 Google 地圖。

以 URL 開啟 Google 地圖時，可以用 `q=loc:???,???` 的格式帶入目標地點經緯度，先寫緯度，再寫經度。整個 URL 格式舉例如下:

{% highlight html %}

http://www.google.com.tw/maps?q=loc:23.65,120.321&output=embed

{% endhighlight %}

我使用 Google 地圖的用意是讓使用者確認 GPS 偵測的地點是否正確。用 Google Maps API 或嵌入網頁間的差異，並不影響用戶的操作體驗。


#### 跨來源資料請求

在 Windows UWP 環境上，允許跨來源資料請求 (cross domain access )，所以可以從內政部的「開放資料平台」取得最新的各地消防局簡訊號碼。但在 Webapp 上，這個資料請求動作會被拒絕忽視，只使用記錄在源碼中的簡訊資料。

消防局的簡訊號碼幾乎不會異動，所以此資料更新動作並非必要，不影嚮程式工作。

