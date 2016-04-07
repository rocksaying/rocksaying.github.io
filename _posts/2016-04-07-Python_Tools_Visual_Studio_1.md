---
title: Python Tools for Visual Studio 初步
category: programming
tags: ["python","visual studio","ptvs"]
---

Python Tools for Visual Studio (PTVS) 是一個銜接 Visual Studio 和 Python 解譯器的工具。現在是 Visual Studio 2015 安裝時的可選用內容。

注意，當你安裝 Visual Studio Community 和 PTVS 時， Visual Studio Community 安裝工具並不會一併幫你安裝 Python 解譯器，你得要自己下載 Windows 版的 Python 解譯器。推薦使用 [CPython for Windows](https://www.python.org/downloads/windows/) 。你可以選擇 Python2 或 Python3 。如果你打算用 Python 撰寫檔案處理小工具的話，我建議選擇安裝 Python3 ，它解決了 Unicode 檔名的處理問題。

Python 解譯器與 Visual Studio Community 的安裝順序並不重要。誰先裝都行。

#### 如何開始使用 PTVS ?

在你啟動 Visual Studio Community 後，選擇建立新專案，專案類型為 Python 。接著 Visual Studio 就會帶入 PTVS 並自動偵測你安裝的 Python 解譯器環境。如果你還沒有安裝 Python 解譯器，你仍然可以建立 Python 專案與撰寫程式。但執行時會提示你尚未安裝解譯器故無法執行。

PTVS 會為每個 Python 專案維持一個獨立的 python 虛擬環境。所以你可以安裝多種不同版本的 Python 解譯器，而 PTVS 可以讓你在 Python 專案中指定此專案要使用哪個版本的解譯器與虛擬環境，也可以在此專案中加裝 python 模組 (使用 pip)。專案執行時的環境與額外加裝的模組資源各自獨立，不會彼此干擾。

在 Visual Studio IDE 右側的資訊面板中，可在「Solution Explorer」頁面調整現行專案的虛擬環境設定。

#### 如何增加 Python 模組?

Python 使用者熟悉的 Python 模組 (python module)，在 PTVS 中稱為 Python 套件 (python package)。 Python 模組擴展了 Python 語言的應用範圍， PTVS 自然也必須認得這些模組。

在 Windows 下，可選擇下列三種基本途徑之一以增加 Python 模組。 PTVS 啟動時會自動偵測。

##### 1. 自 [Python Package Index](https://pypi.python.org/) (PyPI) 下載個別模組的 Windows 安裝器。

例如 pyserial 便提供了 Windows 安裝器。但並不是每個模組都有 Windows 安裝器。一些純 Python 語言撰寫的模組，則可以下載源碼壓縮檔。解開壓縮檔後再手動複製內容到 Python 解譯器的安裝目錄。

比較麻煩的是需要執行 setup.py 並調用 C 編譯器的模組。「[解決使用 PTVS 時編譯套件的問題]([https://blogs.msdn.microsoft.com/ericsk/2015/08/23/python-tools-for-visual-studio/)」提供了一些此類模組的安裝經驗。

##### 2. 利用 pip 。

pip 是管理與安裝來自 PyPI 之模組的工具。在 Visual Studio IDE 執行 pip 的途徑是展開 Python 專案面板的 Python Environments 項目。接著在次項目 env 上按滑鼠右鍵叫出選單就會看到 Instrall Python Package 選項。此選項會調用 pip 。

##### 3. 安裝完整 Python 散佈版本。

例如 [ActivePython](http://www.activestate.com/activepython)。這些散佈版本包含 Python 解譯器和許多模組，通常還自帶模組管理工具。可以省去自己下載與安裝各個模組的時間。

###### 參考文件

* [Visual Studio Community 2015](https://www.visualstudio.com/products/visual-studio-community-vs)
* [Visual Studio 2015 - 開始使用 Python](https://msdn.microsoft.com/zh-tw/library/dn705848.aspx)
* [PTVS Installation](https://github.com/Microsoft/PTVS/wiki/PTVS-Installation)
* [Python Releases for Windows](https://www.python.org/downloads/windows/)
