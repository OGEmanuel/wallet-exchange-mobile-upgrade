import { Currency } from "@/interfaces/account.interface";
import { AppRootState } from "@/state";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BuyState {
  // Add your state properties here
  // Example:
  // data: unknown[] | null;
  // loading: boolean;
  // error: string | null;
  stage:
    | "crypto_select"
    | "currency_select"
    | "buy"
    | "receiving_address"
    | "order_details"
    | "transfer_details"
    | "confirming"
    | "confirmed"
    | "chains";
  currency: Currency | null;
  token: any | null; // Selected crypto token
  amount: string; // Amount to buy (fiat or crypto depending on isInputtingFiat)
  cryptoAmount: string; // Crypto amount
  isInputtingFiat: boolean; // true = inputting fiat, false = inputting crypto
  marketRate: number | null; // Current market rate
  isRateLoading: boolean;
  maxAmount: number | null; // Max amount from rate response
  minAmount: number | null; // Min amount from rate response
  selectedPercentage: string | null; // Selected percentage button: "10%", "half", "Max", or null
  receivingAddress: string | null; // Receiving crypto address
  createdOrder: any | null; // Created order response
  isCreatingOrder: boolean; // Order creation loading state
}

const initialState: BuyState = {
  // Initialize your state here
  // Example:
  // data: null,
  // loading: false,
  // error: null,
  stage: "crypto_select",
  currency: null,
  token: null,
  amount: "",
  cryptoAmount: "",
  isInputtingFiat: true,
  marketRate: null,
  isRateLoading: false,
  maxAmount: null,
  minAmount: null,
  selectedPercentage: null,
  receivingAddress: null,
  createdOrder: null,
  isCreatingOrder: false,
};

const buySlice = createSlice({
  name: "buy",
  initialState,
  reducers: {
    setBuyStage: (state, action: PayloadAction<BuyState["stage"]>) => {
      state.stage = action.payload;
    },
    setBuyCurrency: (state, action: PayloadAction<BuyState["currency"]>) => {
      state.currency = action.payload;
    },
    setBuyToken: (state, action: PayloadAction<BuyState["token"]>) => {
      state.token = action.payload;
    },
    setBuyAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    setBuyCryptoAmount: (state, action: PayloadAction<string>) => {
      state.cryptoAmount = action.payload;
    },
    setBuyIsInputtingFiat: (state, action: PayloadAction<boolean>) => {
      state.isInputtingFiat = action.payload;
    },
    setBuyMarketRate: (state, action: PayloadAction<number | null>) => {
      state.marketRate = action.payload;
    },
    setBuyIsRateLoading: (state, action: PayloadAction<boolean>) => {
      state.isRateLoading = action.payload;
    },
    setBuyMaxAmount: (state, action: PayloadAction<number | null>) => {
      state.maxAmount = action.payload;
    },
    setBuyMinAmount: (state, action: PayloadAction<number | null>) => {
      state.minAmount = action.payload;
    },
    setBuySelectedPercentage: (state, action: PayloadAction<string | null>) => {
      state.selectedPercentage = action.payload;
    },
    setBuyReceivingAddress: (state, action: PayloadAction<string | null>) => {
      state.receivingAddress = action.payload;
    },
    setBuyCreatedOrder: (state, action: PayloadAction<any | null>) => {
      state.createdOrder = action.payload;
    },
    setBuyIsCreatingOrder: (state, action: PayloadAction<boolean>) => {
      state.isCreatingOrder = action.payload;
    },
    resetBuyState: () => initialState,
    // Add your reducers here
    // Example:
    // setData: (state, action: PayloadAction<unknown[]>) => {
    //   state.data = action.payload;
    // },
    // setLoading: (state, action: PayloadAction<boolean>) => {
    //   state.loading = action.payload;
    // },
    // setError: (state, action: PayloadAction<string | null>) => {
    //   state.error = action.payload;
    // },
  },
});

export const {
  /* Add your action creators here */ setBuyStage,
  setBuyCurrency,
  setBuyToken,
  setBuyAmount,
  setBuyCryptoAmount,
  setBuyIsInputtingFiat,
  setBuyMarketRate,
  setBuyIsRateLoading,
  setBuyMaxAmount,
  setBuyMinAmount,
  setBuySelectedPercentage,
  setBuyReceivingAddress,
  setBuyCreatedOrder,
  setBuyIsCreatingOrder,
  resetBuyState,
} = buySlice.actions;
export const selectBuyStage = (state: AppRootState) => state.buy.stage;
export const selectBuyCurrency = (state: AppRootState) => state.buy.currency;
export const selectBuyToken = (state: AppRootState) => state.buy.token;
export const selectBuyAmount = (state: AppRootState) => state.buy.amount;
export const selectBuyCryptoAmount = (state: AppRootState) => state.buy.cryptoAmount;
export const selectBuyIsInputtingFiat = (state: AppRootState) => state.buy.isInputtingFiat;
export const selectBuyMarketRate = (state: AppRootState) => state.buy.marketRate;
export const selectBuyIsRateLoading = (state: AppRootState) => state.buy.isRateLoading;
export const selectBuyMaxAmount = (state: AppRootState) => state.buy.maxAmount;
export const selectBuyMinAmount = (state: AppRootState) => state.buy.minAmount;
export const selectBuySelectedPercentage = (state: AppRootState) => state.buy.selectedPercentage;
export const selectBuyReceivingAddress = (state: AppRootState) => state.buy.receivingAddress;
export const selectBuyCreatedOrder = (state: AppRootState) => state.buy.createdOrder;
export const selectBuyIsCreatingOrder = (state: AppRootState) => state.buy.isCreatingOrder;
export default buySlice.reducer;
