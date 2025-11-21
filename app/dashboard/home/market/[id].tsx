import AssetHeader from "@/components/dashboard/market/AssetHeader";
import TokenGraph from "@/components/dashboard/market/TokenGraph";
import { Box, CustomText, PageWrapper } from "@/components/general";
import CustomButton from "@/components/general/CustomButton";
import LoaderWrapper from "@/components/general/LoaderWrapper";
import { SIZES } from "@/data";
import {
  calculatePriceChange,
  formatLargeNumber,
  getAvailablePeriods,
  getLatestMarketData,
} from "@/lib/utils/market/chartHelpers";
import { formatStats } from "@/lib/utils/market/helpers";
import { formatPrice } from "@/lib/utils/market/priceFormatter";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { formatCurrency } from "@/src/core/utils/format-utils";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  const [graphPeriod, setGraphPeriod] = useState<string>("24h");
  const [graphCurrency, setGraphCurrency] = useState<"USD" | "NGN">("USD");
  const [availableGraphPeriods, setAvailableGraphPeriods] = useState<string[]>([
    "24h",
    "7D",
    "30D",
    "90D",
    "1Y",
  ]);
  const [historicalRates, setHistoricalRates] = useState<any>(null);
  const [nairaCurrency, setNairaCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [usdCurrency, setUsdCurrency] = useState<CurrencyModel | undefined>(
    undefined
  );
  const [enhancedTokenDetails, setEnhancedTokenDetails] = useState<any>(null);

  // Fetch currencies and token details when component mounts
  useEffect(() => {
    fetchCurrenciesCallback();
    fetchTokenDetailsCallback();
    // Fetch token history separately (non-blocking)
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
        // This is the critical data needed for the page to render
        await fetchTokenDetails({
          body: id as string,
          params: {},
          extra: null,
        });
        
        // Token details are now automatically stored in Redux state via the hook
        // Set loading to false immediately so page can render
        setIsLoading(false);
        
        // Fetch enhanced details with news and historical rates using SDK directly
        // These are non-blocking - page will render even if they fail
        const sdk = zapSDKService.getSDK();
        if (sdk && sdk.markets) {
          // Fire off enhanced details fetch without blocking
          Promise.all([
            sdk.markets.getTokenDetails(id as string).catch((err) => {
              console.warn("Failed to fetch enhanced token details (non-blocking):", err);
              return null;
            }),
            sdk.markets.getHistoricalRates(id as string).catch((err) => {
              console.warn("Failed to fetch historical rates (non-blocking):", err);
              return null;
            }),
          ]).then(([enhancedDetails, historicalRatesResponse]) => {
            if (enhancedDetails) {
              setEnhancedTokenDetails(enhancedDetails);
            }
            if (historicalRatesResponse) {
              setHistoricalRates(historicalRatesResponse);
              
              // Set available periods based on data
              if (historicalRatesResponse?.data?.rates) {
                const periods = getAvailablePeriods(historicalRatesResponse.data.rates);
                setAvailableGraphPeriods(periods);
              }
            }
            console.log("Enhanced token details with news:", enhancedDetails);
            console.log("Historical rates:", historicalRatesResponse);
          }).catch((err) => {
            console.warn("Error in enhanced details fetch (non-blocking):", err);
            // Page continues to work without enhanced details
          });
        }
      } catch (err: any) {
        console.error("Error fetching token details:", err);
        setErrorMessage(err.message || "Failed to fetch token details");
        setIsLoading(false);
        // Page can still render with parsedAsset data even if this fails
      }
    }
     
  }, [id, fetchTokenDetails]);

  const fetchTokenHistoryCallback = useCallback(async () => {
    // This is non-blocking - page will render even if it fails
    try {
      await fetchTokenHistory({
        body: id as string,
        params: {},
        extra: null,
      });
    } catch (err: any) {
      console.warn("Error fetching token history (non-blocking):", err);
      // Don't block page rendering - this is just additional data
    }
  }, [id, fetchTokenHistory]);

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

  // Handle graph period change
  const handleGraphPeriodChange = (newPeriod: string) => {
    if (availableGraphPeriods.includes(newPeriod)) {
      setGraphPeriod(newPeriod);
    }
  };

  // Handle graph currency change
  const handleGraphCurrencyChange = (newCurrency: "USD" | "NGN") => {
    setGraphCurrency(newCurrency);
  };

  // Get ngnSellRate for chart
  const ngnSellRate = nairaCurrency?.sellRate;

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
        isLoading={isLoading && !parsedAsset}
        isError={!!errorMessage && !parsedAsset}
        errorMessage={errorMessage}
        onRetry={fetchTokenDetailsCallback}
        existingData={currentTokenDetails || parsedAsset}
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

              <ScrollView
            style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Token Graph Component */}
            {historicalRates?.data?.rates &&
            historicalRates.data.rates.length > 0 ? (
              <Box paddingHorizontal="m" marginTop="m">
                <TokenGraph
                  symbol={
                    currentTokenDetails?.tokenDetails?.symbol ||
                    parsedAsset?.currencyId?.symbol ||
                    parsedAsset?.symbol ||
                    "Unknown"
                  }
                  price={(() => {
                    // Use the price from markets page data (parsedAsset?.rate) to match what's shown on the markets listing
                    // This ensures consistency between markets listing and token details page
                    const marketPrice = parsedAsset?.rate || 0;
                    return formatPrice(
                      marketPrice,
                      graphCurrency,
                      nairaCurrency,
                      usdCurrency
                    );
                  })()}
                  priceChangePercentage={calculatePriceChange(
                    historicalRates.data.rates,
                    graphPeriod
                  )}
                  period={graphPeriod}
                  data={historicalRates.data.rates}
                  currency={graphCurrency}
                  availablePeriods={availableGraphPeriods}
                  onPeriodChange={handleGraphPeriodChange}
                  onCurrencyChange={handleGraphCurrencyChange}
                  tokenLogo={
                    currentTokenDetails?.tokenDetails?.logo ||
                    parsedAsset?.currencyId?.logo ||
                    parsedAsset?.logo
                  }
                  ngnSellRate={ngnSellRate}
                  nairaCurrency={nairaCurrency}
                  usdCurrency={usdCurrency}
                />
              </Box>
            ) : (
              <Box
                backgroundColor="modalBackgroundColor"
                borderRadius={20}
                padding="l"
                marginBottom="l"
                marginHorizontal="m"
                marginTop="m"
                minHeight={200}
                justifyContent="center"
                alignItems="center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <CustomText
                  color="headerTextColor"
                  fontSize={16}
                  fontWeight="bold"
                  marginBottom="s"
                >
                  Price Chart
                </CustomText>
                <CustomText
                  color="bodyTextColor"
                  fontSize={14}
                  textAlign="center"
                >
                  {isLoading
                    ? "Loading chart data..."
                    : "No historical data available"}
                </CustomText>
              </Box>
            )}

                {/* About Section - Matching Portfolio */}
                {currentTokenDetails?.tokenDetails && (
                  <Box width="100%" paddingHorizontal="m" marginTop="l">
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                      marginBottom="m"
                  >
                    <CustomText
                        variant="bodyBold"
                        fontSize={18}
                        color="headerTextColor"
                      >
                        About{" "}
                        {currentTokenDetails?.tokenDetails?.symbol ||
                          parsedAsset?.currencyId?.symbol ||
                          parsedAsset?.symbol ||
                          "Token"}
                    </CustomText>
                  </Box>
                    <CustomText
                      color="placeholderTextColor"
                      variant="body"
                      fontSize={15}
                      lineHeight={24}
                    >
                      {(currentTokenDetails?.tokenDetails as any)?.description ||
                        (currentTokenDetails?.tokenMetrics as any)?.description ||
                        (enhancedTokenDetails?.tokenDetails as any)?.description ||
                        "No description available for this token."}
                    </CustomText>
                    {((currentTokenDetails?.tokenDetails as any)?.description ||
                      (currentTokenDetails?.tokenMetrics as any)?.description ||
                      (enhancedTokenDetails?.tokenDetails as any)?.description) && (
                      <Pressable
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.5 : 1,
                          marginTop: 10,
                        })}
                      >
                        <CustomText color="white" variant="body" fontSize={14}>
                          View More
                        </CustomText>
                      </Pressable>
                    )}
                  </Box>
                )}

                {/* Stats Section - Matching Portfolio */}
                <CustomText
                  variant="bodyBold"
                  fontSize={18}
                  color="headerTextColor"
                  marginVertical="l"
                  paddingHorizontal="m"
                >
                  Stats
                </CustomText>
                <Box
                  backgroundColor="modalBackgroundColor"
                  borderRadius={20}
                  padding="l"
                  marginBottom="l"
                  marginHorizontal="m"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {/* Rank */}
                  {(currentTokenDetails?.tokenMetrics as any)?.rank && (
                    <Box
                      paddingVertical="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Rank
                      </CustomText>
                      <CustomText
                        color="headerTextColor"
                        fontSize={16}
                        variant="body"
                      >
                        #{(currentTokenDetails?.tokenMetrics as any)?.rank || "N/A"}
                      </CustomText>
                    </Box>
                  )}

                  {/* 24h Volume */}
                  {(currentTokenDetails?.tokenMetrics?.volume ||
                    tokenHistory?.rates) && (
                    <Box
                      paddingVertical="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        24h Volume
                      </CustomText>
                      <CustomText
                        color="headerTextColor"
                        fontSize={16}
                        variant="body"
                      >
                        {tokenHistory?.rates && tokenHistory.rates.length > 0
                          ? formatLargeNumber(
                              getLatestMarketData(tokenHistory.rates).volume,
                              graphCurrency,
                              nairaCurrency?.sellRate
                            )
                          : formatStats(
                              currentTokenDetails?.tokenMetrics?.volume || 0,
                              0,
                              graphCurrency
                            )}
                      </CustomText>
                    </Box>
                  )}

                  {/* Market Cap */}
                  {(currentTokenDetails?.tokenMetrics?.marketCap ||
                    tokenHistory?.rates) && (
                    <Box
                      paddingVertical="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Market Cap
                      </CustomText>
                      <CustomText
                        color="headerTextColor"
                        fontSize={16}
                        variant="body"
                      >
                        {tokenHistory?.rates && tokenHistory.rates.length > 0
                          ? formatLargeNumber(
                              getLatestMarketData(tokenHistory.rates).marketCap,
                              graphCurrency,
                              nairaCurrency?.sellRate
                            )
                          : formatStats(
                              currentTokenDetails?.tokenMetrics?.marketCap || 0,
                              0,
                              graphCurrency
                            )}
                      </CustomText>
                    </Box>
                  )}

                  {/* Total Supply */}
                  {(currentTokenDetails?.tokenMetrics as any)?.totalSupply && (
                    <Box
                      paddingVertical="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Total Supply
                      </CustomText>
                      <CustomText
                        color="headerTextColor"
                        fontSize={16}
                        variant="body"
                      >
                        {(currentTokenDetails?.tokenMetrics as any)?.totalSupply
                          ? formatCurrency(
                              (currentTokenDetails?.tokenMetrics as any).totalSupply
                            )
                          : "N/A"}
                      </CustomText>
                  </Box>
                  )}

                  {/* Circulating Supply */}
                  {(currentTokenDetails?.tokenMetrics as any)?.circulatingSupply && (
                    <Box
                      paddingVertical="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Circulating Supply
                      </CustomText>
                      <CustomText
                        color="headerTextColor"
                        fontSize={16}
                        variant="body"
                      >
                          {(currentTokenDetails?.tokenMetrics as any)?.circulatingSupply
                          ? formatCurrency(
                              (currentTokenDetails?.tokenMetrics as any).circulatingSupply
                            )
                          : "N/A"}
                      </CustomText>
                </Box>
                  )}

                  {/* All Time High */}
                  {(currentTokenDetails?.tokenMetrics as any)?.ath && (
                    <Box
                      paddingVertical="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        All Time High
                      </CustomText>
                      <CustomText
                        color="headerTextColor"
                        fontSize={16}
                        variant="body"
                      >
                          {(currentTokenDetails?.tokenMetrics as any)?.ath
                          ? formatCurrency(
                              (currentTokenDetails?.tokenMetrics as any).ath
                            )
                          : "N/A"}
                      </CustomText>
                    </Box>
                  )}

                  {/* All Time Low */}
                  {(currentTokenDetails?.tokenMetrics as any)?.atl && (
                    <Box
                      paddingVertical="m"
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        All Time Low
                      </CustomText>
                      <CustomText
                        color="headerTextColor"
                        fontSize={16}
                        variant="body"
                      >
                          {(currentTokenDetails?.tokenMetrics as any)?.atl
                          ? formatCurrency(
                              (currentTokenDetails?.tokenMetrics as any).atl
                            )
                          : "N/A"}
                      </CustomText>
                    </Box>
                  )}
                </Box>

                {/* Token Information Section */}
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

                {/* Top Stories Section - Matching Portfolio */}
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  paddingHorizontal="m"
                  marginTop="l"
                  >
                    <CustomText
                    variant="bodyBold"
                    fontSize={18}
                    color="headerTextColor"
                    marginVertical="l"
                    >
                      Top Stories
                    </CustomText>
                  <Pressable
                      onPress={() => {
                        router.push(`/dashboard/home/token-details/news?tokenId=${id}`);
                      }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="placeholderTextColor"
                    >
                      View All
                    </CustomText>
                  </Pressable>
                  </Box>
                <Box width="100%" paddingHorizontal="m">

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
                              backgroundColor="modalBackgroundColor"
                              borderRadius={20}
                              padding="m"
                              marginBottom="s"
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
        </Box>
      </LoaderWrapper>
    </PageWrapper>
  );
}
