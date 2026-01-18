# Build Standalone APK - No Dev Server Needed
# This creates a fully bundled APK that works independently

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building Standalone APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will create a standalone APK that:" -ForegroundColor Yellow
Write-Host "  ✅ Works without dev server" -ForegroundColor Green
Write-Host "  ✅ Includes all code bundled" -ForegroundColor Green
Write-Host "  ✅ Can be installed and used independently" -ForegroundColor Green
Write-Host "  ✅ Has step tracking permissions" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Building preview APK (10-20 minutes)..." -ForegroundColor Cyan
Write-Host ""

# Build preview (standalone) APK
eas build --profile preview --platform android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Build Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Your standalone APK is being built!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "What happens next:" -ForegroundColor Cyan
    Write-Host "  1. Build runs in cloud (10-20 min)" -ForegroundColor White
    Write-Host "  2. Check status: eas build:list" -ForegroundColor White
    Write-Host "  3. Download from: https://expo.dev/accounts/7495032445/builds" -ForegroundColor White
    Write-Host "  4. Install on Poco F6 - NO dev server needed!" -ForegroundColor White
    Write-Host ""
    Write-Host "This APK will work completely standalone!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
}




