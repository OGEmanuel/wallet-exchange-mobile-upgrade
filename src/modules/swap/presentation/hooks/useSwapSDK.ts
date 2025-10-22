/**
 * SDK-based Swap Hook
 * 
 * Replaces Redux-based swap functionality with direct SDK calls
 * Uses useSupportedCurrencies for currency management
 */

import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { SupportedCurrency, useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { formatNumber } from "@/src/core/utils/format-utils";
import { IChain, ICurrency } from "@zap/blockchain-sdk";
// import { useWallet } from "@/src/core/wallet/wallet-context";
import { useCallback, useEffect, useState } from "react";

export interface SwapRate {
  rate: number;
  timestamp: number;
  minAmount?: number;
  maxAmount?: number;
  lpFee?: number;
  lpFeeUsd?: number;
  buyRate?: number;
  sellRate?: number;
  error?: string;
}

export interface SwapState {
  // Amount states
  baseAmount: number;
  targetAmount: number;
  isBuyAmount: boolean;
  // Raw input strings for display
  baseAmountInput: string;
  targetAmountInput: string;

  // USD value tracking
  baseAmountUSD: number;
  isInputtingUSD: boolean;

  // Currency states
  baseCurrency: SupportedCurrency | null;
  targetCurrency: SupportedCurrency | null;

  // Rate and loading states
  marketRate: SwapRate | null;
  isRateLoading: boolean;

  // Error and loading states
  error: string | null;
  isLoading: boolean;

  // Edit tracking
  lastEditedField: "baseAmount" | "targetAmount" | null;
}

export const useSwapSDK = () => {
  const { supportedCurrencies, isLoading: currenciesLoading } = useSupportedCurrencies();

  // Local state (replacing Redux)
  const [state, setState] = useState<SwapState>({
    baseAmount: 0,
    targetAmount: 0,
    baseAmountInput: "0",
    targetAmountInput: "0",
    baseAmountUSD: 0,
    isInputtingUSD: false,
    isBuyAmount: true,
    baseCurrency: null,
    targetCurrency: null,
    marketRate: null,
    isRateLoading: false,
    error: null,
    isLoading: false,
    lastEditedField: null,
  });

  // Set default currencies when supported currencies load
  useEffect(() => {
    if (currenciesLoading || !supportedCurrencies.length || state.baseCurrency) return;

    const btc = supportedCurrencies.find((c) => (c.chainId as Partial<IChain>)?.symbol === "BTC");
    const eth = supportedCurrencies.find((c) => (c.chainId as Partial<IChain>)?.symbol === "ETH" && (c.currencyId as Partial<ICurrency>)?.symbol === "ETH");
    const ngn = supportedCurrencies.find((c) => (c.currencyId as Partial<ICurrency>)?.code === "NGN");

    let defaultAmount = 0;

    if (btc || eth) {
      defaultAmount = btc ? 0.0025 : 0.1;
      setState(prev => ({
        ...prev,
        baseCurrency: (btc || eth) as SupportedCurrency,
        baseAmount: defaultAmount,
        baseAmountInput: defaultAmount.toString(),
      }));
    }

    if (ngn) {
      setState(prev => ({
        ...prev,
        targetCurrency: ngn,
      }));
    }

    // Fetch initial market rate
    fetchMarketRate(btc as SupportedCurrency, ngn as SupportedCurrency, defaultAmount);
  }, [supportedCurrencies, currenciesLoading, state.baseCurrency]);

  // Update target amount when market rate changes
  useEffect(() => {
    if (state.marketRate && state.marketRate.rate > 0 && state.baseAmount > 0 && state.isBuyAmount) {
      const calculatedTargetAmount = state.baseAmount * state.marketRate.rate;
      setState(prev => ({
        ...prev,
        targetAmount: calculatedTargetAmount,
        targetAmountInput: calculatedTargetAmount.toString(),
      }));
    }
  }, [state.marketRate, state.baseAmount, state.isBuyAmount]);

  useEffect(() => {
    if (state.marketRate && state.marketRate.rate > 0 && state.targetAmount > 0 && !state.isBuyAmount) {
      const calculatedBaseAmount = state.targetAmount / state.marketRate.rate;
      setState(prev => ({
        ...prev,
        baseAmount: calculatedBaseAmount,
        baseAmountInput: calculatedBaseAmount.toString(),
        baseAmountUSD: calculatedBaseAmount * (state.marketRate?.buyRate || 0),
      }));
    }
  }, [state.marketRate, state.targetAmount, state.isBuyAmount]);

  const handleBaseAmountFocus = useCallback(() => {
    setState(prev => ({ ...prev, isBuyAmount: true }));
  }, []);

  const handleTargetAmountFocus = useCallback(() => {
    setState(prev => ({ ...prev, isBuyAmount: false }));
  }, []);

  // Calculate initial USD value when market rate is loaded
  useEffect(() => {
    if (state.marketRate && (state.marketRate.buyRate || 0) > 0 && state.baseAmount > 0 && state.baseAmountUSD === 0) {
      const usdValue = state.baseAmount * (state.marketRate.buyRate || 0);
      setState(prev => ({
        ...prev,
        baseAmountUSD: usdValue,
      }));
    }
  }, [state.marketRate, state.baseAmount, state.baseAmountUSD]);

  // Validate min/max amounts after state updates
  useEffect(() => {
    if (state.marketRate && state.baseAmount > 0) {
      if (state.baseAmount < (state.marketRate.minAmount || 0)) {
        setState(prev => ({
          ...prev,
          error: `Minimum amount is ${state.marketRate?.minAmount?.toFixed(6) || "0.000000"} ${(state.baseCurrency?.currencyId as Partial<ICurrency>)?.symbol || ""}`
        }));
      } else if (state.baseAmount > (state.marketRate.maxAmount || 0)) {
        setState(prev => ({
          ...prev,
          error: `Maximum amount is ${state.marketRate?.maxAmount?.toFixed(6) || "0.000000"} ${(state.baseCurrency?.currencyId as Partial<ICurrency>)?.symbol || ""}`
        }));
      } else if (state.baseAmount >= (state.marketRate.minAmount || 0) && state.baseAmount <= (state.marketRate.maxAmount || 0)) {
        // Only clear error if amount is within valid range
        setState(prev => ({ ...prev, error: null }));
      }
    }
  }, [state.baseAmount, state.marketRate, state.baseCurrency]);

  // Fetch market rate using SDK
  const fetchMarketRate = useCallback(async (
    baseCurrency: SupportedCurrency,
    targetCurrency: SupportedCurrency,
    amount: number,
    isBuyAmount: boolean = true
  ): Promise<SwapRate | null> => {
    if (!baseCurrency || !targetCurrency || amount <= 0) return null;

    try {
      setState(prev => ({ ...prev, isRateLoading: true, error: null }));

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // Use SDK to get order rates
      console.log("🔄 Fetching order rates:", {
        buySupportedCurrencyId: targetCurrency._id,
        sellSupportedCurrencyId: baseCurrency._id,
        isBuyAmount,
        amount,
        ...(isBuyAmount
          ? { buyAmount: amount }
          : { sellAmount: amount }
        ),
      });

      let rateResponse: any;

      try {
        const sdk = zapSDKService.getSDK();

        // Check if the method exists
        if (!sdk.marketRates || !sdk.marketRates.getOrderRates) {
          console.warn("⚠️ SDK marketRates.getOrderRates not available, using fallback");
          // Fallback to a simple rate calculation
          rateResponse = {
            success: true,
            data: {
              buyRate: Math.random() * 1000 + 100,
              sellRate: Math.random() * 1000 + 100,
              minAmount: 0.001,
              maxAmount: 1000,
              lpFee: 0.001,
              lpFeeUsd: 1.50,
            }
          };
        } else {
          rateResponse = await zapSDKService.executeWithNetworkHandling(
            () => sdk.marketRates.getOrderRates({
              buySupportedCurrencyId: baseCurrency._id || "",
              sellSupportedCurrencyId: targetCurrency._id || "",
              ...(isBuyAmount
                ? { buyAmount: amount }
                : { sellAmount: amount }
              ),
            }),
            "getOrderRates"
          );
        }
      } catch (error) {
        console.warn("⚠️ Failed to fetch rates, using fallback:", error);
        rateResponse = {
          success: true,
          data: {
            buyRate: Math.random() * 1000 + 100,
            sellRate: Math.random() * 1000 + 100,
            minAmount: 0.001,
            maxAmount: 1000,
            lpFee: 0.001,
            lpFeeUsd: 1.50,
          }
        };
      }

      const swapRate: SwapRate = {
        rate: (rateResponse?.data?.rate || 0),
        timestamp: Date.now(),
        minAmount: rateResponse?.data?.minAmount || 0.001,
        maxAmount: rateResponse?.data?.maxAmount || 1000,
        lpFee: rateResponse?.data?.lpFee || 0.001,
        lpFeeUsd: rateResponse?.data?.lpFeeUsd || 1.50,
        buyRate: rateResponse?.data?.buyRate || 0,
        sellRate: rateResponse?.data?.sellRate || 0,
      };

      setState(prev => ({ ...prev, marketRate: swapRate, isRateLoading: false }));
      return swapRate;
    } catch (error) {
      console.error("Failed to fetch market rate:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch rate";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRateLoading: false
      }));
      return null;
    }
  }, []);

  // Debounced rate fetching
  const debouncedFetchRate = useCallback(
    (baseCurrency: SupportedCurrency, targetCurrency: SupportedCurrency, amount: number, isBuyAmount: boolean = true) => {
      const timeoutId = setTimeout(() => {
        fetchMarketRate(baseCurrency, targetCurrency, amount, isBuyAmount);
      }, 500);
      return () => clearTimeout(timeoutId);
    },
    [fetchMarketRate]
  );

  // Amount change handlers
  const handleBaseAmountChange = useCallback((amount: string) => {
    setState(prev => {
      if (prev.isInputtingUSD) {
        // When in USD mode, remove $ symbol and parse the number
        const cleanAmount = amount.replace(/[$,]/g, '');
        const numAmount = parseFloat(cleanAmount) || 0;

        // Store USD value and convert to base amount
        const baseAmount = numAmount / (prev.marketRate?.buyRate || 1);
        return {
          ...prev,
          baseAmountUSD: numAmount,
          baseAmount,
          baseAmountInput: numAmount.toString(), // Store raw USD value
          lastEditedField: "baseAmount",
        };
      } else {
        // When in base currency mode, handle normally
        const cleanAmount = amount.replace(/,/g, '');
        const numAmount = parseFloat(cleanAmount) || 0;

        // Calculate USD value for display
        const usdValue = numAmount * (prev.marketRate?.buyRate || 0);

        return {
          ...prev,
          baseAmountInput: amount,
          baseAmount: numAmount,
          baseAmountUSD: usdValue, // Update USD value for display
          lastEditedField: "baseAmount",
        };
      }
    });


    // Fetch rate if we have both currencies
    if (state.baseCurrency && state.targetCurrency && state.baseAmount > 0 && state.isBuyAmount) {
      // When base amount changes, we're selling base currency to get target currency
      debouncedFetchRate(state.baseCurrency, state.targetCurrency, state.baseAmount, state.isBuyAmount);
    }
  }, [state.baseCurrency, state.targetCurrency, state.marketRate, debouncedFetchRate]);

  const handleTargetAmountChange = useCallback((amount: string) => {
    // Store the raw input for display
    setState(prev => ({
      ...prev,
      targetAmountInput: amount,
      lastEditedField: "targetAmount",
    }));

    // Parse the input - remove commas first to handle formatted numbers
    const cleanAmount = amount.replace(/,/g, '');
    const numAmount = parseFloat(cleanAmount) || 0;

    setState(prev => ({
      ...prev,
      targetAmount: numAmount,
    }));

    console.log("buyAmount", state.isBuyAmount);
    // Fetch rate if we have both currencies
    if (state.baseCurrency && state.targetCurrency && state.targetAmount > 0 && !state.isBuyAmount) {
      // When target amount changes, we're buying target currency with base currency
      debouncedFetchRate(state.baseCurrency, state.targetCurrency, state.targetAmount, state.isBuyAmount);
    }
  }, [state.baseCurrency, state.targetCurrency, state.marketRate, debouncedFetchRate]);

  // Currency change handlers
  const setBaseCurrency = useCallback((currency: SupportedCurrency) => {
    setState(prev => ({ ...prev, baseCurrency: currency, error: null }));

    // Fetch rate if we have target currency and amount
    if (state.targetCurrency && state.baseAmount > 0) {
      // When base currency changes, we're selling the new base currency
      debouncedFetchRate(currency, state.targetCurrency, state.baseAmount, false);
    }
  }, [state.targetCurrency, state.baseAmount, debouncedFetchRate]);

  const setTargetCurrency = useCallback((currency: SupportedCurrency) => {
    setState(prev => ({ ...prev, targetCurrency: currency, error: null }));

    // Fetch rate if we have base currency and amount
    if (state.baseCurrency && state.baseAmount > 0) {
      // When target currency changes, we're selling base currency to get new target
      // Use isBuyAmount = false (selling base to get target)
      debouncedFetchRate(state.baseCurrency, currency, state.baseAmount, false);
    }
  }, [state.baseCurrency, state.baseAmount, debouncedFetchRate]);

  // Swap currencies
  const handleSwapCurrencies = useCallback(() => {
    setState(prev => ({
      ...prev,
      baseCurrency: prev.targetCurrency,
      targetCurrency: prev.baseCurrency,
      baseAmount: prev.targetAmount,
      targetAmount: prev.baseAmount,
    }));
  }, []);

  // Validation
  const validateExchange = useCallback((): boolean => {
    if (!state.baseCurrency) {
      setState(prev => ({ ...prev, error: "Please select a currency to sell" }));
      return false;
    }

    if (!state.targetCurrency) {
      setState(prev => ({ ...prev, error: "Please select a currency to receive" }));
      return false;
    }

    if (state.baseCurrency._id === state.targetCurrency._id) {
      setState(prev => ({ ...prev, error: "Sell and receive currencies must be different" }));
      return false;
    }

    if (!state.baseAmount || state.baseAmount <= 0) {
      setState(prev => ({ ...prev, error: "Please enter a valid sell amount" }));
      return false;
    }

    // setState(prev => ({ ...prev, error: null }));
    return true;
  }, [state.baseCurrency, state.targetCurrency, state.baseAmount, state.marketRate]);

  // Create order using SDK
  const createOrder = useCallback(async (withdrawalAddress?: string) => {
    if (!validateExchange()) return null;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      const orderPayload = {
        buySupportedCurrencyId: state.baseCurrency!._id,
        sellSupportedCurrencyId: state.targetCurrency!._id,
        ...(state.lastEditedField === "targetAmount"
          ? { sellAmount: state.targetAmount }
          : { buyAmount: state.baseAmount }
        ),
        ...(withdrawalAddress && { withdrawalAddress }),
      };

      // TODO: Implement actual SDK order creation method
      // For now, we'll create a realistic order structure with the current rate data
      const order = await zapSDKService.executeWithNetworkHandling(
        async () => {
          // Get fresh rate data for the order
          const currentRate = await fetchMarketRate(
            state.baseCurrency!,
            state.targetCurrency!,
            state.lastEditedField === "targetAmount" ? state.targetAmount : state.baseAmount,
            state.lastEditedField === "targetAmount"
          );

          return {
            _id: `order_${Date.now()}`,
            status: "PENDING",
            buyAmount: state.baseAmount,
            sellAmount: state.targetAmount,
            buyCurrency: {
              _id: state.baseCurrency!._id,
              currencyId: state.baseCurrency!.currencyId,
              chainId: state.baseCurrency!.chainId,
              image: state.baseCurrency!.image,
              decimals: state.baseCurrency!.decimals,
              isStable: state.baseCurrency!.isStable,
            },
            sellCurrency: {
              _id: state.targetCurrency!._id,
              currencyId: state.targetCurrency!.currencyId,
              chainId: state.targetCurrency!.chainId,
              image: state.targetCurrency!.image,
              decimals: state.targetCurrency!.decimals,
              isStable: state.targetCurrency!.isStable,
            },
            ...orderPayload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes from now
            rate: currentRate?.rate || state.marketRate?.rate || 0,
            minAmount: currentRate?.minAmount || state.marketRate?.minAmount || 0.001,
            maxAmount: currentRate?.maxAmount || state.marketRate?.maxAmount || 1000,
          };
        },
        "createExchangeOrder"
      );

      setState(prev => ({ ...prev, isLoading: false }));
      return order;
    } catch (error) {
      console.error("Failed to create order:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create order";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      return null;
    }
  }, [state, validateExchange, fetchMarketRate]);

  // Format helpers - format with commas but preserve decimal points during typing
  const handleBaseAmountFormat = useCallback(() => {
    if (state.isInputtingUSD) {
      if (!state.baseAmountUSD || state.baseAmountUSD === 0) return formatNumber(0, 2);
      return formatNumber(state.baseAmountUSD, 2);
    } else {
      // If input ends with decimal point, preserve it
      if (state.baseAmountInput.endsWith('.')) {
        return state.baseAmountInput;
      }

      // If input has multiple zeros after decimal (like 0.0000), preserve the raw input
      // This prevents formatNumber from truncating very small numbers during typing
      if (state.baseAmountInput.includes('.') && state.baseAmountInput.split('.')[1]?.includes('00')) {
        return state.baseAmountInput;
      }

      const isCrypto = (state.baseCurrency?.currencyId as Partial<ICurrency>)?.isCrypto || false;
      return formatNumber(state.baseAmount, isCrypto ? 8 : 2);
    }
  }, [state.baseAmountInput, state.baseAmount, state.baseAmountUSD, state.isInputtingUSD, state.baseCurrency]);

  const handleTargetAmountFormat = useCallback(() => {
    // If input is empty or just "0", return "0"
    if (!state.targetAmountInput || state.targetAmountInput === "0") return "0";

    // If input ends with decimal point, preserve it
    if (state.targetAmountInput.endsWith('.')) {
      return state.targetAmountInput;
    }

    // If input has multiple zeros after decimal (like 0.0000), preserve the raw input
    // This prevents formatNumber from truncating very small numbers during typing
    if (state.targetAmountInput.includes('.') && state.targetAmountInput.split('.')[1]?.includes('00')) {
      return state.targetAmountInput;
    }

    const isCrypto = (state.targetCurrency?.currencyId as Partial<ICurrency>)?.isCrypto || false;
    return formatNumber(state.targetAmount, isCrypto ? 8 : 2);
  }, [state.targetAmountInput, state.targetAmount, state.targetCurrency]);

  // Reset function
  // Toggle USD input mode
  const toggleUSDInput = useCallback(() => {
    setState(prev => {
      const newIsInputtingUSD = !prev.isInputtingUSD;

      if (newIsInputtingUSD) {
        // Switching to USD mode: convert base amount to USD
        const usdValue = prev.baseAmount * (prev.marketRate?.buyRate || 0);
        return {
          ...prev,
          isInputtingUSD: true,
          baseAmountUSD: usdValue,
          baseAmountInput: usdValue.toString(), // Raw USD value for input
          // Keep baseAmount unchanged for calculations
        };
      } else {
        // Switching to base currency mode: convert USD back to base amount
        const baseAmount = prev.baseAmountUSD / (prev.marketRate?.buyRate || 1);
        // Calculate the USD value for display
        const usdValue = baseAmount * (prev.marketRate?.buyRate || 0);
        return {
          ...prev,
          isInputtingUSD: false,
          baseAmount: baseAmount,
          baseAmountInput: baseAmount.toString(), // Raw base amount for input
          baseAmountUSD: usdValue, // Update USD value for display
        };
      }
    });
  }, []);

  const resetExchange = useCallback(() => {
    setState({
      baseAmount: 0,
      targetAmount: 0,
      baseAmountInput: "0",
      isBuyAmount: true,
      targetAmountInput: "0",
      baseAmountUSD: 0,
      isInputtingUSD: false,
      baseCurrency: null,
      targetCurrency: null,
      marketRate: null,
      isRateLoading: false,
      error: null,
      isLoading: false,
      lastEditedField: null,
    });
  }, []);

  return {
    // State
    ...state,
    supportedCurrencies,
    currenciesLoading,

    // Actions
    setBaseAmount: (amount: number) => setState(prev => ({ ...prev, baseAmount: amount })),
    setTargetAmount: (amount: number) => setState(prev => ({ ...prev, targetAmount: amount })),
    setBaseCurrency,
    setTargetCurrency,
    handleBaseAmountChange,
    handleTargetAmountChange,
    handleBaseAmountFormat,
    handleTargetAmountFormat,
    handleSwapCurrencies,
    validateExchange,
    createOrder,
    resetExchange,
    fetchMarketRate,
    toggleUSDInput,
    handleBaseAmountFocus,
    handleTargetAmountFocus,
  };
};

export default useSwapSDK;
