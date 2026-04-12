# What is EAS? - Simple Explanation

## EAS = Expo Application Services

**EAS** is a free cloud service by Expo that builds Android APK files for you.

### Why do we need it?
- Your app runs in **Expo Go** (limited permissions)
- To get **step tracking** working, you need a **standalone APK**
- EAS builds that APK for you in the cloud (no Android Studio needed!)

### Is it free?
✅ **YES!** 
- Free tier: 30 builds per month
- No credit card required
- Just need to create an account

---

## How to Create an Expo Account (2 minutes)

### Step 1: Go to Expo Website
Visit: **https://expo.dev/signup**

### Step 2: Sign Up
You can sign up with:
- **Email** (recommended)
- **GitHub account**
- **Google account**

### Step 3: Verify Email
- Check your email
- Click the verification link

### Step 4: Done!
Now you can login with:
```powershell
eas login
```

---

## Quick Start Guide

1. **Create account**: https://expo.dev/signup
2. **Login**: `eas login` (in PowerShell)
3. **Build APK**: `eas build --profile development --platform android`
4. **Wait**: 10-20 minutes
5. **Download**: Get APK from Expo website
6. **Install**: On your Poco F6

---

## Alternative: Keep Using Expo Go

If you don't want to create an account, you can:
- Keep using Expo Go (but step tracking won't work)
- Use a different step tracking method
- Build locally with Android Studio (more complex)

---

## Need Help?

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Support: https://expo.dev/support








