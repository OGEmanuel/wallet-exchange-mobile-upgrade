# Swap Module Integration

This document describes the integration of the react-native-swap components into the Zap Wallet Exchange mobile app.

## Overview

The swap implementation provides a fully-featured currency exchange interface with animations, real-time rate fetching, and support for both cryptocurrency and fiat currencies.

## Features

- ✅ Animated swap button with position transitions
- ✅ Dollar/Crypto mode toggle
- ✅ Real-time exchange rate fetching with debouncing
- ✅ Currency selection modal with search
- ✅ Withdrawal address input for crypto transactions
- ✅ Error handling with retry functionality
- ✅ Dark mode support via project theme
- ✅ Input formatting with comma separators
- ✅ Loading states and animations

## Architecture

### Components

#### Core Components (Located in `src/modules/swap/presentation/components/`)

1. **SwapSellSection** - The "Sell/From" section with:
   - Amount input with formatting
   - Currency selector button
   - Dollar value display with pulse animation
   - Dollar/crypto mode toggle

2. **SwapReceiveSection** - The "Receive/To" section with:
   - Amount input with formatting
   - Currency selector button
   - Animated swap transitions

3. **SwapExchangeButton** - Animated swap button with:
   - Periodic shake animation (every 10s)
   - Loading pulse animation
   - Smooth press feedback

4. **SwapCurrencySelector** - Modal for currency selection with:
   - Search functionality
   - Currency list with images
   - Selected state indication

5. **SwapErrorIndicator** - Error display component with:
   - Error message display
   - Retry button with loading state
   - Auto-hide on success

6. **SwapWithdrawalInput** - Withdrawal address input for crypto with:
   - Paste from clipboard functionality
   - Error state display
   - Validation support

### Hooks

#### useSwapLogic (Located in `src/modules/swap/presentation/hooks/`)

The main custom hook that provides all business logic:

```typescript
const {
  swapMetaData,           // Current input values and dollar mode state
  isTransitioning,        // Animation state
  isBackgroundRefresh,    // Retry loading state
  sellCurrency,           // Currently selected sell currency
  receiveCurrency,        // Currently selected receive currency
  fetchingSwapRate,       // Loading state for rate fetching
  isSwapped,              // Position swap state
  swapRateError,          // Error message
  swapRate,               // Current exchange rate data
  handleSellInputChange,  // Sell input handler
  handleReceiveInputChange, // Receive input handler
  handleSwap,             // Currency swap handler
  triggerDollarCryptoSwap, // Toggle dollar mode
  retryFetchSwapRate,     // Retry error handler
  triggerSwapRateFetch,   // Manual rate fetch trigger
} = useSwapLogic();
```

### State Management

The swap module uses Redux (already configured in the project) with the existing swap slice at:
- `src/modules/swap/presentation/state/swap-slice.ts`

State includes:
- `baseCurrency` / `targetCurrency` - Selected currencies
- `baseAmount` / `targetAmount` - Exchange amounts
- `marketRate` - Current exchange rate
- `isRateLoading` - Loading state
- `isReversed` - Swap animation state
- `error` - Error messages

### Utilities

#### formatUtils.ts (Located in `src/modules/swap/utils/`)

Formatting utilities for numbers and currency values:
- `formatNumberWithCommas(value)` - Add commas to numbers
- `ensureSingleDollarSign(value, shouldHave)` - Format dollar values
- `getApproximateAmount(amount, isCrypto)` - Format with proper decimals
- `cleanNumericInput(value)` - Remove non-numeric characters
- `isValidNumber(value)` - Validate numeric input
- `setupTokenTicker(currency)` - Get currency ticker

## Usage

### Basic Implementation

The main swap component is located at:
- `src/modules/swap/presentation/screens/SwapComponent.tsx`

It's already integrated and can be navigated to via:
- `app/dashboard/home/wallet-home/swap.tsx`

### Example Usage

```tsx
import SwapComponent from "@/src/modules/swap/presentation/screens/SwapComponent";

// In your navigation or screen
<SwapComponent />
```

### Customization

#### 1. Styling

All components use the project's theme system (@shopify/restyle). To customize:

```typescript
// In theme/index.ts
const theme = createTheme({
  colors: {
    primaryColor: "#6045FF",      // Accent colors
    secondaryColor: "#C7E64D",    // Dollar toggle icon
    error: "#F04438",             // Error states
    // ... other colors
  },
});
```

#### 2. Fonts

Components use the project's custom fonts:
- **NewScience_Bold** - For input amounts
- **PlusJakartaSans_Regular** - For body text
- **PlusJakartaSans_Bold** - For headers

#### 3. Animation Timing

To adjust animation timing, edit the following files:
- `SwapSellSection.tsx` - Dollar pulse animation (Line 60-68)
- `SwapExchangeButton.tsx` - Shake animation (Line 30-38)
- `useSwapLogic.ts` - Debounce timing (Line 140)

## API Integration

The swap logic currently uses mock data for rate fetching. To integrate with your backend:

### 1. Replace Mock Function

In `src/modules/swap/presentation/hooks/useSwapLogic.ts`, replace the `mockFetchSwapRate` function:

```typescript
const mockFetchSwapRate = async (
  sellCurrencyId: string,
  buyCurrencyId: string,
  amount: number,
  isReceiveInput = false
): Promise<any> => {
  // Replace with your actual API call
  const response = await yourApiClient.post('/swap/rate', {
    sellSupportedCurrencyId: sellCurrencyId,
    buySupportedCurrencyId: buyCurrencyId,
    [isReceiveInput ? 'sellAmount' : 'buyAmount']: amount,
  });

  return response.data;
};
```

### 2. Expected API Response Format

```typescript
interface SwapRateResponse {
  sellAmount: number;
  buyAmount: number;
  sellRate: number;
  buyRate: number;
  rate: number;
  sellCurrency?: SupportedCurrency;
  buyCurrency?: SupportedCurrency;
}
```

## Testing

### Visual Testing

1. Navigate to the swap screen
2. Verify animations work:
   - Swap button shake (every 10s)
   - Dollar value pulse
   - Position swap transitions
3. Test input formatting:
   - Enter numbers with commas
   - Test decimal places
4. Test currency selection:
   - Open modal
   - Search for currencies
   - Select different currencies
5. Test error states:
   - Simulate API error
   - Verify retry button works
6. Test dark mode:
   - Toggle dark mode in device settings
   - Verify all components adapt

### Functional Testing

1. **Input Validation**
   - Test with zero values
   - Test with negative values
   - Test with very large values
   - Test with multiple decimal points

2. **Currency Swapping**
   - Select same currency on both sides
   - Verify automatic swap behavior
   - Test with crypto-to-crypto
   - Test with fiat-to-fiat
   - Test with crypto-to-fiat

3. **Dollar Mode Toggle**
   - Toggle dollar mode
   - Verify value conversion
   - Test input behavior in both modes

4. **Withdrawal Address**
   - Verify shown only for crypto
   - Test paste functionality
   - Test validation (if implemented)

## Troubleshooting

### Issue: Animations not working
**Solution:** Verify react-native-reanimated is properly installed and Babel plugin is configured.

### Issue: Types not matching
**Solution:** Ensure all components use `SupportedCurrency` type from `domain/entities/currency.types.ts`.

### Issue: Debouncing not working
**Solution:** Verify lodash is installed (`npm list lodash` or `yarn list lodash`).

### Issue: Dark mode not applying
**Solution:** Ensure components use theme colors via `useTheme<Theme>()` hook.

## Dependencies

The swap implementation requires:
- ✅ react-native-reanimated (already installed)
- ✅ react-native-gesture-handler (already installed)
- ✅ @reduxjs/toolkit (already installed)
- ✅ react-redux (already installed)
- ✅ lodash (needs to be installed - see package.json)

## Next Steps

1. **API Integration**: Connect to your backend swap rate endpoint
2. **Order Creation**: Implement the swap transaction creation
3. **Transaction Confirmation**: Add confirmation dialog before swap
4. **Analytics**: Add tracking for swap events
5. **Error Messages**: Customize error messages for different scenarios
6. **Accessibility**: Add accessibility labels for screen readers
7. **Testing**: Add unit tests for hooks and components

## File Structure

```
src/modules/swap/
├── presentation/
│   ├── components/
│   │   ├── SwapSellSection.tsx
│   │   ├── SwapReceiveSection.tsx
│   │   ├── SwapExchangeButton.tsx
│   │   ├── SwapCurrencySelector.tsx
│   │   ├── SwapErrorIndicator.tsx
│   │   ├── SwapWithdrawalInput.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useSwapLogic.ts
│   │   └── index.ts
│   ├── screens/
│   │   ├── SwapComponent.tsx
│   │   └── SwapScreen.tsx (existing)
│   └── state/
│       └── swap-slice.ts
├── utils/
│   ├── formatUtils.ts
│   └── index.ts
└── SWAP_INTEGRATION_README.md
```

## Support

For issues or questions:
1. Check the INTEGRATION_GUIDE.md in the react-native-swap folder
2. Review the COMPONENT_OVERVIEW.md for architecture details
3. Check the ANIMATIONS.md for animation documentation
4. Review the API_INTEGRATION.md for API setup

## License

This integration follows the project's existing license.

---

**Last Updated:** October 9, 2025
**Version:** 1.0.0
**Status:** Ready for API integration and testing

