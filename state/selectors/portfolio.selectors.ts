import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { createSelector } from "@reduxjs/toolkit";
import { AppRootState } from "../index";

// Portfolio selectors
export const selectRawPortfolio = (state: AppRootState) => state.portfolio.rawPortfolio;
export const selectProcessedPortfolio = (state: AppRootState) => state.portfolio.processedPortfolio;
export const selectPortfolioLoading = (state: AppRootState) => state.portfolio.isPortfolioLoading;
export const selectPortfolioError = (state: AppRootState) => state.portfolio.portfolioError;

export const selectAllSupportedTokens = createSelector(
  [(state: AppRootState) => state.portfolio.processedPortfolio],
  (portfolio) => portfolio?.assets || []
);

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

export const selectAssetBySupportedCurrencyId = createSelector(
  [selectAllSupportedTokens, (state: AppRootState, supportedCurrencyId: string) => supportedCurrencyId],
  (assets, supportedCurrencyId): ProcessedAsset | null => {
    if (!assets) return null;

    return assets.find(asset => {
      const matchesId = asset.id === supportedCurrencyId;
      const matchesSupportedId = asset.supportedCurrencyId?._id === supportedCurrencyId;
      const matchesSupportedIdString = asset.supportedCurrencyId?._id?.toString() === supportedCurrencyId;
      const matchesIdString = asset.id?.toString() === supportedCurrencyId;

      return matchesId || matchesSupportedId || matchesSupportedIdString || matchesIdString;
    }) || null;
  }
);

export const selectAssetByCurrencyId = createSelector(
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
  [selectAssetBySupportedCurrencyId],
  (asset): number => asset?.balance || 0
);

export const selectAssetUsdValue = createSelector(
  [selectAssetBySupportedCurrencyId],
  (asset): number => asset?.totalUsdValue || 0
);



// Filter tokens by chain
export const selectAssetsByChain = createSelector(
  [selectAllSupportedTokens, (state: AppRootState, chainId: string) => chainId],
  (tokens, chainId) => (tokens || []).filter(token => token.chainId === chainId)
);

// Filter tokens by search term
export const selectAssetsBySearch = createSelector(
  [selectAllSupportedTokens, (state: AppRootState, searchTerm: string) => searchTerm],
  (assets, searchTerm) => {
    if (!searchTerm) return assets;
    const term = searchTerm.toLowerCase();
    return assets.filter(asset =>
      asset.name?.toLowerCase().includes(term) ||
      asset.symbol?.toLowerCase().includes(term)
    );
  }
);

