@echo off
set RACK_ENV=development
taskkill /F /IM "ruby.exe" /T
start ruby app.rb
