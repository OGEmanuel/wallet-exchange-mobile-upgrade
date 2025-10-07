import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";

export interface Currency {
  code: string;
  name: string;
  country: string;
  flag: string;
}

export interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  currency: CurrencyModel;
  sortCode?: string;
  institutionNumber?: string;
  transitNumber?: string;
  iban?: string;
  wireRoutingNumber?: string;
  accountType?: string;
  bankName?: string;
  createdAt: string;
}
