export interface PriceAlertModel {
  userId?:           UserID;
  currencyId?:       CurrencyID;
  alertType?:        string;
  duration?:         string;
  priceThreshold?:   number;
  percentageChange?: null;
  timeFrame?:        null;
  isActive?:         boolean;
  createdAt?:        string;
  updatedAt?:        string;
  id?:               string;
}

export interface CurrencyID {
  volatility?:                     number;
  isUserToken?:                    boolean;
  maxSupply?:                      number;
  circulatingSupply?:              number;
  totalSupply?:                    number;
  ath?:                            number;
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

export interface UserID {
  isGuest?:               boolean;
  walletIds?:             any[];
  _id?:                   string;
  name?:                  string;
  firstName?:             string;
  lastName?:              string;
  email?:                 string;
  emailVerified?:         boolean;
  username?:              string;
  v1Id?:                  string;
  phone?:                 string;
  platforms?:             string[];
  googleId?:              string;
  deviceToken?:           any[];
  joinDate?:              string;
  status?:                boolean;
  physicalAddressId?:     null;
  phoneNumberVerified?:   boolean;
  roleIds?:               string[];
  countryId?:             string;
  verificationIds?:       string[];
  isTwoFAenabled?:        boolean;
  viewedTooltipOnMobile?: boolean;
  viewedTooltipOnWeb?:    boolean;
  flagId?:                any[];
  rating?:                number;
  createdAt?:             string;
  updatedAt?:             string;
  totp?:                  string;
  avatar?:                Avatar;
}

export interface Avatar {
  url?:             string;
  backgroundColor?: string;
  _id?:             string;
}
