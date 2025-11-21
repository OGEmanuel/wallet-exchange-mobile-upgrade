import BankAccountsBottomSheet from "@/components/bottomsheets/BankAccountsBottomSheet";
import EmptyState from "@/components/dashboard/market/EmptyState";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import KYCFlowManager from "@/components/kyc/KYCFlowManager";
import DeleteBankAccountModal from "@/components/Modals/DeleteBankAccountModal";
import BankAccountCard from "@/components/swap/BankAccountCard";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { userHasAtleastOneDocumentApproved } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { useBankAccounts } from "@/src/modules/swap/presentation/hooks/useBankAccounts";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ISupportedCurrency, UserBankAccount } from "@zap/blockchain-sdk";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, TextInput } from "react-native";

const BankAccountsScreen = () => {
  const theme = useTheme<Theme>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<UserBankAccount | null>(null);
  const [showAddAccountBottomSheet, setShowAddAccountBottomSheet] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<UserBankAccount | null>(null);
  
  const bankAccountsBottomSheetRef = useRef<BottomSheet>(null);
  const { supportedCurrenciesForSwap } = useSupportedCurrencies();
  const { exchangeUserData } = useWallet();
  const { showBottomSheet } = useAppBottomSheet();
  
  // Use the same hook as swap screen
  const {
    bankAccounts,
    isLoadingBankAccounts,
    errorBankAccounts,
    fetchBankAccounts,
    deleteBankAccount,
    getBankById,
  } = useBankAccounts();

  // Fetch bank accounts on mount
  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchBankAccounts();
    } catch (error) {
      console.error("Failed to refresh bank accounts:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, fetchBankAccounts]);

  // Filter bank accounts based on search query
  const filteredBankAccounts = bankAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get NGN supported currency for adding accounts
  const ngnCurrency = supportedCurrenciesForSwap?.find(
    (sc: ISupportedCurrency) => (sc.currencyId as any)?.symbol === "NGN"
  ) as ISupportedCurrency | null;

  const showKYCBottomSheet = (options?: { onComplete?: () => void; onClose?: () => void }) => {
    return showBottomSheet({
      component: (
        <KYCFlowManager
          onComplete={() => {
            options?.onComplete?.();
          }}
          onBack={() => {
            options?.onClose?.();
          }}
        />
      ),
      props: {
        snapPoints: ["90%"],
        enablePanDownToClose: true,
        showGradientHandle: true,
        gradientColors: [
          theme.colors.primaryColor,
          theme.colors.mainBackgroundColor,
          theme.colors.mainBackgroundColor,
        ],
      },
      onClose: options?.onClose,
    });
  };

  const handleAddAccount = () => {
    // Check if user is verified
    const isVerificationComplete = userHasAtleastOneDocumentApproved(exchangeUserData);
    
    if (!isVerificationComplete) {
      // Show KYC flow instead of bank account bottom sheet
      showKYCBottomSheet({
        onComplete: () => {
          // After KYC completion, they can try again
        },
        onClose: () => {
          // Handle close if needed
        },
      });
      return;
    }
    
    // User is verified, show bank account bottom sheet
    setShowAddAccountBottomSheet(true);
    // Use setTimeout to ensure the component is mounted before calling snapToIndex
    setTimeout(() => {
    bankAccountsBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  };

  const handleAccountSelect = (account: UserBankAccount) => {
    setSelectedAccount(account);
  };

  const handleDelete = (account: UserBankAccount) => {
    setAccountToDelete(account);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      await deleteBankAccount(accountToDelete._id || "");
      setDeleteModalVisible(false);
      setAccountToDelete(null);
      // Clear selection if deleted account was selected
      if (selectedAccount?._id === accountToDelete._id) {
        setSelectedAccount(null);
      }
    } catch {
      Alert.alert("Error", "Failed to delete bank account");
      setDeleteModalVisible(false);
      setAccountToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setAccountToDelete(null);
  };

  const handleAccountAdded = () => {
    // Refresh the list when a new account is added
    fetchBankAccounts();
    setShowAddAccountBottomSheet(false);
  };

  const renderSearchBar = () => (
    <Box
      backgroundColor="secondaryBackgroundColor"
      borderRadius={30}
      paddingHorizontal="m"
      marginBottom="m"
      flexDirection="row"
      alignItems="center"
    >
      <Search size={18} color={theme.colors.bodyTextColor} />
      <TextInput
        style={{
          flex: 1,
          padding: 13,
          color: theme.colors.headerTextColor,
          fontSize: 15,
        }}
        placeholder="Search accounts"
        placeholderTextColor={theme.colors.disabledTextColor}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </Box>
  );

  const renderAccountList = () => (
    <Box flex={1} width="100%">
      {renderSearchBar()}
      <Box>
        {filteredBankAccounts.map((account) => {
          // Get bank details for this account
          const bankId = typeof account.bankId === 'string' 
            ? account.bankId 
            : (account.bankId as any)?._id;
          const bank = bankId ? getBankById(bankId) : null;
          const bankName = bank?.name || (account.bankId as any)?.name || null;
          
          return (
            <BankAccountCard
              key={account._id}
              bankAccount={account}
              bankName={bankName}
              selected={selectedAccount?._id === account._id}
              onPress={() => handleAccountSelect(account)}
              onDelete={() => handleDelete(account)}
              showDeleteButton={true}
            />
          );
        })}
      </Box>
    </Box>
  );

  const renderEmptyState = (showSearchBar: boolean = false) => (
    <Box flex={1} width="100%">
      {showSearchBar && renderSearchBar()}
      <Box
        flex={1}
        alignItems="center"
        justifyContent="center"
        paddingHorizontal="m"
      >
        <EmptyState
          title={showSearchBar ? "No Results" : "No Accounts"}
          info={
            showSearchBar
              ? "No accounts match your search. Try a different search term."
              : "You haven't added any accounts. Add a bank account to receive your naira"
          }
          onPress={handleAddAccount}
          source={require("@/assets/images/noBank.png")}
        >
          {!showSearchBar && (
            <CustomButton
              text="+ Add New Account"
              onPress={handleAddAccount}
              borderRadius={30}
              width={200}
            />
          )}
        </EmptyState>
      </Box>
    </Box>
  );

  return (
    <PageWrapper>
      <SettingsHeader title="Accounts" onBackPress={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primaryColor}
            colors={[theme.colors.primaryColor]}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Box flex={1} p="m" position="relative">
          {bankAccounts.length > 0 && (
            <Box position="absolute" right={16} top={16} zIndex={1}>
              <CustomButton
                text="+ New"
                onPress={handleAddAccount}
                width={70}
                height={43}
                borderRadius={50}
              />
            </Box>
          )}

          {isLoadingBankAccounts ? (
            <Box flex={1} alignItems="center" justifyContent="center" marginTop="xl">
              <CustomText variant="body" color="bodyTextColor">
                Loading accounts...
              </CustomText>
            </Box>
          ) : errorBankAccounts ? (
            <Box flex={1} alignItems="center" justifyContent="center" marginTop="xl">
              <CustomText variant="body" color="error">
                {errorBankAccounts}
              </CustomText>
              <Box marginTop="m">
                <CustomButton
                  text="Retry"
                  onPress={fetchBankAccounts}
                  borderRadius={30}
                />
              </Box>
            </Box>
          ) : bankAccounts.length > 0 ? (
            filteredBankAccounts.length > 0 ? (
              renderAccountList()
            ) : (
              renderEmptyState(true)
            )
          ) : (
            renderEmptyState(false)
          )}
        </Box>
      </ScrollView>

        <BankAccountsBottomSheet
          ref={bankAccountsBottomSheetRef}
          targetCurrency={ngnCurrency}
        initialView={showAddAccountBottomSheet ? "add" : "list"}
          onBankAccountSelect={(account) => {
            if (account) {
              handleAccountAdded();
            }
          }}
          onContinue={() => {
            handleAccountAdded();
          }}
          onClose={() => {
            setShowAddAccountBottomSheet(false);
            bankAccountsBottomSheetRef.current?.close();
          }}
        />

      <DeleteBankAccountModal
        visible={deleteModalVisible}
        accountName={accountToDelete?.holderName || accountToDelete?.name || ""}
        accountNumber={accountToDelete?.number || ""}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </PageWrapper>
  );
};

export default BankAccountsScreen;
