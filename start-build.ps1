# Start Development Build - Interactive Script
# This will guide you through creating the APK

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FitLife Development Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Initialize EAS project (if needed)
Write-Host "Step 1: Setting up EAS project..." -ForegroundColor Yellow
$projectExists = Test-Path ".eas"
if (-not $projectExists) {
    Write-Host "Creating EAS project..." -ForegroundColor Gray
    Write-Host "When prompted, type 'yes' and press Enter" -ForegroundColor Yellow
    Write-Host ""
    eas project:init
} else {
    Write-Host "✅ EAS project already configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Starting build..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⏳ This will:" -ForegroundColor Cyan
Write-Host "   • Build APK in the cloud (10-20 minutes)" -ForegroundColor White
Write-Host "   • Show progress in this terminal" -ForegroundColor White
Write-Host "   • Give you a download link when complete" -ForegroundColor White
Write-Host ""
Write-Host "Starting build now..." -ForegroundColor Green
Write-Host ""

# Start the build
eas build --profile development --platform android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Your APK is being built!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "What happens next:" -ForegroundColor Cyan
    Write-Host "  1. Build runs in cloud (10-20 min)" -ForegroundColor White
    Write-Host "  2. Check status: eas build:list" -ForegroundColor White
    Write-Host "  3. Download from: https://expo.dev/accounts/7495032445/builds" -ForegroundColor White
    Write-Host "  4. Or wait for email notification" -ForegroundColor White
    Write-Host ""
    Write-Host "To check build status, run:" -ForegroundColor Yellow
    Write-Host "  eas build:list" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Build failed to start" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  eas project:init" -ForegroundColor White
    Write-Host "  eas build --profile development --platform android" -ForegroundColor White
}




