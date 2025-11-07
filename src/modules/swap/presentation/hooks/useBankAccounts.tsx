// useBankAccounts hook

import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import {
  Bank,
  ICurrency,
  ISupportedCurrency,
  SupportedCurrency,
  UserBankAccount
} from "@zap/blockchain-sdk";
import { useEffect, useState } from "react";

export const useBankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [resolvedAccount, setResolvedAccount] =
    useState<UserBankAccount | null>(null);
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
  const [isCreatingBankAccount, setIsCreatingBankAccount] = useState(false);
  const [errorCreatingBankAccount, setErrorCreatingBankAccount] = useState<
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
      const resolvedAccount = await zapSDKService.resolveBankAccount(
        bankId,
        accountNumber
      );
      console.log(resolvedAccount);

      const name = (resolvedAccount?.data as any)?.data;

      if (name) {
        const account = {
          name,
          holderName: name,
          number: accountNumber,
          bankId,
        };

        setResolvedAccount(account as unknown as UserBankAccount);
        setErrorResolvingAccount(null);
      } else {
        setResolvedAccount(null);
        setErrorResolvingAccount("Failed to resolve account");
      }
    } catch (error: any) {
      setResolvedAccount(null);
      console.log(error);
      setErrorResolvingAccount(error?.message);
      console.log(error, "error");
    } finally {
      setIsResolvingAccount(false);
    }
  };

  const createBankAccount = async (
    bankId: string,
    name: string,
    supportedCurrency: ISupportedCurrency | null,
    number: string
  ) => {
    setIsCreatingBankAccount(true);
    setErrorCreatingBankAccount(null);
    try {
      if (
        !supportedCurrency ||
        (supportedCurrency.currencyId as Partial<ICurrency>)?.isCrypto
      ) {
        throw new Error("Supported currency must be fiat");
      }

      const newBankAccount = await zapSDKService.createBankAccount({
        bankId,
        name,
        supportedCurrency: supportedCurrency as unknown as SupportedCurrency,
        userId: currentExchangeUser || "",
        number,
      });

      // Add the new account to the list
      setBankAccounts((prev) => [...prev, newBankAccount]);
      setResolvedAccount(null);

      setBankAccounts((prev) => [...prev, newBankAccount]);
      fetchBankAccounts();

      return newBankAccount;
    } catch (error: any) {
      setErrorCreatingBankAccount(
        error?.message || "Failed to create bank account"
      );
      throw error;
    } finally {
      setIsCreatingBankAccount(false);
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
    createBankAccount,
    isCreatingBankAccount,
    errorCreatingBankAccount,
  };
};
