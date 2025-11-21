import { zapSDKService } from '@/src/core/sdk/zap-sdk.service';
import { AccountPortfolioData, IChain, ICurrency, ISupportedCurrency, UserPortfolioData } from '@zap/blockchain-sdk';
import { PortfolioService } from './portfolio.service';

// Define types based on the batch balance guide
export interface AssetBalanceRequest {
  assetId: string;
  tokenAddress: string;
  chainSymbol: string;
}

export interface AssetBatchBalanceRequest {
  targetAddress: string;
  assets: AssetBalanceRequest[];
}

export interface AssetBatchBalanceResult {
  assetId: string;
  chainSymbol: string;
  tokenAddress: string;
  balance: string;
  balanceFormatted?: string;
  decimals: number;
  symbol: string;
  name: string;
  error?: string;
}

export interface AssetBatchBalanceResponse {
  targetAddress: string;
  results: AssetBatchBalanceResult[];
  nativeBalances: {
    chainSymbol: string;
    balance: number;
    balanceFormatted?: string;
  }[];
  totalAssets: number;
  successfulAssets: number;
  failedAssets: number;
  byChain: {
    [chainSymbol: string]: {
      nativeBalance: number;
      tokenBalances: AssetBatchBalanceResult[];
    };
  };
}

interface TokenWithAddress {
  accountId?: string; // Optional - only needed if we want to update account balances, but we update userTokenList directly
  tokenId?: string; // The userToken._id - used to identify the token in userTokenList
  supportedCurrencyId: string;
  tokenAddress: string | null;
  chainSymbol: string;
  chainId: string;
  walletAddress: string; // The wallet address for this chain
}

interface AddressGroup {
  address: string;
  tokens: TokenWithAddress[];
}

export class BatchBalanceService {
  /**
   * Extract tokens from portfolio userTokenList and group by address
   * This prepares tokens for batch balance fetching
   * Also finds matching accounts from portfolio to use their actual _id
   */
  static extractTokensFromPortfolio(
    portfolioData: UserPortfolioData,
    addressesByChain: Map<string, string> // chainSymbol -> walletAddress
  ): TokenWithAddress[] {
    const tokens: TokenWithAddress[] = [];
    const userTokenList = portfolioData.userTokenList || [];

    // Handle different userTokenList formats
    const tokenList = PortfolioService.normalizeUserTokenList(userTokenList);

    // Get all accounts from the portfolio to match with tokens
    const accounts: AccountPortfolioData[] = [];
    if (
      portfolioData.mainWalletGroupPortfolio?.mainWalletPortfolio
        ?.accounts
    ) {
      accounts.push(
        ...portfolioData.mainWalletGroupPortfolio.mainWalletPortfolio
          .accounts
      );
    }

    let skippedNoTokenAddress = 0;
    let skippedNoWalletAddress = 0;
    let skippedStringSupportedCurrencyId = 0;
    let skippedNoSupportedCurrencyId = 0;
    let tokensWithoutAccount = 0; // Tokens without matching account but still processed
    let tokensWithAccount = 0; // Tokens with matching account
    let processedTokens = 0;

    console.log(`🔍 Batch Balance: Processing ${tokenList.length} tokens from portfolio`);
    console.log(`🔍 Batch Balance: Found ${accounts.length} accounts in portfolio`);

    // Log all token supportedCurrencyIds for debugging
    const tokenSupportedCurrencyIds = tokenList.map((token) => {
      const supportedCurrencyIdRaw = token.supportedCurrencyId;
      let supportedCurrencyId: string | undefined;
      let hasTokenAddress = false;
      let symbol: string | undefined;
      
      if (typeof supportedCurrencyIdRaw === 'string') {
        supportedCurrencyId = supportedCurrencyIdRaw;
      } else if (supportedCurrencyIdRaw && typeof supportedCurrencyIdRaw === 'object') {
        supportedCurrencyId = (supportedCurrencyIdRaw as any)?._id;
        hasTokenAddress = !!(supportedCurrencyIdRaw as any)?.tokenAddress;
        symbol = (supportedCurrencyIdRaw as any)?.symbol || (supportedCurrencyIdRaw as any)?.currencyId?.symbol;
      }
      
      return {
        tokenId: token._id?.slice(-8) || 'unknown',
        supportedCurrencyId: supportedCurrencyId?.slice(-8) || 'undefined',
        hasTokenAddress,
        symbol: symbol || 'N/A'
      };
    });
    console.log(`🔍 Token supportedCurrencyIds (${tokenSupportedCurrencyIds.length} tokens):`, tokenSupportedCurrencyIds);

    // create map of supportedCurrencyId to account
    const supportedCurrencyToAccount = new Map<string, AccountPortfolioData>();
    const accountDetails: {accountId: string, supportedCurrencyId: string | undefined, currencySymbol?: string}[] = [];
    
    accounts.forEach((account) => {
      // Handle both string and object formats for supportedCurrencyId
      const supportedCurrencyId = typeof account.supportedCurrencyId === 'string'
        ? account.supportedCurrencyId
        : account.supportedCurrencyId?._id;
      
      const currencySymbol = typeof account.supportedCurrencyId === 'object' && account.supportedCurrencyId
        ? (account.supportedCurrencyId as any)?.currencyId?.symbol || (account.supportedCurrencyId as any)?.symbol
        : undefined;
      
      if (supportedCurrencyId) {
        supportedCurrencyToAccount.set(supportedCurrencyId, account);
        accountDetails.push({accountId: account._id, supportedCurrencyId, currencySymbol});
      } else {
        console.warn(`⚠️ Account ${account?._id} has invalid supportedCurrencyId:`, account.supportedCurrencyId);
        accountDetails.push({accountId: account._id, supportedCurrencyId: undefined, currencySymbol});
      }
    });

    console.log(`🔍 Batch Balance: Mapped ${supportedCurrencyToAccount.size} accounts by supportedCurrencyId`);
    console.log(`🔍 Account details:`, accountDetails.map(a => ({
      accountId: a.accountId.slice(-8),
      supportedCurrencyId: a.supportedCurrencyId?.slice(-8) || 'undefined',
      currencySymbol: a.currencySymbol || 'N/A'
    })));

    tokenList.forEach((userToken) => {
      // Handle both string and object formats for supportedCurrencyId
      const supportedCurrencyIdRaw = userToken.supportedCurrencyId;
      let supportedCurrency: ISupportedCurrency | undefined;
      let supportedCurrencyId: string | undefined;

      // Extract supportedCurrencyId and supportedCurrency object
      if (typeof supportedCurrencyIdRaw === 'string') {
        supportedCurrencyId = supportedCurrencyIdRaw;
        // If it's a string, we can't proceed because we need the full object for chainId and tokenAddress
        skippedStringSupportedCurrencyId++;
        console.warn(`⚠️ Token ${userToken._id} has supportedCurrencyId as string (${supportedCurrencyId}) but no full object. Skipping.`);
        return;
      } else if (supportedCurrencyIdRaw && typeof supportedCurrencyIdRaw === 'object') {
        supportedCurrency = supportedCurrencyIdRaw as unknown as ISupportedCurrency;
        // Safely extract _id - it might not exist
        supportedCurrencyId = (supportedCurrency as any)?._id;
        
        if (!supportedCurrencyId) {
          skippedNoSupportedCurrencyId++;
          console.warn(`⚠️ Token ${userToken._id} has supportedCurrencyId object but no _id property:`, supportedCurrencyIdRaw);
          return;
        }
      } else {
        skippedNoSupportedCurrencyId++;
        console.warn(`⚠️ Token ${userToken._id} has invalid supportedCurrencyId type:`, typeof supportedCurrencyIdRaw, supportedCurrencyIdRaw);
        return;
      }

      if (!supportedCurrency || !supportedCurrencyId) {
        skippedNoSupportedCurrencyId++;
        console.warn(`⚠️ Token ${userToken._id} missing required supportedCurrency data. Skipping.`);
        return;
      }

      const chainId = supportedCurrency.chainId;
      const chainSymbol = this.getChainSymbol(chainId as IChain, supportedCurrency);
      const walletAddress = addressesByChain.get(chainSymbol);

      if (!walletAddress) {
        skippedNoWalletAddress++;
        // Only log if we have a chainSymbol (to avoid noise from tokens on chains without addresses)
        if (chainSymbol) {
          console.log(`ℹ️ Token ${supportedCurrency.symbol || supportedCurrencyId} on ${chainSymbol} skipped: No wallet address for this chain`);
        }
        return;
      }

      // Skip tokens without tokenAddress (native tokens like ETH, SOL, BTC)
      // Batch balance API is for ERC20/SPL tokens with contract addresses
      // Native balances are fetched separately via the batch balance API's nativeBalances response
      if (!supportedCurrency.tokenAddress) {
        skippedNoTokenAddress++;
        return;
      }

      const matchingAccount = supportedCurrencyToAccount.get(supportedCurrencyId);

      // Note: We don't require a matching account anymore!
      // We update balances directly on userTokenList items by supportedCurrencyId
      // The accountId is optional and only used for reference
      if (matchingAccount) {
        tokensWithAccount++;
      } else {
        tokensWithoutAccount++;
        // Log but don't skip - we can still fetch balance for tokens in userTokenList
        const tokenSymbol = supportedCurrency.symbol || (supportedCurrency.currencyId as any)?.symbol || 'unknown';
        console.log(
          `ℹ️ Token ${tokenSymbol} (${supportedCurrencyId?.slice(-8)}) on chain ${chainSymbol} has no matching account, but will still fetch balance from userTokenList.`
        );
      }

      processedTokens++;
      tokens.push({
        accountId: matchingAccount?._id, // Optional - only if account exists
        tokenId: userToken._id, // The userToken._id for reference
        supportedCurrencyId: supportedCurrencyId,
        tokenAddress: supportedCurrency.tokenAddress,
        chainSymbol,
        chainId: (chainId as IChain)?._id || (chainId as string) || '',
        walletAddress,
      });
    });

    console.log(`📊 Batch Balance Extraction Summary:`);
    console.log(`  ✅ Processed tokens: ${processedTokens}`);
    console.log(`  ⏭️  Skipped - No tokenAddress (native tokens): ${skippedNoTokenAddress}`);
    console.log(`  ⏭️  Skipped - No wallet address: ${skippedNoWalletAddress}`);
    console.log(`  ⏭️  Skipped - String supportedCurrencyId: ${skippedStringSupportedCurrencyId}`);
    console.log(`  ⏭️  Skipped - No supportedCurrencyId: ${skippedNoSupportedCurrencyId}`);
    console.log(`  ℹ️  Tokens without matching account (still processed): ${tokensWithoutAccount}`);
    console.log(`  ✅ Tokens with matching account: ${tokensWithAccount}`);
    console.log(`  📦 Total tokens for batch fetch: ${tokens.length}`);

    return tokens;
  }

  /**
   * Group tokens by wallet address
   * Since batch balance API needs one address per request,
   * we group tokens that share the same address
   */
  static groupTokensByAddress(
    tokens: TokenWithAddress[]
  ): Map<string, AddressGroup> {
    const addressGroups = new Map<string, AddressGroup>();

    tokens.forEach((token) => {
      const address = token.walletAddress.toLowerCase(); // Normalize address

      if (!addressGroups.has(address)) {
        addressGroups.set(address, {
          address: token.walletAddress, // Keep original casing
          tokens: [],
        });
      }

      addressGroups.get(address)!.tokens.push(token);
    });

    return addressGroups;
  }

  /**
   * Create batch balance requests for each address group
   */
  static createBatchRequests(
    addressGroups: Map<string, AddressGroup>
  ): AssetBatchBalanceRequest[] {
    const requests: AssetBatchBalanceRequest[] = [];

    addressGroups.forEach((group) => {
      const assets = group.tokens
        .filter((token) => token.tokenAddress) // Ensure tokenAddress exists
        .map((token) => ({
          assetId: token.supportedCurrencyId,
          tokenAddress: token.tokenAddress!,
          chainSymbol: token.chainSymbol,
        }));

      if (assets.length === 0) return;

      requests.push({
        targetAddress: group.address,
        assets,
      });
    });

    return requests;
  }

  /**
   * Fetch batch balances for a single request
   */
  static async fetchBatchBalances(
    request: AssetBatchBalanceRequest
  ): Promise<AssetBatchBalanceResponse> {
    const sdk = zapSDKService.getSDK();

    if (!sdk) {
      throw new Error('SDK not initialized');
    }

    // The method is on balanceService.balanceService.getBatchBalancesForAssets
    const balanceService = sdk.balanceService;
    if (!balanceService || !balanceService.getBatchBalancesForAssets) {
      throw new Error(
        'getBatchBalancesForAssets method not available on SDK.balanceService. Please ensure the SDK is updated.'
      );
    }

    // Call the method on balanceService to preserve 'this' context
    return await zapSDKService.executeWithNetworkHandling(
      () => balanceService.getBatchBalancesForAssets(request),
      'getBatchBalancesForAssets'
    );
  }

  /**
   * Fetch batch balances for multiple address groups with concurrency limiting
   * to prevent rate limiting (429 errors)
   */
  static async fetchBatchBalancesForAllAddresses(
    requests: AssetBatchBalanceRequest[],
    maxConcurrency: number = 3 // Limit concurrent requests to avoid rate limiting
  ): Promise<Map<string, AssetBatchBalanceResponse>> {
    const results = new Map<string, AssetBatchBalanceResponse>();

    // Process requests in batches to avoid rate limiting
    for (let i = 0; i < requests.length; i += maxConcurrency) {
      const batch = requests.slice(i, i + maxConcurrency);
      
      // Execute batch requests in parallel
      const batchPromises = batch.map(async (request) => {
      try {
        const response = await this.fetchBatchBalances(request);
        results.set(request.targetAddress.toLowerCase(), response);
        } catch (error: any) {
          // Check if it's a rate limit error
          if (error?.status === 429 || error?.code === 'RATE_LIMITED') {
            console.warn(
              `⚠️ Rate limited for ${request.targetAddress}, will retry in next batch`
            );
            // Don't add to results, will be retried if needed
          } else {
        console.error(
          `Failed to fetch batch balances for ${request.targetAddress}:`,
          error
        );
          }
        // Continue with other requests even if one fails
      }
    });

      // Wait for current batch to complete before starting next batch
      await Promise.allSettled(batchPromises);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + maxConcurrency < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between batches
      }
    }

    return results;
  }

  /**
   * Merge all batch balance results into a single map keyed by accountId
   * Also collects native balances keyed by chainSymbol
   */
  static mergeBatchResults(
    responses: Map<string, AssetBatchBalanceResponse>
  ): {
    balanceResults: Map<string, AssetBatchBalanceResult>;
    nativeBalances: Map<string, { balance: number; balanceFormatted?: string }>;
  } {
    const resultMap = new Map<string, AssetBatchBalanceResult>();
    const nativeBalancesMap = new Map<string, { balance: number; balanceFormatted?: string }>();

    responses.forEach((response) => {
      // Merge token balances
      response.results.forEach((result) => {
        resultMap.set(result.assetId, result);
      });

      // Merge native balances (by chainSymbol)
      if (response.nativeBalances && Array.isArray(response.nativeBalances)) {
        response.nativeBalances.forEach((nativeBalance) => {
          // Use the latest value if multiple addresses have balances for same chain
          nativeBalancesMap.set(nativeBalance.chainSymbol, {
            balance: nativeBalance.balance,
            balanceFormatted: nativeBalance.balanceFormatted,
          });
        });
      }
    });

    return {
      balanceResults: resultMap,
      nativeBalances: nativeBalancesMap,
    };
  }

  /**
   * Update portfolio accounts with batch balance results
   *
   * IMPORTANT: We no longer use balance/price from backend portfolio data.
   * - Balances come from batch balance fetching (this function) - including native balances!
   * =
   * This function:
   * 1. Update balances from batch results (contract tokens) and native balances (native tokens)
   */
  static updatePortfolioWithBatchBalances(
    portfolioData: UserPortfolioData,
    balanceResults: Map<string, AssetBatchBalanceResult>,
    nativeBalances?: Map<string, { balance: number; balanceFormatted?: string }>, // chainSymbol -> native balance from SDK
    supportedCurrenciesMap?: Map<string, ISupportedCurrency>, // supportedCurrencyId -> supportedCurrency
    chainsMap?: Map<string, IChain> // chainId -> IChain for looking up chain symbols
  ): UserPortfolioData {
    // Clone portfolio data to avoid mutations
    const updatedPortfolio: UserPortfolioData = JSON.parse(JSON.stringify(portfolioData));
    let updatedCount = 0;
    let clearedCount = 0;

    // Helper function to check if an account is a native token (ETH, SOL, BTC, etc.)
    const isNativeTokenAccount = (supportedCurrency?: ISupportedCurrency): boolean => {
      if (!supportedCurrency || (!supportedCurrency.symbol && !((supportedCurrency.currencyId as ICurrency)?.symbol))) return false;

      // Native tokens don't have a tokenAddress (or it's empty/null/zero address)
      const tokenAddress =
        supportedCurrency.tokenAddress ||
        '';

      return (
        !tokenAddress ||
        tokenAddress === '' ||
        tokenAddress === '0x0000000000000000000000000000000000000000'
      );
    };

    const userTokenList = PortfolioService.normalizeUserTokenList(updatedPortfolio.userTokenList);

    // Build supportedCurrenciesMap from userTokenList if not provided
    const finalSupportedCurrenciesMap = supportedCurrenciesMap || new Map<string, ISupportedCurrency>();
    if (!supportedCurrenciesMap) {
      userTokenList.forEach((token) => {
        const supportedCurrency = token.supportedCurrencyId as unknown as ISupportedCurrency;
        if (supportedCurrency && supportedCurrency._id) {
          finalSupportedCurrenciesMap.set(supportedCurrency._id, supportedCurrency);
        }
      });
    }

    // STEP 1: Clear ALL backend balance data first (we don't use backend balances)
    // This ensures we start fresh and only use batch balance results (including native balances from SDK)
    const clearAllBackendBalances = () => {
      // Clear in mainWalletGroupPortfolio
    if (
      updatedPortfolio.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts
    ) {
      updatedPortfolio.mainWalletGroupPortfolio.mainWalletPortfolio.accounts.forEach(
          (account: AccountPortfolioData) => {
            // Clear ALL balances (including native tokens) - we'll set them from SDK
            account.balance = 0;
            account.totalUsdValue = 0;
            clearedCount++;
          }
        );
      }
    };

    // Helper function to update an account's balance from batch results
    const updateAccountBalance = (account: any, balance: number) => {
      // Update balance from batch results (not from backend)
                  account.balance = balance;
                  account.balanceUpdatedAt = new Date().toISOString();

      updatedCount++;
    };

    // STEP 1: Clear all backend balances first (ALL balances - including native tokens)
    clearAllBackendBalances();

    // Update account balances in mainWalletGroupPortfolio
    // The balanceResults map is keyed by assetId (which is supportedCurrencyId)
    // We match accounts by their supportedCurrencyId to update their balances

    let contractTokensUpdated = 0;
    let nativeTokensUpdated = 0;
    let autoEnabledCount = 0;

    // Track which native tokens we've already processed to avoid duplicates
    const processedNativeTokens = new Set<string>(); // chainSymbol -> processed

    if (
      userTokenList.length > 0
    ) {
      userTokenList.forEach(
        (token) => {
          const supportedCurrencyId = (token.supportedCurrencyId as unknown as ISupportedCurrency)._id ? (token.supportedCurrencyId as unknown as ISupportedCurrency)._id : token.supportedCurrencyId;
          const supportedCurrency = finalSupportedCurrenciesMap.get(supportedCurrencyId);
          const balanceResult = balanceResults.get(supportedCurrencyId);


          if (balanceResult && !balanceResult.error && !isNativeTokenAccount(supportedCurrency)) {
            // Contract tokens: update balance and price from batch results
            const balance = parseFloat(
              balanceResult.balanceFormatted || balanceResult.balance
            );
            updateAccountBalance(token, balance);
            contractTokensUpdated++;
          } else if (isNativeTokenAccount(supportedCurrency) && nativeBalances) {
            // Native tokens: get balance from SDK nativeBalances (not from backend)
            const chainId = supportedCurrency?.chainId;
            const chainSymbol = this.getChainSymbol(chainId, supportedCurrency, chainsMap);
            
            // Skip if we've already processed this native token (same chainSymbol)
            if (chainSymbol && processedNativeTokens.has(chainSymbol)) {
              // Still update the balance for this duplicate entry, but don't log again
              if (nativeBalances.has(chainSymbol)) {
                const nativeBalance = nativeBalances.get(chainSymbol)!;
                const balance = nativeBalance.balance || 0;
                updateAccountBalance(token, balance);
              }
              return; // Skip logging for duplicates
            }
            
            if (chainSymbol) {
              processedNativeTokens.add(chainSymbol);
            }
            
            if (chainSymbol && nativeBalances.has(chainSymbol)) {
              const nativeBalance = nativeBalances.get(chainSymbol)!;
              const balance = nativeBalance.balance || 0;
              updateAccountBalance(token, balance);
              nativeTokensUpdated++;
            } else if (chainSymbol) {
              // This is expected if the user doesn't have an address on this chain
              // The batch balance API only returns native balances for chains where addresses exist
              const tokenSymbol = supportedCurrency?.symbol || 
                                 (supportedCurrency?.currencyId as ICurrency)?.symbol || 
                                 supportedCurrencyId || 
                                 'unknown';
              console.log(
                `ℹ️ Native token balance not available for ${chainSymbol} (${tokenSymbol}). This is expected if no address exists on this chain. Available chains with balances: ${Array.from(nativeBalances.keys()).join(', ') || 'none'}`
              );
            } else {
              const tokenSymbol = supportedCurrency?.symbol || 
                                 (supportedCurrency?.currencyId as ICurrency)?.symbol || 
                                 supportedCurrencyId || 
                                 'unknown';
              console.warn(
                `⚠️ Could not determine chainSymbol for native token: ${tokenSymbol} (ID: ${supportedCurrencyId})`
              );
            }
          }
          if (
            token &&
            token.balance! > 0 &&
            token.status === 'DISABLED'
          ) {
            token.status = 'ENABLED';
            autoEnabledCount++;
          }
        }
      );
    }

    return updatedPortfolio;
  }

  /**
   * Helper to get chain symbol from chainId or supportedCurrency
   * Handles both IChain objects and chain ID strings
   */
  private static getChainSymbol(
    chainId?: IChain | string, 
    supportedCurrency?: ISupportedCurrency,
    chainsMap?: Map<string, IChain>
  ): string {
    // If chainId is a string (ID), try to look it up in chainsMap first
    if (typeof chainId === 'string' && chainsMap) {
      const chain = chainsMap.get(chainId);
      if (chain?.symbol) {
        return chain.symbol;
      }
    }

    // If chainId is a string (ID), try to get symbol from supportedCurrency
    if (typeof chainId === 'string') {
      // Try to get chain symbol from supportedCurrency's chainId
      if (supportedCurrency?.chainId) {
        const chain = supportedCurrency.chainId as IChain;
        if (typeof chain === 'object' && chain.symbol) {
          return chain.symbol;
        }
      }
      return '';
    }

    // If chainId is an IChain object
    if (chainId && typeof chainId === 'object' && 'symbol' in chainId) {
      return chainId.symbol || '';
    }
    
    // Fallback: try to get from supportedCurrency
    if (supportedCurrency?.chainId) {
      // If chainId is a string, try chainsMap
      if (typeof supportedCurrency.chainId === 'string' && chainsMap) {
        const chain = chainsMap.get(supportedCurrency.chainId);
        if (chain?.symbol) {
          return chain.symbol;
        }
      }
      // Otherwise try as IChain object
      const chain = supportedCurrency.chainId as IChain;
      if (typeof chain === 'object' && chain.symbol) {
        return chain.symbol;
      }
    }
    
    return '';
  }
}

