import { BatchBalanceService, type AssetBatchBalanceResponse } from '@/services/batch-balance.service';
import { useQuery } from '@tanstack/react-query';
import { UserPortfolioData } from '@zap/blockchain-sdk';

interface UseBatchBalancesParams {
  portfolioData: UserPortfolioData | null;
  addressesByChain: Map<string, string>; // chainSymbol -> walletAddress
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export const useBatchBalances = ({
  portfolioData,
  addressesByChain,
  enabled = true,
  refetchInterval = 60000, // 1 minute
  staleTime = 30000, // 30 seconds
}: UseBatchBalancesParams) => {
  // Extract tokens and create batch requests
  const tokens = portfolioData
    ? BatchBalanceService.extractTokensFromPortfolio(portfolioData, addressesByChain)
    : [];
  
  const addressGroups =
    tokens.length > 0
      ? BatchBalanceService.groupTokensByAddress(tokens)
      : new Map();
  
  const batchRequests =
    addressGroups.size > 0
      ? BatchBalanceService.createBatchRequests(addressGroups)
      : [];

  // Get userTokenList from portfolio data (handle both formats)
  const userTokenList = portfolioData 
    ? (portfolioData as any).userTokenList 
    : null;

  return useQuery<Map<string, AssetBatchBalanceResponse> | null, Error>({
    queryKey: [
      'batchBalances',
      userTokenList,
      Array.from(addressesByChain.entries()).sort().join(','),
    ],
    queryFn: async () => {
      if (!portfolioData || batchRequests.length === 0) return null;

      return await BatchBalanceService.fetchBatchBalancesForAllAddresses(
        batchRequests
      );
    },
    enabled:
      enabled && !!portfolioData && batchRequests.length > 0 && tokens.length > 0,
    refetchInterval,
    staleTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

