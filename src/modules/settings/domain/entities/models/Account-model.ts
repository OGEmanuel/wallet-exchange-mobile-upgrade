export interface AccountModel {
  currencyId: string;
  countryId: string;
  bankId: string;
  chainId: string;
  userId: string;
  physicalAddressId: string;
  zapId: string;
  name: string;
  holderName: string;
  number: string;
  walletAddress: string;
  isPlayer: boolean;
  inflowSingleLimit: number;
  inflowDailyLimit: number;
  outflowSingleLimit: number;
  outflowDailyLimit: number;
  balance: number;
  position: string;
  benchStatus: boolean;
  notes: string;
  deletedAt: string;
}
