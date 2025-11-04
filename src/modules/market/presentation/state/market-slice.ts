import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarketData } from "@zap/blockchain-sdk";
import { TokenDetailModel } from "../../domain/entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "../../domain/entities/models/token-history-model";
import { WatchlistTokenModel } from "../../domain/entities/models/watchlist-token-model";

interface MarketState {
  marketTokens: MarketData[] | null;
  currentTokenDetails: TokenDetailModel | null;
  tokenHistory: TokenHistoryDetailModel | null;
  watchlistTokens: WatchlistTokenModel[] | null;
  isWatchlistLoading: boolean;
  isMarketTokensLoading: boolean;
}

const initialState: MarketState = {
  marketTokens: null,
  currentTokenDetails: null,
  watchlistTokens: null,
  tokenHistory: null,
  isWatchlistLoading: false,
  isMarketTokensLoading: false,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setMarketTokens: (state, action: PayloadAction<MarketData[] | null>) => {
      state.marketTokens = action.payload;
    },
    setCurrentTokenDetails: (state, action: PayloadAction<TokenDetailModel | null>) => {
      state.currentTokenDetails = action.payload;
    },
    setWatchlistTokens: (state, action: PayloadAction<WatchlistTokenModel[] | null>) => {
      state.watchlistTokens = action.payload;
    },
    setTokenHistory: (state, action: PayloadAction<TokenHistoryDetailModel | null>) => {
      state.tokenHistory = action.payload;
    },
    setMarketTokensLoading: (state, action: PayloadAction<boolean>) => {
      state.isMarketTokensLoading = action.payload;
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
      console.log("Redux removeFromWatchlist called with:", action.payload);
      console.log("Current watchlistTokens before removal:", state.watchlistTokens);
      if (state.watchlistTokens) {
        state.watchlistTokens = state.watchlistTokens.filter(
          item => {
            const shouldKeep = item.currencyId !== action.payload;
            console.log("Item:", item.currencyId, "shouldKeep:", shouldKeep);
            return shouldKeep;
          }
        );
        console.log("WatchlistTokens after removal:", state.watchlistTokens);
      }
    },
    resetMarketState: () => initialState,
  },
});

export const marketActions = marketSlice.actions;
export const marketReducer = marketSlice.reducer;