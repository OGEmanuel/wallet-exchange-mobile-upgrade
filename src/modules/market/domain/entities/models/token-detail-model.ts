export interface TokenDetailModel {
  tokenMetrics?: TokenMetrics;
  tokenNews?:    TokenNew[];
  tokenDetails?: TokenDetails;
}

export interface TokenDetails {
  twitter?: string;
  explorer?: string;
  website?: string;
  reddit?: string;
  telegram?: string;
  logo?: string;
  name?: string;
  symbol?: string;
}

export interface TokenMetrics {
  currencyId?: string;
  symbol?:     string;
  marketCap?:  number;
  volume?:     number;
}

export interface TokenNew {
  currencyId?:  string;
  symbol?:      string;
  id?:          number;
  title?:       string;
  url?:         string;
  image?:       string;
  publishedAt?: string;
  keywords?:    string;
  language?:    string;
  sentiment?:   string;
  source?:      Source;
}

export interface Source {
  name?:  string;
  url?:   string;
  image?: string;
}
