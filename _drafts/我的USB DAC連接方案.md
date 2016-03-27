我的 USB DAC 連接方案 (窮人 Purifier)

自從看了 xtreme 的 [iFi Purifier2](http://www.pcdvd.com.tw/showthread.php?t=1100783) 開箱文後，我就在想能不能弄一個窮人版的。

今天的主角， axpro USB 2.0 Hub。

![axpro USB 2.0 Hub](http://i.imgur.com/MtYpPKn.jpg)

構造非常簡單，一個約150元。原本帶筆電出差旅遊時，就帶著這個迷你 hub 。今天就請他為了數位音響界獻身。

扒開驗身。主晶片是 湯銘科技 (Terminus)
[FE 1.1s USB 2.0 High Speed 4-Port Hub Controller Single Transaction Translator](http://terminus-tech.com/Chinese/products.html)。不是工業級的 FE 1.1 MTT 晶片。不過我只在這個 Hub 上接一個設備。我想單通道、多通道差別不大。

![axpro USB Hub 內部圖](http://i.imgur.com/soIqNft.jpg)

我挑這個 Hub 來動手，主因是看他線路簡單，方便加工。例如 DIY 高手可以拔掉上頭的 USB 母座，把線直接焊在上頭。加個 LDO 穩壓，灌膠，再套個鐵製外盒。

其他配角皆以我手上現有的為準，只有一樣是訂製的。

* 佳翼 PCI-E USB 3.0 擴充卡，NEC 720202 晶片。
  我的電腦主機板沒有 USB 3.0 埠，所以就插了這片擴充卡。沒屋頂價 300 元。
* ProBest USB 3.0 A公A母延長線，1M。
  接在我的 PCI-e USB 3.0 擴充卡上的延長線。今天拿來測試。估價 150~180元。
* Nokia 手機附贈 USB 充電器，5V/1A。
  估價 200 元。
* 忘記買什麼東西附贈的 USB 轉 DC 5.5/2.1 電源線。
  電子材料行找一找，應該不到100元。
* 唯一特地到沒屋頂找 audioreality 訂製的 USB 訊號電源分離線 (OFC6)。
  一條 380 元。

![裝檢照](http://i.imgur.com/M68h4zi.jpg)

各部組合。市價約1300元。

![合體照](http://i.imgur.com/gXxMiJA.jpg)


PK 對象， ASEN USB 2.0 工業線 A公B公，1M。我原本是用這條接我的 DAC 。

![ASEN USB 2.0 工業線](http://i.imgur.com/7n8DKiv.jpg)

我這個組合有四個目的:

* 透過 Hub 晶片重整 USB 訊號。
* 確保最短路徑，所以從 Hub 到 DAC 這段用超短線。
* 確保 USB 訊號和電源分離，而 USB DAC 這一頭只吃穩定的外部電源。
* 最重要的一點，低成本。

順便說明一下我的 DAC (TEAC UD-H01) 的特性。他雖然是獨立電源的 DAC ，但是他的 *USB 接收晶片模組必須從外部供 5V 電驅動*。正常情形下，用 USB 線連接電腦和 DAC 後，就會從 USB 線得到電腦端送來的 5V 電驅動 USB 接收晶片模組，然後 Windows 才會抓到這台 DAC 。換句話說，如果把 USB 線的 5V 端子短路，這台 DAC 的 USB 模組就不會動作。

當然啦，我們知道電腦送來的 5V 電品質不好，所以 USB DAC 的玩家無所不用其極地想砍斷這條線，改用更穩定的電源去驅動 DAC 內的 USB 接收晶片模組。而我拿三用電錶量過 audioreality 這條線， USB 線的 5V 確定斷路。 5V 電只會從 DC 座通入。所以我用這條線連接 Hub 和 DAC ，可以保證 DAC 不吃電腦或 Hub 電，只吃外部獨立電源(在此我用 USB 充電器) 從 DC 端口送入的電。

順便一提， *USB Hub 上的晶片是主動式元件，他也要 5V 電才會動* 。這又是一個坑。我的案例中， Hub 會吃 PCI-E 擴充卡送來的 5V 電。而擴充卡的電則接自電腦電源供應器 12V 電源，而不是主機板送來的電。

測試音樂:

* 高雄國際音響大展 2015 年CD: Skoda - Schubert Impromptu No.3
* 高雄國際音響大展 2006 年CD: Floweryard - Spring
* 高雄國際音響大展 2008 年CD: 藏密 - 儀式 Rites
* 高雄國際音響大展 2013 年CD: 吳睿然 - 單簧管小夜曲 原鄉映像。

硬體:

* DAC: TEAC UD-H01
* 擴大機: Sansui AU-777D
* 喇叭: 雅瑟 CP-730

接法:

* A組: PCI-E USB 3.0 擴充卡 -> ASEN USB 線 -> DAC 。

* B組: PCI-E USB 3.0 擴充卡 -> ProBest USB 3.0 延長線 -> USB Hub -> USB 電源分離線 / 外接電源 -> DAC 。

為消減變數，使用同一個 PCI-E USB 3.0 擴充卡的埠。

嗯，上機試聽。拔線、換線、試聽，重覆。十分鐘後...

結論: 在我的系統上，無顯著差異。好吧，我的系統不夠高檔。我的連接配置就列在上頭，要複製測試不難。還請各路同好指教。

如果我的想法無誤，那麼 USB DAC 設計時，應該在 USB 接收模組上，再加一個 Hub 晶片。而這個模組上的 Hub 晶片和訊號接收晶片則直接從 DAC 內的線性電源各拉一條 5V 電過來用。接收模組的 USB 母座上的 5V 端子線路則要切斷。

==============
我這兩天又測試了另一片 USB Hub 。即 7 樓照片的那片 Hub。
用的是創惟 GL850G 晶片加上鐵皮的石英晶振。
和我一開始用的 FE1.1s 晶片加上圓管晶振 Hub 比較。

借用 http://www.pcdvd.com.tw/showthread.php?t=1069209 的 USB HUB 晶片比較圖。

Hub 晶片FE1.1s:
* STT
* LDO 內建，溫度低
* 可延伸到 7 port (伽利略有一款 7 port 帶變壓器的 2.0 Hub，內部就是用兩顆 FE1.1s併成)
* 相容性極佳
* 線長: 1.5M正常，5M正常
Hub 使用誤差最大的圓管晶振。

Hub 晶片GL850G:
* STT
* LDO 內建，溫度高
* 無延伸性
* 相容性普通
* 線長: 1.5M正常，5M不工作
Hub 使用一般鐵皮晶振。

在我的連接方案中，線長只有 1M ，不需要接多個設備，這兩個晶片規格上的主要差別就是內建的 LDO 溫度了。
創惟 GL850G 工作溫度較高，但手摸上去只是微溫程度。 FE1.1s 那顆摸上去同室溫。

就規格來說 FE1.1s 優於 GL850G 。但我分別接上這兩片 Hub 試聽之後，則是 GL850G + 鐵皮晶振的那片，控制力較佳。
顯然那顆晶振準確度的重要性更大於 Hub 晶片的規格。
