# run 
# $ bundle config set --local path 'vendor/bundle'
# before you run 'bundle install'
source 'https://rubygems.org'
gem "github-pages", group: :jekyll_plugins
gem "hyde"

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-gist"
  gem "jekyll-paginate"
  gem "jekyll-seo-tag"
  gem 'jekyll-admin'
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
