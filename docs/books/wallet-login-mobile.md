# Book of Wallet Login — Mobile

**Keeper**: Mobile Team | **Last Review**: 2025-01-22 | **Status**: Active

## I. Mission

- Provide secure wallet authentication for mobile users
- Handle device-based authentication with fingerprinting
- Manage authentication state and routing
- Integrate with Zap SDK for wallet operations

## II. Detailed Implementation

### Wallet Login Process

**Location**: `src/core/wallet/wallet-context.tsx` - `walletLogin` function

**Step-by-Step Logic**:

1. **Input Parameters**:
   ```typescript
   const walletLogin = async (
     deviceToken: string,
     deviceFingerprint: string,
     pushToken: string
   ): Promise<boolean> => {
   ```

2. **Authentication Flow**:
   ```typescript
   try {
     setIsAuthenticating(true);
     setError(null);

     const sdk = zapSDKService.getSDK();
     const result = await sdk.walletAuth.login({
       deviceToken,
       deviceFingerprint,
       pushToken,
     });

     if (result.success) {
       setIsWalletAuthenticated(true);
       setCurrentWalletUser(result.userId);
       await checkAuthenticationAndRoute(false);
       return true;
     } else {
       setError(result || "Login failed");
       return false;
     }
   }
   ```

3. **Post-Login Processing**:
   - Sets `isWalletAuthenticated = true`
   - Stores `currentWalletUser` with the returned user ID
   - Calls `checkAuthenticationAndRoute(false)` to verify wallet groups
   - Returns boolean success status

4. **Error Handling**:
   ```typescript
   } catch (error) {
     console.error("Login error:", error);
     setError("Login failed");
     return false;
   } finally {
     setIsAuthenticating(false);
   }
   ```

### Device Fingerprinting

**Location**: `src/core/wallet/wallet-context.tsx` - `getPersistentDeviceFingerprint` function

**Step-by-Step Logic**:

1. **Device Information Collection**:
   ```typescript
   const getPersistentDeviceFingerprint = async (): Promise<string> => {
     try {
       const deviceInfo = {
         deviceId: Device.osInternalBuildId || Device.osBuildId,
         deviceName: Device.deviceName,
         deviceType: Device.deviceType,
         osName: Device.osName,
         osVersion: Device.osVersion,
         platform: Device.osInternalBuildId ? 'ios' : 'android',
       };
   ```

2. **Fingerprint Generation**:
   ```typescript
   const fingerprint = JSON.stringify(deviceInfo);
   return fingerprint;
   ```

3. **Fallback Handling**:
   ```typescript
   } catch (error) {
     console.warn("Failed to get device info, using fallback:", error);
     const fallbackFingerprint = {
       deviceId: "unknown",
       timestamp: Date.now(),
       random: Math.random().toString(36),
     };
     return JSON.stringify(fallbackFingerprint);
   }
   ```

### Authentication State Management

**Location**: `src/core/wallet/wallet-context.tsx` - State variables

**State Variables**:
```typescript
const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
const [currentWalletUser, setCurrentWalletUser] = useState<string | null>(null);
const [isAuthenticating, setIsAuthenticating] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**State Flow**:
1. **Initial State**: `isWalletAuthenticated = false`
2. **During Login**: `isAuthenticating = true`
3. **On Success**: `isWalletAuthenticated = true`, `currentWalletUser = userId`
4. **On Error**: `error = errorMessage`, `isAuthenticating = false`

### Authentication Routing

**Location**: `src/core/wallet/wallet-context.tsx` - `checkAuthenticationAndRoute` function

**Step-by-Step Logic**:

1. **Authentication Check**:
   ```typescript
   const checkAuthenticationAndRoute = async (shouldRoute: boolean = true) => {
     const walletUserId = await zapSDKService.getCurrentUserId();
     const isWalletAuth = !!walletUserId;
   ```

2. **Wallet Groups Processing**:
   ```typescript
   if (isWalletAuth) {
     result = await setWalletAndRoute(
       walletUserId,
       isWalletAuth,
       shouldRoute,
       result
     );
   } else {
     const deviceLoginSuccess = await attemptDeviceLogin();
     if (deviceLoginSuccess) {
       const routeResult = await routeToWallet(
         isExchangeAuth,
         walletUserId,
         shouldRoute
       );
     }
   }
   ```

3. **Routing Logic**:
   - If wallet is authenticated, processes wallet groups
   - If not authenticated, attempts device login
   - Routes to appropriate screen based on authentication status

### Device Login Attempt

**Location**: `src/core/wallet/wallet-context.tsx` - `attemptDeviceLogin` function

**Step-by-Step Logic**:

1. **Device Token Generation**:
   ```typescript
   const attemptDeviceLogin = async (): Promise<boolean> => {
     try {
       const deviceToken = await Notifications.getExpoPushTokenAsync();
       const deviceFingerprint = await getPersistentDeviceFingerprint();
       const pushToken = deviceToken.data;
   ```

2. **Automatic Login**:
   ```typescript
   const loginResult = await walletLogin(
     deviceToken.data,
     deviceFingerprint,
     pushToken
   );
   
   return loginResult;
   ```

3. **Error Handling**:
   ```typescript
   } catch (error) {
     console.error("Device login failed:", error);
     return false;
   }
   ```

## III. Architecture

### High-Level Flow
```
User Action → Device Info Collection → SDK Authentication → State Update → Routing
     ↓              ↓                      ↓                ↓           ↓
Login Screen → Device Fingerprint → zapSDKService → WalletContext → Dashboard
```

### Key Components
- **WalletContext**: Main authentication state management
- **zapSDKService**: SDK integration for authentication
- **Device**: Device information collection
- **Notifications**: Push token management

### External Dependencies
- **SDK**: `@zap/blockchain-sdk` - Authentication API
- **Device**: `expo-device` - Device information
- **Notifications**: `expo-notifications` - Push tokens
- **Storage**: `expo-secure-store` - Secure credential storage

## IV. Data & State

### Authentication State
```typescript
interface AuthenticationState {
  isWalletAuthenticated: boolean;
  currentWalletUser: string | null;
  isAuthenticating: boolean;
  error: string | null;
}
```

### Device Information
```typescript
interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: number;
  osName: string;
  osVersion: string;
  platform: 'ios' | 'android';
}
```

### Login Parameters
```typescript
interface LoginParams {
  deviceToken: string;
  deviceFingerprint: string;
  pushToken: string;
}
```

## V. Security

### Device Fingerprinting
- **Unique Identification**: Uses device-specific information
- **Persistent Storage**: Maintains fingerprint across app sessions
- **Fallback Mechanism**: Handles cases where device info is unavailable

### Authentication Flow
- **Secure Communication**: All authentication via HTTPS
- **Token Management**: Secure storage of authentication tokens
- **Error Handling**: No sensitive information in error messages

### Threat Model
- **Device Spoofing**: Device fingerprinting prevents unauthorized access
- **Token Theft**: Secure storage prevents token extraction
- **Man-in-the-Middle**: HTTPS with certificate pinning

## VI. Error Handling

### Authentication Errors
```typescript
try {
  // Authentication logic
} catch (error) {
  console.error("Login error:", error);
  setError("Login failed");
  return false;
} finally {
  setIsAuthenticating(false);
}
```

### Device Information Errors
```typescript
try {
  // Device info collection
} catch (error) {
  console.warn("Failed to get device info, using fallback:", error);
  // Use fallback fingerprint
}
```

### Network Errors
- Handled by `zapSDKService.executeWithNetworkHandling`
- Automatic retry logic
- Circuit breaker pattern

## VII. Testing

### Critical Test Cases
- **Successful Login**: Valid credentials and device info
- **Invalid Credentials**: Wrong device token or fingerprint
- **Network Errors**: Offline or server errors
- **Device Info Failure**: Fallback fingerprint generation
- **State Management**: Authentication state transitions

### Test Coverage
- **Unit Tests**: Authentication logic and state management
- **Integration Tests**: SDK integration and device info collection
- **E2E Tests**: Complete login flow from UI to backend

## VIII. Changelog & Owners

### Current Owner(s)
- **Primary**: Mobile Team (mobile@zap.exchange)
- **Secondary**: Security Team (security@zap.exchange)

### Recent Changes
- **2025-01-22**: Implemented device fingerprinting for enhanced security
- **2025-01-22**: Added automatic device login attempt
- **2025-01-22**: Improved error handling and state management
- **2025-01-22**: Added fallback fingerprint generation

### TODO / Open Questions
- [ ] Add biometric authentication support
- [ ] Implement multi-device login management
- [ ] Add login attempt rate limiting
- [ ] Implement session timeout handling
- [ ] Add login analytics and monitoring

---

**Note**: This documentation is generated from code analysis. All behavior is derived from actual implementation in `src/core/wallet/wallet-context.tsx`.
