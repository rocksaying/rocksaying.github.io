---
title: NodeMCU http recursive 遞回呼叫範例
category: programming
tags: [nodemcu,lua,http]
lastupdated: 2019-07-12
cover: https://www.nodemcu.com/images/thumbnail/c1s.jpg_450x300.jpg
---

NodeMCU 的 [http](https://nodemcu.readthedocs.io/en/master/modules/http/) 模組可用於存取一般 HTTP 資源，或是呼叫 RESTful API 。
然而， NodeMCU lua 環境的基本程式設計模型是事件驅動模式。
故 http 模組提供的方法也是非同步方法 (async method)。
但它還有一個限制，它一次只能發出一個請求，不允許併發作業。

<blockquote>
It is not possible to execute concurrent HTTP requests using this module.

<cite>NodeMCU Documentation</cite>
</blockquote>

因此，如果你的控制器需要向 HTTP 伺服器發出多個請求的話，就需要利用一些技巧，例如遞回呼叫，讓你的 HTTP 請求可以一個個地依次發出。
其實就是將非同步方法同步化。

<!--more-->

本範例的情境設定是：

1. 這塊 NodeMCU 控制板連接多組感測器。所以它一次會回傳多種感測資料。
2. 負責接收資料的 HTTP 服務端，提供一個 HTTP 表單 POST API 。這表單一次只能上傳一種感測資料，格式是 `id=???&value=???` 。

由於接端的 HTTP 表單 API 一次只能上傳一種感測資料，而我有多種資料要上傳，直覺上我們想就多呼叫幾次吧。
寫出下列程式:

```lua

function http_callback(code, data)
    print(code)
end

http.post(HTTP_SEND_URL, HTTP_TYPE, "id=sensor1&value=" .. value1, http_callback)
http.post(HTTP_SEND_URL, HTTP_TYPE, "id=sensor2&value=" .. value2, http_callback)
http.post(HTTP_SEND_URL, HTTP_TYPE, "id=sensor3&value=" .. value3, http_callback)

```

抱歉，這是錯的。

記住， http 模組提供的是非同步方法，但又一次只能發出一個請求。
上述寫法的第二個 `http.post()` 請求不會等待第一個結束請求就發出。第三個也是。
於是這連續三個請求將併行發出，產生錯誤。

我將改用遞回呼叫方式，確保我的程式是在上一個 HTTP 請求結束才發出下一個請求。

我的程式碼範例是放在主程式跑的。

外圈參考這一篇 [NoduMCU timer 範例]({% post_url 2019-07-09-NodeMCU timer 鬧鐘計時器範例 %}) 用了 [tmr](https://nodemcu.readthedocs.io/en/master/modules/tmr/) 模組處理定時工作。

內圈則先收集各感測器的資料，存入字典 `logs` 。
然後在我要呼叫 `http.post()` 回傳資料之前，先把 `logs` 轉成陣列 `vals` ，並取得陣列計數 `idx` 。

`idx` 將作為遞回呼叫的終點旗標。當 `idx` 為 1 時，就表示所有資料皆己上傳，停止遞回。

```lua

local interval = 30

local HTTP_SEND_URL = 'http://192.168.1.23/logform/post'
local HTTP_TYPE = 'Content-Type: application/x-www-form-urlencoded\r\n'

local timer = tmr.create()
timer:register(interval * 1000, tmr.ALARM_AUTO, function () 
    local logs = {}

    -- read logs from some sensors...
    -- for example:
    -- logs["sensor_id"] = value
    logs["sensor1"] = 11
    logs["sensor2"] = 22
    logs["sensor3"] = 33
    
    local my_ip = wifi.sta.getip()
    if my_ip then
        local key, value
        local vals = {}
        local idx = 1

        for key,value in pairs(logs) do
            vals[idx] = "id="..key.."&val="..value
            idx = idx + 1
        end

        function http_send()
            idx = idx - 1
            http.post(HTTP_SEND_URL, 
                    HTTP_TYPE,
                    vals[idx],
                    function(code, data)
                        print(vals[idx])
                        if (code < 0) then
                            print("HTTP request failed")
                        else
                            print(code, data)
                            if idx <= 1 then
                                -- 沒有待送內容，結束遞回
                                return
                            end
                            -- 呼叫自己，送出下一個請求
                            http_send()
                        end
                    end
            )
        end
        http_send()

    end -- my_ip
end)
timer:start()

```

###### 參考資源

* [NoduMCU timer 範例]({% post_url 2019-07-09-NodeMCU timer 鬧鐘計時器範例 %}) 
* [http - ModeMCU](https://nodemcu.readthedocs.io/en/master/modules/http/) 
