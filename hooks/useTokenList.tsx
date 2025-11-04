// DEPRECATED: This hook is no longer needed
// Token list now comes directly from portfolio API via userTokenList
// Use Redux selectors instead: selectAllSupportedTokens, selectAssetsBySearch, etc.

import {
  selectAllSupportedTokens,
  selectPortfolioError,
  selectPortfolioLoading,
} from "@/state/selectors/portfolio.selectors";
import { useSelector } from "react-redux";

export const useTokenList = () => {
  // Redux state - tokens come from portfolio API
  const allSupportedTokens = useSelector(selectAllSupportedTokens);
  const isLoading = useSelector(selectPortfolioLoading);
  const error = useSelector(selectPortfolioError);

  return {
    allSupportedTokens,
    isLoading,
    error,
    fetchTokenList: () => {
      console.warn("fetchTokenList is deprecated - tokens come from portfolio API");
    },
    refetch: () => {
      console.warn("refetch is deprecated - refresh portfolio to get latest tokens");
    },
  };
};

export default useTokenList;