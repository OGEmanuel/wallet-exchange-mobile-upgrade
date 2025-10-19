import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import ThemedEmptyWalletIcon from "@/assets/svg/wallet-icons-components/ThemedEmptyWalletIcon";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { AppRootState } from "@/state";
import {
  selectAllSupportedTokens,
  selectEnabledPortfolioAssets,
} from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import { useSelector } from "react-redux";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
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
        <SvgUri
          uri={image}
          width={25}
          height={25}
          onError={() => {
            console.log("Failed to load token image:", image);
            setImageError(true);
          }}
          style={{
            borderRadius: 20,
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
      asset.supportedCurrencyId?._id || asset.supportedCurrencyId;
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
  const { isPortfolioLoading, portfolioError } = useSelector(
    (state: AppRootState) => state.portfolio
  );
  const insets = useSafeAreaInsets();

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
        return <AssetCard key={asset.id} asset={asset} />;
      })}
    </Box>
  );
};

const AssetsSectionWithModal = (props: AssetsSectionProps) => {
  const { isPortfolioLoading } = useSelector(
    (state: AppRootState) => state.portfolio
  );
  const [showManageModal, setShowManageModal] = useState(false);

  // Redux state for modal
  const allTokens = useSelector(selectAllSupportedTokens);

  const handleManagePress = () => {
    setShowManageModal(true);
  };

  const handleToggleToken = async (assetId: string, enabled: boolean) => {
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

        console.log("Toggling token:", {
          assetId,
          enabled,
          userWalletGroupId: props.mainUserWalletGroup._id
        });

        // Use SDK to toggle token status
        if (enabled) {
          await zapSDKService.enableToken({
            userWalletGroupId: props.mainUserWalletGroup._id,
            supportedCurrencyId: assetId,
          });
        } else {
          await zapSDKService.disableToken({
            userWalletGroupId: props.mainUserWalletGroup._id,
            supportedCurrencyId: assetId,
          });
        }
        console.log("Token toggled successfully:", assetId, enabled);

        // Refresh portfolio to update the UI
        if (props.onRefreshPortfolio) {
          console.log("Refreshing portfolio after token toggle...");
          props.onRefreshPortfolio();
        }
      } else {
        console.error("SDK not available for token toggle");
      }
    } catch (error) {
      console.error("Failed to toggle token:", error);
      // You might want to show a user-friendly error message here
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
        allTokens={allTokens || []}
        onToggleToken={handleToggleToken}
        isLoading={isPortfolioLoading || false}
        onImportToken={handleImportToken}
      />
    </>
  );
};

export default AssetsSectionWithModal;
