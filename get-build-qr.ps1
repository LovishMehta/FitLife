# Get the latest build and show QR code properly
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Fetching Latest Android Build..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$buildInfo = eas build:list --platform android --limit 1 --non-interactive 2>&1 | Out-String

if ($buildInfo -match "Status\s+finished") {
    Write-Host ""
    Write-Host "Build Status: COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host ""
    
    if ($buildInfo -match "Application Archive URL\s+(https://[^\s]+)") {
        $apkUrl = $matches[1]
        
        Write-Host "APK Download URL:" -ForegroundColor Yellow
        Write-Host $apkUrl -ForegroundColor White
        Write-Host ""
        
        # Check if Node.js is available
        $nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
        if ($nodeAvailable) {
            # Install qrcode-terminal if needed
            if (-not (Test-Path "node_modules\qrcode-terminal")) {
                Write-Host "Installing qrcode-terminal..." -ForegroundColor Yellow
                npm install qrcode-terminal 2>&1 | Out-Null
            }
            
            # Use the Node.js script to display QR code
            node show-qr.js $apkUrl
        } else {
            Write-Host "Node.js not found. Opening browser QR code..." -ForegroundColor Yellow
            $encodedUrl = [uri]::EscapeDataString($apkUrl)
            $qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=" + $encodedUrl
            Start-Process $qrUrl
        }
        
        Write-Host ""
        Write-Host "To download directly:" -ForegroundColor Cyan
        Write-Host "Invoke-WebRequest -Uri '$apkUrl' -OutFile 'health-tracker.apk'" -ForegroundColor White
        Write-Host ""
    }
    
    if ($buildInfo -match "Logs\s+(https://[^\s]+)") {
        $logsUrl = $matches[1]
        Write-Host "Build Logs: $logsUrl" -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "Build not found or not finished yet." -ForegroundColor Red
    Write-Host $buildInfo -ForegroundColor Yellow
}
