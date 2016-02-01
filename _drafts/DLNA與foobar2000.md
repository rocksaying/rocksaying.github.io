DLNA 定義了很多種功能角色，以音樂播放來說，可分成以下四種主要角色:

* Media Server (DMS)
* Media Controller (DMC)
* Media Renderer (DMR)
* Media Player (DMP)

DMS 的角色最單純，把它當成 NAS 就行了，可讓 DMC 瀏覽它儲存的音樂清單。它負責儲存音樂，以及輸出資料。注意，它不是 DAC ，它輸出的就只是數位資料，而不是轉換成類比訊號的音樂。有些 DMS 會提供 stream 功能，可以讓使用者指定資料輸出時的音樂格式，例如轉成 WAV 或是 MP3 。

DMC 你可以把 DMC 想像成你手上的遙控器。它負責控制播放動作以及搜尋、瀏覽 DMS 的音樂清單，並且告訴 DMS 要把資料送到哪。

DMR 真正負責處理音樂的角色，它接收來自 DMS 的數位資料，解碼為 PCM 訊號送給音效裝置(音效卡、DAC)。

DMP 可以視為 DMC 加 DMR 。基本上提到 DLNA client 時，都是指 DMP 。


常見需求案例:

1. 手機和 NAS : 音樂檔放 NAS 上，手機安裝 APP 找 NAS 的音樂在手機上播放。這種組合是將 NAS 作為 DMS ，手機 APP 作為 DMP ，瀏覽 DMS 的音樂檔後，告訴 DMS 把音樂資料送過來給自己播放。

2. 手機和擴大機: 有一些組合音響或環繞擴大機支援 DLNA 。準確地說，這些擴大機只負責 DMR 的角色。手機APP 則作 DMS 和 DMC ，把放在手機上的音樂資料送出去給擴大機播放。

3. 手機和網路串流播放機: 網路串流播放機就是將 NAS 和擴大機裝一起的機器，所以是 DMS + DMR。手機 APP 只負責 DMC 。用手機查看播放機上的音樂檔，然後叫播放機放音。

挑選 DLNA 產品最麻煩的一點在於這些產品通常都不會說明它可以負責哪些角色。所以常常看到很多人抱怨說，某某東西明明說支援 DLNA ，卻不能做我想要它做的事(角色)。手機 APP 更是如此，很多免費的手機 DLNA APP，通常只符合上列的其中一種使用需求。如果以上三種需求你都會用到，那你可能得要安裝三個 APP 。

foobar2000 提供一個名為 foo_upnp (https://www.foobar2000.org/components/view/foo_upnp) 的插件，這個插件可以讓 foobar2000 同時具有 DMS/DMC/DMR 三種功能。

安裝很簡單，瀏覽前述連結的網頁內容，點擊下載，然後交給 foobar2000 安裝。 foobar2000 會問你是否確定要安裝，裝好後 foobar2000 還會再提示你重新啟動 foobar2000 。裝好之後，基本上什麼設定都不用做，foobar2000 的 DLNA 功能就能運作了。但是它的操作介面不太直覺。

foobar2000 upnp 把自己的 DLNA 功能分成 4 個操作元件，即:

* media server
* media browser
* media controller
* media render

假設現在有 A, B 兩台電腦都裝了 foobar2000 + upnp ，而且都啟動了 foobar2000 。那麼使用者可以有下列的使用方式:

1. A 打開 media browser 元件的視窗，瀏覽 B media server 上的音樂。當你選好音樂按播放時，它會從 B media server 取回音樂，這時是 A 電腦放音樂。你要用預設的播放控制列操作播放動作。

2. A 查看自己的音樂庫(meida library)，選好音樂，按右鍵叫出突顯選單，找到 Play to 選項，指定 B 為 media render 。 A 就把音樂送到 B 去，讓 B 電腦放音樂。這時你要另外打開 media controller 元件的視窗，用它的播放控制列操作 B 的播放動作。

3. A 打開 media browser 查看 B media server 的音樂，按右鍵找 Play to 選項，指定 B 為 media render 。也就是讓 B 播放本身儲放的音樂，而 A 單純當成一個遙控器，用 media controller 的播放控制列操作。
