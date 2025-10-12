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
      console.log("🔍 SDK available:", !!sdk);
      console.log("🔍 SDK methods:", sdk ? Object.keys(sdk) : "No SDK");

      if (sdk) {
        // Try different SDK methods to get currency data
        console.log("🔍 Available SDK methods:", Object.keys(sdk));

        // Try tokens.getActiveTokens()
        if (sdk.tokens && sdk.tokens.getActiveTokens) {
          console.log("🔍 Trying sdk.tokens.getActiveTokens()");
          const activeTokensResponse = await sdk.tokens.getActiveTokens();
          console.log("🔍 Active tokens result:", activeTokensResponse);

          // Extract supportedCurrencies from the response structure
          if (activeTokensResponse && activeTokensResponse.data && activeTokensResponse.data.supportedCurrencies) {
            this.supportedCurrencies = activeTokensResponse.data.supportedCurrencies;
            console.log("🔍 Extracted supportedCurrencies:", this.supportedCurrencies.length);
          } else {
            this.supportedCurrencies = [];
          }
        }

        this.currenciesLoaded = true;
        console.log("✅ Final supported currencies:", this.supportedCurrencies.length);
        console.log("✅ Supported currencies data:", this.supportedCurrencies);
      } else {
        console.log("⚠️ SDK not available");
        this.supportedCurrencies = [];
        this.currenciesLoaded = true;
      }
    } catch (error) {
      console.error("❌ Failed to load supported currencies:", error);
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
    const { mainWalletGroupPortfolio, userTokenList } = portfolioData;

    // Get all accounts - we'll filter by enabled status later
    const allAccounts = mainWalletGroupPortfolio.mainWalletPortfolio.accounts;

    console.log("🔍 Total accounts available:", allAccounts.length);

    // Create a map of currencyId to token info for quick lookup
    const tokenMap = new Map<string, UserToken>();
    userTokenList.forEach(token => {
      // Handle both cases: supportedCurrencyId as object or string
      const currencyId = typeof token.supportedCurrencyId === 'string' 
        ? token.supportedCurrencyId 
        : token.supportedCurrencyId?._id;
      
      if (currencyId) {
        tokenMap.set(currencyId, token);
      } else {
        console.warn("⚠️ Token missing currency ID:", token);
      }
    });

    console.log("🔍 Token map created with", tokenMap.size, "tokens");
    console.log("🔍 Available currency IDs:", Array.from(tokenMap.keys()));
    console.log("🔍 Account currency IDs:", allAccounts.map(acc => acc.supportedCurrencyId));

    // Check for mismatched currency IDs
    const accountCurrencyIds = allAccounts.map(acc => acc.supportedCurrencyId);
    const tokenCurrencyIds = Array.from(tokenMap.keys());
    const missingCurrencyIds = accountCurrencyIds.filter(id => !tokenCurrencyIds.includes(id));
    if (missingCurrencyIds.length > 0) {
      console.log("🔍 Missing currency IDs in token map:", missingCurrencyIds);
    }

    // Process assets - include ALL tokens (enabled, disabled, hidden)
    const assets: ProcessedAsset[] = allAccounts
      .filter(account => {
        const tokenInfo = tokenMap.get(account.supportedCurrencyId);
        return tokenInfo; // Include all tokens regardless of status
      })
      .map(account => {
        const tokenInfo = tokenMap.get(account.supportedCurrencyId);
        
        if (!tokenInfo) {
          console.warn("⚠️ No token info found for account:", account.supportedCurrencyId);
          return null;
        }

        // Extract symbol and name from token info
        const { symbol, name } = this.extractSymbolAndNameFromTokenInfo(tokenInfo);
        
        // Extract chain information
        const { chainName, chainSymbol, chainImage } = this.extractChainInfo(tokenInfo);

        console.log(`🔍 Extracted for ${account._id}:`, {
          symbol,
          name,
          chainName,
          chainSymbol,
          originalChainId: tokenInfo?.supportedCurrencyId?.chainId,
          originalTokenAddress: tokenInfo?.supportedCurrencyId?.tokenAddress
        });

        return {
          id: account._id,
          symbol,
          name,
          balance: account.balance,
          totalUsdValue: account.totalUsdValue,
          price: account.balance > 0 ? account.totalUsdValue / account.balance : 0,
          change: 0, // We don't have price change data from the API
          changeType: 'positive' as const,
          image: tokenInfo?.supportedCurrencyId.image || this.getDefaultTokenImage(symbol),
          isStable: tokenInfo?.supportedCurrencyId.isStable || false,
          status: tokenInfo?.status,
          chainId: tokenInfo?.supportedCurrencyId.chainId,
          chainName,
          chainSymbol,
          chainImage,
          tokenAddress: tokenInfo?.supportedCurrencyId.tokenAddress,
          decimals: tokenInfo?.supportedCurrencyId.decimals,
        };
      })
      .filter(asset => asset !== null) as ProcessedAsset[];

    // Separate enabled and disabled assets
    const enabledAssets = assets.filter(asset => asset.status === 'ENABLED');
    const disabledAssets = assets.filter(asset => asset.status === 'DISABLED');

    console.log("🔍 Processed assets:", {
      totalAssets: assets.length,
      enabledAssets: enabledAssets.length,
      disabledAssets: disabledAssets.length,
      assets: assets.map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        balance: asset.balance,
        totalUsdValue: asset.totalUsdValue,
        status: asset.status,
        image: asset.image
      }))
    });

    return {
      totalUsdValue: mainWalletGroupPortfolio.totalUsdValue,
      assets,
      enabledAssets,
      disabledAssets,
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
   * Format currency value
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
   * Format balance with appropriate decimals
   */
  static formatBalance(balance: number, decimals: number = 6): string {
    if (balance === 0) return '0';

    const formatted = balance.toFixed(decimals);
    // Remove trailing zeros
    return parseFloat(formatted).toString();
  }

  /**
   * Get default token image based on symbol
   */
  private static getDefaultTokenImage(symbol: string): string {
    const imageMap: Record<string, string> = {
      'BTC': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747927465/Updated/BTC/Bitcoin_oulleo.svg',
      'ETH': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747862691/currencies/logos/ethereum.svg',
      'USDT': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747867509/supportedCurrencies/icons/USDT-ETH.svg',
      'USDC': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747867509/supportedCurrencies/icons/USDC-ETH.svg',
      'BNB': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747867507/supportedCurrencies/icons/BNB-BSC.svg',
      'MATIC': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747866777/supportedCurrencies/icons/MATIC-POLYGON.svg',
      'ARB': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747866774/supportedCurrencies/icons/ARB-ARBITRUM.svg',
      'SOL': 'https://res.cloudinary.com/dbkwvangu/image/upload/v1747867507/supportedCurrencies/icons/SOL-SOLANA.svg',
    };

    return imageMap[symbol] || '';
  }

  /**
   * Get asset icon color based on symbol
   */
  static getAssetIconColor(symbol: string): string {
    const colorMap: Record<string, string> = {
      'BTC': '#F7931A',
      'ETH': '#627EEA',
      'USDT': '#26A17B',
      'USDC': '#2775CA',
      'BNB': '#F3BA2F',
      'SOL': '#9945FF',
      'MATIC': '#8247E5',
      'ARB': '#28A0F0',
      'OP': '#FF0420',
      'DAI': '#F5AC37',
    };

    return colorMap[symbol] || '#6B7280';
  }
}
