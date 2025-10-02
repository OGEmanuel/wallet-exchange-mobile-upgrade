import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarketTokenModel } from "../../domain/entities/models/market-token-model";
import { TokenDetailModel } from "../../domain/entities/models/token-detail-model";
import { WatchlistTokenModel } from "../../domain/entities/models/watchlist-token-model";

interface MarketState {
  marketTokens: MarketTokenModel[] | null;
  currentTokenDetails: TokenDetailModel | null;
  watchlistTokens: WatchlistTokenModel[] | null;
  isWatchlistLoading: boolean;
}

const initialState: MarketState = {
  marketTokens: null,
  currentTokenDetails: null,
  watchlistTokens: null,
  isWatchlistLoading: false,
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
    setWatchlistTokens: (state, action: PayloadAction<WatchlistTokenModel[] | null>) => {
      state.watchlistTokens = action.payload;
    },
    setWatchlistLoading: (state, action: PayloadAction<boolean>) => {
      state.isWatchlistLoading = action.payload;
    },
    addToWatchlist: (state, action: PayloadAction<WatchlistTokenModel>) => {
      if (state.watchlistTokens) {
        state.watchlistTokens.push(action.payload);
      } else {
        state.watchlistTokens = [action.payload];
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      if (state.watchlistTokens) {
        state.watchlistTokens = state.watchlistTokens.filter(
          item => item._id !== action.payload
        );
      }
    },
  },
});

export const marketActions = marketSlice.actions;
export const marketReducer = marketSlice.reducer;