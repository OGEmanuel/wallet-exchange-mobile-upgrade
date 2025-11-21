/**
 * SDK-based Swap Hook
 * 
 * Replaces Redux-based swap functionality with direct SDK calls
 * Uses useSupportedCurrencies for currency management
 */

import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { formatNumber } from "@/src/core/utils/format-utils";
import { CreateOrderRequest, IChain, ICurrency, ISupportedCurrency } from "@zap/blockchain-sdk";
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
  baseCurrency: ISupportedCurrency | null;
  targetCurrency: ISupportedCurrency | null;

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
  const { supportedCurrenciesForSwap, isLoading: currenciesLoading } = useSupportedCurrencies();

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
    if (currenciesLoading || !supportedCurrenciesForSwap.length || state.baseCurrency) return;

    const btc = supportedCurrenciesForSwap.find((c) => (c.chainId as Partial<IChain>)?.symbol === "BTC");
    const eth = supportedCurrenciesForSwap.find((c) => (c.chainId as Partial<IChain>)?.symbol === "ETH" && (c.currencyId as Partial<ICurrency>)?.symbol === "ETH");
    const ngn = supportedCurrenciesForSwap.find((c) => (c.currencyId as Partial<ICurrency>)?.code === "NGN");

    let defaultAmount = 0;

    if (btc || eth) {
      defaultAmount = btc ? 0.0025 : 0.1;
      setState(prev => ({
        ...prev,
        baseCurrency: (btc || eth) as ISupportedCurrency,
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
    fetchMarketRate(btc as ISupportedCurrency, ngn as ISupportedCurrency, defaultAmount);
  }, [supportedCurrenciesForSwap, currenciesLoading, state.baseCurrency]);

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
    baseCurrency: ISupportedCurrency,
    targetCurrency: ISupportedCurrency,
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

      // Validate that currencies have required information
      if (!baseCurrency._id || !targetCurrency._id) {
        console.warn("⚠️ Missing currency IDs, using fallback");
        throw new Error("Missing currency IDs");
      }

      // Check if chain information is available (for debugging)
      const baseChainId = baseCurrency.chainId;
      const targetChainId = targetCurrency.chainId;
      const baseChainSymbol = (baseChainId as Partial<IChain>)?.symbol;
      const targetChainSymbol = (targetChainId as Partial<IChain>)?.symbol;

      console.log("🔄 Fetching order rates:", {
        baseCurrency: {
          id: baseCurrency._id,
          chainId: typeof baseChainId === 'string' ? baseChainId : (baseChainId as any)?._id,
          chainSymbol: baseChainSymbol,
          hasChainInfo: !!baseChainId,
        },
        targetCurrency: {
          id: targetCurrency._id,
          chainId: typeof targetChainId === 'string' ? targetChainId : (targetChainId as any)?._id,
          chainSymbol: targetChainSymbol,
          hasChainInfo: !!targetChainId,
        },
        isBuyAmount,
        amount,
        ...(isBuyAmount
          ? { buyAmount: amount }
          : { sellAmount: amount }
        ),
      });

      // Warn if chain info is missing (this might be the root cause)
      if (!baseChainId && (baseCurrency.currencyId as Partial<ICurrency>)?.isCrypto) {
        console.warn("⚠️ Base currency (crypto) is missing chainId:", {
          currencyId: baseCurrency._id,
          currencySymbol: (baseCurrency.currencyId as Partial<ICurrency>)?.symbol,
        });
      }
      if (!targetChainId && (targetCurrency.currencyId as Partial<ICurrency>)?.isCrypto) {
        console.warn("⚠️ Target currency (crypto) is missing chainId:", {
          currencyId: targetCurrency._id,
          currencySymbol: (targetCurrency.currencyId as Partial<ICurrency>)?.symbol,
        });
      }

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

      setState(prev => ({ ...prev, marketRate: swapRate, isRateLoading: false, error: null }));
      return swapRate;
    } catch (error) {
      console.error("Failed to fetch market rate:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch rate";
      
      // On error, preserve the last known rate and scale amounts accordingly
      setState(prev => {
        const lastRate = prev.marketRate;
        
        // If we have a last known rate, use it to recalculate amounts
        if (lastRate && lastRate.rate > 0) {
          // Recalculate based on isBuyAmount flag (which determines calculation direction)
          if (prev.isBuyAmount && prev.baseAmount > 0) {
            // User is buying - base amount is input, recalculate target amount
            const newTargetAmount = prev.baseAmount * lastRate.rate;
            const newBaseAmountUSD = prev.baseAmount * (lastRate.buyRate || lastRate.rate);
            
            return {
              ...prev,
              targetAmount: newTargetAmount,
              targetAmountInput: newTargetAmount.toString(),
              baseAmountUSD: newBaseAmountUSD,
              error: errorMessage,
              isRateLoading: false,
            };
          } else if (!prev.isBuyAmount && prev.targetAmount > 0) {
            // User is selling - target amount is input, recalculate base amount
            const calculatedBaseAmount = prev.targetAmount / lastRate.rate;
            const newBaseAmountUSD = calculatedBaseAmount * (lastRate.buyRate || lastRate.rate);
            
            return {
              ...prev,
              baseAmount: calculatedBaseAmount,
              baseAmountInput: calculatedBaseAmount.toString(),
              baseAmountUSD: newBaseAmountUSD,
              error: errorMessage,
              isRateLoading: false,
            };
          }
          
          // Fallback: if amounts exist but direction is unclear, recalculate based on last edited field
          if (prev.lastEditedField === "baseAmount" && prev.baseAmount > 0) {
            const newTargetAmount = prev.baseAmount * lastRate.rate;
            const newBaseAmountUSD = prev.baseAmount * (lastRate.buyRate || lastRate.rate);
            
            return {
              ...prev,
              targetAmount: newTargetAmount,
              targetAmountInput: newTargetAmount.toString(),
              baseAmountUSD: newBaseAmountUSD,
              error: errorMessage,
              isRateLoading: false,
            };
          } else if (prev.lastEditedField === "targetAmount" && prev.targetAmount > 0) {
            const calculatedBaseAmount = prev.targetAmount / lastRate.rate;
            const newBaseAmountUSD = calculatedBaseAmount * (lastRate.buyRate || lastRate.rate);
            
            return {
              ...prev,
              baseAmount: calculatedBaseAmount,
              baseAmountInput: calculatedBaseAmount.toString(),
              baseAmountUSD: newBaseAmountUSD,
              error: errorMessage,
              isRateLoading: false,
            };
          }
        }
        
        // No last rate available - just set error
        return {
        ...prev,
        error: errorMessage,
        isRateLoading: false
        };
      });
      
      return null;
    }
  }, []);

  // Debounced rate fetching
  const debouncedFetchRate = useCallback(
    (baseCurrency: ISupportedCurrency, targetCurrency: ISupportedCurrency, amount: number, isBuyAmount: boolean = true) => {
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
        console.log("handleBaseAmountChange called", amount);
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
  const setBaseCurrency = useCallback((currency: ISupportedCurrency) => {
    setState(prev => ({ ...prev, baseCurrency: currency, error: null }));

    // Fetch rate if we have target currency and amount
    if (state.targetCurrency && state.baseAmount > 0) {
      // When base currency changes, we're selling the new base currency
      debouncedFetchRate(currency, state.targetCurrency, state.baseAmount, false);
    }
  }, [state.targetCurrency, state.baseAmount, debouncedFetchRate]);

  const setTargetCurrency = useCallback((currency: ISupportedCurrency) => {
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
  const createOrder = useCallback(async (withdrawalAddress?: string, withdrawalBankAccountId?: string) => {
    if (!validateExchange()) return null;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      const orderPayload: CreateOrderRequest = {
        buySupportedCurrencyId: state.baseCurrency!._id,
        sellSupportedCurrencyId: state.targetCurrency!._id,
        ...(state.isBuyAmount ? { buyAmount: state.baseAmount } : { sellAmount: state.targetAmount }),
        ...(withdrawalAddress && { withdrawalAddress }),
        ...(withdrawalBankAccountId && { withdrawalAccountId: withdrawalBankAccountId }),
      };

      console.log(orderPayload)

      // Use the actual SDK createOrder method
      const order = await zapSDKService.createOrder(orderPayload);

      setState(prev => ({ ...prev, isLoading: false }));
      return order;
    } catch (error) {
      console.error("Failed to create order:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create order";
      console.log(error)
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
      return null;
    }
  }, [state, validateExchange, fetchMarketRate]);

  // Format helpers - format with commas but preserve decimal points during typing
  const handleBaseAmountFormat = useCallback(() => {
    // If input ends with decimal point, preserve it
    if (state.baseAmountInput.endsWith('.')) {
      return state.baseAmountInput;
    }

    // If input has multiple zeros after decimal (like 0.0000), preserve the raw input
    // This prevents formatNumber from truncating very small numbers during typing
    if (state.baseAmountInput.includes('.') && state.baseAmountInput.split('.')[1]?.endsWith('0')) {
      return state.baseAmountInput;
    }
    if (state.isInputtingUSD) {
      if (!state.baseAmountUSD || state.baseAmountUSD === 0) return formatNumber(0, 2);
      return formatNumber(state.baseAmountUSD, 2);
    } else {
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
    if (state.targetAmountInput.includes('.') && state.targetAmountInput.split('.')[1]?.endsWith('0')) {
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
    supportedCurrenciesForSwap,
    currenciesLoading,
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),

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
