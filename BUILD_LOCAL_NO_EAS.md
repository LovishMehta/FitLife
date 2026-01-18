# Build APK Locally - No EAS Account Needed!

## ✅ This method:
- ✅ **No Expo account needed**
- ✅ **No EAS required**
- ✅ **Builds completely on your computer**
- ✅ **Free forever**

## ⚠️ Requirements:
- Android Studio (free, ~3GB download)
- Java JDK (usually comes with Android Studio)
- ~30 minutes for first-time setup

---

## Step-by-Step Guide

### Step 1: Install Android Studio

1. Download Android Studio: https://developer.android.com/studio
2. Install it (follow the installer)
3. Open Android Studio → **More Actions** → **SDK Manager**
4. Install:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools

### Step 2: Generate Native Android Code

In your FitLife folder, run:

```powershell
npx expo prebuild --platform android
```

This creates an `android/` folder with native code.

### Step 3: Build APK with Gradle (Command Line)

```powershell
cd android
.\gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Build Release APK (For Production)

```powershell
cd android
.\gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Alternative: Build with Android Studio (GUI)

1. Open Android Studio
2. **File** → **Open** → Select the `android` folder
3. Wait for Gradle sync
4. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
5. APK will be in `android/app/build/outputs/apk/debug/`

---

## Quick Commands (Copy & Paste)

```powershell
# Generate native code
npx expo prebuild --platform android

# Build debug APK
cd android
.\gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Troubleshooting

**Error: "gradlew not found"**
- Make sure you're in the `android` folder
- Run: `cd android` first

**Error: "Java not found"**
- Install Java JDK 17 or later
- Or install Android Studio (includes Java)

**Error: "SDK not found"**
- Open Android Studio
- SDK Manager → Install Android SDK Platform

---

## After Building

1. Find APK: `android/app/build/outputs/apk/debug/app-debug.apk`
2. Transfer to Poco F6
3. Enable "Install from Unknown Sources"
4. Install APK
5. Open app - permission dialog will appear! ✅

