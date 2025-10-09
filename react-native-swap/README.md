# React Native Swap Component

This is a React Native port of the web-based swap functionality. It includes the UI and UI logic (state, transitions, animations) but excludes API calls.

## Features

- Swap between different cryptocurrencies and fiat currencies
- Dollar mode toggle for viewing amounts in USD
- Animated transitions when swapping currencies
- Input validation and formatting with comma separators
- Debounced rate fetching simulation
- Dark mode support
- Withdrawal address input for crypto transactions

## Dependencies

```json
{
  "react-native-reanimated": "^3.x",
  "react-native-gesture-handler": "^2.x",
  "@reduxjs/toolkit": "^1.x or ^2.x",
  "react-redux": "^8.x or ^9.x",
  "lodash": "^4.x"
}
```

## Installation

1. Install dependencies:

```bash
npm install react-native-reanimated react-native-gesture-handler @reduxjs/toolkit react-redux lodash
# or
yarn add react-native-reanimated react-native-gesture-handler @reduxjs/toolkit react-redux lodash
```

2. Follow the setup instructions for `react-native-reanimated` and `react-native-gesture-handler` in your React Native project.

3. Add the Redux store configuration to your app.

## Usage

```tsx
import SwapScreen from './react-native-swap/screens/SwapScreen'

// In your navigation or main component
;<SwapScreen
  defaultTokenSymbol="BTC"
  onSwapComplete={data => {
    // Handle swap completion
    console.log('Swap data:', data)
  }}
/>
```

## Components Structure

- `SwapScreen.tsx` - Main swap screen component
- `SellSection.tsx` - Sell/From section component
- `ReceiveSection.tsx` - Receive/To section component
- `SwapButton.tsx` - Swap action button
- `WithdrawalAddressInput.tsx` - Address input component
- `CurrencySelector.tsx` - Currency selection modal

## State Management

The component uses Redux for state management with the following slice:

- `swapSlice.ts` - Manages swap state, currencies, rates, and errors

## Customization

You can customize the colors, fonts, and spacing by modifying the styles in each component file. The components support both light and dark themes through the `useColorScheme` hook.

## Notes

- API calls have been removed as requested
- The component simulates rate fetching with mock data
- Adjust the debounce timing and animations to suit your needs
- Add your own icons and images to the assets folder
