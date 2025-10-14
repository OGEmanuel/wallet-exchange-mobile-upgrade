import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    SupportedCurrency,
    SwapRateModel,
} from "../../domain/entities/currency.types";

interface MarketRate {
  rate: number;
  timestamp: number;
  minAmount?: number;
  maxAmount?: number;
  error?: string;
}

interface Bank {
  id: string;
  name: string;
}

interface SwapState {
  // Amount states
  baseAmount: number;
  targetAmount: number;

  // Currency states
  baseCurrency: SupportedCurrency | null;
  targetCurrency: SupportedCurrency | null;

  // UI states
  isReversed: boolean;
  baseInputIsDollar: boolean;
  activeTab: "EXCHANGE" | "WALLET";

  // Selection states
  selectedBank: Bank | null;
  selectedOption: string;

  // Data states
  currencies: SupportedCurrency[];
  marketRate: MarketRate | null;
  isRateLoading: boolean;

  // Edit tracking
  lastEditedField: "baseAmount" | "targetAmount" | null;
  isUpdatingFromRate: boolean;

  // Error and loading states
  error: string | null;
  isLoading: boolean;

  // React-native-swap compatible fields
  isSwapped: boolean;
  fetchingSwapRate: boolean;
  supportedCurrencies?: SupportedCurrency[] | null;
  supportedCurrenciesError?: string | null;
  swapRate?: SwapRateModel | null;
  swapRateError?: string | null;
  sellCurrency?: SupportedCurrency | null;
  receiveCurrency?: SupportedCurrency | null;
}

const initialState: SwapState = {
  baseAmount: 0,
  targetAmount: 0,
  baseCurrency: null,
  targetCurrency: null,
  isReversed: false,
  baseInputIsDollar: false,
  activeTab: "EXCHANGE",
  selectedBank: null,
  selectedOption: "exchange",
  currencies: [],
  marketRate: null,
  isRateLoading: false,
  lastEditedField: null,
  isUpdatingFromRate: false,
  error: null,
  isLoading: false,
  // React-native-swap compatible fields
  supportedCurrencies: null,
  supportedCurrenciesError: null,
  fetchingSwapRate: false,
  swapRate: null,
  swapRateError: null,
  sellCurrency: null,
  receiveCurrency: null,
  isSwapped: false,
};

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    // Amount reducers
    setBaseAmount: (state, action: PayloadAction<number>) => {
      state.baseAmount = action.payload;
      state.lastEditedField = "baseAmount";
    },
    setTargetAmount: (state, action: PayloadAction<number>) => {
      state.targetAmount = action.payload;
      state.lastEditedField = "targetAmount";
    },

    // Currency reducers
    setBaseCurrency: (
      state,
      action: PayloadAction<SupportedCurrency | null>
    ) => {
      state.baseCurrency = action.payload;
    },
    setTargetCurrency: (
      state,
      action: PayloadAction<SupportedCurrency | null>
    ) => {
      state.targetCurrency = action.payload;
    },

    // UI state reducers
    setIsReversed: (state, action: PayloadAction<boolean>) => {
      state.isReversed = action.payload;
    },
    setBaseInputIsDollar: (state, action: PayloadAction<boolean>) => {
      state.baseInputIsDollar = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<"EXCHANGE" | "WALLET">) => {
      state.activeTab = action.payload;
    },

    // Selection reducers
    setSelectedBank: (state, action: PayloadAction<Bank | null>) => {
      state.selectedBank = action.payload;
    },
    setSelectedOption: (state, action: PayloadAction<string>) => {
      state.selectedOption = action.payload;
    },

    // Data reducers
    setCurrencies: (state, action: PayloadAction<SupportedCurrency[]>) => {
      state.currencies = action.payload;
    },
    setMarketRate: (state, action: PayloadAction<MarketRate | null>) => {
      state.marketRate = action.payload;
    },
    setIsRateLoading: (state, action: PayloadAction<boolean>) => {
      state.isRateLoading = action.payload;
    },
    setIsUpdatingFromRate: (state, action: PayloadAction<boolean>) => {
      state.isUpdatingFromRate = action.payload;
    },
    setAmountsFromRate: (
      state,
      action: PayloadAction<{ baseAmount: number; targetAmount: number }>
    ) => {
      state.baseAmount = action.payload.baseAmount;
      state.targetAmount = action.payload.targetAmount;
      state.isUpdatingFromRate = true;
    },

    // Error and loading states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Complex actions
    swapCurrencies: (state) => {
      // Swap currencies
      const tempBase = state.baseCurrency;
      const tempTarget = state.targetCurrency;
      state.baseCurrency = tempTarget;
      state.targetCurrency = tempBase;

      // Swap amounts
      const tempBaseAmount = state.baseAmount;
      const tempTargetAmount = state.targetAmount;
      state.baseAmount = tempTargetAmount;
      state.targetAmount = tempBaseAmount;

      // Toggle reversed state
      state.isReversed = !state.isReversed;

      // Reset edit tracking since we're swapping
      state.lastEditedField = null;
    },

    // Reset actions
    resetSwapState: () => initialState,
    resetAmounts: (state) => {
      state.baseAmount = 0;
      state.targetAmount = 0;
    },
    resetCurrencies: (state) => {
      state.baseCurrency = null;
      state.targetCurrency = null;
    },

    // React-native-swap compatible actions
    setSupportedCurrencies: (
      state,
      action: PayloadAction<SupportedCurrency[] | null | undefined>
    ) => {
      state.supportedCurrencies = action.payload;
      state.currencies = action.payload || [];
    },
    setFetchingSwapRate: (state, action: PayloadAction<boolean>) => {
      state.fetchingSwapRate = action.payload;
      state.isRateLoading = action.payload;
    },
    setSwapRate: (
      state,
      action: PayloadAction<SwapRateModel | null | undefined>
    ) => {
      state.swapRate = action.payload;
    },
    setSellCurrency: (
      state,
      action: PayloadAction<SupportedCurrency | null | undefined>
    ) => {
      state.sellCurrency = action.payload;
      state.baseCurrency = action.payload;
    },
    setSupportedCurrenciesError: (
      state,
      action: PayloadAction<string | null | undefined>
    ) => {
      state.supportedCurrenciesError = action.payload;
    },
    setReceiveCurrency: (
      state,
      action: PayloadAction<SupportedCurrency | null | undefined>
    ) => {
      state.receiveCurrency = action.payload;
      state.targetCurrency = action.payload;
    },
    setIsSwapped: (state, action: PayloadAction<boolean>) => {
      state.isSwapped = action.payload;
    },
    setSwapRateError: (
      state,
      action: PayloadAction<string | null | undefined>
    ) => {
      state.swapRateError = action.payload;
      state.error = action.payload;
    },
    resetSupportedCurrencies: (state) => {
      state.supportedCurrencies = null;
      state.fetchingSwapRate = false;
    },
  },
});

export const {
  // Amount actions
  setBaseAmount,
  setTargetAmount,

  // Currency actions
  setBaseCurrency,
  setTargetCurrency,

  // UI state actions
  setIsReversed,
  setBaseInputIsDollar,
  setActiveTab,

  // Selection actions
  setSelectedBank,
  setSelectedOption,

  // Data actions
  setCurrencies,
  setMarketRate,
  setIsRateLoading,
  setIsUpdatingFromRate,
  setAmountsFromRate,

  // Error and loading actions
  setError,
  setIsLoading,

  // Complex actions
  swapCurrencies,

  // Reset actions
  resetSwapState,
  resetAmounts,
  resetCurrencies,

  // React-native-swap compatible actions
  setSupportedCurrencies,
  setFetchingSwapRate,
  setSwapRate,
  setSellCurrency,
  setSupportedCurrenciesError,
  setReceiveCurrency,
  setIsSwapped,
  setSwapRateError,
  resetSupportedCurrencies,
} = swapSlice.actions;

// Export actions as swapActions for compatibility
export const swapActions = swapSlice.actions;

export default swapSlice.reducer;
