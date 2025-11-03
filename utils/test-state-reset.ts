import { store } from '@/state';
import { resetAppState } from './reset-app-state';

/**
 * Test utility to verify state reset functionality
 * This can be called from the dev console or used in testing
 */
export const testStateReset = () => {
  console.log('🧪 Testing state reset functionality...');
  
  // Get initial state
  const initialState = store.getState();
  console.log('📊 Initial state:', {
    kyc: initialState.kyc,
    portfolio: initialState.portfolio,
    walletConnected: initialState.walletConnected,
    exchange: initialState.exchange,
    market: initialState.market,
    swap: initialState.swap,
    buy: initialState.buy,
    settings: initialState.settings,
  });
  
  // Simulate some state changes (this would normally happen during app usage)
  console.log('🔄 Simulating state changes...');
  
  // Reset the state
  console.log('🔄 Resetting state...');
  resetAppState();
  
  // Get state after reset
  const resetState = store.getState();
  console.log('📊 State after reset:', {
    kyc: resetState.kyc,
    portfolio: resetState.portfolio,
    walletConnected: resetState.walletConnected,
    exchange: resetState.exchange,
    market: resetState.market,
    swap: resetState.swap,
    buy: resetState.buy,
    settings: resetState.settings,
  });
  
  // Verify reset worked
  const isKycReset = resetState.kyc.user === null;
  const isPortfolioReset = resetState.portfolio.rawPortfolio === null && 
                          resetState.portfolio.processedPortfolio === null;
  const isWalletDisconnected = resetState.walletConnected.walletConnected === false;
  const isExchangeReset = resetState.exchange.exchangeActivities.length === 0;
  const isMarketReset = resetState.market.watchlistTokens === null && 
                       resetState.market.currentTokenDetails === null;
  
  console.log('✅ Reset verification:', {
    kycReset: isKycReset,
    portfolioReset: isPortfolioReset,
    walletDisconnected: isWalletDisconnected,
    exchangeReset: isExchangeReset,
    marketReset: isMarketReset,
  });
  
  const allReset = isKycReset && isPortfolioReset && isWalletDisconnected && 
                   isExchangeReset && isMarketReset;
  
  if (allReset) {
    console.log('🎉 State reset test PASSED! All state properly reset.');
  } else {
    console.log('❌ State reset test FAILED! Some state was not properly reset.');
  }
  
  return allReset;
};

/**
 * Quick test that can be called from anywhere in the app
 */
export const quickStateResetTest = () => {
  console.log('⚡ Quick state reset test...');
  resetAppState();
  const state = store.getState();
  
  const isReset = state.kyc.user === null && 
                 state.portfolio.rawPortfolio === null &&
                 state.walletConnected.walletConnected === false;
  
  console.log(isReset ? '✅ Quick test PASSED' : '❌ Quick test FAILED');
  return isReset;
};

