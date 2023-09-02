---
title: Linux NetworkManager 用命令列工具或組態檔設定網路連線
category: computer
tags: [linux,ethernet,"Network Device",NetworkManager]
lastupdated: 2023-09-02
---

[NetworkManager](https://zh.wikipedia.org/zh-tw/NetworkManager) 是目前各種 Linux 散佈套件最常用的網路連線管理工具。預設配置就會安裝這套工具。它提供了多種 GUI 管理工具，一套命令列工具，也允許使用組態檔設定。本文說明如何以命令列工具或組態檔做基本的網路連線設定工作。

* GUI 工具: 有很多種。但通常 GNOME 的 nm-applet (套件名 network-manager-gnome) 就足夠了。它在 KDE 或 LXDE/LXQt 桌面環境也能用。
* 命令列工具: [nm-cli](https://developer-old.gnome.org/NetworkManager/stable/nmcli.html)。
* 組態檔: [nm-settings-keyfile](https://developer-old.gnome.org/NetworkManager/stable/nm-settings-keyfile.html)。

<!--more-->

NetworkManager 的主要組態檔是 [NetworkManager.conf](https://developer-old.gnome.org/NetworkManager/stable/NetworkManager.conf.html) ，但我們通常不會動它。管理者需要關注的是網路連線組態檔。這些網路連線的組態內容分拆保存在目錄 */etc/NetworkManager/system-connections* 。一個連線一個組態檔。基本內容請看 [nm-settings-keyfile](https://developer-old.gnome.org/NetworkManager/stable/nm-settings-keyfile.html)。

#### 新建網路連線

nm-cli 建立新的網路連線組態，並同時設定向 DHCP 服務請求 IP 。指令如下:

```term

$ nmcli con add con-name <config-name> ifname <interface name> \
  type <connection type> ipv4.method auto

```

*con-name* 是管理者自行設定的網路連線組態名稱，以方便記憶辨認為主。*ifname* 才是指定網路介面，它需要對應作業系統真正認得的網路介面名稱，例如 eth0 。建立網路連線組態後，後續的操作對象都是用 *con-name* 指定的名稱，而不是直接指向網路介面。

在 GUI (nm-applet) 上的對應欄位如下圖:

![nm-applet 範例圖-連線名稱與網路介面名稱](https://github.com/shirock/images/raw/main/2023/09-02-linux_networkmanager_cli_and_config-1.png)

*type* 是連線類型，常見類型是 *ethernet* (乙太網路) 和 *wifi* (WiFi 無線網路)。

*ipv4.method*:

* auto : 自動(DHCP)。
* manual : 手動，還需要指定靜態 IP 。
* link-local : 系統自動配置一個 IP ，但網路遮罩為 32 ，亦即不能連外。
* shared : 分享給其他電腦。
* disabled : 已停用。

例如管理者要為乙太網路介面 eth1 新建網路組態，此組態名稱為「有線連線1」。指令:

```term

$ nmcli con add con-name 有線連線1 ifname eth1 \
  type ethernet ipv4.address auto

```

NetworkManager 會將上列指令新建的網路組態內容儲存在 */etc/NetworkManager/system-connections* 目錄下，檔案名稱就是管理者設定的連線名稱，如「有線連線1」或者「有線連線1.nmconnection」。

上例建立的「有線連線1.nmconnection」檔案內容如下:

```text

[connection]
id=有線連線1
type=ethernet
interface-name=eth1
permissions=

[ethernet]
mac-address-blacklist=

[ipv4]
method=auto

[ipv6]
method=auto

```

管理者可以直接編輯組態檔，只不過存檔後要記得重新啟動 NetworkManager 。Debain 11/Ubutun 22 指令:

```term

$ sudo service NetworkManager restart

```

#### 修改網路連線

##### 使用靜態 IP

nm-cli 修改網路連線組態為靜態 IP，指令如下:

```term

$ nmcli con modify <config-name> ipv4.method manual \
  ipv4.address <static ip/netmask> \
  ipv4.gateway <gateway address> \
  ipv4.dns <dns address>

```

注意，*ipv4.address* 將 IP 位址和網路遮罩寫在一起，用 / 分隔。

例如修改「有線連線1」使用靜態 IP : 192.168.10.11 ，Gateway 為 192.168.10.1 ，使用 Google DNS 服務: 8.8.8.8 。指令:

```term

$ nmcli con modify 有線連線1 ipv4.method manual \
  ipv4.address 192.168.10.11/24 \
  ipv4.gateway 192.168.10.1 \
  ipv4.dns 8.8.8.8

```

修改組態檔的方式，則是開啟「/etc/NetworkManager/system-connections/有線連線1.nmconnection」，編輯 *ipv4* 區的內容。只是 IP 位址、網路遮罩和 Gateway 要一起寫在 *address* 這一行。格式是 IP/網路遮罩,Gateway 。上例 nm-cli 對應的組態檔內容如下:

```text

[ipv4]
method=manual
address=192.168.10.11/24,192.168.10.1
dns=8.8.8.8;

```

上例在 GUI (nm-applet) 上的對應畫面是在「IPv4設定」頁，欄位如下圖:

![nm-applet 範例圖-IPv4設定頁](https://github.com/shirock/images/raw/main/2023/09-02-linux_networkmanager_cli_and_config-2.png)

##### 改用 DHCP 並清除靜態 IP 表

nm-cli 修改網路連線組態為 DHCP ，指令如下:

```term

$ nmcli con modify <config-name> ipv4.method auto \
  ipv4.address '' ipv4.gateway ''

```

例如修改「有線連線1」，改回 DHCP。指令:

```term

$ nmcli con modify 有線連線1 ipv4.method auto \
  ipv4.address '' ipv4.gateway ''

```

一張網路卡可以綁多個 IP 。若將網路連線組態改回 DHCP ，但沒刪除已設定的靜態 IP 時，此網路連線將會綁定多個 IP。一個向 DHCP 服務申請的動態 IP，以及已設定的靜態 IP 。這通常不是管理者想要的情形。所以將 *ipv4.method* 改為 *auto* 之外，還會把 *ipv4.address* 和 *ipv4.gateway* 設為 '' (空字串) 表示刪除這兩項設定。

上例 nm-cli 對應的組態檔內容如下:

```text

[ipv4]
method=auto
dns=8.8.8.8;

```

#### 其他操作

顯示網路連線狀態:

```term

$ nmcli con show

```

命令指定的網路離線:

```term

$ nmcli con down <config-name>

```

例如:

```term

$ nmcli con down 有線連線1

```

命令指定的網路上線:

```term

$ nmcli con up <config-name>

```

刪除指定的網路連線組態:

```term

$ nmcli con delete <config-name>

```
