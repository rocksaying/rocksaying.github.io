---
title: Raspberry Pi OverlayFS 檔案系統使用備忘錄
tags: ["raspberry pi",rpi,overlay]
category: computer
lastupdated: 2019-08-23
---

Raspberry Pi 在 IoT 方案中，通常都不接鍵盤與螢幕，也沒有設計電源開關。
所以很多時候， IoT 現場的使用者會把 RPi 設備當成是 Arduino 這類微控制器設備，認為出現狀況時直接關掉設備的電源再打開就好。
就算不是使用者有意為之，在 IoT 現場也很可能遇到電源中斷的意外。

但是 RPi 的工作方式實際上更偏向一般 PC ，故與一般 PC 相似，將直接關掉電源的事視為不正常關機動作。
這種斷電方式可能打斷正將資料寫入檔案系統的工作，造成 SD 記憶卡的檔案系統內容毀損。
因此 RPi 運用在 IoT 方案時，需要設置檔案系統的保護機制。至少要保證它被直接斷電後，檔案系統也不會毀損。

當 RPi 運作 Raspbian 時，可以啟用 *OverlayFS* 作為檔案系統的保護機制。

<!--more-->

*OverlayFS* 自 Linux Kernel 3.18 版本起就被納入核心中。因此 Raspbian GNU/Linux 9.9 (stretch) 已經內建這個檔案系統模組。
我們不必更改核心內容，只需要設定檔案系統的掛載表即可。
詳細的設定方式，可以參考以下兩篇專門針對 RPi 的文章:

* 「[使用overlayfs打造一个只读的不怕意外关机的树莓派Raspberry Pi](https://blog.csdn.net/zhufu86/article/details/78906046)」
  本文將 overlayFS 的組織工作放在 init 階段。
* 「[Setting up overlayFS on Raspberry Pi](https://www.domoticz.com/wiki/Setting_up_overlayFS_on_Raspberry_Pi)」
  本文將 overlayFS 的組織工作放在 systemd 階段。

#### 檔案系統規劃

使用 OverlayFS 機制前，建議將 SD 記憶卡規劃出至少三個空間。即:

* root
  這將置於 OverlayFS 保護之下。
* /boot
  可單純地設為 read-only 。
* /var/log
  可保存資料的空間。如果你完全都不考慮看 log 的需求，也可以不劃出這一塊。

使用 Raspbian 官方影像檔或是透過 noobs 安裝的 SD 卡，應該都會有 boot 和 root 兩區。
至於 data 或 /var/log 區，就請拿出 gparted 這類分割區編輯工具，自己拉出來吧。

最後在 /etc/fstab 中加上 /var/log 的掛載動作。

#### 取消 swap 空間

其實不論用不用 OverlayFS ，我都習慣取消 swap 空間。

```term
sudo dphys-swapfile swapoff
sudo dphys-swapfile uninstall
sudo update-rc.d dphys-swapfile disable
```

#### 保存系統時間

RPi 沒有內建電池維持系統時刻。它一方面仰賴 NTP 網路校時，另一方面又將最近的時刻保存在 /etc/fake-hwclock.data 。
利用 fake-hwclock 服務可在網路校時之前就回復系統時刻到上次關機的時刻。 

fake-hwclock 每一小時儲存目前時刻。正常執行 shutdown 或 reboot 時也會儲存時刻。

若是你的 RPi 運作在不連接網路的環境下，斷電一段時間重啟後，就會發現 RPi 顯示的系統時刻又慢了。道理就在這。

將 root 檔案系統置於 OverlayFS 保護之後，/etc/fake-hwclock.data 就不能保存時刻了。
故建議透過符號連結的方式，將 /etc/fake-hwclock.data 指向可寫入資料的檔案系統下，例如 /var/log 。

```term
sudo systemctl stop fake-hwclock.service
sudo mv /etc/fake-hwclock.data /var/log/fake-hwclock.data
sudo ln -s /var/log/fake-hwclock.data /etc/fake-hwclock.data
```

然後在 rc.local 中加入一行:

```bash
/sbin/fake-hwclock load force
```

這是因為 fake-hwclock.service 的執行時機比資料區掛載到 /var/log 的時機還早，造成 fake-hwclock 讀不到上次儲存的時刻資料。
因此在 rc.local 中要求 fake-hwclock 再讀一次上次儲存的時刻資料。

##### 參考文件

* [overlayfs 練習： 小改光碟 iso 檔， 何必大手筆複製？](https://newtoypia.blogspot.com/2018/04/overlayfs.html)
* [把玩overlay文件系统](http://blog.lucode.net/linux/play-with-overlayfs.html)
* [Overlay filesystem - ArchWiki](https://wiki.archlinux.org/index.php/Overlay_filesystem)
