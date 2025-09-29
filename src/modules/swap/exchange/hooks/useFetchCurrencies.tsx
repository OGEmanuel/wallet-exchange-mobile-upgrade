import { useState, useEffect, useCallback, useRef } from "react"
import { httpRequest, ApiResponse, ApiError } from "../api/httpRequest"

// Types for the supported currencies response
export interface SupportedCurrency {
  __v?: number
  _id?: string
  chainId?: ChainId
  createdAt?: string
  currencyId?: CurrencyId
  decimals?: number
  defaultBalancesProvider?: string
  defaultBuyProvider?: string
  defaultSellProvider?: string
  defaultTradesProvider?: string
  defaultTransactionsProvider?: string
  image?: string
  isActive?: boolean
  isStable?: boolean
  preferredBalancesProviders?: string[]
  preferredRPCProviders?: any[]
  preferredTradesProviders?: string[]
  preferredTransactionsProviders?: string[]
  tokenAddress?: string
  updatedAt?: string
}

export interface ChainId {
  __v?: number
  _id?: string
  chainId?: number
  createdAt?: string
  isEVM?: boolean
  name?: string
  nativeCurrencyId?: string
  nativeCurrencySymbol?: string
  symbol?: string
  updatedAt?: string
}

export interface CurrencyId {
  __v?: number
  _id?: string
  ath?: number
  buyRate?: number
  circulatingSupply?: number
  code?: string
  createdAt?: string
  defaultNewsProvider?: string
  defaultRatesProvider?: string
  isActive?: boolean
  isCrypto?: boolean
  isStable?: boolean
  isUserToken?: boolean
  logo?: string
  maxSupply?: number
  name?: string
  preferredNewsProviders?: string[]
  preferredRatesProviders?: string[]
  preferredTokenMetricsProviders?: any[]
  sellRate?: number
  symbol?: string
  totalSupply?: number
  updatedAt?: string
  volatility?: number
}

export interface SupportedCurrenciesResponse {
  data: SupportedCurrency[]
  total: number
  fiatCount: number
  cryptoCount: number
}

export interface UseFetchCurrenciesOptions {
  includeFiat?: boolean
  enabled?: boolean
  refetchOnMount?: boolean
  cacheTime?: number // in milliseconds
  retryOnError?: boolean
  maxRetries?: number
}

export interface UseFetchCurrenciesReturn {
  currencies: SupportedCurrency[]
  fiatCurrencies: SupportedCurrency[]
  cryptoCurrencies: SupportedCurrency[]
  isLoading: boolean
  isError: boolean
  error: ApiError | null
  refetch: () => Promise<void>
  lastFetched: Date | null
  retryCount: number
  clearCache: () => void
}

// Cache for storing fetched currencies
const currencyCache = new Map<
  string,
  {
    data: SupportedCurrenciesResponse
    timestamp: number
  }
>()

export const useFetchCurrencies = (
  options: UseFetchCurrenciesOptions = {},
): UseFetchCurrenciesReturn => {
  const {
    includeFiat = true,
    enabled = true,
    refetchOnMount = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache
    retryOnError = true,
    maxRetries = 3,
  } = options

  const [currencies, setCurrencies] = useState<SupportedCurrency[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  const fiatCurrencies = currencies?.filter((currency) => !currency.isCrypto)
  const cryptoCurrencies = currencies?.filter((currency) => currency.isCrypto)

  const fetchCurrencies = useCallback(
    async (retryAttempt: number = 0) => {
      if (!enabled || !isMountedRef.current) return

      const cacheKey = `currencies_${includeFiat}`
      const cached = currencyCache.get(cacheKey)

      // Check if we have valid cached data
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        if (isMountedRef.current) {
          setCurrencies(cached.data?.data || [])
          setLastFetched(new Date(cached.timestamp))
          setRetryCount(0)
        }
        return
      }

      if (isMountedRef.current) {
        setIsLoading(true)
        setIsError(false)
        setError(null)
      }

      try {
        const response: ApiResponse<SupportedCurrenciesResponse> =
          await httpRequest.get<SupportedCurrenciesResponse>(
            `/supportedCurrencies?includeFiat=${includeFiat}`,
          )

        if (response.success && response.data && isMountedRef.current) {
          setCurrencies(response.data?.data || [])
          setLastFetched(new Date())
          setIsError(false)
          setError(null)
          setRetryCount(0)

          // Cache the response
          currencyCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          })
        } else {
          throw new Error(response.message || "Failed to fetch currencies")
        }
      } catch (err) {
        const apiError = err as ApiError

        if (isMountedRef.current) {
          setError(apiError)
          setRetryCount(retryAttempt)

          // Retry logic
          if (retryOnError && retryAttempt < maxRetries) {
            console.warn(`Retrying fetch currencies (attempt ${retryAttempt + 1}/${maxRetries})`)
            setTimeout(
              () => {
                if (isMountedRef.current) {
                  fetchCurrencies(retryAttempt + 1)
                }
              },
              Math.pow(2, retryAttempt) * 1000,
            ) // Exponential backoff
            return
          }

          setIsError(true)
          console.error("Error fetching currencies:", apiError)
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [enabled, includeFiat, cacheTime, retryOnError, maxRetries],
  )

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    const cacheKey = `currencies_${includeFiat}`
    currencyCache.delete(cacheKey)
    setRetryCount(0)
    await fetchCurrencies()
  }, [fetchCurrencies, includeFiat])

  // Clear cache function
  const clearCache = useCallback(() => {
    const cacheKey = `currencies_${includeFiat}`
    currencyCache.delete(cacheKey)
  }, [includeFiat])

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (refetchOnMount) {
      fetchCurrencies()
    }
  }, [fetchCurrencies, refetchOnMount])

  return {
    currencies,
    fiatCurrencies,
    cryptoCurrencies,
    isLoading,
    isError,
    error,
    refetch,
    lastFetched,
    retryCount,
    clearCache,
  }
}

export const useFetchCryptoCurrencies = (
  options: Omit<UseFetchCurrenciesOptions, "includeFiat"> = {},
) => {
  return useFetchCurrencies({ ...options, includeFiat: false })
}

// Utility hook for just fiat currencies
export const useFetchFiatCurrencies = (
  options: Omit<UseFetchCurrenciesOptions, "includeFiat"> = {},
) => {
  return useFetchCurrencies({ ...options, includeFiat: true })
}

// Utility function to clear currency cache
export const clearCurrencyCache = () => {
  currencyCache.clear()
}

// Utility function to get cached currencies without triggering a fetch
export const getCachedCurrencies = (includeFiat: boolean = true): SupportedCurrency[] | null => {
  const cacheKey = `currencies_${includeFiat}`
  const cached = currencyCache.get(cacheKey)
  return cached ? cached.data?.data : null
}
