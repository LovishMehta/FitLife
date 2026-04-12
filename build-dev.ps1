# Development Build Script for FitLife
# This script will guide you through creating a development build

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FitLife Development Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking EAS login status..." -ForegroundColor Yellow
$loginStatus = eas whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to EAS" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to login first:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Create account and login:" -ForegroundColor Green
    Write-Host "  1. Go to: https://expo.dev/signup" -ForegroundColor White
    Write-Host "  2. Create free account (email + password)" -ForegroundColor White
    Write-Host "  3. Come back here and press Enter" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2 - Login with existing account:" -ForegroundColor Green
    Write-Host "  Just press Enter to start login" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter when ready to login"
    
    Write-Host ""
    Write-Host "Starting login (browser will open)..." -ForegroundColor Yellow
    eas login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Login failed. Please try again manually:" -ForegroundColor Red
        Write-Host "   eas login" -ForegroundColor White
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Login successful!" -ForegroundColor Green
} else {
    Write-Host "✅ Already logged in: $loginStatus" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Development Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  • Build a development APK with native permissions" -ForegroundColor White
Write-Host "  • Include ACTIVITY_RECOGNITION for step tracking" -ForegroundColor White
Write-Host "  • Take 10-20 minutes" -ForegroundColor White
Write-Host "  • Generate APK you can install on your Poco F6" -ForegroundColor White
Write-Host ""
Write-Host "Build will start now..." -ForegroundColor Green
Write-Host ""

# Start the development build
eas build --profile development --platform android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Wait for build to complete (10-20 min)" -ForegroundColor White
    Write-Host "  2. Check status: eas build:list" -ForegroundColor White
    Write-Host "  3. Download APK from: https://expo.dev/accounts/[your-account]/builds" -ForegroundColor White
    Write-Host "  4. Install on your Poco F6" -ForegroundColor White
    Write-Host "  5. Grant 'Physical Activity' permission when prompted" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  • Not logged in: Run 'eas login'" -ForegroundColor White
    Write-Host "  • Network issues: Check internet connection" -ForegroundColor White
    Write-Host "  • Account limits: Check https://expo.dev/accounts/[your-account]" -ForegroundColor White
}







