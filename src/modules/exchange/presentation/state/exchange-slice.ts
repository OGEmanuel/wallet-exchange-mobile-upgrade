import { GeneralResponseModel } from "@/src/core/api/http-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";

interface ExchangeState {
  exchangeActivities: ExchangeActivityModel[];
  currentPage: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const initialState: ExchangeState = {
  exchangeActivities: [],
  currentPage: 1,
  hasMore: true,
  isLoadingMore: false,
};

const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {
    setExchangeActivities: (
      state,
      action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>
    ) => {
      state.exchangeActivities = action.payload.data || [];
      state.currentPage = 1;
      state.hasMore = (action.payload.data || []).length >= 10;
    },
    appendExchangeActivities: (
      state,
      action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>
    ) => {
      const newActivities = action.payload.data || [];
      state.exchangeActivities = [...state.exchangeActivities, ...newActivities];
      state.hasMore = newActivities.length >= 10;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setIsLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMore = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    clearExchangeActivities: (state) => {
      state.exchangeActivities = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.isLoadingMore = false;
    },
  },
});

export const exchangeActions = exchangeSlice.actions;
export const exchangeReducer = exchangeSlice.reducer;
