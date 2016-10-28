---
title: 讓網頁在 Twitter 推文時顯示圖片 - 在 github pages 中加上 Twitter Cards 與 Open Graph 標籤
category: computer
tags: [twitter,open graph,github pages,jekyll,blog]
cover: http://i.imgur.com/Rj0CL90.png
---

我最近轉推網頁文章時，注意到同樣只放上文字和連結的推文，有些來源的網頁在我沒有附上圖片的情況下，依然會在推文中顯示網頁中的圖片。而且這類型的推文愈來愈多。這種推文的效果很好，我也想在我的部落格 (使用 github pages) 中加上這種效果。

### 概觀

首先看下圖。圖中是兩篇同樣只放上文字和網頁連結的推文，但呈現效果卻不相同。

![有無圖片效果的兩則推文](http://i.imgur.com/96P0rzr.png)

下方的推文只有文字內容。但上方的推文主動地顯示了該網頁中的圖片縮圖與摘要文字。看起來，上方推文的閱讀效果較佳。

<!--more-->

查看資料後，我得知這種效果稱為「[Twitter Cards](https://dev.twitter.com/cards/overview)」，是 Twitter 擬訂的一種網頁資訊標籤規範。只要在網頁中添加指定的 meta 標籤， Twitter 就會在含有該網頁連結的推文中，顯示更多關於文章內容的資訊，如文中的圖片與摘要。最重要的一點，這些由 Twitter 主動呈現的網頁資訊，並不算入推文字數。因此可以在推文中表達更多資訊。

此外，由於具這類資訊分享功能的社交服務網站愈來愈多，而每個服務提供者都希望提供這類呈現效果，也就順勢產生了「[Open Graph 協定](http://ogp.me/)」。 Open Graph 協定規範了可在社交服務網站中通用的網頁資訊標籤 (metadata)。Facebook, Twitter 等皆同樣認可這些標籤，故可依此在分享文章時，主動顯示文中的圖片。

由於 Twitter Cards 和 Open Graph 協定部份內容互通，所以我就在我的部落格中，混用這兩種標籤，實現 Twitter Cards 效果。

### Twitter Cards

Twitter Cards 提供多種呈現效果。我需要在推文中顯示一張代表網頁文章內容的大圖，這種呈現效果屬於 Twitter Cards 中的「[Summary Card with Large Image](https://dev.twitter.com/cards/types/summary-large-image)」。按照 Twitter 文件，於下列出此效果必要的網頁資訊標籤:

* <dfn>twitter:card</dfn>: 指示 Twitter Cards 型態。「Summary Card with Large Image」型態請寫 <dfn>summary_large_image</dfn>。
* <dfn>twitter:site</dfn>: 網頁所在的網站名稱。注意，這裡不是寫 URL 網址，而是代表這個網站的 twitter 帳號。以我為例，「石頭閒語」這個網站是我的個人部落格，因此我個人的 twitter 帳號就可以代表這個網站。
* <dfn>twitter:creator</dfn>: 這不是必要欄位。這個欄位應填網頁作者的 twitter 帳號。但我這是個人部落格，網站的 twitter 帳號就可以代表作者，故不需要這個欄位。如果是有多名作者的內容網站，才需要此欄位。
* <dfn>twitter:title</dfn>: 文章標題。文章標題不一定就是網頁標題。以我為例，我的網頁標題是設定文章標題之後附加網站名稱「石頭閒語」。但這個欄位要填的文章標題則不需要網站名稱。
* <dfn>twitter:description</dfn>: 網頁內容摘要。
* <dfn>twitter:image</dfn>: 要在 Card 中呈現的圖片。請寫完整的圖片網址。

Twitter Cards 要求的表達方式是欄位名稱要用 <dfn>meta</dfn> 標籤的 <dfn>name</dfn> 屬性；而欄位內容要用 <dfn>meta</dfn> 標籤的 <dfn>content</dfn> 屬性。注意這個細節，因為接下來提到得 Open Graph 所用的屬性不一樣。

### Open Graph

在 Open Graph 協定中，也規範了和 Twitter Cards 用途相同的資訊標籤，如下所列:

* <dfn>og:title</dfn>: 等於 <dfn>twitter:title</dfn> 。
* <dfn>og:description</dfn>: 等於 <dfn>twitter:description</dfn> 。
* <dfn>og:image</dfn>: 等於 <dfn>twitter:image</dfn> 。

另外，在我的實作中還用了下列資訊標籤:

* <dfn>og:site_name</dfn>: 網站名稱。這裡寫一般的文字內容，不像 <dfn>twitter:site</dfn> 填 twitter 帳號。
* <dfn>og:url</dfn>: 網頁的 URL 連結。

注意， Open Graph 協定要求的表達方式是欄位名稱要用 <dfn>meta</dfn> 標籤的 <dfn>property</dfn> 屬性，而不是 <dfn>name</dfn>。這個小細節搞錯的話，社交服務提供者就不能正確分析網頁中的 Open Graph 標籤。

根據「[Twitter Cards and Open Graph](https://dev.twitter.com/cards/getting-started#opengraph)」中的說明，等效的標籤可以擇一使用，而不必兩者都列出。這樣才不會在網頁的 meta 資訊中出現一大堆重複的內容。就泛用性而言，我當然建議可用 Open Graph 標籤就用，這樣連其他社交服務的文章分享功能也受用。不通用的內容才用 Twitter Cards 標籤。

以我的部落格文章為例，整合兩者的標籤內容後，具體範例如下:

{% highlight html %}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@tw_rocksaying">
<meta property="og:site_name" content="石頭閒語">
<meta property="og:title" content="文章標題">
<meta property="og:image" content="http://i.imgur.com/Rj0CL90.png">
<meta property="og:description" content="摘要，bala bala.">
{% endhighlight %}

### Jekyll

了解我需要的 Twitter Cards 和 Open Graph 協定標籤後，接著就要把它應用於我的部落格。我的部落格架設在 github pages ，其網頁模版系統是 jekyll 3 。依 jekyll 的規劃，我需要做兩件事。

第一件事，在我編寫 jekyll 的網頁時，得在 Front Matter 加上額外的自訂欄位，補足 Twitter Cards 需要的資訊。

我比較之後，發現 <dfn>summary_large_image</dfn> 這個 Card 需要的資訊中，只缺了 image 這一項。所以我決定在 Front Matter 中自訂一個 <dfn>cover</dfn> 欄位，用以表示此文章的 Card 圖片網址。如下所示:

{% highlight text %}
---
title: 讓網頁在 Twitter 推文時顯示圖片 - 在 github pages 中加上 Twitter Cards 與 Open Graph 標籤
category: computer
tags: [twitter,open graph,github pages,jekyll]
cover: http://i.imgur.com/Rj0CL90.png
---
{% endhighlight %}

第二件事，就是在 jekyll 網頁文章模版中，加上需要的 meta 標籤。

把前段具體範例中的 content 屬性內容，換成 jekyll 對應變數即可。在網頁模版的標頭區塊(head)，加入下列內容:

{% highlight html %}
{% raw %}
{% if page.cover %}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@{{ site.author.twitter }}">
<meta property="og:site_name" content="{{ site.name }}">
<meta property="og:title" content="{{ page.title }}">
<meta property="og:url" content="http://{{ site.url }}{{ site.baseurl }}{{ page.url }}">
<meta property="og:image" content="{{ page.cover }}">
<meta property="og:description" content="{{ page.excerpt | strip_html | strip_newlines }}">
{% endif %}
{% endraw %}
{% endhighlight %}

<var>site.author.twitter</var> 是我在 jekyll 的網站組態資料 (_config.yml) 設定的網站變數，代表我的推特帳號。<var>page.cover</var> 則是我在 Front Matter 自訂的網頁變數，代表 Twitter Card 的圖片網址。其他的變數則是 jekyll 預設的變數內容，不解釋。

加入上述內容後，我又挑了幾篇文章加上 cover 欄位。把這些變動內容提交到我的 github pages 。再打開 [Twitter Card 驗證器](https://cards-dev.twitter.com/validator) ，輸入其中一個補上 cover 欄位的網頁文章，驗證效果。其驗證結果如下圖:

![驗證含有 Twitter Cards 標籤的網頁效果](http://i.imgur.com/Rj0CL90.png)

驗證成功。以後我的部落格文章，只要設定了 cover 圖片，就可以在 Twitter 推文中呈現醒目的圖片。另外，因為我用了 Open Graph 標籤，所以在 Facebook 等社交網站上被分享時，也將有類似的呈現效果。

最後要提醒一件事。請慎選用在 Twitter Cards 的圖片。毫無重點的圖片，反而破壞 twitter 的簡潔感。

#### 相關文件

###### 原始文件

* [Front Matter 加上 cover 欄位的文章](https://raw.githubusercontent.com/rocksaying/rocksaying.github.io/master/_posts/2016-02-03-Sansui_AU-X901.md)。
* [模版文件](https://github.com/rocksaying/rocksaying.github.io/blob/master/_includes/meta.html)。

###### 參考資訊

* [Twitter Cards](https://dev.twitter.com/cards/overview)
* [Open Graph 協定](http://ogp.me/)
* [Facebook Open Graph, Google+ and Twitter Card Tags](https://wordpress.org/plugins/wonderm00ns-simple-facebook-open-graph-tags/)
