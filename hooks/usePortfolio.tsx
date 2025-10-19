import { ProcessedPortfolio } from "@/interfaces/portfolio.interface";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { useEffect, useState } from "react";

export const usePortfolio = () => {
  const {
    portfolio,
    refreshPortfolio,
    isLoading,
    isWalletAuthenticated,
    currentWalletUser,
    error: walletError,
  } = useWallet();
  const [processedPortfolio, setProcessedPortfolio] =
    useState<ProcessedPortfolio | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portfolio processing is now handled centrally
  // This hook should use Redux state instead of processing locally

  // Check authentication status
  useEffect(() => {
    if (!isWalletAuthenticated || !currentWalletUser) {
      setError("User not authenticated. Please log in to view portfolio.");
    } else if (walletError) {
      setError(walletError);
    }
  }, [isWalletAuthenticated, currentWalletUser, walletError]);

  const handleRefresh = async () => {
    try {
      setError(null);

      // Check authentication before attempting refresh
      if (!isWalletAuthenticated || !currentWalletUser) {
        setError("User not authenticated. Please log in to refresh portfolio.");
        return;
      }

      await refreshPortfolio();
    } catch (err) {
      console.error("Failed to refresh portfolio:", err);
      setError(
        "Failed to refresh portfolio. Please check your connection and try again."
      );
    }
  };

  return {
    portfolio: processedPortfolio,
    isLoading: isLoading || isProcessing,
    error,
    refresh: handleRefresh,
    hasAssets: processedPortfolio
      ? processedPortfolio.enabledAssets.length > 0
      : false,
    totalValue: processedPortfolio?.totalUsdValue || 0,
    enabledAssets: processedPortfolio?.enabledAssets || [],
    disabledAssets: processedPortfolio?.disabledAssets || [],
  };
};
