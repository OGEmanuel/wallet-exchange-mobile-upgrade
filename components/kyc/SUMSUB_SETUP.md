# Sumsub Verification Integration

This document describes the Sumsub verification integration for React Native (Expo managed workflow).

## Installation

Install the Sumsub React Native SDK:

```bash
npm install @sumsub/react-native-mobilesdk-module
```

### iOS Setup

For iOS, run pod install:

```bash
cd ios && pod install && cd ..
```

### Android Setup

Since this is an Expo managed workflow, Android should auto-link the native modules. Follow these steps:

#### Step 1: Generate Android Native Code (If needed)

If you haven't generated the Android project yet:

```bash
npx expo prebuild --platform android
```

**Note:** If using EAS Build, this step is handled automatically.

#### Step 2: Run Setup Script

We've created a setup script to help configure Android:

```bash
node scripts/setup-android-sumsub.js
```

This script will:
- Check if Android project exists
- Add Sumsub Maven repositories to `android/build.gradle`
- Verify required permissions

#### Step 3: Manual Configuration (Alternative)

If the script doesn't work or you prefer manual setup:

1. **Add Sumsub Maven Repository** to `android/build.gradle` (project-level):
   ```groovy
   allprojects {
       repositories {
           google()
           mavenCentral()
           // Add Sumsub repositories
           maven { url "https://maven.sumsub.com/repository/maven-releases/" }
           maven { url "https://maven.sumsub.com/repository/maven-public/" }
       }
   }
   ```

2. **Verify Permissions** in `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
   ```

3. **Sync Gradle**:
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

#### Step 4: Rebuild the App

After configuration, rebuild your Android app:

```bash
# For development builds
npx expo run:android

# Or for EAS Build
eas build --platform android --profile development
```

#### Android Permissions

The Sumsub SDK requires these permissions:

- `CAMERA` - For document and selfie capture
- `INTERNET` - For API communication
- `WRITE_EXTERNAL_STORAGE` - For storing temporary files (Android 10+ may not need this)
- `READ_EXTERNAL_STORAGE` - For accessing media (Android 10+ may not need this)

These are usually auto-added, but verify they exist in `AndroidManifest.xml`.

**📋 See `ANDROID_SUMSUB_SETUP.md` for detailed Android setup instructions.**

## Configuration

The Sumsub SDK is initialized automatically when a document type with `isExternal.token` is selected. The token is provided by your backend API in the `documentType.isExternal.token` field.

## Usage

The `SumsubVerification` component is automatically displayed when a document type requires Sumsub verification (when `documentType.isExternal?.token` exists).

### Flow

1. User selects a document type that requires Sumsub verification
2. The component initializes the Sumsub SDK with the token from the backend
3. User clicks "Start Verification" button
4. Sumsub's native verification UI opens
5. User completes the verification process
6. Result is passed back via `onVerificationComplete` callback

### Verification Results

The component handles the following verification statuses:

- **approved**: Verification was successful
- **pending**: Verification is pending review
- **rejected**: Verification was rejected
- **close**: User closed the verification flow

## Component Props

```typescript
interface SumsubVerificationProps {
  documentType: CountryVerificationDocumentModel;
  onVerificationComplete?: (result: any) => void;
  onBack?: () => void;
}
```

## Notes

- The Sumsub token is provided by your backend API
- The SDK handles all native UI flows
- Verification results are automatically handled by the component
- If the SDK is not installed, a helpful error message is displayed

## Troubleshooting

### Module Not Found Error

If you see "Cannot find module" error, make sure you've installed the package:

```bash
npm install @sumsub/react-native-mobilesdk-module
```

### iOS Setup

For iOS, ensure you've run pod install:

```bash
cd ios && pod install
```

### Token Issues

If verification fails to initialize, check that:
- The token is valid and not expired
- The token is properly formatted
- Your backend is generating tokens correctly

