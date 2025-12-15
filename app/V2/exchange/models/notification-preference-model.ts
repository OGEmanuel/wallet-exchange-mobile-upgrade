export interface NotificationPreferenceModel {
  watchlistTreshHold?: number;
  _id?:                string;
  userId?:             string;
  push?:               boolean;
  email?:              boolean;
  transaction?:        boolean;
  marketing?:          boolean;
  priceAlert?:         boolean;
  watchlist?:          boolean;
  twoFA?:              boolean;
  __v?:                number;
}