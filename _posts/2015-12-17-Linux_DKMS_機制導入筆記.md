---
title: Linux DKMS 機制導入筆記
category: computer
tags: linux,debian,driver,dkms
---

公司基於 Debian/Ubuntu 的資訊產品裝配了幾個特殊配件，它們需要安裝驅動程式 (kernel module) 才能使用。原廠提供了驅動程式的源碼給我們，但並不是 deb/rpm 這類的套件。我原本用自己寫的工具 [make-package](https://github.com/shirock/rocksources/tree/master/linux/make-package) 將原廠提供的特殊配件驅動程式源碼打包成 deb 套件。但公司的產品維護人員又反應一件事：有時執行系統套件更新之後，驅動程式就不見了或載入失敗。

仔細一查，原來出問題的套件更新內容包含了 Linux 核心升級。核心版本一升級，驅動程式就不匹配了，必須重新編譯。雖然安裝套件時已經把驅動程式源碼放在產品的檔案系統中，但要產品維護人員到源碼目錄一一編譯各配件的驅動程式，實在做不到。對產品維護人員來說，最簡單的標準操作流程就是重新安裝這些配件的驅動程式套件。就算如此還是很麻煩。因為產品維護人員並不會每次更新內容後都去檢查有無更新 Linux 核心。需要更自動化的驅動程式管理機制。所以我決定將 DKMS 機制導入我的驅動程式打包工作。

<!--more-->

[DKMS](http://linux.dell.com/dkms/manpage.html) 全名為 Dynamic Kernel Module Support ，是由 Dell 所貢獻的一套 Linux 驅動程式安裝管理機制。它提供一組統一的驅動程式管理方式，讓使用者不需要在檔案系統中找尋驅動程式源碼與編譯。更可於載入 Linux kernel 時自動檢查需不需要為此 kernel 編譯驅動程式(<span class="Onote">需要 dkms_autoinstaller </span>)。

#### dkms.conf

將驅動程式源碼導入 DKMS 的第一件工作，就是在源碼根目錄中增加一份 dkms.conf 文件。 dkms.conf 的設置內容請參考 [DKMS Manpage](http://linux.dell.com/dkms/manpage.html) 。編寫 dkms.conf 的注意事項如下:

* dkms.conf 指令一定要全部大寫。
* 如果驅動程式源碼會產生多個模組檔案(.ko)，那麼操作指令要用編號分開寫，而且編號要對應。
* dkms 的所有指令，執行時的工作目錄都是源碼根目錄，採用相對路徑表示。
* 驅動程式源碼雖然放在 /usr/src ，但 dkms 操作時會複製一份副本到 /var/lib/dkms 並使用該副本編譯。所以調用外部程式的場合，不應使用絕對路徑。

dkms.conf 的設置指令很多，但必要與常用的只有 8 種。以下一一說明。

若要打包成 deb 套件，<dfn>Depends</dfn> 一欄要加入 "dkms" 。

##### PACKAGE_NAME

必要。通常是套件名稱或驅動程式代碼。

##### PACKAGE_VERSION

必要。驅動程式版本號碼。

##### BUILT_MODULE_NAME[#]

必要。驅動程式的模組名稱 (不包含 .ko 副檔名)。

如果驅動程式只有一個模組檔案，那寫成 <code>BUILT_MODULE_NAME=???</code> 即可，不必加編號。如果有兩個以上的模組檔案，就要加上編號，例如:

```text
BUILT_MODULE_NAME[0]="module1"
BUILT_MODULE_NAME[1]="module2"
.
.以下類推
```

這個編號要繼續使用在接下來的指令上，不可以亂跳。例如 <code>BUILT_MODULE_NAME[0]="module1"</code> ，那麼接下來的 BUILT_MODULE_LOCATION[0], MAKE[0] 都會是針對 module1.ko 的操作指令。

##### BUILT_MODULE_LOCATION[#]

編譯成功的模組檔案(.ko)所在目錄。通常是 "src/" 。但有些不是放在這目錄，自己看。注意，要用相對路徑表示。

##### DEST_MODULE_LOCATION[#]

模組檔案要放置的目的目錄。這是必要指令，但目的目錄可一律寫 "/updates/dkms" 。

我懷疑這個指令有 bug 。不論我填 "/kernel", "/extra" 或其他目錄，它實際上都複製到 "/updates/dkms" ，無視設定。

##### MAKE[#]

編譯模組檔案的外部指令。 dkms 會透過 shell 執行此處填寫的內容，若編譯動作要依序執行好幾道指令，請用分號(;)分開。例如:

```text
MAKE="./configure; make -C src"
```

實際的編譯動作，請看你的驅動程式的安裝文件。各家不同。

##### CLEAN

清除編譯過程產生的檔案(包含 .ko)的外部指令。它會清除源碼目錄下的全部模組檔案，不分編號。例如:

```text
CLEAN="make -C src clean"
```

實際的清除動作，請看你的驅動程式的安裝說明文件。各家不同。

##### AUTOINSTALL

這個指令可以省略。會寫出這個指令的人，通常會寫 "yes" 。這指示 dkms_autoinstaller 於系統啟動時檢查是否因為有新的 kernel 而需要編譯驅動程式。

DKMS Manpage 此處有一點沒有說清楚。要讓 AUTOINSTALL 生效，必須在你的系統的 init.d 中加入 *dkms_autoinstaller* 設置。在公司安裝的 Ubuntu 或我自己使用的 Debian 系統上，預設都不會在 init.d 中加入 dkms_autoinstaller 。

以 Debian 8 為例， dkms_autoinstaller 被安裝在 /usr/lib/dkms 目錄。我得要自己用 update-rc.d 指令把它加入 init.d 。

#### 驅動程式導入實例

本節以廠商實際提供的驅動程式源碼為例，說明該廠商的驅動程式基本安裝步驟。再把這些內容記入 dkms.conf 中。

##### 基本編譯工作

設備廠商 ARH 提供的驅動程式源碼版本為 7.2.10 。按照 Linux 管理慣例與 DKMS 要求，將驅動程式源碼解開後放在 /usr/src/arh-7.2.10 。

驅動程式源碼包含三個模組 gxsd, clrdrv, prddrv ，編譯時必須按照這個順序編。這三個模組的源碼分別放在子目錄 kernel/gxsd, kernel/clrdrv, kernel/prddrv 。

按隨付文件說明，編譯時只需要執行下列三步驟:

```term
cd kernel/gxsd
make
cd ../../kernel/clrdrv
make
cd ../../kernel/prddrv
make
```

但廠商提供的 Makefile 寫的不太好，我實際操作時得要修改 Makefile 一些內容才行。所以我另外寫了一個 build.sh 整理這些工作。如下:

```text
#!/bin/sh

# fix Makefile
ARCH=`uname -m`
if [ $ARCH != "x86_64" ]; then
    ARCH=i386
    LIB=lib32
else
    LIB=lib64
fi

WRITEFILES="\
  kernel/gxsd/Makefile \
  kernel/clrdrv/Makefile \
  kernel/prddrv/Makefile"

for WRITEFILE in $WRITEFILES ; do
    echo -n "writting $WRITEFILE ... "
    cat ${WRITEFILE}.in \
        | sed "s,\$(shell uname -i),$ARCH,g" \
        > ${WRITEFILE}
    if [ $? -ne 0 ]; then
        echo "[no]"
        echo "Write ${WRITEFILE} failure."
        exit 1
    else
        echo "[yes]"
    fi
done

# build
BUILDDIRS="\
    kernel/gxsd \
    kernel/clrdrv \
    kernel/prddrv"

SRC_ROOT_DIR=$PWD

for BUILDDIR in $BUILDDIRS ; do
    echo -n "building $BUILDDIR ... "
    cd $BUILDDIR
    make > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "[no]"
        echo "Build ${BUILDDIR} failure."
        exit 1
    else
        echo "[yes]"
    fi
    cd $SRC_ROOT_DIR
done
```

編譯好的模組檔案，分別放在各自的源碼子目錄下，即 kernel/gxsd/gxsd.ko, kernel/clrdrv/clrdrv.ko, kernel/prddrv/prddrv.ko 。

清除編譯檔案的方式，則是執行各目錄的 make clean 。

##### 編寫本例的 dkms.conf

確認上節的操作步驟可以成功編譯驅動程式各模組檔案後，我現在可以根據上節資訊，編寫此驅動程式需要的 dkms.conf 了。再強調一次，這個 dkms.conf 要放在驅動程式源碼的根目錄下。

```text
PACKAGE_NAME="arh-kernel-modules"
PACKAGE_VERSION="7.2.10"
AUTOINSTALL="yes"

BUILT_MODULE_NAME[0]="gxsd"
BUILT_MODULE_LOCATION[0]="kernel/gxsd/"
DEST_MODULE_LOCATION[0]="/updates/dkms"
MAKE[0]="sh build.sh"

BUILT_MODULE_NAME[1]="clrdrv"
BUILT_MODULE_LOCATION[1]="kernel/clrdrv/"
DEST_MODULE_LOCATION[1]="/updates/dkms"
MAKE[1]="echo nothing"

BUILT_MODULE_NAME[2]="prddrv"
BUILT_MODULE_LOCATION[2]="kernel/prddrv/"
DEST_MODULE_LOCATION[2]="/updates/dkms"
MAKE[2]="echo nothing"

CLEAN="make -C kernel/gxsd; make -C kernel/clrdrv; make -C kernel/prddrv"
```

PACKAGE_NAME 和 PACKAGE_VERSION 自行決定。其中 PACKAGE_NAME 不一定等於 dkms 工具需要的 <var>module</var> 參數之名稱。下節的 dkms 指令會提到 <var>module</var> 參數。

因為有三個模組檔案，所以 BUILT_MODULE_NAME 和相關指令要加上編號，分別是 0,1,2 。至於 MAKE 指令的內容，因為 build.sh 一次編譯三個模組檔案，所以第 1 號和第 2 號的 MAKE 指令都不做事。

##### dkms 操作

編寫 dkms.conf 後，我需要執行 `dkms add` 將這個驅動程式加入 DKMS 管理表中。 <dfn>dkms</dfn> 命令工具的大部份操作，都需要代表名稱的 <var>module</var> 與代表版本號碼的 <var>module-version</var> 參數。這兩個參數的內容必須對應驅動程式源碼在 /usr/src 下的目錄名稱。在本例中，驅動程式源碼放在 /usr/src/arh-7.2.10 ，所以 dkms 需要的 <var>module</var> 和 <var>module-version</var> 分別是 "arh" 和 "7.2.10" 。實際操作如下:

```term
sudo dkms add -m arh -v 7.2.10
```

加入成功後，我就可以執行 `dkms build` 或 `dkms install` 檢查我的 dkms.conf 是否正確。如下:

```term
sudo dkms build -m arh -v 7.2.10
sudo dkms install -m arh -v 7.2.10
```

如果 dkms.conf 內容無誤，那麼 install 之後，就可以在 "/lib/modules/Kernel版本號碼/updates/dkms" 目錄下找到剛剛編譯的 gxsd.ko, clrdrv.ko, prddrv.ko 。

接下來就是用 modprobe 工具或者編輯 /etc/modules 載入這三個模組。這部份就不解釋了。

如果我想要完整移除整個驅動程式模組，就執行 `dkms remove` 。如下:

```term
sudo dkms remove -m arh -v 7.2.10
```

在此可以看出 DKMS 機制的好處。只要驅動程式的安裝動作導入 DKMS 機制，那麼系統維護人員統一操作 `dkms install -m 名稱 -v 版本` 就可以編譯各個驅動程式，方便作業自動化。

#### 關於 dkms_autoinstaller

如果你的系統沒有把 dkms_autoinstaller 加入 init.d 的話， DKMS 不會在系統啟動時檢查是否需要重新編譯驅動程式。此時你有兩個選擇。

其一，把 dkms_autoinstaller 加入 init.d 。以 Debian 8 為例，首先要把 /usr/lib/dkms/dkms_autoinstaller 複製到 /etc/init.d 下。然後執行 `update-rc.d dkms_autoinstaller defautls" 啟用它 (在 "/etc/rc?.d" 下建立連結)。

其二，在 /etc/rc.local 中加入 dkms install 的指令。請放心，如果驅動程式已經安裝了， dkms install 就不會做任何事。你不必擔心加入這行會拉長系統啟動的時間。

說起來，VirtualBox ghost modules 在不啟用 dkms_autoinstaller 時，也會自動隨 Linux 核心升級而編譯驅動程式。我還不明白它的作法。

###### 相關文章

* [DKMS Manpage](http://linux.dell.com/dkms/manpage.html)
* [Ubuntu Community Help Wiki - DKMS](https://help.ubuntu.com/community/DKMS)
