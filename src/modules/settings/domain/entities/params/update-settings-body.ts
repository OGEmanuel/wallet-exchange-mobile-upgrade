export interface UpdateSettingsBody {
  push?: boolean;
  email?: boolean;
  transaction?: boolean;
  marketing?: boolean;
  priceAlert?: boolean;
  watchlist?: boolean;
  twoFA?: boolean;
  watchlistTreshHold?: number;
  userId: string;
}
