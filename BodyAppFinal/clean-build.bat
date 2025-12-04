@echo off
echo ========================================
echo Cleaning Build Cache for BodyApp
echo ========================================
echo.

echo Step 1: Cleaning Android Gradle cache...
cd android
call gradlew clean
cd ..
echo.

echo Step 2: Cleaning Metro bundler cache...
call npx react-native start --reset-cache &
timeout /t 5
taskkill /F /IM node.exe 2>nul
echo.

echo Step 3: Removing build folders...
rmdir /s /q android\app\build 2>nul
rmdir /s /q android\build 2>nul
echo.

echo ========================================
echo Cache cleaned! Now rebuilding...
echo ========================================
echo.
echo IMPORTANT: Please uninstall the old app from your phone first!
echo Then run: npx react-native run-android
echo.
pause


