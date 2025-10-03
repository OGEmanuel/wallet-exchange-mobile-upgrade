import images from "@/assets/images";
import AnimatedTabContent from "@/components/dashboard/market/AnimatedTabContent";
import AssetChartDetails from "@/components/dashboard/market/AssetChartDetails";
import AssetHeader from "@/components/dashboard/market/AssetHeader";
import EmptyState from "@/components/dashboard/market/EmptyState";
// import ErrorState from "@/components/dashboard/market/ErrorState";
// import Loader from "@/components/dashboard/market/Loader";
import SwitchTab from "@/components/dashboard/market/SwitchTab";
import TransactionList from "@/components/dashboard/market/TransactionList";
import { Box, CustomText, PageWrapper } from "@/components/general";
import CustomButton from "@/components/general/CustomButton";
import LoaderWrapper from "@/components/general/LoaderWrapper";
import { SIZES } from "@/data";
import { formatStats } from "@/lib/utils/market/helpers";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Linking, ScrollView } from "react-native";
import { useSelector } from "react-redux";

// Initialize dimensions
const { width, height } = Dimensions.get("window");
SIZES.width = width;
SIZES.height = height;

const openExternalLink = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Cannot open URL:", url);
    }
  } catch (error) {
    console.log("Error opening URL:", error);
  }
};

export default function AssetInfo() {
  const [isAssetInfo, setIsAssetInfo] = useState(true);
  const { id, asset } = useLocalSearchParams();
  const router = useRouter();
  const { tokenDetails: fetchTokenDetails } = useMarket();
  const { fetchCurrencies } = useUtilities();
  const parsedAsset = asset ? JSON.parse(asset as string) : null;

  const { currentTokenDetails } = useSelector(
    (state: AppRootState) => state.market
  );
  const { currencies } = useSelector((state: AppRootState) => state.utilities);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nairaCurrency, setNairaCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [usdCurrency, setUsdCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );

  // Fetch currencies and token details when component mounts
  useEffect(() => {
    fetchTokenDetailsCallback();
    fetchCurrenciesCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set currency data when currencies are loaded
  useEffect(() => {
    if (currencies && currencies.length > 0) {
      const usd = currencies.find((c) => c.code === "USD");
      const ngn = currencies.find((c) => c.code === "NGN");
      setUsdCurrency(usd);
      setNairaCurrency(ngn);
    }
  }, [currencies]);

  const fetchTokenDetailsCallback = useCallback(async () => {
    if (id) {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        await fetchTokenDetails({
          body: id as string,
          params: {},
          extra: null,
        });
        // Token details are now automatically stored in Redux state via the hook
      } catch (err: any) {
        console.error("Error fetching token details:", err);
        setErrorMessage(err.message || "Failed to fetch token details");
      } finally {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCurrenciesCallback = useCallback(async () => {
    try {
      await fetchCurrencies({
        body: {},
        params: {},
        extra: {},
      });
    } catch (err: any) {
      console.error("Error fetching currencies:", err);
    }
  }, [fetchCurrencies]);

  // Transaction history tab hooks (moved to top level)
  type FiltersType = {
    startDate: Date | null;
    endDate: Date | null;
    selectedBanks: string[];
    selectedTokens: string[];
  };

  const [searchText] = useState("");

  const [filters] = useState<FiltersType>({
    startDate: null,
    endDate: null,
    selectedBanks: [],
    selectedTokens: [],
  });

  const filteredHistory = useMemo(() => {
    let filtered: any[] = [];
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
  }, [filters, searchText]);

  // If no asset is selected, you may want to redirect or show a fallback UI
  if (!id) {
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

  return (
    <PageWrapper>
      <LoaderWrapper
        isLoading={isLoading}
        isError={!!errorMessage}
        errorMessage={errorMessage}
        onRetry={fetchTokenDetailsCallback}
        existingData={currentTokenDetails}
        animationType="fade"
      >
        <Box flex={1} paddingBottom="xl">
          <AssetHeader
            asset={
              currentTokenDetails?.tokenDetails?.name ||
              currentTokenDetails?.tokenDetails?.symbol
            }
            parsedAsset={parsedAsset}
            logo={currentTokenDetails?.tokenDetails?.logo}
            symbol={currentTokenDetails?.tokenDetails?.symbol}
            currencyId={currentTokenDetails?.tokenMetrics?.currencyId}
          />
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
              <ScrollView
                style={{ height: SIZES.height - 250 }}
                contentContainerStyle={{ paddingBottom: 150 }}
              >
                <AssetChartDetails
                  tokenDetails={currentTokenDetails}
                  asset={parsedAsset}
                  nairaCurrency={nairaCurrency}
                  usdCurrency={usdCurrency}
                />

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
                        {formatStats(
                          currentTokenDetails?.tokenMetrics?.volume || 0,
                          0,
                          "USD"
                        )}
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
                        {formatStats(
                          currentTokenDetails?.tokenMetrics?.marketCap || 0,
                          0,
                          "USD"
                        )}
                      </CustomText>
                    </Box>
                  </Box>
                </Box>

                {/* Token Details Section */}
                {currentTokenDetails?.tokenDetails && (
                  <Box width="100%" paddingHorizontal="m" marginTop="l">
                    <CustomText
                      variant="bodySubheader"
                      fontSize={16}
                      style={{ fontFamily: "NewScience_Bold" }}
                      marginBottom="s"
                    >
                      Token Information
                    </CustomText>

                    <Box
                      width="100%"
                      bg="secondaryBackgroundColor"
                      borderRadius={16}
                      padding="m"
                    >
                      {currentTokenDetails.tokenDetails.name && (
                        <Box marginBottom="s">
                          <CustomText
                            variant="body"
                            fontSize={12}
                            color="disabledTextColor"
                            marginBottom="s"
                          >
                            Name
                          </CustomText>
                          <CustomText
                            variant="body"
                            fontSize={14}
                            color="bodyTextColor"
                          >
                            {currentTokenDetails.tokenDetails.name}
                          </CustomText>
                        </Box>
                      )}

                      {currentTokenDetails.tokenDetails.symbol && (
                        <Box marginBottom="s">
                          <CustomText
                            variant="body"
                            fontSize={12}
                            color="disabledTextColor"
                            marginBottom="s"
                          >
                            Symbol
                          </CustomText>
                          <CustomText
                            variant="body"
                            fontSize={14}
                            color="bodyTextColor"
                          >
                            {currentTokenDetails.tokenDetails.symbol}
                          </CustomText>
                        </Box>
                      )}

                      {(currentTokenDetails.tokenDetails.website ||
                        currentTokenDetails.tokenDetails.twitter ||
                        currentTokenDetails.tokenDetails.telegram) && (
                        <Box marginTop="m">
                          <CustomText
                            variant="body"
                            fontSize={12}
                            color="disabledTextColor"
                            marginBottom="s"
                          >
                            Links
                          </CustomText>
                          <Box flexDirection="row" flexWrap="wrap" gap="s">
                            {currentTokenDetails.tokenDetails.website && (
                              <CustomButton
                                text="Website"
                                color="white"
                                onPress={() => {
                                  openExternalLink(
                                    currentTokenDetails.tokenDetails?.website!
                                  );
                                }}
                                width="auto"
                                borderRadius={20}
                                height={32}
                                paddingHorizontal={12}
                                bgColor="#6045FF"
                              />
                            )}
                            {currentTokenDetails.tokenDetails.twitter && (
                              <CustomButton
                                text="Twitter"
                                color="white"
                                onPress={() => {
                                  openExternalLink(
                                    currentTokenDetails.tokenDetails?.twitter!
                                  );
                                }}
                                width="auto"
                                borderRadius={20}
                                height={32}
                                paddingHorizontal={12}
                                bgColor="#1DA1F2"
                              />
                            )}
                            {currentTokenDetails.tokenDetails.telegram && (
                              <CustomButton
                                text="Telegram"
                                color="white"
                                onPress={() => {
                                  openExternalLink(
                                    currentTokenDetails.tokenDetails?.telegram!
                                  );
                                }}
                                width="auto"
                                borderRadius={20}
                                height={32}
                                paddingHorizontal={12}
                                bgColor="#0088cc"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* News Section */}
                {currentTokenDetails?.tokenNews &&
                  currentTokenDetails.tokenNews.length > 0 && (
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
                          Latest News
                        </CustomText>

                        <CustomButton
                          text="View More"
                          color="white"
                          onPress={() => {
                            router.push("/dashboard/home/all-news");
                          }}
                          width="25%"
                          borderRadius={50}
                          height={35}
                          bgColor="#6045FF"
                        />
                      </Box>

                      <Box marginTop="s">
                        {currentTokenDetails.tokenNews
                          .slice(0, 3)
                          .map((news, index) => (
                            <Box
                              key={news.id || index}
                              width="100%"
                              bg="secondaryBackgroundColor"
                              borderRadius={16}
                              marginBottom="s"
                              padding="m"
                            >
                              <CustomText
                                variant="body"
                                fontSize={14}
                                color="bodyTextColor"
                                marginBottom="s"
                                numberOfLines={2}
                              >
                                {news.title}
                              </CustomText>
                              {news.source?.name && (
                                <CustomText
                                  variant="body"
                                  fontSize={12}
                                  color="disabledTextColor"
                                >
                                  {news.source.name}
                                </CustomText>
                              )}
                              {news.publishedAt && (
                                <CustomText
                                  variant="body"
                                  fontSize={12}
                                  color="disabledTextColor"
                                  marginTop="s"
                                >
                                  {new Date(
                                    news.publishedAt
                                  ).toLocaleDateString()}
                                </CustomText>
                              )}
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  )}

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
                        source={images.glass}
                      />
                    </Box>
                  ) : (
                    <TransactionList
                      groupedTransactions={[]}
                      refreshing={isLoading}
                      onRefresh={fetchTokenDetailsCallback}
                      loading={isLoading}
                      isDarkMode={false}
                      onEndReached={undefined}
                      onEndReachedThreshold={0.5}
                    />
                  )}
                </Box>
              </Box>
            }
          />
        </Box>
      </LoaderWrapper>
    </PageWrapper>
  );
}
