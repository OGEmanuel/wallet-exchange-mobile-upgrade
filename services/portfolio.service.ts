import {
  PortfolioResponse,
  ProcessedAsset,
  ProcessedPortfolio,
  UserToken
} from '@/interfaces/portfolio.interface';
import zapSDKService from '@/src/core/sdk/zap-sdk.service';

export class PortfolioService {
  private static supportedCurrencies: any[] = [];
  private static currenciesLoaded = false;

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
   * Get currency info by currencyId
   */
  private static getSupportedCurrencyInfo(supportedCurrencyId: string): any {
    return this.supportedCurrencies.find(supportedCurrency =>
      supportedCurrency._id === supportedCurrencyId ||
      supportedCurrency.currencyId === supportedCurrencyId ||
      supportedCurrency.chainId?._id === supportedCurrencyId
    );
  }

  /**
   * Process raw portfolio data into a more usable format
   */
  static async processPortfolioData(portfolioData: PortfolioResponse): Promise<ProcessedPortfolio> {
    console.log('🚨🚨🚨 PortfolioService.processPortfolioData called with:', portfolioData);
    console.log('🚨🚨🚨 This should definitely show up in the logs!');
    // Load supported currencies first
    await this.loadSupportedCurrencies();

    const { mainWalletGroupPortfolio, userTokenList } = portfolioData;

    // Get all accounts - we'll filter by enabled status later
    const allAccounts = mainWalletGroupPortfolio.mainWalletPortfolio.accounts;

    // Create a map of currencyId to token info for quick lookup
    const tokenMap = new Map<string, UserToken>();

    // Extract the actual array from userTokenList
    let actualUserTokenList;
    if (Array.isArray(userTokenList)) {
      actualUserTokenList = userTokenList;
    } else if (userTokenList && typeof userTokenList === 'object' && userTokenList.data) {
      actualUserTokenList = userTokenList.data;
    } else {
      actualUserTokenList = [];
    }


    // Safety check for userTokenList
    if (!actualUserTokenList || !Array.isArray(actualUserTokenList)) {
      console.warn('⚠️ userTokenList is undefined or not an array:', userTokenList);
      return {
        totalUsdValue: 0,
        assets: [],
        enabledCount: 0,
        disabledCount: 0,
        enabledAssets: [],
        disabledAssets: [],
        totalAssets: 0,
      };
    }

    console.log('🔍 Processing tokens:', actualUserTokenList.length, 'tokens found');

    actualUserTokenList.forEach((token, index) => {

      // Handle both cases: supportedCurrencyId as object or string
      const currencyId = typeof token.supportedCurrencyId === 'string'
        ? token.supportedCurrencyId
        : token.supportedCurrencyId?._id;

      if (currencyId) {
        tokenMap.set(currencyId, token);
      }
    });

    console.log('🔍 Token map size:', tokenMap.size);

    console.log('🔍 Processing accounts:', allAccounts.length, 'accounts found');

    // Debug: Log the first few accounts to see their structure
    if (allAccounts.length > 0) {
      console.log('🔍 Token map keys:', Array.from(tokenMap.keys()));
    }

    // Process assets from accounts (tokens with balances)
    const accountAssets: ProcessedAsset[] = allAccounts
      .filter(account => {
        // Extract the supportedCurrencyId for tokenMap lookup
        const supportedCurrencyId = typeof account.supportedCurrencyId === 'string'
          ? account.supportedCurrencyId
          : account.supportedCurrencyId?._id;

        console.log('🔍 Account supportedCurrencyId (filter):', {
          accountId: account._id, // Use _id as accountId
          supportedCurrencyId: account.supportedCurrencyId,
          extractedSupportedCurrencyId: supportedCurrencyId
        });

        const tokenInfo = tokenMap.get(supportedCurrencyId);

        return tokenInfo; // Include all tokens regardless of status
      })
      .map(account => {
        // Extract the supportedCurrencyId for tokenMap lookup
        const supportedCurrencyId = typeof account.supportedCurrencyId === 'string'
          ? account.supportedCurrencyId
          : account.supportedCurrencyId?._id;

        // Extract the currencyId for markets API (ProcessedAsset.id)
        const currencyId = typeof account.supportedCurrencyId === 'string'
          ? account.supportedCurrencyId
          : account.supportedCurrencyId?.currencyId;

        console.log('🔍 Account IDs (map):', {
          accountId: account._id, // Use _id as accountId
          supportedCurrencyId: supportedCurrencyId,
          currencyId: currencyId
        });

        const tokenInfo = tokenMap.get(supportedCurrencyId);

        if (!tokenInfo) {
          return null;
        }

        // Extract symbol and name from token info
        const { symbol, name } = this.extractSymbolAndNameFromTokenInfo(tokenInfo);

        // Extract chain information
        const { chainName, chainSymbol, chainImage } = this.extractChainInfo(tokenInfo);

        // Get the numeric chain ID directly from the account's chainId
        const numericChainId = account.chainId?.chainId || parseInt(account.chainId) || undefined;

        console.log('🚨🚨🚨 Creating ProcessedAsset with supportedCurrencyId:', supportedCurrencyId);
        console.log('🚨🚨🚨 Navigation will use supportedCurrencyId, token details will extract currencyId!');
        return {
          id: supportedCurrencyId,
          accountId: account._id, // Include account ID for transaction history (use _id)
          symbol,
          name,
          balance: account.balance,
          totalUsdValue: account.totalUsdValue,
          price: account.balance > 0 ? account.totalUsdValue / account.balance : 0,
          change: 0, // We don't have price change data from the API
          changeType: 'positive' as const,
          image: tokenInfo?.supportedCurrencyId?.image ||
            account.supportedCurrencyId?.image ||
            tokenInfo?.image ||
            account.image ||
            (symbol ? `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/25` : ''),
          isStable: account.supportedCurrencyId?.isStable || false,
          status: tokenInfo?.status,
          chainId: numericChainId,
          chainName,
          chainSymbol,
          chainImage,
          tokenAddress: tokenInfo?.supportedCurrencyId.tokenAddress,
          decimals: tokenInfo?.supportedCurrencyId.decimals,
          // Store the full supportedCurrency data for easy access
          supportedCurrencyId: account.supportedCurrencyId,
          currencyId: currencyId, // For markets API
        };
      })
      .filter(asset => asset !== null) as ProcessedAsset[];

    // Process ALL tokens from userTokenList (for token management)
    const allTokenAssets: ProcessedAsset[] = actualUserTokenList.map((token, index) => {
      console.log(token, "------->TOKEN<------");
      const currencyId = typeof token.supportedCurrencyId === 'string'
        ? token.supportedCurrencyId
        : token.supportedCurrencyId?.currencyId; // Use the actual currencyId from token

      if (!currencyId) {
        return null;
      }


      // Extract symbol and name from token info
      const { symbol, name } = this.extractSymbolAndNameFromTokenInfo(token);

      // Extract chain information
      const { chainName, chainSymbol, chainImage } = this.extractChainInfo(token);

      // Get the numeric chain ID from the token's supportedCurrencyId
      const numericChainId = token.supportedCurrencyId?.chainId || undefined;

      // Get the image from the supported currencies using the currencyId
      const currencyData = this.supportedCurrencies?.find(currency => currency._id === currencyId);
      // Try multiple image sources
      const tokenImage = currencyData?.currencyId?.logo ||
        currencyData?.image ||
        token.supportedCurrencyId?.image ||
        token.image ||
        (symbol ? `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/25` : '');

      // Debug image paths for allTokenAssets
      console.log('🔍 Image debugging for allTokenAssets:', {
        tokenId: token._id,
        currencyId: currencyId,
        currencyDataImage: currencyData?.currencyId?.logo,
        tokenImage: tokenImage,
        currencyDataKeys: currencyData ? Object.keys(currencyData) : null,
        currencyIdKeys: currencyData?.currencyId ? Object.keys(currencyData.currencyId) : null,
      });


      return {
        id: token._id || currencyId,
        symbol,
        name,
        balance: 0, // No balance for tokens without accounts
        totalUsdValue: 0, // No USD value for tokens without accounts
        price: 0,
        change: 0,
        changeType: 'positive' as const,
        image: tokenImage,
        isStable: currencyData?.isStable || false,
        status: token.status,
        chainId: numericChainId,
        chainName,
        chainSymbol,
        chainImage,
        tokenAddress: currencyData?.tokenAddress,
        decimals: currencyData?.decimals,
      };
    }).filter(asset => asset !== null) as ProcessedAsset[];

    // Combine account assets with all token assets, removing duplicates
    const accountAssetIds = new Set(accountAssets.map(asset => asset.id));
    const uniqueTokenAssets = allTokenAssets.filter(asset => !accountAssetIds.has(asset.id));
    const assets = [...accountAssets, ...uniqueTokenAssets];

    // Separate enabled and disabled assets
    const enabledAssets = assets.filter(asset => asset.status === 'ENABLED');
    const disabledAssets = assets.filter(asset => asset.status === 'DISABLED');

    // Sort assets by USD value (highest first)
    const sortedAssets = assets.sort((a, b) => b.totalUsdValue - a.totalUsdValue);
    const sortedEnabledAssets = enabledAssets.sort((a, b) => b.totalUsdValue - a.totalUsdValue);
    const sortedDisabledAssets = disabledAssets.sort((a, b) => b.totalUsdValue - a.totalUsdValue);

    // Calculate total USD value - use API value or sum of enabled tokens
    let totalUsdValue = mainWalletGroupPortfolio.totalUsdValue;
    if (totalUsdValue === 0 || !totalUsdValue) {
      totalUsdValue = sortedEnabledAssets.reduce((sum, asset) => sum + asset.totalUsdValue, 0);
    }

    return {
      totalUsdValue,
      assets: sortedAssets,
      enabledAssets: sortedEnabledAssets,
      disabledAssets: sortedDisabledAssets,
      totalAssets: assets.length,
      enabledCount: enabledAssets.length,
      disabledCount: disabledAssets.length,
    };
  }

  /**
   * Extract symbol from token info using actual currency data
   */
  private static extractSymbolAndNameFromTokenInfo(tokenInfo: UserToken): { symbol: string, name: string } {
    // Try custom symbol first
    const name = tokenInfo.customName || '';
    if (tokenInfo.customSymbol) {
      return { symbol: tokenInfo.customSymbol, name: name };
    }

    // Try to get currency info from SDK data first
    const supportedCurrencyId = typeof tokenInfo.supportedCurrencyId === 'string'
      ? tokenInfo.supportedCurrencyId
      : tokenInfo.supportedCurrencyId?._id;
    const supportedCurrencyInfo = supportedCurrencyId ? this.getSupportedCurrencyInfo(supportedCurrencyId) : null;

    if (supportedCurrencyInfo && supportedCurrencyInfo?.currencyId?.symbol) {
      return { symbol: supportedCurrencyInfo?.currencyId?.symbol, name: name };
    }

    const supportedCurrency = tokenInfo.supportedCurrencyId;

    // Fallback: try to extract from image URL
    if (supportedCurrency.image) {
      const imageUrl = supportedCurrency.image;
      console.log("🔍 Image URL:", imageUrl);

      // Try to extract symbol from image URL (e.g., "USDT-ETH.svg" -> "USDT")
      const match = imageUrl.match(/\/([A-Z]+)-/);
      if (match && match[1]) {
        console.log("🔍 Extracted symbol from image URL:", match[1]);
        return { symbol: match[1], name: name };
      }
    }

    console.log("🔍 No symbol found in token info structure");
    return { symbol: "TOKEN", name: name };
  }

  /**
   * Extract chain information from token info
   */
  private static extractChainInfo(tokenInfo: UserToken): { chainName: string, chainSymbol: string, chainImage: string } {
    const supportedCurrency = tokenInfo.supportedCurrencyId;

    // Try to get chain info from SDK data first
    const supportedCurrencyId = typeof tokenInfo.supportedCurrencyId === 'string'
      ? tokenInfo.supportedCurrencyId
      : tokenInfo.supportedCurrencyId?._id;
    const supportedCurrencyInfo = supportedCurrencyId ? this.getSupportedCurrencyInfo(supportedCurrencyId) : null;

    if (supportedCurrencyInfo && supportedCurrencyInfo.chainId) {
      console.log("🔍 Found chain info in SDK data:", {
        name: supportedCurrencyInfo.chainId.name,
        symbol: supportedCurrencyInfo.chainId.symbol,
        image: supportedCurrencyInfo.nativeCurrencyId?.logo
      });
      return {
        chainName: supportedCurrencyInfo.chainId.name || "Unknown Chain",
        chainSymbol: supportedCurrencyInfo.chainId.symbol || "UNKNOWN",
        chainImage: supportedCurrencyInfo.nativeCurrencyId?.logo || "UNKNOWN"
      };
    }

    // Fallback: try to extract from the supportedCurrencyId structure
    if (supportedCurrency.chainId && typeof supportedCurrency.chainId === 'object') {
      const chainId = supportedCurrency.chainId as any; // Type assertion for dynamic structure
      return {
        chainName: chainId?.name || "Unknown Chain",
        chainSymbol: chainId?.symbol || "UNKNOWN",
        chainImage: chainId?.nativeCurrencyId?.logo || "UNKNOWN"
      };
    }

    // Final fallback
    console.log("🔍 No chain info found");
    return {
      chainName: "Unknown Chain",
      chainSymbol: "UNKNOWN",
      chainImage: "UNKNOWN"
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

  /**
   * Get all supported tokens from processed portfolio data
   */
  static async fetchTokenList(): Promise<ProcessedAsset[]> {
    try {
      console.log("🔄 Getting token list from portfolio data...");

      // Get the current portfolio data from Redux or process it
      const sdk = zapSDKService.getSDK();
      if (!sdk || !sdk.portfolio) {
        throw new Error('SDK or portfolio module not available');
      }

      // Get portfolio data
      const portfolioData = await sdk.portfolio.getUserPortfolio();
      if (!portfolioData) {
        throw new Error('No portfolio data available');
      }

      // Process the portfolio data to get all tokens
      const processed = await this.processPortfolioData(portfolioData);

      console.log("✅ Token list from portfolio:", {
        totalTokens: processed.assets?.length || 0,
        enabledTokens: processed.enabledAssets?.length || 0,
        disabledTokens: processed.disabledAssets?.length || 0,
        sampleToken: processed.assets?.[0],
      });

      // Return all assets (both enabled and disabled)
      return processed.assets || [];
    } catch (error) {
      console.error("❌ Failed to get token list from portfolio:", error);
      throw error;
    }
  }
}
