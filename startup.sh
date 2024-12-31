#!/bin/sh
rm -f Gemfile.lock
bundle install
bundle exec jekyll serve --port=8080 --host=0.0.0.0
