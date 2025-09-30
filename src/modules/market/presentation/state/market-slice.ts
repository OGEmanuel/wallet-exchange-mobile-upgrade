import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarketTokenModel } from "../../domain/entities/models/market-token-model";
import { TokenDetailModel } from "../../domain/entities/models/token-detail-model";

interface MarketState {
  marketTokens: MarketTokenModel[] | null;
  currentTokenDetails: TokenDetailModel | null;
}

const initialState: MarketState = {
  marketTokens: null,
  currentTokenDetails: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setMarketTokens: (state, action: PayloadAction<MarketTokenModel[] | null>) => {
      state.marketTokens = action.payload;
    },
    setCurrentTokenDetails: (state, action: PayloadAction<TokenDetailModel | null>) => {
      state.currentTokenDetails = action.payload;
    },
  },
});

export const marketActions = marketSlice.actions;
export const marketReducer = marketSlice.reducer;