import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { createSelector } from "@reduxjs/toolkit";
import { AppRootState } from "../index";

// Portfolio selectors
export const selectRawPortfolio = (state: AppRootState) => state.portfolio.rawPortfolio;
export const selectProcessedPortfolio = (state: AppRootState) => state.portfolio.processedPortfolio;
export const selectPortfolioLoading = (state: AppRootState) => state.portfolio.isPortfolioLoading;
export const selectPortfolioError = (state: AppRootState) => state.portfolio.portfolioError;

// Token list selectors
export const selectRawTokenList = (state: AppRootState) => state.portfolio.rawTokenList;
export const selectAllSupportedTokens = (state: AppRootState) => state.portfolio.allSupportedTokens || [];
export const selectTokenListLoading = (state: AppRootState) => state.portfolio.isTokenListLoading;
export const selectTokenListError = (state: AppRootState) => state.portfolio.tokenListError;

// Derived selectors
export const selectEnabledPortfolioAssets = (state: AppRootState): ProcessedAsset[] => {
  const portfolio = selectProcessedPortfolio(state);
  if (!portfolio?.assets) return [];
  
  return portfolio.assets.filter(asset => 
    asset.status === 'ENABLED'
  );
};

export const selectPortfolioAssetsByChain = (state: AppRootState, chainId: string): ProcessedAsset[] => {
  const assets = selectEnabledPortfolioAssets(state);
  return assets.filter(asset => asset.chainId === chainId);
};

export const selectTokenBySupportedCurrencyId = (state: AppRootState, supportedCurrencyId: string): ProcessedAsset | null => {
  const tokens = selectAllSupportedTokens(state);
  if (!tokens) return null;
  
  return tokens.find(token => {
    const matchesId = token.id === supportedCurrencyId;
    const matchesSupportedId = token.supportedCurrencyId?._id === supportedCurrencyId;
    const matchesSupportedIdString = token.supportedCurrencyId?._id?.toString() === supportedCurrencyId;
    const matchesIdString = token.id?.toString() === supportedCurrencyId;
    
    return matchesId || matchesSupportedId || matchesSupportedIdString || matchesIdString;
  }) || null;
};

export const selectTokenByCurrencyId = (state: AppRootState, currencyId: string): ProcessedAsset | null => {
  const portfolio = selectProcessedPortfolio(state);
  if (!portfolio?.assets) return null;
  
  return portfolio.assets.find(asset => asset.currencyId === currencyId) || null;
};

// Balance selectors
export const selectTotalPortfolioValue = (state: AppRootState): number => {
  const portfolio = selectProcessedPortfolio(state);
  return portfolio?.totalUsdValue || 0;
};

export const selectAssetBalance = (state: AppRootState, supportedCurrencyId: string): number => {
  const asset = selectTokenBySupportedCurrencyId(state, supportedCurrencyId);
  return asset?.balance || 0;
};

export const selectAssetUsdValue = (state: AppRootState, supportedCurrencyId: string): number => {
  const asset = selectTokenBySupportedCurrencyId(state, supportedCurrencyId);
  return asset?.totalUsdValue || 0;
};



// Filter tokens by chain
export const selectTokensByChain = createSelector(
  [selectAllSupportedTokens, (state: AppRootState, chainId: string) => chainId],
  (tokens, chainId) => (tokens || []).filter(token => token.chainId === chainId)
);

// Filter tokens by search term
export const selectTokensBySearch = createSelector(
  [selectAllSupportedTokens, (state: AppRootState, searchTerm: string) => searchTerm],
  (tokens, searchTerm) => {
    const tokenList = tokens || [];
    if (!searchTerm) return tokenList;
    const term = searchTerm.toLowerCase();
    return tokenList.filter(token => 
      token.name.toLowerCase().includes(term) ||
      token.symbol.toLowerCase().includes(term)
    );
  }
);

