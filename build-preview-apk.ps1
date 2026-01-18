# Build Standalone Preview APK (No Dev Server Required)
# This creates a standalone APK that works without Expo Go

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building Standalone Preview APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will create an APK that works standalone (no Expo Go needed)" -ForegroundColor Yellow
Write-Host ""

# Check if logged in
Write-Host "Checking EAS login status..." -ForegroundColor Gray
$loginCheck = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Not logged in to EAS" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "  eas login" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged in to EAS" -ForegroundColor Green
Write-Host ""

# Note: ADB warnings can be ignored for cloud builds
Write-Host "Starting cloud build..." -ForegroundColor Yellow
Write-Host "(Ignore any ADB warnings - cloud builds don't need ADB)" -ForegroundColor Gray
Write-Host ""

# Run the build with correct spelling: android (not andriod)
eas build --platform android --profile preview

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Wait for build to complete (5-15 minutes)" -ForegroundColor White
    Write-Host "  2. Check status: eas build:list" -ForegroundColor White
    Write-Host "  3. Download APK from: https://expo.dev/accounts/[your-account]/builds" -ForegroundColor White
    Write-Host "  4. Install on your Poco F6" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Build command failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "  - Make sure you're logged in: eas login" -ForegroundColor White
    Write-Host "  - Check your internet connection" -ForegroundColor White
    Write-Host "  - Try again in a moment" -ForegroundColor White
    Write-Host ""
}

