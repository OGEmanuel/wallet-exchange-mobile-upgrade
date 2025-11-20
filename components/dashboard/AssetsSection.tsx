import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import ThemedEmptyWalletIcon from "@/assets/svg/wallet-icons-components/ThemedEmptyWalletIcon";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppRootState } from "@/state";
import { setProcessedPortfolio } from "@/state/reducers/portfolio.reducer";
import {
  selectAllSupportedTokens,
  selectEnabledPortfolioAssets,
  selectProcessedPortfolio,
} from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ISupportedCurrency } from "@zap/blockchain-sdk";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import SmartImage from "../general/SmartImage";
import ManageTokensModal from "../Modals/ManageTokensModal";
import AssetCardSkeleton from "./AssetCardSkeleton";
import PortfolioErrorState from "./PortfolioErrorState";

const CryptoIcon = ({ image, symbol }: { image?: string; symbol?: string }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <View
      style={{
        width: 25,
        height: 25,
        borderRadius: 20,
        marginRight: 12,
        overflow: "hidden",
        backgroundColor: "#1F232D",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {image && !imageError ? (
        <SmartImage
          source={{ uri: image }}
          width={25}
          height={25}
          borderRadius={20}
          onError={(error) => {
            console.log("Failed to load token image:", image);
            setImageError(true);
          }}
        />
      ) : symbol ? (
        <CustomText fontSize={12} color="white" fontWeight="bold">
          {symbol.charAt(0)}
        </CustomText>
      ) : (
        <ZapLogo />
      )}
    </View>
  );
};

const AssetCard = ({ asset }: { asset: ProcessedAsset }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const formattedPrice = PortfolioService.formatCurrency(asset.price);
  const formattedTotalValue = PortfolioService.formatCurrency(
    asset.totalUsdValue
  );
  const formattedBalance = PortfolioService.formatBalance(
    asset.balance,
    asset.decimals
  );
  const formattedChange = PortfolioService.formatPercentage(asset.change);

  const handleTokenPress = () => {
    // Pass supportedCurrencyId._id for navigation, token details will extract currencyId
    const supportedCurrencyId =
      (asset.supportedCurrencyId as ISupportedCurrency)?._id || asset.supportedCurrencyId;
    router.push(`/dashboard/home/token-details/${supportedCurrencyId}`);
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handleTokenPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Box
          width="100%"
          height={60}
          borderRadius={12}
          style={{ backgroundColor: "#1F232D" }}
          mb="s"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="m"
          paddingVertical="m"
        >
          <Box flexDirection="row" alignItems="center" flex={1}>
            <CryptoIcon image={asset.image} symbol={asset.symbol} />
            <Box flex={1}>
              <Box flexDirection="row" alignItems="center" mb="s">
                <CustomText
                  variant="bodyBold"
                  fontSize={14}
                  color="headerTextColor"
                  mr="s"
                >
                  {asset.symbol}
                </CustomText>
                <Box
                  backgroundColor="secondaryBackgroundColor"
                  borderRadius={8}
                  paddingHorizontal="s"
                  style={{ paddingVertical: 4 }}
                >
                  <CustomText
                    variant="light"
                    fontSize={10}
                    color="whiteBodyText"
                  >
                    {asset.chainName}
                  </CustomText>
                </Box>
              </Box>
              <Box flexDirection="row" alignItems="center">
                <CustomText
                  variant="light"
                  fontSize={12}
                  color="disabledTextColor"
                  mr="s"
                >
                  {formattedPrice}
                </CustomText>
                <CustomText
                  variant="light"
                  fontSize={12}
                  color={asset.changeType === "positive" ? "success" : "error"}
                >
                  {formattedChange}
                </CustomText>
              </Box>
            </Box>
          </Box>
          <Box alignItems="flex-end">
            <CustomText
              variant="bodyBold"
              fontSize={14}
              color="headerTextColor"
              mb="s"
            >
              {formattedTotalValue}
            </CustomText>
            <CustomText variant="light" fontSize={12} color="disabledTextColor">
              {formattedBalance} {asset.symbol}
            </CustomText>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
};

interface AssetsSectionProps {
  mainUserWalletGroup: any;
  onManagePress?: () => void;
  onRetry?: () => void;
  onLogin?: () => void;
  onRefreshPortfolio?: () => void;
}

const AssetsSection = ({
  mainUserWalletGroup,
  onManagePress = () => {},
  onRetry = () => {},
  onLogin = () => {},
  onRefreshPortfolio = () => {},
}: AssetsSectionProps) => {
  const theme = useTheme<Theme>();

  // Redux state
  const enabledAssets = useSelector(selectEnabledPortfolioAssets);
  const processedPortfolio = useSelector(selectProcessedPortfolio);
  const { isPortfolioLoading, portfolioError } = useSelector(
    (state: AppRootState) => state.portfolio
  );
  const insets = useSafeAreaInsets();

  // Debug: Log enabled assets
  useEffect(() => {
    console.log("🔍 [AssetsSection] Portfolio state:", {
      hasProcessedPortfolio: !!processedPortfolio,
      totalAssets: processedPortfolio?.assets?.length || 0,
      enabledAssetsCount: enabledAssets?.length || 0,
      enabledAssets: enabledAssets?.map(a => ({ symbol: a.symbol, status: a.status, balance: a.balance })) || [],
      isPortfolioLoading,
      portfolioError,
    });
  }, [processedPortfolio, enabledAssets, isPortfolioLoading, portfolioError]);

  const handleManagePress = () => {
    onManagePress();
  };

  if (isPortfolioLoading) {
    return (
      <Box width={"100%"} flex={1} style={{ marginBottom: 60 }}>
        <Box
          width="100%"
          height={50}
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          mt="s"
        >
          <CustomText fontSize={18} variant="bodyBold" color="headerTextColor">
            Assets
          </CustomText>
        </Box>
        {/* Skeleton loaders for asset cards */}
        {Array.from({ length: 5 }).map((_, index) => (
          <AssetCardSkeleton key={index} />
        ))}
      </Box>
    );
  }

  if (portfolioError) {
    return (
      <Box width={"100%"} flex={1} style={{ marginBottom: 60 }}>
        <Box
          width="100%"
          height={50}
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          mt="s"
        >
          <CustomText fontSize={18} variant="bodyBold" color="headerTextColor">
            Assets
          </CustomText>
        </Box>
        <PortfolioErrorState
          error={portfolioError}
          onRetry={onRetry}
          onLogin={onLogin}
        />
      </Box>
    );
  }

  if (!enabledAssets || enabledAssets.length === 0) {
    return (
      <Box width={"100%"} flex={1} mb="2xl">
        <Box
          width="100%"
          height={50}
          justifyContent="space-between"
          alignItems="center"
          flexDirection="row"
          mt="s"
        >
          <CustomText fontSize={18} variant="bodyBold" color="headerTextColor">
            Assets
          </CustomText>
          <CustomButton
            onPress={handleManagePress}
            text="Manage"
            width={90}
            height={32}
            borderRadius={16}
            borderWidth={1}
            bgColor="transparent"
            variant="body"
            leadingIcon={
              <ThemedEditIcon
                width={14}
                height={14}
                darkModeColor={theme.colors.disabledTextColor}
                lightModeColor={theme.colors.disabledTextColor}
              />
            }
            fontSize={12}
            borderColor={theme.colors.borderColor}
          />
        </Box>
        <Box alignItems="center" justifyContent="center">
          {/* Empty State Icon - ThemedGlassIcon */}
          <Box marginBottom="l">
            <ThemedEmptyWalletIcon />
          </Box>
          <CustomText
            color="placeholderTextColor"
            textAlign="center"
            fontSize={14}
            marginBottom="m"
          >
            No assets yet. Received or purchased assets will show here
          </CustomText>

          {/* Buy Token Button */}
          <CustomButton
            text="Buy crypto"
            onPress={() => {}}
            width={180}
            variant="body"
            borderRadius={25}
            bgColor={theme.colors.primaryColor}
            fontSize={16}
          />
          <Box height={insets.bottom + 30} />
        </Box>
      </Box>
    );
  }

  return (
    <Box width={"100%"} flex={1} style={{ marginBottom: 60 }}>
      <Box
        width="100%"
        height={50}
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        mt="s"
      >
        <CustomText fontSize={18} variant="bodyBold" color="headerTextColor">
          Assets ({enabledAssets.length})
        </CustomText>
        <CustomButton
          onPress={handleManagePress}
          text="Manage"
          width={90}
          height={32}
          borderRadius={16}
          borderWidth={1}
          bgColor="transparent"
          variant="body"
          leadingIcon={
            <ThemedEditIcon
              width={14}
              height={14}
              darkModeColor={theme.colors.disabledTextColor}
              lightModeColor={theme.colors.disabledTextColor}
            />
          }
          fontSize={12}
          borderColor={theme.colors.borderColor}
        />
      </Box>
      {enabledAssets.map((asset, index) => {
        return (
          asset && <AssetCard key={`${index}-${asset.id}`} asset={asset} />
        );
      })}
    </Box>
  );
};

const AssetsSectionWithModal = (props: AssetsSectionProps) => {
  const dispatch = useDispatch();
  const { isPortfolioLoading } = useSelector(
    (state: AppRootState) => state.portfolio
  );
  const [showManageModal, setShowManageModal] = useState(false);

  // Get portfolio and setPortfolio from wallet context for optimistic updates
  const { portfolio, setPortfolio } = useWallet();

  // Redux state for modal
  const allTokens = useSelector(selectAllSupportedTokens);
  const processedPortfolio = useSelector(selectProcessedPortfolio);

  const handleManagePress = () => {
    setShowManageModal(true);
  };

  const handleToggleToken = async (assetId: string, enabled: boolean) => {
    console.log(`🎯 handleToggleToken called:`, { assetId, enabled });

    // Store original portfolio state for potential rollback on error (function scope)
    let originalPortfolio: typeof portfolio = null;
    let originalProcessedPortfolio: typeof processedPortfolio = null;
    let optimisticUpdateApplied = false;

    try {
      const sdk = zapSDKService.getSDK();
      if (sdk && sdk.tokens) {
        // Validate parameters before making the call
        if (!props.mainUserWalletGroup?._id) {
          console.error("No main user wallet group ID available");
          return;
        }

        if (!assetId) {
          console.error("No asset ID provided for token toggle");
          return;
        }

        if (portfolio && setPortfolio) {
          console.log(`✅ Conditions met for optimistic update, proceeding...`);
          // Store original state for rollback
          originalPortfolio = JSON.parse(JSON.stringify(portfolio));
          originalProcessedPortfolio = processedPortfolio ? JSON.parse(JSON.stringify(processedPortfolio)) : null;
          // Deep clone to ensure React detects the change
          const updatedPortfolio = JSON.parse(JSON.stringify(portfolio));

          // Extract and normalize userTokenList
          let userTokenList = PortfolioService.normalizeUserTokenList(
            updatedPortfolio.userTokenList
          );

          // Find and update token status optimistically
          const tokenIndex = userTokenList.findIndex((t) => {
            const supportedCurrencyId =
              typeof t.supportedCurrencyId === "string"
                ? t.supportedCurrencyId
                : (t.supportedCurrencyId as ISupportedCurrency)?._id;
            return supportedCurrencyId === assetId;
          });

          if (tokenIndex >= 0) {
            const token = userTokenList[tokenIndex];
            // When disabling, set to HIDDEN (not DISABLED)
            // When enabling, set to ENABLED
            const oldStatus = token.status;
            const newStatus = enabled ? "ENABLED" : "HIDDEN";

            // Create a new token object with updated status (immutable update)
            userTokenList[tokenIndex] = {
              ...token,
              status: newStatus,
            };

            // IMPORTANT: Assign the updated userTokenList back to the portfolio
            updatedPortfolio.userTokenList = userTokenList;

            console.log(
              `🔄 Optimistic update: Token ${assetId} status changed from ${oldStatus} to ${newStatus}`
            );

            // Update portfolio state - this should trigger useEffect in home.tsx
            setPortfolio(updatedPortfolio);
            
            // ALSO immediately update the processed portfolio in Redux so the UI reflects the change
            if (processedPortfolio) {
              const updatedProcessedPortfolio = {
                ...processedPortfolio,
                assets: processedPortfolio.assets.map((asset) => {
                  // Match by supportedCurrencyId (can be string or object with _id)
                  const assetSupportedCurrencyId =
                    typeof asset.supportedCurrencyId === "string"
                      ? asset.supportedCurrencyId
                      : (asset.supportedCurrencyId as any)?._id;
                  
                  if (assetSupportedCurrencyId === assetId) {
                    // Update this asset's status
                    return {
                      ...asset,
                      status: newStatus as "ENABLED" | "DISABLED" | "HIDDEN",
                    };
                  }
                  return asset;
                }),
              };
              
              // Recalculate enabled/disabled assets
              updatedProcessedPortfolio.enabledAssets = updatedProcessedPortfolio.assets.filter(
                (asset) => asset.status === "ENABLED"
              ) as ProcessedAsset[];
              updatedProcessedPortfolio.disabledAssets = updatedProcessedPortfolio.assets.filter(
                (asset) => asset.status === "DISABLED" || asset.status === "HIDDEN"
              ) as ProcessedAsset[];
              updatedProcessedPortfolio.enabledCount = updatedProcessedPortfolio.enabledAssets.length;
              updatedProcessedPortfolio.disabledCount = updatedProcessedPortfolio.disabledAssets.length;
              
              // Update Redux immediately
              dispatch(setProcessedPortfolio(updatedProcessedPortfolio));
              console.log(
                `✅ Processed portfolio updated in Redux immediately - UI should reflect change`
              );
            }
            
            optimisticUpdateApplied = true;

            console.log(
              `✅ Portfolio state updated optimistically - useEffect should trigger`
            );
          } else {
            console.warn(
              `⚠️ Token ${assetId} not found in userTokenList for optimistic update`
            );
            console.warn(
              `   Available token IDs:`,
              userTokenList.slice(0, 5).map((t: any) => ({
                id:
                  typeof t.supportedCurrencyId === "string"
                    ? t.supportedCurrencyId
                    : t.supportedCurrencyId?._id,
                status: t.status,
              }))
            );
          }
        } else {
          console.warn(
            `⚠️ Cannot perform optimistic update - conditions not met:`,
            {
              hasPortfolio: !!portfolio,
              hasSetPortfolio: !!setPortfolio,
              portfolioType: portfolio ? typeof portfolio : "null",
              setPortfolioType: setPortfolio
                ? typeof setPortfolio
                : "undefined",
            }
          );
        }

        // Use SDK to toggle token status on backend
        try {
          console.log(
            `🔄 Calling SDK ${enabled ? "enableToken" : "disableToken"}...`
          );
          const startTime = Date.now();

          let result;
          if (enabled) {
            result = await zapSDKService.enableToken({
              userWalletGroupId: props.mainUserWalletGroup._id,
              supportedCurrencyId: assetId,
            });
            console.log("✅ Token enabled successfully on backend:", {
              assetId,
              result,
              responseTime: `${Date.now() - startTime}ms`,
            });
          } else {
            // Disable sets status to HIDDEN on backend
            result = await zapSDKService.disableToken({
              userWalletGroupId: props.mainUserWalletGroup._id,
              supportedCurrencyId: assetId,
            });
            console.log("✅ Token disabled successfully on backend:", {
              assetId,
              result,
              responseTime: `${Date.now() - startTime}ms`,
            });
          }

          // Immediately refresh portfolio to update the processed portfolio and Redux state
          // This ensures the token list in the modal reflects the change immediately
          if (props.onRefreshPortfolio) {
            console.log("🔄 Immediately refreshing portfolio to update processed state...");
            // Use a small delay to ensure backend has processed the change
            setTimeout(() => {
              if (props.onRefreshPortfolio) {
                props.onRefreshPortfolio();
              }
            }, 500);
          }

          // Schedule a delayed refresh (10 seconds) to eventually sync with backend
          // This gives the backend cache time to expire/update
          // If backend still returns stale data, the optimistic update state will be preserved
          const syncTimeoutId = setTimeout(async () => {
            console.log(
              "🔄 Syncing portfolio with backend after token toggle (10s delay)..."
            );
            try {
              const { StorageKeys } = await import(
                "@/src/core/storage/storage-types"
              );
              const walletId = props.mainUserWalletGroup._id;
              const dataKey = `${StorageKeys.PORTFOLIO_DATA}_${walletId}`;
              const timestampKey = `${StorageKeys.PORTFOLIO_TIMESTAMP}_${walletId}`;

              // Clear local cache to force fresh fetch
              await SecureStore.deleteItemAsync(dataKey);
              await SecureStore.deleteItemAsync(timestampKey);

              // Only refresh if user hasn't manually refreshed already
              // The optimistic update state is already correct, so this is just for eventual consistency
              if (props.onRefreshPortfolio) {
                console.log("   Triggering background sync with backend...");
                props.onRefreshPortfolio();
              }
            } catch (error) {
              console.warn("⚠️ Failed to sync portfolio with backend:", error);
              // Non-critical - optimistic update is already applied
            }
          }, 10000); // 10 second delay to allow backend cache to expire

          console.log(
            `⏱️ Scheduled background sync (ID: ${syncTimeoutId}), will execute in 10 seconds`
          );
        } catch (backendError: any) {
          console.error("❌ Failed to toggle token on backend:", backendError);
          console.error("   Error type:", typeof backendError);
          console.error(
            "   Error constructor:",
            backendError?.constructor?.name
          );
          console.error(
            "   Full error object:",
            JSON.stringify(
              backendError,
              Object.getOwnPropertyNames(backendError),
              2
            )
          );

          // Revert optimistic update on error
          if (optimisticUpdateApplied && originalPortfolio && setPortfolio) {
            console.log(
              "🔄 Reverting optimistic update due to backend error..."
            );
            console.log("   Original portfolio state:", {
              enabledCount: originalPortfolio.userTokenList
                ? Array.isArray(originalPortfolio.userTokenList)
                  ? originalPortfolio.userTokenList.filter(
                      (t: any) => t.status === "ENABLED"
                    ).length
                  : (originalPortfolio.userTokenList as any)?.data?.filter(
                      (t: any) => t.status === "ENABLED"
                    ).length || 0
                : 0,
            });
            setPortfolio(originalPortfolio);
            
            // Also revert the processed portfolio in Redux
            if (originalProcessedPortfolio) {
              dispatch(setProcessedPortfolio(originalProcessedPortfolio));
              console.log("✅ Processed portfolio reverted in Redux");
            }
            
            optimisticUpdateApplied = false;
            console.log(
              "✅ Optimistic update reverted - UI should show original state"
            );
          } else {
            console.warn("⚠️ Cannot revert optimistic update:", {
              optimisticUpdateApplied,
              hasOriginalPortfolio: !!originalPortfolio,
              hasSetPortfolio: !!setPortfolio,
            });
          }

          // Determine error type and provide appropriate feedback
          const errorStatus =
            backendError?.status ||
            backendError?.response?.status ||
            backendError?.code;
          const isRetryable =
            errorStatus >= 500 ||
            errorStatus === 429 ||
            backendError?.isRetryable;

          if (errorStatus === 502) {
            console.error(
              "❌ Backend gateway error (502) - server may be temporarily unavailable"
            );
            // SDK should retry automatically, but if it fails after retries, user will see the reverted state
          } else if (errorStatus === 500) {
            console.error(
              "❌ Backend server error (500) - internal server error, operation failed after retries"
            );
          } else if (isRetryable) {
            console.error(
              `❌ Server error (${errorStatus}) - operation failed after retries`
            );
          } else {
            console.error(
              `❌ Client error (${errorStatus}) - operation failed`
            );
          }

          // Don't refresh portfolio if backend is down - it will fail too
          // The optimistic update has been reverted, so UI is correct
          if (!isRetryable && props.onRefreshPortfolio) {
            // Only refresh on non-retryable errors (client errors like 400, 401, 403)
            // This will sync the UI with backend state
            console.log(
              "   Refreshing portfolio to sync with backend state..."
            );
            props.onRefreshPortfolio();
          } else {
            console.log(
              "   Skipping portfolio refresh - backend may be down or error is retryable"
            );
          }

          throw backendError; // Re-throw to let caller handle the error
        }
      } else {
        console.error("SDK not available for token toggle");
      }
    } catch (error: any) {
      console.error("Failed to toggle token:", error);

      // Revert optimistic update on error (if not already reverted)
      if (optimisticUpdateApplied && originalPortfolio && setPortfolio) {
        console.log("🔄 Reverting optimistic update due to error...");
        setPortfolio(originalPortfolio);
        optimisticUpdateApplied = false;
      }

      // Determine if we should refresh on error
      const errorStatus =
        error?.status || error?.response?.status || error?.code;
      const isRetryable =
        errorStatus >= 500 || errorStatus === 429 || error?.isRetryable;

      // Only refresh on non-retryable errors (when backend is likely working)
      // For retryable errors (502, 503, etc.), don't refresh as it may also fail
      if (!isRetryable && props.onRefreshPortfolio) {
        props.onRefreshPortfolio();
      }
    }
  };

  const handleImportToken = () => {
    console.log("Token imported successfully, refreshing portfolio...");
    // Refresh portfolio to show the newly imported token
    props.onRefreshPortfolio?.();
  };

  return (
    <>
      <AssetsSection {...props} onManagePress={handleManagePress} />
      <ManageTokensModal
        mainUserWalletGroup={props.mainUserWalletGroup}
        visible={showManageModal}
        onClose={() => setShowManageModal(false)}
        allTokens={allTokens}
        onToggleToken={handleToggleToken}
        isLoading={isPortfolioLoading || false}
        onImportToken={handleImportToken}
      />
    </>
  );
};

export default AssetsSectionWithModal;
