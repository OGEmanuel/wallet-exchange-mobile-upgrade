import { PortfolioService } from '@/services/portfolio.service';
import {
  setAllSupportedTokens,
  setTokenListError,
  setTokenListLoading
} from '@/state/reducers/portfolio.reducer';
import {
  selectAllSupportedTokens,
  selectTokenListError,
  selectTokenListLoading
} from '@/state/selectors/portfolio.selectors';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useTokenList = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const allSupportedTokens = useSelector(selectAllSupportedTokens);
  const isLoading = useSelector(selectTokenListLoading);
  const error = useSelector(selectTokenListError);

  // Fetch token list from SDK
  const fetchTokenList = useCallback(async () => {
    try {
      dispatch(setTokenListLoading(true));
      dispatch(setTokenListError(null));
      
      console.log("🔄 Fetching token list...");
      const tokenList = await PortfolioService.fetchTokenList();
      
      console.log("✅ Token list fetched successfully:", {
        totalTokens: tokenList.length,
        sampleToken: tokenList[0],
      });
      
      // Store in Redux
      dispatch(setAllSupportedTokens(tokenList));
      
    } catch (error: any) {
      console.error("❌ Failed to fetch token list:", error);
      dispatch(setTokenListError(error.message || "Failed to fetch token list"));
    } finally {
      dispatch(setTokenListLoading(false));
    }
  }, [dispatch]);

  // Auto-fetch on mount if not already loaded
  useEffect(() => {
    if (!allSupportedTokens?.length && !isLoading && !error) {
      fetchTokenList();
    }
  }, [allSupportedTokens?.length, isLoading, error, fetchTokenList]);

  return {
    allSupportedTokens,
    isLoading,
    error,
    fetchTokenList,
    refetch: fetchTokenList,
  };
};

export default useTokenList;
