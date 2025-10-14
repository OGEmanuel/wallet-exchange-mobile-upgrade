import { GeneralResponseModel } from '@/src/core/api/http-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
<<<<<<< HEAD
import { ExchangeActivityModel } from '@zap/blockchain-sdk';

interface ExchangeState {
  exchangeActivities: GeneralResponseModel<ExchangeActivityModel[]> | null;
=======
import { ExchangeActivity } from '@zap/blockchain-sdk';

interface ExchangeState {
  exchangeActivities: GeneralResponseModel<ExchangeActivity[]> | null;
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
}

const initialState: ExchangeState = {
  exchangeActivities: null,
};

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
<<<<<<< HEAD
    setExchangeActivities: (state, action: PayloadAction<GeneralResponseModel<ExchangeActivityModel[]>>) => {
=======
    setExchangeActivities: (state, action: PayloadAction<GeneralResponseModel<ExchangeActivity[]>>) => {
>>>>>>> 7688c38 (feat(exchange): implement exchange activities feature with data fetching and state management)
      state.exchangeActivities = action.payload;
    },
  },
});

export const exchangeActions = exchangeSlice.actions;
export const exchangeReducer = exchangeSlice.reducer;
