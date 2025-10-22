// useBankAccounts hook

import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Bank, UserBankAccount } from "@zap/blockchain-sdk";
import { useEffect, useState } from "react";

export const useBankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [resolvedAccount, setResolvedAccount] = useState<UserBankAccount | null>(null);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [errorBanks, setErrorBanks] = useState<string | null>(null);
  const [errorBankAccounts, setErrorBankAccounts] = useState<string | null>(
    null
  );
  const [errorResolvingAccount, setErrorResolvingAccount] = useState<
    string | null
  >(null);

  const { currentExchangeUser } = useWallet();

  const fetchBanks = async () => {
    setIsLoadingBanks(true);
    try {
      const banks = await zapSDKService.getBanks();
      setBanks(banks);
    } catch (error: any) {
      setErrorBanks(error?.message);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const fetchBankAccounts = async () => {
    setIsLoadingBankAccounts(true);
    try {
      const bankAccounts = await zapSDKService.getBankAccounts(
        currentExchangeUser || ""
      );
      setBankAccounts(bankAccounts);
    } catch (error: any) {
      setErrorBankAccounts(error?.message);
    } finally {
      setIsLoadingBankAccounts(false);
    }
  };

  const resolveBankAccount = async (bankId: string, accountNumber: string) => {
    setIsResolvingAccount(true);
    try {
      console.log(bankId, accountNumber)
      const resolvedAccount = await zapSDKService.resolveBankAccount(
        bankId,
        accountNumber
      );
      setResolvedAccount(resolvedAccount?.data as unknown as UserBankAccount | null);
    } catch (error: any) {
      setErrorResolvingAccount(error?.message);
      console.log(error, "error");
    } finally {
      setIsResolvingAccount(false);
    }
  };

  useEffect(() => {
    if (currentExchangeUser) {
      fetchBankAccounts();
    }
  }, [currentExchangeUser]);

  useEffect(() => {
    fetchBanks();
  }, []);

  return {
    bankAccounts,
    isLoadingBankAccounts,
    isLoadingBanks,
    banks,
    errorBanks,
    errorBankAccounts,
    fetchBankAccounts,
    fetchBanks,
    resolveBankAccount,
    isResolvingAccount,
    errorResolvingAccount,
    resolvedAccount,
  };
};
