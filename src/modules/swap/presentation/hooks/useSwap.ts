import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppRootState } from "../../../../../state";
import {
  setActiveTab,
  setBaseAmount,
  setBaseCurrency,
  setBaseInputIsDollar,
  setCurrencies,
  setError,
  setIsLoading,
  setIsRateLoading,
  setMarketRate,
  setSelectedBank,
  setSelectedOption,
  setTargetAmount,
  setTargetCurrency,
  swapCurrencies,
} from "../state/swap-slice";

// Formatting utility functions
const formatTargetAmount = ({
  targetAmount,
  targetCurrency,
}: {
  targetAmount: number;
  targetCurrency: any;
}) => {
  if (!targetCurrency || targetAmount === 0) return "0";

  // Format based on currency type
  if (targetCurrency.currencyId?.isCrypto) {
    return targetAmount.toFixed(6);
  } else {
    return targetAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
};

// useSwap hook using Redux for state management
export const useSwap = () => {
  const dispatch = useDispatch();

  // Select state from Redux store
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    isReversed,
    selectedBank,
    currencies,
    selectedOption,
    marketRate,
    isRateLoading,
    baseInputIsDollar,
    activeTab,
    error,
    isLoading,
  } = useSelector((state: AppRootState) => state.swap);

  // Redux-powered methods
  const setBaseInput = useCallback(
    (value: boolean) => {
      console.log("setBaseInput called with:", value);
      dispatch(setBaseInputIsDollar(value));
    },
    [dispatch]
  );

  const handleBaseAmountFormat = useCallback(() => {
    console.log("handleBaseAmountFormat called");
    return baseAmount?.toString() || "0";
  }, [baseAmount]);

  const handleTargetAmountFormat = useCallback(() => {
    console.log("handleTargetAmountFormat called");
    return formatTargetAmount({ targetAmount, targetCurrency });
  }, [targetAmount, targetCurrency]);

  const handleTargetAmountChange = useCallback(
    (amount: string) => {
      console.log("handleTargetAmountChange called with:", amount);
      const numAmount = parseFloat(amount) || 0;
      dispatch(setTargetAmount(numAmount));
    },
    [dispatch]
  );

  const handleBaseAmountChange = useCallback(
    (amount: string) => {
      console.log("handleBaseAmountChange called with:", amount);
      const numAmount = parseFloat(amount) || 0;
      console.log("Dispatching setBaseAmount with:", numAmount);
      dispatch(setBaseAmount(numAmount));
    },
    [dispatch]
  );

  const handleSwapCurrencies = useCallback(() => {
    console.log("handleSwapCurrencies called");
    dispatch(swapCurrencies());
  }, [dispatch]);

  const handleBaseToUsdFormat = useCallback(() => {
    console.log("handleBaseToUsdFormat called");
    return baseAmount?.toString() || "0";
  }, [baseAmount]);

  const setChangedByUser = useCallback((type: string) => {
    console.log("setChangedByUser called with:", type);
  }, []);

  // Enhanced currency setters
  const setBaseCurrencyWithRates = useCallback(
    (currency: any) => {
      dispatch(setBaseCurrency(currency));
    },
    [dispatch]
  );

  const setTargetCurrencyWithRates = useCallback(
    (currency: any) => {
      dispatch(setTargetCurrency(currency));
    },
    [dispatch]
  );

  // Tab management
  const handleTabChange = useCallback(
    (tab: "EXCHANGE" | "WALLET") => {
      dispatch(setActiveTab(tab));
    },
    [dispatch]
  );

  // Validation function
  const validateExchange = useCallback((): boolean => {
    if (!baseCurrency) {
      dispatch(setError("Please select a currency to sell"));
      return false;
    }

    if (!targetCurrency) {
      dispatch(setError("Please select a currency to receive"));
      return false;
    }

    if (baseCurrency._id === targetCurrency._id) {
      dispatch(setError("Sell and receive currencies must be different"));
      return false;
    }

    if (!baseAmount || baseAmount <= 0) {
      dispatch(setError("Please enter a valid sell amount"));
      return false;
    }

    dispatch(setError(null));
    return true;
  }, [baseCurrency, targetCurrency, baseAmount, dispatch]);

  // Reset function
  const resetExchange = useCallback(() => {
    dispatch(setBaseCurrency(null));
    dispatch(setTargetCurrency(null));
    dispatch(setBaseAmount(0));
    dispatch(setTargetAmount(0));
    dispatch(setMarketRate(null));
    dispatch(setIsLoading(false));
    dispatch(setError(null));
  }, [dispatch]);

  return {
    // State properties
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    isReversed,
    selectedBank,
    currencies,
    selectedOption,
    marketRate,
    isRateLoading,
    baseInputIsDollar,
    activeTab,
    error,
    isLoading,

    // Redux setters (wrapped in dispatch)
    setBaseAmount: (amount: number) => dispatch(setBaseAmount(amount)),
    setTargetAmount: (amount: number) => dispatch(setTargetAmount(amount)),
    setBaseCurrency: setBaseCurrencyWithRates,
    setTargetCurrency: setTargetCurrencyWithRates,
    setSelectedBank: (bank: any) => dispatch(setSelectedBank(bank)),
    setCurrencies: (currencies: any[]) => dispatch(setCurrencies(currencies)),
    setSelectedOption: (option: string) => dispatch(setSelectedOption(option)),
    setMarketRate: (rate: any) => dispatch(setMarketRate(rate)),
    setIsRateLoading: (loading: boolean) => dispatch(setIsRateLoading(loading)),
    setActiveTab: handleTabChange,

    // Methods
    setBaseInput,
    handleBaseAmountFormat,
    handleTargetAmountFormat,
    handleTargetAmountChange,
    handleBaseAmountChange,
    handleSwapCurrencies,
    handleBaseToUsdFormat,
    setChangedByUser,
    validateExchange,
    resetExchange,
  };
};

export default useSwap;
