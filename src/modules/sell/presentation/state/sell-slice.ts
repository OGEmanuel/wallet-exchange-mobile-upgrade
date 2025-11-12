import { Currency } from "@/interfaces/account.interface";
import { AppRootState } from "@/state";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SellState {
  stage:
    | "select-token"
    | "select-currency"
    | "amount"
    | "select-bank"
    | "order_details"
    | "details"
    | "confirm"
    | "success";
  currency: Currency | null;
  token: any | null; // Selected crypto token
  amount: string; // Amount to sell (crypto or fiat depending on isInputtingFiat)
  fiatAmount: string; // Fiat amount
  isInputtingFiat: boolean; // true = inputting fiat, false = inputting crypto
  marketRate: number | null; // Current market rate
  isRateLoading: boolean;
  maxAmount: number | null; // Max amount from rate response
  minAmount: number | null; // Min amount from rate response
  selectedPercentage: string | null; // Selected percentage button: "10%", "half", "Max", or null
  selectedBank: any | null; // Selected bank account
  createdOrder: any | null; // Created order response
  isCreatingOrder: boolean; // Order creation loading state
}

const initialState: SellState = {
  stage: "select-token",
  currency: null,
  token: null,
  amount: "",
  fiatAmount: "",
  isInputtingFiat: false, // For sell, default to inputting crypto
  marketRate: null,
  isRateLoading: false,
  maxAmount: null,
  minAmount: null,
  selectedPercentage: null,
  selectedBank: null,
  createdOrder: null,
  isCreatingOrder: false,
};

const sellSlice = createSlice({
  name: "sell",
  initialState,
  reducers: {
    setSellStage: (state, action: PayloadAction<SellState["stage"]>) => {
      state.stage = action.payload;
    },
    setSellCurrency: (state, action: PayloadAction<SellState["currency"]>) => {
      state.currency = action.payload;
    },
    setSellToken: (state, action: PayloadAction<SellState["token"]>) => {
      state.token = action.payload;
    },
    setSellAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    setSellFiatAmount: (state, action: PayloadAction<string>) => {
      state.fiatAmount = action.payload;
    },
    setSellIsInputtingFiat: (state, action: PayloadAction<boolean>) => {
      state.isInputtingFiat = action.payload;
    },
    setSellMarketRate: (state, action: PayloadAction<number | null>) => {
      state.marketRate = action.payload;
    },
    setSellIsRateLoading: (state, action: PayloadAction<boolean>) => {
      state.isRateLoading = action.payload;
    },
    setSellMaxAmount: (state, action: PayloadAction<number | null>) => {
      state.maxAmount = action.payload;
    },
    setSellMinAmount: (state, action: PayloadAction<number | null>) => {
      state.minAmount = action.payload;
    },
    setSellSelectedPercentage: (state, action: PayloadAction<string | null>) => {
      state.selectedPercentage = action.payload;
    },
    setSellSelectedBank: (state, action: PayloadAction<any | null>) => {
      state.selectedBank = action.payload;
    },
    setSellCreatedOrder: (state, action: PayloadAction<any | null>) => {
      state.createdOrder = action.payload;
    },
    setSellIsCreatingOrder: (state, action: PayloadAction<boolean>) => {
      state.isCreatingOrder = action.payload;
    },
    resetSellState: () => initialState,
  },
});

export const {
  setSellStage,
  setSellCurrency,
  setSellToken,
  setSellAmount,
  setSellFiatAmount,
  setSellIsInputtingFiat,
  setSellMarketRate,
  setSellIsRateLoading,
  setSellMaxAmount,
  setSellMinAmount,
  setSellSelectedPercentage,
  setSellSelectedBank,
  setSellCreatedOrder,
  setSellIsCreatingOrder,
  resetSellState,
} = sellSlice.actions;

export const selectSellStage = (state: AppRootState) => state.sell.stage;
export const selectSellCurrency = (state: AppRootState) => state.sell.currency;
export const selectSellToken = (state: AppRootState) => state.sell.token;
export const selectSellAmount = (state: AppRootState) => state.sell.amount;
export const selectSellFiatAmount = (state: AppRootState) => state.sell.fiatAmount;
export const selectSellIsInputtingFiat = (state: AppRootState) => state.sell.isInputtingFiat;
export const selectSellMarketRate = (state: AppRootState) => state.sell.marketRate;
export const selectSellIsRateLoading = (state: AppRootState) => state.sell.isRateLoading;
export const selectSellMaxAmount = (state: AppRootState) => state.sell.maxAmount;
export const selectSellMinAmount = (state: AppRootState) => state.sell.minAmount;
export const selectSellSelectedPercentage = (state: AppRootState) => state.sell.selectedPercentage;
export const selectSellSelectedBank = (state: AppRootState) => state.sell.selectedBank;
export const selectSellCreatedOrder = (state: AppRootState) => state.sell.createdOrder;
export const selectSellIsCreatingOrder = (state: AppRootState) => state.sell.isCreatingOrder;

export default sellSlice.reducer;

