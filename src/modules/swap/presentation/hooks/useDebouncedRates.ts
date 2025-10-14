import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppRootState } from "../../../../../state";
import { getEngineRates } from "../../data/remote/swap-rates.service";
import { setAmountsFromRate, setIsRateLoading } from "../state/swap-slice";

interface UseDebouncedRatesProps {
  debounceDelay?: number;
  minAmount?: number;
}

export const useDebouncedRates = ({
  debounceDelay = 500,
  minAmount = 0,
}: UseDebouncedRatesProps = {}) => {
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isUpdatingFromRateRef = useRef<boolean>(false);

  // Get current state from Redux
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    isReversed,
    isRateLoading,
    lastEditedField,
  } = useSelector((state: AppRootState) => state.swap);

  // Function to fetch rates - using ref to avoid circular dependencies
  const fetchRatesRef = useRef<(() => Promise<void>) | null>(null);

  fetchRatesRef.current = async () => {
    // Don't fetch if we don't have both currencies or if amount is too small
    if (!baseCurrency?._id || !targetCurrency?._id) {
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      dispatch(setIsRateLoading(true));

      // Determine which amount to send based on lastEditedField
      let amountToSend = baseAmount;
      if (lastEditedField === "targetAmount") {
        amountToSend = targetAmount;
      }

      const response = await getEngineRates(
        baseCurrency?._id || "",
        targetCurrency?._id || "",
        baseAmount,
        targetAmount,
        isReversed,
        lastEditedField,
        amountToSend
      );

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log("request was aborted");
        return;
      }

      if (response?.data) {
        // Set the ref to prevent refetching
        isUpdatingFromRateRef.current = true;

        // Use the new action to set both amounts
        dispatch(
          setAmountsFromRate({
            baseAmount: response.data.data.buyAmount,
            targetAmount: response.data.data.sellAmount,
          })
        );

        // Reset the flag after a short delay
        setTimeout(() => {
          isUpdatingFromRateRef.current = false;
        }, 100);
      }
    } catch (error: any) {
      // Don't update state if request was aborted
      if (error.name === "AbortError") {
        return;
      }

      console.error("Error fetching rates:", error);
    } finally {
      // Only set loading to false if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        dispatch(setIsRateLoading(false));
      }
    }
  };

  // Debounced rate fetching effect
  useEffect(() => {
    console.log("useDebouncedRates effect triggered with:", {
      baseAmount,
      targetAmount,
      baseCurrency: baseCurrency?._id,
      targetCurrency: targetCurrency?._id,
      isReversed,
      isUpdatingFromRate: isUpdatingFromRateRef.current,
    });

    // Don't fetch rates if we're updating from a rate response
    if (isUpdatingFromRateRef.current) {
      console.log("Skipping rate fetch - updating from rate response");
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log("Debounced timeout triggered, calling fetchRates");
      if (fetchRatesRef.current) {
        fetchRatesRef.current();
      }
    }, debounceDelay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    baseAmount,
    targetAmount,
    baseCurrency?._id,
    targetCurrency?._id,
    isReversed,
    lastEditedField,
    debounceDelay,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Manual refetch function (useful for immediate updates when needed)
  const refetchRates = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (fetchRatesRef.current) {
      fetchRatesRef.current();
    }
  }, []);

  return {
    isRateLoading,
    refetchRates,
  };
};
