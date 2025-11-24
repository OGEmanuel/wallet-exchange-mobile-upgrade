// components/bottomsheets/BankAccountsList.tsx

import { useBankAccounts } from "@/src/modules/swap/presentation/hooks/useBankAccounts";
import { UserBankAccount } from "@zap/blockchain-sdk";
import React from "react";
import { ScrollView } from "react-native";
import BankAccountCard from "../swap/BankAccountCard";

interface BankAccountsListProps {
  bankAccounts: UserBankAccount[];
  onPressAccount: (bankAccount: UserBankAccount) => void;
}

const BankAccountsList = ({
  bankAccounts,
  onPressAccount,
}: BankAccountsListProps) => {
  const { getBankById } = useBankAccounts();
  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {bankAccounts.map((bankAccount) => {
        const bankId = typeof bankAccount.bankId === 'string' 
          ? bankAccount.bankId 
          : (bankAccount.bankId as any)?._id;
        const bank = bankId ? getBankById(bankId) : null;
        const bankName = bank?.name || (bankAccount.bankId as any)?.name || null;
        
        return (
          <BankAccountCard
            key={bankAccount._id}
            bankAccount={bankAccount}
            bankName={bankName}
            selected={false}
            onPress={() => onPressAccount(bankAccount)}
          />
        );
      })}
    </ScrollView>
  );
};

export default BankAccountsList;
