---
title: KDE4 關閉 nepomuk, akonadi 與 baloo 服務.
category: computer
tags: [kde,debian]
---

## Disable nepomukserver

kde desktop requires nepomuk-core-data package, you could not remove this package.
but you can remove nepomuk-core-runtime.
after you remove nepomuk-core-runtime, there is no executable nepomuk file.
no nepomuk services will be started.

## Disable akonadi

kde desktop requires akonadi-server and kdepim-runtime packages. 
you could not disable akonadi via removing packages.
you must edit configuration file to disable akonadi.

Open ~/.config/akonadi/akonadiserverrc.
search QMYSQL block and change StartServer to false.

```text
[QMYSQL]
Name=akonadi
.
.
.
StartServer=false
```

Open System Settings -> Personal Information (系統設定 -> 個人資訊)。
remove any akonadi subsystem that you don't need.

https://userbase.kde.org/Akonadi/zh-tw
http://pclinuxos2007.blogspot.tw/2013/01/improve-kde4-performance-disable.html

## Baloo

remove packages: baloo4 baloo-utils kde-config-baloo-advanced

https://community.kde.org/Baloo/Configuration

In dolphin (file manager of KDE), when you press Ctrl+F and type keyword in the search line, you will get 'invalid protocol' error.
Because search feature of dolphin needs baloo.

However if you only want to find files by name in current folder in dolphin. The fastest way is using Filter (Ctrl+i).

Enable baloo:

baloo need start akonaki server and enable Akonadi Baloo Indexing Agent subsystem.

