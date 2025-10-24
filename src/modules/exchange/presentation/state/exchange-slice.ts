import { GeneralResponseModel } from "@/src/core/api/http-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";

interface ExchangeState {
  exchangeActivities: ExchangeActivityModel[];
  currentPage: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  selectedActivity: ExchangeActivityModel | null;
}

const initialState: ExchangeState = {
  exchangeActivities: [],
  currentPage: 1,
  hasMore: true,
  isLoadingMore: false,
  selectedActivity: null,
};

const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {
    setExchangeActivities: (
      state,
      action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>
    ) => {
      // The response.data is an ExchangeActivitiesResponse with activities array
      const responseData = action.payload.data as any;
      const activities = responseData?.activities || responseData || [];
      state.exchangeActivities = activities;
      state.currentPage = 1;
      state.hasMore = responseData?.pagination?.hasMore ?? (activities.length >= 10);
    },
    appendExchangeActivities: (
      state,
      action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>
    ) => {
      // The response.data is an ExchangeActivitiesResponse with activities array
      const responseData = action.payload.data as any;
      const newActivities = responseData?.activities || responseData || [];
      state.exchangeActivities = [...state.exchangeActivities, ...newActivities];
      state.hasMore = responseData?.pagination?.hasMore ?? (newActivities.length >= 10);
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
    setSelectedActivity: (state, action: PayloadAction<ExchangeActivityModel | null>) => {
      state.selectedActivity = action.payload;
    },
    clearExchangeActivities: (state) => {
      state.exchangeActivities = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.isLoadingMore = false;
      state.selectedActivity = null;
    },
  },
});

export const exchangeActions = exchangeSlice.actions;
export const exchangeReducer = exchangeSlice.reducer;
