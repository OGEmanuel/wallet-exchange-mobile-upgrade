# App State Reset Implementation

This document explains the comprehensive app state reset functionality that ensures all user data is properly cleared when the user logs out.

## Overview

The app state reset system consists of two main components:
1. **Storage Cleanup** - Clears AsyncStorage and SecureStore data
2. **Redux State Reset** - Resets all Redux slices to their initial state

## Implementation Files

### Core Files
- `utils/reset-app-state.ts` - Main Redux state reset utility
- `utils/clear-device-data.ts` - Storage cleanup and logout orchestration
- `utils/test-state-reset.ts` - Testing utilities for verification

### Modified Redux Slices
All Redux slices now have reset actions:
- `src/modules/exchange/presentation/state/exchange-slice.ts` - `resetExchangeState`
- `src/modules/market/presentation/state/market-slice.ts` - `resetMarketState`
- `src/modules/swap/presentation/state/swap-slice.ts` - `resetSwapState` (existing)
- `src/modules/buy/presentation/state/buy-slice.ts` - `resetBuyState`
- `src/modules/settings/presentation/state/settings-slice.ts` - `resetUserSettings`, `resetAllSettings`
- `src/modules/utilities/presentation/state/utilities-slice.ts` - `resetUtilitiesState`
- `state/reducers/sendPage.reducer.ts` - `resetSendPage`
- `state/reducers/recievePage.reducer.ts` - `resetReceivePage`
- `state/reducers/activityPage.reducer.ts` - `resetActivityPage`

## How It Works

### 1. Logout Trigger
When user clicks logout in the sidebar (`components/dashboard/Sidebar.tsx`):

```typescript
const handleLogout = async () => {
  // Shows confirmation dialog
  // On confirm:
  await logoutFromExchange(); // Clear exchange session
  const success = await logoutUser(); // Clear storage + reset state
  if (success) {
    router.replace("/select-track"); // Navigate to login
  }
};
```

### 2. Storage Cleanup (`logoutUser`)
The `logoutUser` function in `utils/clear-device-data.ts`:

1. **Clears AsyncStorage data:**
   - Authentication tokens
   - User profile
   - Portfolio data
   - Cached balances
   - Exchange auth state

2. **Clears SecureStore data:**
   - Wallet PIN data
   - Wallet credentials
   - Device fingerprint

3. **Calls Redux state reset:**
   - Invokes `resetAppState()` to reset all Redux slices

4. **Preserves device settings:**
   - Theme preferences
   - Biometric settings
   - Language preferences

### 3. Redux State Reset (`resetAppState`)
The `resetAppState` function resets all Redux slices:

```typescript
export const resetAppState = (): void => {
  const dispatch = store.dispatch;
  
  // Reset user-specific data
  dispatch(kycActions.setUser(null));
  dispatch(clearPortfolioData());
  dispatch(setWalletConnected(false));
  
  // Reset all page states
  dispatch(resetCurrentPage());
  dispatch(resetActivityPage());
  dispatch(resetSendPage());
  dispatch(resetReceivePage());
  
  // Reset feature states
  dispatch(exchangeActions.clearExchangeActivities());
  dispatch(resetSwapState());
  dispatch(resetBuyState());
  
  // Reset user settings (preserves biometric preferences)
  dispatch(resetUserSettings());
  
  // Reset utilities data
  dispatch(utilitiesActions.resetUtilitiesState());
};
```

## What Gets Reset vs Preserved

### ✅ Reset (Cleared on Logout)
- User authentication data
- Portfolio and wallet data
- Exchange activities and history
- Market watchlist and token details
- Swap transaction state
- Buy/sell transaction state
- Send/receive page states
- Activity page filters
- User-specific settings (active chain, bank, currency)
- Cached API responses

### ✅ Preserved (Kept on Logout)
- Theme preferences (dark/light mode)
- Biometric authentication preferences
- Language settings
- Device-specific configurations
- App version and update preferences

## Testing

### Manual Testing
Use the test utilities to verify the reset works:

```typescript
import { testStateReset, quickStateResetTest } from '@/utils/test-state-reset';

// Comprehensive test
testStateReset();

// Quick verification
quickStateResetTest();
```

### Verification Steps
1. Login to the app and use various features
2. Check Redux DevTools to see populated state
3. Logout using the sidebar
4. Verify all user data is cleared
5. Verify device preferences are preserved
6. Login again to confirm clean state

## Error Handling

The state reset system is designed to be robust:

- **Storage errors**: Individual storage clear operations are wrapped in try-catch
- **Redux errors**: State reset continues even if individual slice resets fail
- **Logout continuation**: Logout process continues even if some cleanup fails
- **Logging**: Comprehensive logging for debugging issues

## Security Considerations

1. **Sensitive Data**: All authentication tokens and credentials are cleared
2. **User Privacy**: Personal data like portfolio and transaction history is removed
3. **Device Security**: Biometric preferences preserved for user convenience
4. **Session Management**: Exchange sessions are properly terminated

## Future Enhancements

Potential improvements to consider:

1. **Selective Reset**: Allow partial resets for user switching
2. **Background Reset**: Reset state when app is backgrounded for security
3. **Encrypted Storage**: Additional security for sensitive cached data
4. **Reset Analytics**: Track reset success/failure for monitoring

## Troubleshooting

### Common Issues

1. **State not resetting**: Check Redux DevTools to see which slices aren't reset
2. **Storage not clearing**: Check AsyncStorage and SecureStore manually
3. **Navigation issues**: Ensure router.replace is called after successful logout
4. **Preserved settings lost**: Check if resetAllSettings is being called instead of resetUserSettings

### Debug Commands

```typescript
// Check current state
console.log('Current state:', store.getState());

// Test individual reset
import { resetAppState } from '@/utils/reset-app-state';
resetAppState();

// Check storage
import storageService from '@/src/core/storage/app-storage';
storageService.getAllKeys().then(console.log);
```

## Integration Points

The state reset system integrates with:

- **Authentication system**: Wallet context and exchange auth
- **Navigation**: Router for post-logout navigation
- **Storage**: AsyncStorage and SecureStore
- **Redux**: All application slices
- **UI**: Sidebar logout button and confirmation dialogs

This comprehensive approach ensures a clean logout experience while preserving user preferences for a better UX on subsequent logins.

