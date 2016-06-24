---
title: KDE - 關閉 baloo, nepomuk 與 akonadi
category: computer
tags: [kde,debian]
---

KDE 桌面環境提供了一整套<em>非常智能</em>的檔案索引與搜尋系統，由 nepomuk, akonadi, baloo 等套件組成。但是它太肥大了。有些人並不怎麼喜歡這套系統，也從來用不上它。

以我個人為例，我安裝 Debian 8 時，幾乎沒裝過完整的 nepomuk, akonadi, baloo 。但也從來沒發覺 KDE 使用上有何不便。本文將說明如何移除與關閉這一整套智能索引與搜尋系統。

<!--more-->

開頭就要說一件很遺憾的事。 KDE 桌面環境套件對這套索引與搜尋系統設定了強烈相依性，有些核心套件不能移除。所以使用者仍然必須手動關閉一些設定項目。

### 關閉 Baloo

首先關閉和桌面環境相依性較低的 baloo 。這組軟體套件可以完全地移除。

移除套件: baloo4 baloo-utils kde-config-baloo-advanced 。

關閉 baloo 最主要的影響是在 Dolphin (KDE 的檔案管理員)。當你在 Dolphin 中按下 Ctrl+F 叫出搜尋欄並輸入想要搜尋的關鍵字時，你會得到 "invalid protocol" 的錯誤訊息。因為這個搜尋功能需要 baloo 。

但是，如果你只是想要在 Dolphin 中快速地根據檔名找出目前資料夾中的檔案，那麼最快的方法其實是用 Filter (Ctrl+I)。用搜尋功能反而不夠快。

注意，如果你真的想要使用 baloo ，它會依賴一整套 Akonadi 服務，並要求你啟用 <dfn>Akonadi Baloo Indexing Agent subsystem</dfn> 。

參考 [https://community.kde.org/Baloo/Configuration](https://community.kde.org/Baloo/Configuration) 。

### 關閉 Nepomuk server

KDE 桌面環境套件要求安裝 nepomuk-core-data 套件，你無法移除它。但是你可以移除 nepomuk-core-runtime 套件。

只要移除了 nepomuk-core-runtime 就不會有任何 nepomuk 相關的可執行檔案，也就不會啟動任何 nepomuk 服務。

### 關閉 Akonadi

KDE 桌面環境套件要求安裝 akonadi-server 和 kdepim-runtime 套件，所以你無法移除 Aknoadi 套件和服務，只能從系統組態設置著手。

首先透過開始功能表的「系統設定 -> 個人資訊」(System Settings -> Personal Information)。移除每一個 akonadi 子系統。但光是這樣還不夠，因為每次啟動桌面時， Aknoadi 主服務還是會強制載入一些子系統。所以我們必須連主服務也關閉。

接著以文字編譯器開啟 <em>~/.config/akonadi/akonadiserverrc</em> ，找尋 *QMYSQL* 區塊，並修改 *StartServer* 的內容為 <dfn>false</dfn> 。要求主服務不要啟動。

```
[QMYSQL]
Name=akonadi
.
.
.
StartServer=false
```

參考:

* [Akonadi](https://userbase.kde.org/Akonadi/zh-tw)
* [Improve KDE4 performance: Disable Nepomuk and Akonadi](http://pclinuxos2007.blogspot.tw/2013/01/improve-kde4-performance-disable.html)

###### 相關文章

* [Debian 8 (jessie) 安裝筆記 基礎篇]({{ site.baseurl }}/archives/31064659.html)
* [Debian 8 (jessie) 安裝筆記 中文環境篇]({{ site.baseurl }}/archives/31556973.html)
