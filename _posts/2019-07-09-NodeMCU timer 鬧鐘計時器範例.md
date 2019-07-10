---
title: NodeMCU timer 鬧鐘計時器範例
category: programming
tags: [nodemcu,lua]
lastupdated: 2019-07-09
cover: https://www.nodemcu.com/images/thumbnail/c1s.jpg_450x300.jpg
---

Arduino 的程式碼中，呼叫 `delay()` 方法延時是典型作法。而在網路上也可以找到不少照搬 Arduino 習慣，使用 `tmr.delay()` 的 NodeMCU lua 程式範例。**但請不要抄**。 NodeMCU 不建議使用這個方式延時。

<blockquote>
<p>
This is in general a <em>bad</em> idea, because nothing else gets to run, and the networking stack (and other things) can fall over as a result. The only time tmr.delay() may be appropriate to use is if dealing with a peripheral device which needs a (very) brief delay between commands, or similar.
</p>
<cite>NodeMCU Documentation</cite>
</blockquote>

NodeMCU lua 環境的基本程式設計模型是事件驅動模式。但 `tmr.delay()` 會破壞這個工作模式。程式設計者應該用 tmr 模組的計時器功能取代。

<!--more-->

我的使用經驗是 lua 環境在 `tmr.delay()` 延遲期間不接受其他命令。如果你把這個延遲動作放在無窮迴圈中，那麼在它運行時，你沒有機會上傳或更新 lua 程式文件。你只能刷韌體清除 lua 文件區內容後，才能放上新的程式。如果每次都要刷韌體才能放新程式，那還不如當成  Arduino 相容控制板來用。

解釋 `tmr.delay()` 的缺點後，回到正題說 NodeMCU 的計時器模組: [tmr](https://nodemcu.readthedocs.io/en/master/modules/tmr/)。

tmr 模組提供三種鬧鐘計時器:

* tmr.ALARM_SINGLE - 一次性鬧鐘。呼叫 `start()` 之後，只會叫醒一次。叫醒後，這個鬧鐘就會註消。
* tmr.ALARM_SEMI - 手動反復鬧鐘。每次叫醒後，你都要自己再找個時機呼叫 `start()` 方法，才能讓這個鬧鐘再次計時。和 ALARM_SINGLE 的差別是你不用再註冊新鬧鐘。
* tmr.ALARM_AUTO - 自動反復鬧鐘。每次叫醒後，就自動回復計時。

通常，我在 init.lua 中就會用上兩種計時器了。一個自動反復鬧鐘，負責固定秒數閃爍一次 LED 燈號。另一個則是只做一次的計時器，負責在 NodeMCU 通電後等待幾秒，才開始執行這個控制板真正要跑的程式功能。

我讓 NodeMCU 等待幾秒才開始做正事的理由，是為了在這個空檔可以上傳或更新程式碼。

#### 定時閃爍 LED 

```lua

-- D0 is the LED on the NodeMCU board
local lpin = 0
-- timer to run every 5 seconds
local mytimer = tmr.create()
mytimer:register(5000, tmr.ALARM_AUTO, function() 
    -- Turn on the LED
    gpio.write(lpin, gpio.LOW)
    -- Keep it on for 0.3 secnod
    tmr.delay(300000)
    gpio.write(lpin, gpio.HIGH)
end)
mytimer:start()

```

#### 啟動後延遲載入主程式

```lua

local startup_timer = tmr.create()
startup_timer:register(15000, tmr.ALARM_SINGLE, function() 
    dofile("main.lua")
end)
startup_timer:start()
print("startup main program after 15 seconds.")

```
