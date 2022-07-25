---
title: .NET 筆記 - 用C#反射載入純文字Config組態檔
category: programming
tags: [".net","C#",csharp,reflection]
lastupdated: 2022-07-25
---

**本文內容以 .NET Core 3 / .NET 5 或更新版本為目標平台。我不用 .NET Framework ，不保證適用。**

設計程式時，對於具有常數性質的內容，我們通常允許從外部檔案載入其值。
而使用者也可以藉由編輯外部檔案，在不修改程式碼的情況下改變程式工作方式。
這種外部檔案，我們通常稱為「設定檔」、「組態檔」、「ini 檔」或「config 檔」。

組態檔最普遍且傳統的內容格式是用純文字檔。在 Linux 系統中，可以在 /etc 目錄下找到一大堆這種組態檔。
而 Windows 系統中，也可以搜尋副檔名 .ini 或 .cfg 找到它們的踨跡。

本文示範用 C# 的反射機制，實作這種組態檔的載入工作。

<!--more-->

雖然設定檔的內容格式可以自訂，但最普遍的內容格式是純文字檔，而表達形式直接是「項目名稱 = 值」。
更進一步的，還會用「\[段落\]」分段。範例如下：

```text

;description
Language=en-us

[Http]
ip = xxx.xxx.xxx
port = 80

```

在我的設計慣例中，允許從組態檔讀入 Program 類別的公開資料成員或屬性的值。
本文設計的 *ConfigIni* 將提供靜態方法 `Load()` 指定組態檔名稱與讀入組態值的對象。
它會利用 C# 的反射機制，按組態的項目名稱，找到同名的公開資料成員或屬性，並按其型別指派其值。

*ConfigIni* 針對組態檔的處理原則如下所列：

* 每一行就是一條項目，表達形式是「名稱 = 值」。忽略「=」兩旁的空格，也就是不打空格也行。
* 按組態的項目名稱，找到同名的公開資料成員或屬性，並按其型別指派其值。
* 如果找不到同名的資料成員或屬性，則忽略此設定項目。
* 若一行文字的開頭文字若是「;」或「#」，則這行視為說明文字，不處理。
* 若一行文字被角括號「\[」和「\]」包覆，則視為開始新段落，接下來會按照「段落名稱_項目名稱」的規則找公開資料成員或屬性。
* 設定值可以處理 string, int, bool, double 四種型別。預設是 string 。
* 設定值的文字內容若包含「"」，視為一般文字處理，而不是字串符號。
* 對於 bool 型別，ConfigIni 承認 True, Yes, 1 (無視大小寫) 這三個字為 *True* 值；其它字都是 *False* 值。
* 對於 int 和 double 型別，若無法轉換數值，將忽略組態檔設定值，保留程式的預設值。

因為組態檔是允許人工編輯的純文字檔，為了避免打字錯誤妨礙程式工作，所以無法處理的內容一概忽略，而不是拋出錯誤。

#### ConfigIni 用到的 C# 反射機制

C# 反射機制用在：

1. [typeof](https://docs.microsoft.com/zh-tw/dotnet/csharp/language-reference/operators/type-testing-and-cast#typeof-operator) 取得載入外部組態值的對象的反射個體。
2. [GetField()](https://docs.microsoft.com/zh-tw/dotnet/api/system.type.getfield) 和 [GetProperty()](https://docs.microsoft.com/zh-tw/dotnet/api/system.type.getproperty) 找同名的公開靜態資料或屬性。
3. [FieldType](https://docs.microsoft.com/zh-tw/dotnet/api/system.reflection.fieldinfo.fieldtype) 和 [PropertyType](https://docs.microsoft.com/zh-tw/dotnet/api/system.reflection.propertyinfo.propertytype) 判斷型別以轉換設定文字。
4. [SetValue()](https://docs.microsoft.com/zh-tw/dotnet/api/system.reflection.fieldinfo.setvalue) 指派新的值。

本文範例完整源碼在 [load-config-ini](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/load-config-ini)。

載入組態檔的程式碼摘錄於下：

```csharp

using (var sr = config_file.OpenText())
{
    while ((s = sr.ReadLine()) != null)
    {
        if (s.Length < 2 || s[0] == '#' || s[0] == ';')
            continue;  // skip comment or empty line

        s = s.TrimEnd();
        if (s[0] == '[' && s.EndsWith(']'))
        {
            section = s.Substring(1, s.Length - 2);
            continue;
        }

        kv = s.Split(delimiter);
        k = kv[0].Trim();
        v = kv[1].Trim(); 

        if (section != null)
            k = $"{section}_{k}";

        // 先找同名的屬性
        prop = target.GetProperty(k);
        if (prop != null)
        {
            setValue(prop, v, obj);
        }
        // 如果沒有同名屬性，再找同名的資料成員(若允許的話)
        else if (!onlyProperties)
        {
            field = target.GetField(k);
            if (field != null)
            {
                setValue(field, v, obj);
            }
        }
        // 都找不到就忽略這個項目
    }
}

```

將設定值指派給目標對象的程式碼摘錄如下：

```csharp

private static void setValue(FieldInfo field, string value, Object obj)
{
    // 資料成員要看是不是宣告 readonly: FieldInfo.IsInitOnly
    // 而屬性則要看有沒有設計 setter: PropertyInfo.CanWrite
    // InitOnly means readonly.
    if (field.IsInitOnly)
        return;

    var t = field.FieldType;
    Print($"{field.Name} = {value}");
    if (typeof(string) == t)
    {
        // static 成員 => 類別變數 => 令obj為null
        field.SetValue(obj, value);
    }
    else if (typeof(bool) == t)
    {
        // 承認 True, Yes, 1 (無視大小寫) 這三個字為 True 值；其它字都是 False 值。
        // 哦，這段程式碼實際上簡化到用 T 或 Y 就承認了。
        // True|true|Yes|yes|1
        bool bv = ("TtYy1".IndexOf(value[0]) >= 0);
        field.SetValue(obj, bv);
    }
    else if (typeof(int) == t)
    {
        int iv;
        // 若無法轉換數值，將忽略組態檔設定值
        if (Int32.TryParse(value, out iv))
            field.SetValue(obj, iv);
    }
    else if (typeof(double) == t)
    {
        double dv;
        if (Double.TryParse(value, out dv))
            field.SetValue(obj, dv);
    }
}

```

#### 使用範例

.NET 的默認工作對象是 *Program* 實體，而 *Program* 的公開成員或屬性一般都被設計人員當作全域變數使用。
所以我習慣上把 *Program* 的公開資料成員或屬性都視為可由組態檔改變的項目。
此範例就是讀入組態檔 test.ini ，改變程式的資料成員的內容。

```csharp

class Program
{
    public static string 資料路徑 = "";
    public static int  MaxCount = 0;
    public static bool 打開功能 = false;
    public static double Scale = 1.0;
    public static int Abc_Level = 0;

    static void Main(string[] args)
    {
        ConfigIni.Load(@"test.ini", typeof(Program));

        Console.WriteLine(資料路徑);
        Console.WriteLine(MaxCount);
        Console.WriteLine(打開功能);
        Console.WriteLine(Scale);
        Console.WriteLine(Abc_Level);
    }
}

```

如果不想一個一個查看設定結果，可以用 `GetFields()` 或 `GetProperties()` 方法取出組態對象的全部資料成員或屬性，用 foreach 把它們全部列出來看。

###### 參考

* 本文範例完整源碼 [load-config-ini](https://github.com/shirock/rocksources/tree/master/dotnet-core-example/load-config-ini)
* [Reflection (C# 程式設計手冊)](https://docs.microsoft.com/zh-tw/dotnet/csharp/programming-guide/concepts/reflection)
* 什麼是 [Windows Cfg.ini 檔案](https://docs.microsoft.com/zh-tw/windows-server-essentials/install/create-the-cfg.ini-file)