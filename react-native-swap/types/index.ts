// Types for React Native Swap Component

export interface SupportedCurrencyModel {
  _id: string;
  image?: string;
  currencyId?: {
    symbol?: string;
    code?: string;
    logo?: string;
    isCrypto?: boolean;
  };
}

export interface SwapRateModel {
  sellAmount?: number;
  buyAmount?: number;
  sellRate?: number;
  buyRate?: number;
  sellCurrency?: SupportedCurrencyModel;
  buyCurrency?: SupportedCurrencyModel;
}

export interface FetchSwapRateRequestParams {
  sellSupportedCurrencyId: string;
  buySupportedCurrencyId: string;
  buyAmount?: number;
  sellAmount?: number;
}

export interface SwapMetaData {
  isDollarMode: boolean;
  dollarValue: string | null | undefined;
  sellInputValue: string;
  receiveInputValue: string;
}

export interface SwapSectionProps {
  withdrawalAddress?: string;
  defaultTokenSymbol?: string | null;
  onWithdrawalAddressChange?: (address: string) => void;
  onSwapInitiated?: () => void;
}

