---
title: Linux 開機後，利用 systemd 自動啟動 VirtualBox 虛擬機的作法
category: computer
tags: [linux,virtualbox,systemd,autostart]
lastupdated: 2022-10-11
---

在 Linux 桌面環境，想要開機後自動啟動某程式，簡易作法就是在 *autostart* 設定中加入要啟動的程式。
但這個作法用在 VirtualBox 的虛擬機上，就不太靈光。
偶爾可以啟動，但有時會跳出 vboxdrv 尚未載入的錯誤狀況。
然而手動啟動虛擬機總是正常的。

因為現代的 Linux 散佈版本於啟動桌面環境時，會將進入桌面和載入驅動程式 (包含 vboxdrv) 等多個工作，交給 systemd 平行處理 (systemd 約 2013 年之後普及)。
既然是平行處理，那麼進入桌面和載入 vboxdrv 這兩件工作，誰先誰後就不是固定順序的了。

所以想透過桌面環境的 *autostart* 自動啟動虛擬機的話，有時就會碰到先進入桌面但 vboxdrv 還沒載入的情形。
然後就跳出上述的錯誤了。

<!--more-->

下圖是我的其中一個系統的狀況。它使用 ligthdm (桌面登入管理) 且設定自動登入帳號。比較 lightdm 和 vboxdrv 的執行時間，載入 vboxdrv 的動作就比 ligthdm 晚了 3 秒。

![DM與vboxdrv載入順序比較圖](https://github.com/shirock/images/raw/main/2022/10-11-linux_autostart_vm_with_systemd-1.png)

###### 增加 systemd 啟動工作

了解緣由後，那麼答案就很清楚了。
想要穩定地在開機後自動啟動虛擬機，就要為這件事編寫一個 systemd 的工作設定檔，明明白白告訴 systemd 在 VirtualBox 驅動程式 (vboxdrv) 載入之後才啟動這個虛擬機。
基本上，導入 systemd 機制的 Linux 散佈版本都應該用這個方法增加自動啟動工作。

啟動虛擬機的 systemd 工作設定檔 (.service) 的範本如下:

```
# put in /etc/systemd/system/
[Unit]
Description=$MY_VM_NAME
After=network.target $VIRTUALBOX_SRV_NAME
Before=runlevel2.target shutdown.target

[Service]
User=$USERNAME
Group=$USERGROUP
Type=forking
Restart=no
TimeoutSec=5min
IgnoreSIGPIPE=no
KillMode=process
GuessMainPID=no
RemainAfterExit=yes

ExecStart=/usr/bin/VBoxManage startvm "$MY_VM_NAME" --type headless
ExecStop=/usr/bin/VBoxManage controlvm "$MY_VM_NAME" acpipowerbutton

[Install]
WantedBy=multi-user.target
```

其中有 4 個變數，請按你的實際狀況替換。

* $MY_VM_NAME - 就是你在 VirutalBox 圖形管理工具上看到的虛擬機名稱。
* $VIRTUALBOX_SRV_NAME - VirtualBox 驅動程式載入服務的名稱。
* $USERNAME - 管理虛擬機的用戶名稱。
* $USERGROUP - 管理虛擬機的用戶所屬群組。

###### After

需要在 *After* 那行，說明這個設定的程式(亦即虛擬機)必須在 VirtualBox 驅動程式載入之後才執行。
寫錯服務名稱就不能保證你的虛擬機照正常順序啟動了。

然而 VirtualBox 驅動程式載入服務的名稱在不同 Linux 散佈版本不相同。
Debian/Ubuntu 通常名稱是 virtualbox.service ，其他散佈版本可能取名 vboxdrv.service 。
可以用下列的指令查看你的散佈版本為 VirtualBox 驅動程式載入服務取了什麼名稱。

```term

$ sudo systemctl vbox*
$ sudo systemctl virtualbox*

```

###### ExecStart

*ExecStart* 設定 systemd 啟動此工作時使用的程式指令。

因為所有委托 systemd 啟動的程式都是在背景執行，所以虛擬機的啟動指令要加上參數 *--type headless* ，讓虛擬機先在無視窗狀態啟動。
你不用擔心在 Host 桌面環境無法操作 Guest OS ，因為 VirtualBox 圖形介面管理工具可以把 Guest OS 的視窗叫出來。

###### ExecStop

*ExecStop* 設定結束此工作的程式指令。
結束的時機包含 Host 電腦關機。

為了讓你的 Guest OS 走一遍正常關機流程，需要控制指令向它送出「關閉電源」的訊號，亦即 *acpipowerbutton* 。
或者你也可以選擇「儲存狀態後關閉虛擬機」，那控制指令就改成 *savestate* 。

*acpipowerbutton* 有可能碰到 Guest OS 關機比較久的狀況。
而 *savestate* 的好處是 Guest OS 關閉和開啟速度比較快，但有可能發生 Guest OS 開啟當機的情況。

建議順便修改 */etc/default/virtualbox* 中的關機選項，改成:

```
SHUTDOWN_USERS="all"
SHUTDOWN=acpibutton
```

acpibutton 也可以選擇 savestate (這行的 acpibutton 沒打錯，這裡的用字和 vboxmanage 的用字不一樣)。

###### 實際操作範例

在 Ubuntu 22.04 系統中，建了一個虛擬機，名稱叫 "Windows 10 Test"。

為了在電腦開機後自動啟動這個虛擬機，我建了一個 systemd 設定檔，路徑 /etc/systemd/system/vm-windows-10.service 。

部份內容如下:

```
[Unit]
Description=Windows 10 Test
After=network.target virtualbox.service

[Service]
User=rock
Group=rock

ExecStart=/usr/bin/VBoxManage startvm "Windows 10 Test" --type headless
ExecStop=/usr/bin/VBoxManage controlvm "Windows 10 Test" acpipowerbutton
```

先確認一遍設定內容是否可以正確啟動與結束虛擬機。

啟動虛擬機:

```term
$ sudo systemctl start vm-windows-10
```

結束虛擬機:

```term
$ sudo systemctl stop vm-windows-10
```

確認設定無誤，再執行下列指令，啟用 vm-windows-10.service 為開機後自動執行的工作。

```term
$ sudo systemctl enable vm-windows-10
```

如果你有好幾個虛擬機想自動啟動，可以參考 [Start a VirtualBox VM on boot with Systemd](https://www.pragmaticlinux.com/2020/10/start-a-virtualbox-vm-on-boot-with-systemd/) 這篇的 systemd 寫法。 systemd 設定檔允許代入參數。
