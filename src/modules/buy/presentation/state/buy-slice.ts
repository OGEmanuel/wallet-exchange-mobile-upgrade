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
    | "transfer_details"
    | "confirming"
    | "confirmed"
    | "chains";
  currency: Currency | null;
}

const initialState: BuyState = {
  // Initialize your state here
  // Example:
  // data: null,
  // loading: false,
  // error: null,
  stage: "crypto_select",
  currency: null,
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
  resetBuyState,
} = buySlice.actions;
export const selectBuyStage = (state: AppRootState) => state.buy.stage;
export const selectBuyCurrency = (state: AppRootState) => state.buy.currency;
export default buySlice.reducer;
