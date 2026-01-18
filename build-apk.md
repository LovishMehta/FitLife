# Build APK for FitLife - Step by Step Guide

## Prerequisites
- EAS CLI is already installed ✅
- You need an Expo account (free)

## Steps to Build APK

### Step 1: Login to Expo
Open your terminal/PowerShell and run:
```bash
eas login
```
- This will open a browser or ask for your email/username
- If you don't have an account, create one at https://expo.dev

### Step 2: Build the Development APK
Once logged in, run:
```bash
eas build --profile development --platform android
```

### Step 3: Wait for Build
- The build will be created on Expo's servers (takes 10-20 minutes)
- You'll see a build URL in the terminal
- You can also check progress at https://expo.dev/accounts/[your-username]/builds

### Step 4: Download and Install
- Once build completes, download the APK from the build page
- Transfer to your Poco F6
- Enable "Install from Unknown Sources" in Settings
- Install the APK
- Open the app - permission dialog will appear!

## Alternative: Quick Preview Build
If you want a faster build (but less features):
```bash
eas build --profile preview --platform android
```

## Troubleshooting
- If login fails, try: `eas login --help`
- If build fails, check: https://docs.expo.dev/build/introduction/

