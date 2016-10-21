---
title: sed 編輯器範例集
category: programming
tags: [linux,sed]
lastupdated: 2016-10-21
---

我個人用過的 sed 編輯器操作案例與筆記。

* [sed - Wikipedia](https://en.wikipedia.org/wiki/Sed)
* [sed, a stream editor](https://www.gnu.org/software/sed/manual/sed.html)
* [阿旺的 Linux 開竅手冊 - sed & awk](http://wanggen.myweb.hinet.net/ach3/ach3.html)

<!--more-->

#### 從含有編號的單行文件中取出編號

某工具包含一份文件 Revision.txt 。此文件只有一行內容，描述此工具的細部版本編號。內容如下:

```text
Product Revision: 123456
```

我的自動化工具在操作此工具時，需要記錄這個版本編號，但不要額外的文字。我用 sed 的作法是將非數字的文字全部刪除(替換為無內容)，如此就只會留下版本編號的內容:

```term
sed 's/[^0-9]//g' Revision.txt
```

* s 替換操作。
* [0-9] 表示數字樣式。加上 ^ 便表示非數字樣式。
* g 套用於全部符合樣式的內容。

