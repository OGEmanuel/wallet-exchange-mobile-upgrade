<<<<<<< HEAD
import { GeneralResponseModel } from '@/src/core/api/http-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
<<<<<<< HEAD
<<<<<<< HEAD
import { ExchangeActivityModel } from '@zap/blockchain-sdk';
=======
import { GeneralResponseModel } from "@/src/core/api/http-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
>>>>>>> 3cff675 (feat(exchange): implement exchange activities feature with data fetching and state management)

interface ExchangeState {
  exchangeActivities: GeneralResponseModel<ExchangeActivityModel[]> | null;
=======
import { ExchangeActivity } from '@zap/blockchain-sdk';

interface ExchangeState {
  exchangeActivities: GeneralResponseModel<ExchangeActivity[]> | null;
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
=======
import { ExchangeActivityModel } from '@zap/blockchain-sdk';

interface ExchangeState {
  exchangeActivities: GeneralResponseModel<ExchangeActivityModel[]> | null;
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
}

const initialState: ExchangeState = {
  exchangeActivities: null,
};

const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    setExchangeActivities: (state, action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>) => {
=======
    setExchangeActivities: (state, action: PayloadAction<GeneralResponseModel<ExchangeActivity[]>>) => {
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
=======
    setExchangeActivities: (state, action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>) => {
>>>>>>> 3e75e08 (chore: update package-lock and yarn.lock for dependency version changes)
=======
    setExchangeActivities: (
      state,
      action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>
    ) => {
>>>>>>> 3cff675 (feat(exchange): implement exchange activities feature with data fetching and state management)
      state.exchangeActivities = action.payload;
    },
  },
});

export const exchangeActions = exchangeSlice.actions;
export const exchangeReducer = exchangeSlice.reducer;
