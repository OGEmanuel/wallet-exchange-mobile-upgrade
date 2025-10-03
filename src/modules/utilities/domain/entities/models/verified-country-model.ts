import { DocumentClass } from "@/src/modules/kyc/domain/entities/models/user-model";

export interface VerifiedCountryModel {
  _id?: string;
  name?: string;
  alpha2?: string;
  alpha3?: string;
  flagUrl?: string;
  states?: string[];
  currencyId?: string;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  requiredDocuments?: RequiredDocument[];
}

export interface RequiredDocument {
  _id?: string;
  documentClass?: DocumentClass;
  documentTypes?: string[];
  total?: number;
}


export interface CurrencyID {
  volatility?: number;
  preferredRatesProviders?: string[];
  preferredTokenMetricsProviders?: string[];
  preferredNewsProviders?: string[];
  maxSupply?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  ath?: number;
  _id?: string;
  name?: string;
  code?: string;
  symbol?: string;
  isCrypto?: boolean;
  buyRate?: number;
  sellRate?: number;
  isActive?: boolean;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Country {
  countries: VerifiedCountryModel[];
}
