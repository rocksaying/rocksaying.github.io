---
title: 使用 OpenSSL 從 PFX 憑證文件匯出 PEM 憑證與金鑰
category: computer
tags: [openssl,tls,ssl,secure]
lastupdated: 2019-01-28
---

本文說明如何使用 OpenSSL 從 PFX 憑證文件匯出 PEM 格式的憑證與金鑰。

透過 SSL 協定建立瀏覽器和網站伺服器之間的安全通道時，必須使用符合 PKCS 標準的憑證文件。而 PKCS 訂立了多種憑證格式，常見的有 X.509 DER, X.509 PEM (Base64), PKCS#12 PFX 三種。這三種格式可以互相轉換。

雖然文件格式可以互相轉換，但大多數應用 SSL 加密通信資料的服務軟體，本身往往只支援其中一種格式。例如微軟 IIS 採用 PFX 格式，而 Apache HTTP Server 與 Nginx 則採用 PEM 格式。一般而言，非開放源碼的服務軟體多採用 PFX 格式；使用 OpenSSL 函數庫的開放源碼的服務軟體選擇 PEM 格式。當你要安裝的服務軟體採用的憑證文件格式與你手上現有的憑證不同時，你可以用 OpenSSL 工具自行轉換。

<!--more-->

### 文件格式辨別

常見的憑證安裝文件缺少如何辨識文件種類的說明。我先說明這一部份。

憑證發行機構(CA)發出的 PFX 憑證文件，通常將根憑證/中繼憑證、網站憑證(certificate)和網站金鑰(網站私鑰)集合在一起。所以採用 PFX 格式的服務軟體，設置時只需要指定一個 PFX 文件。然而採用 PEM 格式的服務軟體，則偏好將根憑證/中繼憑證、網站憑證和網站私鑰分別存放。都是 PEM 格式，但用途卻不同。

在金鑰機制中，網站憑證其實是資料加密用的公鑰；而網站金鑰指的是資料解密用的私鑰。看文件內容的關鍵字，可分辨 PEM 文件的用途。

PEM 格式的憑證文件，其內容必定有一行 <code>-----BEGIN CERTIFICATE-----</code> 。而 PEM 格式的私鑰文件，內容必有一行 <code>-----BEGIN PRIVATE KEY-----</code> 。雖然 PEM 格式的文件也允許同時含有憑證和私鑰，但很少這麼用。

當你拿到一個副檔名為 *.PEM* 的文件時，我建議打開看文件內容，先根據前述說明辨別此文件是憑證文件或網站私鑰。辨明文件內容後，按下列慣例修改副檔名:

- 這是一份憑證文件，則副檔名應為 *.crt* 或 *.cer* 。
- 這是一份網站私鑰，則副檔名應為 *.key* 。主檔名則用網域名稱。

你也可以用 openssl 指令確認文件內容。此法同時適用 DER 和 PEM 兩種格式。

查看憑證文件內容:

~~~term
$ openssl x509 -in xyz.der -nocert -text
~~~

若上述指令顯示錯誤訊息 <strong>unable to load certificate</strong> ，這份文件就不是憑證文件。再用下一個指令確認是否為網站私鑰:

~~~term
$ openssl pkey -in xyz.der

-----BEGIN PRIVATE KEY-----
.
.
~~~

中繼憑證和網站憑證則都是公鑰，差別在於中繼憑證是代表憑證發行機構的公鑰，而網站憑證則代表你的網站的公鑰。瀏覽器用中繼憑證公鑰檢查你的網站憑證是否真的經過這家公證機構認證。

辨別中繼憑證和網站憑證的方式則是看文件內容 <code>subject=</code> 的敘述。若敘述是憑證發行機構的組織名稱，就是中繼憑證或根憑證。若文字敘述是你的網站域名，那就是網站憑證了。一般會進一步用主檔名去對應用途。

- 根憑證/中繼憑證的檔名，通常為 CA.crt 、 RootCA.crt 或含有 CA 字眼的名稱。
- 網站憑證的主檔名通常就是此憑證代表的網域名稱。例如 rocksaying.tw.crt 。

前段查看憑證文件內容的 openssl 指令，也會顯示 <code>Subject</code> 內容。或者把 <code>-text</code> 改成 <code>-subject</code> 僅查看 Subject 內容。

~~~term
$ openssl x509 -in xyz.der -nocert -subject
~~~

### 匯出憑證與金鑰

從 PKCS#12 PFX 格式文件匯出 PEM 格式的根憑證/中繼憑證 (output CA certificates):

~~~term
$ openssl pkcs12 -in xyz.pfx -nokeys -cacerts -nodes \
  -password pass: -out CA.crt

~~~

此指令讀入 xyz.pfx ，並將匯出的根憑證或中繼憑證存檔為 CA.crt 。檔名按上段說明的慣例命名。

我示範使用的 PFX 憑證是由 [Let's Encrypt](https://letsencrypt.org/) 發行的。它發行的憑證不加密碼，故 pass 後留白。若你拿到的 PFX 憑證需要密碼，則 <code>pass:</code> 後要接密碼。或者把 <code>-password pass:</code> 刪掉，執行時會要求你輸入密碼。

從 PFX 格式文件匯出 PEM 格式的網站憑證 (output client certificates):

~~~term
$ openssl pkcs12 -in xzy.pfx -nokeys -clcerts -nodes \
  -out my.domain.name.crt

~~~

此指令將讀入 xyz.pfx ，並將匯出的網站憑證存檔為 my.domain.name.crt 。檔名按上段說明的慣例命名。

對憑證發行機構(CA)來說，你是它的客戶(client)。所以你的網站憑證被視為 client certificates 。

從 PFX 格式文件匯出 PEM 格式的網站私鑰 (output client private key):

~~~term
$ openssl pkcs12 -in xzy.pfx -nocerts -nodes \
  -out my.domain.name.key

~~~

此指令將讀入 xyz.pfx ，並將匯出的網站私鑰存檔為 my.domain.name.key 。檔名按上段說明的慣例命名。

將三種用途的 PEM 文件集合為一個 PFX 格式文件:

~~~term
$ openssl pkcs12 -export \
  -certfile ca.crt \
  -in my.domain.name.crt \
  -inkey my.domain.name.key \
  -out test.pfx

~~~

此指令是反過來操作，將先前匯出的三份 PEM 文件再重新集合成一份 PFX 文件。執行時會提示你輸出 Export Password 。若不需要，直接按 Enter 保持無需密碼狀態。

### 自簽憑證

關於自簽憑證 (self signed certificate) 的內容，請參考我下列兩篇文章。

* [OpenSSL Library - 讀取 X509 certificate 的資訊](http://rocksaying.tw/archives/16158079.html)
* [OpenSSL - SOD 安全文件概論](http://rocksaying.tw/archives/17362107.html)

