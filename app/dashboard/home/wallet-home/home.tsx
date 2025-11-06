import ActionButtons from "@/components/dashboard/ActionButtons";
import Box from "@/components/general/Box";
import PageWrapper from "@/components/general/PageWrapper";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Pressable, RefreshControl } from "react-native";
// import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  ThemedScanIcon,
  ThemedSettingsOutlineIcon,
} from "@/assets/svg/wallet-icons-components";
import { DebitCardComponent } from "@/assets/svg/wallet-icons-components/DebitCardIcon";
import TokenSelectorBottomSheet from "@/components/bottomsheets/TokenSelectorBottomSheet";
import AssetsSection from "@/components/dashboard/AssetsSection";
import BalanceCard from "@/components/dashboard/BalanceCard";
import StickyHeader from "@/components/dashboard/StickyHeader";
import WalletSelectorHeader from "@/components/dashboard/WalletSelectorHeader";
import { AppBar, CustomButton } from "@/components/general";
import WalletEmptyScreen from "@/components/wallet/WalletEmptyScreen";
import { useAggregatedBalances } from "@/hooks/useAggregatedBalances";
import { PortfolioService } from "@/services/portfolio.service";
import { useChains } from "@/src/core/chains/chains-context";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { useWallet } from "@/src/core/wallet/wallet-context";
import {
  clearPortfolioData,
  clearTokenListData,
  setPortfolioError,
  setPortfolioLoading,
  setProcessedPortfolio,
  setRawPortfolio,
  setRawTokenList,
} from "@/state/reducers/portfolio.reducer";
import { selectProcessedPortfolio } from "@/state/selectors/portfolio.selectors";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import Svg, { Path, SvgProps } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

const Home = () => {
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { chainsMap, getChainImage } = useChains();
  const { defaultTokens } = useSupportedCurrencies();
  const { loadAllDataFromCache } = useWallet();
  const theme = useTheme<Theme>();
  const sendTokenRef = useRef<BottomSheet>(null);
  const recieveTokenRef = useRef<BottomSheet>(null);

  // Redux state
  const dispatch = useDispatch();
  const processedPortfolio = useSelector(selectProcessedPortfolio);
  const {
    retryPendingWallets,
    mainUserWalletGroup,
    portfolio,
    refreshPortfolio,
    isInitializing,
    isRefreshingPortfolio,
  } = useWallet();

  const { getCurrentWalletEnabledBalance } = useAggregatedBalances();

  useEffect(() => {
    loadAllDataFromCache();
  }, []);

  // Clear Redux portfolio state immediately when wallet changes
  // This ensures stale balance data doesn't show when switching wallets
  const prevWalletIdRef = React.useRef<string | undefined>(
    mainUserWalletGroup?._id
  );

  useEffect(() => {
    const currentWalletId = mainUserWalletGroup?._id;
    const prevWalletId = prevWalletIdRef.current;

    // Only clear if wallet actually changed (not just on mount)
    if (currentWalletId && prevWalletId && currentWalletId !== prevWalletId) {
      console.log(
        `🔄 Wallet changed from ${prevWalletId} to ${currentWalletId} - clearing Redux portfolio state`
      );
      // Clear Redux state immediately when wallet changes
      dispatch(clearPortfolioData());
      dispatch(clearTokenListData());
    }

    // Update ref to current wallet ID
    prevWalletIdRef.current = currentWalletId;
  }, [mainUserWalletGroup?._id, dispatch]);

  // Initialize wallet and portfolio on mount only
  // Track the wallet ID to prevent duplicate refreshes during switching
  const initializingWalletIdRef = React.useRef<string | undefined>(undefined);
  const lastProcessedWalletIdRef = React.useRef<string | undefined>(undefined);
  const retryPendingWalletsCalledRef = React.useRef<Set<string>>(new Set()); // Track which wallets have had retryPendingWallets called

  useEffect(() => {
    const initializeWallet = async () => {
      const currentWalletId = mainUserWalletGroup?._id;

      // Basic guard: Skip if no wallet or already initializing this exact wallet
      if (
        !mainUserWalletGroup ||
        !currentWalletId ||
        initializingWalletIdRef.current === currentWalletId
      ) {
        console.log("⏸️ Skipping initialization (basic guards):", {
          hasWallet: !!mainUserWalletGroup,
          currentWalletId,
          alreadyInitializing:
            initializingWalletIdRef.current === currentWalletId,
        });
        return;
      }

      // Mark this wallet as being initialized to prevent duplicate calls
      initializingWalletIdRef.current = currentWalletId;

      console.log("🚀 Initializing wallet for:", currentWalletId);

      try {
        // Check if this is a newly created wallet that needs accounts added
        // Newly created wallets will have accounts pending
        let hasPendingAccounts = false;
        try {
          const accountsPendingWallets =
            await WalletCredentialsStorage.getAccountsPendingWallets();
          hasPendingAccounts = accountsPendingWallets.some(
            (w) => w.userWalletGroupId === currentWalletId
          );
        } catch (error) {
          console.error("Failed to check pending accounts:", error);
        }

        // Call retryPendingWallets if:
        // 1. Wallet has pending accounts (newly created), OR
        // 2. We haven't called it for this wallet yet
        const shouldCallRetry =
          hasPendingAccounts ||
          !retryPendingWalletsCalledRef.current.has(currentWalletId);

        if (shouldCallRetry) {
          retryPendingWalletsCalledRef.current.add(currentWalletId);
          // Force execution for newly created wallets to ensure accounts are added immediately
          await retryPendingWallets(hasPendingAccounts);
          console.log(
            "✅ retryPendingWallets completed - accounts should now be on backend"
          );
        } else {
          console.log(
            "⏭️ Skipping retryPendingWallets - already called for wallet:",
            currentWalletId
          );
        }

        // Only refresh portfolio if we haven't processed this wallet yet
        // switchWallet should handle loading from cache
        if (lastProcessedWalletIdRef.current !== currentWalletId) {
          console.log("🔄 Refreshing portfolio for wallet:", currentWalletId);
          await refreshPortfolio(currentWalletId);
          lastProcessedWalletIdRef.current = currentWalletId;
        } else {
          console.log(
            "⏭️ Skipping portfolio refresh - already processed wallet:",
            currentWalletId
          );
        }
      } catch (error) {
        console.error("❌ Error during wallet initialization:", error);
      } finally {
        // Reset initialization flag after a delay
        setTimeout(() => {
          if (initializingWalletIdRef.current === currentWalletId) {
            initializingWalletIdRef.current = undefined;
          }
        }, 1000);
      }
    };

    // Small delay to allow switchWallet to complete first
    const timeoutId = setTimeout(() => {
      initializeWallet();
    }, 200);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainUserWalletGroup?._id]);

  useEffect(() => {
    const currentWalletId = mainUserWalletGroup?._id;
    if (currentWalletId) {
      // Only keep track of current wallet, clear others to save memory
      retryPendingWalletsCalledRef.current = new Set([currentWalletId]);
    }
  }, [mainUserWalletGroup?._id]);

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

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const currentWalletId = mainUserWalletGroup?._id;
      if (currentWalletId) {
        await refreshPortfolio(currentWalletId, true);
      }
      // Portfolio processing will happen automatically when portfolio data changes
    } catch (error) {
      console.error("Failed to refresh portfolio:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshPortfolio]);

  // Process portfolio data when it changes and store in Redux with caching
  useEffect(() => {
    if (portfolio?.mainWalletGroupPortfolio && defaultTokens && chainsMap) {
      const processPortfolio = async () => {
        try {
          dispatch(setPortfolioLoading(true));
          dispatch(setPortfolioError(null));
          let userTokenList = PortfolioService.normalizeUserTokenList(
            portfolio.userTokenList
          );

          dispatch(setRawTokenList(userTokenList));

          const processed = PortfolioService.processPortfolioData(
            portfolio,
            chainsMap,
            defaultTokens,
            getChainImage
          );

          if (!processed) {
            console.warn("⚠️ Portfolio processing was skipped or failed");
            dispatch(setPortfolioLoading(false));
            return;
          }

          console.log(
            processed.assets.filter((asset) => asset.symbol === "USDT")
          );

          // Store in Redux
          dispatch(setRawPortfolio(portfolio));
          dispatch(setProcessedPortfolio(processed));
        } catch (error) {
          console.error("Failed to process portfolio data:", error);
          dispatch(setPortfolioError("Failed to process portfolio data"));
        } finally {
          dispatch(setPortfolioLoading(false));
        }
      };

      processPortfolio();
    } else if (portfolio === null) {
      // Clear Redux state when portfolio is null (e.g., when switching wallets)
      console.log("🧹 Portfolio is null, clearing Redux state");
      dispatch(clearPortfolioData());
      dispatch(clearTokenListData());
    } else {
      // Portfolio exists but missing mainWalletGroupPortfolio structure
      console.warn(
        "⚠️ Portfolio exists but missing mainWalletGroupPortfolio:",
        {
          hasPortfolio: !!portfolio,
          hasMainWalletGroupPortfolio: !!portfolio?.mainWalletGroupPortfolio,
        }
      );
    }
  }, [portfolio, dispatch, defaultTokens, chainsMap]);

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

  // Animate card stack on mount
  useEffect(() => {
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
  }, []);

  console.log(processedPortfolio?.totalUsdValue);

  if (!mainUserWalletGroup) {
    return <WalletEmptyScreen />;
  }

  return (
    <PageWrapper>
      <StickyHeader
        isVisible={showStickyHeader}
        portfolioValue={
          getCurrentWalletEnabledBalance() ||
          processedPortfolio?.totalUsdValue ||
          0
        }
        portfolioChange={0} // We don't have change data from the API
        portfolioChangePercentage={0} // We don't have change data from the API
      />
      <ScrollView
        style={{ flex: 1, marginBottom: 50 }}
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
            <WalletSelectorHeader
              currentUserWalletGroup={mainUserWalletGroup}
            />
          }
          leading={
            <CustomButton
              leadingIcon={
                <ThemedSettingsOutlineIcon
                  darkModeColor={theme.colors.white}
                  lightModeColor={theme.colors.white}
                  width={24}
                  height={24}
                />
              }
              onPress={() => router.push("/dashboard/manage-wallet")}
              bgColor="transparent"
            />
          }
          trailing={
            <CustomButton
              leadingIcon={
                <ThemedScanIcon
                  darkModeColor={theme.colors.white}
                  lightModeColor={theme.colors.white}
                  width={24}
                  height={24}
                />
              }
              onPress={() => {}}
              bgColor="transparent"
            />
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
          <Box height={10} />
          <BalanceCard
            portfolioValue={
              getCurrentWalletEnabledBalance() ||
              processedPortfolio?.totalUsdValue ||
              0
            }
            portfolioChange={0} // We don't have change data from the API
            portfolioChangePercentage={0} // We don't have change data from the API
            walletName={mainUserWalletGroup?.walletGroupId?.name || "Wallet"}
            isLoading={isRefreshingPortfolio || isInitializing}
          />
          <Box mt="l">
            <ActionButtons
              onReceive={() => recieveTokenRef.current?.snapToIndex(1)}
              onSend={() => {
                sendTokenRef.current?.snapToIndex(1);
              }}
              onTrade={() => {}}
              onSwap={() => {
                router.push("/dashboard/home/wallet-home/swap");
              }}
              size={50}
              iconSize={20}
              textSize={12}
              backgroundColor="rgba(255,255,255,0.2)"
              textColor={theme.colors.bodyTextColor}
              showLabels={true}
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
          <AssetsSection
            mainUserWalletGroup={mainUserWalletGroup}
            onRefreshPortfolio={() => {
              const currentWalletId = mainUserWalletGroup?._id;
              if (currentWalletId) {
                refreshPortfolio(currentWalletId, true);
              }
            }}
            onManagePress={() => {
              // Navigate to manage assets page
            }}
            onRetry={async () => {
              try {
                dispatch(setPortfolioError(null));
                const currentWalletId = mainUserWalletGroup?._id;
                if (currentWalletId) {
                  await refreshPortfolio(currentWalletId, true);
                }
              } catch (err) {
                console.error("Failed to retry portfolio:", err);
                dispatch(setPortfolioError("Failed to refresh portfolio"));
              }
            }}
            onLogin={() => {
              // Navigate to login page
              router.push("/setup");
            }}
          />
        </Box>
      </ScrollView>
      <TokenSelectorBottomSheet
        key="send-token-selector"
        ref={sendTokenRef}
        mode="send"
        onTokenSelect={(token) => {
          // Navigate to send-token screen with the selected token
          router.push(`/dashboard/home/send-token?tokenId=${token.id}`);
        }}
      />
      <TokenSelectorBottomSheet
        key="receive-token-selector"
        ref={recieveTokenRef}
        mode="receive"
      />
    </PageWrapper>
  );
};

export default Home;
