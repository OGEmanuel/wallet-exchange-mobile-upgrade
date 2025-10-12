import DashboardActionItem from "@/components/dashboard/DashboardActionItem";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Pressable, RefreshControl } from "react-native";
// import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  ThemedAccountFillIcon,
  ThemedQrCodeIcon,
  ThemedScanIcon,
  ThemedSendIcon,
  ThemedSettingsOutlineIcon,
  ThemedSwap1Icon,
} from "@/assets/svg/wallet-icons-components";
import { DebitCardComponent } from "@/assets/svg/wallet-icons-components/DebitCardIcon";
import SelectUserTokens from "@/components/bottomsheets/recieve/SelectTokens";
import SelectTokenBottomSheet from "@/components/bottomsheets/send/SelectTokens";
import AssetsSection from "@/components/dashboard/AssetsSection";
import BalanceCard from "@/components/dashboard/BalanceCard";
import StickyHeader from "@/components/dashboard/StickyHeader";
import { AppBar } from "@/components/general";
import Identicon from "@/components/general/Identicon";
import AppBottomSheet from "@/components/Modals/AppBottomSheet";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ProcessedPortfolio } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";
import Svg, { Path, SvgProps } from "react-native-svg";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [processedPortfolio, setProcessedPortfolio] =
    useState<ProcessedPortfolio | null>(null);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const theme = useTheme<Theme>();
  const { sendTokenRef: bottomsheetRef, recieveTokenRef } =
    useBottomSheetRefs();
  const {
    retryPendingWallets,
    mainUserWalletGroup,
    portfolio,
    refreshPortfolio,
    isLoading,
    isWalletAuthenticated,
    currentWalletUser,
    error: walletError,
  } = useWallet();

  // Handle pull-to-refresh
  const onRefresh = async () => {
    try {
      console.log("🔄 Starting portfolio refresh...");
      setIsRefreshing(true);
      await refreshPortfolio();
      console.log("🔄 Portfolio refresh completed");
      
      // Force re-processing of portfolio data
      if (portfolio) {
        console.log("🔄 Re-processing portfolio data...");
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error("Failed to refresh portfolio:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Debug wallet state
  console.log("🔍 Wallet state:", {
    isWalletAuthenticated,
    currentWalletUser,
    mainUserWalletGroup: mainUserWalletGroup ? "exists" : "null",
    portfolio: portfolio ? "exists" : "null",
    isLoading,
    walletError,
  });

  // Process portfolio data when it changes
  useEffect(() => {
    console.log("🔄 Portfolio useEffect triggered, portfolio:", portfolio ? "exists" : "null", "refreshTrigger:", refreshTrigger);
    if (portfolio) {
      const processPortfolio = async () => {
        try {
          console.log(
            "📊 Raw portfolio data received:",
            JSON.stringify(portfolio, null, 2)
          );
          setIsPortfolioLoading(true);
          setPortfolioError(null);
          const processed = await PortfolioService.processPortfolioData(
            portfolio
          );
          console.log(
            "📊 Processed portfolio data:",
            JSON.stringify(processed, null, 2)
          );
          setProcessedPortfolio(processed);
        } catch (error) {
          console.error("Failed to process portfolio data:", error);
          setPortfolioError("Failed to process portfolio data");
        } finally {
          setIsPortfolioLoading(false);
        }
      };

      processPortfolio();
    }
  }, [portfolio, refreshTrigger]);

  // Track if portfolio has been fetched to prevent infinite loops
  const hasFetchedPortfolio = useRef(false);

  // Load portfolio data on focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔍 useFocusEffect triggered:", {
        mainUserWalletGroup: mainUserWalletGroup ? "exists" : "null",
        isLoading,
        hasFetchedPortfolio: hasFetchedPortfolio.current,
      });

      if (mainUserWalletGroup && !isLoading && !hasFetchedPortfolio.current) {
        console.log("🔍 Calling refreshPortfolio...");
        hasFetchedPortfolio.current = true;
        refreshPortfolio();
      }
    }, [mainUserWalletGroup, isLoading])
  );

  // Reset fetch flag when portfolio changes
  useEffect(() => {
    if (portfolio) {
      hasFetchedPortfolio.current = false;
    }
  }, [portfolio]);

  // Animation values for staggered card stack entrance
  const cardStackAnimations = useRef([
    new Animated.Value(0), // Start with 0 opacity
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // React Native SVG Components

  const Card1Component = (props: SvgProps) => (
    <Svg width={297} height={120} viewBox="0 0 297 16" fill="none" {...props}>
      <Path
        d="M0 11.75C0 5.26 5.26 0 11.75 0h273.5C291.739 0 297 5.26 297 11.75V16H0v-4.25z"
        fill="#fff"
        opacity={0.9}
      />
    </Svg>
  );

  const Card2Component = (props: SvgProps) => (
    <Svg width={268} height={105} viewBox="0 0 268 18" fill="none" {...props}>
      <Path
        d="M0 10.617C0 4.753 4.753 0 10.617 0h246.766C263.247 0 268 4.753 268 10.617V18H0v-7.383z"
        fill="#fff"
        opacity={0.6}
      />
    </Svg>
  );
  // const navigation = useNavigation<DrawerNavigationProp<any>>();

  // Retry pending wallets when user enters wallet home
  useEffect(() => {
    retryPendingWallets();
  }, [retryPendingWallets]);

  // Animate card stack sliding in one after another - only when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const animateCardStack = () => {
        cardStackAnimations.forEach((animation, index) => {
          Animated.timing(animation, {
            toValue: 1,
            duration: 600,
            delay: index * 200, // Stagger each card by 200ms
            useNativeDriver: true,
          }).start();
        });
      };

      // Start animation after a short delay
      const timer = setTimeout(animateCardStack, 500);
      return () => clearTimeout(timer);
    }, [cardStackAnimations])
  );

  // Prevent back navigation to setup screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Prevent going back to setup - just return true to consume the event
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <PageWrapper>
      <StickyHeader
        isVisible={showStickyHeader}
        portfolioValue={processedPortfolio?.totalUsdValue || 0}
        portfolioChange={0} // We don't have change data from the API
        portfolioChangePercentage={0} // We don't have change data from the API
      />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        decelerationRate={10000}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          // Show sticky header when scrolled past the balance section (approximately 200px)
          setShowStickyHeader(scrollY > 200);
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primaryColor}
            colors={[theme.colors.primaryColor]}
          />
        }
      >
        <AppBar
          title={
            <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
              <Box
                width={24}
                height={24}
                borderRadius={4}
                marginRight="s"
                overflow="hidden"
                flexDirection="row"
              >
                <Identicon
                  value={mainUserWalletGroup?.walletGroupId?.name || "Wallet"}
                  size={24}
                />
              </Box>
              <CustomText variant="body" fontSize={16} color="white">
                {mainUserWalletGroup?.walletGroupId?.name || "Wallet"}
              </CustomText>
              <ChevronDown size={16} color="white" style={{ marginLeft: 4 }} />
            </Pressable>
          }
          leading={
            <Pressable>
              <ThemedSettingsOutlineIcon
                darkModeColor={theme.colors.white}
                lightModeColor={theme.colors.white}
                width={24}
                height={24}
              />
            </Pressable>
          }
          trailing={
            <Pressable>
              <ThemedScanIcon
                darkModeColor={theme.colors.white}
                lightModeColor={theme.colors.white}
                width={24}
                height={24}
              />
            </Pressable>
          }
        />
        <LinearGradient
          colors={["rgba(96, 69, 255, 0)", "rgba(96, 69, 255, 1)"]}
          start={{ x: 0, y: 0.45 }}
          end={{ x: 0, y: 1.4 }}
          style={{
            flex: 0.6,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            overflow: "hidden",
          }}
        >
          <Box height={15} />
          <BalanceCard
            portfolioValue={processedPortfolio?.totalUsdValue || 0}
            portfolioChange={0} // We don't have change data from the API
            portfolioChangePercentage={0} // We don't have change data from the API
            walletName={mainUserWalletGroup?.walletGroupId?.name || "Wallet"}
          />
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            paddingHorizontal="xl"
            mt="xl"
          >
            <DashboardActionItem
              icon={
                <ThemedQrCodeIcon
                  width={20}
                  height={20}
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              }
              title="Recieve"
              action={() => recieveTokenRef.current?.snapToIndex(1)}
            />
            <Box width={20} />
            <DashboardActionItem
              icon={
                <ThemedSendIcon
                  width={20}
                  height={20}
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              }
              title="Send"
              action={() => bottomsheetRef.current?.snapToIndex(0)}
            />
            <Box width={20} />
            <DashboardActionItem
              icon={
                <ThemedAccountFillIcon
                  width={20}
                  height={20}
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              }
              title="Trade"
              action={() => {}}
            />
            <Box width={20} />
            <DashboardActionItem
              icon={
                <ThemedSwap1Icon
                  width={20}
                  height={20}
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              }
              title="Swap"
              action={() => {}}
            />
          </Box>

          <Box
            width="100%"
            alignItems="center"
            overflow="hidden"
            justifyContent="flex-end"
            flex={1}
          >
            {/* Card Stack with Staggered Animation */}
            <Box
              position="relative"
              width="100%"
              height={120}
              alignItems="center"
            >
              {/* Card 3 - Back (cards) - 268px × 18px */}
              <Animated.View
                style={{
                  position: "absolute",
                  opacity: cardStackAnimations[2],
                  zIndex: 97,
                  transform: [
                    {
                      translateY: cardStackAnimations[2].interpolate({
                        inputRange: [-1, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                }}
              >
                <Card2Component />
              </Animated.View>

              {/* Card 2 - Middle (cards-1) - 297px × 16px */}
              <Animated.View
                style={{
                  position: "absolute",
                  opacity: cardStackAnimations[1],
                  zIndex: 98,
                  transform: [
                    {
                      translateY: cardStackAnimations[1].interpolate({
                        inputRange: [-1, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                }}
              >
                <Card1Component />
              </Animated.View>

              {/* Card 1 - Front (debitCard) - 327px × 120px */}
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: 0,
                  opacity: cardStackAnimations[0],
                  zIndex: 99,
                  transform: [
                    {
                      translateY: cardStackAnimations[0].interpolate({
                        inputRange: [-1, 1],
                        outputRange: [100, 0],
                      }),
                    },
                  ],
                }}
              >
                <Pressable
                  onPress={() => {
                    router.push("/dashboard/home/wallet-home/cards");
                  }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <DebitCardComponent />
                </Pressable>
              </Animated.View>
            </Box>
          </Box>
        </LinearGradient>

        <Box flex={0.4} paddingHorizontal="m">
          {/* Debug info - remove this later */}
          {/* {__DEV__ && (
            <Box mb="m" p="s" bg="secondaryBackgroundColor" borderRadius={8}>
              <CustomText color="white" fontSize={12}>
                Debug: Portfolio {portfolio ? "exists" : "null"}, Processed{" "}
                {processedPortfolio ? "exists" : "null"}, Loading{" "}
                {isLoading ? "yes" : "no"}
              </CustomText>
              <CustomButton
                onPress={() => {
                  console.log("🔍 Manual portfolio refresh triggered");
                  refreshPortfolio();
                }}
                text="Refresh Portfolio"
                width={120}
                height={30}
                fontSize={10}
              />
            </Box>
          )} */}

          <AssetsSection
            mainUserWalletGroup={mainUserWalletGroup}
            portfolio={processedPortfolio}
            isLoading={isPortfolioLoading || isLoading}
            error={portfolioError}
            onRefreshPortfolio={refreshPortfolio}
            onManagePress={() => {
              // Navigate to manage assets page
            }}
            onRetry={async () => {
              try {
                setPortfolioError(null);
                await refreshPortfolio();
              } catch (err) {
                console.error("Failed to retry portfolio:", err);
                setPortfolioError("Failed to refresh portfolio");
              }
            }}
            onLogin={() => {
              // Navigate to login page
              router.push("/setup");
            }}
          />
        </Box>
      </ScrollView>

      <AppBottomSheet isVisible={isOpen} onClose={() => setIsOpen(false)}>
        <Box>
          <CustomText>Recieve Tokens</CustomText>
        </Box>
      </AppBottomSheet>
      <SelectTokenBottomSheet ref={bottomsheetRef} />
      <SelectUserTokens ref={recieveTokenRef} />
    </PageWrapper>
  );
};

export default Home;
