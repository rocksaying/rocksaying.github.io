---
title: 為客戶轉移 NetWare 檔案服務到 Linux 的 mars_nwe (NetWare Emulator)
category: computer
tags: [netware,novell,mars_nwe,ipx,linux,debian,redhat]
lastupdated: 2021-10-28
---

### 前言

Novell NetWare 是一套在三、四十年前相當流行的網路檔案服務系統。
當時許多 DOS 電腦就是靠這套服務系統共用檔案，讓 DOS 系統也能架構多人共同作業的環境。

雖然 NetWare 系統相當古老了，但資訊界有一個傳統法則，「東西沒壞就不要動」。
秉持這個傳統法則，仍有些中小企業的資訊系統就是用 DOS 加 NetWare 的環境在運作。
堪稱中小企業的 [COBOL](https://zh.wikipedia.org/wiki/COBOL)。

不過 NetWare 真的太老了。它能安裝的硬體規格也都跟著過時了。
客戶怕有朝一日他家的 NetWare 電腦掛掉沒零件可換，希望我能幫他找一個現代化的解決方案。
也方便他日後將資訊系統轉移到現在流行的 Web 架構上。

客戶提供了一台 NetWare 電腦(備品)和一台連線作業的 DOS 電腦。
客戶需求是把 NetWare 電腦裡的資料都轉移到新的系統上，而且 DOS 電腦一樣能上線作業。

<!--more-->

### NetWare Emulator

在我記憶中，大約二十年多前，亦即 Windows 95 發表後，因為 Windows 95 的網路芳鄰能替代 NetWare 的作用，故曾掀起一波汰換 NetWare 的浪潮。

在這浪潮上， Linux 界也有人開發了可替換 NetWare 的檔案服務軟體。
最穩定也是唯一具實用性的就是 mars_nwe ，它的名稱 nwe 正好是 NetWare Emulator 的縮寫。
雖然它的程式碼只維護到 2003 年為止，但反正不會有新的使用者需求，就不算是問題。

### 選擇 Linux 散佈版本

NetWare 檔案服務走的是 IPX 協定，而不是現代主流的 IP 協定。
最後支援 IPX 協定的 Linux kernel 是 4.14 (2015 年左右)。
很明顯，最近的 Linux 散佈版本不支援 IPX 了，只能挑選用 kernel 4.14 以前的舊散佈版本。

我整理後，使用的是下列 3 個 Linux 散佈版本。

#### RedHat 9 散佈版本

Linux kernel: 2.4.20-8

RedHat 9 下載:
[ftp.kh.edu.tw](https://ftp.kh.edu.tw/Linux/Redhat/iso/9.0/)

它有 3 片 CD 影像檔。基本安裝要第 1 片。而 mars_nwe 和 IPX 工具的套件在第 2 片。

RedHat 不愧是當時最有能力將 Linux 推進企業用領域的散佈版本。
為了配合當時的企業環境， mars_nwe (對應 NetWare) 和 samba (對應網路芳鄰) 都是安裝時的建議套件。

#### Ubuntu 12.04 LST 散佈版本

Ubuntu 12.04.5 Linux kernel: 3.13.0-32

Ubuntu 12.04 下載:
[old-releases.ubuntu.com](http://old-releases.ubuntu.com/releases/)

因為 Ubuntu 12.04 LST 已經停止維護了，所以它的套件來源庫要用下面連結提供的鏡像。

Ubuntu 舊版本套件來源庫鏡像:
[old-releases mirror](http://old-releases.ubuntu.com/ubuntu/)

#### Debian 9 散佈版本

Debian 9.13 Linux kernel: 4.9.0-13

Debian 9 下載:
[cdimage.debian.org](https://cdimage.debian.org/cdimage/archive/)

Debian 套件來源庫鏡像:
[國網中心自由軟體實驗室 mirror](http://opensource.nchc.org.tw/debian/)

#### 我選擇哪一個

這幾個散佈版本的基本安裝內容已包含 IPX 模組，不用編譯。
mars_nwe 程式執行時就會觸發 kernel 載入 IPX 模組。

就我試用結果，RedHat 9 和 Debian 9 可用， Ubuntu 12 不能用。

RedHat 9 的缺點是硬體支援太老舊，就和 NetWare 一樣不支援 SATA 介面。
如果要安裝在實體電腦的話，只能找有 IDE 介面的老舊電腦。

RedHat 9 安裝在 VirtualBox 虛擬機時，硬碟要選 IDE 介面。
但它的 linux kernel 不支援 VirtualBox 的客戶端附件 (Guest Additinos) 。
和 VirtualBox Host 主機交換檔案要靠 SFTP 或者 SAMBA 。

Debian 9 的硬體支援程度就是現代 PC 規格了。
只是 mars_nwe 要自行取得。當然本文幫各位找好了。

Fedora 用戶，參考下表:

* Fedora 15      - kernel 2.6.38
* Fedora 21      - kernel 3.17
* Fedora 22      - kernel 4.0

ISO download: 
[fedora releases](https://archives.fedoraproject.org/pub/archive/fedora/linux/releases/)

我找尋參考文章時，看到網友在 [Fedora 15 跑 mars_nwe](https://www.ptt.cc/bbs/Linux/M.1378226084.A.C24.html)。

### 取得 mars_nwe

按本文的系統需求，只需要取得 mars_nwe 軟體即可。
mars_nwe 程式執行時，就會觸發 kernel 載入 IPX 模組。

過去的舊文還會提到 ipxutils, ncpfs 這些工具。
但那些主要是 NetWare 檔案服務的客戶端工具，本文則是要架設 NetWare 檔案服務的伺服器，所以不需要。
此外，那些工具在 RedHat 9 以外的 Linux 散佈版本上，雖然有套件，但實際上不能用。

#### RedHat 9 安裝 mars_nwe

Redhat 9 請從它的第 2 片 CD 影像檔，找到 mars-nwe-0.99pl120-12.i386.rpm 。

ncpfs-2.2.1-1.i386.rpm 也可以順便安裝，它包含 *slist* 這個工具。

```term

$ su 
$ cd /mnt/cdrom/RedHat/RPMS
$ rpm -ivh mars-nwe-0.99pl120-12.i386.rpm

```

安裝後，以 root 身份手動執行 `/etc/init.d/mars-nwe` 啟動 NetWare 檔案服務。
或者開啟桌面選單的 System Setting \ Server Settings \ Services 設定程式，勾起 mars-nwe 。以後系統啟動就會執行 mars-nwe 了。

#### Debian 9 安裝 mars_nwe

Ubuntu 12.04 和 Debian 9 安裝 mars_nwe 的方式相同。只是 Ubuntu 12.04 實測連線與傳輸結果不能用。

最新版的 mars_nwe-0.99.pl23 要自行下載源碼編譯，下載點:
[mars_nwe-0.99.pl23.tar.bz2](http://ftp.disconnected-by-peer.at/ncpfs/mars_nwe-0.99.pl23.tar.bz2) 。

編譯 mars-nwe-0.99.pl23 需安裝 cmake, g++, libgdbm-dev 這三個套件。

我把編譯好的 mars-nwe_0.99.pl23 打包了，放在我的 github 上:
[mars-nwe_0.99.pl23-1_i386.deb](https://github.com/shirock/rocksources/raw/master/linux/mars-nwe_0.99.pl23-1_i386.deb)。2022-09-24: 從 0.99.pl23-0 更新為 0.99.pl23-1 ，修正安裝 script 錯誤。

安裝這個 mars-nwe_0.99.pl23-0_i386.deb 後，尚需安裝 libgdbm3 套件。

我找到別人事先打包好的 mars-nwe_0.99.pl20 Deb 套件，下載點:
[mars-nwe_0.99.pl20-0_i386.deb](https://people.debian.org/~pm/pool/main/mars-nwe/) 。

安裝現成的 mars-nwe_0.99.pl20-0_i386.deb 後，尚需安裝 libdb1-compat 套件。

#### 編譯 mars_nwe-0.99.pl23

按以下步驟操作即可。參考 [cml37 的步驟](https://github.com/cml37/dos-utils/blob/master/network/mars_nwe/mars_nwe_setup.txt)。

```term

$ wget http://ftp.disconnected-by-peer.at/ncpfs/mars_nwe-0.99.pl23.tar.bz2
$ bunzip2 mars_nwe-0.99.pl23.tar.bz2
$ tar xf mars_nwe-0.99.pl23.tar
$ cd mars_nwe-0.99.pl23
$ cmake .
$ make
$ sudo make install

```

make 會跳很多警告訊息，不必理會。反正結果是成功的。
*注意，我試過在 64bit 系統下編譯。編譯成功，但實際上不能運作。*

預設結果，執行檔將安裝在 /usr/local/sbin ，設定檔在 /usr/local/etc/mars_nwe/nwserv.conf 。
系統服務執行檔是 /etc/init.d/mars-nwe 。
若你想調整 nwserv.conf 或其他檔案的安裝路徑，請參考本文最後「修改編譯項目」一節。

執行檔列表:

* nwserv
* dbmtool
* ftrustee
* ncpserv
* nwbind
* nwclient
* nwconn
* nwrouted

一般來說，執行下列指令就可以啟動服務:

```term

$ sudo /etc/init.d/mars-nwe start

```

若測試無誤，想正式使用的話，再用系統提供的指令將它登記為自動執行服務。
Debian 9 的設定指令是:

```term

$ sudo update-rc.d mars-nwe defaults

```

### 設定 mars_nwe

設定檔 nwserv.conf 。

* RedHat 9: /etc/nwserv.conf
* Deb 包 (mars-nwe_0.99.pl20-0): /etc/mars-nwe/nwserv.conf
* 我的 Deb 包 [mars-nwe_0.99.pl23-1_i386.deb](https://github.com/shirock/rocksources/raw/master/linux/mars-nwe_0.99.pl23-1_i386.deb): /etc/nwserv.conf
* 自行編譯預設組態: /usr/local/etc/mars_nwe/nwserv.conf

#### 第 1 節設定 volume 

每台 NetWare 檔案服務一定要有一個叫 SYS 的 volume 。

我們可以指定任何目錄作為 SYS volume 。
當 nwserv 服務程式啟動時，會在作為 SYS volume 的目錄下自動建立四個子目錄，分別是:

* login
* public
* mail
* system

login 子目錄是 DOS 用戶使用 netx 或 vlm 工具初步連接檔案服務主機後看到的第一個公開目錄。
以往我們會把用戶登入主機所需的工具檔案放在這。

喔，對未接觸過 NetWare 服務的人說明一件事， DOS 使用 NetWare 服務有兩段步驟。
第一步是用 netx 或 vlm 工具「連接」一台服務主機。
第二步才是用 login 工具「登入」服務。

第一步連接就會把 SYS volmue 的 login 子目錄對映到 DOS 的 F: 。

如果在 Linux 的 mars_nwe 這一端，你設定 login 子目錄的讀寫權限為 777 的話，那麼這個子目錄就相當於 FTP 的公開目錄，所有人都可以讀寫裡面的檔案內容。
啊，當年在電腦教室把紅色警戒、魔獸爭霸3放上 login 目錄後，眾人大戰的情景仍依稀在目... 

連接主機後，才可以用 login 工具登入已連接主機的帳號。
這時會重新對映 SYS 和其他 volume 到 DOS 的各磁碟代號。

舉例來說，我第 1 節設定如下:

```text

1  SYS  /home/nwe/Public/  kt  775  664

```

那麼，第 1 步 netx 或 vlm 會產生下列對映結果:

```text

Linux NWE                     DOS
---------                     -----
/home/nwe/Public/public  ==>  F:\

```

第 2 步 login 後，會重新對映成下列狀態:

```text

Linux NWE                     DOS
---------                     -----
/home/nwe/Public/        ==>  F:\
/home/nwe/Public/        ==>  Y:\
/home/nwe/Public/public  ==>  Z:\

```

我配合客戶需要，將 SYS volume 設定 Linux 主機的一般帳號目錄下。
並且設定 DOS login 帳號就是對應這個 Linux 帳號。
但把 login, mail 和 system 三個子目錄的 owner 設為 root ，禁止 DOS 用戶修改。

注意，作為 SYS volume 的目錄，配合參數 k ，其檔案名稱必須全小寫。
如果有檔案名稱是大寫的混在這之中， DOS 用戶端就看不見名稱大寫的檔案。

若沒有參數 k ，則反過來，檔案名稱必須全大寫。 DOS 用戶端看不見名稱小寫的檔案。

#### 第 2 節設定 server name

主機名稱。

#### 第 3, 4 節設定網路

NetWare 檔案服務建立在 IPX 網路協定之上，它有一套和 IP 網路協定不相同的名詞。

* Internal network - 這相當於 IP 的子網路 (subnet)。
* Node - 這相當於 IP 的最後一個編號。這是每台主機識別編號，不能重複。
* Net number - 我不知道怎麼譬喻。它似乎是用於區分傳輸訊框格式。

如果你的 LAN 只打算跑一台 NetWare 服務主機，這三個數值都用 auto 就好。
但若像我一樣，在 LAN 中有一台真實 NetWare 服務主機，正要安裝一台 mars_nwe 主機轉移資料，那麼就必須分別設定它們。

Internal network 和 Node 是 nwserv.conf 的第 3 節項目。
Internal network 相當於 IPv4 的前 3 節號碼，而 Node 就是第 4 節號碼。
從 IP 設定的經驗，我們可知這兩個組合在不同主機之間不能相同。

只是 IPX 沒有閘道和網路遮罩的限制，不同 Internal network 並不會分隔彼此。
所以我們就簡單點，每台 mars_nwe 主機的 Internal network 都設 auto ，只要 Node 不同即可。

Net number 是 nwserv.conf 的第 4 節項目。
如果你有多台 NetWare 服務主機(含 mars_nwe)，這值絕對不能設 0 。

首先說明 IPX 有 802.3 和 802.2 兩種訊框格式。802.2 是較新的那個。
NetWare 3.11 用較舊 802.3 ，而 NetWare 3.12 用較新的 802.2 。

mars_nwe 的實作模仿目標基本上是 NetWare 3.11 ，所以理論上單用 802.3 這個格式就好。
但是我實際運作時碰到了一些狀況，最後我同時使用 802.3 和 802.2 兩種格式。
這時就要指定 Net number ，以便 LAN 的 IPX 封包區分其訊框格式。

我的 LAN 有一台真實的 NetWare 服務主機，它已經設定 Net number 1 走 802.2 ，Net number 3 走 802.3 。我就跟著它走。

#### 第 10, 12, 13 節設定服務執行時的有效身份

第 10 節設定 nwserv 程式執行時的有效身份。
這實際上也是 DOS 用戶在連接主機但尚未登入時的身份。
回顧第 1 節 volume 的說明可知， DOS 用戶在尚未「登入」時，就是以此處設定的身份在操作 login 子目錄。

預設是 nobody 。不過我按照客戶需求，直接設成一般帳號。

第 12 節設定 NetWare 檔案服務管理者 SUPERVISOR 對應的 Linux 帳號和密碼。
mars_nwe 的密碼和 Linux 系統的密碼分開。

第 13 節設定 NetWare 檔案服務一般用戶對應的 Linux 帳號和密碼。
你可以設定很多用戶分別對應不同 Linux 帳號。
不過現在應該沒人把 NetWare 檔案服務當成主要的檔案分享方式了。
一般就設一個帳號大家用。
如果密碼欄設 *-* 的話，表示不用密碼。

### 實際運作狀況

我有客戶提供的一台真實 NetWare 3.12 主機，主機名稱叫 ABC 。

另外我裝了 3 台虛擬主機，分別跑 RedHat 9, Ubuntu 12 和 Debian 9 。它們的 nwserv.conf 主要網路設定如下:

RedHat 9:

```text

2  RH9
3  auto  1    # 同一個 LAN ， Node 不能相同
4  0x1  eth0  802.2  1
4  0x3  eth0  802.3  1

```

Ubuntu 12:

```text

2  UBT12
3  auto  2    # 同一個 LAN ， Node 不能相同
4  0x1  eth0  802.2  1
4  0x3  eth0  802.3  1

```

Debian 9:

```text

2  DEB9
3  auto  3    # 同一個 LAN ， Node 不能相同
4  0x1  enp0s3  802.2  1
4  0x3  enp0s3  802.3  1
# kernel 4 起，網路設備的名稱就不叫 eth0, eth? 了

```

在 RedHat 主機跑 slist 列出的結果如下圖所示:

![RedHat 9 slist](https://rocksaying.github.io/images/2021-10-28-linux_mars_nwe_slist.png)

slist 這個工具，RedHat 9 有，客戶提供給我的 DOS 電腦上也有。
各位自己想辦法取得吧。

#### DOS 使用狀況

客戶提供的 DOS 電腦，已經設定登入真實 NetWare 主機的內容了。
我用它內附的 vlm.exe 測試 mars_nwe 服務。

```term

C:> vlm /V4 /PS=RH9
...
You are attached to server RH9

C:> dir F:\
...

C:> vlm /u

C:> vlm /PS=DEB9
...
You are attached to server DEB9

C:> login USER
...
Drive  F: = DEB9\SYS:  \
    ----
SEARCH1:  = Z:. [DEB9\SYS:   \PUBLIC]
SEARCH2:  = Y:. [DEB9\SYS:   \]

```

結果可用。

後來也順利地把真實 NetWare 主機上的檔案，複製到 Debian 9 虛擬主機。
而且客戶在 DOS 電腦上的資訊作業軟體也正常工作。

### 未解疑問

#### Ubuntu 連不上

RH9 的 slist 可以看到 UBT12 ，但 DOS client 連不上。

試過只用 802.3 ；也試過 802.3 和 802.2 都用。皆不行。
有一次連上了，但 dir F: 連目錄列表都跑不出來。

再嘗試抓別人預先打包的 mars_nwe-0.99.pl20 安裝。
和 mars_nwe-0.99.pl23 狀況相同。

因為我看過 cml37 和 yu_izumi 其他二位用 mars_nwe-0.99.pl23 的文章，並沒有這狀況。我懷疑卡在 Ubuntu 的 IPX 模組。

因為其他二位成功案例的共同點都是用 Raspberry 的 Rasbian OS ，也就是 Debian 的變種。

> DebianだとStretch、9.9以降が該当する。
> 最新は0.99pl. 23となっている。

我想那就試試 Debian ，正好我熟。
支援 IPX 模組的 linux kernel 版本，對應到 Debian 就是 Debian 7 ~ 9 這幾個散佈版本。
剛好我還留著 Debian 8 的虛擬機，直接拿來測試，複製 Ubuntu 12 上的 nwserv.conf 。
結果完全沒問題。

由於參考文章在動手編譯 IPX 模組時，都提到兩個選項的第二個不要選。

```text
The IPX protocol (CONFIG_IPX) [N/m/y/?] y
Full internal IPX network (CONFIG_IPX_INTERN) [N/y/?] n
```

我懷疑 Ubuntu 的 IPX 模組的第二項選了 Y 。

#### 為何我需要 802.2

cml37 說他使用 802.2 訊框時，傳輸不穩定。

> Although Novell uses 802.2 for NetWare 3.12, I found, at least when running as a virtual machine, that file copies, etc. are unreliable and time out, and as such, switched to 802.3, which seems to have cleared up the problem.

但我這邊的狀況是，我至少要有一台 mars_nwe 服務啟用 802.2 訊框， DOS client 才能找到我的 mars_nwe 服務。

Case 1: LAN 同時存在一台真實的 NetWare 3.12 服務主機，一台 Debian 8 的 mars_nwe 服務主機。
就算 mars_nwe 只啟用 802.3 ， DOS client 依然可以找到 mars_nwe 服務主機並登入。

Case 2: LAN 同時存在一台 RedHat 9 的 mars_nwe 服務主機，一台 Debian 8 的 mars_nwe 服務主機。
RedHat 9 的 mars_nwe 服務主機同時啟用 802.3, 802.2 。
就算 Debian 8 的 mars_nwe 服務主機只啟用 802.3 ， DOS client 依然可以找到 Debian 8 服務主機並登入。

Case 3: LAN 只有一台 Debian 8 的 mars_nwe 服務主機，只啟用 802.3 ，DOS client 就找不到 Debian 8 服務主機。

Case 4: LAN 只有一台 Debian 8 的 mars_nwe 服務器主機，但同時啟用 802.3, 802.2 ，DOS client 正常使用。

我不知道客戶的 DOS client 做了什麼設定，但顯然它需要一台跑 802.2 的服務主機擔任路由工作。

#### 修改編譯項目

我編譯 mars_nwe 時，修改了兩處 cmake 設定，讓 nwserv.conf 和 nwserv.pid 這兩個檔案放在我習慣的路徑。
我讓 nwserv.conf 位於 /etc/nwserv.conf ，而 nwserv.pid 在 /var/run/nwserv.pid 。

修改方式是編輯 mars_nwe 源碼第一層目錄下的 CMakeLists.txt 。在開頭的 SET 段落處增加以下兩行設定值:

```text

SET (MARS_NWE_INSTALL_FULL_CONFDIR "/etc")
SET (MARS_NWE_PID_DIR "/var/run")

```

修改後，再下指令 `$ cmake . ; make ` 重新編譯。

或者不動 CMakeLists.txt 。則先跑 `cmake .` 產生 include/config.h 。修改 include/config.h 的內容之後再編譯。

###### 參考資料

* [cml37 - mars_nwe_setup](https://github.com/cml37/dos-utils/blob/master/network/mars_nwe/mars_nwe_setup.txt)

cml37 有上傳 Youtube [RetroTutorial: Installing and Configuring Mars NWE](https://www.youtube.com/watch?v=MZ2aQs2706A) 。

<iframe width="560" height="315" src="https://www.youtube.com/embed/MZ2aQs2706A" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

* [centos 6.4是否能加上ipx模組](https://www.ptt.cc/bbs/Linux/M.1378226084.A.C24.html)
* [我本善良 - 快速安裝 NOVELL SERVER 模擬器](http://www.study-area.org/tips/novell_eml/novell_eml.htm)
* [Linux IPX-HOWTO: Configuring your Linux machine as an NCP server](https://tldp.org/HOWTO/IPX-HOWTO-10.html)
* [yu_izumi - Mars_NWE on Linux](https://yu-izumi.hatenablog.com/entry/2021/05/08/124737)
