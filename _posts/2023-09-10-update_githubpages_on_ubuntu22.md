---
title: 在 Ubuntu 22.04 上更新 GitHubPages
category: computer
tags: [ubuntu,jekyll,"github pages",blog]
---

安裝 Ubuntu 22.04 後，按照 [Jekyll on Ubuntu](https://jekyllrb.com/docs/installation/ubuntu/) 的說明，安裝 Jekyll 所需套件與環境。

```term
sudo apt-get install ruby-full build-essential zlib1g-dev

echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

gem install jekyll bundler
```

安裝完成後，先建立一個測試 Jekyll 用的目錄。例如 jekyll-test 。

```term
mkdir jekyll-test
cd jekyll-test
jekyll new --skip-bundle
```

這會建立一個全新網站的 Jekyll 專案目錄，但還要修改它的 *Gemfile* ，改用 *github-pages* 套件管理內容。

<!--more-->

編輯 Gemfile:

```text
# 第二行插入下面這行。因為 Ubuntu 22.04 安裝 Ruby 3 ，它不包含這個gem。
gem 'webrick'

# 註解 gem "jekyll" ，取消註解 gem "github-pages"
# Gemfile 裡面也有這段註解文字。
#gem "jekyll", "~> 4.3.2"
# If you want to use GitHub Pages, remove the "gem "jekyll"" above and
# uncomment the line below. To upgrade, run `bundle update github-pages`.
gem "github-pages", group: :jekyll_plugins
```

這個 Gemfile 之後會複製到我的部落格的專案目錄。

接著執行下列動作，確認 GitHub Pages 套件能否工作。

```term
bundle install
bundle exec jekyll serve

# 用網路瀏覽器開啟 http://localhost:4000 測試網站
browser http://localhost:4000
```

確認這個測試網站沒問題之後，將我的部落格的專案目錄，掛載或複製到 Ubuntu 22.04 系統上。

我要直接更新本機的 GitHub Pages 專案目錄。這裡有三個子目錄是舊版 GitHub Pages 留下來的內容。先刪除這三個子目錄。不移除它們的話，`bundle install` 或 `bundle update` 會一直發生 racc, nokogiri 或 minima 安裝失敗的錯誤。刪除它們就完全沒問題了。

```term
rm -rf .bundle
rm -rf .jekyll-cache
rm -rf vendor
```

你也可以選擇直接從 GitHub 重製你的部落格內容下來 (git clone)，就不會遇到專案目錄下殘留舊版 GitHub Pages 套件的狀況。

將剛剛建的測試專案目錄下的 Gemfile 複製過來，用這個新版本 Gemfile 。執行 `bundle exec jekyll serve` 應該就沒問題了。

*注意，更新後產生的 Gemfile 不能呈送到 GitHub 。 GitHub Action 會失敗。*
我一開始把這個新的 Gemfile 上送到 GitHub 去，然後建置部落格內容時，它回覆下列錯誤：
<q>
Can't use 'tar -xzf' extract archive file: /home/runner/work/_actions/_temp_6.....tar.gz. return code: 2.
</q> 。
