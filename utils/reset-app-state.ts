import { resetBuyState } from '@/src/modules/buy/presentation/state/buy-slice';
import { exchangeActions } from '@/src/modules/exchange/presentation/state/exchange-slice';
import { marketActions } from '@/src/modules/market/presentation/state/market-slice';
import { resetUserSettings } from '@/src/modules/settings/presentation/state/settings-slice';
import { resetSwapState } from '@/src/modules/swap/presentation/state/swap-slice';
import { utilitiesActions } from '@/src/modules/utilities/presentation/state/utilities-slice';
import { store } from '@/state';
import { resetActivityPage } from '@/state/reducers/activityPage.reducer';
import { resetCurrentPage } from '@/state/reducers/currentPage.reducer';
import { kycActions } from '@/state/reducers/kyc-reducer';
import { clearPortfolioData, clearTokenListData } from '@/state/reducers/portfolio.reducer';
import { resetReceivePage } from '@/state/reducers/recievePage.reducer';
import { resetSendPage } from '@/state/reducers/sendPage.reducer';
import { setWalletConnected } from '@/state/reducers/wallet.reducer';

/**
 * Resets all Redux state to initial values when user logs out
 * This preserves device settings like theme and biometric preferences
 */
export const resetAppState = (): void => {
  try {
    console.log('🔄 Starting app state reset...');
    
    const dispatch = store.dispatch;
    
    // Reset user-specific data
    dispatch(kycActions.setUser(null));
    
    // Reset portfolio and wallet data
    dispatch(clearPortfolioData());
    dispatch(clearTokenListData());
    dispatch(setWalletConnected(false));
    
    // Reset page states
    dispatch(resetCurrentPage());
    dispatch(resetActivityPage());
    dispatch(resetSendPage());
    dispatch(resetReceivePage());
    
    // Reset exchange data
    dispatch(exchangeActions.clearExchangeActivities());
    
    // Reset market data (user-specific watchlist, etc.)
    dispatch(marketActions.setWatchlistTokens(null));
    dispatch(marketActions.setCurrentTokenDetails(null));
    dispatch(marketActions.setTokenHistory(null));
    dispatch(marketActions.setWatchlistLoading(false));
    
    // Reset swap and buy states
    dispatch(resetSwapState());
    dispatch(resetBuyState());
    
    // Reset user-specific settings (preserves biometric preferences)
    dispatch(resetUserSettings());
    
    // Reset utilities data (currencies, etc.)
    dispatch(utilitiesActions.resetUtilitiesState());
    
    console.log('✅ App state reset completed successfully');
  } catch (error) {
    console.error('❌ Failed to reset app state:', error);
    // Don't throw error to prevent logout from failing
  }
};

/**
 * Resets only user-sensitive data while preserving app configuration
 * Use this for partial resets or when switching users
 */
export const resetUserData = (): void => {
  try {
    console.log('🔄 Starting user data reset...');
    
    const dispatch = store.dispatch;
    
    // Reset only user-specific data
    dispatch(kycActions.setUser(null));
    dispatch(clearPortfolioData());
    dispatch(clearTokenListData());
    dispatch(exchangeActions.clearExchangeActivities());
    dispatch(marketActions.setWatchlistTokens(null));
    dispatch(marketActions.setCurrentTokenDetails(null));
    
    console.log('✅ User data reset completed successfully');
  } catch (error) {
    console.error('❌ Failed to reset user data:', error);
  }
};
