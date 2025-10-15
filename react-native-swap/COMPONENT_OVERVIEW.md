# React Native Swap Component - Overview

A complete React Native implementation of a cryptocurrency/fiat swap interface with animations, state management, and a polished UI.

## 📁 Project Structure

```
react-native-swap/
├── components/              # UI Components
│   ├── CurrencySelector.tsx    # Modal for selecting currencies
│   ├── ErrorIndicator.tsx      # Error display with retry
│   ├── ReceiveSection.tsx      # Receive/To input section
│   ├── SellSection.tsx         # Sell/From input section
│   ├── SwapButton.tsx          # Animated swap button
│   └── WithdrawalAddressInput.tsx  # Address input for crypto
│
├── hooks/                   # Custom Hooks
│   └── useSwapLogic.ts         # Main business logic hook
│
├── screens/                 # Screen Components
│   └── SwapScreen.tsx          # Main swap screen
│
├── state/                   # Redux State Management
│   └── swapSlice.ts            # Redux slice for swap state
│
├── store/                   # Redux Store
│   └── index.ts                # Store configuration
│
├── types/                   # TypeScript Types
│   └── index.ts                # Type definitions
│
├── utils/                   # Utility Functions
│   └── formatUtils.ts          # Number/currency formatting
│
├── App.example.tsx          # Example app integration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
│
└── Documentation/
    ├── README.md               # Main documentation
    ├── INTEGRATION_GUIDE.md    # How to integrate
    ├── ANIMATIONS.md           # Animation details
    ├── STATE_MANAGEMENT.md     # State architecture
    └── API_INTEGRATION.md      # API integration guide
```

## 🎯 Features

### ✅ Core Features

- **Currency Selection**: Choose from crypto and fiat currencies
- **Real-time Rate Calculation**: Debounced rate fetching
- **Swap Animation**: Smooth transition when swapping currencies
- **Dollar Mode Toggle**: Switch between crypto and USD display
- **Input Validation**: Number formatting with comma separators
- **Withdrawal Address**: For crypto transactions
- **Error Handling**: User-friendly error messages with retry
- **Dark Mode**: Full dark mode support

### ✅ UI/UX Features

- **Smooth Animations**: 60fps animations using Reanimated
- **Loading States**: Shimmer effects and spinners
- **Touch Feedback**: Button press animations
- **Keyboard Handling**: Proper keyboard avoidance
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Supports reduce motion settings

### ✅ Developer Features

- **TypeScript**: Full type safety
- **Redux Toolkit**: Modern Redux with less boilerplate
- **Modular Architecture**: Easy to customize and extend
- **Mock Data**: Works without backend initially
- **Well Documented**: Extensive documentation
- **No API Dependency**: UI/Logic separated from API calls

## 🔧 Components Breakdown

### 1. SwapScreen (Main Component)

**Location:** `screens/SwapScreen.tsx`

The main container that orchestrates all other components.

**Props:**

- `defaultTokenSymbol?: string` - Initial currency (default: 'BTC')
- `onSwapComplete?: (data) => void` - Callback when swap completes

**State:**

- Manages currency modal visibility
- Handles withdrawal address
- Coordinates child components

### 2. SellSection

**Location:** `components/SellSection.tsx`

The "From" section where users enter the amount to sell.

**Features:**

- Input with comma formatting
- Currency selector button
- Dollar value display with animation
- Dollar/crypto mode toggle
- Swaps position when currencies are swapped

### 3. ReceiveSection

**Location:** `components/ReceiveSection.tsx`

The "To" section showing the amount user will receive.

**Features:**

- Input for custom receive amount
- Currency selector button
- Swaps position when currencies are swapped
- Syncs with sell section

### 4. SwapButton

**Location:** `components/SwapButton.tsx`

The button between sections that swaps the currencies.

**Features:**

- Periodic shake animation
- Pulse animation when loading
- Smooth rotation transition
- Loading indicator

### 5. CurrencySelector

**Location:** `components/CurrencySelector.tsx`

Modal for selecting a currency.

**Features:**

- Search functionality
- List of all supported currencies
- Shows selected currency
- Currency images/logos
- Smooth modal animation

### 6. WithdrawalAddressInput

**Location:** `components/WithdrawalAddressInput.tsx`

Input for cryptocurrency withdrawal address.

**Features:**

- Paste from clipboard button
- Error display
- Only shows for crypto currencies
- Address validation (can be added)

### 7. ErrorIndicator

**Location:** `components/ErrorIndicator.tsx`

Displays errors with retry option.

**Features:**

- Error message display
- Retry button
- Loading state during retry
- Auto-dismisses on success

## 🎨 Animations

All animations use `react-native-reanimated` for smooth 60fps performance:

1. **Swap Transition** (300ms)

   - Sell section moves down
   - Receive section moves up
   - Labels fade out during transition

2. **Dollar Value Pulse** (2s loop)

   - Scales from 1.0 to 1.1
   - Continuous loop
   - Draws attention to USD value

3. **Swap Button Shake** (Every 10s)

   - Shakes vertically
   - Encourages user interaction

4. **Loading Pulse** (1s loop)
   - Button pulses when fetching
   - Visual feedback for loading

See `ANIMATIONS.md` for complete details.

## 🔄 State Management

### Redux State (Global)

- Supported currencies list
- Selected sell/receive currencies
- Current swap rate
- Loading states
- Error messages
- Swap position (normal/swapped)

### Local State (Component)

- Input values (during typing)
- UI transition states
- Dollar mode toggle
- Active input field

See `STATE_MANAGEMENT.md` for architecture details.

## 📊 Data Flow

```
User Input
    ↓
Local State Update
    ↓
Debounced Function (1s)
    ↓
API Call (Mock or Real)
    ↓
Redux State Update
    ↓
Component Re-render
    ↓
UI Update
```

## 🎯 Use Cases

### 1. Cryptocurrency Exchange

- Swap BTC ↔ ETH
- Swap crypto ↔ fiat (USD, EUR, etc.)
- View real-time rates
- Enter withdrawal address

### 2. Currency Converter

- Convert between any currencies
- See dollar equivalent
- Quick currency swapping

### 3. Trading Platform

- Pre-trade rate checking
- Amount calculation
- Fee display (can be added)

## 🔌 Integration Steps (Quick)

1. **Install dependencies**

   ```bash
   npm install react-native-reanimated react-native-gesture-handler @reduxjs/toolkit react-redux lodash
   ```

2. **Copy folder to your project**

   ```
   cp -r react-native-swap /your-project/src/
   ```

3. **Add to Redux store**

   ```typescript
   import swapReducer from './react-native-swap/state/swapSlice'

   const store = configureStore({
     reducer: {
       swap: swapReducer,
     },
   })
   ```

4. **Use the component**

   ```typescript
   import SwapScreen from './react-native-swap/screens/SwapScreen';

   <SwapScreen defaultTokenSymbol="BTC" />
   ```

See `INTEGRATION_GUIDE.md` for detailed steps.

## 🛠️ Customization

### Colors

All colors are defined inline in StyleSheet. Search and replace:

- `#F7F7F7` - Light background
- `#2F333D` - Dark background
- `#C7E64D` - Accent color (green)
- `#EF4444` - Error color (red)

### Fonts

Add your custom fonts:

```typescript
const styles = StyleSheet.create({
  input: {
    fontFamily: 'YourCustomFont',
  },
})
```

### Layout

Modify spacing, sizes in StyleSheet:

```typescript
padding: 16,  // Change padding
borderRadius: 12,  // Change corner radius
```

### Behavior

Modify timings in `useSwapLogic.ts`:

```typescript
debounce(fn, 1000) // Change debounce delay
```

## 🧪 Testing

### Unit Tests (Component)

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import SwapScreen from './SwapScreen';

test('renders swap screen', () => {
  const { getByText } = render(<SwapScreen />);
  expect(getByText('Sell')).toBeTruthy();
});
```

### Integration Tests (State)

```typescript
import { store } from './store'
import { swapActions } from './state/swapSlice'

test('updates sell currency', () => {
  store.dispatch(swapActions.setSellCurrency(mockCurrency))
  expect(store.getState().swap.sellCurrency).toEqual(mockCurrency)
})
```

## 📱 Platform Support

- ✅ iOS (14.0+)
- ✅ Android (API 21+)
- ✅ Dark Mode (both platforms)
- ✅ Portrait orientation
- ⚠️ Landscape (needs testing)
- ❌ Web (would need modifications)

## 🎁 What's Included

### Components (7)

- SwapScreen
- SellSection
- ReceiveSection
- SwapButton
- CurrencySelector
- WithdrawalAddressInput
- ErrorIndicator

### Hooks (1)

- useSwapLogic (main business logic)

### State Management

- Redux Toolkit slice
- Store configuration
- Type definitions

### Utilities

- Number formatting
- Currency formatting
- Input validation

### Documentation (5)

- README.md
- INTEGRATION_GUIDE.md
- ANIMATIONS.md
- STATE_MANAGEMENT.md
- API_INTEGRATION.md

### Examples

- App.example.tsx (complete working example)
- Mock data for testing
- TypeScript configuration

## 🚀 Performance

- **Animations**: 60fps (UI thread)
- **Debouncing**: Reduces API calls
- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Components load as needed

## 🔐 Security Considerations

When integrating with real APIs:

- ✅ Validate withdrawal addresses
- ✅ Use HTTPS for all API calls
- ✅ Implement rate limiting
- ✅ Add transaction confirmation
- ✅ Store sensitive data securely
- ✅ Add biometric authentication (if needed)

## 📈 Future Enhancements (Optional)

Potential features to add:

- [ ] Fee calculation display
- [ ] Transaction history
- [ ] Favorite currency pairs
- [ ] Price charts
- [ ] Push notifications
- [ ] Multiple language support
- [ ] Advanced settings (slippage, etc.)
- [ ] QR code scanner for addresses
- [ ] Save transaction drafts

## 💡 Tips

1. **Start Simple**: Use mock data first, then integrate API
2. **Test Animations**: Run on real device for best results
3. **Customize Colors**: Make it match your brand
4. **Add Logging**: Track user interactions
5. **Handle Errors**: Show user-friendly messages
6. **Add Analytics**: Track conversion rates
7. **Test Edge Cases**: 0 amounts, network errors, etc.

## 📞 Support

For questions or issues:

1. Check the documentation files
2. Review the example app
3. Test with mock data first
4. Verify Redux setup is correct
5. Check console for errors

## ✅ Checklist

Before going to production:

- [ ] Replace mock data with real API
- [ ] Test all currencies
- [ ] Test error scenarios
- [ ] Test on both iOS and Android
- [ ] Test dark mode
- [ ] Add analytics
- [ ] Add error logging
- [ ] Add transaction confirmation
- [ ] Test with slow network
- [ ] Add address validation
- [ ] Review security
- [ ] Add terms and conditions
- [ ] Test accessibility
- [ ] Optimize images/assets
- [ ] Test with real users

## 📄 License

MIT License - Free to use and modify for your project.

---

**Created:** October 2025
**Version:** 1.0.0
**React Native:** 0.70+
**TypeScript:** 4.0+
