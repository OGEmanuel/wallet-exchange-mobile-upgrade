# EAS Submission Guide - Bundle ID Configuration

## Current Configuration

Your app is configured with:
- **Bundle ID**: `com.zapapp` (iOS and Android)
- **App Name**: "Zap Wallet"
- **EAS Project ID**: `024a9f16-05df-4af1-8688-c9552b3b89e8`

## Bundle ID Verification

The bundle ID `com.zapapp` is correctly set in:

1. **app.json**:
   - iOS: `"bundleIdentifier": "com.zapapp"`
   - Android: `"package": "com.zapapp"`

2. **Native iOS Project**:
   - `ios/ZapWallet.xcodeproj/project.pbxproj`: `PRODUCT_BUNDLE_IDENTIFIER = com.zapapp`

3. **Native Android Project**:
   - `android/app/build.gradle`: `applicationId 'com.zapapp'` and `namespace 'com.zapapp'`

## Using the Correct Apple Developer Account

Since the bundle ID `com.zapapp` is registered under **"Zap technology Limited"** (Team ID: 126789730), you need to ensure you're using the correct Apple Developer account credentials when submitting.

### Steps to Configure:

1. **Verify Apple Developer Account**:
   - Make sure you have access to the Apple Developer account that owns the bundle ID
   - The bundle ID is registered at: https://developer.apple.com/account/resources/identifiers/bundleId/edit/9Y6Q5CJ798

2. **Configure EAS Credentials**:
   ```bash
   # Configure iOS credentials (will prompt for Apple ID and team selection)
   eas credentials
   
   # Or configure during submission
   eas submit --platform ios
   ```

3. **During Submission**:
   - EAS will prompt you to select the Apple Developer account
   - Choose the account that owns "Zap technology Limited" (Team ID: 126789730)
   - EAS will use the correct credentials automatically

4. **Manual Configuration (Optional)**:
   If you want to pre-configure credentials, you can add them to `eas.json`:
   ```json
   {
     "submit": {
       "production": {
         "ios": {
           "appleId": "your-apple-id@example.com",
           "ascAppId": "your-app-store-connect-app-id",
           "appleTeamId": "126789730"
         }
       }
     }
   }
   ```

## Verifying Bundle ID Before Submission

Before submitting, verify the bundle ID is correct:

```bash
# Check iOS bundle ID in Xcode project
grep "PRODUCT_BUNDLE_IDENTIFIER" ios/ZapWallet.xcodeproj/project.pbxproj

# Check Android package in build.gradle
grep "applicationId" android/app/build.gradle

# Check app.json
grep -E "bundleIdentifier|package" app.json
```

All should show `com.zapapp`.

## Building and Submitting

1. **Build for Production**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**:
   ```bash
   eas submit --platform ios --profile production
   ```

   EAS will:
   - Prompt you to select the Apple Developer account
   - Use the bundle ID `com.zapapp` from your configuration
   - Submit to the App Store Connect app associated with that bundle ID

## Important Notes

- The bundle ID must match exactly between:
  - `app.json` (iOS `bundleIdentifier` and Android `package`)
  - Native iOS project (`PRODUCT_BUNDLE_IDENTIFIER`)
  - Native Android project (`applicationId`)
  - Apple Developer account (registered bundle ID)

- If you get errors about bundle ID mismatches, run:
  ```bash
  npx expo prebuild --clean
  ```
  Then verify the bundle ID is still `com.zapapp` in all locations.

- The capability sync error is disabled with `EXPO_NO_CAPABILITY_SYNC=1` in `.env.local`, so you can manage capabilities manually in Apple Developer Console if needed.

