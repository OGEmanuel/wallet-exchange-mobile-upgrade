// components/bottomsheets/BankAccountsList.tsx

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { UserBankAccount } from "@zap/blockchain-sdk";
import React from "react";
import { Text, View } from "react-native";

interface BankAccountsListProps {
  bankAccounts: UserBankAccount[];
}

const BankAccountsList = ({ bankAccounts }: BankAccountsListProps) => {
  const theme = useTheme<Theme>();
  return <View>
    {bankAccounts.map((bankAccount) => (
      <View key={bankAccount._id}>
        <Text>{bankAccount.name}</Text>
      </View>
    ))}
  </View>;
};

export default BankAccountsList;