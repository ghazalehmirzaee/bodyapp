Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BUILDING APP WITH NEW LOGO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Uninstall
Write-Host "Step 1: Uninstalling old app..." -ForegroundColor Yellow
adb uninstall com.bodyappfinal
Write-Host "✓ Uninstalled`n" -ForegroundColor Green

# Step 2: Clean caches
Write-Host "Step 2: Cleaning build caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\react-native-vision-camera\android\build -ErrorAction SilentlyContinue
Write-Host "✓ Caches cleaned`n" -ForegroundColor Green

# Step 3: Build
Write-Host "Step 3: Building APK (this takes 1-2 minutes)..." -ForegroundColor Yellow
cd android
.\gradlew assembleDebug --no-daemon

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build successful!`n" -ForegroundColor Green
    
    # Step 4: Install
    Write-Host "Step 4: Installing on device..." -ForegroundColor Yellow
    .\gradlew installDebug
    
    if ($LASTEXITCODE -eq 0) {
        cd ..
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "✓ SUCCESS! NEW LOGO INSTALLED!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "`nCheck your phone - you should see the smiley face logo!`n" -ForegroundColor Cyan
    } else {
        cd ..
        Write-Host "`n✗ Installation failed" -ForegroundColor Red
    }
} else {
    cd ..
    Write-Host "`n✗ Build failed - see error above`n" -ForegroundColor Red
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


