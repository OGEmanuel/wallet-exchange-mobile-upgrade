# 📊 Portfolio Implementation Guide

## 🎯 Overview

This guide explains the complete portfolio implementation using the SDK's `getUserPortfolio` method, including authentication handling and error management.

## 🏗️ Architecture

### Core Components

1. **Portfolio Interfaces** (`interfaces/portfolio.interface.ts`)
   - TypeScript definitions for SDK response
   - Processed data structures for UI

2. **Portfolio Service** (`services/portfolio.service.ts`)
   - Data transformation and formatting
   - Utility functions for display

3. **Portfolio Hook** (`hooks/usePortfolio.tsx`)
   - Simplified data access
   - Authentication state management

4. **UI Components**
   - `AssetsSection.tsx` - Main assets display
   - `PortfolioErrorState.tsx` - Error handling
   - `AuthStatusDebug.tsx` - Debug information

## 🔐 Authentication Issues & Solutions

### Common Authentication Errors

Based on the terminal logs, you're experiencing:

```
WARN: Retrying request after 4779.821371552958ms {"attempt":3,"maxRetries":3,"error":"Token refresh failed - no valid token available"}
WARN: No token available for authenticated endpoint {"url":"/portfolio/user/68e7f61176e8c705fab1f5c7?limit=50&skip=0&includeInactive=false"}
```

### Root Causes

1. **Token Expiration**: Authentication tokens have expired
2. **Invalid Session**: User session is no longer valid
3. **Network Issues**: Connection problems preventing token refresh
4. **SDK State**: SDK not properly initialized or authenticated

### Solutions Implemented

#### 1. Enhanced Authentication Checks

```typescript
// In wallet-context.tsx
const refreshPortfolio = async (): Promise<void> => {
  try {
    // Check if user is authenticated before making portfolio request
    if (!isWalletAuthenticated || !currentWalletUser) {
      console.warn("Cannot refresh portfolio: User not authenticated");
      setError("User not authenticated");
      return;
    }
    // ... rest of implementation
  } catch (error) {
    // Handle authentication errors specifically
    if (error?.message?.includes('token') || error?.message?.includes('auth')) {
      console.log("Authentication error detected, attempting to re-authenticate...");
    }
  }
};
```

#### 2. Improved Error Handling

```typescript
// In usePortfolio.tsx
useEffect(() => {
  if (!isWalletAuthenticated || !currentWalletUser) {
    setError('User not authenticated. Please log in to view portfolio.');
  } else if (walletError) {
    setError(walletError);
  }
}, [isWalletAuthenticated, currentWalletUser, walletError]);
```

#### 3. User-Friendly Error States

The `PortfolioErrorState` component provides:
- Clear error messages
- Retry functionality
- Login redirection
- Debug information (development only)

## 🚀 Usage Examples

### Basic Portfolio Usage

```typescript
import { usePortfolio } from '@/hooks/usePortfolio';

function MyComponent() {
  const { 
    portfolio, 
    isLoading, 
    error, 
    refresh, 
    hasAssets, 
    totalValue 
  } = usePortfolio();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refresh} />;
  if (!hasAssets) return <EmptyState />;

  return (
    <View>
      <Text>Total Value: ${totalValue}</Text>
      {portfolio.enabledAssets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </View>
  );
}
```

### Advanced Error Handling

```typescript
import PortfolioErrorState from '@/components/dashboard/PortfolioErrorState';

function PortfolioWithErrorHandling() {
  const { portfolio, error, refresh } = usePortfolio();
  
  return (
    <View>
      {error ? (
        <PortfolioErrorState 
          error={error}
          onRetry={refresh}
          onLogin={() => router.push('/login')}
        />
      ) : (
        <PortfolioDisplay portfolio={portfolio} />
      )}
    </View>
  );
}
```

## 🔧 Troubleshooting

### Debug Authentication Status

Add the debug component to see authentication state:

```typescript
import AuthStatusDebug from '@/components/dashboard/AuthStatusDebug';

// Only shows in development
<AuthStatusDebug />
```

### Common Issues & Fixes

#### 1. "User not authenticated" Error

**Cause**: User not logged in or session expired
**Solution**: 
- Check `isWalletAuthenticated` status
- Redirect to login page
- Re-authenticate user

#### 2. "Token refresh failed" Error

**Cause**: Authentication token expired and can't be refreshed
**Solution**:
- Clear stored credentials
- Re-login user
- Check network connectivity

#### 3. "No token available" Error

**Cause**: SDK not properly authenticated
**Solution**:
- Verify SDK initialization
- Check authentication flow
- Ensure proper login sequence

### Manual Authentication Check

```typescript
const { isWalletAuthenticated, currentWalletUser, error } = useWallet();

console.log('Auth Status:', {
  authenticated: isWalletAuthenticated,
  userId: currentWalletUser,
  error: error
});
```

## 📱 UI States

### Loading State
- Shows spinner and "Loading assets..." message
- Prevents user interaction during fetch

### Error State
- Clear error message with context
- Retry button for network issues
- Login button for authentication issues
- Debug info in development mode

### Empty State
- Shows when no assets are found
- Provides refresh option
- Helpful messaging

### Success State
- Displays portfolio summary
- Shows asset list with proper formatting
- Includes manage button for asset management

## 🔄 Data Flow

1. **User Focus** → Triggers `refreshPortfolio()`
2. **Authentication Check** → Verifies user is logged in
3. **SDK Call** → `getUserPortfolio()` with user ID
4. **Data Processing** → Transform raw data to UI format
5. **State Update** → Update portfolio state
6. **UI Render** → Display processed assets

## 🎨 Styling & Theming

All components use the app's theme system:
- Consistent colors and spacing
- Responsive design
- Dark/light mode support
- Proper typography hierarchy

## 🧪 Testing

### Test Authentication States

```typescript
// Test unauthenticated state
const mockUnauthenticated = {
  isWalletAuthenticated: false,
  currentWalletUser: null
};

// Test authenticated state
const mockAuthenticated = {
  isWalletAuthenticated: true,
  currentWalletUser: 'user123'
};
```

### Test Error Scenarios

```typescript
// Test network error
const networkError = "Failed to refresh portfolio. Please check your connection and try again.";

// Test auth error
const authError = "User not authenticated. Please log in to view portfolio.";
```

## 📋 Checklist

- [x] Portfolio data types defined
- [x] Service layer implemented
- [x] Hook created for easy usage
- [x] UI components built
- [x] Error handling added
- [x] Authentication checks implemented
- [x] Loading states added
- [x] Debug tools created
- [x] Documentation written

## 🚨 Important Notes

1. **Authentication Required**: Portfolio endpoints require valid authentication
2. **Token Management**: SDK handles token refresh automatically
3. **Error Recovery**: Users can retry failed requests
4. **Debug Mode**: Additional info shown in development
5. **User Experience**: Clear messaging for all states

## 🔗 Related Files

- `interfaces/portfolio.interface.ts` - Data types
- `services/portfolio.service.ts` - Business logic
- `hooks/usePortfolio.tsx` - React hook
- `components/dashboard/AssetsSection.tsx` - Main UI
- `components/dashboard/PortfolioErrorState.tsx` - Error handling
- `app/dashboard/home/wallet-home/home.tsx` - Integration

This implementation provides a robust, user-friendly portfolio system with proper error handling and authentication management.
