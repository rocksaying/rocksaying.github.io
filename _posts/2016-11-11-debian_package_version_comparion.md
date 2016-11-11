---
title: Debian 套件版本新舊比較工具
category: computer
tags: [linux,debian]
lastupdated: 2016-11-11
---

我任職的公司使用 Debian 套件格式管理自行開發的各類軟體，也會將一些第三方的軟體打包為 debian 套件。套件維護者有時候會需要調整版本的描述方式，夾綴一些如 rev, update, fix 之類的字眼，以便使用者更容易理解套件的版本意義。但套件維護者在調整版本文字時，有時會搞錯版本文字所代表的新舊順序。例如 "1.0.0rev1" 和 "1.0.0-1" 何者代表的版本較新？

套件維護者需要一些工具幫助他決定如何調整版本文字的內容。本文介紹兩種比較版本文字新舊意義的方式。分別使用 *dpkg* 命令列工具與 python 的 *apt_pkg* 庫。

<!--more-->

#### dpkg

使用命令列工具 *dpkg* ，選項 `--compare-versions` 。範例如下:

```term
$ dpkg --compare-versions 1.0.0-1 gt 1.0.0-svn1
$ echo $?
1
```

上述操作的意義是比較版本文字 "1.0.0-1" 是否大於 (gt) "1.0.0-svn1"。「大於」為版本較新之意。執行結果則要按 unix 工具慣列，查看命令返迴值 <var>$?</var> 的內容。若返回值為 0 ，表示 "1.0.0-1" 大於 "1.0.0-svn1" 。

在本例中，其值為 1 ，故版本文字 "1.0.0-1" 所代表的版本不大於 "1.0.0-svn1" ，後者所代表的版本較新。

下列操作則反過來比較前者是否小於 (lt) 後者。故返回值為 0 。

```term
$ dpkg --compare-versions 1.0.0-1 lt 1.0.0-svn1
$ echo $?
0
```

<div class="note">
gt 是 greater than 的縮寫。 lt 是 lesser than 的縮寫。
</div>

Debian 管理工具參考此線上書籍: [The Debian Administrator's Handbook](https://debian-handbook.info/browse/stable/sect.manipulating-packages-with-dpkg.html)。

#### python apt_pkg

使用 Python 語言庫 apt_pkg 中的函數 `version_compare()` 。

範例:

```python
import apt_pkg
apt_pkg.init_system()

a = '1.0.0-1'
b = '1.0.0-svn1'

vc = apt_pkg.version_compare(a, b)

if vc > 0:
    print 'version %s newer than version %s' % (a, b)
elif vc == 0:
    print 'version %s == version %s' % (a, b)
elif vc < 0:
    print 'version %s older than version %s' % (a, b)

```

#### 版本文字使用建議

當我們需要打包第三方軟體為 debian 套件時，按「Debian Policy Manual - [5.6.12 Version](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Version)」說明，應將版本文字區隔為前後兩段。前段表示第三方軟體的版本號碼 (upstream version)，後段表示我們打包時的版序 (debian revision)。

前後版的表示方式是用一個 <strong>-</strong> (hyphen) 區隔，如下:

```text
1.0.0-rev53
1.16-1+deb8u
2.0.0-20150115
2.0.0-20150115svn53
```

以上皆為合理的表示方式。打包版序 (debian revision) 的表達方式由維護者的使用慣例決定。
