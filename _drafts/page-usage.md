---
title: draft sample
category: events
tags: [github, markdown, css]
---

必要檔頭:

* title
* category
* tags

選用性檔頭:

* lastupdated: yyyy-mm-dd
* comment
* cover: IMAGE_URL

comment:

預設不添加 comment 區。欲在文章後顯示 comment 區塊，應加上 comment head 並指示型態。

comment 型態有三種，不同型態使用的回應串也不同。

* shared
* single
* 主題

*shared* 為全站共用回應串，沒有特定主旨。

*single* 為單一文章專屬回應串。只有在這篇文章的回應區使用這個回應串。

如果不是 *shared* 或 *single* 這兩個關鍵字，就將 comment head 的值視為回應串的主題。
相同回應主題的文章會共用同一個回應串。


[Markdown](http://daringfireball.net/projects/markdown/syntax).

分離 <span>&lt;\-\-more\-\-&gt;</span>

<!--more-->

## title 2

block-level HTML elements — e.g. \<div\>, \<table\>, \<pre\>, \<p\>, etc. — must be separated from surrounding content by blank lines, and the start and end tags of the block should not be indented with tabs or spaces.

Span-level HTML tags — e.g. \<span\>, \<cite\>, or \<del\> — can be used anywhere in a Markdown paragraph.

要產生水平分割線，可以在單獨一行輸入3個或以上的短橫線、星號或者底線。短橫線和星號之間可以輸入任意空格。


ul list. *, +, or -.

* <em>em</em>. \*emphasis\*, \_emphasis\_ or wrapped with \<em\> tag.
* <dfn>dfn</dfn>. wrapped with \<dfn\> tag. (為了方便輸入，我的 CSS 將 em 視同 dfn)
* <strong>strong</strong>.  \*\*strong\*\*, \_\_strong\_\_ or wrapped with \<strong\> tag.
* <var>$var</var>. wrapped with \<var\> tag.
* <kbd>kbd</kbd>. wrapped with \<kbd\> tag.
* <code>code</code>. \`inline code\` or wrapped with \<code\> tag.
* <del>del</del>. wrapped with \<del\> tag.
* <q>inline quote</q>. wrapped with \<q\> tag.

ol list. started using any number like `1.`, `2.`.

1. <cite>cite</cite>, book or title name. wrapped with \<cite\> tag.
2. <span class="person">span .person</span>, person name. wrapped with \<span class="person"\> tag.

It looks nice if you indent every line of the subsequent paragraphs, but here again, Markdown will allow you to be lazy:

<pre>
*   This is a list item with two paragraphs.

    This is the second paragraph in the list item. You're
only required to indent the first line.

*   Another item in the same list.

</pre>

To put a code block within a list item, the code block needs to be indented twice — 8 spaces or two tabs:

<pre>
*   A list item with a code block:

        ` code goes here `
</pre>

##### title 5

link and image.

link CSS <a href="http://www.google.com/">external link</a> link, <a href="http://rocksaying.tw/">internal link</a>, <a href="/archives/234">internal link</a> link.

This is \[an example\](http://example.com/ "Title") inline link. \[This link\](http://example.net/) has no title attribute. Or wrapped with \<a\> tag.

In jekylle, using &lcub;% post_url post_file_name %&rcub; to get link.

Markdown supports a shortcut style for creating “automatic” links for URLs and email addresses: simply surround the URL or email address with angle brackets.

Reference-style links use a second set of square brackets, inside which you place a label of your choosing to identify the link:

This is \[an example\]\[id\] reference-style link.

Then, anywhere in the document, you define your link label like this, on a line by itself:

\[id\]: http://example.com/  "Optional Title Here"

This is \!\[image title\](imageurl). Or wrapped with \<img\> tag.

image 1:

![image title](/assets/images/library.jpg)

image 2:

![small image](/assets/images/Debian8_language.png)

###### title 6

code blocks and highlight.

<pre>
&lcub;&percnt; highlight lexer linenos=table &percnt;&rcub;
code
&lcub;&percnt; endhighlight &percnt;&rcub;
</pre>

{% highlight php linenos=table %}
<?php
echo "Hello $name\n";
echo "Hello $name\n";
echo "Hello $name\n";
echo "Hello $name\n";
echo "Hello $name\n";
echo "Hello $name\n";
echo "Hello $name\n";
echo "Hello $name\n";
echo "Hello $name\n";
?>
{% endhighlight %}

highitlight no linenos

{% highlight php %}
<?php
echo "Hello $name\n";
?>
{% endhighlight %}

This is `online code`. &#96;inline code&#96; or wrapped with \<code\> tag.

simple code block wrapped with &#96;&#96;&#96;. append lexer name in the first &#96;&#96;&#96;:

<pre>
```lexer
code
```
</pre>

lexer text for plain text. CSS:

<pre>
```text
plain text
```
</pre>

```text
plain text
  plain text
   plain text

```

lexer term for terminal, console window. CSS:

~~~term
$ ls
$ ps ax |grep abc > cc

~~~

Raw data

<pre>
&lcub;% raw %&rcub;
Raw data. Also escape cub characters
{{ page.title }}
&lcub;% endraw %&rcub;
</pre>

blockquote

Markdown uses email-style \> characters for blockquoting. It looks best if you hard wrap the text and put a \> before every line.

Blockquotes can be nested (i.e. a blockquote-in-a-blockquote) by adding additional levels of \>.

<pre>
&gt; blockquote
&gt; &lt;cite&gt;cite&lt;/cite&gt;
</pre>

CSS:

> blockquote
> <cite>cite</cite>

This is <q>short quote</q>, wrapped with \<q\> tag.

Note div. wrapped with \<div class="note"\> tag. CSS:

<div class="note">
div class note.
</div>

text. text. text. text. text. text. text. text. text.
inline note (<span class="note">span class=note</span>) inline note.
中文。 中文(<span class="note">側註</span>)。 中文。
text. text. text. text. text. text. text. text. text.
中文。 中文。 中文。
