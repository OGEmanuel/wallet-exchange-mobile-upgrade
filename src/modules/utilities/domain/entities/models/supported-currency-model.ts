export interface SupportedCurrencyModel {
  isStable?:                       boolean;
  preferredRPCProviders?:          string[];
  isActive?:                       boolean;
  _id?:                            string;
  currencyId?:                     CurrencyID;
  chainId?:                        ChainID;
  tokenAddress?:                   null;
  decimals?:                       number;
  image?:                          string;
  __v?:                            number;
  createdAt?:                      string;
  updatedAt?:                      string;
  defaultBalancesProvider?:        string;
  defaultTradesProvider?:          string;
  defaultTransactionsProvider?:    string;
  preferredBalancesProviders?:     string[];
  preferredTradesProviders?:       string[];
  preferredTransactionsProviders?: string[];
}

export interface ChainID {
  _id?:                  string;
  name?:                 string;
  symbol?:               string;
  nativeCurrencySymbol?: string;
  chainId?:              number;
  nativeCurrencyId?:     string;
  isEVM?:                boolean;
  __v?:                  number;
  createdAt?:            string;
  updatedAt?:            string;
  rpcUrl?:               string;
  explorerUrl?:          string;
}

export interface CurrencyID {
  volatility?:                     number;
  isUserToken?:                    boolean;
  maxSupply?:                      number;
  circulatingSupply?:              number;
  totalSupply?:                    number;
  ath?:                            number;
  isStable?:                       boolean;
  _id?:                            string;
  name?:                           string;
  code?:                           string;
  symbol?:                         string;
  isCrypto?:                       boolean;
  buyRate?:                        number;
  sellRate?:                       number;
  isActive?:                       boolean;
  __v?:                            number;
  createdAt?:                      string;
  updatedAt?:                      string;
  logo?:                           string;
  defaultNewsProvider?:            string;
  defaultRatesProvider?:           string;
  preferredNewsProviders?:         string[];
  preferredRatesProviders?:        string[];
  preferredTokenMetricsProviders?: string[];
}
