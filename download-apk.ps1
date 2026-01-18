# Download Latest APK - Automatically finds your newest build

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Download Latest FitLife APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
    exit 1
}

Write-Host "✅ Logged in" -ForegroundColor Green
Write-Host ""
Write-Host "Finding latest build..." -ForegroundColor Yellow
Write-Host ""

# Get latest build info
$buildOutput = eas build:list --platform android --limit 1 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to get build list" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try manually:" -ForegroundColor Yellow
    Write-Host "  Visit: https://expo.dev/accounts/7495032445/builds" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Extract build ID and URLs from output
$buildId = ""
$buildPageUrl = ""
$directDownloadUrl = ""

if ($buildOutput -match "ID\s+([a-f0-9-]+)") {
    $buildId = $matches[1]
    $buildPageUrl = "https://expo.dev/accounts/7495032445/projects/health-tracker/builds/$buildId"
}

if ($buildOutput -match "Application Archive URL\s+(https://[^\s]+)") {
    $directDownloadUrl = $matches[1]
}

if ($buildOutput -match "Logs\s+(https://[^\s]+)") {
    if (-not $buildPageUrl) {
        $buildPageUrl = $matches[1]
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Latest Build Found!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if ($directDownloadUrl) {
    Write-Host "📱 Direct Download Link (Latest APK):" -ForegroundColor Yellow
    Write-Host $directDownloadUrl -ForegroundColor White
    Write-Host ""
    Write-Host "Opening download page..." -ForegroundColor Gray
    Start-Process $buildPageUrl
} elseif ($buildPageUrl) {
    Write-Host "📱 Build Page (Download from here):" -ForegroundColor Yellow
    Write-Host $buildPageUrl -ForegroundColor White
    Write-Host ""
    Write-Host "Opening build page..." -ForegroundColor Gray
    Start-Process $buildPageUrl
} else {
    Write-Host "📱 All Builds Page:" -ForegroundColor Yellow
    Write-Host "https://expo.dev/accounts/7495032445/builds" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening builds page..." -ForegroundColor Gray
    Start-Process "https://expo.dev/accounts/7495032445/builds"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Instructions:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Download the APK file" -ForegroundColor White
Write-Host "2. Transfer to your Poco F6 (via USB, email, or cloud)" -ForegroundColor White
Write-Host "3. On your phone: Settings > Security > Enable Install from Unknown Sources" -ForegroundColor White
Write-Host "4. Tap the APK file to install" -ForegroundColor White
Write-Host "5. Open FitLife app - permission dialog will appear!" -ForegroundColor White
Write-Host ""
Write-Host "This APK includes the latest changes (banner auto-hide fix)!" -ForegroundColor Green
Write-Host ""

