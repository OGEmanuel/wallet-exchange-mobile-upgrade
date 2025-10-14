# Zap Blockchain SDK Integration Guide

## 🚀 Overview

This guide provides step-by-step instructions for integrating the Zap Blockchain SDK into your React Native wallet exchange application. The integration includes authentication, wallet management, portfolio tracking, and swap functionality.

## 📁 File Structure

```
src/core/sdk/
├── zap-sdk.config.ts          # SDK configuration
├── zap-sdk.service.ts         # SDK service singleton
├── useZapSDK.ts              # React hook for SDK access
├── error-handler.ts          # Error handling utilities
├── retry-utils.ts            # Retry logic with exponential backoff
└── __tests__/
    └── zap-sdk.test.ts       # Unit tests

components/
├── onboarding/
│   ├── LoginToZap.tsx        # Updated with SDK integration
│   └── OTPVerification.tsx   # New OTP verification component
├── wallet/
│   ├── WalletCreateWithSDK.tsx    # Wallet creation with SDK
│   └── WalletImportWithSDK.tsx    # Wallet import with SDK
├── dashboard/
│   └── PortfolioWithSDK.tsx       # Portfolio management with SDK
└── swap/
    └── SwapWithSDK.tsx            # Swap functionality with SDK
```

## 🔧 Installation & Setup

### 1. Install Dependencies

The Zap SDK is already installed in your `package.json`:

```json
{
  "dependencies": {
    "@zap/blockchain-sdk": "https://x-token-auth:ATCTT3xFfGN0m8PCUvYzPZLslIoqq2g_hwoxPDUJAYjAP5tj1mNK9EoV9vHT5IaDAcAYO3EjhNVuaNUlzwScyknukGsP6ZjRTzC9fCvoz3yWCDydq86ckNC127g-eGne0GXJY8ufemL5vzIoYb5-G2soXNJYGg8q6U70wvsjgi2iz0AgTxgbnDA=21025D81@bitbucket.org/zapspace/zap-blockchain-sdk.git#v0.1.0"
  }
}
```

### 2. Environment Configuration

The SDK automatically detects your environment:

- **Development**: `http://localhost:3005`
- **Staging**: `https://staging-api.zap.africa`
- **Production**: `https://api.zap.africa`

## 🏗️ Core Integration

### 1. SDK Service (Singleton)

```typescript
// src/core/sdk/zap-sdk.service.ts
import { ZapSDK } from '@zap/blockchain-sdk';
import { createSDKInstance } from './zap-sdk.config';

class ZapSDKService {
  private static instance: ZapSDKService;
  private sdk: ZapSDK | null = null;
  private isInitialized = false;

  public static getInstance(): ZapSDKService {
    if (!ZapSDKService.instance) {
      ZapSDKService.instance = new ZapSDKService();
    }
    return ZapSDKService.instance;
  }

  public async initialize(): Promise<boolean> {
    // Initialize SDK with configuration
    this.sdk = createSDKInstance();
    await this.sdk.initialize();
    this.isInitialized = true;
    return true;
  }

  public getSDK(): ZapSDK {
    if (!this.sdk) {
      throw new Error('SDK not initialized');
    }
    return this.sdk;
  }
}

export const zapSDKService = ZapSDKService.getInstance();
```

### 2. React Hook for Easy Access

```typescript
// src/core/sdk/useZapSDK.ts
import { useEffect, useState } from 'react';
import { ZapSDK } from '@zap/blockchain-sdk';
import zapSDKService from './zap-sdk.service';

export const useZapSDK = () => {
  const [sdk, setSdk] = useState<ZapSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      const success = await zapSDKService.initialize();
      if (success) {
        setSdk(zapSDKService.getSDK());
        setIsInitialized(true);
      }
    } catch (error) {
      setError('Failed to initialize SDK');
    } finally {
      setIsLoading(false);
    }
  };

  return { sdk, isInitialized, isLoading, error };
};
```

## 🔐 Authentication Integration

### 1. Exchange Authentication (OTP-based)

```typescript
// components/onboarding/LoginToZap.tsx
import { useZapSDK } from '@/src/core/sdk/useZapSDK';

export default function LoginToZap({ onLoginSuccess }) {
  const { sdk, isInitialized } = useZapSDK();

  const handleLogin = async () => {
    if (!sdk || !isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    try {
      const result = await sdk.sendExchangeOtp(email);
      if (result.success) {
        Alert.alert('Success', 'OTP sent to your email');
        onLoginSuccess?.(email);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    }
  };
}
```

### 2. OTP Verification

```typescript
// components/onboarding/OTPVerification.tsx
export default function OTPVerification({ email, onVerificationSuccess }) {
  const { sdk, isInitialized } = useZapSDK();

  const handleVerification = async () => {
    try {
      const result = await sdk.validateExchangeOtp(email, otp);
      if (result.success) {
        onVerificationSuccess?.(result.data.userId);
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP');
    }
  };
}
```

## 💼 Wallet Management Integration

### 1. Wallet Creation

```typescript
// components/wallet/WalletCreateWithSDK.tsx
export default function WalletCreateWithSDK({ onCreateSuccess }) {
  const { sdk, isInitialized } = useZapSDK();

  const handleCreateWallet = async () => {
    try {
      const result = await sdk.createWalletGroupMultipurpose({
        name: walletName,
        seedPhrase: sdk.generateSeedPhrase(),
        walletType: 'SEEDPHRASE'
      });

      if (result.success) {
        onCreateSuccess?.(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet');
    }
  };
}
```

### 2. Wallet Import

```typescript
// components/wallet/WalletImportWithSDK.tsx
export default function WalletImportWithSDK({ onImportSuccess }) {
  const { sdk, isInitialized } = useZapSDK();

  const handleImport = async () => {
    let result;

    switch (importType) {
      case 'seedphrase':
        result = await sdk.createWalletGroupMultipurpose({
          name: walletName,
          seedPhrase: seedPhrase,
          walletType: 'SEEDPHRASE'
        });
        break;

      case 'privatekey':
        result = await sdk.createWalletGroupMultipurpose({
          name: walletName,
          privateKey: privateKey,
          walletType: 'PRIVATE_KEY'
        });
        break;

      case 'watch':
        result = await sdk.createWalletGroupMultipurpose({
          name: walletName,
          watchAddress: watchAddress,
          walletType: 'WATCH'
        });
        break;
    }

    if (result.success) {
      onImportSuccess?.(result.data);
    }
  };
}
```

## 📊 Portfolio Integration

```typescript
// components/dashboard/PortfolioWithSDK.tsx
export default function PortfolioWithSDK() {
  const { sdk, isInitialized } = useZapSDK();
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    if (isInitialized && sdk) {
      loadPortfolio();
    }
  }, [isInitialized, sdk]);

  const loadPortfolio = async () => {
    try {
      const portfolioData = await sdk.portfolio.getPortfolio();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  };

  return (
    <ScrollView>
      {/* Portfolio UI */}
      <CustomText>Total Value: ${portfolio?.totalValueUSD}</CustomText>
      {/* Asset list, performance charts, etc. */}
    </ScrollView>
  );
}
```

## 🔄 Swap Integration

```typescript
// components/swap/SwapWithSDK.tsx
export default function SwapWithSDK({ onSwapSuccess }) {
  const { sdk, isInitialized } = useZapSDK();

  const handleSwap = async () => {
    try {
      // This would use the SDK's swap functionality
      const result = await sdk.swap.executeSwap({
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        slippage: 0.5
      });

      if (result.success) {
        onSwapSuccess?.(result.txHash);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to execute swap');
    }
  };
}
```

## 🛠️ Error Handling & Retry Logic

### 1. Error Handler

```typescript
// src/core/sdk/error-handler.ts
export const handleSDKError = (error: any): ZapSDKError => {
  if (error.code === 'NETWORK_ERROR') {
    return new ZapSDKError({
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      isRetryable: true,
    });
  }

  if (error.status === 401) {
    return new ZapSDKError({
      code: 'AUTHENTICATION_ERROR',
      message: 'Authentication failed',
      isRetryable: false,
    });
  }

  // Handle other error types...
};
```

### 2. Retry Logic

```typescript
// src/core/sdk/retry-utils.ts
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const config = { ...defaultRetryOptions, ...options };

  for (let attempt = 0; attempt < config.maxAttempts!; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const sdkError = handleSDKError(error);
      
      if (!shouldRetry(sdkError, attempt, config.maxAttempts)) {
        throw sdkError;
      }

      const delay = Math.min(
        config.baseDelay! * Math.pow(2, attempt),
        config.maxDelay!
      );

      await sleep(delay);
    }
  }
};
```

## 🧪 Testing

### 1. Unit Tests

```typescript
// src/core/sdk/__tests__/zap-sdk.test.ts
import { ZapSDK } from '@zap/blockchain-sdk';
import zapSDKService from '../zap-sdk.service';

// Mock the SDK
jest.mock('@zap/blockchain-sdk', () => ({
  ZapSDK: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(true),
    walletAuth: {
      login: jest.fn().mockResolvedValue({ success: true }),
    },
  })),
}));

describe('ZapSDKService', () => {
  it('should initialize SDK successfully', async () => {
    const result = await zapSDKService.initialize();
    expect(result).toBe(true);
  });
});
```

### 2. Integration Tests

```typescript
describe('SDK Integration', () => {
  it('should handle complete authentication flow', async () => {
    await zapSDKService.initialize();
    
    const sdk = zapSDKService.getSDK();
    const result = await sdk.walletAuth.login({ deviceToken: 'test' });
    
    expect(result.success).toBe(true);
  });
});
```

## 🚀 Usage Examples

### 1. App Initialization

```typescript
// App.tsx
import { WalletProvider } from '@/src/core/wallet/wallet-context-new';

export default function App() {
  return (
    <WalletProvider>
      {/* Your app components */}
    </WalletProvider>
  );
}
```

### 2. Using the SDK in Components

```typescript
// Any component
import { useZapSDK } from '@/src/core/sdk/useZapSDK';

export default function MyComponent() {
  const { sdk, isInitialized, isLoading, error } = useZapSDK();

  if (isLoading) return <Text>Loading SDK...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (!isInitialized) return <Text>SDK not initialized</Text>;

  // Use sdk here
  const handleAction = async () => {
    const result = await sdk.someMethod();
  };
}
```

## 📱 Platform-Specific Considerations

### iOS
- Automatic keychain integration for secure token storage
- Background app refresh handling
- Push notification integration

### Android
- Encrypted SharedPreferences for token storage
- Background service handling
- Notification channel management

## 🔒 Security Best Practices

1. **Token Storage**: SDK automatically handles secure storage
2. **Error Handling**: Comprehensive error handling with retry logic
3. **Validation**: Input validation for all user inputs
4. **Logging**: Detailed logging for debugging (disabled in production)

## 🆘 Troubleshooting

### Common Issues

1. **SDK Not Initialized**
   ```typescript
   if (!sdk || !isInitialized) {
     Alert.alert('Error', 'SDK not initialized');
     return;
   }
   ```

2. **Network Errors**
   - Check internet connection
   - Verify API endpoints
   - Implement retry logic

3. **Authentication Failures**
   - Verify device tokens
   - Check OTP validity
   - Handle token refresh

### Debug Mode

```typescript
// Enable debug logging
const sdk = new ZapSDK({
  enableLogging: __DEV__,
  // ... other config
});
```

## 📚 Next Steps

1. **Replace Existing Components**: Gradually replace existing components with SDK-integrated versions
2. **Add More Features**: Implement additional SDK features like token management, analytics
3. **Performance Optimization**: Implement caching and request optimization
4. **Testing**: Add comprehensive test coverage
5. **Documentation**: Update user documentation with new features

## 🎉 Conclusion

The Zap Blockchain SDK integration provides a robust foundation for your wallet exchange application. The modular architecture allows for easy maintenance and feature additions while providing comprehensive error handling and testing capabilities.

For additional support, refer to the SDK documentation or contact the development team.
