# Quick Test Script - See Your Changes Instantly
# This uses Expo Go for fast testing

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Banner Auto-Hide Feature" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will start Expo dev server for quick testing:" -ForegroundColor Yellow
Write-Host "  ✅ See changes instantly (live reload)" -ForegroundColor Green
Write-Host "  ✅ No rebuild needed" -ForegroundColor Green
Write-Host "  ✅ Test banner auto-hide feature" -ForegroundColor Green
Write-Host ""

Write-Host "Steps:" -ForegroundColor Cyan
Write-Host "  1. Make sure Expo Go app is installed on your phone" -ForegroundColor White
Write-Host "  2. This will start the dev server" -ForegroundColor White
Write-Host "  3. Scan QR code with Expo Go app" -ForegroundColor White
Write-Host "  4. Test: Grant permission → Banner should disappear after 5 seconds" -ForegroundColor White
Write-Host ""

$response = Read-Host "Start dev server? (Y/N)"
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting Expo dev server..." -ForegroundColor Yellow
    Write-Host ""
    npx expo start --clear
} else {
    Write-Host ""
    Write-Host "Cancelled. Run 'npx expo start' manually when ready." -ForegroundColor Gray
}






