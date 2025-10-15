import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import {
  ProcessedAsset,
  ProcessedPortfolio,
} from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { SvgUri } from "react-native-svg";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import ZapLoader from "../general/ZapLoader";
import ManageTokensModal from "../Modals/ManageTokensModal";
import PortfolioErrorState from "./PortfolioErrorState";

const CryptoIcon = ({ image }: { image?: string }) => {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        overflow: "hidden",
        backgroundColor: "#1F232D",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {image ? (
        <SvgUri
          uri={image}
          width={35}
          height={35}
          onError={() => {
            console.log("Failed to load token image:", image);
          }}
          style={{
            borderRadius: 20,
          }}
        />
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

  return (
    <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
      <Box
        width="100%"
        height={70}
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
          <CryptoIcon image={asset.image} />
          <Box flex={1}>
            <Box flexDirection="row" alignItems="center" mb="s">
              <CustomText
                variant="bodyBold"
                fontSize={16}
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
                fontSize={13}
                color="disabledTextColor"
                mr="s"
              >
                {formattedPrice}
              </CustomText>
              <CustomText
                variant="light"
                fontSize={13}
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
            fontSize={16}
            color="headerTextColor"
            mb="s"
          >
            {formattedTotalValue}
          </CustomText>
          <CustomText variant="light" fontSize={13} color="disabledTextColor">
            {formattedBalance} {asset.symbol}
          </CustomText>
        </Box>
      </Box>
    </Pressable>
  );
};

interface AssetsSectionProps {
  portfolio: ProcessedPortfolio | null;
  mainUserWalletGroup: any;
  isLoading: boolean;
  error: string | null;
  onManagePress?: () => void;
  onRetry?: () => void;
  onLogin?: () => void;
  onRefreshPortfolio?: () => void;
}

const AssetsSection = ({
  portfolio,
  mainUserWalletGroup,
  isLoading,
  error,
  onManagePress = () => {},
  onRetry = () => {},
  onLogin = () => {},
  onRefreshPortfolio = () => {},
}: AssetsSectionProps) => {
  const theme = useTheme<Theme>();
  const [showManageModal, setShowManageModal] = useState(false);

  // Debug logging
  console.log("🔍 AssetsSection props:", {
    portfolio: portfolio
      ? `${portfolio.enabledAssets?.length || 0} enabled assets`
      : "null",
    isLoading,
    error,
  });

  const handleManagePress = () => {
    setShowManageModal(true);
    onManagePress();
  };

  if (isLoading) {
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

  if (error) {
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
          error={error}
          onRetry={onRetry}
          onLogin={onLogin}
        />
      </Box>
    );
  }

  if (!portfolio || !portfolio.enabledAssets || portfolio.enabledAssets.length === 0) {
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
          Assets ({portfolio.enabledCount})
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
      {portfolio.enabledAssets.map((asset, index) => {
        return <AssetCard key={asset.id} asset={asset} />;
      })}
    </Box>
  );
};

const AssetsSectionWithModal = (props: AssetsSectionProps) => {
  const [showManageModal, setShowManageModal] = useState(false);

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
        allTokens={props.portfolio?.assets || []}
        onToggleToken={handleToggleToken}
        onImportToken={handleImportToken}
      />
    </>
  );
};

export default AssetsSectionWithModal;
