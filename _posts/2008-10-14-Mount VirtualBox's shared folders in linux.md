---
title: Mount VirtualBox's shared folders in linux 掛載 VirtualBox 共用資料夾
category: computer
tags: [linux,virtualbox,vm]
lastupdated: 2021-06-09
permalink: /archives/7374721.html
---

在 VirtualBox 配置的虛擬機器上安裝 Linux 系統 (即 linux 作為 guest)，並設定 host 主機的目錄做為 Shared folder (共用資料夾)。常見問題。

1. 掛載方式與指令
2. 失敗狀況: no such device
3. 失敗狀況: Protocol error

本文記錄內容，時間跨度從 VirtualBox 2 到 6 版。從 Ubuntu 9 到 Debian 10 。有些狀況是舊版才有，新版修正了。

<!--more-->

#### 掛載方式與指令

##### 手動執行 mount.vboxsf 或 mount

~~~term

# 直接用 mount.vboxsf
sudo mount.vboxsf workspace /mnt/vbox/workspace

# 使用 mount
sudo mount -t vboxsf workspace /mnt/vbox/workspace

~~~

上述方式掛載後，資料夾擁有者是 root 。用起來不方便。若是想讓一般用戶成為資料夾擁有者，則需要加上選項 uid 和 gid 。

例如一般用戶 rock 的 uid 和 gid 分別是 1000, 1000 。想要將 Downloads 共用資料夾掛在 rock 的 /home/rock/Downloads 資料夾。指令如下:

~~~term

# 以一般用戶為擁有者的掛載選項
sudo mount.vboxsf -o uid=1000,gid=1000 workspace /home/rock/workspace

~~~

##### 設定 /etc/fstab

這種方法是系統啟動後自動掛載。

~~~text

workspace   /mnt/vbox/workspace vboxsf  rw  0  0

~~~

若要以一般用戶為共用資料夾掛載後的擁有者。其 fstab 的寫法如下:

~~~text

workspace   /home/rock/workspace vboxsf  rw,uid=1000,gid=1000  0  0

~~~

若是你用了 *mount.vboxsf* 不認得的選項，啟動時會失敗。下列即為失敗寫法，因為 *mount.vboxsf* 沒有 user 選項。

~~~text

workspace   /mnt/vbox/workspace vboxsf  rw,user  0  0

~~~

##### 修改 /etc/rc.d/rc.vboxvfs

近期的 Linux 散佈版本已廢棄此作法，不使用。

將 <code>mount -a -t vboxsf</code> 改成你自定的內容, 例如:

~~~sh

# Add this script: /etc/rc.d/rc.vbox-mount
mount.vboxsf workspace /mnt/vbox/workspace


# Insert into /etc/rc.d/rc.vboxvfs
if [ -x /etc/rc.d/rc.vbox-mount ]; then
    . /etc/rc.d/rc.vbox-mount
fi

~~~

#### 失敗狀況: no such device

~~~term

# 指令:
sudo mount -t vboxsf workspace /mnt/vbox/workspace

# 錯誤訊息:
/sbin/mount.vboxsf: mount.vboxsf mounting failed with the error no such device

~~~

如果你確定共用資料夾的設置無誤，但 mount.vboxsf 卻告訴你找不到這個設備 (no such device)。那你可能根本還沒安裝客端額外功能(Guest Additions)。又或者最近升級了 Linux 核心版本或主機端(host)的 VirtualBox 版本。請看「[Debian/Ubuntu 客端額外功能安裝說明]({% post_url 2010-9-15-VirtualBox 與 Debian_Ubuntu 客端額外功能(Guest Additions)補遺 %})」。

例如我將主機端的 VirtualBox 從 5 版升級到 6 版，然後原有的 Debian 虛擬機就找不到共用資料夾了。我得要從虛擬機選單「裝置\插入 Guest Additions CD 映像」，重新安裝客端額外功能。

#### 失敗狀況: Protocol error

這是早期才會發生錯誤。大約在 Debian 8 或 VirtualBox 5 版之前。後來的版本已經改善，不再出現這種狀況。

~~~term

# 狀況:
mount -t vboxsf workspace /mnt/vbox/workspace

# 錯誤訊息:
/sbin/mount.vboxsf: mounting failed with the error: Protocol error

~~~

我是在《[Mounting share directory on Linux host result in Protocol error if default share name is used](http://www.virtualbox.org/ticket/928)》這篇討論中找到答案。請看 frank 在該討論中的回應內容:

> I don't think this is a bug in VirtualBox. There is a known issue with Linux mount: If there exists are directory or file of the same name as your host share then mount expands the full path of that file/directory and passed this expanded name as network share to the mount.vboxsf command which obviously will fail since that guest path is not known to the host. Try to use mount.vboxsf directly (this will work) for such corner cases.
> <cite>05/27/08 09:44:50 changed by frank</cite>

使用 *mount* 指令時，來源的分享資料夾名稱不能和掛載位置的目錄名稱相同。

只要名稱不同，或是直接用 *mount.vboxsf* 指令掛載，都能避開這狀況。後來的版本已經改善，不再出現這種狀況。
