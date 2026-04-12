# Build APK - Quick Instructions

## Method 1: Using Access Token (Non-Interactive)

1. Get your Expo access token:
   - Go to https://expo.dev/accounts/[your-username]/settings/access-tokens
   - Create a new token
   - Copy the token

2. Set it as environment variable:
   ```powershell
   $env:EXPO_TOKEN = "your-token-here"
   ```

3. Build:
   ```powershell
   eas build --profile development --platform android
   ```

## Method 2: Interactive Login (Recommended)

Just run these two commands in PowerShell:

```powershell
eas login
eas build --profile development --platform android
```

The login will open your browser or ask for credentials.

## Method 3: Use the Script

Run the automated script:
```powershell
.\build-now.ps1
```








