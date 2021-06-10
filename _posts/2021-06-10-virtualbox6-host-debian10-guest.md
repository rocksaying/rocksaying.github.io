---
title: Windows 10 VirtualBox 6.1 安裝 Debian 10 虛擬機狀況排除筆記
category: computer
tags: [debian,linux,virtualbox,windows]
lastupdated: 2021-06-10
---

自從 Windows 10 增加 *Windows 子系統 Linux 版* (WSL, Windows Subsystem Linux) 功能後，我已經很長一段時間都在用 *WSL* 跑 Debian 了。
這次要不是想裝一套純 Debian 10 虛擬機，還不知道 VirtualBox 6 現在這麼多毛病。
我不清楚是不是因為虛擬化功能愈來愈複雜，才導致 VirtualBox 6 的適應性變差。

host 系統: Windows 10 Home 64bit.

* VirtualBox 6 安裝錯誤狀況: 找不到設備或檔案 (cannot open the device or file specified)。
* Debian 10 為 guest 系統的錯誤狀況:
  * installation failed when select and install software.
  * black screen.

<!--more-->

![要注意的項目](/images/2021-06-10-virtualbox6-host-debian10-guest-1.png)

#### VirtualBox 6 安裝錯誤狀況

安裝 VirtualBox 6 時，出現錯誤訊息「找不到設備或檔案」。Retry 無效，取消後顯示錯誤代碼 2755。

這錯誤訊息很容易誤導使用者。我當時還以為是下載的安裝檔不完整。
搞半天才發現它其實是指系統未啟用虛擬化功能 (找不到虛擬化設備)。
檢查以下兩點是否啟用:

1. 檢查 BIOS/UEFI 是否啟用:
  利用「工作管理員」即可確認。效能->CPU->右下角: 「模擬: 已啟用」。

2. 檢查 Windows 系統功能「Windows Hypervisor 平台」是否啟用:
  執行指令: OptionalFeatures.exe 。在系統功能中，勾選「Windows Hypervisor 平台」。

#### Debian 10 為 guest 系統的錯誤狀況

Debian 10 版本建議使用 32bit 。64bit 安裝在 VirtualBox VM 時的狀況多。

系統\加速: 半虛擬化介面。不要用 Hyper-V 。選 KVM 或最小。預設值應該是 KVM 。

##### installation failed when select and install software

若在安裝過程 select software 之後，出現套件安裝失敗的錯誤狀況，則應取消 I/O APIC。
安裝速度會變很慢，但至少成功。等系統安裝完成，再啟用 I/O APIC。

系統\主機板: I/O APIC。視狀況取消。

##### black screen

安裝到一半黑畫面 (black screen)。又或者成功安裝，但開機進入圖像登入畫面，變黑畫面。

視訊記憶體開到 16MB 或以上一定足夠，原因不在視訊記憶體數量。
經我反複嘗試，原因出在「圖形控制器」和「3D加速」。

顯示\畫面: 圖形控制器。應選擇 VBoxVGA 或 VBoxSVGA ，兩者無顯著差異。
不要用 VMSVGA ，這會導致 sddm, kde 黑畫面。連最基本的 xdm 或 x 工具都有顯示不正常的狀況。

顯示\畫面: 加速。取消3D加速。
不會黑畫面。但和 VMSVGA 一樣，有部份 GUI 軟體顯示不正常的狀況。
