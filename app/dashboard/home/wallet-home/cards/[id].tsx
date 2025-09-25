import AnimatedTabContent from "@/components/dashboard/market/AnimatedTabContent";
import AssetChartDetails from "@/components/dashboard/market/AssetChartDetails";
import AssetHeader from "@/components/dashboard/market/AssetHeader";
import EmptyState from "@/components/dashboard/market/EmptyState";
import ErrorState from "@/components/dashboard/market/ErrorState";
// import Loader from "@/components/dashboard/market/Loader";
import SwitchTab from "@/components/dashboard/market/SwitchTab";
import TransactionList from "@/components/dashboard/market/TransactionList";
import { Box, CustomText, PageWrapper } from "@/components/general";
import CustomButton from "@/components/general/CustomButton";
import { marketData, SIZES, watchlistData } from "@/data";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, ScrollView } from "react-native";

// Initialize dimensions
const { width, height } = Dimensions.get("window");
SIZES.width = width;
SIZES.height = height;

// Utility functions
const formatStats = (
  value: number,
  decimals: number,
  currency: string
): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(decimals)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`;
  return `$${value.toFixed(decimals)}`;
};

const groupTransactionsByDate = (transactions: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  transactions.forEach((txn) => {
    const date = new Date(txn.createdAt).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(txn);
  });
  return grouped;
};

// // Mock hooks (replace with actual implementations when available)
// const useAssetHistory = () => ({
//   history: [],
//   isFetchingHistory: false,
// });

const useCurrencyHistory = (currencyId: string) => ({
  history: [],
  loading: false,
  error: null,
  refetch: async () => {},
});

export default function AssetInfo() {
  const [isAssetInfo, setIsAssetInfo] = useState(true);
  const { asset } = useLocalSearchParams();
  const router = useRouter();
  // const { history, isFetchingHistory } = useAssetHistory();

  // Parse the asset data from URL parameters
  const rawAsset = asset ? JSON.parse(asset as string) : null;

  // Find the matching asset from the imported data by symbol
  const allAssets = [...marketData, ...watchlistData];
  const matchedAsset = rawAsset
    ? allAssets.find((a) => a.symbol === rawAsset.symbol)
    : null;

  // Transform the matched asset to the expected structure
  const selectedAsset = matchedAsset
    ? {
        symbol: matchedAsset.symbol, // Add symbol at top level for CryptoData interface
        currencyId: {
          _id: matchedAsset.id.toString(),
          name: matchedAsset.name,
          symbol: matchedAsset.symbol,
          logo: matchedAsset.logo,
          ath: 0, // Default value since not in data
          volatility: 0.5, // Default value
          preferredRatesProviders: ["coinbase"], // Default value
          preferredTokenMetricsProviders: ["coinmarketcap"], // Default value
          preferredNewsProviders: ["coindesk"], // Default value
          maxSupply: 21000000, // Default value
          circulatingSupply: 19500000, // Default value
          totalSupply: 19500000, // Default value
        },
        rate: matchedAsset.price,
        change24h: matchedAsset.change24h,
        change1h: 0, // Default value since not in data
        dailyChange: matchedAsset.change24h,
        marketCap: 0, // Default value since not in data
      }
    : null;

  // Transaction history tab hooks (moved to top level)
  type FiltersType = {
    startDate: Date | null;
    endDate: Date | null;
    selectedBanks: string[];
    selectedTokens: string[];
  };

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<FiltersType>({
    startDate: null,
    endDate: null,
    selectedBanks: [],
    selectedTokens: [],
  });
  const {
    history: transactionHistory,
    loading,
    error: historyError,
    refetch,
  } = useCurrencyHistory(selectedAsset?.currencyId?._id?.toString() || "");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const filteredHistory = useMemo(() => {
    let filtered: any[] = transactionHistory || [];
    if (filters.startDate !== null) {
      filtered = filtered.filter(
        (txn: any) => new Date(txn.createdAt) >= filters.startDate!
      );
    }
    if (filters.endDate !== null) {
      filtered = filtered.filter(
        (txn: any) => new Date(txn.createdAt) <= filters.endDate!
      );
    }
    if (filters.selectedBanks.length > 0) {
      filtered = filtered.filter((txn: any) =>
        filters.selectedBanks.includes(txn?.withdrawalAccount?.bankId?._id)
      );
    }
    if (filters.selectedTokens.length > 0) {
      filtered = filtered.filter((txn: any) =>
        filters.selectedTokens.includes(txn?.sellCurrency?.currencyId?._id)
      );
    }
    if (searchText) {
      filtered = filtered.filter(
        (txn: any) =>
          txn?.withdrawalAccount?.holderName
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          txn?.withdrawalAccount?.walletAddress
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          txn?.sellCurrency?.currencyId?.symbol
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [transactionHistory, filters, searchText]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(filteredHistory),
    [filteredHistory]
  );

  const handleApplyFilters = (newFilters: FiltersType) => {
    setFilters(newFilters);
  };

  // If no asset is selected, you may want to redirect or show a fallback UI
  if (!selectedAsset) {
    return (
      <PageWrapper>
        <Box width="100%" alignItems="center" marginTop="xl">
          <CustomText variant="bodyBold" textAlign="center" fontSize={18}>
            No asset selected.
          </CustomText>
        </Box>
      </PageWrapper>
    );
  }

  // // Show loading state
  // if (isFetchingHistory) {
  //   return (
  //     <PageWrapper>
  //       <Loader visible={true} />
  //     </PageWrapper>
  //   );
  // }

  // Show error state
  if (historyError) {
    return (
      <PageWrapper>
        <Box flex={1} alignItems="center" justifyContent="center">
          <ErrorState
            title="Failed to load asset"
            info="We couldn't load the asset information. Please try again later."
            btnTitle="Retry"
            onPress={() => {
              // You can add a refetch function here if available
              console.log("Retry loading asset info");
            }}
          />
        </Box>
      </PageWrapper>
    );
  }

  // Helper to map CryptoData to CoinData for NewsCard
  const mapCryptoDataToCoinData = (crypto: any, assetInfo: any): any => ({
    id: crypto?.currencyId?._id || "",
    allTimeHighUsd: crypto?.currencyId?.ath || 0,
    currencyDetail: {
      chainIcon: "",
      chainId: "",
      createdAt: "",
      icon: crypto?.currencyId?.logo || "",
      id: crypto?.currencyId?._id || "",
      isCrypto: true,
      name: crypto?.currencyId?.name || "",
      network: "",
      ticker: crypto?.currencyId?.symbol || "",
      updatedAt: "",
    },
    history: [],
    icon: crypto?.currencyId?.logo || "",
    lastPrice: crypto?.rate || 0,
    marketCap: crypto?.marketCap || 0,
    ngnRates: {
      ngnAllTimeHighUsd: 0,
      ngnMarketCap: 0,
      ngnVolume: 0,
    },
    percentChange1hr: String(crypto?.change1h ?? ""),
    percentChange24hr: String(crypto?.change24h ?? ""),
    priceChangePercent: String(crypto?.dailyChange ?? ""),
    symbol: crypto?.symbol || "",
    usdPrice: crypto?.rate || 0,
    volume: assetInfo?.tokenMetrics?.volume || 0,
    historyDaily: [],
  });

  return (
    <PageWrapper>
      <Box flex={1}>
        <AssetHeader asset={selectedAsset} />
        <Box width="100%" paddingVertical="m">
          <SwitchTab
            active={isAssetInfo}
            setActive={setIsAssetInfo}
            firstText="Asset Info"
            secondText="History"
          />
        </Box>

        <AnimatedTabContent
          containerHeight={SIZES.height * 0.9}
          active={isAssetInfo}
          firstContent={
            <ScrollView style={{ height: SIZES.height - 250 }}>
              <AssetChartDetails />

              <Box width="100%" paddingHorizontal="m" marginTop="m">
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <CustomText
                    variant="bodySubheader"
                    fontSize={16}
                    style={{ fontFamily: "NewScience_Bold" }}
                  >
                    Stats
                  </CustomText>
                </Box>

                <Box
                  width="100%"
                  bg="secondaryBackgroundColor"
                  borderRadius={16}
                  marginTop="s"
                  padding="m"
                >
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom="m"
                  >
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                    >
                      24h Volume
                    </CustomText>
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="bodyTextColor"
                    >
                      {formatStats(200000000, 0, "USD")}
                    </CustomText>
                  </Box>

                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                    >
                      Market Cap
                    </CustomText>
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="bodyTextColor"
                    >
                      {formatStats(selectedAsset?.marketCap || 0, 0, "USD")}
                    </CustomText>
                  </Box>
                </Box>
              </Box>

              <Box width="100%" paddingHorizontal="m" marginTop="l">
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <CustomText
                    variant="bodySubheader"
                    fontSize={16}
                    style={{ fontFamily: "NewScience_Bold" }}
                  >
                    Top Stories
                  </CustomText>

                  <CustomButton
                    text="View More"
                    color="white"
                    onPress={() => {
                      router.push("/dashboard/home/wallet-home/home");
                    }}
                    width="25%"
                    borderRadius={50}
                    height={35}
                    bgColor="#6045FF"
                  />
                </Box>

                <Box
                  width="100%"
                  bg="secondaryBackgroundColor"
                  borderRadius={16}
                  marginTop="s"
                  padding="m"
                >
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    marginBottom="m"
                  >
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                    >
                      24h Volume
                    </CustomText>
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="bodyTextColor"
                    >
                      {formatStats(200000000, 0, "USD")}
                    </CustomText>
                  </Box>

                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                    >
                      Market Cap
                    </CustomText>
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="bodyTextColor"
                    >
                      {formatStats(selectedAsset?.marketCap || 0, 0, "USD")}
                    </CustomText>
                  </Box>
                </Box>
              </Box>

              <Box paddingHorizontal="m" paddingVertical="m">
                <CustomButton
                  text="Zap Now"
                  color="white"
                  onPress={() => {
                    router.push("/dashboard/home/wallet-home/home");
                  }}
                  width="100%"
                  borderRadius={50}
                />
              </Box>
            </ScrollView>
          }
          secondContent={
            <Box flex={1} paddingHorizontal="l">
              <Box marginTop="s" flex={1}>
                {!filteredHistory || filteredHistory.length === 0 ? (
                  <Box height="100%" alignItems="center" marginVertical="xl">
                    <EmptyState
                      title="No History"
                      info="You have not made any transactions for this asset yet."
                      onPress={() => {
                        router.push("/dashboard/home/wallet-home/cards");
                      }}
                    />
                  </Box>
                ) : (
                  <TransactionList
                    groupedTransactions={[]}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    loading={loading}
                    isDarkMode={false}
                    onEndReached={undefined}
                    onEndReachedThreshold={0.5}
                  />
                )}
              </Box>
            </Box>
          }
        />

        <Box
          paddingHorizontal="m"
          paddingVertical="m"
          style={{ marginBottom: 100 }}
        >
          <CustomButton
            text="Zap Now"
            color="white"
            onPress={() => {
              router.push("/dashboard/home/wallet-home/home");
            }}
            width="100%"
          />
        </Box>
      </Box>
    </PageWrapper>
  );
}
