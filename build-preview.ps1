# Build Preview APK Script
# This script builds a preview APK using EAS

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building Preview APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easInstalled) {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install EAS CLI" -ForegroundColor Red
        exit 1
    }
}

# Check if logged in
Write-Host "Checking EAS login status..." -ForegroundColor Yellow
$loginCheck = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to EAS" -ForegroundColor Red
    Write-Host "Please run: eas login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged in to EAS" -ForegroundColor Green
Write-Host ""

# Start the build
Write-Host "Starting preview build..." -ForegroundColor Yellow
Write-Host "This may take 10-20 minutes..." -ForegroundColor Yellow
Write-Host ""

# Run the build command with explicit profile
eas build --platform android --profile preview

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Wait for build to complete (10-20 min)" -ForegroundColor White
    Write-Host "  2. Check status: eas build:list" -ForegroundColor White
    Write-Host "  3. Download APK from Expo dashboard" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  • Check build logs: eas build:list" -ForegroundColor White
    Write-Host "  • Account limits: Free plan has 30 builds/month" -ForegroundColor White
    Write-Host "  • Network issues: Check internet connection" -ForegroundColor White
    Write-Host "  • View logs: https://expo.dev/accounts/[your-account]/builds" -ForegroundColor White
    Write-Host ""
}

