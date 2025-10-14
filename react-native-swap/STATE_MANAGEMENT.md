# State Management Documentation

This document explains the state management architecture used in the React Native Swap component.

## Overview

The component uses **Redux Toolkit** for global state management and **React hooks** for local component state.

## State Architecture

```
┌─────────────────────────────────────────┐
│           Redux Store                   │
│  ┌───────────────────────────────────┐  │
│  │         Swap Slice                │  │
│  │  - supportedCurrencies            │  │
│  │  - sellCurrency                   │  │
│  │  - receiveCurrency                │  │
│  │  - swapRate                       │  │
│  │  - fetchingSwapRate               │  │
│  │  - isSwapped                      │  │
│  │  - errors                         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ↓                    ↑
       useSelector          dispatch
           ↓                    ↑
┌─────────────────────────────────────────┐
│        useSwapLogic Hook                │
│  - Handles business logic               │
│  - Manages local state                  │
│  - Provides methods to components       │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│         Components                      │
│  - SwapScreen                           │
│  - SellSection                          │
│  - ReceiveSection                       │
│  - etc.                                 │
└─────────────────────────────────────────┘
```

## Redux State (Global)

### Location: `state/swapSlice.ts`

### State Shape

```typescript
interface SwapState {
  isSwapped: boolean // Whether sell/receive are swapped
  fetchingSwapRate: boolean // Loading state for rates
  supportedCurrencies?: SupportedCurrencyModel[] | null // Available currencies
  supportedCurrenciesError?: string | null // Error fetching currencies
  swapRate?: SwapRateModel | null // Current exchange rate
  swapRateError?: string | null // Error fetching rate
  sellCurrency?: SupportedCurrencyModel | null // Selected sell currency
  receiveCurrency?: SupportedCurrencyModel | null // Selected receive currency
}
```

### Actions

All actions are created using Redux Toolkit's `createSlice`:

```typescript
// Set supported currencies list
setSupportedCurrencies(currencies: SupportedCurrencyModel[])

// Set loading state
setFetchingSwapRate(isLoading: boolean)

// Set exchange rate
setSwapRate(rate: SwapRateModel)

// Set selected currencies
setSellCurrency(currency: SupportedCurrencyModel)
setReceiveCurrency(currency: SupportedCurrencyModel)

// Toggle swap position
setIsSwapped(isSwapped: boolean)

// Set errors
setSwapRateError(error: string | null)
setSupportedCurrenciesError(error: string | null)

// Reset state
resetSupportedCurrencies()
```

### Usage Example

```typescript
import { useDispatch, useSelector } from 'react-redux'
import { swapActions } from './state/swapSlice'

function MyComponent() {
  const dispatch = useDispatch()
  const { sellCurrency, swapRate } = useSelector(
    (state: RootState) => state.swap
  )

  const updateCurrency = () => {
    dispatch(swapActions.setSellCurrency(newCurrency))
  }
}
```

## Local State (Component)

### Location: `hooks/useSwapLogic.ts`

### State Variables

```typescript
// UI state
const [isTransitioning, setIsTransitioning] = useState(false);
const [activeInputField, setActiveInputField] = useState<'sell' | 'receive' | null>(null);
const [isBackgroundRefresh, setIsBackgroundRefresh] = useState(false);

// Swap metadata
const [swapMetaData, setSwapMetaData] = useState<SwapMetaData>({
  isDollarMode: boolean;           // USD vs Crypto display mode
  dollarValue: string;             // Cached dollar value
  sellInputValue: string;          // Current sell input
  receiveInputValue: string;       // Current receive input
});
```

### Why Split State?

**Redux (Global):**

- Data that needs to be shared across components
- Server data (currencies, rates)
- User selections that should persist

**Local State:**

- UI-specific state (transitions, active field)
- Transient data (input values during typing)
- Computed values that don't need global access

## Data Flow

### 1. Fetching Supported Currencies

```
User Opens Screen
    ↓
SwapScreen useEffect triggers
    ↓
Dispatch setSupportedCurrencies (from API or mock)
    ↓
Redux state updated
    ↓
Components re-render with new currencies
    ↓
Default currencies are selected
```

### 2. Changing Input Values

```
User Types in Input
    ↓
onInputChange callback
    ↓
handleSellInputChange/handleReceiveInputChange
    ↓
Local state updated (swapMetaData)
    ↓
Debounced function triggers
    ↓
Fetch swap rate (mock or API)
    ↓
Dispatch setSwapRate
    ↓
Redux state updated
    ↓
Other input field updates
```

### 3. Swapping Currencies

```
User Taps Swap Button
    ↓
handleSwap function
    ↓
setIsTransitioning(true)
    ↓
Dispatch setIsSwapped(!isSwapped)
    ↓
Dispatch setSellCurrency(receiveCurrency)
Dispatch setReceiveCurrency(sellCurrency)
    ↓
Animation plays (300ms)
    ↓
setIsTransitioning(false)
```

### 4. Selecting Currency

```
User Opens Currency Modal
    ↓
User Selects Currency
    ↓
handleSelectCurrency function
    ↓
Check if currency is on other side
    ↓
If yes: trigger handleSwap()
If no: dispatch setSellCurrency/setReceiveCurrency
    ↓
Redux state updated
    ↓
Components re-render
    ↓
Fetch new swap rate
```

## Debouncing

The component uses Lodash's `debounce` to prevent excessive API calls:

```typescript
const debouncedFetchSwapRate = debounce(params => {
  // Fetch rate
}, 1000) // Wait 1 second after last input change
```

**Why?**

- User types "1234" - we don't want 4 API calls
- We wait until typing stops, then make 1 call
- Improves performance and reduces server load

## State Persistence

Currently, the state is **not persisted**. When the app restarts, all state is lost.

### To Add Persistence

Use Redux Persist:

```typescript
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

const persistConfig = {
  key: 'swap',
  storage: AsyncStorage,
  whitelist: ['sellCurrency', 'receiveCurrency'], // Only persist these
}

const persistedReducer = persistReducer(persistConfig, swapReducer)

export const store = configureStore({
  reducer: {
    swap: persistedReducer,
  },
})
```

## Error Handling

Errors are stored in Redux state and displayed via `ErrorIndicator` component:

```typescript
try {
  const rate = await fetchSwapRate()
  dispatch(swapActions.setSwapRate(rate))
} catch (error) {
  dispatch(swapActions.setSwapRateError('Failed to fetch rates'))
}
```

**Retry Mechanism:**

```typescript
const retryFetchSwapRate = () => {
  // Clear errors
  dispatch(swapActions.setSwapRateError(null))

  // Show loading
  setIsBackgroundRefresh(true)

  // Retry fetch
  triggerSwapRateFetch()
}
```

## Testing State Management

### Unit Tests

```typescript
import { swapActions } from './swapSlice'
import { store } from './store'

describe('Swap State', () => {
  it('should set sell currency', () => {
    const currency = { _id: '1', currencyId: { code: 'BTC' } }
    store.dispatch(swapActions.setSellCurrency(currency))

    const state = store.getState().swap
    expect(state.sellCurrency).toEqual(currency)
  })
})
```

### Integration Tests

```typescript
import { renderHook, act } from '@testing-library/react-hooks'
import { useSwapLogic } from './useSwapLogic'

describe('useSwapLogic', () => {
  it('should handle input change', () => {
    const { result } = renderHook(() => useSwapLogic())

    act(() => {
      result.current.handleSellInputChange('100')
    })

    expect(result.current.swapMetaData.sellInputValue).toBe('100')
  })
})
```

## Best Practices

### ✅ Do

- Keep Redux state minimal and focused
- Use local state for UI-specific data
- Normalize data structures in Redux
- Use selectors for derived data
- Handle errors at the action level

### ❌ Don't

- Store form input values in Redux (use local state)
- Store computed values (compute on-the-fly)
- Mutate state directly (use Redux Toolkit's Immer)
- Put functions in Redux state
- Store non-serializable data

## Debugging

### Redux DevTools

Install Redux DevTools to inspect state:

```typescript
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: { swap: swapReducer },
  devTools: __DEV__, // Enable in development
})
```

### Logging

Add logging middleware:

```typescript
const loggerMiddleware = storeAPI => next => action => {
  console.log('Dispatching:', action.type)
  const result = next(action)
  console.log('New state:', storeAPI.getState())
  return result
}

export const store = configureStore({
  reducer: { swap: swapReducer },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(loggerMiddleware),
})
```

## Performance Optimization

### Memoization

Use React.memo for components that don't need frequent re-renders:

```typescript
const SellSection = React.memo(({ ... }) => {
  // Component code
});
```

### Selector Optimization

Use reselect for computed selectors:

```typescript
import { createSelector } from '@reduxjs/toolkit'

const selectSwap = state => state.swap

const selectFormattedRate = createSelector([selectSwap], swap => {
  // Expensive computation
  return formatRate(swap.swapRate)
})
```

## Migration Guide

If you need to change the state structure:

1. Create a migration function
2. Update the state shape
3. Test thoroughly
4. Deploy with backward compatibility

```typescript
const migrations = {
  0: state => {
    // Migration from version 0 to 1
    return {
      ...state,
      newField: defaultValue,
    }
  },
}
```
