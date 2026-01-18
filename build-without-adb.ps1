# Build APK without requiring local Android SDK
# EAS cloud builds don't need ADB, but sometimes check for it

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building APK (Cloud Build)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set dummy Android SDK paths to bypass ADB check
# EAS cloud builds don't actually use these
$env:ANDROID_HOME = "C:\Android\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Android\Sdk"

Write-Host "Configuring for cloud build..." -ForegroundColor Yellow
Write-Host "Note: EAS builds happen in the cloud, no local SDK needed" -ForegroundColor Gray
Write-Host ""

# Try to build with preview profile (standalone APK)
Write-Host "Starting preview build (standalone APK)..." -ForegroundColor Green
Write-Host "This will take 10-20 minutes..." -ForegroundColor Gray
Write-Host ""

eas build --profile preview --platform android --non-interactive

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build Started!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Check status: eas build:list" -ForegroundColor Yellow
    Write-Host "Download from: https://expo.dev/accounts/7495032445/builds" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "If ADB error persists, try:" -ForegroundColor Yellow
    Write-Host "  1. Install Android Studio (includes ADB)" -ForegroundColor White
    Write-Host "  2. Or use: eas build --profile preview --platform android --non-interactive --no-wait" -ForegroundColor White
}




