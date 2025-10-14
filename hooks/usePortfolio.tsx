import { ProcessedPortfolio } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
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

  useEffect(() => {
    getProcessedPortfolio();
  }, [portfolio]);

  const getProcessedPortfolio = async () => {
    if (portfolio) {
      try {
        setIsProcessing(true);
        setError(null);
        const processed = await PortfolioService.processPortfolioData(
          portfolio
        );
        setProcessedPortfolio(processed);
      } catch (err) {
        console.error("Failed to process portfolio data:", err);
        setError("Failed to process portfolio data");
      } finally {
        setIsProcessing(false);
      }
    }
  };

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
    getProcessedPortfolio,
  };
};
