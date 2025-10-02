import FilterPill from "@/components/dashboard/market/FilterPill";
import MarketTableItem from "@/components/dashboard/market/MarketTableItem";
import SwitchTab from "@/components/dashboard/market/SwitchTab";
import TableHeader from "@/components/dashboard/market/TableHeader";
import { PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import LoaderWrapper from "@/components/general/LoaderWrapper";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { AppRootState } from "../../../../../state";

const Explore = () => {
  const [isTokens, setIsTokens] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCurrency, setSelectedCurrency] = useState<
    CurrencyModel | undefined
  >();
  const [nairaCurrency, setNairaCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [usdCurrency, setUsdCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [filteredCurrencies, setFilteredCurrencies] = useState<
    (CurrencyModel | undefined)[] | null
  >(null);
  // State for market data and loading states
  const [isLoading, setIsLoading] = useState(false);
  // const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { currencies } = useSelector((state: AppRootState) => state.utilities);
  const { marketTokens } = useSelector((state: AppRootState) => state.market);

  const { fetchMarketTokens } = useMarket();
  const { fetchCurrencies } = useUtilities();

  const retrieveNairaCurrency = useCallback((): void => {
    if (currencies) {
      const nairaCurrency = currencies.find(
        (currency) => currency.code === "NGN"
      );
      if (nairaCurrency) {
        setNairaCurrency(nairaCurrency);
      }
    }
  }, [currencies]);

  const retrieveUsdCurrency = useCallback((): void => {
    if (currencies) {
      const usdCurrency = currencies.find(
        (currency) => currency.code === "USD"
      );
      if (usdCurrency) {
        setUsdCurrency(usdCurrency);
        setSelectedCurrency(usdCurrency);
      }
    }
  }, [currencies]);

  // Function to fetch market tokens with proper error handling
  const loadMarketTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      // setIsError(false);
      setErrorMessage(null);

      await fetchMarketTokens({
        body: {},
        params: {},
        extra: {},
      });
    } catch (error) {
      // setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCurrencies = useCallback(async () => {
    await fetchCurrencies({
      body: {},
      params: {},
      extra: {},
    }).then(() => {
      retrieveNairaCurrency();
      retrieveUsdCurrency();
    });
  }, []);

  useEffect(() => {
    if (currencies && currencies.length > 0) {
      const usd = currencies.find((c) => c.code === "USD");
      const ngn = currencies.find((c) => c.code === "NGN");

      setUsdCurrency(usd);
      setNairaCurrency(ngn);
      setSelectedCurrency(usd); // default USD
      setFilteredCurrencies([usd, ngn]);
    }
  }, [currencies]);

  useEffect(() => {
    loadCurrencies();
    loadMarketTokens();
  }, []);

  const categories = ["All", "Top Gainers", "Top Losers"];

  // Filter market tokens based on selected category
  const filteredMarketTokens = React.useMemo(() => {
    if (!marketTokens) return null;

    switch (selectedCategory) {
      case "Top Gainers":
        return [...marketTokens]
          .filter((token) => token.change24h && token.change24h > 0)
          .sort((a, b) => (b.change24h || 0) - (a.change24h || 0));

      case "Top Losers":
        return [...marketTokens]
          .filter((token) => token.change24h && token.change24h < 0)
          .sort((a, b) => (a.change24h || 0) - (b.change24h || 0));

      case "All":
      default:
        return marketTokens;
    }
  }, [marketTokens, selectedCategory]);

  return (
    <PageWrapper>
      <Box width="100%" alignItems="center">
        <CustomText
          variant="bodyBold"
          textAlign="center"
          style={{ fontFamily: "NewScience_Bold" }}
        >
          Markets
        </CustomText>
      </Box>
      <Box width="100%" mt="m">
        <SwitchTab
          active={isTokens}
          setActive={setIsTokens}
          firstText="Tokens"
          secondText="Watchlist"
        />
      </Box>
      <Pressable
        style={{
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: "rgba(196, 230, 77, 0.2)",
          borderWidth: 1,
          borderColor: "#C7E64D",
        }}
        onPress={() =>
          router.push("/dashboard/home/market/682d9e57327011c95294e76f")
        }
      >
        <CustomText variant="body" fontSize={10} color="bodyTextColor">
          BTC
        </CustomText>
      </Pressable>

      {/* Category Filters */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="l"
        mt="s"
        width="100%"
      >
        <Box flexDirection="row">
          {categories.map((category, index) => (
            <FilterPill
              key={index}
              label={category}
              active={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </Box>
        <Box
          flexDirection="row"
          bg="secondaryBackgroundColor"
          borderRadius={20}
          padding="s"
        >
          {filteredCurrencies &&
            filteredCurrencies?.map((currency, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedCurrency(currency)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                  backgroundColor:
                    selectedCurrency?.code === currency?.code
                      ? "rgba(196, 230, 77, 0.2)"
                      : "transparent",
                  borderWidth:
                    selectedCurrency?.code === currency?.code ? 1 : 0,
                  borderColor:
                    selectedCurrency?.code === currency?.code
                      ? "#C7E64D"
                      : "transparent",
                }}
                android_ripple={{
                  color: "rgba(255,255,255,0.1)",
                  borderless: true,
                }}
              >
                <CustomText variant="body" fontSize={10} color="bodyTextColor">
                  {currency?.code}
                </CustomText>
              </Pressable>
            ))}
        </Box>
      </Box>

      <LoaderWrapper
        isLoading={isLoading && !marketTokens}
        isError={!!errorMessage && !marketTokens}
        errorMessage={errorMessage}
        onRetry={loadMarketTokens}
        isEmpty={
          !isLoading &&
          !!errorMessage &&
          filteredMarketTokens &&
          filteredMarketTokens.length === 0
        }
        existingData={filteredMarketTokens}
      >
        <Box
          bg="secondaryBackgroundColor"
          flex={1}
          borderRadius={8}
          marginTop="s"
          marginHorizontal="m"
        >
          <TableHeader />

          {/* Market Data Table */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {filteredMarketTokens?.map((item, index) => (
              <MarketTableItem
                key={index}
                item={item}
                index={index}
                selectedCurrency={selectedCurrency?.code as "USD" | "NGN"}
                nairaCurrency={nairaCurrency}
                usdCurrency={usdCurrency}
              />
            ))}
          </ScrollView>
        </Box>
      </LoaderWrapper>
    </PageWrapper>
  );
};

export default Explore;

// import { noBank } from "@/assets/images";
// import BankAccountBottomSheet from "@/components/bottomsheets/BankAccountBottomSheet";
// import EditAccountBottomSheet from "@/components/bottomsheets/EditAccountBottomSheet";
// import AccountListItem from "@/components/dashboard/account/AccountListItem";
// import EmptyState from "@/components/dashboard/market/EmptyState";
// import FilterPill from "@/components/dashboard/market/FilterPill";
// import {
//   Box,
//   CustomButton,
//   CustomText,
//   PageWrapper,
// } from "@/components/general";
// import CurrencySelectionModal from "@/components/Modals/CurrencySelectionModal";
// import DeleteAccountModal from "@/components/Modals/DeleteAccountModal";
// import { BankAccount, Currency } from "@/interfaces/account.interface";
// import { Theme } from "@/theme";
// import BottomSheet from "@gorhom/bottom-sheet";
// import { useTheme } from "@shopify/restyle";
// import React, { useRef, useState } from "react";
// import { ScrollView, TextInput } from "react-native";

// const Explore = () => {
//   const theme = useTheme<Theme>();
//   const [showCurrencyModal, setShowCurrencyModal] = useState(false);
//   const [selectedCurrency, setSelectedCurrency] = useState<
//     Currency | undefined
//   >();
//   const [accounts, setAccounts] = useState<BankAccount[]>([]);
//   const [selectedFilter, setSelectedFilter] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
//   const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(
//     null
//   );
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   const bankAccountBottomSheetRef = useRef<BottomSheet>(null);
//   const editAccountBottomSheetRef = useRef<BottomSheet>(null);

//   const currencyFilters = ["All", "NGN", "USD", "EUR", "GBP", "CAD"];

//   const handleAddNewAccount = () => {
//     setShowCurrencyModal(true);
//   };

//   const handleCurrencySelect = (currency: Currency) => {
//     setSelectedCurrency(currency);
//     setShowCurrencyModal(false);
//     bankAccountBottomSheetRef.current?.snapToIndex(0);
//   };

//   const handleAccountAdded = (newAccount: BankAccount) => {
//     setAccounts((prev) => [...prev, newAccount]);
//     setSelectedCurrency(undefined);
//   };

//   const handleEditAccount = (account: BankAccount) => {
//     setAccountToEdit(account);
//     editAccountBottomSheetRef.current?.snapToIndex(0);
//   };

//   const handleDeleteAccount = (account: BankAccount) => {
//     setAccountToDelete(account);
//     setShowDeleteModal(true);
//   };

//   const confirmDeleteAccount = () => {
//     if (accountToDelete) {
//       setAccounts((prev) =>
//         prev.filter((acc) => acc.id !== accountToDelete.id)
//       );
//       setAccountToDelete(null);
//     }
//   };

//   const handleAccountUpdated = (updatedAccount: BankAccount) => {
//     setAccounts((prev) =>
//       prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
//     );
//     setAccountToEdit(null);
//   };

//   const filteredAccounts = accounts.filter((account) => {
//     const matchesFilter =
//       selectedFilter === "All" || account.currency.code === selectedFilter;
//     const matchesSearch =
//       account.accountHolderName
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase()) ||
//       account.accountNumber.includes(searchQuery);
//     return matchesFilter && matchesSearch;
//   });

//   const renderAccountList = () => (
//     <Box flex={1} bg="mainBackgroundColor" marginTop="l" marginHorizontal="m">
//       <Box marginBottom="m">
//         <TextInput
//           style={{
//             backgroundColor: theme.colors.secondaryBackgroundColor,
//             borderRadius: 8,
//             paddingHorizontal: 12,
//             paddingVertical: 12,
//             color: theme.colors.headerTextColor,
//             fontSize: 16,
//           }}
//           placeholder="Search accounts"
//           placeholderTextColor={theme.colors.placeholderTextColor}
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//       </Box>

//       {currencyFilters.length > 0 && (
//         <Box flexDirection="row" marginBottom="m" gap="s">
//           {currencyFilters.map((filter) => (
//             <FilterPill
//               key={filter}
//               label={filter}
//               active={selectedFilter === filter}
//               onPress={() => setSelectedFilter(filter)}
//             />
//           ))}
//         </Box>
//       )}

//       <ScrollView
//         style={{ flex: 1 }}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       >
//         {filteredAccounts.map((account) => (
//           <AccountListItem
//             key={account.id}
//             account={account}
//             onEdit={handleEditAccount}
//             onDelete={handleDeleteAccount}
//           />
//         ))}
//       </ScrollView>
//     </Box>
//   );

//   const renderEmptyState = () => (
//     <Box
//       bg="mainBackgroundColor"
//       flex={1}
//       marginTop="s"
//       marginHorizontal="m"
//       alignItems="center"
//       justifyContent="center"
//     >
//       <EmptyState
//         title="No Accounts"
//         info="You haven't added any accounts. Add a bank account to receive your naira"
//         onPress={handleAddNewAccount}
//         source={noBank}
//       >
//         <CustomText variant="body">+ Add New Account</CustomText>
//       </EmptyState>
//     </Box>
//   );

//   return (
//     <PageWrapper>
//       <Box
//         width="100%"
//         alignItems="center"
//         flexDirection="row"
//         justifyContent="center"
//         paddingHorizontal="l"
//         position="relative"
//       >
//         <CustomText
//           variant="bodyBold"
//           textAlign="center"
//           style={{
//             fontFamily: "NewScience_Bold",
//           }}
//         >
//           Accounts
//         </CustomText>

//         {accounts.length > 0 && (
//           <Box position="absolute" right={16}>
//             <CustomButton
//               text="+ New"
//               onPress={handleAddNewAccount}
//               width={70}
//               height={30}
//               borderRadius={50}
//             />
//           </Box>
//         )}
//       </Box>

//       {accounts.length > 0 ? renderAccountList() : renderEmptyState()}

//       <CurrencySelectionModal
//         visible={showCurrencyModal}
//         onClose={() => setShowCurrencyModal(false)}
//         onSelectCurrency={handleCurrencySelect}
//       />

//       <BankAccountBottomSheet
//         ref={bankAccountBottomSheetRef}
//         selectedCurrency={selectedCurrency}
//         onAccountAdded={handleAccountAdded}
//       />

//       <EditAccountBottomSheet
//         ref={editAccountBottomSheetRef}
//         account={accountToEdit}
//         onAccountUpdated={handleAccountUpdated}
//       />

//       <DeleteAccountModal
//         visible={showDeleteModal}
//         account={accountToDelete}
//         onClose={() => setShowDeleteModal(false)}
//         onConfirm={confirmDeleteAccount}
//       />
//     </PageWrapper>
//   );
// };

// export default Explore;
