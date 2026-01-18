# Simple APK Builder - One Command Solution
# This script will guide you through the simplest path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FitLife APK Builder - Simple Method" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Android Studio is installed
$androidStudio = Test-Path "C:\Program Files\Android\Android Studio\jbr"
$java17 = Get-ChildItem "C:\Program Files\Java" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*17*" -or $_.Name -like "*jdk-17*" }

if (-not $androidStudio -and -not $java17) {
    Write-Host "❌ Java 17 not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "SIMPLEST SOLUTION:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Use EAS (No Android Studio needed):" -ForegroundColor Green
    Write-Host "  1. Create free account: https://expo.dev/signup" -ForegroundColor White
    Write-Host "  2. Run: eas login" -ForegroundColor White
    Write-Host "  3. Run: eas build --profile development --platform android" -ForegroundColor White
    Write-Host "  4. Download APK from Expo website" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2 - Install Android Studio:" -ForegroundColor Green
    Write-Host "  1. Download: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "  2. Install (includes Java 17)" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "Which option? (1 for EAS, 2 for Android Studio)" -ForegroundColor Cyan
    $choice = Read-Host
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "Starting EAS build process..." -ForegroundColor Yellow
        Write-Host "You'll need to login first:" -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; eas login; eas build --profile development --platform android"
        exit
    } elseif ($choice -eq "2") {
        Write-Host ""
        Write-Host "Please install Android Studio first:" -ForegroundColor Yellow
        Write-Host "Download: https://developer.android.com/studio" -ForegroundColor White
        Start-Process "https://developer.android.com/studio"
        exit
    }
}

# If we have Java 17, proceed with build
Write-Host "✅ Java 17 found! Building APK..." -ForegroundColor Green
Write-Host ""

# Set JAVA_HOME if Android Studio found
if ($androidStudio) {
    $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
    Write-Host "Using Android Studio's Java" -ForegroundColor Gray
}

# Build APK
Set-Location android
.\gradlew assembleDebug

if ($LASTEXITCODE -eq 0) {
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ APK BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "APK Location:" -ForegroundColor Yellow
        Write-Host "$(Resolve-Path $apkPath)" -ForegroundColor White
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "  1. Copy APK to your Poco F6" -ForegroundColor White
        Write-Host "  2. Enable 'Install from Unknown Sources'" -ForegroundColor White
        Write-Host "  3. Install APK" -ForegroundColor White
        Write-Host "  4. Open app - permission dialog will appear!" -ForegroundColor White
        
        # Open folder
        Start-Process explorer.exe -ArgumentList "/select,$(Resolve-Path $apkPath)"
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Please check errors above." -ForegroundColor Red
}

Set-Location ..

