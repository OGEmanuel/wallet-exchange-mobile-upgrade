export interface CreateAccountBody {
  currencyId?: string;
  countryId?: string;
  bankId?: string;
  chainId?: string;
  userId: string;
  physicalAddressId?: string;
  zapId?: string;
  name?: string;
  holderName?: string;
  number?: string;
  walletAddress?: string;
}
