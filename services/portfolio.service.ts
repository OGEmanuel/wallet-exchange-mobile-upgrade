import {
  ProcessedAsset,
  ProcessedPortfolio
} from '@/interfaces/portfolio.interface';
import { zapSDKService } from '@/src/core/sdk/zap-sdk.service';
// import { SupportedCurrency } from '@/src/core/supported-currencies/supported-currencies-context'; // Not used
import { AccountPortfolioData, IChain, ICurrency, ISupportedCurrency, IUserPortfolio, UserPortfolioData } from '@zap/blockchain-sdk';

export class PortfolioService {
  private static supportedCurrencies: ISupportedCurrency[] = [];
  private static currenciesLoaded = false;
  private static chains: IChain[] = [];

  /**
   * Select only ENABLED portfolio entries (not deleted)
   */
  static selectEnabledPortfolio(entries: IUserPortfolio[]): IUserPortfolio[] {
    return entries.filter(entry =>
      entry.status === 'ENABLED' && !entry.isDeleted
    );
  }

  /**
   * Select all supported tokens (no status filter)
   */
  static selectAllSupportedTokens(supported: ISupportedCurrency[]): ISupportedCurrency[] {
    return supported.filter(token =>
      token.isWalletActive
    );
  }

  /**
   * Map portfolio entries to supported currencies
   */
  static mapPortfolioToSupported(entries: IUserPortfolio[], supportedById: Map<string, ISupportedCurrency>): (IUserPortfolio & { supportedCurrency?: ISupportedCurrency })[] {
    return entries.map(entry => {
      const supportedCurrencyId = typeof entry.supportedCurrencyId === 'string'
        ? entry.supportedCurrencyId
        : entry.supportedCurrencyId;
      return {
        ...entry,
        supportedCurrency: supportedById.get(supportedCurrencyId)
      };
    });
  }

  /**
   * Map supported currencies to base currencies
   */
  static mapSupportedToCurrency(supported: ISupportedCurrency[], currencyById: Map<string, ICurrency>): (ISupportedCurrency & { currency?: ICurrency })[] {
    return supported.map(supportedCurrency => ({
      ...supportedCurrency,
      currency: currencyById.get((supportedCurrency.currencyId as ICurrency)?._id || ''
        ? (supportedCurrency.currencyId as ICurrency)._id || ""
        : (supportedCurrency.currencyId as string) || "")
    } as ISupportedCurrency & { currency?: ICurrency }));
  }

  /**
   * Select accounts by supported currency ID
   */
  static selectAccountsBySupportedCurrency(accounts: AccountPortfolioData[], supportedCurrencyId: string): AccountPortfolioData[] {
    return accounts.filter(account => {
      const accountSupportedCurrencyId = typeof account.supportedCurrencyId === 'string'
        ? account.supportedCurrencyId
        : account.supportedCurrencyId._id;
      return accountSupportedCurrencyId === supportedCurrencyId;
    });
  }

  /**
   * Sum balances and USD values from accounts
   */
  static sumBalancesAndUsd(accounts: AccountPortfolioData[]): { balance: number; totalUsdValue: number } {
    return accounts.reduce((sum, account) => ({
      balance: sum.balance + (account.balance || 0),
      totalUsdValue: sum.totalUsdValue + (account.totalUsdValue || 0)
    }), { balance: 0, totalUsdValue: 0 });
  }

  /**
   * Get currency market key for API calls
   */
  static currencyMarketKey(supportedCurrency: ISupportedCurrency): string {
    if (typeof supportedCurrency.currencyId === 'string') {
      return supportedCurrency.currencyId;
    }
    return supportedCurrency.currencyId._id || '';
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
   * Normalize userTokenList - handles both array and wrapped { data: [] } formats
   */
  static normalizeUserTokenList(userTokenList: IUserPortfolio[] | { data: IUserPortfolio[] } | undefined): IUserPortfolio[] {
    if (!userTokenList) return [];
    if (Array.isArray(userTokenList)) return userTokenList;
    if (typeof userTokenList === 'object' && 'data' in userTokenList && Array.isArray(userTokenList.data)) {
      return userTokenList.data;
    }
    return [];
  }

  /**
   * Extract prices and token metadata from userTokenList
   */
  private static extractTokenData(userTokenList: IUserPortfolio[], accounts: AccountPortfolioData[], supportedCurrencies?: ISupportedCurrency[]): {
    accountMap: Map<string, AccountPortfolioData>;
    supportedCurrenciesMap: Map<string, ISupportedCurrency>;
  } {
    // Create lookup maps
    const accountMap = new Map<string, AccountPortfolioData>();
    const supportedCurrenciesMap = new Map<string, ISupportedCurrency>();
    accounts.forEach(account => {
      const supportedCurrencyId = account.supportedCurrencyId?._id;
      if (supportedCurrencyId) {
        accountMap.set(supportedCurrencyId, account);
      }
    });

    supportedCurrencies?.forEach(sc => supportedCurrenciesMap.set(sc._id, sc));

    return { accountMap, supportedCurrenciesMap };
  }

  /**
   * Process raw portfolio data into a simplified, usable format
   * Balances come from batch fetching, prices come from userTokenList or market fallback
   */
  static processPortfolioData(portfolioData: UserPortfolioData, chainsMap: Map<string, IChain>, supportedCurrencies?: ISupportedCurrency[], getChainImage?: (chainId: string) => string): ProcessedPortfolio {
    try {
      const { mainWalletGroupPortfolio, userTokenList } = portfolioData;

      if (!mainWalletGroupPortfolio?.mainWalletPortfolio) {
        return this.getEmptyPortfolio();
      }

      const accounts = mainWalletGroupPortfolio.mainWalletPortfolio.accounts || [];
      const normalizedTokenList = this.normalizeUserTokenList(userTokenList);
      
      // Check for duplicates in userTokenList (same supportedCurrencyId but different _id)
      const tokenIdCounts = new Map<string, number>();
      normalizedTokenList.forEach((token) => {
        const supportedCurrencyId = typeof token.supportedCurrencyId === 'string'
          ? token.supportedCurrencyId
          : (token.supportedCurrencyId as any)?._id;
        if (supportedCurrencyId) {
          tokenIdCounts.set(supportedCurrencyId, (tokenIdCounts.get(supportedCurrencyId) || 0) + 1);
        }
      });
      
      const duplicates = Array.from(tokenIdCounts.entries()).filter(([_, count]) => count > 1);
      if (duplicates.length > 0) {
        console.log(
          `⚠️ Found ${duplicates.length} duplicate supportedCurrencyIds in userTokenList:`,
          duplicates.map(([id, count]) => `${id} (${count} entries)`)
        );
      }
      
      const { supportedCurrenciesMap, accountMap } = this.extractTokenData(normalizedTokenList, accounts, supportedCurrencies);

      // Map accounts to ProcessedAssets
      const assets: ProcessedAsset[] = normalizedTokenList.map((token) => {
        try {
          const supportedCurrencyId = (token.supportedCurrencyId as unknown as ISupportedCurrency)._id ? (token.supportedCurrencyId as unknown as ISupportedCurrency)._id : token.supportedCurrencyId;
          const supportedCurrency = supportedCurrenciesMap.get(supportedCurrencyId);
          const account = accountMap.get(supportedCurrencyId);

          // Extract currency ID
          const currency = supportedCurrency?.currencyId as ICurrency;
          const currencyId = currency?._id;

          const chain = chainsMap.get((supportedCurrency?.chainId as IChain)?._id || '');
          const chainId = chain?._id;

          // Check if stablecoin
          const isStable = typeof supportedCurrency?.isStable === 'boolean'
            ? supportedCurrency?.isStable
            : (supportedCurrency?.currencyId as ICurrency)?.isStable || false;
          const balance = token?.balance || account?.balance || 0;

          return {
            id: token._id || supportedCurrency?._id || 'unknown',
            accountId: account?._id || 'unknown',
            symbol: currency?.symbol || supportedCurrency?.symbol || '',
            name: currency?.name || supportedCurrency?.name || '',
            balance,
            totalUsdValue: balance && token.price ? balance * token.price : 0,
            price: token.price || 0,
            change: 0,
            changeType: 'positive' as const,
            image: supportedCurrency?.image || '',
            isStable,
            status: token?.status || 'DISABLED',
            source: token?.source || 'DEFAULT',
            chainId: chainId || '',
            chainName: chain?.name || '',
            chainSymbol: chain?.symbol || '',
            chainImage: getChainImage ? getChainImage(chain?._id || "") : '',
            tokenAddress: supportedCurrency?.tokenAddress || '',
            decimals: supportedCurrency?.decimals || 18,
            supportedCurrencyId,
            currencyId,
          };
        } catch (error: any) {
          console.warn('Error processing token:', token._id, error);
          console.warn('Error details:', {
            message: error?.message,
            stack: error?.stack,
            errorType: error?.constructor?.name,
          });
          const supportedCurrency = supportedCurrenciesMap.get(token.supportedCurrencyId);
          const account = accountMap.get(token.supportedCurrencyId);

          // Extract currency ID
          const currency = supportedCurrency?.currencyId as ICurrency;
          const currencyId = currency?._id;

          const chain = chainsMap.get((supportedCurrency?.chainId as IChain)?._id || '');
          const chainId = chain?._id;

          // Check if stablecoin
          const isStable = typeof supportedCurrency?.isStable === 'boolean'
            ? supportedCurrency?.isStable
            : (supportedCurrency?.currencyId as ICurrency)?.isStable || false;

          return {
            id: token._id || supportedCurrency?._id || 'unknown',
            accountId: account?._id || 'unknown',
            symbol: 'UNKNOWN',
            name: 'Unknown Token',
            balance: account?.balance || 0,
            totalUsdValue: account?.balance && token.price ? account?.balance * token.price : 0,
            price: token.price || 0,
            change: 0,
            changeType: 'positive' as const,
            image: supportedCurrency?.image || '',
            isStable: isStable || false,
            status: token?.status || 'DISABLED',
            source: token?.source || 'DEFAULT',
            chainId: chainId || '',
            chainName: chain?.name || '',
            chainSymbol: chain?.symbol || '',
            chainImage: getChainImage ? getChainImage(chain?._id || "") : '',
            tokenAddress: supportedCurrency?.tokenAddress || '',
            decimals: supportedCurrency?.decimals || 18,
            supportedCurrencyId: supportedCurrency?._id || 'unknown',
            currencyId: currencyId || '',
          };
        }
      });

      // Deduplicate assets by supportedCurrencyId (same currency + chain should only appear once)
      // Priority: 1) Has price, 2) Higher balance, 3) Enabled status
      const assetMap = new Map<string, ProcessedAsset>();
      assets.forEach((asset) => {
        // Ensure key is always a string
        const key = typeof asset.supportedCurrencyId === 'string' 
          ? asset.supportedCurrencyId 
          : (asset.supportedCurrencyId as any)?._id || asset.id;
        const existing = assetMap.get(key);
        
        if (!existing) {
          assetMap.set(key, asset);
        } else {
          // Priority order for keeping duplicates:
          // 1. Has price (price > 0) - most important for USD value calculation
          // 2. Higher balance
          // 3. Enabled status
          const assetHasPrice = asset.price > 0;
          const existingHasPrice = existing.price > 0;
          
          if (assetHasPrice && !existingHasPrice) {
            // Asset has price, existing doesn't - keep asset
            assetMap.set(key, asset);
          } else if (!assetHasPrice && existingHasPrice) {
            // Existing has price, asset doesn't - keep existing but merge balance if asset has higher balance
            if (asset.balance > existing.balance) {
              // Merge: keep existing (has price) but update balance and recalculate USD value
              existing.balance = asset.balance;
              existing.totalUsdValue = existing.balance * existing.price;
            }
            // Otherwise keep existing as-is (do nothing)
          } else if (asset.balance > existing.balance) {
            // Both have or don't have price, but asset has higher balance
            // If existing has price but asset doesn't, merge the price
            if (existingHasPrice && !assetHasPrice) {
              asset.price = existing.price;
              asset.totalUsdValue = asset.balance * asset.price;
            }
            assetMap.set(key, asset);
          } else if (
            asset.balance === existing.balance && 
            asset.status === 'ENABLED' && 
            existing.status !== 'ENABLED'
          ) {
            // Same balance, but asset is enabled and existing isn't
            // If existing has price but asset doesn't, merge the price
            if (existingHasPrice && !assetHasPrice) {
              asset.price = existing.price;
              asset.totalUsdValue = asset.balance * asset.price;
            }
            assetMap.set(key, asset);
          } else if (assetHasPrice && existingHasPrice && asset.price !== existing.price) {
            // Both have prices but different - keep the one with higher balance, or merge if needed
            if (asset.balance >= existing.balance) {
              assetMap.set(key, asset);
            }
            // Otherwise keep existing
          }
          // Otherwise keep existing (do nothing)
        }
      });
      
      const deduplicatedAssets = Array.from(assetMap.values());
      const sortedAssets = deduplicatedAssets.sort((a, b) => b.totalUsdValue - a.totalUsdValue);
      const enabledAssets = sortedAssets.filter(asset => asset.status === 'ENABLED');
      const disabledAssets = sortedAssets.filter(asset => asset.status === 'DISABLED' || asset.status === 'HIDDEN');
      const totalUsdValue = deduplicatedAssets.reduce((sum, asset) => sum + asset.totalUsdValue, 0);

      return {
        totalUsdValue,
        assets: sortedAssets,
        enabledAssets,
        disabledAssets,
        totalAssets: deduplicatedAssets.length,
        enabledCount: enabledAssets.length,
        disabledCount: disabledAssets.length,
      };
    } catch (error) {
      console.error('Portfolio processing failed:', error);
      return this.getEmptyPortfolio();
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
  static formatBalance(balance: number | string, decimals: number = 8): string {
    // Handle undefined, null, or invalid values
    if (balance === undefined || balance === null) {
      return '0';
    }

    // Convert string to number if needed
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;

    // Check if conversion resulted in invalid number
    if (isNaN(numBalance)) {
      return '0';
    }

    if (numBalance === 0) return '0';

    // Smart decimal formatting based on value size
    if (numBalance < 0.000001) {
      // Very small values: show up to 8 decimal places
      return numBalance.toFixed(8).replace(/\.?0+$/, '');
    } else if (numBalance < 0.001) {
      // Small values: show up to 6 decimal places
      return numBalance.toFixed(6).replace(/\.?0+$/, '');
    } else if (numBalance < 1) {
      // Medium values: show up to 4 decimal places
      return numBalance.toFixed(4).replace(/\.?0+$/, '');
    } else if (numBalance < 1000) {
      // Large values: show up to 2 decimal places
      return numBalance.toFixed(2).replace(/\.?0+$/, '');
    } else {
      // Very large values: use comma formatting with 2 decimal places
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numBalance);
    }
  }

  /**
   * Format balance with compact notation (K, M, B, T suffixes) for large numbers
   * Numbers under 1000 use normal formatBalance formatting
   * 
   * @param balance - The balance value to format
   * @param decimals - Optional decimals parameter (unused but kept for compatibility)
   * @returns Formatted string with K/M/B/T suffixes for numbers >= 1000
   * 
   * @example
   * formatBalanceCompact(500) // "500.00"
   * formatBalanceCompact(1000) // "1K"
   * formatBalanceCompact(3400) // "3.4K"
   * formatBalanceCompact(1200000) // "1.2M"
   * formatBalanceCompact(2500000000) // "2.5B"
   */
  static formatBalanceCompact(balance: number, decimals: number = 8): string {
    if (balance === 0) return '0';


    // Billion
    if (balance >= 1_000_000_000) {
      const billions = balance / 1_000_000_000;
      return `${billions.toFixed(1)}B`;
    }

    // Million
    if (balance >= 1_000_000) {
      const millions = balance / 1_000_000;
      return `${millions.toFixed(1)}M`;
    }

    // Thousand (1000 and above)
    if (balance >= 1000) {
      const thousands = balance / 1000;
      // Show decimal only if not a whole number
      const formatted = thousands % 1 === 0
        ? thousands.toFixed(0)
        : thousands.toFixed(1);
      return `${formatted}K`;
    }

    // Fallback (shouldn't reach here due to early return for < 1000)
    return this.formatBalance(balance, decimals);
  }
}
