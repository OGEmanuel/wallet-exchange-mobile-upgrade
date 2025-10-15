import { ProcessedAsset } from '@/interfaces/portfolio.interface';

/**
 * Filter tokens by chain availability and wallet activity
 */
export const filterTokensByChainAvailability = (
  tokens: ProcessedAsset[],
  chains: any[]
): ProcessedAsset[] => {
  return tokens.filter(token => {
    // Find the chain for this token
    const chain = chains.find(c => c.id === token.chainId || c.chainId === token.chainId);
    
    // Only include tokens from active chains
    return chain && chain.isWalletActive;
  });
};

/**
 * Filter chains that have supported currencies for a given currency
 */
export const filterChainsForCurrency = (
  chains: any[],
  supportedCurrencies: any[],
  currencyId: string
): any[] => {
  return chains.filter(chain => {
    // Check if there's a supported currency for this currency on this chain
    return supportedCurrencies.some(sc => 
      sc.currencyId === currencyId && 
      (sc.chainId === chain.id || sc.chainId === chain.chainId) &&
      sc.isWalletActive &&
      !sc.isDeleted
    );
  });
};

/**
 * Get available chains for a specific currency
 */
export const getAvailableChainsForCurrency = (
  currencyId: string,
  supportedCurrencies: any[],
  allChains: any[]
): any[] => {
  const relevantSupportedCurrencies = supportedCurrencies.filter(sc => 
    sc.currencyId === currencyId && sc.isWalletActive && !sc.isDeleted
  );
  
  const availableChainIds = relevantSupportedCurrencies.map(sc => sc.chainId);
  
  return allChains.filter(chain => 
    availableChainIds.includes(chain.id) || availableChainIds.includes(chain.chainId)
  );
};

/**
 * Check if a token is available on a specific chain
 */
export const isTokenAvailableOnChain = (
  token: ProcessedAsset,
  chainId: string,
  supportedCurrencies: any[]
): boolean => {
  return supportedCurrencies.some(sc => 
    sc.currencyId === token.currencyId && 
    (sc.chainId === chainId) &&
    sc.isWalletActive &&
    !sc.isDeleted
  );
};

/**
 * Get chain display info for a token
 */
export const getChainDisplayInfo = (token: ProcessedAsset, chains: any[]) => {
  const chain = chains.find(c => c.id === token.chainId || c.chainId === token.chainId);
  
  if (!chain) {
    return {
      name: 'Unknown Chain',
      symbol: '?',
      isActive: false,
      explorerUrl: null,
    };
  }
  
  return {
    name: chain.name,
    symbol: chain.symbol,
    isActive: chain.isWalletActive,
    explorerUrl: chain.explorerUrl,
  };
};

/**
 * Validate chain selection for send operations
 */
export const validateChainForSend = (
  selectedChainId: string,
  currencyId: string,
  supportedCurrencies: any[],
  chains: any[]
): { isValid: boolean; error?: string } => {
  // Check if chain exists and is active
  const chain = chains.find(c => c.id === selectedChainId || c.chainId === selectedChainId);
  if (!chain) {
    return { isValid: false, error: 'Chain not found' };
  }
  
  if (!chain.isWalletActive) {
    return { isValid: false, error: 'Chain is not active for wallet operations' };
  }
  
  // Check if currency is supported on this chain
  const isSupported = supportedCurrencies.some(sc => 
    sc.currencyId === currencyId && 
    (sc.chainId === selectedChainId) &&
    sc.isWalletActive &&
    !sc.isDeleted
  );
  
  if (!isSupported) {
    return { isValid: false, error: 'Currency not supported on this chain' };
  }
  
  return { isValid: true };
};
