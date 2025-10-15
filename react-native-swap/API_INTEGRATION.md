# API Integration Guide

This guide shows you how to replace the mock API calls with your actual backend API.

## Overview

The component currently uses mock data for:

1. Supported currencies list
2. Swap rate fetching

You'll need to replace these with your actual API endpoints.

## Prerequisites

Install your HTTP client of choice:

```bash
# Axios (recommended)
npm install axios

# Or use fetch (built-in)
# Or use your existing API client
```

## 1. Setup API Client

Create an API client file:

```typescript
// api/swapApi.ts
import axios from 'axios'

const API_BASE_URL = 'https://your-api.com/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token interceptor if needed
apiClient.interceptors.request.use(config => {
  const token = getAuthToken() // Your token retrieval method
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add error handling interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

## 2. Replace Supported Currencies API

### Current Mock Implementation (SwapScreen.tsx)

```typescript
useEffect(() => {
  const mockCurrencies: SupportedCurrencyModel[] = [
    { _id: '1', currencyId: { code: 'BTC', ... } },
    // ... more mock data
  ];
  dispatch(swapActions.setSupportedCurrencies(mockCurrencies));
}, []);
```

### Replace with Real API

```typescript
// api/swapApi.ts
export const fetchSupportedCurrencies = async (
  includeFiat: boolean = true
): Promise<SupportedCurrencyModel[]> => {
  try {
    const response = await apiClient.get('/supported-currencies', {
      params: { includeFiat },
    })
    return response.data.data || response.data
  } catch (error) {
    console.error('Error fetching currencies:', error)
    throw new Error('Failed to fetch supported currencies')
  }
}
```

### Update SwapScreen.tsx

```typescript
import { fetchSupportedCurrencies } from '../api/swapApi'

useEffect(() => {
  const loadCurrencies = async () => {
    try {
      dispatch(swapActions.setFetchingSwapRate(true))

      const currencies = await fetchSupportedCurrencies(true)
      dispatch(swapActions.setSupportedCurrencies(currencies))

      // Set default currencies
      const sellCurrency =
        currencies.find(c => c.currencyId?.code === defaultTokenSymbol) ||
        currencies[0]

      const receiveCurrency =
        currencies.find(c => !c.currencyId?.isCrypto) ||
        currencies[currencies.length - 1]

      dispatch(swapActions.setSellCurrency(sellCurrency))
      dispatch(swapActions.setReceiveCurrency(receiveCurrency))
    } catch (error) {
      dispatch(
        swapActions.setSupportedCurrenciesError(
          error.message || 'Failed to load currencies'
        )
      )
    } finally {
      dispatch(swapActions.setFetchingSwapRate(false))
    }
  }

  loadCurrencies()
}, [defaultTokenSymbol])
```

## 3. Replace Swap Rate API

### Current Mock Implementation (useSwapLogic.ts)

```typescript
const mockFetchSwapRate = async (
  sellCurrencyId: string,
  buyCurrencyId: string,
  amount: number,
  isReceiveInput = false
): Promise<SwapRateModel> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const mockRate = 0.022;
  return { sellAmount: amount, buyAmount: amount * mockRate, ... };
};
```

### Replace with Real API

```typescript
// api/swapApi.ts
export const fetchSwapRate = async (
  params: FetchSwapRateRequestParams
): Promise<SwapRateModel> => {
  try {
    const response = await apiClient.post('/swap/rate', params)
    return response.data.data || response.data
  } catch (error) {
    console.error('Error fetching swap rate:', error)
    throw new Error('Failed to fetch swap rate')
  }
}
```

### Update useSwapLogic.ts

```typescript
import { fetchSwapRate } from '../api/swapApi'

// Replace mockFetchSwapRate with:
const debouncedFetchSwapRate = useCallback(
  debounce(
    async (
      sellCurrencyId: string,
      buyCurrencyId: string,
      amount: number,
      isReceiveInput = false
    ) => {
      if (!amount || amount <= 0 || isNaN(amount)) {
        return
      }

      dispatch(swapActions.setFetchingSwapRate(true))
      dispatch(swapActions.setSwapRateError(null))

      try {
        // Build request params
        const queryParams: FetchSwapRateRequestParams = isSwapped
          ? isReceiveInput
            ? {
                sellSupportedCurrencyId: buyCurrencyId,
                buySupportedCurrencyId: sellCurrencyId,
                buyAmount: swapMetaData.isDollarMode
                  ? amount / (swapRate?.buyRate || 1)
                  : amount,
              }
            : {
                sellSupportedCurrencyId: buyCurrencyId,
                buySupportedCurrencyId: sellCurrencyId,
                sellAmount: amount,
              }
          : isReceiveInput
            ? {
                sellSupportedCurrencyId: buyCurrencyId,
                buySupportedCurrencyId: sellCurrencyId,
                sellAmount: amount,
              }
            : {
                sellSupportedCurrencyId: buyCurrencyId,
                buySupportedCurrencyId: sellCurrencyId,
                buyAmount: swapMetaData.isDollarMode
                  ? amount / (swapRate?.buyRate || 1)
                  : amount,
              }

        // Call real API
        const response = await fetchSwapRate(queryParams)

        dispatch(swapActions.setSwapRate(response))

        // Update input fields with response
        if (response) {
          const dollarValue = ensureSingleDollarSign(
            getApproximateAmount(
              (response.buyAmount || 0) * (response.buyRate || 0),
              false
            ),
            true
          )

          setSwapMetaData(prev => ({
            ...prev,
            dollarValue,
            sellInputValue: isReceiveInput
              ? getApproximateAmount(
                  response.sellAmount || 0,
                  response.sellCurrency?.currencyId?.isCrypto || false
                )
              : prev.sellInputValue,
            receiveInputValue: !isReceiveInput
              ? getApproximateAmount(
                  response.buyAmount || 0,
                  response.buyCurrency?.currencyId?.isCrypto || false
                )
              : prev.receiveInputValue,
          }))
        }
      } catch (error) {
        dispatch(
          swapActions.setSwapRateError(
            error.message || 'Failed to fetch exchange rates'
          )
        )
      } finally {
        dispatch(swapActions.setFetchingSwapRate(false))
        setIsBackgroundRefresh(false)
      }
    },
    1000
  ),
  [dispatch, sellCurrency, receiveCurrency, swapMetaData, isSwapped]
)
```

## 4. Create Swap Transaction API

When user confirms the swap, you'll need to create a transaction:

```typescript
// api/swapApi.ts
export interface CreateSwapTransactionParams {
  sellSupportedCurrencyId: string
  buySupportedCurrencyId: string
  sellAmount?: number
  buyAmount?: number
  withdrawalAddress?: string
}

export const createSwapTransaction = async (
  params: CreateSwapTransactionParams
): Promise<any> => {
  try {
    const response = await apiClient.post('/swap/create', params)
    return response.data.data || response.data
  } catch (error) {
    console.error('Error creating swap:', error)
    throw new Error('Failed to create swap transaction')
  }
}
```

### Add to SwapScreen.tsx

```typescript
import { createSwapTransaction } from '../api/swapApi'

const handleSwapComplete = async () => {
  try {
    // Validate inputs
    if (!sellCurrency || !receiveCurrency) {
      Alert.alert('Error', 'Please select currencies')
      return
    }

    if (
      !swapMetaData.sellInputValue ||
      parseFloat(swapMetaData.sellInputValue) <= 0
    ) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }

    if (swapRate?.sellCurrency?.currencyId?.isCrypto && !withdrawalAddress) {
      Alert.alert('Error', 'Please enter a withdrawal address')
      return
    }

    // Create transaction
    const transaction = await createSwapTransaction({
      sellSupportedCurrencyId: sellCurrency._id,
      buySupportedCurrencyId: receiveCurrency._id,
      sellAmount: parseFloat(cleanNumericInput(swapMetaData.sellInputValue)),
      withdrawalAddress: withdrawalAddress || undefined,
    })

    // Call the callback if provided
    onSwapComplete?.(transaction)

    // Navigate or show success
    Alert.alert('Success', 'Swap initiated successfully!')
  } catch (error) {
    Alert.alert('Error', error.message || 'Failed to create swap')
  }
}
```

## 5. Error Handling

Create a centralized error handler:

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || error.response.data?.error
    return message || `Error: ${error.response.status}`
  } else if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.'
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred'
  }
}

// Usage
try {
  const result = await fetchSwapRate(params)
} catch (error) {
  const errorMessage = handleApiError(error)
  dispatch(swapActions.setSwapRateError(errorMessage))
}
```

## 6. API Response Types

Define your API response types:

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
```

## 7. Environment Configuration

Use environment variables for API URLs:

```typescript
// config/env.ts
export const ENV = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://api.yourapp.com',
  API_TIMEOUT: 10000,
  ENABLE_LOGS: __DEV__,
}

// Usage
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
})
```

## 8. Rate Limiting & Caching

Implement caching to reduce API calls:

```typescript
// utils/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

export const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() })
}

// Usage
const cacheKey = `swap-rate-${sellId}-${buyId}-${amount}`
const cached = getCachedData(cacheKey)
if (cached) {
  return cached
}

const result = await fetchSwapRate(params)
setCachedData(cacheKey, result)
```

## 9. Retry Logic

Add automatic retry for failed requests:

```typescript
// utils/retry.ts
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

// Usage
const result = await retryRequest(() => fetchSwapRate(params))
```

## 10. Testing API Integration

### Mock API for Testing

```typescript
// __mocks__/swapApi.ts
export const fetchSupportedCurrencies = jest.fn(() =>
  Promise.resolve([
    { _id: '1', currencyId: { code: 'BTC' } },
    { _id: '2', currencyId: { code: 'USD' } },
  ])
)

export const fetchSwapRate = jest.fn(() =>
  Promise.resolve({
    sellAmount: 100,
    buyAmount: 4500,
    sellRate: 0.022,
    buyRate: 45000,
  })
)

// In test file
jest.mock('../api/swapApi')
```

## Complete Example

Here's a complete example with all pieces together:

```typescript
// api/swapApi.ts
import axios from 'axios'
import { ENV } from '../config/env'
import { handleApiError } from '../utils/errorHandler'
import { getCachedData, setCachedData } from '../utils/cache'
import { retryRequest } from '../utils/retry'

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
})

export const fetchSwapRate = async (
  params: FetchSwapRateRequestParams
): Promise<SwapRateModel> => {
  const cacheKey = `rate-${params.sellSupportedCurrencyId}-${params.buySupportedCurrencyId}-${params.sellAmount || params.buyAmount}`

  // Check cache
  const cached = getCachedData<SwapRateModel>(cacheKey)
  if (cached) return cached

  try {
    const result = await retryRequest(async () => {
      const response = await apiClient.post('/swap/rate', params)
      return response.data.data
    })

    // Cache result
    setCachedData(cacheKey, result)
    return result
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
```

## Checklist

- [ ] Setup API client with base URL
- [ ] Add authentication headers
- [ ] Replace mock supported currencies call
- [ ] Replace mock swap rate call
- [ ] Add create transaction endpoint
- [ ] Implement error handling
- [ ] Add caching if needed
- [ ] Add retry logic if needed
- [ ] Test with real API
- [ ] Handle edge cases (network errors, timeouts, etc.)
- [ ] Add loading states
- [ ] Add success/error notifications

## Next Steps

1. Get your API endpoints from your backend team
2. Update the API client with correct URLs
3. Test each endpoint individually
4. Integrate with the component
5. Handle errors gracefully
6. Add analytics/logging if needed
