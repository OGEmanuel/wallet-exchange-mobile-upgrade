export interface BankModel {
  __v: number;
  _id: string;
  code: string;
  countryId: string;
  createdAt: string;
  icon: string;
  name: string;
  nativeCurrencyId: NativeCurrency;
  pbCode: string;
  shmfbCode: string;
  updatedAt: string;
}

interface NativeCurrency {
  __v: number;
  _id: string;
  ath: number;
  buyRate: number;
  circulatingSupply: number;
  code: string;
  createdAt: string;
  defaultRatesProvider: string;
  isActive: boolean;
  isCrypto: boolean;
  isStable: boolean;
  isUserToken: boolean;
  logo: string;
  maxSupply: number;
  name: string;
  preferredNewsProviders: string[];
  preferredRatesProviders: string[];
  preferredTokenMetricsProviders: string[];
  sellRate: number;
  symbol: string;
  totalSupply: number;
  updatedAt: string;
  volatility: number;
}
