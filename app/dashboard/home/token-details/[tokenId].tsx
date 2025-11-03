import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell, SendHorizonal, Star } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
} from "react-native";
import { useSelector } from "react-redux";

import TokenGraph from "@/components/dashboard/market/TokenGraph";
import {
    calculatePriceChange,
    formatLargeNumber,
    getAvailablePeriods,
    getLatestMarketData,
    getLatestRate,
} from "@/lib/utils/market/chartHelpers";

import {
    ThemedQrCodeIcon,
    ThemedSwapIcon,
} from "@/assets/svg/wallet-icons-components";
import ThemedGlassIcon from "@/assets/svg/wallet-icons-components/ThemedGlassIcon";
import QRCodeBottomSheet from "@/components/bottomsheets/QRCodeBottomSheet";
import TransactionDetailsBottomSheet from "@/components/bottomsheets/TransactionDetailsBottomSheet";
import ActionButtons from "@/components/dashboard/ActionButtons";
import BalanceCard from "@/components/dashboard/BalanceCard";
import TransactionCardSkeleton from "@/components/dashboard/TransactionCardSkeleton";
import Box from "@/components/general/Box";
import CryptoIcon from "@/components/general/CrptoIcon";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import ZapLoader from "@/components/general/ZapLoader";
import TokenHistoryCard from "@/components/wallet/TokenHistoryCard";
import { isSameDay } from "@/configs/helpers";
import { PortfolioService } from "@/services/portfolio.service";
import { formatCurrency, formatDate } from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppRootState } from "@/state";
import {
    selectAllSupportedTokens,
    selectAssetBySupportedCurrencyId,
    selectProcessedPortfolio,
} from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { BlockchainTransaction } from "@zap/blockchain-sdk";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TokenDetails = () => {
  const { tokenId: rawTokenId } = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleTransactionPress = (transaction: BlockchainTransaction) => {
    console.log("🎯 Transaction pressed:", transaction);
    setSelectedTransaction(transaction);
  };

  // Handle different tokenId formats
  let tokenId: string;
  if (Array.isArray(rawTokenId)) {
    tokenId = rawTokenId[0];
  } else if (typeof rawTokenId === "object" && rawTokenId !== null) {
    // If it's an object, try to extract the ID
    tokenId =
      (rawTokenId as any)?._id ||
      (rawTokenId as any)?.id ||
      JSON.stringify(rawTokenId);
  } else {
    tokenId = rawTokenId || "";
  }

  // Ensure tokenId is a string
  tokenId = String(tokenId);
  const router = useRouter();
  const theme = useTheme<Theme>();
  const { portfolio, mainUserWalletGroup, getTransactionHistory, getAddress } =
    useWallet();

  // Redux state
  const processedPortfolio = useSelector(selectProcessedPortfolio);
  const selectedToken = useSelector((state: AppRootState) =>
    selectAssetBySupportedCurrencyId(state, tokenId as string)
  );

  // Fallback: manually find token if selector doesn't work
  const allTokens = useSelector(selectAllSupportedTokens);
  const portfolioAssets = processedPortfolio?.assets || [];

  const fallbackToken = allTokens?.find((token) => {
    // Try multiple matching strategies
    const matchesId = token.id === tokenId;
    const matchesSupportedId = token.supportedCurrencyId?._id === tokenId;
    const matchesSupportedIdString =
      token.supportedCurrencyId?._id?.toString() === tokenId;
    const matchesIdString = token.id?.toString() === tokenId;

    // NEW: Check if supportedCurrencyId is a string that matches
    const matchesSupportedIdDirect = token.supportedCurrencyId === tokenId;

    // NEW: Check if supportedCurrencyId is an object with _id that matches
    const matchesSupportedIdObject =
      typeof token.supportedCurrencyId === "object" &&
      token.supportedCurrencyId?._id === tokenId;

    return (
      matchesId ||
      matchesSupportedId ||
      matchesSupportedIdString ||
      matchesIdString ||
      matchesSupportedIdDirect ||
      matchesSupportedIdObject
    );
  });

  // Also try to find in portfolio assets
  const portfolioToken = portfolioAssets?.find((asset) => {
    const matchesId = asset.id === tokenId;
    const matchesSupportedId = asset.supportedCurrencyId?._id === tokenId;
    const matchesSupportedIdString =
      asset.supportedCurrencyId?._id?.toString() === tokenId;
    const matchesIdString = asset.id?.toString() === tokenId;

    // NEW: Check if supportedCurrencyId is a string that matches
    const matchesSupportedIdDirect = asset.supportedCurrencyId === tokenId;

    // NEW: Check if supportedCurrencyId is an object with _id that matches
    const matchesSupportedIdObject =
      typeof asset.supportedCurrencyId === "object" &&
      asset.supportedCurrencyId?._id === tokenId;

    return (
      matchesId ||
      matchesSupportedId ||
      matchesSupportedIdString ||
      matchesIdString ||
      matchesSupportedIdDirect ||
      matchesSupportedIdObject
    );
  });

  const finalSelectedToken = portfolioToken || selectedToken || fallbackToken;

  console.log(finalSelectedToken);

  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [isTokenDetailsLoading, setIsTokenDetailsLoading] = useState(false);
  const [isTokenHistoryLoading, setIsTokenHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"asset" | "history">("asset");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "24h" | "W" | "M" | "6M" | "1Y"
  >("W");
  const [isFavorite, setIsFavorite] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const insets = useSafeAreaInsets();
  const [graphPeriod, setGraphPeriod] = useState<string>("7D");
  const [graphCurrency, setGraphCurrency] = useState<"USD" | "NGN">("USD");
  const [availableGraphPeriods, setAvailableGraphPeriods] = useState<string[]>([
    "24h",
    "7D",
    "3M",
    "6M",
    "1Y",
  ]);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isTabSticky, setIsTabSticky] = useState(false);
  const [showStickyActions, setShowStickyActions] = useState(false);
  const stickyAnim = useRef(new Animated.Value(0)).current;
  const receiveBottomSheetRef = useRef<BottomSheet>(null);
  const SCREEN_WIDTH = Dimensions.get("window").width;

  // Tab animation effect
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === "asset" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeTab, slideAnim]);

  // Handle tab switch with animation
  const handleTabSwitch = (tab: "asset" | "history") => {
    setActiveTab(tab);
  };

  // Handle scroll for sticky behavior
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Listen to scroll changes for sticky behavior
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      // Make tabs sticky when scrolled past the gradient section (approximately 400px)
      setIsTabSticky(value > 300);
      // Show sticky actions when scrolled past the balance section (approximately 500px)
      const shouldShow = value > 300;
      setShowStickyActions(shouldShow);

      // Animate sticky bar in/out
      Animated.timing(stickyAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY, stickyAnim]);

  // State for token details
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [historicalRates, setHistoricalRates] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenHistory, setTokenHistory] = useState<any>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<BlockchainTransaction | null>(null);
  const transactionDetailsRef = useRef<BottomSheet>(null);

  const fetchTokenHistoryCallback = useCallback(async () => {
    if (!finalSelectedToken || !walletAddress) {
      console.log("Missing required data:", {
        hasToken: !!finalSelectedToken,
        hasWalletAddress: !!walletAddress,
        token: finalSelectedToken,
      });
      return;
    }

    setIsTokenHistoryLoading(true);
    try {
      if (!getTransactionHistory) {
        throw new Error("Transaction history method not available");
      }

      // Get transaction history for this specific account
      if (!finalSelectedToken.accountId) {
        console.warn("No accountId found for token:", finalSelectedToken);
        setTokenHistory([]);
        return;
      }

      const transactions = await getTransactionHistory(
        finalSelectedToken.accountId
      );

      console.log("Received transactions:", transactions);
      setTokenHistory(transactions || []);
    } catch (error) {
      console.error("❌ Failed to fetch token history:", error);
      setTokenHistory([]);
    } finally {
      setIsTokenHistoryLoading(false);
    }
  }, [finalSelectedToken, walletAddress, getTransactionHistory]);

  // Get token details from market state

  // Fetch token details using SDK directly
  const fetchTokenDetailsCallback = useCallback(async () => {
    if (tokenId && finalSelectedToken) {
      setIsTokenDetailsLoading(true);
      try {
        // Use the stored currencyId from ProcessedAsset
        const currencyId = finalSelectedToken.currencyId;

        if (!currencyId) {
          throw new Error("No currencyId found for token");
        }

        // Use SDK directly instead of useMarket hook
        const sdk = zapSDKService.getSDK();
        if (!sdk || !sdk.markets) {
          throw new Error("SDK or markets module not available");
        }

        // Fetch token details and historical rates in parallel
        const [tokenDetailsResponse, historicalRatesResponse] =
          await Promise.all([
            sdk.markets.getTokenDetails(currencyId),
            sdk.markets.getHistoricalRates(currencyId),
          ]);

        // Store the token details in state
        setTokenDetails(tokenDetailsResponse);
        setHistoricalRates(historicalRatesResponse);
      } catch (error) {
        console.error("❌ Failed to fetch token details:", error);
        setTokenDetails(null);
        setHistoricalRates(null);
      } finally {
        setIsTokenDetailsLoading(false);
      }
    }
  }, [tokenId, finalSelectedToken]);

  // Fetch token details on mount
  useEffect(() => {
    fetchTokenDetailsCallback();
  }, [fetchTokenDetailsCallback]);

  // Update available periods when historical rates data changes
  useEffect(() => {
    if (historicalRates?.data?.rates) {
      const periods = getAvailablePeriods(historicalRates.data.rates);
      setAvailableGraphPeriods(periods);

      // If current period is not available, set to the first available
      if (periods.length > 0 && !periods.includes(graphPeriod)) {
        setGraphPeriod(periods[0]);
      }
    }
  }, [historicalRates, graphPeriod]);

  // Fetch transaction history when wallet address and accountId are available
  useEffect(() => {
    if (walletAddress && finalSelectedToken && finalSelectedToken.accountId) {
      fetchTokenHistoryCallback();
    }
  }, [
    fetchTokenHistoryCallback,
    walletAddress,
    finalSelectedToken,
    finalSelectedToken?.accountId,
  ]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchTokenDetailsCallback(),
        fetchTokenHistoryCallback(),
      ]);
    } catch (error) {
      console.error("❌ Failed to refresh token details:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTokenDetailsCallback, fetchTokenHistoryCallback]);

  // Portfolio processing is now handled centrally in home.tsx
  // This component just uses the processed data from Redux

  // Force portfolio processing if no tokens are available
  // This is now handled centrally - just trigger a refresh if needed
  useEffect(() => {
    if (!allTokens || allTokens.length === 0) {
      console.log(
        "⚠️ No tokens available, portfolio processing should be handled centrally"
      );
    }
  }, [allTokens]);

  // Get wallet address when selected token changes
  useEffect(() => {
    if (finalSelectedToken) {
      getWalletAddress();
    }
  }, [finalSelectedToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Get wallet address for the selected token's chain
  const getWalletAddress = async () => {
    if (!finalSelectedToken || !mainUserWalletGroup?._id) return;

    try {
      // Use centralized getAddress function
      const address = await getAddress(
        finalSelectedToken.chainSymbol,
        mainUserWalletGroup._id
      );

      if (address) {
        setWalletAddress(address);
        return address;
      } else {
        setWalletAddress("Address not available for this chain");
        return null;
      }
    } catch (error) {
      console.error("Error getting wallet address:", error);
      setWalletAddress("Error retrieving address");
      return null;
    }
  };

  const handleAction = async (
    action: "receive" | "send" | "trade" | "swap" | "buy"
  ) => {
    switch (action) {
      case "receive":
        // Show receive bottom sheet
        receiveBottomSheetRef.current?.snapToIndex(0);
        break;
      case "send":
        router.push(`/dashboard/home/send-token?tokenId=${tokenId}`);
        break;
      case "trade":
        // Navigate to trade flow
        break;
      case "swap":
        router.replace(`/dashboard/home/wallet-home/swap`);
        // Navigate to swap flow
        break;
      case "buy":
        // router.push(`/dashboard/home/wallet-home/buy`);
        break;
    }
  };

  const formatBalance = (balance: number, decimals: number) => {
    return PortfolioService.formatBalance(balance, decimals);
  };

  const formatPercentage = (value: number) => {
    return PortfolioService.formatPercentage(value);
  };

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

  // Get NGN sell rate from currencies
  const ngnSellRate = useSelector((state: AppRootState) => {
    const currencies = state.utilities?.currencies;
    if (currencies) {
      const ngnCurrency = currencies.find((c: any) => c.code === "NGN");
      return ngnCurrency?.sellRate || undefined;
    }
    return undefined;
  });

  if (isPortfolioLoading || isTokenDetailsLoading) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ZapLoader
            size={100}
            showText={true}
            text="Loading token details..."
          />
        </Box>
      </PageWrapper>
    );
  }

  if (!finalSelectedToken && processedPortfolio) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center" padding="m">
          <CustomText color="bodyTextColor" textAlign="center" marginBottom="m">
            Token not found
          </CustomText>
          <CustomText
            color="disabledTextColor"
            textAlign="center"
            marginBottom="m"
            fontSize={12}
          >
            Token ID: {tokenId}
          </CustomText>
          <CustomText
            color="disabledTextColor"
            textAlign="center"
            marginBottom="m"
            fontSize={12}
          >
            Available tokens: {allTokens?.length || 0}
          </CustomText>
          <CustomButton text="Go Back" onPress={handleBack} width={120} />
        </Box>
      </PageWrapper>
    );
  }

  if (!finalSelectedToken) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ZapLoader
            size={100}
            showText={true}
            text="Loading token details..."
          />
        </Box>
      </PageWrapper>
    );
  }

  const userBalance = finalSelectedToken.balance;
  const userBalanceValue = finalSelectedToken.totalUsdValue;
  const change24h = finalSelectedToken.change || 0;
  const change24hValue = userBalanceValue * (change24h / 100);

  return (
    <PageWrapper>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="l"
        paddingBottom="m"
        paddingTop="m"
      >
        <CustomButton
          bgColor="transparent"
          onPress={handleBack}
          width={40}
          height={40}
          leadingIcon={<ArrowLeft2 size={24} color="white" />}
        />

        <Box flexDirection="row" alignItems="center">
          <Box marginRight="s">
            <CryptoIcon
              image={finalSelectedToken.image}
              size={32}
              symbol={finalSelectedToken.symbol}
            />
          </Box>
          <CustomText variant="header" fontSize={18} color="white">
            {finalSelectedToken.name || finalSelectedToken.symbol}
          </CustomText>
        </Box>

        <Box flexDirection="row" alignItems="center" gap="m">
          <Pressable onPress={handleFavorite}>
            <Star
              size={20}
              color={isFavorite ? "yellow" : "white"}
              fill={isFavorite ? "yellow" : "transparent"}
            />
          </Pressable>
          <Bell size={20} color="white" />
        </Box>
      </Box>
      {/* Sticky Tab Bar */}
      {isTabSticky && (
        <Box
          position="absolute"
          top={insets.top + 10}
          left={0}
          right={0}
          zIndex={100}
          backgroundColor="mainBackgroundColor"
          paddingVertical="s"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            marginBottom="s"
            paddingHorizontal="l"
          >
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <ArrowLeft2 size={24} color="white" />
            </Pressable>

            <Box flexDirection="row" alignItems="center">
              <Box marginRight="s">
                <CryptoIcon
                  image={finalSelectedToken.image}
                  size={24}
                  symbol={finalSelectedToken.symbol}
                />
              </Box>
              <CustomText variant="header" fontSize={16} color="white">
                {finalSelectedToken.name || finalSelectedToken.symbol}
              </CustomText>
            </Box>

            <Box flexDirection="row" alignItems="center" gap="m">
              <Pressable onPress={handleFavorite}>
                <Star
                  size={18}
                  color={isFavorite ? "yellow" : "white"}
                  fill={isFavorite ? "yellow" : "transparent"}
                />
              </Pressable>
              <Bell size={18} color="white" />
            </Box>
          </Box>

          {/* Sticky Tabs */}
          <Box
            flexDirection="row"
            alignItems="center"
            width="100%"
            position="relative"
            height={40}
          >
            <Pressable
              onPress={() => handleTabSwitch("asset")}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <CustomText
                variant="body"
                fontSize={14}
                color={
                  activeTab === "asset"
                    ? "headerTextColor"
                    : "disabledTextColor"
                }
              >
                Asset Info
              </CustomText>
              <Box
                height={2}
                backgroundColor="disabledTextColor"
                width="100%"
              />
            </Pressable>
            <Pressable
              onPress={() => handleTabSwitch("history")}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <CustomText
                variant="body"
                fontSize={14}
                color={
                  activeTab === "history"
                    ? "headerTextColor"
                    : "disabledTextColor"
                }
              >
                History
              </CustomText>
              <Box
                height={2}
                backgroundColor="disabledTextColor"
                width="100%"
              />
            </Pressable>

            {/* Animated Underline */}
            <Animated.View
              style={{
                position: "absolute",
                bottom: 0,
                height: 3,
                backgroundColor: theme.colors.secondaryColor,
                borderRadius: 1.5,
                width: "50%",
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, SCREEN_WIDTH * 0.5],
                    }),
                  },
                ],
              }}
            />
          </Box>
        </Box>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primaryColor}
            colors={[theme.colors.primaryColor]}
          />
        }
        contentContainerStyle={{
          paddingBottom: showStickyActions ? 120 : 20, // Add space for sticky actions
        }}
      >
        <Box height={20} />
        {/* Gradient Background Section - Matching Home Page */}
        <LinearGradient
          colors={["rgba(96, 69, 255, 0)", "rgba(96, 69, 255, 1)"]}
          start={{ x: 0, y: 0.45 }}
          end={{ x: 0, y: 1.4 }}
          style={{
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Balance Section - Matching Home Page BalanceCard */}
          <BalanceCard
            portfolioValue={userBalanceValue || 0}
            portfolioChange={0} // We don't have change data from the API
            portfolioChangePercentage={0} // We don't have change data from the API
          />

          {/* Action Buttons - Using Reusable Component */}
          <Box mt="xl" mb="l">
            <ActionButtons
              onReceive={() => handleAction("receive")}
              onSend={() => handleAction("send")}
              onTrade={() => handleAction("trade")}
              onSwap={() => handleAction("swap")}
              size={50}
              iconSize={18}
              textSize={11}
              backgroundColor="rgba(255,255,255,0.2)"
              textColor="white"
              showLabels={true}
            />
          </Box>
        </LinearGradient>

        {/* Tabs Section */}
        <Box
          flexDirection="row"
          alignItems="center"
          marginBottom="l"
          marginTop="m"
          width="100%"
          position="relative"
          height={40}
        >
          <Pressable
            onPress={() => handleTabSwitch("asset")}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <CustomText
              variant="body"
              fontSize={14}
              color={
                activeTab === "asset" ? "headerTextColor" : "disabledTextColor"
              }
            >
              Asset Info
            </CustomText>
            <Box height={2} backgroundColor="disabledTextColor" width="100%" />
          </Pressable>
          <Pressable
            onPress={() => handleTabSwitch("history")}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <CustomText
              variant="body"
              fontSize={14}
              color={
                activeTab === "history"
                  ? "headerTextColor"
                  : "disabledTextColor"
              }
            >
              History
            </CustomText>
            <Box height={2} backgroundColor="disabledTextColor" width="100%" />
          </Pressable>

          {/* Animated Underline */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              height: 3,
              backgroundColor: theme.colors.secondaryColor,
              borderRadius: 1.5,
              width: "50%",
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCREEN_WIDTH * 0.5],
                  }),
                },
              ],
            }}
          />
        </Box>

        {/* Content based on active tab */}
        {activeTab === "asset" ? (
          <Box paddingHorizontal="m">
            {/* Token Graph Component */}
            {historicalRates?.data?.rates &&
            historicalRates.data.rates.length > 0 ? (
              <TokenGraph
                symbol={tokenDetails?.tokenDetails?.symbol || finalSelectedToken.symbol}
                price={formatCurrency(
                  getLatestRate(
                    historicalRates.data.rates,
                    graphCurrency,
                    ngnSellRate
                  )
                )}
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
                  tokenDetails?.tokenDetails?.logo || finalSelectedToken.image
                }
                ngnSellRate={ngnSellRate}
              />
            ) : (
              <Box
                backgroundColor="modalBackgroundColor"
                borderRadius={20}
                padding="l"
                marginBottom="l"
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
                  {isTokenDetailsLoading
                    ? "Loading chart data..."
                    : "No historical data available"}
                </CustomText>
              </Box>
            )}
            <Box marginBottom="l" />
            {/* Enhanced Your Balance */}
            <Box
              backgroundColor="modalBackgroundColor"
              borderRadius={20}
              padding="l"
              paddingBottom="s"
              marginBottom="l"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="m"
              >
                <CustomText
                  variant="body"
                  fontSize={15}
                  color="placeholderTextColor"
                >
                  Your Balance
                </CustomText>
                <CustomText
                  color="placeholderTextColor"
                  fontSize={15}
                  fontWeight="bold"
                >
                  Value
                </CustomText>
              </Box>

              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="m"
              >
                <Box flexDirection="row" alignItems="flex-start" flex={1}>
                  <CryptoIcon
                    image={finalSelectedToken.image}
                    size={30}
                    symbol={finalSelectedToken.symbol}
                  />
                  <Box
                    marginLeft="s"
                    flexDirection="row"
                    alignItems="flex-start"
                  >
                    <CustomText
                      color="headerTextColor"
                      fontSize={18}
                      variant="header"
                    >
                      {formatBalance(userBalance, finalSelectedToken.decimals)}
                    </CustomText>
                    <CustomText
                      color="bodyTextColor"
                      fontSize={16}
                      style={{ marginLeft: 3 }}
                    >
                      {finalSelectedToken.symbol}
                    </CustomText>
                  </Box>
                </Box>
                <Box alignItems="flex-end">
                  <CustomText
                    variant="header"
                    fontSize={20}
                    color="headerTextColor"
                  >
                    {formatCurrency(userBalanceValue)}
                  </CustomText>
                  <Box flexDirection="row" alignItems="center" mt="s">
                    <CustomText color="success" fontSize={13} marginLeft="s">
                      {formatPercentage(change24h)}
                    </CustomText>
                  </Box>
                </Box>
              </Box>
            </Box>
            {/* Enhanced About Section */}
            <Box marginBottom="l">
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
                  About {finalSelectedToken.symbol}
                </CustomText>
              </Box>
              <CustomText
                color="placeholderTextColor"
                variant="body"
                fontSize={15}
                lineHeight={24}
              >
                {tokenDetails?.tokenDetails?.description ||
                  tokenDetails?.tokenMetrics?.description ||
                  "No description available for this token."}
              </CustomText>
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
            </Box>
            <CustomText
              variant="bodyBold"
              fontSize={18}
              color="headerTextColor"
              marginVertical="l"
            >
              Stats
            </CustomText>
            {/* Enhanced Stats Section */}
            <Box
              backgroundColor="modalBackgroundColor"
              borderRadius={20}
              padding="l"
              marginBottom="l"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {/* Detailed Stats */}
              {tokenDetails?.tokenMetrics?.rank ? (
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
                    #{tokenDetails?.tokenMetrics?.rank || "N/A"}
                  </CustomText>
                </Box>
              ) : null}
              {(tokenDetails?.tokenMetrics?.volume ||
                historicalRates?.data?.rates) && (
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
                    {formatLargeNumber(
                      tokenDetails?.tokenMetrics?.volume ||
                        getLatestMarketData(historicalRates?.data?.rates)
                          .volume,
                      graphCurrency,
                      ngnSellRate
                    )}
                  </CustomText>
                </Box>
              )}
              {(tokenDetails?.tokenMetrics?.marketCap ||
                historicalRates?.data?.rates) && (
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
                    {formatLargeNumber(
                      tokenDetails?.tokenMetrics?.marketCap ||
                        getLatestMarketData(historicalRates?.data?.rates)
                          .marketCap,
                      graphCurrency,
                      ngnSellRate
                    )}
                  </CustomText>
                </Box>
              )}
              {tokenDetails?.tokenMetrics?.totalSupply ? (
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
                    {tokenDetails?.tokenMetrics?.totalSupply
                      ? formatCurrency(tokenDetails.tokenMetrics.totalSupply)
                      : "N/A"}
                  </CustomText>
                </Box>
              ) : null}

              {tokenDetails?.tokenMetrics?.circulatingSupply ? (
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
                    {tokenDetails?.tokenMetrics?.circulatingSupply
                      ? formatCurrency(
                          tokenDetails.tokenMetrics.circulatingSupply
                        )
                      : "N/A"}
                  </CustomText>
                </Box>
              ) : null}

              {tokenDetails?.tokenMetrics?.ath ? (
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
                    {tokenDetails?.tokenMetrics?.ath
                      ? formatCurrency(tokenDetails.tokenMetrics.ath)
                      : "N/A"}
                  </CustomText>
                </Box>
              ) : null}

              {tokenDetails?.tokenMetrics?.atl ? (
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
                    {tokenDetails?.tokenMetrics?.atl
                      ? formatCurrency(tokenDetails.tokenMetrics.atl)
                      : "N/A"}
                  </CustomText>
                </Box>
              ) : null}
            </Box>
            {/* Enhanced Top Stories */}
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
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
                  // Navigate to full news page
                  router.push(`/dashboard/home/token-details/${tokenId}/news`);
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
            {tokenDetails?.tokenNews && tokenDetails.tokenNews.length > 0 ? (
              tokenDetails.tokenNews
                .slice(0, 3)
                .map((article: any, index: number) => (
                  <Pressable
                    key={article.id || index}
                    onPress={() => {
                      // Navigate to full article page
                      router.push(
                        `/dashboard/home/token-details/${tokenId}/news/${
                          article.id || index
                        }`
                      );
                    }}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      marginBottom: index !== 2 ? 0 : 50,
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
                              verticalAlign="middle"
                              fontSize={14}
                              height="100%"
                            >
                              {article.source?.name || "News"}
                            </CustomText>
                            <CustomText
                              color="placeholderTextColor"
                              variant="bodyMedium"
                              fontSize={14}
                            >
                              {" "}
                              •{" "}
                              {article.publishedAt
                                ? formatDate(article.publishedAt)
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

                          <Box flexDirection="row" alignItems="center">
                            <CustomText
                              color="placeholderTextColor"
                              variant="bodyMedium"
                              fontSize={14}
                            >
                              {article.publishedAt
                                ? new Date(
                                    article.publishedAt
                                  ).toLocaleTimeString()
                                : "Now"}
                            </CustomText>
                            <CustomText
                              color="placeholderTextColor"
                              variant="bodyMedium"
                              fontSize={14}
                            >
                              {" "}
                              •{" "}
                              {article.publishedAt
                                ? formatDate(article.publishedAt)
                                : "Today"}
                            </CustomText>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Pressable>
                ))
            ) : (
              <Box
                backgroundColor="modalBackgroundColor"
                borderRadius={20}
                padding="xl"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
                mb="xl"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <CustomText
                  variant="bodyBold"
                  fontSize={16}
                  color="headerTextColor"
                  marginBottom="s"
                  textAlign="center"
                >
                  No News Available
                </CustomText>
                <CustomText
                  color="bodyTextColor"
                  textAlign="center"
                  fontSize={14}
                  lineHeight={20}
                >
                  Check back later for the latest news about{" "}
                  {finalSelectedToken.symbol}
                </CustomText>
              </Box>
            )}
          </Box>
        ) : (
          <Box paddingHorizontal="m">
            {/* Transaction History Section */}
            <Box>
              {isTokenHistoryLoading ? (
                <Box mt="l">
                  {/* Skeleton loaders for transaction cards */}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TransactionCardSkeleton key={index} />
                  ))}
                </Box>
              ) : tokenHistory.length > 0 ? (
                <Box mb="xl">
                  {tokenHistory
                    .sort(
                      (a: BlockchainTransaction, b: BlockchainTransaction) =>
                        b.timestamp - a.timestamp
                    )
                    .map(
                      (transaction: BlockchainTransaction, index: number) => (
                        <>
                          {!isSameDay(
                            new Date(transaction.timestamp),
                            new Date(tokenHistory[index - 1]?.timestamp)
                          ) ? (
                            <CustomText
                              color="placeholderTextColor"
                              fontSize={14}
                              marginBottom="m"
                            >
                              {new Date(
                                transaction.timestamp
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </CustomText>
                          ) : null}
                          <TokenHistoryCard
                            transaction={transaction}
                            finalSelectedToken={finalSelectedToken}
                            index={index}
                            onPress={handleTransactionPress}
                          />
                        </>
                      )
                    )}
                </Box>
              ) : (
                <Box alignItems="center" justifyContent="center">
                  {/* Empty State Icon - ThemedGlassIcon */}
                  <Box marginBottom="l">
                    <ThemedGlassIcon />
                  </Box>

                  <CustomText
                    variant="bodyBold"
                    fontSize={20}
                    color="headerTextColor"
                    marginBottom="s"
                    textAlign="center"
                  >
                    No History
                  </CustomText>
                  <CustomText
                    color="placeholderTextColor"
                    textAlign="center"
                    fontSize={16}
                    lineHeight={24}
                    marginBottom="l"
                  >
                    You are yet to perform any transaction on{" "}
                    {finalSelectedToken?.symbol}
                  </CustomText>

                  {/* Buy Token Button */}
                  <CustomButton
                    text={`Buy ${finalSelectedToken?.symbol}`}
                    onPress={() => handleAction("buy")}
                    width={120}
                    borderRadius={25}
                    bgColor={theme.colors.primaryColor}
                    fontSize={16}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          transform: [
            {
              translateY: stickyAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [80, 0],
              }),
            },
          ],
          opacity: stickyAnim,
        }}
      >
        <Box
          backgroundColor="mainBackgroundColor"
          borderTopWidth={1}
          borderTopColor="borderColor"
          paddingHorizontal="m"
          paddingVertical="l"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <Box
            flexDirection="row"
            justifyContent="space-around"
            alignItems="center"
          >
            {/* QR Code Button */}
            <Pressable
              onPress={() => handleAction("receive")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                alignItems: "center",
                justifyContent: "center",
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: theme.colors.borderColor,
              })}
            >
              <ThemedQrCodeIcon
                width={30}
                height={30}
                darkModeColor="black"
                lightModeColor="black"
              />
            </Pressable>

            {/* Send Button */}
            <Pressable
              onPress={() => handleAction("send")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.primaryColor,
                paddingHorizontal: 24,
                paddingVertical: 18,
                borderRadius: 30,
                flex: 1,
                marginHorizontal: 16,
                height: 70,
              })}
            >
              <SendHorizonal
                size={22}
                color="white"
                style={{ marginRight: 6 }}
              />
              <CustomText
                variant="body"
                fontSize={16}
                color="white"
                fontWeight="600"
              >
                Send
              </CustomText>
            </Pressable>

            {/* Swap Button */}
            <Pressable
              onPress={() => handleAction("swap")}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.primaryColor,
                paddingHorizontal: 24,
                paddingVertical: 18,
                borderRadius: 30,
                flex: 1,
                height: 70,
              })}
            >
              <ThemedSwapIcon
                width={22}
                height={22}
                darkModeColor="white"
                lightModeColor="white"
                style={{ marginRight: 8 }}
              />
              <CustomText
                variant="body"
                fontSize={16}
                color="white"
                fontWeight="600"
              >
                Swap
              </CustomText>
            </Pressable>
          </Box>
        </Box>
      </Animated.View>

      {/* QR Code Bottom Sheet */}
      {finalSelectedToken && (
        <QRCodeBottomSheet
          bottomSheetRef={receiveBottomSheetRef as React.RefObject<BottomSheet>}
          chain={finalSelectedToken.chainName || "Unknown"}
          symbol={finalSelectedToken.symbol || "Unknown"}
          address={walletAddress || "Loading address..."}
          logoUrl={finalSelectedToken.image}
        />
      )}

      {/* Transaction Details Bottom Sheet */}
      <TransactionDetailsBottomSheet
        ref={transactionDetailsRef}
        transaction={selectedTransaction}
        selectedToken={finalSelectedToken}
        visible={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </PageWrapper>
  );
};

export default TokenDetails;
