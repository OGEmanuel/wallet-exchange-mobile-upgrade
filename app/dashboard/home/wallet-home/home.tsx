import ActionButtons from "@/components/dashboard/ActionButtons";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Pressable,
  RefreshControl,
} from "react-native";
// import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  ThemedScanIcon,
  ThemedSettingsOutlineIcon,
} from "@/assets/svg/wallet-icons-components";
import { DebitCardComponent } from "@/assets/svg/wallet-icons-components/DebitCardIcon";
import TokenSelectorBottomSheet from "@/components/bottomsheets/TokenSelectorBottomSheet";
import WalletSelectorBottomSheet from "@/components/bottomsheets/WalletSelectorBottomSheet";
import AssetsSection from "@/components/dashboard/AssetsSection";
import BalanceCard from "@/components/dashboard/BalanceCard";
import StickyHeader from "@/components/dashboard/StickyHeader";
import { AppBar } from "@/components/general";
import Identicon from "@/components/general/Identicon";
import AppBottomSheet from "@/components/Modals/AppBottomSheet";
import { PortfolioService } from "@/services/portfolio.service";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { setAllSupportedTokens, setPortfolioError, setPortfolioLoading, setProcessedPortfolio, setRawPortfolio } from "@/state/reducers/portfolio.reducer";
import { selectProcessedPortfolio } from "@/state/selectors/portfolio.selectors";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { ScrollView } from "react-native-gesture-handler";
import Svg, { Path, SvgProps } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const theme = useTheme<Theme>();
  const sendTokenRef = useRef<BottomSheet>(null);
  const recieveTokenRef = useRef<BottomSheet>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<any>(null);
  
  // Redux state
  const dispatch = useDispatch();
  const processedPortfolio = useSelector(selectProcessedPortfolio);
  
  const {
    retryPendingWallets,
    mainUserWalletGroup,
    portfolio,
    refreshPortfolio,
    switchWallet,
    getSDK,
    isLoading,
    isWalletAuthenticated,
    currentWalletUser,
    error: walletError,
  } = useWallet();

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refreshPortfolio();

      // Force re-processing of portfolio data
      if (portfolio) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to refresh portfolio:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshPortfolio, portfolio]);

  // Handle wallet selector button press
  const handleWalletSelectorPress = () => {
    setShowWalletSelector(true);
  };

  // Process portfolio data when it changes and store in Redux
  useEffect(() => {
    if (portfolio) {
      const processPortfolio = async () => {
        try {
          dispatch(setPortfolioLoading(true));
          dispatch(setPortfolioError(null));
          const processed = await PortfolioService.processPortfolioData(
            portfolio
          );
          // Store in Redux
          dispatch(setRawPortfolio(portfolio));
          dispatch(setProcessedPortfolio(processed));
          // Also store all tokens for send/receive and manage token lists
          dispatch(setAllSupportedTokens(processed.assets || []));
        } catch (error) {
          console.error("Failed to process portfolio data:", error);
          dispatch(setPortfolioError("Failed to process portfolio data"));
        } finally {
          dispatch(setPortfolioLoading(false));
        }
      };

      processPortfolio();
    }
  }, [portfolio, refreshTrigger, dispatch]);

  // Track if portfolio has been fetched to prevent infinite loops
  const hasFetchedPortfolio = useRef(false);

  // Load portfolio data on focus
  useFocusEffect(
    React.useCallback(() => {
      if (mainUserWalletGroup && !isLoading && !hasFetchedPortfolio.current) {
        hasFetchedPortfolio.current = true;
        refreshPortfolio();
      }
    }, [mainUserWalletGroup, isLoading, refreshPortfolio])
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
  }, []); // Remove retryPendingWallets from dependencies to prevent multiple calls

  // Check if current wallet needs account derivation
  useEffect(() => {
    const checkAndDeriveAccounts = async () => {
      if (mainUserWalletGroup && portfolio) {
        const accounts =
          portfolio.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts ||
          [];
        console.log("🔍 Current wallet accounts:", accounts.length);

        if (accounts.length === 0) {
          console.log(
            "⚠️ No accounts found for current wallet, attempting to derive accounts..."
          );
          try {
            // Try to derive accounts for the current wallet
            const sdk = getSDK();
            if (sdk && currentWalletUser) {
              console.log(
                "🔄 Attempting to derive accounts for wallet:",
                mainUserWalletGroup._id
              );

              // Get the seed phrase for this wallet
              const credentials =
                await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
                  mainUserWalletGroup._id
                );
              if (credentials?.credential) {
                console.log("🔄 Deriving multi-chain addresses...");
                const addresses = await zapSDKService.deriveMultiChainAddresses(
                  credentials.credential.toString(),
                  0 // derivation index
                );
                console.log("✅ Derived addresses:", addresses);

                // Try to add accounts to existing wallet
                console.log("🔄 Adding accounts to existing wallet...");
                await zapSDKService.addAccountsToExistingWallet({
                  userWalletGroupId: mainUserWalletGroup._id,
                  seedPhrase: credentials.credential.toString(),
                });
                console.log("✅ Accounts added successfully");

                // Refresh portfolio
                await refreshPortfolio();
              } else {
                console.log(
                  "❌ No credentials found for wallet:",
                  mainUserWalletGroup._id
                );
              }
            }
          } catch (error) {
            console.error("❌ Failed to derive accounts:", error);
          }
        }
      }
    };

    checkAndDeriveAccounts();
  }, [
    mainUserWalletGroup,
    portfolio,
    getSDK,
    currentWalletUser,
    refreshPortfolio,
  ]);

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

  const handleDeleteWallet = (wallet: any) => {
    console.log("🗑️ Delete wallet from home:", wallet);
    console.log("🗑️ Setting showDeleteModal to true");
    setWalletToDelete(wallet);
    console.log("🗑️ Delete modal state updated");
  };

  const handleCancelDelete = () => {
    setWalletToDelete(null);
  };

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
            <Pressable
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                opacity: pressed ? 0.5 : 1,
              })}
              onPress={handleWalletSelectorPress}
            >
              <Box
                width={24}
                height={24}
                borderRadius={4}
                marginRight="s"
                overflow="hidden"
                flexDirection="row"
              >
                <Identicon
                  value={mainUserWalletGroup?.name || "Wallet"}
                  size={24}
                />
              </Box>
              <CustomText variant="body" fontSize={16} color="white">
                {mainUserWalletGroup?.name || "Wallet"}
              </CustomText>
              <ChevronDown size={16} color="white" style={{ marginLeft: 4 }} />
            </Pressable>
          }
          leading={
            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
              onPress={() => router.push("/dashboard/manage-wallet")}
            >
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
          <Box mt="xl">
            <ActionButtons
              onReceive={() => recieveTokenRef.current?.snapToIndex(1)}
              onSend={() => {
                sendTokenRef.current?.snapToIndex(1);
              }}
              onTrade={() => {}}
              onSwap={() => {
                router.push("/dashboard/home/wallet-home/exchange");
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
            onRefreshPortfolio={refreshPortfolio}
            onManagePress={() => {
              // Navigate to manage assets page
            }}
            onRetry={async () => {
              try {
                dispatch(setPortfolioError(null));
                await refreshPortfolio();
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

      <AppBottomSheet isVisible={isOpen} onClose={() => setIsOpen(false)}>
        <Box>
          <CustomText>Recieve Tokens</CustomText>
        </Box>
      </AppBottomSheet>
      <TokenSelectorBottomSheet
        key="send-token-selector"
        ref={sendTokenRef}
        mode="send"
        onTokenSelect={(token) => {
          console.log("🏠 HOME: Token selected:", {
            id: token.id,
            symbol: token.symbol,
            name: token.name,
          });
          // Navigate to send-token screen with the selected token
          router.push(`/dashboard/home/send-token?tokenId=${token.id}`);
        }}
      />
      <TokenSelectorBottomSheet ref={recieveTokenRef} mode="receive" />

      <WalletSelectorBottomSheet
        visible={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        selectedWalletGroupId={mainUserWalletGroup?._id}
        handleCancelDelete={handleCancelDelete}
        walletToDelete={walletToDelete}
        onWalletSelect={async (selectedUserWalletGroup: any) => {
          // Don't close if selecting the same wallet
          if (selectedUserWalletGroup._id === mainUserWalletGroup?._id) {
            setShowWalletSelector(false);
            return;
          }

          try {
            // Switch to the selected wallet
            await switchWallet(selectedUserWalletGroup._id);
            setShowWalletSelector(false);
          } catch (error) {
            console.error("Failed to switch wallet:", error);
            Alert.alert("Error", "Failed to switch wallet. Please try again.");
          }
        }}
        onDeleteWallet={handleDeleteWallet}
      />
    </PageWrapper>
  );
};

export default Home;
