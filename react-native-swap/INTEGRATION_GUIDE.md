# Integration Guide

This guide will help you integrate the React Native Swap component into your existing React Native application.

## Prerequisites

Make sure you have the following dependencies installed:

```bash
npm install react-native-reanimated react-native-gesture-handler @reduxjs/toolkit react-redux lodash
# or
yarn add react-native-reanimated react-native-gesture-handler @reduxjs/toolkit react-redux lodash
```

### Additional Setup for react-native-reanimated

Add the Reanimated plugin to your `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // This should be listed last
  ],
}
```

### Additional Setup for react-native-gesture-handler

In your `index.js` or `App.tsx` (at the top):

```javascript
import 'react-native-gesture-handler'
```

## Step 1: Copy Files to Your Project

Copy the entire `react-native-swap` folder to your project. You can place it anywhere, for example:

- `src/components/swap/`
- `src/modules/swap/`
- `lib/react-native-swap/`

## Step 2: Redux Store Integration

### If you don't have Redux setup:

Use the provided store configuration:

```typescript
// App.tsx
import { Provider } from 'react-redux';
import { store } from './react-native-swap/store';

function App() {
  return (
    <Provider store={store}>
      {/* Your app components */}
    </Provider>
  );
}
```

### If you already have Redux:

Add the swap reducer to your existing store:

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import swapReducer from '../react-native-swap/state/swapSlice'
import yourExistingReducer from './yourExistingSlice'

export const store = configureStore({
  reducer: {
    swap: swapReducer, // Add this line
    yourExisting: yourExistingReducer,
    // ... other reducers
  },
})
```

## Step 3: Update Type Definitions

Update the `RootState` type in your project to include the swap state. You can either:

1. Modify the type definitions in `react-native-swap/hooks/useSwapLogic.ts` and `react-native-swap/components/*.tsx` to match your store structure, or

2. Keep it isolated by using a type assertion when selecting state.

## Step 4: Use the SwapScreen Component

```typescript
import SwapScreen from './react-native-swap/screens/SwapScreen';

function YourScreen() {
  return (
    <SwapScreen
      defaultTokenSymbol="BTC"
      onSwapComplete={(data) => {
        // Handle swap completion
        console.log('Swap data:', data);
        // Make your API call here
      }}
    />
  );
}
```

## Step 5: Customize Mock Data

The component uses mock data for supported currencies. Replace this with your actual data source:

In `screens/SwapScreen.tsx`, find the `useEffect` that sets mock currencies and replace it with your API call:

```typescript
useEffect(() => {
  // Replace with your actual API call
  fetchSupportedCurrencies()
    .then(currencies => {
      dispatch(swapActions.setSupportedCurrencies(currencies))
      // Set default currencies...
    })
    .catch(error => {
      dispatch(swapActions.setSupportedCurrenciesError(error.message))
    })
}, [])
```

## Step 6: Implement Real API Calls

The swap rate fetching is mocked in `hooks/useSwapLogic.ts`. Replace the `mockFetchSwapRate` function with your actual API call:

```typescript
// In useSwapLogic.ts
const fetchSwapRate = async (
  sellCurrencyId: string,
  buyCurrencyId: string,
  amount: number,
  isReceiveInput = false
): Promise<SwapRateModel> => {
  // Replace with your actual API call
  const response = await yourApiClient.post('/swap/rate', {
    sellSupportedCurrencyId: sellCurrencyId,
    buySupportedCurrencyId: buyCurrencyId,
    [isReceiveInput ? 'sellAmount' : 'buyAmount']: amount,
  })

  return response.data
}
```

## Step 7: Customize Styles

All styles are defined in the component files using `StyleSheet.create()`. You can customize:

- Colors: Search for hex color codes and replace them
- Spacing: Modify padding, margin values
- Typography: Update fontSize, fontWeight, fontFamily
- Border radius: Change borderRadius values

Example:

```typescript
// In SellSection.tsx
const styles = StyleSheet.create({
  container: {
    // Change background color
    backgroundColor: '#YOUR_COLOR',
  },
  // ... other styles
})
```

## Step 8: Add Your Branding

1. Replace icon emojis with your custom icons/SVGs
2. Update color scheme to match your app's theme
3. Modify fonts to use your app's typography

## Troubleshooting

### Issue: Animations not working

**Solution:** Make sure `react-native-reanimated` is properly installed and the Babel plugin is configured.

### Issue: Redux state not updating

**Solution:** Verify that the Provider wraps your component tree and the swap reducer is correctly added to your store.

### Issue: TypeScript errors

**Solution:** Update the `RootState` interface in the component files to match your store structure.

### Issue: Dark mode not working

**Solution:** Ensure your app has dark mode configured. The component uses React Native's `useColorScheme` hook.

## Navigation Integration

If using React Navigation:

```typescript
// In your navigator
import SwapScreen from './react-native-swap/screens/SwapScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Swap"
        component={SwapScreen}
        options={{
          title: 'Swap Currency',
        }}
      />
    </Stack.Navigator>
  );
}
```

## Testing

The component includes all the UI logic and state management. To test:

1. Verify currency selection works
2. Test input validation and formatting
3. Check swap button functionality
4. Test withdrawal address input (for crypto)
5. Verify error handling and retry mechanism
6. Test dark mode support

## Support

For issues specific to the component:

1. Check the `README.md` for feature documentation
2. Review the `INTEGRATION_GUIDE.md` (this file)
3. Look at `App.example.tsx` for a complete working example
