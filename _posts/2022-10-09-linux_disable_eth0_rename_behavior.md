---
title: Linux 如何用舊的 eth0 網路介面名稱，不要 eno0, enp0s1 這種
category: computer
tags: [linux,ethernet,"Network Device",grub]
lastupdated: 2022-10-09
---

為什麼現在 Linux 的網路介面名稱不是 eth0 ？ 這說來話長，我先長話短說。

若要用 *eth0* ，編輯 */etc/default/grub* ，*GRUB_CMDLINE_LINUX* 這行改成:

```text
 
GRUB_CMDLINE_LINUX="net.ifnames=0 biosdevname=0"

```

然後執行下列指令更新 grub 設定:

```term

$ sudo update-grub
或者
$ sudo grub-mkconfig -o /boot/grub/grub.cfg

```

想要了解來龍去脈，請接著看。

<!--more-->

起初， Linux kernel 對乙太網路裝置的介面命名方式都是按 eth0, eth1 的數字序列下來。
然而現代的 Linux 散佈版本導入了更複製的命名規則，以應對多樣化的乙太網路裝置。
例如主機板內建乙太網路裝置、獨立乙太網路擴充卡、USB網路卡等等。
所以現代 Linux 散佈版本中，乙太網路裝置通常被賦予 eno0, ens1, enp2s3, enx0045678 這類樣式的介面名稱 ，而不再是傳統的 eth0, eth1 。

注意， Linux kernel 仍然用 eth? 這個名稱樣式。
新的名稱樣式，是由 NetworkManager, networkd, [netplan](https://netplan.io/) 這些網路介面管理者負責的。
可在 dmesg 中看到重新命名的工作記錄。

```term

$ sudo dmesg | grep eth0

[    3.256592] e1000e 0000:00:19.0 eth0: Intel(R) PRO/1000 Network Connection
[    4.854576] e1000e 0000:00:19.0 enp0s25: renamed from eth0

```

現代 Linux 散佈版本的網路介面命名規則具體請看 [Consistent Network Device Naming]( https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/networking_guide/ch-consistent_network_device_naming)。

這個規則是為了應對多樣化的乙太網路裝置，讓系統管理者可以針對不同類型的網路裝置設置不同網路存取規則。

以資安工作者為例，針對內建乙太網路裝置和可隨時插拔的 USB 網路卡，他們不會希望兩者擁有相同的網路存取等級。
他們就需要這樣的命名規則。

若你管理的工作環境具有下列三要件，這個規則或許就有些不方便了。

1. 使用同一份磁碟影像批次複製多台電腦系統。
2. 但每台電腦裝備的乙太網路裝置規格不完全相同。
3. 不論什麼硬體零件組合，這些電腦只會有一個乙太網路介面。

使用同一份磁碟影像，意味著這些電腦的軟體設定會綁定同樣的網路介面名稱。
若有些電腦的乙太網路裝置被取了不同的網路介面名稱，則系統管理者複製多台電腦之後就需要把它們都啟動一次。
在它們初次開機後，逐一檢查是否需要修改軟體設定的網路介面名稱。

若符合這種情形，且確定系統只會有一個乙太網路介面時，或許舊式的 eth0 會讓作業系統的設定工作簡單些。
那麼可以考慮關閉網路介面重命名行為。一般個人用戶就不必考慮這事。

關閉新式網路介面命名規則的方式，參考:

* [NetworkInterfaceNames - Debian Wiki](https://wiki.debian.org/NetworkInterfaceNames)
* [Change default network name (ens33) to old “eth0”](https://www.itzgeek.com/how-tos/mini-howtos/change-default-network-name-ens33-to-old-eth0-on-ubuntu-16-04.html)

編輯 */etc/default/grub* ，在 *GRUB_CMDLINE_LINUX* 這一行加上兩個啟動參數:

* net.ifnames=0
* biosdevname=0

舊 RedHat 派用 biosdevname ， Debian 派用 net.ifnames 。參數值 0 表示 False 、關閉。
為了相容不同散佈版本，兩個參數都寫上。

最後執行 *update-grub* 或 *grub-mkconfig* 指令，更新 grub 設定。
