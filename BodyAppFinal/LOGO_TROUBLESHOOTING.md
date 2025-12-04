# Logo Not Updating - Troubleshooting Guide

## Why Your Logo Wasn't Updating

When you replaced the logo PNG files in the `mipmap-*` folders but still saw the old logo, here's what was happening:

### Root Cause: Android Adaptive Icons (API 26+)

On Android 8.0+ (API 26 and higher), Android uses **Adaptive Icons** instead of simple PNG files. These are defined in:
- `mipmap-anydpi-v26/ic_launcher.xml`
- `mipmap-hdpi-v26/ic_launcher.xml`
- And similar folders for other densities

These XML files were configured like this:
```xml
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/splash_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
```

The problem? **`@drawable/ic_launcher_foreground` was a hard-coded vector drawable** containing the old smiley face logo, NOT a reference to your PNG files!

### What Was Fixed

1. **Deleted all adaptive icon XML files** - Now Android will fall back to using your PNG files directly
2. **Deleted the hard-coded vector drawable** (`ic_launcher_foreground.xml`)
3. **Updated splash screen** to show your logo instead of just a black background

## Multiple Layers of Caching

Even after fixing the code, you may still see the old logo due to caching at multiple levels:

### 1. Build Cache (Gradle)
- **Location**: `android/build/` and `android/app/build/`
- **Solution**: Run `gradlew clean` or delete these folders
- **When it happens**: Every time you change resources

### 2. Metro Bundler Cache
- **Location**: Temp folders in your system
- **Solution**: Run `npx react-native start --reset-cache`
- **When it happens**: When JavaScript assets change

### 3. Device Launcher Cache ⚠️ **MOST IMPORTANT**
- **Location**: Android system's launcher (home screen app)
- **Solution**: **MUST UNINSTALL the app first**, then reinstall
- **When it happens**: When app icon resources change
- **Why it's tricky**: Simply reinstalling doesn't clear the launcher's icon cache!

### 4. Android's Resource Cache
- **Location**: System-level cached app resources
- **Solution**: Uninstall app or clear app data
- **When it happens**: When app resources change

## How to Update Your Logo in the Future

### Step 1: Update the PNG Files
Replace all the `ic_launcher.png` and `ic_launcher_round.png` files in these folders:
- `android/app/src/main/res/mipmap-ldpi/`
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

**Sizes needed:**
- ldpi: 36x36 px
- mdpi: 48x48 px
- hdpi: 72x72 px
- xhdpi: 96x96 px
- xxhdpi: 144x144 px
- xxxhdpi: 192x192 px

### Step 2: Clean Everything
Run the provided script:
```bash
INSTALL_WITH_NEW_LOGO.bat
```

Or manually:
```bash
# In the BodyAppFinal directory
cd android
gradlew clean
cd ..
rmdir /s /q android\app\build
rmdir /s /q android\build
```

### Step 3: UNINSTALL THE OLD APP ⚠️ CRITICAL
**You MUST manually uninstall the app from your phone!**

Why? Android's launcher caches app icons at the system level. Simply reinstalling won't update this cache.

### Step 4: Rebuild and Install
```bash
npx react-native run-android
```

### Step 5: If Still Not Working
If you still see the old icon on your home screen after installing:
1. **Long-press the app icon** and remove it from home screen
2. **Go to app drawer** and add the app again
3. **OR restart your phone** to fully clear the launcher cache

## Prevention Checklist

To avoid this issue in the future, remember:

- ✅ **Always uninstall before reinstalling** when changing app icons
- ✅ **Clean build cache** (`gradlew clean`) after resource changes
- ✅ **Don't use hard-coded vector drawables** for app icons - use PNG files
- ✅ **Test on a clean install** by uninstalling first
- ✅ **Clear launcher cache** by removing and re-adding icon, or restarting device

## Quick Reference: Cache Clearing Commands

### Full Clean
```bash
cd android && gradlew clean && cd ..
rmdir /s /q android\app\build
rmdir /s /q android\build
npx react-native start --reset-cache
```

### Must Also Do Manually
1. Uninstall app from phone
2. Reinstall app
3. If needed: Remove icon from home screen and re-add, or restart phone

## Understanding Android Icon System

### API Level < 26 (Android 7.1 and below)
- Uses simple PNG files from `mipmap-*` folders
- No adaptive icons
- Simpler but less flexible

### API Level >= 26 (Android 8.0+)
- Uses Adaptive Icons when available
- Falls back to PNG if no adaptive icon defined
- Adaptive icons allow:
  - Separate foreground and background layers
  - System can apply masks (circle, square, squircle, etc.)
  - Better visual consistency across devices

**Our Solution**: We removed adaptive icons to use simple PNG files for reliability and easier updates.

## Additional Notes

### Splash Screen
The splash screen now shows your logo! It's defined in:
- `android/app/src/main/res/drawable/splash_screen.xml`
- Uses the same `ic_launcher` PNG files
- Appears for ~1-2 seconds when app starts

### Testing
To properly test icon changes:
1. Uninstall app completely
2. Clear build caches
3. Rebuild and install
4. Check both:
   - App icon on home screen/drawer
   - Splash screen when launching app

### Common Mistakes to Avoid
❌ Not uninstalling before reinstalling
❌ Only cleaning Gradle but not Metro cache
❌ Using hard-coded vector drawables for icons
❌ Not testing on actual device (emulator may behave differently)
❌ Assuming "rebuild" is enough (it's not for icons!)

