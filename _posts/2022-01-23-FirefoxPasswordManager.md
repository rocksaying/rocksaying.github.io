---
title: 使用 Firefox 瀏覽器內附的密碼管理員記錄你的每個帳號密碼
category: computer
tags: [firefox,password,security]
lastupdated: 2022-01-23
cover: https://rocksaying.github.io/images/2022-01-23-FirefoxPasswordManager/1.png
---

不要再用便條紙記帳號和密碼。你應該使用密碼管理工具。例如：

* [KeePass](https://keepass.info/) - 我用這個 KeePass2 離線版。
* [KeePassXC](https://keepassxc.org/) - KeePass 的分支。
* [1Password](https://1password.com/)
* [Bitwarden](https://bitwarden.com/)
* [Firefox 瀏覽器](https://www.mozilla.org/) - 內附密碼管理功能。

Firefox 瀏覽器並不是最好用的密碼管理工具，但至少好過完全不用。

Google 也有密碼管理服務，整合在 Android 手機和 Chrome 瀏覽器的自動填入項目。
只是不提供手動新增登入資訊的按鈕，故本文不列入。

<!--more-->

在設定登入系統的密碼時，各系統設計者通常會提示你要輸入「無意義的字母組合、大小寫和數字混合」，而且要定期更換。
但實際狀況是沒有人能用腦袋記住那麼多組帳號和密碼。所以久而久之，大家就會偷懶：

* 每個網站或資訊系統，都用同一個密碼。
* 把密碼抄在便條紙上。
* [密碼設ji32k7au4a83！外國人傻眼：亂數還一堆人用。台灣人一看秒懂](https://www.ettoday.net/news/20200123/1618294.htm)

*千萬別再這麼做。你應該使用密碼管理工具。*

Firefox 瀏覽器的使用者，可以用 Firefox 內附的密碼管理功能。
Firefox 也可將你的登入資訊保存在雲端。

使用 Firefox 瀏覽器開啟網站時，遇到要送出密碼的場合，瀏覽器就會問你要不要儲存密碼。
自動填入是最基本的登入資訊儲存方式。

但若你要儲存的登入資訊不是網站時，你就要手動新增。
我用電腦版的 Firefox 瀏覽器介面說明如何手動新增登入資訊。

點擊 Firefox 瀏覽器右上角的三槓(漢堡)圖示，開啟應用程式選單。
選擇程式選單的「密碼」項目，就會看到密碼管理頁面。

密碼管理頁面左側會列出目前儲存的登入資訊，你可以手動編輯已有項目的帳號或密碼，也可以刪除。

新增項目請點擊密碼管理頁面左下角的「新增登入資訊」。

![開啟程式選單->密碼](https://rocksaying.github.io/images/2022-01-23-FirefoxPasswordManager/1.png)

新增登入資訊的畫面只有三個欄位要填。網址、名稱和密碼。

網址欄不一定要填網址。你可以輸入任意文字內容。

密碼欄位預設是只顯示小圓點取代你輸入的文字內容。
如果你要輸入已有的密碼但怕打錯字的話，可以按旁邊的小眼睛圖示，改成顯示實際文字。

最後記得按「儲存」。

![手動新增登入資訊](https://rocksaying.github.io/images/2022-01-23-FirefoxPasswordManager/2.png)

當你日後要登入其他資訊系統時，就先打開 Firefox 瀏覽器的密碼管理頁面。
從左側的項目中，打開目標資訊系統的登入資訊。
就會顯示你之前儲存的該系統的名稱和密碼。

按下欄位旁邊的「複製」按鈕，再切換到目標資訊系統視窗的密碼欄位，貼下即可。

我一般會手動輸入帳號名稱，而輸入密碼時用複製／貼上的方式。

![複製名稱或密碼](https://rocksaying.github.io/images/2022-01-23-FirefoxPasswordManager/3.png)

你的公司電腦可能不允許自行安裝 Firefox 應用程式，這時就可用私人手機來記。

啟用「同步」功能，勾選「登入資訊與密碼」，Firefox 就會將你的登入資訊保存在雲端，讓你可以在電腦、手機或平板上同步使用。

![同步登入資訊](https://rocksaying.github.io/images/2022-01-23-FirefoxPasswordManager/4.png)

打開你的手機的 Firefox APP ，從「設定->登入資訊與密碼->儲存的登入資訊」找到儲存的登入資訊項目。
再按小眼睛顯示密碼內容。然後看著手機的內容，在公司電腦上輸入。

從資訊安全的角度來說，密碼並不是最安全的方式。
目前鼓勵用[雙重認證](https://zh.wikipedia.org/wiki/%E5%A4%9A%E9%87%8D%E8%A6%81%E7%B4%A0%E9%A9%97%E8%AD%89#%E9%9B%99%E9%87%8D%E8%AA%8D%E8%AD%89)、生物特徵辨識取代密碼。
但不可否認密碼仍然是目前最普遍的認證方式。
在雙重認證機制完全取代密碼之前，請使用密碼管理工具記錄你的帳號和密碼。
