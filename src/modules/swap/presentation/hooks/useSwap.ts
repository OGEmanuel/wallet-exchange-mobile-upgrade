import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppRootState } from "../../../../../state";
import { formatInputAmount, parseFormattedAmount } from "../../utils";
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
import { useDebouncedRates } from "./useDebouncedRates";

// Enhanced formatting utility function
const formatTargetAmountLocal = ({
  targetAmount,
  targetCurrency,
}: {
  targetAmount: number;
  targetCurrency: any;
}) => {
  if (!targetCurrency || targetAmount === 0) return "0";

  // Use the enhanced formatting from utils
  const isCrypto = targetCurrency?.currencyId?.isCrypto || false;
  return formatInputAmount(targetAmount.toString(), isCrypto);
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
    lastEditedField,
    error,
    isLoading,
  } = useSelector((state: AppRootState) => state.swap);

  // Use debounced rate fetching
  const { refetchRates } = useDebouncedRates({
    debounceDelay: 500, // 500ms delay
    minAmount: 0.01, // Minimum amount to trigger rate fetch
  });

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
    const isCrypto = baseCurrency?.currencyId?.isCrypto || false;
    return formatInputAmount(baseAmount?.toString() || "", isCrypto);
  }, [baseAmount, baseCurrency]);

  const handleTargetAmountFormat = useCallback(() => {
    console.log("handleTargetAmountFormat called");
    return formatTargetAmountLocal({ targetAmount, targetCurrency });
  }, [targetAmount, targetCurrency]);

  const handleTargetAmountChange = useCallback(
    (amount: string) => {
      console.log("handleTargetAmountChange called with:", amount);
      const numAmount = parseFormattedAmount(amount);
      dispatch(setTargetAmount(numAmount));
    },
    [dispatch]
  );

  const handleBaseAmountChange = useCallback(
    (amount: string) => {
      const numAmount = parseFormattedAmount(amount);
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

  // Enhanced currency setters that trigger immediate rate fetch
  const setBaseCurrencyWithRates = useCallback(
    (currency: any) => {
      dispatch(setBaseCurrency(currency));
      // Trigger immediate rate fetch when currency changes
      setTimeout(() => refetchRates(), 100);
    },
    [dispatch, refetchRates]
  );

  const setTargetCurrencyWithRates = useCallback(
    (currency: any) => {
      dispatch(setTargetCurrency(currency));
      // Trigger immediate rate fetch when currency changes
      setTimeout(() => refetchRates(), 100);
    },
    [dispatch, refetchRates]
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
    lastEditedField,
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
    refetchRates, // Expose manual refetch function
  };
};

export default useSwap;
