# Android Sumsub Setup Guide

This guide explains how to configure Sumsub for Android in your Expo React Native project.

## Prerequisites

The Sumsub package is already installed via npm:
```bash
npm install @sumsub/react-native-mobilesdk-module
```

## Setup Steps

### Step 1: Generate Android Native Code (If needed)

Since this is an Expo managed workflow, you need to generate the native Android project first:

```bash
npx expo prebuild --platform android
```

**Note:** Only run this if you haven't generated Android native code yet. If you're using EAS Build, this step is handled automatically.

### Step 2: Add Sumsub Maven Repository

After generating the Android project, you need to add Sumsub's Maven repository.

**File:** `android/build.gradle` (project-level, not app-level)

Add the Sumsub repository to the `allprojects` section:

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        // ... other repositories ...
        
        // Add Sumsub Maven repository
        maven { 
            url "https://maven.sumsub.com/repository/maven-releases/" 
        }
        maven { 
            url "https://maven.sumsub.com/repository/maven-public/" 
        }
    }
}
```

### Step 3: Verify Auto-linking

The Sumsub SDK should be auto-linked by React Native. Verify this by checking:

**File:** `android/settings.gradle`

It should include something like:
```groovy
include ':react-native-mobilesdk-module'
project(':react-native-mobilesdk-module').projectDir = new File(rootProject.projectDir, '../node_modules/@sumsub/react-native-mobilesdk-module/android')
```

### Step 4: Android Permissions

The Sumsub SDK requires certain permissions. These are usually added automatically, but verify in:

**File:** `android/app/src/main/AndroidManifest.xml`

Ensure these permissions exist:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Sumsub Required Permissions -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Storage permissions (for Android 10 and below) -->
    <uses-permission 
        android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
        android:maxSdkVersion="28" />
    <uses-permission 
        android:name="android.permission.READ_EXTERNAL_STORAGE" 
        android:maxSdkVersion="32" />
    
    <!-- ... rest of your manifest ... -->
</manifest>
```

### Step 5: Sync Gradle

After making changes, sync Gradle:

```bash
cd android && ./gradlew clean && cd ..
```

Or if you're using Android Studio, use "Sync Project with Gradle Files".

### Step 6: Rebuild the App

Rebuild your Android app:

```bash
# For development builds
npx expo run:android

# Or for EAS Build
eas build --platform android --profile development
```

## Verification

After setup, verify the integration:

1. Check that the Sumsub SDK is listed in your dependencies
2. Run the app and test the Sumsub verification flow
3. Check Android logs if you encounter any issues:

```bash
npx expo run:android --log
```

## Troubleshooting

### Issue: "Could not find com.sumsub.sns:idensic-mobile-sdk"

**Solution:** Make sure you've added the Sumsub Maven repository to `android/build.gradle` and synced Gradle.

### Issue: Auto-linking not working

**Solution:** If auto-linking fails, manually link the module in `android/settings.gradle`:

```groovy
include ':react-native-mobilesdk-module'
project(':react-native-mobilesdk-module').projectDir = new File(
    rootProject.projectDir,
    '../node_modules/@sumsub/react-native-mobilesdk-module/android'
)
```

Then in `android/app/build.gradle`, add:

```groovy
dependencies {
    // ... other dependencies ...
    implementation project(':react-native-mobilesdk-module')
}
```

### Issue: Permission Denied Errors

**Solution:** Ensure all required permissions are in `AndroidManifest.xml` and request them at runtime in your React Native code if needed.

### Issue: Build Errors

**Solution:** 
1. Clean your build: `cd android && ./gradlew clean && cd ..`
2. Clear Metro cache: `npx expo start --clear`
3. Rebuild: `npx expo run:android`

## Using EAS Build

If you're using EAS Build, the Android project is generated automatically. You still need to ensure:

1. The Maven repository is added (you may need an Expo config plugin or modify the generated `android/build.gradle`)
2. Permissions are correctly configured
3. The app is rebuilt via EAS

## Next Steps

Once Android setup is complete:
1. The `SumsubVerification` component will work on Android
2. Test the verification flow on an Android device or emulator
3. Monitor Android logs for any runtime issues

