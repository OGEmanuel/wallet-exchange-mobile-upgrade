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
    // Load supported currencies first
    await this.loadSupportedCurrencies();

    console.log('🔍 Portfolio data structure:', {
      hasMainWalletGroupPortfolio: !!portfolioData.mainWalletGroupPortfolio,
      hasUserTokenList: !!portfolioData.userTokenList,
      userTokenListType: typeof portfolioData.userTokenList,
      userTokenListLength: Array.isArray(portfolioData.userTokenList) ? portfolioData.userTokenList.length : 'not array',
      portfolioDataKeys: Object.keys(portfolioData),
      fullPortfolioData: portfolioData
    });

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

    console.log('🔍 Extracted userTokenList:', {
      original: userTokenList,
      extracted: actualUserTokenList,
      isArray: Array.isArray(actualUserTokenList),
      length: Array.isArray(actualUserTokenList) ? actualUserTokenList.length : 'not array'
    });

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
      console.log(`🔍 Token ${index}:`, {
        id: token._id,
        status: token.status,
        supportedCurrencyId: token.supportedCurrencyId,
        customName: token.customName,
        customSymbol: token.customSymbol
      });

      // Handle both cases: supportedCurrencyId as object or string
      const currencyId = typeof token.supportedCurrencyId === 'string'
        ? token.supportedCurrencyId
        : token.supportedCurrencyId?._id;

      if (currencyId) {
        tokenMap.set(currencyId, token);
        console.log(`✅ Added token to map: ${currencyId}`);
      }
    });

    console.log('🔍 Token map size:', tokenMap.size);

    console.log('🔍 Processing accounts:', allAccounts.length, 'accounts found');

    // Debug: Log the first few accounts to see their structure
    if (allAccounts.length > 0) {
      console.log('🔍 First account structure:', JSON.stringify(allAccounts[0], null, 2));
      console.log('🔍 Token map keys:', Array.from(tokenMap.keys()));
    }

    // Process assets from accounts (tokens with balances)
    const accountAssets: ProcessedAsset[] = allAccounts
      .filter(account => {
        // Extract the _id from supportedCurrencyId object
        const currencyId = typeof account.supportedCurrencyId === 'string'
          ? account.supportedCurrencyId
          : account.supportedCurrencyId?._id;

        const tokenInfo = tokenMap.get(currencyId);
        console.log(`🔍 Account ${currencyId}:`, {
          hasTokenInfo: !!tokenInfo,
          balance: account.balance,
          totalUsdValue: account.totalUsdValue,
          accountStructure: account
        });
        return tokenInfo; // Include all tokens regardless of status
      })
      .map(account => {
        // Extract the _id from supportedCurrencyId object
        const currencyId = typeof account.supportedCurrencyId === 'string'
          ? account.supportedCurrencyId
          : account.supportedCurrencyId?._id;

        const tokenInfo = tokenMap.get(currencyId);

        if (!tokenInfo) {
          return null;
        }

        // Extract symbol and name from token info
        const { symbol, name } = this.extractSymbolAndNameFromTokenInfo(tokenInfo);

        // Extract chain information
        const { chainName, chainSymbol, chainImage } = this.extractChainInfo(tokenInfo);

        // Get the numeric chain ID directly from the account's chainId
        const numericChainId = account.chainId?.chainId || parseInt(account.chainId) || undefined;

        return {
          id: account._id,
          symbol,
          name,
          balance: account.balance,
          totalUsdValue: account.totalUsdValue,
          price: account.balance > 0 ? account.totalUsdValue / account.balance : 0,
          change: 0, // We don't have price change data from the API
          changeType: 'positive' as const,
          image: account.supportedCurrencyId?.image || '',
          isStable: account.supportedCurrencyId?.isStable || false,
          status: tokenInfo?.status,
          chainId: numericChainId,
          chainName,
          chainSymbol,
          chainImage,
          tokenAddress: tokenInfo?.supportedCurrencyId.tokenAddress,
          decimals: tokenInfo?.supportedCurrencyId.decimals,
        };
      })
      .filter(asset => asset !== null) as ProcessedAsset[];

    // Process ALL tokens from userTokenList (for token management)
    const allTokenAssets: ProcessedAsset[] = actualUserTokenList.map((token, index) => {
      const currencyId = typeof token.supportedCurrencyId === 'string'
        ? token.supportedCurrencyId
        : token.supportedCurrencyId?._id;

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
      // Use the base currency logo from the nested currencyId object, not the chain-specific image
      const tokenImage = currencyData?.currencyId?.logo || '';
      

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
      console.log("🔍 Found symbol in SDK currency data:", supportedCurrencyInfo?.currencyId?.symbol);
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
   * Format currency value with 2 decimal places
   */
  static formatCurrency(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  /**
   * Format balance with smart decimal handling
   */
  static formatBalance(balance: number, decimals: number = 6): string {
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
      // Very large values: show up to 2 decimal places
      return balance.toFixed(2).replace(/\.?0+$/, '');
    }
  }
}
