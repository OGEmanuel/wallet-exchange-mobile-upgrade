export interface TokenHistoryDetailModel {
  rates?:        Rate[];
  currencyId?:   string;
  date?:         string;
  symbol?:       string;
  providerUsed?: string;
}

export interface Rate {
  rate?:       number;
  volume?:     number;
  marketCap?:  number;
  currencyId?: string;
  symbol?:     string;
  timestamp?:  string;
  date?:       string;
}
