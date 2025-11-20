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

  // Helper function to deduplicate bank accounts based on bankId and account number
  const deduplicateBankAccounts = (accounts: UserBankAccount[]): UserBankAccount[] => {
    const seen = new Map<string, UserBankAccount>();
    
    for (const account of accounts) {
      // Extract bank ID - handle both string and object formats
      const bankId = typeof account.bankId === 'string' 
        ? account.bankId 
        : (account.bankId as any)?._id || (account.bankId as any)?.id;
      
      // Create a unique key from bankId and account number
      const key = `${bankId || 'unknown'}-${account.number || 'unknown'}`;
      
      // Only keep the first occurrence (or the one with the most recent _id if we want to keep the latest)
      if (!seen.has(key)) {
        seen.set(key, account);
      } else {
        // If duplicate found, keep the one with the most recent _id (assuming newer accounts have later IDs)
        const existing = seen.get(key);
        if (existing && account._id && existing._id) {
          // Compare _id strings - keep the one that appears later (newer)
          if (account._id > existing._id) {
            seen.set(key, account);
          }
        }
      }
    }
    
    return Array.from(seen.values());
  };

  const fetchBankAccounts = async () => {
    setIsLoadingBankAccounts(true);
    setErrorBankAccounts(null); // Clear previous errors
    try {
      const bankAccounts = await zapSDKService.getBankAccounts(
        currentExchangeUser || ""
      );
      
      // Deduplicate bank accounts before setting state
      const uniqueBankAccounts = deduplicateBankAccounts(bankAccounts);
      
      // Log if duplicates were found
      if (bankAccounts.length !== uniqueBankAccounts.length) {
        console.log(
          `🔄 Removed ${bankAccounts.length - uniqueBankAccounts.length} duplicate bank account(s)`
        );
      }
      
      setBankAccounts(uniqueBankAccounts);
      setErrorBankAccounts(null); // Ensure error is cleared on success
    } catch (error: any) {
      setErrorBankAccounts(error?.message);
    } finally {
      setIsLoadingBankAccounts(false);
    }
  };

  const getBankById = (bankId: string) => {
    return banks.find((bank) => bank._id === bankId);
  };

  const resolveBankAccount = async (bankId: string, accountNumber: string) => {
    setIsResolvingAccount(true);
    setErrorResolvingAccount(null); // Clear previous errors
    try {
      const resolvedAccount = await zapSDKService.resolveBankAccount(
        bankId,
        accountNumber
      );
      console.log("Resolved account response:", resolvedAccount);

      // Try multiple possible response structures
      // Structure 1: resolvedAccount.data.data (nested data)
      // Structure 2: resolvedAccount.data (direct data)
      // Structure 3: resolvedAccount.data.data.data (triple nested)
      const name = 
        (resolvedAccount?.data as any)?.data?.data || // Triple nested
        (resolvedAccount?.data as any)?.data || // Double nested
        (resolvedAccount?.data as any) || // Direct
        resolvedAccount?.data; // Fallback

      console.log("Extracted account name:", name);

      if (name && typeof name === 'string' && name.trim().length > 0) {
        const account = {
          name: name.trim(),
          holderName: name.trim(),
          number: accountNumber,
          bankId,
        };

        setResolvedAccount(account as unknown as UserBankAccount);
        setErrorResolvingAccount(null);
      } else {
        setResolvedAccount(null);
        setErrorResolvingAccount("Failed to resolve account");
        console.warn("Account name not found in response:", resolvedAccount);
      }
    } catch (error: any) {
      setResolvedAccount(null);
      console.error("Error resolving account:", error);
      setErrorResolvingAccount(error?.message || "Failed to resolve account");
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

      setResolvedAccount(null);

      // Refresh the list to get the updated accounts (this will also deduplicate)
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
    getBankById,
  };
};
