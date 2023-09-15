---
title: Debian Linux 設定 APT 套件庫僅使用 CD/DVD
category: computer
tags: [linux,apt,deb,debian,ubuntu]
lastupdated: 2023-09-15
---

絕大多數使用者在安裝 Debian/Ubuntu 之後，會修改 apt 的 *sources.list* ，完全使用網路上的套件庫，取消 CD 來源。但本文的操作相反，僅使用 Debian/Ubuntu 的 CD/DVD 內容作為套件庫來源。本文適用情境：

1. 舊版本系統，官方已經移除網路上的套件庫。
2. 主機網路不連外。

以上情境需要管理者事先從網路下載完整的光碟影像，並將光碟中的套件資訊匯入 apt 資料庫。日後需要安裝套件時，apt 就會提示管理者需要插入第幾片光碟。一般還需要手動修改 *sources.list* 加一些選項， apt 才不會丟出套件來源不能認證(can't be authenticated)的錯誤。

<!--more-->

<div class="note">
若是用 DVD 媒體的話，完整的散佈版本內容會多達十幾片。但我們通常只需要前面 3 ~ 5 片就夠了。編號愈後面的光碟內容愈罕用。
</div>

管理者要先用 `apt-cdrom` 指令匯入各片光碟的套件資訊。 apt 總是假設電腦上只有一台光碟機，管理者需要抽換數次光碟片。

apt 默認的光碟機掛載點是 */media/cdrom* 。先將第一號光碟片放入光碟機，掛載到 */media/cdrom* 後，執行 `apt-cdrom add -m` 指令。匯入之後，卸載並退出光碟片。再重複上述的動作繼續匯入剩下的光碟片內容。指令操作過程如下：

```term
# 將光碟片放入光碟機，掛載。
# SATA 光碟機，設備代號 /dev/sr0
sudo mount /dev/sr0 /media/cdrom

# 匯入
sudo apt-cdrom add -m

# 卸載
sudo umount /media/cdrom

# 更換光碟片後，重複以上操作。
```

<div class="note">
我的操作習慣是我先掛載光碟片，再執行 apt-cdrom 。所以我會加上 -m 選項，要求 apt-cdrom 不要先卸載光碟片再叫我掛載。
</div>

如果不想將光碟影像檔(ISO檔)燒成光碟片，管理者可以利用 loop device 的形式直接掛載 ISO 檔。
例如我將 ISO 檔放在 */home/rock/ISOs* 。可以用下列指令掛載：

```term
sudo mount -o loop /home/rock/ISOs/disk1.iso /media/cdrom
```

當管理者將光碟片的套件資訊都匯入後，按慣例要跑一次 `apt-get update` 。**不出意外的話，就會發生錯誤! (蛤!?)** apt 會丟出套件來源不能認證(can't be authenticated)的錯誤訊息，如下：

```term
W: The repository 'cdrom://[Debian GNU/Linux ...] Release' does not have a Release file.
N: Data from such a repository can't be authenticated and is therefore potentially dangerous to use.
N: See apt-secure(8) manpage for repository creation and user configuration details.
```

要解決這個錯誤，管理者需要編輯 sources.list 。在每一個 cdrom 來源前加上 `[trusted=yes]` 選項。如下：

```text
# /etc/apt/sources.list
deb [trusted=yes] cdrom:[Debian GNU/Linux ... 1]
deb [trusted=yes] cdrom:[Debian GNU/Linux ... 2]
deb [trusted=yes] cdrom:[Debian GNU/Linux ... 3]
# 每一行都要加
```

改好之後再跑 `apt-get udpate` 就沒問題了。

參考 [debian apt update doesn't allow DVD's](https://superuser.com/questions/1340855/debian-apt-update-doesnt-allow-dvds)。相關選項還有:

* allow-insecure=yes
* allow-weak=yes
* allow-downgrade-to-insecure=yes

我不知道為什麼最後還要搞這一招。
