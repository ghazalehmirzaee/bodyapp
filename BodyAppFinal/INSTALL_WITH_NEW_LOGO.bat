@echo off
echo ========================================
echo Installing BodyApp with NEW LOGO
echo ========================================
echo.
echo This script will:
echo 1. Clean all build caches
echo 2. Remove old build artifacts
echo 3. Build and install the app with your new logo
echo.
echo IMPORTANT: Make sure your Android phone is connected via USB
echo           and USB debugging is enabled!
echo.
pause

echo.
echo ========================================
echo Step 1: Cleaning Android Gradle cache...
echo ========================================
cd android
call gradlew clean
if errorlevel 1 (
    echo ERROR: Gradle clean failed!
    pause
    exit /b 1
)
cd ..
echo Done!
echo.

echo ========================================
echo Step 2: Removing build folders...
echo ========================================
rmdir /s /q android\app\build 2>nul
rmdir /s /q android\build 2>nul
echo Done!
echo.

echo ========================================
echo Step 3: Clearing Metro bundler cache...
echo ========================================
rmdir /s /q %TEMP%\metro-* 2>nul
rmdir /s /q %TEMP%\react-* 2>nul
echo Done!
echo.

echo ========================================
echo Step 4: UNINSTALL OLD APP FROM PHONE
echo ========================================
echo PLEASE MANUALLY UNINSTALL THE APP FROM YOUR PHONE NOW!
echo.
echo This is CRITICAL because:
echo - Android caches app icons at the system level
echo - Simply reinstalling may not update the cached icon
echo - You MUST uninstall first to clear the launcher cache
echo.
echo After uninstalling, press any key to continue...
pause
echo.

echo ========================================
echo Step 5: Building and installing app...
echo ========================================
echo This may take a few minutes...
echo.
call npx react-native run-android
if errorlevel 1 (
    echo.
    echo ERROR: Build or installation failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! App installed with new logo!
echo ========================================
echo.
echo The new logo should now appear:
echo 1. On your phone's home screen/app drawer
echo 2. On the splash screen when launching the app
echo.
echo If you still see the old logo on the home screen:
echo - Long-press the app icon
echo - Remove it from your home screen
echo - Add it again from the app drawer
echo - OR restart your phone to fully clear launcher cache
echo.
pause
