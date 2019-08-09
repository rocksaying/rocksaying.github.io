---
title: Raspberry Pi OverlayFS 檔案系統使用備忘錄
tags: ["raspberry pi",rpi,overlay]
category: computer
lastupdated: 2019-08-09
---

Raspberry Pi 在 IoT 方案中，通常都不接鍵盤與螢幕，也沒有設計電源開關。
所以很多時候， IoT 現場的使用者會把 RPi 設備當成是 Arduino 這類微控制器設備，認為出現狀況時直接關掉設備的電源再打開就好。
就算不是使用者有意為之，在 IoT 現場也很可能遇到電源中斷的意外。

但是 RPi 的工作方式實際上更偏向一般 PC ，故與一般 PC 相似，將直接關掉電源的事視為不正常關機動作。
這種斷電方式可能打斷正將資料寫入檔案系統的工作，造成 SD 記憶卡的檔案系統內容毀損。
因此， RPi 運用在 IoT 方案時，需要設置檔案系統的保護機制。至少要保證它被直接斷電後，檔案系統也不會毀損。

當 RPi 運作 Raspbian 時，可以啟用 *OverlayFS* 作為檔案系統的保護機制。

<!--more-->

*OverlayFS* 自 Linux Kernel 3.18 版本起就被納入核心中。因此 Raspbian GNU/Linux 9.9 (stretch) 已經內建這個檔案系統模組。我們不必更改核心內容，只需要設定檔案系統的掛載表即可。
詳細的設定方式，可以參考以下兩篇專門針對 RPi 的文章:

* [使用overlayfs打造一个只读的不怕意外关机的树莓派Raspberry Pi](https://blog.csdn.net/zhufu86/article/details/78906046)
  本文將 overlayFS 的組織工作放在 init 階段。
* [Setting up overlayFS on Raspberry Pi](https://www.domoticz.com/wiki/Setting_up_overlayFS_on_Raspberry_Pi)
  本文將 overlayFS 的組織工作放在 systemd 階段。

#### 取消 swap 空間

```term
sudo dphys-swapfile swapoff
sudo dphys-swapfile uninstall
sudo update-rc.d dphys-swapfile disable
```

#### 保暫系統時間

```term
sudo systemctl stop fake-hwclock.service
sudo mv /etc/fake-hwclock.data /var/log/fake-hwclock.data
sudo ln -s /var/log/fake-hwclock.data /etc/fake-hwclock.data
```

##### 參考文件

* [overlayfs 練習： 小改光碟 iso 檔， 何必大手筆複製？ ](https://newtoypia.blogspot.com/2018/04/overlayfs.html)
* [把玩overlay文件系统 ](http://blog.lucode.net/linux/play-with-overlayfs.html)
* [Overlay filesystem - ArchWiki](https://wiki.archlinux.org/index.php/Overlay_filesystem)
