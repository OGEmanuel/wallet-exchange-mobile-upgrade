import { ProcessedAsset, ProcessedPortfolio } from "@/interfaces/portfolio.interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PortfolioState {
  // Raw data from SDK
  rawPortfolio: any | null;
  rawTokenList: any[] | null;
  
  // Processed data
  processedPortfolio: ProcessedPortfolio | null;
  processedTokenList: ProcessedAsset[] | null; // Processed token list with balances
  allSupportedTokens: ProcessedAsset[] | null; // Keep for backward compatibility
  
  // Loading states
  isPortfolioLoading: boolean;
  isTokenListLoading: boolean;
  
  // Error states
  portfolioError: string | null;
  tokenListError: string | null;
}

const initialState: PortfolioState = {
  rawPortfolio: null,
  rawTokenList: null,
  processedPortfolio: null,
  processedTokenList: null,
  allSupportedTokens: null,
  isPortfolioLoading: false,
  isTokenListLoading: false,
  portfolioError: null,
  tokenListError: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    // Raw data setters
    setRawPortfolio: (state, action: PayloadAction<any | null>) => {
      state.rawPortfolio = action.payload;
    },
    setRawTokenList: (state, action: PayloadAction<any[] | null>) => {
      state.rawTokenList = action.payload;
    },
    
    // Processed data setters
    setProcessedPortfolio: (state, action: PayloadAction<ProcessedPortfolio | null>) => {
      state.processedPortfolio = action.payload;
    },
    setProcessedTokenList: (state, action: PayloadAction<ProcessedAsset[] | null>) => {
      state.processedTokenList = action.payload;
    },
    setAllSupportedTokens: (state, action: PayloadAction<ProcessedAsset[] | null>) => {
      state.allSupportedTokens = action.payload;
    },
    
    // Loading states
    setPortfolioLoading: (state, action: PayloadAction<boolean>) => {
      state.isPortfolioLoading = action.payload;
    },
    setTokenListLoading: (state, action: PayloadAction<boolean>) => {
      state.isTokenListLoading = action.payload;
    },
    
    // Error states
    setPortfolioError: (state, action: PayloadAction<string | null>) => {
      state.portfolioError = action.payload;
    },
    setTokenListError: (state, action: PayloadAction<string | null>) => {
      state.tokenListError = action.payload;
    },
    
    // Clear all data
    clearPortfolioData: (state) => {
      state.rawPortfolio = null;
      state.processedPortfolio = null;
      state.portfolioError = null;
    },
    clearTokenListData: (state) => {
      state.rawTokenList = null;
      state.allSupportedTokens = null;
      state.tokenListError = null;
    },
  },
});

export const {
  setRawPortfolio,
  setRawTokenList,
  setProcessedPortfolio,
  setProcessedTokenList,
  setAllSupportedTokens,
  setPortfolioLoading,
  setTokenListLoading,
  setPortfolioError,
  setTokenListError,
  clearPortfolioData,
  clearTokenListData,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
