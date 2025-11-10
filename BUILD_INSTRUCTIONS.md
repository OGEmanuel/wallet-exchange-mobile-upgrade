# Build Instructions - Disabling Capability Sync

## The Issue

The capability sync error occurs during the credential setup phase (before the build starts), so the environment variable in `eas.json` might not be applied early enough.

## Solution

You need to set the `EXPO_NO_CAPABILITY_SYNC=1` environment variable **before** running the build command.

### Option 1: Set in your shell (Recommended)

```bash
export EXPO_NO_CAPABILITY_SYNC=1
eas build --platform ios --profile production
```

### Option 2: Set inline with the command

```bash
EXPO_NO_CAPABILITY_SYNC=1 eas build --platform ios --profile production
```

### Option 3: Add to your shell profile (Permanent)

Add this to your `~/.zshrc` or `~/.bash_profile`:

```bash
export EXPO_NO_CAPABILITY_SYNC=1
```

Then reload your shell:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

## Why This Happens

The capability sync error occurs when EAS is setting up credentials and trying to sync capabilities with Apple Developer. This happens **before** the build profile environment variables from `eas.json` are loaded, so you need to set it as a shell environment variable.

## Verification

After setting the variable, you can verify it's set:
```bash
echo $EXPO_NO_CAPABILITY_SYNC
# Should output: 1
```

## Current Configuration

- ✅ Bundle ID: `com.zapapp` (set in app.json and native projects)
- ✅ Apple Developer Account: `zayn@zap.africa`
- ✅ Team: "Zap technology Limited" (126789730)
- ✅ `EXPO_NO_CAPABILITY_SYNC=1` in `eas.json` (for build phase)
- ⚠️ Need to set `EXPO_NO_CAPABILITY_SYNC=1` in shell (for credential phase)

## If Error Persists

If you still get the capability sync error even after setting the environment variable, you can:

1. **Manually configure capabilities in Apple Developer Console**:
   - Go to: https://developer.apple.com/account/resources/identifiers/bundleId/edit/9Y6Q5CJ798
   - Configure the capabilities manually (APPLE_ID_AUTH, ASSOCIATED_DOMAINS, etc.)
   - Then run the build again

2. **Check if there are apps blocking the bundle ID**:
   - The error mentions "The bundle '9Y6Q5CJ798' cannot be deleted"
   - This might indicate there are existing apps associated with this bundle ID
   - You may need to handle those apps first in App Store Connect

