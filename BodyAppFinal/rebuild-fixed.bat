@echo off
echo ========================================
echo REBUILDING APP WITH NEW LOGO (FIXED)
echo ========================================
echo.

echo Step 1: Uninstalling old app...
adb uninstall com.bodyappfinal
echo.

echo Step 2: Cleaning all build caches...
if exist android\.gradle rmdir /s /q android\.gradle
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build
if exist node_modules\react-native-vision-camera\android\build rmdir /s /q node_modules\react-native-vision-camera\android\build
echo.

echo Step 3: Building fresh APK...
cd android
call gradlew assembleDebug --no-daemon
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Step 4: Installing on device...
    call gradlew installDebug
    cd ..
    echo.
    echo ========================================
    echo BUILD COMPLETE!
    echo ========================================
    echo Check your phone - the NEW logo should appear!
) else (
    cd ..
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo See error above
)
echo.
pause


