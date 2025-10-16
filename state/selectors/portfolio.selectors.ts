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
export const selectAllSupportedTokens = createSelector(
  [(state: AppRootState) => state.portfolio.allSupportedTokens],
  (tokens) => tokens || []
);
export const selectTokenListLoading = (state: AppRootState) => state.portfolio.isTokenListLoading;
export const selectTokenListError = (state: AppRootState) => state.portfolio.tokenListError;

// Derived selectors
export const selectEnabledPortfolioAssets = createSelector(
  [selectProcessedPortfolio],
  (portfolio): ProcessedAsset[] => {
    if (!portfolio?.assets) return [];
    
    return portfolio.assets.filter(asset => 
      asset.status === 'ENABLED'
    );
  }
);

export const selectPortfolioAssetsByChain = createSelector(
  [selectEnabledPortfolioAssets, (state: AppRootState, chainId: string) => chainId],
  (assets, chainId) => assets.filter(asset => asset.chainId === chainId)
);

export const selectTokenBySupportedCurrencyId = createSelector(
  [selectAllSupportedTokens, (state: AppRootState, supportedCurrencyId: string) => supportedCurrencyId],
  (tokens, supportedCurrencyId): ProcessedAsset | null => {
    if (!tokens) return null;
    
    return tokens.find(token => {
      const matchesId = token.id === supportedCurrencyId;
      const matchesSupportedId = token.supportedCurrencyId?._id === supportedCurrencyId;
      const matchesSupportedIdString = token.supportedCurrencyId?._id?.toString() === supportedCurrencyId;
      const matchesIdString = token.id?.toString() === supportedCurrencyId;
      
      return matchesId || matchesSupportedId || matchesSupportedIdString || matchesIdString;
    }) || null;
  }
);

export const selectTokenByCurrencyId = createSelector(
  [selectProcessedPortfolio, (state: AppRootState, currencyId: string) => currencyId],
  (portfolio, currencyId): ProcessedAsset | null => {
    if (!portfolio?.assets) return null;
    
    return portfolio.assets.find(asset => asset.currencyId === currencyId) || null;
  }
);

// Balance selectors
export const selectTotalPortfolioValue = createSelector(
  [selectProcessedPortfolio],
  (portfolio): number => portfolio?.totalUsdValue || 0
);

export const selectAssetBalance = createSelector(
  [selectTokenBySupportedCurrencyId],
  (asset): number => asset?.balance || 0
);

export const selectAssetUsdValue = createSelector(
  [selectTokenBySupportedCurrencyId],
  (asset): number => asset?.totalUsdValue || 0
);



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

