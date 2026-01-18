# FitLife APK Build Script
# This script will help you build the development APK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FitLife APK Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking EAS login status..." -ForegroundColor Yellow
$loginStatus = eas whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Please login first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Step 1: Login to Expo" -ForegroundColor Green
    Write-Host "Run this command: eas login" -ForegroundColor White
    Write-Host ""
    Write-Host "This will:"
    Write-Host "  - Open a browser for you to login"
    Write-Host "  - Or ask for your email/username"
    Write-Host ""
    $login = Read-Host "Press Enter after you've logged in, or type 'login' to login now"
    
    if ($login -eq "login") {
        Write-Host "Starting login process..." -ForegroundColor Yellow
        eas login
    } else {
        Write-Host "Please run 'eas login' first, then run this script again." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "Step 2: Building APK..." -ForegroundColor Green
Write-Host "This will take 10-20 minutes. The build happens on Expo's servers." -ForegroundColor Yellow
Write-Host ""

# Build the APK
eas build --profile development --platform android

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build process started!" -ForegroundColor Green
Write-Host "Check your build status at: https://expo.dev" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

