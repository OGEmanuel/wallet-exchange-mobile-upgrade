import BankAccountBottomSheet from "@/components/bottomsheets/BankAccountBottomSheet";
import EditAccountBottomSheet from "@/components/bottomsheets/EditAccountBottomSheet";
import BankBottomSheet from "@/components/bottomsheets/preference/BankBottomSheet";
import AccountListItem from "@/components/dashboard/account/AccountListItem";
import EmptyState from "@/components/dashboard/market/EmptyState";
import FilterPill from "@/components/dashboard/market/FilterPill";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import CurrencySelectionModal from "@/components/Modals/CurrencySelectionModal";
import DeleteAccountModal from "@/components/Modals/DeleteAccountModal";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { BankAccount, Currency } from "@/interfaces/account.interface";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { uniq } from "lodash";
import React, { useRef, useState } from "react";
import { ScrollView, TextInput } from "react-native";
import { useSelector } from "react-redux";

const Explore = () => {
  const theme = useTheme<Theme>();
  const user = useSelector(selectUser);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<
    Currency | undefined
  >();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { bankBottomSheetRef } = useBottomSheetRefs();

  const { getAccounts } = useSettings();
  const userDetails = useSelector(selectUser);

  const bankAccountBottomSheetRef = useRef<BottomSheet>(null);
  const editAccountBottomSheetRef = useRef<BottomSheet>(null);

  const currencyFilters = ["All", "NGN", "USD", "EUR", "GBP", "CAD"];

  React.useEffect(() => {
    (async function () {
      const response = await getAccounts({
        params: { userId: userDetails?._id as string },
      });
      setAccounts((prev: any) => uniq([...prev, ...(response.data as any)]));
      console.log("USER ACCOUNTs", response.data);
    })();
  }, []);

  const handleAddNewAccount = () => {
    setShowCurrencyModal(true);
  };

  const handleCurrencySelect = () => {
    setShowCurrencyModal(false);
    bankAccountBottomSheetRef.current?.snapToIndex(0);
  };

  const handleAccountAdded = (newAccount: BankAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
    setSelectedCurrency(undefined);
  };

  const handleEditAccount = (account: BankAccount) => {
    setAccountToEdit(account);
    editAccountBottomSheetRef.current?.snapToIndex(0);
  };

  const handleDeleteAccount = (account: BankAccount) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      setAccounts((prev) =>
        prev.filter((acc) => acc.id !== accountToDelete.id)
      );
      setAccountToDelete(null);
    }
  };

  const handleAccountUpdated = (updatedAccount: BankAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
    setAccountToEdit(null);
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesFilter =
      selectedFilter === "All" || account.currency === selectedFilter;
    const matchesSearch =
      account.accountHolderName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      account.accountNumber.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const renderAccountList = () => (
    <Box flex={1} bg="mainBackgroundColor" marginTop="l" marginHorizontal="m">
      <Box marginBottom="m">
        <TextInput
          style={{
            backgroundColor: theme.colors.secondaryBackgroundColor,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            color: theme.colors.headerTextColor,
            fontSize: 16,
          }}
          placeholder="Search accounts"
          placeholderTextColor={theme.colors.placeholderTextColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Box>

      {currencyFilters.length > 0 && (
        <Box flexDirection="row" marginBottom="m" gap="s">
          {currencyFilters.map((filter) => (
            <FilterPill
              key={filter}
              label={filter}
              active={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
            />
          ))}
        </Box>
      )}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredAccounts.map((account) => (
          <AccountListItem
            key={account.id}
            account={account}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
          />
        ))}
      </ScrollView>
    </Box>
  );

  const renderEmptyState = () => (
    <Box
      bg="mainBackgroundColor"
      flex={1}
      marginTop="s"
      marginHorizontal="m"
      alignItems="center"
      justifyContent="center"
    >
      <EmptyState
        title="No Accounts"
        info="You haven't added any accounts. Add a bank account to receive your naira"
        onPress={handleAddNewAccount}
        source={require('@/assets/images/noBank.png')}
      >
        <CustomText variant="body">+ Add New Account</CustomText>
      </EmptyState>
    </Box>
  );

  return (
    <PageWrapper>
      <SettingsHeader title="Accounts" onBackPress={() => router.back()} />

      <Box
        width="100%"
        alignItems="center"
        flexDirection="row"
        justifyContent="center"
        paddingHorizontal="l"
        position="relative"
      >
        {accounts.length > 0 && (
          <Box position="absolute" right={16}>
            <CustomButton
              text="+ New"
              onPress={handleAddNewAccount}
              width={70}
              height={30}
              borderRadius={50}
            />
          </Box>
        )}

        {accounts.length > 0 ? renderAccountList() : renderEmptyState()}
      </Box>

      <CurrencySelectionModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        onSelectCurrency={handleCurrencySelect}
      />

      <BankAccountBottomSheet
        ref={bankAccountBottomSheetRef}
        selectedCurrency={selectedCurrency}
        onAccountAdded={handleAccountAdded}
      />

      <EditAccountBottomSheet
        ref={editAccountBottomSheetRef}
        account={accountToEdit}
        onAccountUpdated={handleAccountUpdated}
      />

      <DeleteAccountModal
        visible={showDeleteModal}
        account={accountToDelete}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
      />
      <BankBottomSheet ref={bankBottomSheetRef} />
    </PageWrapper>
  );
};

export default Explore;
