import { useCallback, useEffect, useRef, useState } from "react";
import {
  SupportedCurrenciesResponse,
  SupportedCurrency,
  UseFetchCurrenciesOptions,
  UseFetchCurrenciesReturn,
} from "../../domain/entities/currency.types";
import { ApiResponse, swapApiService } from "./swap-api.service";

// Cache for storing fetched currencies
const currencyCache = new Map<
  string,
  {
    data: SupportedCurrenciesResponse;
    timestamp: number;
  }
>();

export const useFetchCurrencies = (
  options: UseFetchCurrenciesOptions = {}
): UseFetchCurrenciesReturn => {
  const {
    includeFiat = true,
    enabled = true,
    refetchOnMount = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache
    retryOnError = true,
    maxRetries = 3,
  } = options;

  const [currencies, setCurrencies] = useState<SupportedCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  const fiatCurrencies = currencies?.filter(
    (currency) => !currency.currencyId?.isCrypto
  );
  const cryptoCurrencies = currencies?.filter(
    (currency) => currency.currencyId?.isCrypto
  );

  const fetchCurrencies = useCallback(
    async (retryAttempt: number = 0) => {
      if (!enabled || !isMountedRef.current) return;

      const cacheKey = `currencies_${includeFiat}`;
      const cached = currencyCache.get(cacheKey);

      // Check if we have valid cached data
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        if (isMountedRef.current) {
          setCurrencies(cached.data?.data || []);
          setLastFetched(new Date(cached.timestamp));
          setRetryCount(0);
        }
        return;
      }

      if (isMountedRef.current) {
        setIsLoading(true);
        setIsError(false);
        setError(null);
      }

      try {
        const response: ApiResponse<SupportedCurrenciesResponse> =
          await swapApiService.get<SupportedCurrenciesResponse>(
            `/supportedCurrencies?includeFiat=${includeFiat}`
          );

        if (response.success && response.data && isMountedRef.current) {
          setCurrencies(response.data?.data || []);
          setLastFetched(new Date());
          setIsError(false);
          setError(null);
          setRetryCount(0);

          // Cache the response
          currencyCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          });
        } else {
          throw new Error(response.message || "Failed to fetch currencies");
        }
      } catch (err) {
        const apiError = err as any;

        if (isMountedRef.current) {
          setError(apiError);
          setRetryCount(retryAttempt);

          // Retry logic
          if (retryOnError && retryAttempt < maxRetries) {
            console.warn(
              `Retrying fetch currencies (attempt ${
                retryAttempt + 1
              }/${maxRetries})`
            );
            setTimeout(() => {
              if (isMountedRef.current) {
                fetchCurrencies(retryAttempt + 1);
              }
            }, Math.pow(2, retryAttempt) * 1000); // Exponential backoff
            return;
          }

          setIsError(true);
          console.error("Error fetching currencies:", apiError);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [enabled, includeFiat, cacheTime, retryOnError, maxRetries]
  );

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    const cacheKey = `currencies_${includeFiat}`;
    currencyCache.delete(cacheKey);
    setRetryCount(0);
    await fetchCurrencies();
  }, [fetchCurrencies, includeFiat]);

  // Clear cache function
  const clearCache = useCallback(() => {
    const cacheKey = `currencies_${includeFiat}`;
    currencyCache.delete(cacheKey);
  }, [includeFiat]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (refetchOnMount) {
      fetchCurrencies();
    }
  }, [fetchCurrencies, refetchOnMount]);

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
  };
};

export const useFetchCryptoCurrencies = (
  options: Omit<UseFetchCurrenciesOptions, "includeFiat"> = {}
) => {
  return useFetchCurrencies({ ...options, includeFiat: false });
};

// Utility hook for just fiat currencies
export const useFetchFiatCurrencies = (
  options: Omit<UseFetchCurrenciesOptions, "includeFiat"> = {}
) => {
  return useFetchCurrencies({ ...options, includeFiat: true });
};

// Utility function to clear currency cache
export const clearCurrencyCache = () => {
  currencyCache.clear();
};

// Utility function to get cached currencies without triggering a fetch
export const getCachedCurrencies = (
  includeFiat: boolean = true
): SupportedCurrency[] | null => {
  const cacheKey = `currencies_${includeFiat}`;
  const cached = currencyCache.get(cacheKey);
  return cached ? cached.data?.data : null;
};

