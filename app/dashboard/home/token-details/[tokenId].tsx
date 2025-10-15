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
import { useDispatch, useSelector } from "react-redux";

import {
  ThemedQrCodeIcon,
  ThemedSwapIcon,
} from "@/assets/svg/wallet-icons-components";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import QRCodeBottomSheet from "@/components/bottomsheets/QRCodeBottomSheet";
import ActionButtons from "@/components/dashboard/ActionButtons";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import ZapLoader from "@/components/general/ZapLoader";
import { PortfolioService } from "@/services/portfolio.service";
import { useChains } from "@/src/core/chains/chains-context";
import AddressesStorage from "@/src/core/storage/addresses-storage";
import { formatCurrency, formatDate } from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppRootState } from "@/state";
import {
  setAllSupportedTokens,
  setPortfolioError,
  setPortfolioLoading,
  setProcessedPortfolio,
  setRawPortfolio,
} from "@/state/reducers/portfolio.reducer";
import {
  selectAllSupportedTokens,
  selectProcessedPortfolio,
  selectTokenBySupportedCurrencyId,
} from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { ArrowLeft2, ArrowUp3 } from "iconsax-react-nativejs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

// CryptoIcon component for token images
const CryptoIcon = ({
  image,
  size = 32,
  symbol,
}: {
  image?: string;
  size?: number;
  symbol?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      width={size}
      height={size}
      borderRadius={size / 2}
      overflow="hidden"
      justifyContent="center"
      alignItems="center"
      borderWidth={0}
      style={{ backgroundColor: "transparent" }}
    >
      {image && !imageError ? (
        <SvgUri
          uri={image}
          width={size - 4}
          height={size - 4}
          onError={() => {
            console.log("Failed to load token image:", image);
            setImageError(true);
          }}
        />
      ) : symbol ? (
        <CustomText fontSize={size * 0.4} color="white" fontWeight="bold">
          {symbol.charAt(0)}
        </CustomText>
      ) : (
        <ZapLogo />
      )}
    </Box>
  );
};

const TokenDetails = () => {
  const { tokenId: rawTokenId } = useLocalSearchParams();

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
  const { portfolio, mainUserWalletGroup } = useWallet();
  const { getChainById, getChainBySymbol } = useChains();
  // Remove useMarket hook - we'll use SDK directly
  const dispatch = useDispatch();

  // Redux state
  const processedPortfolio = useSelector(selectProcessedPortfolio);
  const selectedToken = useSelector((state: AppRootState) =>
    selectTokenBySupportedCurrencyId(state, tokenId as string)
  );

  // Fallback: manually find token if selector doesn't work
  const allTokens = useSelector(selectAllSupportedTokens);
  const fallbackToken = allTokens?.find((token) => {
    // Try multiple matching strategies
    const matchesId = token.id === tokenId;
    const matchesSupportedId = token.supportedCurrencyId?._id === tokenId;
    const matchesSupportedIdString =
      token.supportedCurrencyId?._id?.toString() === tokenId;
    const matchesIdString = token.id?.toString() === tokenId;

    return (
      matchesId ||
      matchesSupportedId ||
      matchesSupportedIdString ||
      matchesIdString
    );
  });

  const finalSelectedToken = selectedToken || fallbackToken;

  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [isTokenDetailsLoading, setIsTokenDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"asset" | "history">("asset");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "24h" | "W" | "M" | "6M" | "1Y"
  >("W");
  const [isFavorite, setIsFavorite] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const insets = useSafeAreaInsets();

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

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchTokenDetailsCallback();
    } catch (error) {
      console.error("❌ Failed to refresh token details:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTokenDetailsCallback]);

  // Process portfolio data when it changes and store in Redux
  useEffect(() => {
    if (portfolio) {
      const processPortfolio = async () => {
        try {
          setIsPortfolioLoading(true);
          dispatch(setPortfolioLoading(true));
          const processed = await PortfolioService.processPortfolioData(
            portfolio
          );
          // Store in Redux
          dispatch(setRawPortfolio(portfolio));
          dispatch(setProcessedPortfolio(processed));
          // Also store all tokens for send/receive and manage token lists
          dispatch(setAllSupportedTokens(processed.assets || []));
        } catch (error) {
          console.error("❌ Failed to process portfolio data:", error);
          dispatch(setPortfolioError("Failed to process portfolio data"));
        } finally {
          setIsPortfolioLoading(false);
          dispatch(setPortfolioLoading(false));
        }
      };

      processPortfolio();
    }
  }, [portfolio, tokenId, dispatch]);

  // Force portfolio processing if no tokens are available
  useEffect(() => {
    if (!allTokens || allTokens.length === 0) {
      if (portfolio) {
        const processPortfolio = async () => {
          try {
            const processed = await PortfolioService.processPortfolioData(
              portfolio
            );
            dispatch(setAllSupportedTokens(processed.assets || []));
          } catch (error) {
            console.error("❌ Failed to force process portfolio:", error);
          }
        };
        processPortfolio();
      }
    }
  }, [allTokens, portfolio, dispatch]);

  // Emergency fallback: Create a dummy token if none found

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

  // Helper function to get the numeric chainId from the chain string
  const getNumericChainId = (chainIdString: string): number | null => {
    // First try to find by chain ID (if it's already a numeric string)
    const numericChainId = parseInt(chainIdString, 10);
    if (!isNaN(numericChainId)) {
      return numericChainId;
    }

    // Try to find by chain symbol
    const chainBySymbol = getChainBySymbol(chainIdString);
    if (chainBySymbol) {
      return chainBySymbol.chainId;
    }

    // Try to find by chain ID (if it's a MongoDB ObjectId)
    const chainById = getChainById(chainIdString);
    if (chainById) {
      return chainById.chainId;
    }

    console.warn(`Could not find chain for: ${chainIdString}`);
    return null;
  };

  // Get wallet address for the selected token's chain
  const getWalletAddress = async () => {
    if (!finalSelectedToken || !mainUserWalletGroup?._id) return;

    try {
      const numericChainId = getNumericChainId(finalSelectedToken.chainId);
      if (!numericChainId) {
        setWalletAddress("Chain not supported");
        return null;
      }

      const storedAddress = await AddressesStorage.getAddressForChain(
        mainUserWalletGroup._id,
        numericChainId
      );

      if (storedAddress?.address) {
        setWalletAddress(storedAddress.address);
        return storedAddress.address;
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
    action: "receive" | "send" | "trade" | "swap"
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
        router.replace(`/dashboard/home/wallet-home/exchange`);
        // Navigate to swap flow
        break;
    }
  };

  const formatBalance = (balance: number, decimals: number) => {
    return PortfolioService.formatBalance(balance, decimals);
  };

  const formatPercentage = (value: number) => {
    return PortfolioService.formatPercentage(value);
  };

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
                variant="bodyBold"
                fontSize={16}
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
                variant="bodyBold"
                fontSize={16}
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
          <Box
            width="100%"
            alignItems="center"
            justifyContent="center"
            position="relative"
            paddingHorizontal="xl"
            paddingBottom="l"
          >
            {/* Center content */}
            <Box alignItems="center" justifyContent="center" flex={1}>
              <CustomText
                fontSize={13}
                variant="body"
                color="white"
                opacity={0.8}
              >
                Your Balance
              </CustomText>

              <CustomText
                fontSize={30}
                variant="header"
                marginVertical="s"
                color="white"
              >
                {formatCurrency(userBalanceValue)}
              </CustomText>

              <Box
                width={185}
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                height={36}
                borderRadius={24}
                paddingHorizontal="s"
                bg="secondaryBackgroundColor"
              >
                <ArrowUp3 size={17} color="#35B592" variant="Bold" />
                <CustomText
                  fontSize={13}
                  style={{ marginHorizontal: 3 }}
                  color="white"
                >
                  {formatCurrency(change24hValue)}
                  {change24hValue > 0 ? "+" : ""}
                </CustomText>

                <CustomText fontSize={13} color="white">
                  {" "}
                  <CustomText fontSize={13} style={{ color: "#35B592" }}>
                    {change24h.toFixed(2)}%
                  </CustomText>{" "}
                  in 24H
                </CustomText>
              </Box>
            </Box>
          </Box>

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
              variant="bodyBold"
              fontSize={16}
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
              variant="bodyBold"
              fontSize={16}
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
            {/* Enhanced Price Chart Section */}
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
              <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="l"
              >
                <Box flex={1}>
                  <Box flexDirection="row" alignItems="center" mb="s">
                    <CryptoIcon
                      image={finalSelectedToken.image}
                      size={32}
                      symbol={finalSelectedToken.symbol}
                    />
                    <CustomText
                      variant="body"
                      ml="s"
                      fontSize={18}
                      color="headerTextColor"
                    >
                      {tokenDetails?.tokenDetails?.name ||
                        finalSelectedToken.name ||
                        finalSelectedToken.symbol}
                    </CustomText>
                  </Box>
                  <CustomText
                    variant="subheader"
                    fontSize={24}
                    color="headerTextColor"
                  >
                    {formatCurrency(
                      tokenDetails?.tokenMetrics?.rate ||
                        finalSelectedToken.price
                    )}
                  </CustomText>
                </Box>
                <Box
                  flex={1}
                  alignItems="flex-end"
                  justifyContent="space-between"
                >
                  <CustomText mb="s" color="success" fontSize={14}>
                    {formatPercentage(
                      tokenDetails?.tokenMetrics?.dailyChange ||
                        tokenDetails?.tokenMetrics?.change24h ||
                        finalSelectedToken.change ||
                        0
                    )}{" "}
                  </CustomText>
                  <CustomText color="bodyTextColor" fontSize={14}>
                    past week
                  </CustomText>
                </Box>
              </Box>

              {/* Enhanced Chart Area */}
              <Box height={220} borderRadius={12} marginBottom="l" padding="m">
                {historicalRates?.data?.rates &&
                historicalRates.data.rates.length > 0 ? (
                  <Box flex={1} justifyContent="center" alignItems="center">
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
                      marginBottom="m"
                    >
                      {historicalRates.data.rates.length} data points available
                    </CustomText>

                    {/* Display some key metrics from historical data */}
                    <Box width="100%" marginTop="m">
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom="s"
                      >
                        <CustomText color="placeholderTextColor" fontSize={14}>
                          Highest Price
                        </CustomText>
                        <CustomText
                          color="success"
                          fontSize={16}
                          variant="body"
                        >
                          {formatCurrency(
                            Math.max(
                              ...historicalRates.data.rates.map(
                                (r: any) => r.rate
                              )
                            )
                          )}
                        </CustomText>
                      </Box>
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom="s"
                      >
                        <CustomText color="placeholderTextColor" fontSize={14}>
                          Lowest Price
                        </CustomText>
                        <CustomText color="error" fontSize={16} variant="body">
                          {formatCurrency(
                            Math.min(
                              ...historicalRates.data.rates.map(
                                (r: any) => r.rate
                              )
                            )
                          )}
                        </CustomText>
                      </Box>
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <CustomText color="placeholderTextColor" fontSize={14}>
                          Current Price
                        </CustomText>
                        <CustomText
                          color="headerTextColor"
                          fontSize={16}
                          variant="body"
                        >
                          {formatCurrency(
                            historicalRates.data.rates[
                              historicalRates.data.rates.length - 1
                            ]?.rate || 0
                          )}
                        </CustomText>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box flex={1} justifyContent="center" alignItems="center">
                    <CustomText
                      color="headerTextColor"
                      fontSize={16}
                      fontWeight="bold"
                    >
                      Price Chart
                    </CustomText>
                    <CustomText
                      color="bodyTextColor"
                      fontSize={14}
                      marginTop="s"
                      textAlign="center"
                    >
                      Interactive chart coming soon
                    </CustomText>
                  </Box>
                )}
              </Box>

              {/* Enhanced Timeframe Selectors */}
              <Box flexDirection="row" justifyContent="space-between" gap="s">
                {["24h", "W", "M", "6M", "1Y"].map((timeframe) => (
                  <Pressable
                    key={timeframe}
                    onPress={() => setSelectedTimeframe(timeframe as any)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor:
                        selectedTimeframe === timeframe
                          ? "rgba(35, 43, 15, 1)"
                          : "transparent",
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}
                  >
                    <CustomText
                      style={{
                        color:
                          selectedTimeframe === timeframe
                            ? "rgba(199, 230, 77, 1)"
                            : "white",
                      }}
                      fontSize={13}
                      fontWeight={
                        selectedTimeframe === timeframe ? "bold" : "600"
                      }
                      textAlign="center"
                    >
                      {timeframe}
                    </CustomText>
                  </Pressable>
                ))}
              </Box>
            </Box>
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
              <Box
                paddingVertical="m"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <CustomText color="placeholderTextColor" fontSize={14}>
                  24hr Volume
                </CustomText>
                <CustomText
                  color="headerTextColor"
                  fontSize={16}
                  variant="body"
                >
                  {tokenDetails?.tokenMetrics?.volume
                    ? formatCurrency(tokenDetails.tokenMetrics.volume)
                    : "N/A"}
                </CustomText>
              </Box>
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
                  {tokenDetails?.tokenMetrics?.marketCap
                    ? formatCurrency(tokenDetails.tokenMetrics.marketCap)
                    : "N/A"}
                </CustomText>
              </Box>

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
          <Box paddingHorizontal="m" minHeight={200}>
            {/* Empty State for Transaction History */}
            {transactionHistory.length > 0 ? (
              <>{/* Transaction List */}</>
            ) : (
              <Box alignItems="center" justifyContent="center" flex={1}>
                <CustomText
                  variant="bodyBold"
                  fontSize={18}
                  color="headerTextColor"
                  marginBottom="s"
                  textAlign="center"
                >
                  No Transactions Yet
                </CustomText>
                <CustomText
                  color="placeholderTextColor"
                  textAlign="center"
                  fontSize={14}
                  lineHeight={20}
                >
                  Your transaction history will appear here once you start using
                  this token
                </CustomText>
              </Box>
            )}
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
    </PageWrapper>
  );
};

export default TokenDetails;
