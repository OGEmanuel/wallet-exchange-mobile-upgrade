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
import {
  formatLargeNumber,
  getLatestMarketData,
} from "@/lib/utils/market/chartHelpers";
import { formatStats } from "@/lib/utils/market/helpers";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Image, Linking, Pressable, ScrollView } from "react-native";
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
  const { tokenDetails: fetchTokenDetails, tokenHistory: fetchTokenHistory } =
    useMarket();
  const { fetchCurrencies } = useUtilities();
  const parsedAsset = asset ? JSON.parse(asset as string) : null;

  const { currentTokenDetails, tokenHistory } = useSelector(
    (state: AppRootState) => state.market
  );
  const { currencies } = useSelector((state: AppRootState) => state.utilities);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "NGN">("USD");
  const [nairaCurrency, setNairaCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [usdCurrency, setUsdCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [enhancedTokenDetails, setEnhancedTokenDetails] = useState<any>(null);

  // Fetch currencies and token details when component mounts
  useEffect(() => {
    fetchTokenDetailsCallback();
    fetchCurrenciesCallback();
    fetchTokenHistoryCallback();
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
        // First fetch basic token details via the market hook
        await fetchTokenDetails({
          body: id as string,
          params: {},
          extra: null,
        });
        
        // Then fetch enhanced details with news using SDK directly
        try {
          const sdk = zapSDKService.getSDK();
          if (sdk && sdk.markets) {
            const enhancedDetails = await sdk.markets.getTokenDetails(id as string);
            setEnhancedTokenDetails(enhancedDetails);
            console.log("Enhanced token details with news:", enhancedDetails);
          }
        } catch (sdkError) {
          console.warn("Failed to fetch enhanced token details:", sdkError);
          // Continue with basic token details even if enhanced fetch fails
        }
        
        // Token details are now automatically stored in Redux state via the hook
      } catch (err: any) {
        console.error("Error fetching token details:", err);
        setErrorMessage(err.message || "Failed to fetch token details");
      } finally {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fetchTokenDetails]);

  const fetchTokenHistoryCallback = useCallback(async () => {
    try {
      await fetchTokenHistory({
        body: id as string,
        params: {},
        extra: null,
      });
    } catch (err: any) {
      console.error("Error fetching token history:", err);
    }
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
          {(() => {
            console.log("🔍 AssetHeader Debug Data:");
            console.log("   - ID:", id);
            console.log("   - currentTokenDetails:", currentTokenDetails);
            console.log("   - parsedAsset:", parsedAsset);
            console.log("   - Token Name:", currentTokenDetails?.tokenDetails?.name);
            console.log("   - Token Symbol:", currentTokenDetails?.tokenDetails?.symbol);
            console.log("   - ParsedAsset Symbol:", parsedAsset?.currencyId?.symbol || parsedAsset?.symbol);
            console.log("   - Token Logo:", currentTokenDetails?.tokenDetails?.logo);
            return null;
          })()}
          <AssetHeader
            asset={currentTokenDetails?.tokenDetails?.name}
            parsedAsset={parsedAsset}
            logo={currentTokenDetails?.tokenDetails?.logo}
            symbol={currentTokenDetails?.tokenDetails?.symbol || parsedAsset?.currencyId?.symbol || parsedAsset?.symbol}
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
                  tokenHistory={tokenHistory}
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
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
                        {tokenHistory?.rates && tokenHistory.rates.length > 0
                          ? formatLargeNumber(
                              getLatestMarketData(tokenHistory.rates).volume,
                              selectedCurrency,
                              nairaCurrency?.sellRate
                            )
                          : formatStats(
                              currentTokenDetails?.tokenMetrics?.volume || 0,
                              0,
                              selectedCurrency
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
                        {tokenHistory?.rates && tokenHistory.rates.length > 0
                          ? formatLargeNumber(
                              getLatestMarketData(tokenHistory.rates).marketCap,
                              selectedCurrency,
                              nairaCurrency?.sellRate
                            )
                          : formatStats(
                              currentTokenDetails?.tokenMetrics?.marketCap || 0,
                              0,
                              selectedCurrency
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

                {/* Top Stories Section */}
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
                      text="View All"
                      color="white"
                      onPress={() => {
                        router.push(`/dashboard/home/token-details/news?tokenId=${id}`);
                      }}
                      width="25%"
                      borderRadius={50}
                      height={35}
                      bgColor="#6045FF"
                    />
                  </Box>

                  <Box marginTop="s">
                    {(enhancedTokenDetails?.tokenNews || currentTokenDetails?.tokenNews) && 
                     (enhancedTokenDetails?.tokenNews?.length > 0 || (currentTokenDetails?.tokenNews?.length ?? 0) > 0) ? (
                      (enhancedTokenDetails?.tokenNews || currentTokenDetails?.tokenNews || [])
                        .slice(0, 3)
                        .map((article: any, index: number) => (
                          <Pressable
                            key={article.id || index}
                            onPress={() => {
                              router.push(`/dashboard/home/token-details/news/${article.id || index}?tokenId=${id}`);
                            }}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.8 : 1,
                              transform: [{ scale: pressed ? 0.98 : 1 }],
                            })}
                          >
                            <Box
                              width="100%"
                              bg="secondaryBackgroundColor"
                              borderRadius={16}
                              marginBottom="s"
                              padding="m"
                              style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 4,
                              }}
                            >
                              <Box marginBottom="s">
                                <Box flexDirection="row" alignItems="center" mb="s">
                                  {/* Article Image */}
                                  <Box
                                    width={30}
                                    height={30}
                                    borderRadius={5}
                                    backgroundColor="borderColor"
                                    marginRight="s"
                                    overflow="hidden"
                                  >
                                    {article?.source?.image ? (
                                      <Image
                                        source={{ uri: article.source.image }}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                        }}
                                        resizeMode="cover"
                                      />
                                    ) : (
                                      <Box
                                        flex={1}
                                        justifyContent="center"
                                        alignItems="center"
                                        backgroundColor="borderColor"
                                      >
                                        <CustomText fontSize={24}>📰</CustomText>
                                      </Box>
                                    )}
                                  </Box>
                                  <Box
                                    borderRadius={6}
                                    flexDirection="row"
                                    alignItems="center"
                                    flex={1}
                                  >
                                    <CustomText
                                      color="white"
                                      variant="bodyMedium"
                                      fontSize={14}
                                    >
                                      {article.source?.name || "News"}
                                    </CustomText>
                                    <CustomText
                                      color="placeholderTextColor"
                                      variant="bodyMedium"
                                      fontSize={14}
                                    >
                                      {" "} • {" "}
                                      {article.publishedAt
                                        ? new Date(article.publishedAt).toLocaleDateString()
                                        : "Today"}
                                    </CustomText>
                                  </Box>
                                </Box>

                                {/* Article Content */}
                                <Box flex={1}>
                                  <Box
                                    marginBottom="s"
                                    flexDirection="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                  >
                                    <CustomText
                                      color="headerTextColor"
                                      fontSize={15}
                                      variant="body"
                                      lineHeight={20}
                                      numberOfLines={2}
                                      flex={1}
                                    >
                                      {article.title || "Latest news about this token"}
                                    </CustomText>
                                    <Box
                                      width={80}
                                      height={80}
                                      marginLeft="s"
                                      borderRadius={10}
                                      overflow="hidden"
                                    >
                                      {article.image ? (
                                        <Image
                                          source={{ uri: article.image }}
                                          style={{ width: "100%", height: "100%" }}
                                          resizeMode="cover"
                                        />
                                      ) : null}
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Pressable>
                        ))
                    ) : (
                      // Mock news data if no news is available from API
                      [
                        {
                          id: "1",
                          title: `${currentTokenDetails?.tokenDetails?.symbol || "Token"} shows strong performance in recent market trends`,
                          source: { name: "CryptoNews" },
                          publishedAt: new Date(),
                        },
                        {
                          id: "2", 
                          title: `Market analysis: ${currentTokenDetails?.tokenDetails?.name || "Token"} reaches new milestone`,
                          source: { name: "CoinDesk" },
                          publishedAt: new Date(Date.now() - 86400000), // 1 day ago
                        },
                        {
                          id: "3",
                          title: `Expert predictions for ${currentTokenDetails?.tokenDetails?.symbol || "Token"} in the coming quarter`,
                          source: { name: "BlockchainNews" },
                          publishedAt: new Date(Date.now() - 172800000), // 2 days ago
                        }
                      ].map((article, index) => (
                        <Pressable
                          key={article.id}
                          onPress={() => {
                            router.push(`/dashboard/home/token-details/news/${article.id}?tokenId=${id}`);
                          }}
                          style={({ pressed }) => ({
                            opacity: pressed ? 0.8 : 1,
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                          })}
                        >
                          <Box
                            width="100%"
                            bg="secondaryBackgroundColor"
                            borderRadius={16}
                            marginBottom="s"
                            padding="m"
                            style={{
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 8,
                              elevation: 4,
                            }}
                          >
                            <Box marginBottom="s">
                              <Box flexDirection="row" alignItems="center" mb="s">
                                {/* Article Image */}
                                <Box
                                  width={30}
                                  height={30}
                                  borderRadius={5}
                                  backgroundColor="borderColor"
                                  marginRight="s"
                                  overflow="hidden"
                                >
                                  <Box
                                    flex={1}
                                    justifyContent="center"
                                    alignItems="center"
                                    backgroundColor="borderColor"
                                  >
                                    <CustomText fontSize={24}>📰</CustomText>
                                  </Box>
                                </Box>
                                <Box
                                  borderRadius={6}
                                  flexDirection="row"
                                  alignItems="center"
                                  flex={1}
                                >
                                  <CustomText
                                    color="white"
                                    variant="bodyMedium"
                                    fontSize={14}
                                  >
                                    {article.source?.name || "News"}
                                  </CustomText>
                                  <CustomText
                                    color="placeholderTextColor"
                                    variant="bodyMedium"
                                    fontSize={14}
                                  >
                                    {" "} • {" "}
                                    {article.publishedAt.toLocaleDateString()}
                                  </CustomText>
                                </Box>
                              </Box>

                              {/* Article Content */}
                              <Box flex={1}>
                                <CustomText
                                  color="headerTextColor"
                                  fontSize={15}
                                  variant="body"
                                  lineHeight={20}
                                  numberOfLines={2}
                                >
                                  {article.title}
                                </CustomText>
                              </Box>
                            </Box>
                          </Box>
                        </Pressable>
                      ))
                    )}
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
