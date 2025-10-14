import { GeneralResponseModel } from '@/src/core/api/http-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExchangeActivity } from '@zap/blockchain-sdk';

interface ExchangeState {
  exchangeActivities: GeneralResponseModel<ExchangeActivity[]> | null;
}

const initialState: ExchangeState = {
  exchangeActivities: null,
};

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    setExchangeActivities: (state, action: PayloadAction<GeneralResponseModel<ExchangeActivity[]>>) => {
      state.exchangeActivities = action.payload;
    },
  },
});

export const exchangeActions = exchangeSlice.actions;
export const exchangeReducer = exchangeSlice.reducer;
