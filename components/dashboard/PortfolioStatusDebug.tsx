import { useWallet } from "@/src/core/wallet/wallet-context";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

/**
 * Debug component to show portfolio status
 * Only visible in development mode
 */
export default function PortfolioStatusDebug() {
  const {
    portfolio,
    isLoading,
    isWalletAuthenticated,
    currentWalletUser,
    mainUserWalletGroup,
    error,
  } = useWallet();

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <Box backgroundColor="borderColor" borderRadius={8} p="m" mb="m">
      <CustomText variant="body" color="disabledTextColor" mb="s">
        📊 Portfolio Status (Debug)
      </CustomText>

      <CustomText variant="body" color="disabledTextColor" mb="s">
        Authenticated: {isWalletAuthenticated ? "Yes" : "No"}
      </CustomText>

      <CustomText variant="body" color="disabledTextColor" mb="s">
        User ID: {currentWalletUser || "None"}
      </CustomText>

      <CustomText variant="body" color="disabledTextColor" mb="s">
        Main Wallet Group: {mainUserWalletGroup?._id || "None"}
      </CustomText>

      <CustomText variant="body" color="disabledTextColor" mb="s">
        Portfolio Data: {portfolio ? "✅ Loaded" : "❌ Not loaded"}
      </CustomText>

      <CustomText variant="body" color="disabledTextColor" mb="s">
        Loading: {isLoading ? "Yes" : "No"}
      </CustomText>

      <CustomText variant="body" color="disabledTextColor" mb="s">
        Error: {error || "None"}
      </CustomText>

      {portfolio && (
        <CustomText variant="body" color="disabledTextColor" mb="s">
          Total USD Value: $
          {portfolio.mainWalletGroupPortfolio?.totalUsdValue || 0}
        </CustomText>
      )}

      {portfolio && (
        <CustomText variant="body" color="disabledTextColor" mb="s">
          Enabled Tokens:{" "}
          {(portfolio.userTokenList?.data
            ? portfolio.userTokenList.data
            : portfolio.userTokenList
          )?.filter((t: any) => t.status === "ENABLED").length || 0}
        </CustomText>
      )}
    </Box>
  );
}
