import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import {
  ProcessedAsset
} from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { AppRootState } from "@/state";
import { selectAllSupportedTokens, selectEnabledPortfolioAssets } from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { SvgUri } from "react-native-svg";
import { useSelector } from "react-redux";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import ZapLoader from "../general/ZapLoader";
import ManageTokensModal from "../Modals/ManageTokensModal";
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
    const supportedCurrencyId = asset.supportedCurrencyId?._id || asset.supportedCurrencyId;
    router.push(`/dashboard/home/token-details/${supportedCurrencyId}`);
  };

  return (
    <Pressable
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      onPress={handleTokenPress}
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
                <CustomText variant="light" fontSize={10} color="whiteBodyText">
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
  const { isPortfolioLoading, portfolioError } = useSelector((state: AppRootState) => state.portfolio);

  // Debug logging
  console.log("🔍 AssetsSection Redux state:", {
    enabledAssets: enabledAssets?.length || 0,
    isLoading: isPortfolioLoading,
    error: portfolioError,
  });

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
        <Box flex={1} justifyContent="center" alignItems="center" py="xl">
          <ZapLoader size={100} showText={false} />
        </Box>
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
        <Box flex={1} justifyContent="center" alignItems="center" py="xl">
          <CustomText
            variant="body"
            color="disabledTextColor"
            textAlign="center"
          >
            No assets found
          </CustomText>
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
        onImportToken={handleImportToken}
      />
    </>
  );
};

export default AssetsSectionWithModal;
