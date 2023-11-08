---
title: Debian 12 的 python pip 管理政策變化
category: computer
tags: [debian,pip,venv]
lastupdated: 2023-11-08
---

Debian 12 不再允許直接使用 pip 安裝套件。
就算是 root 也不行。
我還回頭測了 Debian 11，並沒有這項限制。

政策變化內容
------------

看看 pip3 install 的錯誤訊息:

```term
$ pip3 install pycryptodome
error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to
    install.
    
    If you wish to install a non-Debian-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip. Make
    sure you have python3-full installed.
```

<!--more-->

這個訊息說的很明白了。
Debian 現在的政策是以官方套件庫的套件優先。
不開放直接用 pip 自裝套件。
Debian 現在強制你一定要在 python 虛擬環境  (virtual environment) 才能用 pip 安裝套件。
你想要自裝套件，就必須建立虛擬環境。

所以官方套件中的 python 程式的 shebang 也一律直接 `#!/usr/bin/python3`，
而不是 `#!/usr/bin/env python3`。
反正 shebang 不適用 python 虛擬環境，何必脫褲子放屁。

若想和以前一樣在個人環境用 pip 安裝套件，又不想要多一個 *activate* 步驟，提供一招偷吃步的做法。
就是在 *$HOME/.local* 建一個 python 虛擬環境。
這個路徑在 python 的 lib 尋找規則內，所以不掛 activate 也能用。

<div class="note">
python 的 lib 尋找規則和 PATH 環境變數有關。
import 會找 PATH 清單中每一筆的 ../lib。
當 PATH 包含 ~/.local/bin 時，那 import 也會找 ~/.local/bin/../lib (就是 ~/.local/lib)。
</div>

試試:

```term
$ python3 -m env ~/.local

$ pip3 install pycryptodome
Successfully installed pycryptodome

$ /usr/bin/python3
>>> import Crypto
>>>
```

上述動作在 ~/.local 建立虛擬環境並安裝套件 pycryptodome。
套件檔案會下載放在 ~/.local/lib 底下。

基本上，虛擬環境要先 *activate*，這樣 python3 的 *import* 才可以找到套件。
但是 ~/.local/bin 剛好也在使用者的 PATH 環境變數清單之中，
按 python 尋找 lib 的規則，自動就將 ~/.local/lib 納入了。
所以就算不跑 *activate*， /usr/bin/python3 一樣會往 ~/.local/lib 找套件。
你的程式 shebang 用 `#!/usr/bin/python3` 就行了。

影響shebang使用
---------------

在 Linux 下用直譯式語言寫程式，如 shell script, perl, python，
習慣會在第一行用 `#!path_to` 指示用哪個直譯器跑程式。
這個術語叫 [shebang](https://zh.wikipedia.org/zh-tw/Shebang)。

這個特性方便撰寫者散佈程式檔案給一般使用者。
拿到程式檔案的使用者，不必知道用哪個直譯器，直接就能執行它 (別忘了賦予執行屬性)。
操作上如同 binary 執行檔。

有一段時間，Linux 散佈套件的 shebang 會用 /usr/bin/env 間接呼叫直譯器。
python 程式最常見，像這樣: `#!/usr/bin/env python3`。
這個指令的意思是，從環境變數 PATH 清單能找到的 python3 直譯器中，挑出排在 PATH 最前面的那個來用。

不過 Debian 12 改變套件政策，所以 python3 程式的 shebang 不再有必要用 env ，
回歸到直接指定 /usr/bin/python3。

需要透過 env 找 python3 的情形，現在要配合 python 虛擬環境。
然而想讓 python 虛擬環境生效，需要先跑 activate。
你能想像把 python 程式交付給顧客，然後對他說跑程式之前要先跑 activate 的事嗎？
不可能吧。那就要多寫一個 shell script 去啟動程式。

假設 my-program.py 寫了 shebang: `#!/usr/bin/env python3`。
那要寫一個 shell script 如下:

```shell
#!/bin/sh
BINDIR=~/myvenv/bin

source $BINDIR/activate

~/my-program.py
```

嗯。我個人覺得這樣 python 程式就用不到 shebang 的好處了。
既然要多寫一個 shell script 包 activate，而 activate 又會將 ~/myvenv/bin 加入 PATH 環境變數，
那我在 script 最後一行直接寫 `python3 ~/my-program.py` 就好。
若 python 程式要在虛擬環境下跑，其實沒必要加 shebang。
