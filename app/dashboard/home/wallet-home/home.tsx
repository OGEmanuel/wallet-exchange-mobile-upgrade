import ActionButtons from "@/components/dashboard/ActionButtons";
import {
  BackupWalletPrompt,
  shouldShowBackupPrompt,
} from "@/components/dashboard/BackupWalletPrompt";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, BackHandler, Platform, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { DrawerNavigationProp } from "@react-navigation/drawer";
import {
  ThemedScanIcon,
  ThemedSettingsOutlineIcon,
} from "@/assets/svg/wallet-icons-components";
import { DebitCardComponent } from "@/assets/svg/wallet-icons-components/DebitCardIcon";
import TokenSelectorBottomSheet from "@/components/bottomsheets/TokenSelectorBottomSheet";
import SelectBuyTokens from "@/components/bottomsheets/buy/SelectBuyTokens";
import TradeSelectBottomSheet from "@/components/bottomsheets/home/BuyBottomSheet";
import SellFlowBottomSheet from "@/components/bottomsheets/sell/SellBottomsheet";
import AssetsSection from "@/components/dashboard/AssetsSection";
import BalanceCard from "@/components/dashboard/BalanceCard";
import StickyHeader from "@/components/dashboard/StickyHeader";
import WalletSelectorHeader from "@/components/dashboard/WalletSelectorHeader";
import { AppBar, CustomButton } from "@/components/general";
import ZapLoader from "@/components/general/ZapLoader";
import WalletEmptyScreen from "@/components/wallet/WalletEmptyScreen";
import { useAggregatedBalances } from "@/hooks/useAggregatedBalances";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { PortfolioService } from "@/services/portfolio.service";
import { useChains } from "@/src/core/chains/chains-context";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { listWalletGroupBackups } from "@/src/core/utils/backup-utils";
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
  const insets = useSafeAreaInsets();
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [isCheckingBackup, setIsCheckingBackup] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const backupPromptAnimation = useRef(new Animated.Value(0)).current;
  const pendingSendActionRef = useRef(false); // Track if backup prompt was shown for send action
  const lastProcessedPortfolioRef = useRef<string | null>(null);
  const lastEnrichedAssetsRef = useRef<string | null>(null);
  const refreshingForMismatchRef = useRef<string | null>(null);
  const lastPortfolioSetTimeRef = useRef<number>(0);
  const { chainsMap, getChainImage } = useChains();
  const { defaultTokens, enrichSupportedCurrenciesWithBalances } =
    useSupportedCurrencies();
  const theme = useTheme<Theme>();
  const sendTokenRef = useRef<BottomSheet>(null);
  const recieveTokenRef = useRef<BottomSheet>(null);
  const {
    tradeBottomSheetRef,
    buyTokensBottomSheetRef,
    sellTokensBottomSheetRef,
  } = useBottomSheetRefs();

  // Redux state
  const dispatch = useDispatch();
  const processedPortfolio = useSelector(selectProcessedPortfolio);
  const {
    retryPendingWallets,
    mainUserWalletGroup,
    portfolio,
    setPortfolio,
    refreshPortfolio,
    isInitializing,
    isRefreshingPortfolio,
    loadAllDataFromCache,
    userWalletGroups,
    isUserWalletGroups,
  } = useWallet();

  const { getCurrentWalletEnabledBalance } = useAggregatedBalances();

  useEffect(() => {
    loadAllDataFromCache();
  }, []);

  // Check backup status and show prompt if needed
  // Only show when: 1) Wallet was just created/imported, or 2) User tries to send
  const checkBackupAndShowPrompt = useCallback(async (forceShow: boolean = false) => {
    if (!mainUserWalletGroup?.walletGroupId?._id) {
      setIsCheckingBackup(false);
      setShowBackupPrompt(false);
      return;
    }

    try {
      setIsCheckingBackup(true);

      // Check if user dismissed the prompt (only if not forced)
      if (!forceShow) {
        const shouldShow = await shouldShowBackupPrompt();
        if (!shouldShow) {
          setShowBackupPrompt(false);
          setIsCheckingBackup(false);
          return;
        }
      }

      // Check if wallet has at least one backup (iCloud or manual)
      const backups = await listWalletGroupBackups();
      const walletGroupId = mainUserWalletGroup.walletGroupId._id;
      const hasICloudBackup = backups.some((backup) => backup.id === walletGroupId);

      // Show prompt only if wallet has NO backups and it's forced (new wallet or trying to send)
      if (!hasICloudBackup && forceShow) {
        setShowBackupPrompt(true);
        // Animate the prompt sliding up from bottom
        Animated.spring(backupPromptAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      } else {
        setShowBackupPrompt(false);
        // Reset animation when hiding
        backupPromptAnimation.setValue(0);
      }
    } catch (error) {
      console.error("Error checking backup status:", error);
      setShowBackupPrompt(false);
    } finally {
      setIsCheckingBackup(false);
    }
  }, [mainUserWalletGroup?.walletGroupId?._id, backupPromptAnimation]);

  // Check if wallet was just created/imported (check on mount only)
  useEffect(() => {
    const checkNewWallet = async () => {
      if (!mainUserWalletGroup?.walletGroupId?._id) return;
      
      // Check if wallet has any backups - if not, it's likely a new wallet
      const backups = await listWalletGroupBackups();
      const walletGroupId = mainUserWalletGroup.walletGroupId._id;
      const hasBackup = backups.some((backup) => backup.id === walletGroupId);
      
      // If no backup exists, check if wallet was created recently (within last 5 minutes)
      // This is a heuristic to detect newly created wallets
      if (!hasBackup && mainUserWalletGroup.createdAt) {
        const createdAt = new Date(mainUserWalletGroup.createdAt).getTime();
        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;
        
        // If wallet was created within last 5 minutes, show prompt
        if (createdAt > fiveMinutesAgo) {
          checkBackupAndShowPrompt(true);
        }
      }
    };
    
    // Only check once on mount, not on every focus
    checkNewWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainUserWalletGroup?._id]); // Only check when wallet changes

  // Clear Redux portfolio state immediately when wallet changes
  // This ensures stale balance data doesn't show when switching wallets
  const prevWalletIdRef = React.useRef<string | undefined>(
    mainUserWalletGroup?._id
  );

  useEffect(() => {
    const currentWalletId = mainUserWalletGroup?._id;
    const prevWalletId = prevWalletIdRef.current;

    // Clear Redux state when wallet changes OR when wallet is first set
    if (currentWalletId && currentWalletId !== prevWalletId) {
      console.log(
        `🔄 Wallet changed from ${
          prevWalletId || "none"
        } to ${currentWalletId} - clearing Redux portfolio state`
      );
      // Clear Redux state immediately when wallet changes
      dispatch(clearPortfolioData());
      dispatch(clearTokenListData());
      // Reset processed portfolio ref to allow new portfolio to be processed
      lastProcessedPortfolioRef.current = null;
      lastEnrichedAssetsRef.current = null;
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
        // Also skip if we're already refreshing for a mismatch (to prevent loops)
        if (
          lastProcessedWalletIdRef.current !== currentWalletId &&
          refreshingForMismatchRef.current !== currentWalletId
        ) {
          console.log("🔄 Refreshing portfolio for wallet:", currentWalletId);
          await refreshPortfolio(currentWalletId);
          lastProcessedWalletIdRef.current = currentWalletId;
        } else {
          if (refreshingForMismatchRef.current === currentWalletId) {
            console.log(
              "⏭️ Skipping portfolio refresh - already refreshing for mismatch:",
              currentWalletId
            );
        } else {
          console.log(
            "⏭️ Skipping portfolio refresh - already processed wallet:",
            currentWalletId
          );
          }
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
    // Skip if chains aren't loaded yet - they'll be loaded in refreshPortfolio
    // Don't check walletChains.length as it causes dependency loops
    if (chainsMap.size === 0) {
      console.log(
        "⚠️ Chains not loaded in home component, waiting for chains to load..."
      );
      return; // Wait for chains to load before processing
    }

    // Get current wallet group ID to verify portfolio belongs to current wallet
    // We compare walletGroupId, not walletId, because portfolio contains walletGroup._id
    const currentWalletGroupId = mainUserWalletGroup?.walletGroupId?._id;
    const portfolioWalletGroupId =
      portfolio?.mainWalletGroupPortfolio?.walletGroup?._id || null;

    // Also get the userWalletGroupId for logging
    const currentUserWalletGroupId = mainUserWalletGroup?._id;

    // Track when portfolio was last set to prevent checking immediately after refresh
    const now = Date.now();
    const timeSincePortfolioSet = now - lastPortfolioSetTimeRef.current;

    // If portfolio was just set (within last 2 seconds), update the timestamp
    // This prevents immediate re-checking after a refresh completes
    if (portfolio && timeSincePortfolioSet < 2000) {
      lastPortfolioSetTimeRef.current = now;
    }

    // CRITICAL: Only process portfolio if it belongs to the current wallet group
    // Compare walletGroup._id from portfolio with walletGroupId._id from mainUserWalletGroup
    // This prevents showing stale data from previous wallet
    // Also skip if portfolio was just set (within 1 second) to allow refresh to complete
    if (
      portfolio &&
      currentWalletGroupId &&
      portfolioWalletGroupId &&
      portfolioWalletGroupId !== currentWalletGroupId &&
      timeSincePortfolioSet > 1000 // Give refresh time to complete
    ) {
      // Prevent infinite loop: only refresh once per wallet for this mismatch
      // Also check if we're already refreshing to prevent concurrent refreshes
      if (
        refreshingForMismatchRef.current === currentUserWalletGroupId ||
        isRefreshingPortfolio
      ) {
        console.log(
          `⏭️ Already refreshing for wallet ${currentUserWalletGroupId} due to mismatch or portfolio refresh in progress, skipping`
        );
        // Don't clear portfolio if we're refreshing - let the refresh complete
        // Just clear Redux state to prevent showing stale processed data
        dispatch(clearPortfolioData());
        dispatch(clearTokenListData());
        lastProcessedPortfolioRef.current = null;
        lastEnrichedAssetsRef.current = null;
        return;
      }

      console.log(
        `⚠️ Portfolio wallet group ID (${portfolioWalletGroupId}) doesn't match current wallet group (${currentWalletGroupId}), clearing stale portfolio and refreshing`
      );
      // Mark that we're refreshing for this wallet BEFORE any async operations
      refreshingForMismatchRef.current = currentUserWalletGroupId || null;

      // Clear stale portfolio data
      dispatch(clearPortfolioData());
      dispatch(clearTokenListData());
      // Reset processed portfolio ref to allow refresh
      lastProcessedPortfolioRef.current = null;
      lastEnrichedAssetsRef.current = null;

      // Clear the portfolio state synchronously (not in setTimeout)
      // This ensures the portfolio is cleared before the refresh starts
      if (setPortfolio) {
        setPortfolio(null);
      }

      // Trigger a refresh to get the correct portfolio
      // Don't await - let it run in the background
      if (currentUserWalletGroupId) {
        refreshPortfolio(currentUserWalletGroupId, true)
          .then((result) => {
            console.log(
              `✅ Portfolio refresh completed for wallet ${currentUserWalletGroupId}`
            );
            // Clear the refresh flag after a short delay to allow state to settle
            setTimeout(() => {
              refreshingForMismatchRef.current = null;
            }, 500);
          })
          .catch((error) => {
            console.error("Failed to refresh portfolio after mismatch:", error);
            // Clear the refresh flag even on error to allow retry after a delay
            setTimeout(() => {
              refreshingForMismatchRef.current = null;
            }, 2000);
          });
      }
      return;
    }

    // Clear the refresh flag if portfolio matches current wallet group
    // This ensures we can refresh again if needed
    if (
      portfolio &&
      currentWalletGroupId &&
      portfolioWalletGroupId === currentWalletGroupId
    ) {
      if (refreshingForMismatchRef.current === currentUserWalletGroupId) {
        console.log(
          `✅ Portfolio now matches current wallet group ${currentWalletGroupId}, clearing refresh flag`
        );
        refreshingForMismatchRef.current = null;
      }
    }

    // Prevent duplicate processing by tracking the last processed portfolio
    // Use walletGroupId for comparison since that's what we're checking
    if (
      portfolioWalletGroupId === lastProcessedPortfolioRef.current &&
      portfolio !== null
    ) {
      // Already processed this portfolio, skip
      console.log("⏭️ Portfolio already processed, skipping:", {
        portfolioWalletGroupId,
        lastProcessed: lastProcessedPortfolioRef.current,
      });
      return;
    }

    // Debug: Log why portfolio might not be processed
    if (!portfolio?.mainWalletGroupPortfolio) {
      console.log("⚠️ Portfolio missing mainWalletGroupPortfolio:", {
        hasPortfolio: !!portfolio,
        hasMainWalletGroupPortfolio: !!portfolio?.mainWalletGroupPortfolio,
      });
    }
    if (!defaultTokens) {
      console.log("⚠️ defaultTokens not available");
    }
    if (!chainsMap || chainsMap.size === 0) {
      console.log("⚠️ chainsMap not available or empty:", {
        hasChainsMap: !!chainsMap,
        chainsMapSize: chainsMap?.size || 0,
      });
    }

    if (
      portfolio?.mainWalletGroupPortfolio &&
      defaultTokens &&
      chainsMap &&
      chainsMap.size > 0
    ) {
      console.log("✅ All conditions met for portfolio processing:", {
        hasPortfolio: !!portfolio,
        hasMainWalletGroupPortfolio: !!portfolio?.mainWalletGroupPortfolio,
        hasDefaultTokens: !!defaultTokens,
        chainsMapSize: chainsMap.size,
        portfolioWalletGroupId,
        lastProcessed: lastProcessedPortfolioRef.current,
      });
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

          // Debug: Log processed portfolio details
          console.log("📊 Processed portfolio details:", {
            totalAssets: processed?.assets?.length || 0,
            enabledAssets: processed?.assets?.filter(a => a.status === 'ENABLED')?.length || 0,
            disabledAssets: processed?.assets?.filter(a => a.status === 'DISABLED')?.length || 0,
            hiddenAssets: processed?.assets?.filter(a => a.status === 'HIDDEN')?.length || 0,
            totalUsdValue: processed?.totalUsdValue || 0,
            hasAssets: !!processed?.assets && processed.assets.length > 0,
          });
          
          if (processed?.assets && processed.assets.length > 0) {
            console.log("📋 Sample assets (first 3):", processed.assets.slice(0, 3).map(a => ({
              symbol: a.symbol,
              status: a.status,
              balance: a.balance,
              totalUsdValue: a.totalUsdValue,
            })));
          }

          // Store in Redux
          dispatch(setRawPortfolio(portfolio));
          dispatch(setProcessedPortfolio(processed));
          
          // Verify Redux state was updated
          console.log("✅ Portfolio stored in Redux, processed portfolio should be available");

          // Mark this portfolio as processed (using walletGroupId for consistency)
          lastProcessedPortfolioRef.current = portfolioWalletGroupId;
          // Update timestamp when portfolio is successfully processed
          lastPortfolioSetTimeRef.current = Date.now();
          
          // Enrich supported currencies with balances from processed portfolio
          // Only enrich if assets have changed (prevent infinite loops)
          if (processed?.assets && processed.assets.length > 0) {
            const assetsKey = JSON.stringify(
              processed.assets.map((a) => ({
                id: a.id,
                balance: a.balance,
                supportedCurrencyId:
                  typeof a.supportedCurrencyId === "string"
                    ? a.supportedCurrencyId
                    : (a.supportedCurrencyId as any)?._id,
              }))
            );
            if (assetsKey !== lastEnrichedAssetsRef.current) {
              lastEnrichedAssetsRef.current = assetsKey;
            enrichSupportedCurrenciesWithBalances(processed.assets);
            }
          }
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
      lastProcessedPortfolioRef.current = null;
      lastEnrichedAssetsRef.current = null;
      dispatch(clearPortfolioData());
      dispatch(clearTokenListData());
      // Reset supported currencies balances when portfolio is cleared
      // Only reset if we haven't already reset (prevent infinite loops)
      if (lastEnrichedAssetsRef.current !== "[]") {
        lastEnrichedAssetsRef.current = "[]";
      enrichSupportedCurrenciesWithBalances([]);
      }
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
  }, [
    portfolio,
    dispatch,
    defaultTokens,
    chainsMap,
    getChainImage,
    enrichSupportedCurrenciesWithBalances,
  ]);

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

  // QR Scanner handlers
  const handleScanQRCode = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to scan QR codes"
        );
        return;
      }
    }
    setShowQRScanner(true);
  };

  const onQRCodeScanned = ({ data }: { data: string }) => {
    setScannedAddress(data);
    setShowQRScanner(false);
    // Open token selector after scanning
    sendTokenRef.current?.snapToIndex(1);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  // Don't show empty screen if we're still loading wallet groups
  // Only show empty screen if we've confirmed there are no wallet groups
  if (!mainUserWalletGroup && isUserWalletGroups === false && !isInitializing) {
    return <WalletEmptyScreen />;
  }

  // Show loading state while initializing
  if (
    isInitializing ||
    (!mainUserWalletGroup && isUserWalletGroups === undefined)
  ) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ZapLoader size={100} showText={true} text="Loading wallet..." />
        </Box>
      </PageWrapper>
    );
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
      <AppBar
          title={
          <WalletSelectorHeader currentUserWalletGroup={mainUserWalletGroup} />
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
              onPress={handleScanQRCode}
              bgColor="transparent"
            />
          }
        />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
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
            isLoading={
              isRefreshingPortfolio ||
              isInitializing ||
              (portfolio === null && mainUserWalletGroup !== null) ||
              (processedPortfolio === null && mainUserWalletGroup !== null)
            }
          />
          <Box mt="l">
            <ActionButtons
              onReceive={() => recieveTokenRef.current?.snapToIndex(1)}
              onSend={async () => {
                // Check backup before allowing send
                if (!mainUserWalletGroup?.walletGroupId?._id) {
                  sendTokenRef.current?.snapToIndex(1);
                  return;
                }
                
                const backups = await listWalletGroupBackups();
                const walletGroupId = mainUserWalletGroup.walletGroupId._id;
                const hasBackup = backups.some((backup) => backup.id === walletGroupId);
                
                if (!hasBackup) {
                  // Mark that we're showing prompt for send action
                  pendingSendActionRef.current = true;
                  // Show backup prompt if no backup exists
                  checkBackupAndShowPrompt(true);
                } else {
                  // Proceed with send
                sendTokenRef.current?.snapToIndex(1);
                }
              }}
              onTrade={() => {
                tradeBottomSheetRef.current?.snapToIndex(0);
              }}
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
      
      {/* Dark backdrop when backup prompt is shown */}
      {showBackupPrompt && mainUserWalletGroup?.walletGroupId?._id && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9,
            opacity: backupPromptAnimation,
          }}
          pointerEvents="box-none"
        />
      )}
      
      {/* Backup Wallet Prompt - Floating above content, positioned at bottom above nav bar */}
      {showBackupPrompt && mainUserWalletGroup?.walletGroupId?._id && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: Platform.OS === "ios" ? 90 : 70,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingHorizontal: 16,
            transform: [
              {
                translateY: backupPromptAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0], // Slide up from 300px below
                }),
              },
            ],
            opacity: backupPromptAnimation,
          }}
        >
          <BackupWalletPrompt
            walletGroupId={mainUserWalletGroup.walletGroupId._id}
            onDismiss={() => {
              // Check if this prompt was shown for a send action
              const shouldProceedWithSend = pendingSendActionRef.current;
              
              // Slide down animation
              Animated.timing(backupPromptAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                setShowBackupPrompt(false);
                
                // If this was shown for send action, proceed with opening token selector
                if (shouldProceedWithSend) {
                  pendingSendActionRef.current = false; // Reset the flag
                  // Small delay to ensure animation completes before opening bottom sheet
                  setTimeout(() => {
                    sendTokenRef.current?.snapToIndex(1);
                  }, 100);
                }
              });
            }}
          />
        </Animated.View>
      )}
      
      <SelectBuyTokens ref={buyTokensBottomSheetRef} />
      <SellFlowBottomSheet ref={sellTokensBottomSheetRef} />
      <TokenSelectorBottomSheet
        key="send-token-selector"
        ref={sendTokenRef}
        mode="send"
        onTokenSelect={(token) => {
          // Navigate to send-token screen with the selected token and scanned address if available
          const addressParam = scannedAddress ? `&address=${encodeURIComponent(scannedAddress)}` : "";
          router.push(`/dashboard/home/send-token?tokenId=${token.id}${addressParam}`);
          // Clear scanned address after navigation
          setScannedAddress(null);
        }}
      />
      <TokenSelectorBottomSheet
        key="receive-token-selector"
        ref={recieveTokenRef}
        mode="receive"
      />
      <TradeSelectBottomSheet ref={tradeBottomSheetRef} />

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="black"
          zIndex={1000}
        >
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={onQRCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />

          {/* Overlay UI positioned absolutely with safe area */}
          <Box
            position="absolute"
            top={insets.top}
            left={0}
            right={0}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="l"
            paddingVertical="l"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <Pressable
              onPress={closeQRScanner}
              style={({ pressed }) => ({
                padding: 12,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: 20,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <CustomText variant="medium" fontSize={18} color="white">
              Scan QR Code
            </CustomText>
            <Box width={48} />
          </Box>

          <Box
            position="absolute"
            bottom={insets.bottom}
            left={0}
            right={0}
            paddingHorizontal="l"
            paddingVertical="l"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <CustomText
              variant="body"
              fontSize={14}
              color="white"
              textAlign="center"
            >
              Position the QR code within the frame to scan
            </CustomText>
          </Box>
        </Box>
      )}
    </PageWrapper>
  );
};

export default Home;
