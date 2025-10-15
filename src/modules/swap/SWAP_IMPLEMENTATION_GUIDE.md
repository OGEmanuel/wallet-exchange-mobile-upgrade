# Swap Implementation Guide

This document describes the new swap implementation based on the `react-native-swap` guide, adapted to match the project's styling patterns.

## 📋 Overview

The new swap implementation provides:
- ✅ Animated swap transitions with React Native Reanimated
- ✅ Debounced rate fetching to reduce API calls
- ✅ Dollar/crypto mode toggle for flexible input
- ✅ Withdrawal address input for crypto transactions
- ✅ Error handling with retry functionality
- ✅ Theme-aware styling matching project patterns
- ✅ Redux state management integration

## 🏗️ Architecture

### File Structure

```
src/modules/swap/
├── presentation/
│   ├── components/
│   │   ├── SellSectionNew.tsx          # Sell/From section with animations
│   │   ├── ReceiveSectionNew.tsx       # Receive/To section with animations
│   │   ├── SwapButtonNew.tsx           # Animated swap button
│   │   ├── ErrorIndicator.tsx          # Error display with retry
│   │   └── WithdrawalAddressInput.tsx  # Crypto address input
│   ├── hooks/
│   │   └── useSwapLogic.ts             # Core swap logic with debouncing
│   ├── screens/
│   │   ├── SwapScreen.tsx              # Original implementation
│   │   └── SwapScreenNew.tsx           # New implementation
│   └── state/
│       └── swap-slice.ts               # Redux state (enhanced)
├── utils/
│   └── formatUtils.ts                  # Formatting utilities
└── domain/
    └── entities/
        └── currency.types.ts           # Type definitions (enhanced)
```

## 🚀 Usage

### Basic Implementation

Replace the old swap screen with the new one:

```tsx
// In your route file (e.g., app/dashboard/home/wallet-home/swap.tsx)
import { SwapScreenNew } from "@/src/modules/swap";

export default function SwapPage() {
  return <SwapScreenNew />;
}
```

### Using Individual Components

You can also use individual components in your own implementation:

```tsx
import {
  SellSectionNew,
  ReceiveSectionNew,
  SwapButtonNew,
  ErrorIndicator,
  WithdrawalAddressInput,
  useSwapLogic,
} from "@/src/modules/swap";

function MySwapComponent() {
  const {
    swapMetaData,
    isTransitioning,
    handleSellInputChange,
    handleReceiveInputChange,
    handleSwap,
    // ... other values
  } = useSwapLogic();

  return (
    <View>
      <SellSectionNew
        isSwapped={isSwapped}
        isTransitioning={isTransitioning}
        swapMetaData={swapMetaData}
        triggerDollarCryptoSwap={triggerDollarCryptoSwap}
        openSupportedCurrenciesModal={openTokenSelector}
        onInputChange={handleSellInputChange}
        sellInputValue={swapMetaData.sellInputValue}
      />
      
      <SwapButtonNew onPress={handleSwap} isLoading={fetchingSwapRate} />
      
      <ReceiveSectionNew
        isSwapped={isSwapped}
        isTransitioning={isTransitioning}
        openSupportedCurrenciesModal={openTokenSelector}
        onInputChange={handleReceiveInputChange}
        receiveInputValue={swapMetaData.receiveInputValue}
      />
    </View>
  );
}
```

## 🎨 Key Features

### 1. Animated Swap Transitions

The swap button and input sections use React Native Reanimated for smooth animations:

- **Swap Animation**: When currencies swap, they smoothly transition positions (210px translateY)
- **Shake Animation**: The swap button periodically shakes to draw attention
- **Pulse Animation**: While loading, the swap button pulses
- **Dollar Value Animation**: The dollar value scales up/down for visual feedback

### 2. Debounced Rate Fetching

The `useSwapLogic` hook implements debounced rate fetching:

```typescript
// Automatically debounces API calls by 1 second
const debouncedFetchSwapRate = useCallback(
  debounce(async (...params) => {
    // Fetch rate from API
  }, 1000),
  [dependencies]
);
```

This reduces unnecessary API calls while the user is typing.

### 3. Dollar/Crypto Mode Toggle

Users can toggle between entering amounts in:
- **Crypto mode**: Enter BTC/ETH amounts
- **Dollar mode**: Enter USD equivalent

Click the ⇄ icon in the sell section to toggle modes.

### 4. Error Handling

The `ErrorIndicator` component displays errors with:
- Error message display
- Retry button with loading state
- Auto-hide on successful retry

### 5. Withdrawal Address Input

For crypto-to-crypto or crypto-to-fiat swaps, users can:
- Enter withdrawal address manually
- Paste from clipboard
- See validation errors

## 🔧 Configuration

### Customizing API Integration

Replace the mock API call in `useSwapLogic.ts`:

```typescript
// In src/modules/swap/presentation/hooks/useSwapLogic.ts

// Replace this mock function:
const mockFetchSwapRate = async (...) => {
  // Mock implementation
};

// With your actual API call:
const fetchSwapRate = async (
  sellCurrencyId: string,
  buyCurrencyId: string,
  amount: number,
  isReceiveInput = false
): Promise<SwapRateModel> => {
  const response = await yourApiClient.post('/swap/rate', {
    sellSupportedCurrencyId: sellCurrencyId,
    buySupportedCurrencyId: buyCurrencyId,
    [isReceiveInput ? 'sellAmount' : 'buyAmount']: amount,
  });

  return response.data;
};
```

### Customizing Debounce Timing

Adjust the debounce delay in `useSwapLogic.ts`:

```typescript
debounce(
  async (...) => {
    // ...
  },
  1000  // Change this to your preferred delay (in milliseconds)
),
```

### Customizing Animations

#### Swap Transition Duration

In `SellSectionNew.tsx` and `ReceiveSectionNew.tsx`:

```typescript
const containerTranslateY = isSwapped ? 210 : 0; // Adjust distance
```

In `useSwapLogic.ts`:

```typescript
setTimeout(() => {
  setIsTransitioning(false);
}, 300); // Adjust transition duration
```

#### Shake Animation Frequency

In `SwapButtonNew.tsx`:

```typescript
const interval = setInterval(() => {
  // Shake animation
}, 10000); // Change interval (10 seconds default)
```

## 📊 State Management

### Redux State Structure

The swap state includes both old and new fields for backward compatibility:

```typescript
interface SwapState {
  // Original fields
  baseAmount: number;
  targetAmount: number;
  baseCurrency: SupportedCurrency | null;
  targetCurrency: SupportedCurrency | null;
  // ...

  // New react-native-swap compatible fields
  isSwapped: boolean;
  fetchingSwapRate: boolean;
  supportedCurrencies?: SupportedCurrency[] | null;
  swapRate?: SwapRateModel | null;
  swapRateError?: string | null;
  sellCurrency?: SupportedCurrency | null;
  receiveCurrency?: SupportedCurrency | null;
}
```

### Available Actions

```typescript
import { swapActions } from "@/src/modules/swap";

// Set currencies
dispatch(swapActions.setSellCurrency(currency));
dispatch(swapActions.setReceiveCurrency(currency));

// Set loading state
dispatch(swapActions.setFetchingSwapRate(true));

// Set swap rate
dispatch(swapActions.setSwapRate(rateData));

// Handle errors
dispatch(swapActions.setSwapRateError("Error message"));

// Toggle swap state
dispatch(swapActions.setIsSwapped(!isSwapped));
```

## 🎯 Component Props

### SellSectionNew

```typescript
interface Props {
  isSwapped: boolean;
  swapMetaData: SwapMetaData;
  isTransitioning: boolean;
  triggerDollarCryptoSwap: () => void;
  openSupportedCurrenciesModal: (type: 'sell' | 'receive') => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  sellInputValue: string;
}
```

### ReceiveSectionNew

```typescript
interface Props {
  isSwapped: boolean;
  isTransitioning: boolean;
  openSupportedCurrenciesModal: (type: 'sell' | 'receive') => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  receiveInputValue: string;
}
```

### SwapButtonNew

```typescript
interface Props {
  onPress: () => void;
  isLoading?: boolean;
}
```

### ErrorIndicator

```typescript
interface Props {
  error?: string | null;
  retry?: () => void;
  retryText?: string;
  isBackgroundRefresh?: boolean;
}
```

### WithdrawalAddressInput

```typescript
interface Props {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  disabled?: boolean;
}
```

## 🛠️ Utilities

### Format Utils

Available formatting utilities:

```typescript
import {
  formatNumberWithCommas,
  ensureSingleDollarSign,
  cleanNumericInput,
  getApproximateAmount,
  isValidNumber,
  setupTokenTicker,
} from "@/src/modules/swap/utils/formatUtils";

// Format number with commas
formatNumberWithCommas("1000000"); // "1,000,000"

// Ensure single dollar sign
ensureSingleDollarSign("$100", true); // "$100"
ensureSingleDollarSign("100", true);  // "$100"

// Clean input
cleanNumericInput("$1,234.56"); // "1234.56"

// Get approximate amount
getApproximateAmount(0.00123456, true);  // "0.00123456" (crypto)
getApproximateAmount(123.456, false);    // "123.46" (fiat)
```

## 🔄 Migration from Old Implementation

### Step 1: Update Route

```tsx
// Before
import Swap from "@/src/modules/swap/presentation/screens/SwapScreen";

// After
import { SwapScreenNew } from "@/src/modules/swap";

export default function SwapPage() {
  return <SwapScreenNew />;
}
```

### Step 2: Test the Implementation

1. Navigate to the swap screen
2. Test currency selection
3. Test input validation
4. Test swap animation
5. Test dollar/crypto mode toggle
6. Test error handling
7. Test withdrawal address input

### Step 3: Remove Old Implementation (Optional)

Once you've verified the new implementation works:

1. Remove `SwapScreen.tsx` (old version)
2. Rename `SwapScreenNew.tsx` to `SwapScreen.tsx`
3. Update exports in `index.ts`

## 🐛 Troubleshooting

### Animations not working

**Solution:** Ensure `react-native-reanimated` is properly installed:

```bash
npm install react-native-reanimated
# or
yarn add react-native-reanimated
```

Add to `babel.config.js`:

```javascript
module.exports = {
  plugins: [
    'react-native-reanimated/plugin', // Must be listed last
  ],
};
```

### Debouncing not working

**Solution:** Ensure `lodash` is installed:

```bash
npm install lodash
# or
yarn add lodash
```

### Type errors

**Solution:** Ensure your `AppRootState` type includes the swap state:

```typescript
// In your root state type
export interface AppRootState {
  swap: SwapState;
  // ... other reducers
}
```

## 📚 Reference

### Original Guide

This implementation is based on the `react-native-swap` guide located at:
`/Users/busolaomosipe/Projects/work/zap/wallet-exchange-mobile-upgrade/react-native-swap/`

### Key Differences from Guide

1. **Styling**: Uses project's theme system (`@shopify/restyle`)
2. **Fonts**: Uses project's font families (PlusJakartaSans, NewScience)
3. **Icons**: Uses Lucide icons instead of emojis
4. **Components**: Integrates with existing components (Box, CustomButton, etc.)
5. **State**: Enhanced existing Redux slice rather than creating new one

## 🎉 Benefits

- ✅ Smoother user experience with animations
- ✅ Reduced API calls with debouncing
- ✅ Better error handling
- ✅ More flexible input modes
- ✅ Consistent with project styling
- ✅ Fully typed with TypeScript
- ✅ Backward compatible with existing code

## 📝 Notes

- The old `SwapScreen.tsx` is preserved for backward compatibility
- Both implementations can coexist during migration
- All new components follow the project's naming and styling conventions
- The implementation is production-ready but you should replace the mock API calls

---

**Last Updated:** October 9, 2025
**Version:** 1.0.0

