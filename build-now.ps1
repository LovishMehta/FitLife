# FitLife APK Build - Run this script in PowerShell
# Make sure you're in the FitLife directory

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FitLife Development APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check login
Write-Host "Step 1: Checking EAS login status..." -ForegroundColor Yellow
$loginCheck = eas whoami 2>&1

if ($LASTEXITCODE -ne 0 -or $loginCheck -match "Not logged in") {
    Write-Host "❌ Not logged in to Expo" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to login first. Choose an option:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option A - Browser Login (Recommended):" -ForegroundColor Green
    Write-Host "  Run: eas login" -ForegroundColor White
    Write-Host "  This will open your browser to login" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option B - Manual Login:" -ForegroundColor Green
    Write-Host "  Run: eas login" -ForegroundColor White
    Write-Host "  Enter your Expo email/username when prompted" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Don't have an account? Create one at: https://expo.dev/signup" -ForegroundColor Cyan
    Write-Host ""
    
    $proceed = Read-Host "Press Enter after logging in, or type 'skip' to try building anyway"
    
    if ($proceed -eq "skip") {
        Write-Host "Attempting build without login check..." -ForegroundColor Yellow
    } else {
        Write-Host "Please login first using: eas login" -ForegroundColor Yellow
        Write-Host "Then run this script again." -ForegroundColor Yellow
        exit
    }
} else {
    Write-Host "✅ Already logged in as: $loginCheck" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Starting APK build..." -ForegroundColor Yellow
Write-Host "This will:" -ForegroundColor Gray
Write-Host "  • Upload your code to Expo's servers" -ForegroundColor Gray
Write-Host "  • Build the Android APK (takes 10-20 minutes)" -ForegroundColor Gray
Write-Host "  • Provide a download link when complete" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ Building... Please wait..." -ForegroundColor Cyan
Write-Host ""

# Build the APK
eas build --profile development --platform android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build started successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Wait for build to complete (10-20 minutes)" -ForegroundColor White
    Write-Host "  2. Check status at: https://expo.dev" -ForegroundColor White
    Write-Host "  3. Download the APK when ready" -ForegroundColor White
    Write-Host "  4. Install on your Poco F6" -ForegroundColor White
    Write-Host "  5. Open app - permission dialog will appear!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Common issues:" -ForegroundColor Red
    Write-Host "  • Not logged in - run 'eas login' first" -ForegroundColor Yellow
    Write-Host "  • Network issues - check your internet connection" -ForegroundColor Yellow
    Write-Host "  • Account issues - verify at https://expo.dev" -ForegroundColor Yellow
}





