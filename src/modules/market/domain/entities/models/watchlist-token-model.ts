import { MarketTokenModel } from "./market-token-model";

export interface WatchlistTokenModel {
  _id?:                       string;
  userId?:                    string;
  currencyId?:                string;
  watchListPercentageChange?: number;
  createdAt?:                 string;
  updatedAt?:                 string;
  __v?:                       number;
  marketData?:                MarketTokenModel | null | undefined;
}