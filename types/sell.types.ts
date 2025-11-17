export type Token = {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  image?: any;
  icon?: string;
  price?: number;
};

export type Currency = { 
  code: string; 
  name: string; 
  url: string; 
};

export type Bank = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export type SellFlowStep = 
  | "select-token"
  | "select-currency"
  | "amount"
  | "select-bank"
  | "order_details"
  | "details"
  | "confirm"
  | "success";

export interface SellFlowProps {
  selectedToken: Token | null;
  setSelectedToken: (token: Token | null) => void;
  selectedCurrency: Currency | null;
  setSelectedCurrency: (currency: Currency | null) => void;
  amount: string;
  setAmount: (amount: string) => void;
  selectedBank: Bank | null;
  setSelectedBank: (bank: Bank | null) => void;
  onNext: (step: SellFlowStep) => void;
  onBack: () => void;
  onClose: () => void;
}