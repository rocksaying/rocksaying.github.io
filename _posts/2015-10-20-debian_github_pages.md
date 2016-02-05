---
title: Debian 8 and Github Pages.
category: computer
tags: [github, jekyll]
lastupdated: 2016-02-05
---

github pages required ruby version above 1.9. debian 8 default ruby version is 2.1.

required package: ruby2.1 ruby ruby2.1-dev ruby-dev bundler rubygems-integration zlib1g-dev nodejs

* gem issue: require package zlib1g-dev.
* jekyllrb issue: require package nodejs.

Installing Jekyll: reference [Using Jekyll with Pages](https://help.github.com/articles/using-jekyll-with-pages/)

create Gemfile in the root of your github pages working copy.

```text
source 'https://rubygems.org'
gem 'github-pages'
```

change directory to your github pages working copy then run `bundle install`.

My script to run Jekyll with GitHub Pages:

```term
#!/bin/sh
cd ~/Public/rocksaying.github.io
exec bundle exec jekyll serve
```

Using web browser to open *localhost:4000/*.

#### Upgrade to Jekyll3

change directory to working copy then run `gem update` or `bundle update`.

add "gems: [jekyll-paginate]" in your _config.yaml if you need paginate.

```
gems: [jekyll-paginate]
```

See also: [Upgrading from 2.x to 3.x](http://jekyllrb.com/docs/upgrading/2-to-3/)
