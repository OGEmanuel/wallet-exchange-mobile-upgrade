import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportedCurrencyModel, SwapRateModel } from '../types';

interface SwapState {
  isSwapped: boolean;
  fetchingSwapRate: boolean;
  supportedCurrencies?: SupportedCurrencyModel[] | null;
  supportedCurrenciesError?: string | null;
  swapRate?: SwapRateModel | null;
  swapRateError?: string | null;
  sellCurrency?: SupportedCurrencyModel | null;
  receiveCurrency?: SupportedCurrencyModel | null;
}

const initialState: SwapState = {
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
  name: 'swap',
  initialState,
  reducers: {
    setSupportedCurrencies: (state, action: PayloadAction<SupportedCurrencyModel[] | null | undefined>) => {
      state.supportedCurrencies = action.payload;
    },
    setFetchingSwapRate: (state, action: PayloadAction<boolean>) => {
      state.fetchingSwapRate = action.payload;
    },
    setSwapRate: (state, action: PayloadAction<SwapRateModel | null | undefined>) => {
      state.swapRate = action.payload;
    },
    setSellCurrency: (state, action: PayloadAction<SupportedCurrencyModel | null | undefined>) => {
      state.sellCurrency = action.payload;
    },
    setSupportedCurrenciesError: (state, action: PayloadAction<string | null | undefined>) => {
      state.supportedCurrenciesError = action.payload;
    },
    setReceiveCurrency: (state, action: PayloadAction<SupportedCurrencyModel | null | undefined>) => {
      state.receiveCurrency = action.payload;
    },
    setIsSwapped: (state, action: PayloadAction<boolean>) => {
      state.isSwapped = action.payload;
    },
    setSwapRateError: (state, action: PayloadAction<string | null | undefined>) => {
      state.swapRateError = action.payload;
    },
    resetSupportedCurrencies: (state) => {
      state.supportedCurrencies = null;
      state.fetchingSwapRate = false;
    },
  },
});

export const swapActions = swapSlice.actions;
export default swapSlice.reducer;

