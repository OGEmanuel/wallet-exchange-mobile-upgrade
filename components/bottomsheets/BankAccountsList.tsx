// components/bottomsheets/BankAccountsList.tsx

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
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      {bankAccounts.map((bankAccount) => (
        <BankAccountCard
          key={bankAccount._id}
          bankAccount={bankAccount}
          selected={false}
          onPress={() => onPressAccount(bankAccount)}
        />
      ))}
    </ScrollView>
  );
};

export default BankAccountsList;
