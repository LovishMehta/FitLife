# Fix Java Version Issue

## Problem
Your Java version (Java 25) is too new for Gradle. We need Java 17 or 21.

## Solution Options

### Option 1: Install Java 17 (Recommended)

1. Download Java 17:
   - Go to: https://adoptium.net/temurin/releases/?version=17
   - Download Windows x64 JDK
   - Install it

2. Set JAVA_HOME:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
   ```

3. Try build again:
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```

### Option 2: Use Android Studio's Java

If you have Android Studio installed:
1. Android Studio includes Java 17
2. Set JAVA_HOME to Android Studio's Java:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
   ```

### Option 3: Install Android Studio (Easiest)

1. Download: https://developer.android.com/studio
2. Install Android Studio
3. It includes Java 17 automatically
4. Then build from Android Studio GUI

---

## Quick Fix (If Android Studio Installed)

```powershell
# Set to Android Studio's Java
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Build APK
cd android
.\gradlew assembleDebug
```





