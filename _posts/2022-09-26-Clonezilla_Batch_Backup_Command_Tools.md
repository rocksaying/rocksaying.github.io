---
title: 使用 CloneZilla 指令列工具批次生產相同配置的業務用磁碟
category: computer
tags: [clonezilla,fdisk,tune2fs,uuid]
lastupdated: 2022-09-26
---

標題說的業務用磁碟是指多顆具有相同分割區配置，安裝 Linux 作業系統和客戶業務軟體，用在大量裝機場合的磁碟。
此外，本文情境還將面臨分批採購、後續替換等狀況，故使用的磁碟會是不同型號、不同品牌、甚至標示容量也不相同。

CloneZilla 的磁碟對拷功能雖然可以直接複製分割區配置，但那僅限兩顆磁碟實際容量一致或目的磁碟容量較大的情形。
不適用本文所說的多顆磁碟不相同的情形。
所以本文使用的指令操作，著重在以分割區為單位之複製工作，才能適應本文情境。

<div class="note">
為了能複製到不同容量的磁碟，本文情境的分割區配置並不會用滿整顆磁碟的容量。
實務上可能只配置 30GB 左右，以便複製到 32GB 或更大容量的磁碟。
因此適合使用於 eMMC, CF卡, USB隨身碟, SSD 這一類的儲存媒體。
</div>

<!--more-->

說到批次生產，使用指令列工具還是比較方便。
[CloneZilla Live](https://clonezilla.nchc.org.tw/) 已經包含下列指令列工具，進入指令列模式後可用。
Linux 散佈套件的基礎安裝工具中也會包含這些 (除了 ocs-onthefly 和 ocs-sr)。

* fdisk
* parted
* sfdisk
* sgdisk - 專用於 GPT 磁碟的工具。
* tune2fs
* uuidgen - 可以隨機產生一個 UUID 。
* ocs-onthefly - Clonezilla 工具。
* ocs-sr - Clonezilla 工具。

<div class="note">
本文所有指令，都需要 sudo 。只是指令範例省略不寫。
</div>
