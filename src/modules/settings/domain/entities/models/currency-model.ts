export interface Currency {
  _id: string;
  name: string;
  code: string;
  symbol: string;
  isCrypto: boolean;
  buyRate: number;
  sellRate: number;
  isActive: boolean;
  secureProfits: boolean;
  description: string;
  logo: string;
  website: string;
  explorer: string;
  twitter: string;
  telegram: string;
  reddit: string;
  instagram: string;
  maxSupply: number;
  circulatingSupply: number;
  totalSupply: number;
  ath: number;
  createdAt: string;
  updatedAt: string;
}
