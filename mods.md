# Removing the read time
- go to `~/gems/gems/jekyll-theme-chirpy-a.b.c/_includes` and mv read-time.html to read-time.html.bak
- create an empty read-time.html: touch read-time.html
- kill and restart jekyll

# Removing the tagline at the bottom
- go to `~/gems/gems/jekyll-theme-chirpy-a.b.c/_data/locales/` and modify en.yml
- find the meta: entry and make it blank or whatever.
