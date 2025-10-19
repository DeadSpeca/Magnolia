# 📱 Magnolia - Build Guide

This guide will help you build your Magnolia app for Android.

## 🚀 Quick Start - EAS Build (Recommended)

EAS Build is Expo's cloud build service. It's the easiest way to build your app.

### Prerequisites

- Node.js installed
- Expo account (free - sign up at https://expo.dev)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo credentials when prompted.

### Step 3: Configure Your Project

```bash
eas build:configure
```

This will set up your project for EAS Build (already done - eas.json exists).

### Step 4: Build APK (for testing/distribution)

```bash
# Build APK for testing
eas build --platform android --profile preview

# Or build production APK
eas build --platform android --profile production
```

The build will run in the cloud and you'll get a download link when it's done (usually 10-15 minutes).

### Step 5: Download and Install

- Click the download link from the terminal
- Transfer the APK to your Android device
- Install it (you may need to enable "Install from Unknown Sources")

---

## 🏗️ Alternative: Local Build

If you prefer to build locally without cloud services:

### Prerequisites

- Android Studio installed
- Android SDK configured
- Java JDK 17 or higher

### Method 1: Expo Local Build

```bash
# Export the app
npx expo export:android

# This creates an APK in the android/app/build/outputs/apk/ directory
```

### Method 2: React Native CLI Build

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build release APK
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Build Types

### Preview Build (APK)

- **Use for**: Testing, sharing with friends
- **Command**: `eas build --platform android --profile preview`
- **Output**: APK file (easy to install)
- **Size**: Larger file size

### Production Build (AAB)

- **Use for**: Google Play Store submission
- **Command**: `eas build --platform android --profile production`
- **Output**: AAB file (Android App Bundle)
- **Size**: Optimized, smaller downloads

---

## 🔧 Build Configuration

Your app is configured with:

- **Package Name**: `com.magnolia.app`
- **App Name**: Magnolia
- **Version**: 1.0.0
- **Permissions**: Storage access for reading book files

To change these, edit `app.json`:

```json
{
  "expo": {
    "name": "Magnolia",
    "version": "1.0.0",
    "android": {
      "package": "com.magnolia.app"
    }
  }
}
```

---

## 🎯 Publishing to Google Play Store

### Step 1: Build AAB

```bash
# Change buildType to "aab" in eas.json for production
eas build --platform android --profile production
```

### Step 2: Create Google Play Developer Account

- Go to https://play.google.com/console
- Pay one-time $25 registration fee
- Complete account setup

### Step 3: Create App Listing

- Upload your AAB file
- Add screenshots, description, icon
- Fill in required information
- Submit for review

### Step 4: Submit with EAS

```bash
eas submit --platform android
```

---

## 🐛 Troubleshooting

### Build Fails

- Check that all dependencies are installed: `npm install`
- Clear cache: `npx expo start --clear`
- Check EAS build logs for specific errors

### APK Won't Install

- Enable "Install from Unknown Sources" in Android settings
- Check that you have enough storage space
- Try uninstalling any previous version first

### App Crashes on Launch

- Check that all native dependencies are compatible
- Review crash logs: `adb logcat`
- Test in Expo Go first to verify functionality

---

## 📊 Build Status

Check your build status:

```bash
eas build:list
```

View build details:

```bash
eas build:view [BUILD_ID]
```

---

## 🔐 Code Signing (for Production)

EAS Build handles code signing automatically. For local builds:

### Generate Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore magnolia.keystore -alias magnolia -keyalg RSA -keysize 2048 -validity 10000
```

### Configure in app.json

```json
{
  "expo": {
    "android": {
      "package": "com.magnolia.app",
      "versionCode": 1
    }
  }
}
```

---

## 📱 Testing Your Build

### Install APK via ADB

```bash
adb install path/to/your-app.apk
```

### View Logs

```bash
adb logcat | grep ReactNative
```

---

## ✅ Pre-Build Checklist

Before building for production:

- [ ] Test all features in Expo Go
- [ ] Update version number in app.json
- [ ] Update app icon and splash screen
- [ ] Test on multiple Android devices/versions
- [ ] Review and update permissions
- [ ] Add privacy policy (if collecting data)
- [ ] Test dark/light themes
- [ ] Test all book formats (TXT, FB2, EPUB)
- [ ] Verify settings persistence
- [ ] Test file picker functionality

---

## 🎨 App Assets

Your app uses these assets (already configured):

- **Icon**: `./assets/icon.png` (1024x1024)
- **Adaptive Icon**: `./assets/adaptive-icon.png` (1024x1024)
- **Splash Screen**: `./assets/splash-icon.png`

To update:

1. Replace the image files
2. Rebuild the app

---

## 📞 Support

- **Expo Documentation**: https://docs.expo.dev
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **React Native Paper**: https://callstack.github.io/react-native-paper/

---

## 🚀 Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build preview APK
eas build --platform android --profile preview

# Build production
eas build --platform android --profile production

# Check build status
eas build:list

# Submit to Play Store
eas submit --platform android
```

---

**Good luck with your build! 🎉**
