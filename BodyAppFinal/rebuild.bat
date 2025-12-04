@echo off
cd /d C:\Users\peter\Github\bodyapp\BodyAppFinal
echo Installing dependencies...
call npm install
echo.
echo Building and installing app...
call npx react-native run-android
pause















