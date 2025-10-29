import {
    ProcessedAsset,
    ProcessedPortfolio
} from '@/interfaces/portfolio.interface';
import { Chain } from '@/src/core/chains/chains-context';
import { zapSDKService } from '@/src/core/sdk/zap-sdk.service';
import { SupportedCurrency } from '@/src/core/supported-currencies/supported-currencies-context';
import { AccountPortfolioData, IChain, ICurrency, ISupportedCurrency, IUserPortfolio, MarketData, UserPortfolioData } from '@zap/blockchain-sdk';

export class PortfolioService {
  private static supportedCurrencies: any[] = [];
  private static currenciesLoaded = false;
  private static chains: Chain[] = [];

  /**
   * Select only ENABLED portfolio entries (not deleted)
   */
  static selectEnabledPortfolio(entries: any[]): any[] {
    return entries.filter(entry =>
      entry.status === 'ENABLED' && !entry.isDeleted
    );
  }

  /**
   * Select all supported tokens (no status filter)
   */
  static selectAllSupportedTokens(supported: any[]): any[] {
    return supported.filter(token =>
      token.isWalletActive && !token.isDeleted
    );
  }

  /**
   * Map portfolio entries to supported currencies
   */
  static mapPortfolioToSupported(entries: any[], supportedById: Map<string, any>): any[] {
    return entries.map(entry => ({
      ...entry,
      supportedCurrency: supportedById.get(entry.supportedCurrencyId)
    }));
  }

  /**
   * Map supported currencies to base currencies
   */
  static mapSupportedToCurrency(supported: any[], currencyById: Map<string, any>): any[] {
    return supported.map(supportedCurrency => ({
      ...supportedCurrency,
      currency: currencyById.get(supportedCurrency.currencyId)
    }));
  }

  /**
   * Select accounts by supported currency ID
   */
  static selectAccountsBySupportedCurrency(accounts: any[], supportedCurrencyId: string): any[] {
    return accounts.filter(account =>
      account.supportedCurrencyId === supportedCurrencyId && !account.isDeleted
    );
  }

  /**
   * Sum balances and USD values from accounts
   */
  static sumBalancesAndUsd(accounts: any[]): { balance: number; totalUsdValue: number } {
    return accounts.reduce((sum, account) => ({
      balance: sum.balance + (account.balance || 0),
      totalUsdValue: sum.totalUsdValue + (account.totalUsdValue || 0)
    }), { balance: 0, totalUsdValue: 0 });
  }

  /**
   * Get currency market key for API calls
   */
  static currencyMarketKey(supportedCurrency: any): string {
    return supportedCurrency.currencyId;
  }

  /**
   * Load supported currencies from SDK
   */
  static async loadSupportedCurrencies(): Promise<void> {
    if (this.currenciesLoaded) return;

    try {
      const sdk = zapSDKService.getSDK();

      if (sdk) {
        // Try tokens.getActiveTokens()
        if (sdk.tokens && sdk.tokens.getActiveTokens) {
          const activeTokensResponse = await sdk.tokens.getActiveTokens();

          // Extract supportedCurrencies from the response structure
          if (activeTokensResponse && activeTokensResponse.data && activeTokensResponse.data.supportedCurrencies) {
            this.supportedCurrencies = activeTokensResponse.data.supportedCurrencies;
          } else {
            this.supportedCurrencies = [];
          }
        }

        this.currenciesLoaded = true;
      } else {
        this.supportedCurrencies = [];
        this.currenciesLoaded = true;
      }
    } catch (error) {
      console.error("Failed to load supported currencies:", error);
      this.supportedCurrencies = [];
      this.currenciesLoaded = true;
    }
  }

  /**
   * Process userTokenList into processed tokens with balances and chain info
   * Similar to how we process portfolio assets but for the full token list
   */
  static processTokenList(portfolioData: UserPortfolioData, chains?: Chain[], supportedCurrencies?: SupportedCurrency[], marketTokens?: MarketData[]): ProcessedAsset[] {
    try {
      let { mainWalletGroupPortfolio, userTokenList } = portfolioData;

      if (!userTokenList || !Array.isArray(userTokenList)) {
        if ((userTokenList as any)?.data && Array.isArray((userTokenList as any).data)) {
          userTokenList = (userTokenList as any).data;
        } else {
          console.warn('⚠️ No userTokenList found');
          return [];
        }
      }

      // Get accounts with balances for reference
      const accounts = mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts || [];
      const accountMap = new Map<string, AccountPortfolioData>();
      accounts.forEach(account => {
        const supportedCurrencyId = account.supportedCurrencyId?._id;
        if (supportedCurrencyId) {
          accountMap.set(supportedCurrencyId, account);
        }
      });

      const chainsMap = new Map<string, Chain>();
      chains?.forEach(chain => {
        chainsMap.set(chain._id, chain);
      });

      const supportedCurrenciesMap = new Map<string, SupportedCurrency>();
      supportedCurrencies?.forEach(supportedCurrency => {
        supportedCurrenciesMap.set(supportedCurrency._id || '', supportedCurrency);
      });

      console.log(`📊 Processing ${userTokenList.length} tokens`);

      // Process each token in the userTokenList
      const processedTokens: ProcessedAsset[] = userTokenList.map(token => {
        try {
          // Skip tokens with null supportedCurrencyId
          if (!token.supportedCurrencyId) {
            console.log("⚠️ Skipping token with null supportedCurrencyId:", token._id);
            return {
              id: token._id || 'unknown',
              accountId: token._id || 'unknown',
              symbol: 'UNKNOWN',
              name: 'Unknown Token',
              balance: 0,
              totalUsdValue: 0,
              price: 0,
              change: 0,
              changeType: 'positive' as const,
              image: 'https://cryptoicons.org/api/icon/unknown/25',
              isStable: false,
              status: 'DISABLED' as const,
              source: 'DEFAULT' as const,
              chainId: '',
              chainName: 'Unknown',
              chainSymbol: 'UNKNOWN',
              chainImage: '',
              tokenAddress: '',
              decimals: 18,
              supportedCurrencyId: 'unknown',
              currencyId: token._id || 'unknown',
            };
          }

          // Get the account data if this token has a balance

          // Extract token information
          const supportedCurrency = token.supportedCurrencyId as unknown as ISupportedCurrency;
          const supportedCurrencyFromMap = supportedCurrenciesMap.get((token.supportedCurrencyId as unknown as SupportedCurrency)?._id || '');
          const account = accountMap.get(supportedCurrency._id);
          const currencyId = (supportedCurrency.currencyId as ICurrency)?.symbol
            ? (supportedCurrency.currencyId as ICurrency)._id :
            typeof supportedCurrency.currencyId === 'string' ? supportedCurrency.currencyId : null

          const currency = supportedCurrencyFromMap?.currencyId as ICurrency;

          // Use account data if available, otherwise use defaults
          const balance = account?.balance || 0;
          const totalUsdValue = account?.totalUsdValue || 0;
          const isStable = typeof supportedCurrency.isStable === 'boolean' ? supportedCurrency.isStable :
            typeof (supportedCurrency?.currencyId as ICurrency)?.isStable === "boolean" ?
              (supportedCurrency?.currencyId as ICurrency)?.isStable || false : false;

          let price = 0;

          if (balance > 0) {
            price = totalUsdValue / balance;
          } else {
            // Use market price here
            const marketToken = marketTokens?.find(marketToken => marketToken.currencyId === currencyId);
            if (marketToken) {
              price = marketToken.rate || 0;
            }
          }

          return {
            id: token._id || supportedCurrency._id,
            accountId: account?._id || token._id,
            symbol: currency?.symbol || '',
            name: currency?.name || '',
            balance: balance,
            totalUsdValue: totalUsdValue,
            price,
            change: 0, // Not available from API
            changeType: 'positive' as const,
            image: supportedCurrency.image || '',
            isStable,
            status: token.status || 'DISABLED',
            source: token.source || 'DEFAULT',
            chainId: supportedCurrency.chainId as string || '',
            chainName: (supportedCurrencyFromMap?.chainId as IChain)?.name || '',
            chainSymbol: (supportedCurrencyFromMap?.chainId as IChain)?.symbol || '',
            chainImage: chainsMap.get((supportedCurrencyFromMap?.chainId as IChain)?._id || "")?.nativeCurrencyId.logo || '',
            tokenAddress: supportedCurrency?.tokenAddress || '',
            decimals: supportedCurrency?.decimals || 18,
            supportedCurrencyId: supportedCurrency._id,
            currencyId: currencyId || "",
          };
        } catch (error) {
          console.warn('⚠️ Error processing token:', token, error);
          // Return a minimal token for failed processing
          return {
            id: token._id || 'unknown',
            accountId: token._id || 'unknown',
            symbol: 'UNKNOWN',
            name: 'Unknown Token',
            balance: 0,
            totalUsdValue: 0,
            price: 0,
            change: 0,
            changeType: 'positive' as const,
            image: 'https://cryptoicons.org/api/icon/unknown/25',
            isStable: false,
            status: 'DISABLED' as const,
            source: 'DEFAULT' as const,
            chainId: '',
            chainName: 'Unknown',
            chainSymbol: 'UNKNOWN',
            chainImage: '',
            tokenAddress: '',
            decimals: 18,
            supportedCurrencyId: (token.supportedCurrencyId as unknown as ISupportedCurrency)?._id || 'unknown',
            currencyId: token._id || 'unknown',
          };
        }
      });

      console.log(`✅ Token list processing complete: ${processedTokens.length} tokens`);

      const sortedAssets = processedTokens.sort((a, b) => b.totalUsdValue - a.totalUsdValue);

      // Filter and sort
      return sortedAssets;
    } catch (error) {
      console.error('❌ Token list processing failed:', error);
      return [];
    }
  }

  /**
   * Process raw portfolio data into a simplified, usable format
   * Much simpler than the original - focuses on what UI actually needs
   */
  static processPortfolioData(portfolioData: UserPortfolioData, marketTokens?: MarketData[]): ProcessedPortfolio {
    console.log('🚀 Simplified portfolio processing started');
    
    try {
      let { mainWalletGroupPortfolio, userTokenList } = portfolioData;

      if ((userTokenList as any)?.data?.length > 0) {
        userTokenList = (userTokenList as any).data;
      }
      
      if (!mainWalletGroupPortfolio) {
        console.warn('⚠️ No main wallet group portfolio found');
        return this.getEmptyPortfolio();
      }

      // Validate portfolio data structure
      if (!mainWalletGroupPortfolio.mainWalletPortfolio) {
        console.warn('⚠️ No main wallet portfolio found');
        return this.getEmptyPortfolio();
      }

      // Extract accounts - these are the tokens with balances
      const accounts = mainWalletGroupPortfolio.mainWalletPortfolio?.accounts || [];
      console.log(`📊 Processing ${accounts.length} accounts`);

      const supportedCurrencyToTokenList = new Map<string, IUserPortfolio>();

      if ((userTokenList as any)?.data?.length > 0) {
        userTokenList = (userTokenList as any).data;
      }

      // Check if userTokenList exists and is an array
      if (userTokenList && Array.isArray(userTokenList)) {
        userTokenList.forEach(token => {
          if (!token.supportedCurrencyId) {
            console.log('supportedCurrencyId not found', token)
            return;
          };
          const supportedCurrencyId = typeof token.supportedCurrencyId === 'string' ? token.supportedCurrencyId : (token.supportedCurrencyId as ISupportedCurrency)?._id;
          if (!supportedCurrencyToTokenList.has(supportedCurrencyId)) {
            supportedCurrencyToTokenList.set(supportedCurrencyId, { ...token });
          }
        });
      } else {
        console.warn('⚠️ userTokenList is not available or not an array:', userTokenList);
      }

      // Simple processing - just what the UI needs
      const assets: ProcessedAsset[] = accounts.map(account => {
        try {
          // Based on the actual SDK types, supportedCurrencyId is an ISupportedCurrency object
        const supportedCurrency = account.supportedCurrencyId;
          const currencyId = (supportedCurrency.currencyId as ICurrency)?.symbol
            ? (supportedCurrency.currencyId as ICurrency)._id :
            typeof supportedCurrency.currencyId === 'string' ? supportedCurrency.currencyId :
              account.currencyId?.symbol ? account.currencyId._id : account.currencyId;

          // Use the correct field names from the actual SDK types
          const totalUsdValue = account.totalUsdValue || 0;
          const balance = account.balance || 0;

          const isStable = typeof supportedCurrency.isStable === 'boolean' ? supportedCurrency.isStable : typeof (supportedCurrency?.currencyId as ICurrency)?.isStable === "boolean" ? (supportedCurrency?.currencyId as ICurrency)?.isStable || false : false;

          let price = 0;

          if (balance > 0) {
            price = totalUsdValue / balance;
          } else {
            // Use market price here
            const marketToken = marketTokens?.find(marketToken =>
              typeof marketToken.currencyId === 'string' ?
                marketToken.currencyId === currencyId : (marketToken.currencyId as ICurrency)?._id === currencyId);
            if (marketToken) {
              price = marketToken.rate || 0;
            }
          }

        return {
            id: account._id,
          accountId: account._id,
          symbol: this.extractSymbol(account, supportedCurrency),
          name: this.extractName(account, supportedCurrency),
            balance: balance,
            totalUsdValue: totalUsdValue,
            price,
          change: 0, // Not available from API
          changeType: 'positive' as const,
          image: this.extractImage(supportedCurrency),
            isStable,
            status: supportedCurrencyToTokenList.get(supportedCurrency._id)?.status || 'DISABLED',
            source: supportedCurrencyToTokenList.get(supportedCurrency._id)?.source || 'DEFAULT',
          chainId: this.extractChainId(account),
          chainName: this.extractChainName(account),
          chainSymbol: this.extractChainSymbol(account),
          chainImage: this.extractChainImage(account),
            tokenAddress: supportedCurrency?.tokenAddress || '',
            decimals: supportedCurrency?.decimals || 18,
            supportedCurrencyId: supportedCurrency._id,
            currencyId: typeof currencyId === 'string' ? currencyId : (currencyId as ICurrency)._id,
          };
        } catch (error) {
          console.warn('⚠️ Error processing account:', account._id, error);
          // Return a minimal asset for failed accounts
          return {
            id: account._id,
            accountId: account._id,
            symbol: 'UNKNOWN',
            name: 'Unknown Token',
            balance: account.balance || 0,
            totalUsdValue: account.totalUsdValue || 0,
            price: 0,
            change: 0,
            changeType: 'positive' as const,
            image: 'https://cryptoicons.org/api/icon/unknown/25',
            isStable: false,
            status: 'DISABLED' as const,
            source: 'DEFAULT' as const,
            chainId: '',
            chainName: 'Unknown',
            chainSymbol: 'UNKNOWN',
            chainImage: '',
            tokenAddress: '',
            decimals: 18,
            supportedCurrencyId: account.supportedCurrencyId._id,
            currencyId: account._id,
          };
        }
      });

      const sortedAssets = assets.sort((a, b) => b.totalUsdValue - a.totalUsdValue);

      // Filter and sort
      const enabledAssets = sortedAssets.filter(asset => asset.status === 'ENABLED');
      const disabledAssets = sortedAssets.filter(asset => asset.status === 'DISABLED' || asset.status === 'HIDDEN');

      // Calculate total USD value from individual accounts instead of relying on backend total
      const calculatedTotalUsdValue = assets.reduce((sum, asset) => sum + asset.totalUsdValue, 0);

      const result = {
        totalUsdValue: calculatedTotalUsdValue, // Use calculated total instead of backend total
        assets: sortedAssets,
        enabledAssets,
        disabledAssets,
        totalAssets: assets.length,
        enabledCount: enabledAssets.length,
        disabledCount: disabledAssets.length,
      };

      console.log(`✅ Simplified processing complete: ${result.totalAssets} assets, $${result.totalUsdValue.toFixed(2)} total value`);
      return result;
    } catch (error) {
      console.error('❌ Simplified portfolio processing failed:', error);
      return this.getEmptyPortfolio();
    }
  }

  /**
   * Extract symbol with simple fallbacks
   */
  private static extractSymbol(account: AccountPortfolioData, supportedCurrency: ISupportedCurrency): string {
    try {
      // Try custom symbol first (from user preferences)
      // if (supportedCurrency?.customSymbol) {
      //   return supportedCurrency.customSymbol;
      // }

      // Try currency symbol from the currency object
      const currencySymbol = (supportedCurrency.currencyId as ICurrency)?.symbol;
      if (currencySymbol) {
        return currencySymbol;
      }

      // Try direct symbol from supportedCurrency
      if (supportedCurrency?.symbol) {
        return supportedCurrency.symbol;
      }

      // Fallback to account symbol or currencyId
      return account.symbol || account.currencyId.symbol || 'UNKNOWN';
    } catch (error) {
      console.warn('⚠️ Error extracting symbol:', error);
      return 'UNKNOWN';
    }
  }

  /**
   * Extract name with simple fallbacks
   */
  private static extractName(account: AccountPortfolioData, supportedCurrency: ISupportedCurrency): string {
    try {
      // Try custom name first (from user preferences)
      // if (supportedCurrency?.customName) {
      //   return supportedCurrency.customName;
      // }

      // Try currency name from the currency object
      const currencyName = (supportedCurrency.currencyId as ICurrency)?.name;
      if (currencyName) {
        return currencyName;
      }

      // Try direct name from supportedCurrency
      if (supportedCurrency?.name) {
        return supportedCurrency.name;
    }
    
    // Fallback to account name
      return account.currencyId.name || account.name || 'Unknown Token';
    } catch (error) {
      console.warn('⚠️ Error extracting name:', error);
      return 'Unknown Token';
    }
  }

  /**
   * Extract image with simple fallbacks
   */
  private static extractImage(supportedCurrency: ISupportedCurrency): string {
    try {
      // Try direct image from supportedCurrency
    if (supportedCurrency?.image) {
      return supportedCurrency.image;
    }

      // Try currency logo from the currency object
      const currencyLogo = (supportedCurrency.currencyId as ICurrency)?.logo;
      if (currencyLogo) {
        return currencyLogo;
    }
    
    // Simple fallback
    return 'https://cryptoicons.org/api/icon/unknown/25';
    } catch (error) {
      console.warn('⚠️ Error extracting image:', error);
      return 'https://cryptoicons.org/api/icon/unknown/25';
    }
  }

  /**
   * Extract chain ID
   */
  private static extractChainId(account: AccountPortfolioData): string {
    try {
      if (typeof account.chainId === 'string') {
        return account.chainId;
      }
      if (account.chainId?._id) {
        return account.chainId._id;
      }
      return '';
    } catch (error) {
      console.warn('⚠️ Error extracting chain ID:', error);
      return '';
    }
  }

  /**
   * Extract chain name
   */
  private static extractChainName(account: AccountPortfolioData): string {
    try {
    return account.chainId?.name || 'Unknown Chain';
    } catch (error) {
      console.warn('⚠️ Error extracting chain name:', error);
      return 'Unknown Chain';
    }
  }

  /**
   * Extract chain symbol
   */
  private static extractChainSymbol(account: AccountPortfolioData): string {
    try {
    return account.chainId?.symbol || 'UNKNOWN';
    } catch (error) {
      console.warn('⚠️ Error extracting chain symbol:', error);
      return 'UNKNOWN';
    }
  }

  /**
   * Extract chain image
   */
  private static extractChainImage(account: AccountPortfolioData): string {
    try {
      // Based on the actual SDK types, chainId is an IChain object
      const chainAsChainContext = account.chainId as unknown as Chain;
      if (chainAsChainContext.nativeCurrencyId?.logo) {
        return chainAsChainContext.nativeCurrencyId.logo;
      }

      // Fallback
      return '';
    } catch (error) {
      console.warn('⚠️ Error extracting chain image:', error);
      return '';
    }
  }

  /**
   * Return empty portfolio structure
   */
  private static getEmptyPortfolio(): ProcessedPortfolio {
    return {
      totalUsdValue: 0,
      assets: [],
      enabledAssets: [],
      disabledAssets: [],
      totalAssets: 0,
      enabledCount: 0,
      disabledCount: 0,
    };
  }

  /**
   * Calculate aggregated balances for wallet groups
   * This solves the issue where backend gives individual account balances
   * but not aggregated wallet/wallet group totals
   */
  static calculateAggregatedBalances(portfolioData: any): {
    walletBalances: Map<string, number>;
    walletGroupBalances: Map<string, number>;
    totalPortfolioValue: number;
  } {
    const walletBalances = new Map<string, number>();
    const walletGroupBalances = new Map<string, number>();
    let totalPortfolioValue = 0;

    try {
      const { mainWalletGroupPortfolio, walletGroupPortfolios } = portfolioData;

      // Process all wallet groups, not just the main one
      const allWalletGroups = {
        ...walletGroupPortfolios,
        // Include main wallet group if it exists
        ...(mainWalletGroupPortfolio?.walletGroup?._id && {
          [mainWalletGroupPortfolio.walletGroup._id]: mainWalletGroupPortfolio
        })
      };

      if (!allWalletGroups || Object.keys(allWalletGroups).length === 0) {
        return { walletBalances, walletGroupBalances, totalPortfolioValue };
      }

      // Group accounts by wallet and wallet group
      const walletMap = new Map<string, { accounts: any[], totalValue: number }>();
      const walletGroupMap = new Map<string, { wallets: Set<string>, totalValue: number }>();

      // Process each wallet group
      Object.values(allWalletGroups).forEach((walletGroupPortfolio: any, index: number) => {
        if (!walletGroupPortfolio?.mainWalletPortfolio?.accounts) {
          return;
        }

        const accounts = walletGroupPortfolio.mainWalletPortfolio.accounts;
        const walletGroupId = walletGroupPortfolio.walletGroup?._id;

        accounts.forEach((account: AccountPortfolioData & { walletId: string }) => {
          const walletId = account.walletId;
          const accountValue = account.totalUsdValue || 0;

          // Aggregate by wallet
          if (!walletMap.has(walletId)) {
            walletMap.set(walletId, { accounts: [], totalValue: 0 });
          }
          const walletData = walletMap.get(walletId)!;
          walletData.accounts.push(account);
          walletData.totalValue += accountValue;

          // Aggregate by wallet group
          if (walletGroupId) {
            if (!walletGroupMap.has(walletGroupId)) {
              walletGroupMap.set(walletGroupId, { wallets: new Set(), totalValue: 0 });
            }
            const groupData = walletGroupMap.get(walletGroupId)!;
            groupData.wallets.add(walletId);
            groupData.totalValue += accountValue;
          }
        });
      });

      // Store wallet balances
      walletMap.forEach((data, walletId) => {
        walletBalances.set(walletId, data.totalValue);
        totalPortfolioValue += data.totalValue;
      });

      // Store wallet group balances
      walletGroupMap.forEach((data, walletGroupId) => {
        walletGroupBalances.set(walletGroupId, data.totalValue);
      });

    } catch (error) {
      console.error('Failed to calculate aggregated balances:', error);
    }

    return { walletBalances, walletGroupBalances, totalPortfolioValue };
  }

  /**
   * Get cached aggregated balances for a specific wallet
   */
  static getWalletBalance(walletId: string, portfolioData: any): number {
    const { walletBalances } = this.calculateAggregatedBalances(portfolioData);
    return walletBalances.get(walletId) || 0;
  }

  /**
   * Get cached aggregated balances for a specific wallet group
   */
  static getWalletGroupBalance(walletGroupId: string, portfolioData: any): number {
    const { walletGroupBalances } = this.calculateAggregatedBalances(portfolioData);
    return walletGroupBalances.get(walletGroupId) || 0;
  }

  /**
   * Get total portfolio value from aggregated balances
   */
  static getTotalPortfolioValue(portfolioData: any): number {
    const { totalPortfolioValue } = this.calculateAggregatedBalances(portfolioData);
    return totalPortfolioValue;
  }

  /**
   * Format currency value with 2 decimal places and comma separators
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  /**
   * Format balance with smart decimal handling and comma separators
   */
  static formatBalance(balance: number, decimals: number = 8): string {
    if (balance === 0) return '0';

    // Smart decimal formatting based on value size
    if (balance < 0.000001) {
      // Very small values: show up to 8 decimal places
      return balance.toFixed(8).replace(/\.?0+$/, '');
    } else if (balance < 0.001) {
      // Small values: show up to 6 decimal places
      return balance.toFixed(6).replace(/\.?0+$/, '');
    } else if (balance < 1) {
      // Medium values: show up to 4 decimal places
      return balance.toFixed(4).replace(/\.?0+$/, '');
    } else if (balance < 1000) {
      // Large values: show up to 2 decimal places
      return balance.toFixed(2).replace(/\.?0+$/, '');
    } else {
      // Very large values: use comma formatting with 2 decimal places
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance);
    }
  }
}
