@echo off
echo ========================================
echo REBUILDING APP WITH NEW LOGO
echo ========================================
echo.

echo Step 1: Uninstalling old app...
adb uninstall com.bodyappfinal
echo.

echo Step 2: Cleaning build cache...
cd android
call gradlew clean
cd ..
echo.

echo Step 3: Building and installing new APK...
cd android
call gradlew assembleDebug installDebug
cd ..
echo.

echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Check your phone - the NEW logo should now appear!
echo If you still see the old logo, restart your phone.
echo.
pause


