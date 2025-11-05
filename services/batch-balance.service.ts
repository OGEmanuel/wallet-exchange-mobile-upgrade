import { zapSDKService } from '@/src/core/sdk/zap-sdk.service';
import { IUserPortfolio, MarketData, UserPortfolioData } from '@zap/blockchain-sdk';

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
  accountId: string;
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
    portfolioData: IUserPortfolio | UserPortfolioData,
    addressesByChain: Map<string, string> // chainSymbol -> walletAddress
  ): TokenWithAddress[] {
    const tokens: TokenWithAddress[] = [];
    // userTokenList is on UserPortfolioData, use type assertion
    const portfolioDataWithTokens = portfolioData as any;
    const userTokenList = portfolioDataWithTokens.userTokenList || [];

    // Handle different userTokenList formats
    const tokenList = Array.isArray(userTokenList)
      ? userTokenList
      : (userTokenList as any)?.data || [];

    // Get all accounts from the portfolio to match with tokens
    const accounts: any[] = [];
    if (
      portfolioDataWithTokens.mainWalletGroupPortfolio?.mainWalletPortfolio
        ?.accounts
    ) {
      accounts.push(
        ...portfolioDataWithTokens.mainWalletGroupPortfolio.mainWalletPortfolio
          .accounts
      );
    }

    // Also check walletGroupPortfolios
    if (portfolioDataWithTokens.walletGroupPortfolios) {
      Object.values(portfolioDataWithTokens.walletGroupPortfolios).forEach(
        (walletGroup: any) => {
          if (walletGroup?.mainWalletPortfolio?.accounts) {
            accounts.push(...walletGroup.mainWalletPortfolio.accounts);
          }
        }
      );
    }

    let skippedNoTokenAddress = 0;
    let matchedAccounts = 0;

    tokenList.forEach((userToken: any) => {
      const supportedCurrency = userToken.supportedCurrencyId;
      if (!supportedCurrency) {
        return;
      }

      const chainId = supportedCurrency.chainId;
      const chainSymbol = this.getChainSymbol(chainId, supportedCurrency);
      const walletAddress = addressesByChain.get(chainSymbol);

      if (!walletAddress) {
        return;
      }

      // Skip tokens without tokenAddress (native tokens like ETH, SOL, BTC)
      // Batch balance API is for ERC20/SPL tokens with contract addresses
      if (!supportedCurrency.tokenAddress) {
        skippedNoTokenAddress++;
        return;
      }

      // Find matching account from portfolio by supportedCurrencyId
      // CRITICAL: We must only process tokens that have a matching account in the portfolio
      // The assetId must be the actual account._id so we can map results back correctly
      const supportedCurrencyId =
        typeof supportedCurrency._id === 'string'
          ? supportedCurrency._id
          : (supportedCurrency as any)?._id;

      const matchingAccount = accounts.find((account: any) => {
        const accountSupportedCurrencyId =
          typeof account.supportedCurrencyId === 'string'
            ? account.supportedCurrencyId
            : account.supportedCurrencyId?._id;
        return accountSupportedCurrencyId === supportedCurrencyId;
      });

      // Skip if no matching account - we can't update an account that doesn't exist
      if (!matchingAccount) {
        console.warn(
          `⚠️ No matching account found for token ${supportedCurrency.symbol || supportedCurrencyId} on chain ${chainSymbol}. Skipping.`
        );
        return;
      }

      // Use the actual account _id - this is what we pass as assetId to getBatchBalancesForAssets
      // and use to map results back to the portfolio accounts
      const accountId = matchingAccount._id;
      matchedAccounts++;

      tokens.push({
        accountId, // This MUST be the actual account._id from the portfolio
        supportedCurrencyId: supportedCurrencyId || '',
        tokenAddress: supportedCurrency.tokenAddress,
        chainSymbol,
        chainId,
        walletAddress,
      });
    });

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
          assetId: token.accountId,
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

    const sdkAny = sdk as any;

    // The method is on balanceService.balanceService.getBatchBalancesForAssets
    const balanceService = sdkAny.balanceService;
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
   * Fetch batch balances for multiple address groups in parallel
   */
  static async fetchBatchBalancesForAllAddresses(
    requests: AssetBatchBalanceRequest[]
  ): Promise<Map<string, AssetBatchBalanceResponse>> {
    const results = new Map<string, AssetBatchBalanceResponse>();

    // Execute all batch requests in parallel
    const promises = requests.map(async (request) => {
      try {
        const response = await this.fetchBatchBalances(request);
        results.set(request.targetAddress.toLowerCase(), response);
      } catch (error) {
        console.error(
          `Failed to fetch batch balances for ${request.targetAddress}:`,
          error
        );
        // Continue with other requests even if one fails
      }
    });

    await Promise.allSettled(promises);

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
   * - Prices come from portfolio data (IUserPortfolio from SDK) - already available
   * - totalUsdValue = balance * price (calculated here)
   * 
   * This function:
   * 1. FIRST: Clear ALL backend balance data (we don't trust it - including native tokens)
   * 2. THEN: Update balances from batch results (contract tokens) and native balances (native tokens)
   * 3. Calculate totalUsdValue using price from portfolio * balance
   */
  static updatePortfolioWithBatchBalances(
    portfolioData: IUserPortfolio | UserPortfolioData,
    balanceResults: Map<string, AssetBatchBalanceResult>,
    marketTokensMap?: Map<string, MarketData>, // currencyId -> market data
    nativeBalances?: Map<string, { balance: number; balanceFormatted?: string }> // chainSymbol -> native balance from SDK
  ): IUserPortfolio | UserPortfolioData {
    // Clone portfolio data to avoid mutations
    const updatedPortfolio = JSON.parse(JSON.stringify(portfolioData));
    let updatedCount = 0;
    let clearedCount = 0;

    // Create a map to store prices from original portfolio data before we clear balances
    // This ensures we can access prices even after clearing backend balance data
    const priceMap = new Map<string, number>();

    // Helper to extract price from account data
    const extractPrice = (account: any): number => {
      if (account.price !== undefined && account.price !== null && account.price > 0) {
        return account.price;
      }

      const supportedCurrency = account.supportedCurrencyId;
      // Check if supportedCurrency is an object (not a string ID)
      if (supportedCurrency && typeof supportedCurrency === 'object' && supportedCurrency !== null) {
        if (supportedCurrency.price !== undefined && supportedCurrency.price !== null && supportedCurrency.price > 0) {
          return supportedCurrency.price;
        }

        const currencyId = supportedCurrency.currencyId;
        if (currencyId && typeof currencyId === 'object' && currencyId !== null) {
          if (currencyId.price !== undefined && currencyId.price !== null && currencyId.price > 0) {
            return currencyId.price;
          }
          if (currencyId.rate !== undefined && currencyId.rate !== null && currencyId.rate > 0) {
            return currencyId.rate;
          }
        }
      }

      return 0;
    };

    // STEP 0: Extract prices from userTokenList (IUserPortfolio.price)
    // Prices are stored on IUserPortfolio objects, not on accounts
    const extractPricesFromOriginalPortfolio = () => {
      const portfolioDataAny = portfolioData as any;
      let userTokenList = portfolioDataAny.userTokenList;

      // Normalize userTokenList (might be wrapped in { data: [] })
      if (userTokenList && !Array.isArray(userTokenList)) {
        if (userTokenList.data && Array.isArray(userTokenList.data)) {
          userTokenList = userTokenList.data;
        } else {
          userTokenList = [];
        }
      }

      if (Array.isArray(userTokenList) && userTokenList.length > 0) {
        // Create a map: supportedCurrencyId -> account._id for matching
        const supportedCurrencyToAccountId = new Map<string, string>();

        // Build map from accounts
        if (portfolioDataAny.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts) {
          portfolioDataAny.mainWalletGroupPortfolio.mainWalletPortfolio.accounts.forEach((account: any) => {
            const supportedCurrencyId = account.supportedCurrencyId?._id || account.supportedCurrencyId;
            if (supportedCurrencyId && account._id) {
              supportedCurrencyToAccountId.set(supportedCurrencyId, account._id);
            }
          });
        }

        // Extract prices from userTokenList and map to account._id
        userTokenList.forEach((token: IUserPortfolio) => {
          if (token.price && token.price > 0) {
            const supportedCurrencyId = typeof token.supportedCurrencyId === 'string'
              ? token.supportedCurrencyId
              : (token.supportedCurrencyId as any)?._id;

            if (supportedCurrencyId) {
              const accountId = supportedCurrencyToAccountId.get(supportedCurrencyId);
              if (accountId) {
                priceMap.set(accountId, token.price);
              }
            }
          }
        });
      }

    };

    // Helper function to check if an account is a native token (ETH, SOL, BTC, etc.)
    const isNativeTokenAccount = (account: any): boolean => {
      const supportedCurrency = account.supportedCurrencyId;
      if (!supportedCurrency) return false;

      // Native tokens don't have a tokenAddress (or it's empty/null/zero address)
      const tokenAddress =
        supportedCurrency.tokenAddress ||
        account.tokenAddress ||
        '';

      return (
        !tokenAddress ||
        tokenAddress === '' ||
        tokenAddress === '0x0000000000000000000000000000000000000000'
      );
    };

    // Helper function to get chainSymbol from account
    const getChainSymbolFromAccount = (account: any): string | null => {
      // Try to get chainSymbol from chainId object
      const chainId = account.chainId || account.supportedCurrencyId?.chainId;
      if (chainId && typeof chainId === 'object' && chainId !== null) {
        return chainId.symbol || null;
      }
      // Try from supportedCurrencyId.chainId
      const supportedCurrency = account.supportedCurrencyId;
      if (supportedCurrency && typeof supportedCurrency === 'object' && supportedCurrency.chainId) {
        const chainIdObj = typeof supportedCurrency.chainId === 'object' ? supportedCurrency.chainId : null;
        if (chainIdObj && chainIdObj.symbol) {
          return chainIdObj.symbol;
        }
      }
      return null;
    };

    // STEP 1: Clear ALL backend balance data first (we don't use backend balances)
    // This ensures we start fresh and only use batch balance results (including native balances from SDK)
    const clearAllBackendBalances = () => {
      // Clear in mainWalletGroupPortfolio
      if (
        updatedPortfolio.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts
      ) {
        updatedPortfolio.mainWalletGroupPortfolio.mainWalletPortfolio.accounts.forEach(
          (account: any) => {
            // Clear ALL balances (including native tokens) - we'll set them from SDK
            account.balance = 0;
            account.totalUsdValue = 0;
            clearedCount++;
          }
        );
      }

      // Clear in walletGroupPortfolios
      if (updatedPortfolio.walletGroupPortfolios) {
        Object.values(updatedPortfolio.walletGroupPortfolios).forEach(
          (walletGroup: any) => {
            if (walletGroup?.mainWalletPortfolio?.accounts) {
              walletGroup.mainWalletPortfolio.accounts.forEach(
                (account: any) => {
                  // Clear ALL balances (including native tokens) - we'll set them from SDK
                  account.balance = 0;
                  account.totalUsdValue = 0;
                  clearedCount++;
                }
              );
            }
          }
        );
      }
    };

    // Helper function to get price from portfolio data or market fallback
    // Prices come from the SDK on IUserPortfolio - we stored them in priceMap before clearing
    // If not found, fallback to market prices
    const getPriceFromPortfolio = (account: any): number => {
      // First check the priceMap (extracted from original portfolio data)
      const priceFromMap = priceMap.get(account._id);
      if (priceFromMap && priceFromMap > 0) {
        return priceFromMap;
      }

      // Second: Try current account data (in case price is still there after clearing)
      const priceFromAccount = extractPrice(account);
      if (priceFromAccount > 0) {
        return priceFromAccount;
      }

      // Third: Fallback to market prices using currencyId
      // IMPORTANT: Match by base currency (not supportedCurrency), so ETH on all chains uses same price
      // For native tokens, currencyId comes from chain.nativeCurrencyId
      if (marketTokensMap && marketTokensMap.size > 0) {
        // Helper to extract currencyId value from an object/string
        const extractCurrencyId = (currencyId: any): string | null => {
          if (!currencyId) return null;
          if (typeof currencyId === 'string') return currencyId;
          if (typeof currencyId === 'object' && currencyId !== null) {
            return currencyId._id || currencyId.id || null;
          }
          return null;
        };

        // Try multiple sources for currencyId in order:
        // 1. account.currencyId (might be set directly)
        // 2. supportedCurrency.currencyId (for contract tokens like USDT, USDC)
        // 3. chainId.nativeCurrencyId (for native tokens like ETH, MATIC, SOL)
        let currencyIdValue: string | null = null;

        // First, try account.currencyId directly
        if (account.currencyId) {
          currencyIdValue = extractCurrencyId(account.currencyId);
        }

        // Second, try supportedCurrency.currencyId (contract tokens like USDT, USDC)
        if (!currencyIdValue) {
          const supportedCurrency = account.supportedCurrencyId;
          if (supportedCurrency && typeof supportedCurrency === 'object' && supportedCurrency !== null) {
            currencyIdValue = extractCurrencyId(supportedCurrency.currencyId);
          }
        }

        // Third, try chainId.nativeCurrencyId (for native tokens)
        // Native tokens don't have currencyId on supportedCurrency, but the chain has nativeCurrencyId
        if (!currencyIdValue) {
          const isNative = isNativeTokenAccount(account);
          if (isNative) {
            // Try account.chainId
            const chainId = account.chainId || account.supportedCurrencyId?.chainId;
            if (chainId) {
              const chainIdObj = typeof chainId === 'object' ? chainId : null;
              if (chainIdObj?.nativeCurrencyId) {
                currencyIdValue = extractCurrencyId(chainIdObj.nativeCurrencyId);
              }
            }
          }
        }

        if (currencyIdValue) {
          // Try direct lookup
          let marketPrice = marketTokensMap.get(currencyIdValue)?.rate;

          // If not found, try as string comparison (in case of format mismatch)
          if (!marketPrice || marketPrice === 0) {
            // Try to find by iterating and comparing (in case IDs are stored differently)
            for (const [marketCurrencyId, marketToken] of marketTokensMap.entries()) {
              if (marketCurrencyId === currencyIdValue ||
                marketCurrencyId.toString() === currencyIdValue.toString() ||
                currencyIdValue.toString() === marketCurrencyId.toString()) {
                marketPrice = marketToken.rate;
                break;
              }
            }
          }

          if (marketPrice && marketPrice > 0) {
            return marketPrice;
          }
        }
      }

      return 0;
    };

    // Helper function to update an account's balance from batch results
    const updateAccountBalance = (account: any, balance: number) => {
      // Update balance from batch results (not from backend)
      account.balance = balance;
      account.balanceUpdatedAt = new Date().toISOString();

      // Get price from portfolio data (comes from SDK on IUserPortfolio)
      const price = getPriceFromPortfolio(account);

      // Calculate totalUsdValue using price from portfolio
      if (price > 0 && balance > 0) {
        account.totalUsdValue = balance * price;
      } else if (balance === 0) {
        account.totalUsdValue = 0;
      } else if (balance > 0 && price === 0) {
        // Balance > 0 but no price found - log warning
        console.warn(
          `⚠️ No price found for account ${account._id} (balance: ${balance}). Price might not be in portfolio data yet.`
        );
        account.totalUsdValue = 0; // Set to 0 if no price (will be calculated later)
      }

      updatedCount++;
    };

    // STEP 0: Extract prices from original portfolio data BEFORE clearing
    extractPricesFromOriginalPortfolio();

    // STEP 1: Clear all backend balances first (ALL balances - including native tokens)
    clearAllBackendBalances();

    // Update account balances in mainWalletGroupPortfolio
    // The balanceResults map is keyed by assetId (which is account._id)
    // We match accounts by their _id to update their balances

    let contractTokensUpdated = 0;
    let nativeTokensUpdated = 0;

    if (
      updatedPortfolio.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts
    ) {

      updatedPortfolio.mainWalletGroupPortfolio.mainWalletPortfolio.accounts.forEach(
        (account: any) => {
          const accountId = account._id; // This matches the assetId we passed to getBatchBalancesForAssets
          const balanceResult = balanceResults.get(accountId);

          if (balanceResult && !balanceResult.error) {
            // Contract tokens: update balance and price from batch results
            const balance = parseFloat(
              balanceResult.balanceFormatted || balanceResult.balance
            );
            updateAccountBalance(account, balance);
            contractTokensUpdated++;
          } else if (isNativeTokenAccount(account) && nativeBalances) {
            // Native tokens: get balance from SDK nativeBalances (not from backend)
            const chainSymbol = getChainSymbolFromAccount(account);
            if (chainSymbol && nativeBalances.has(chainSymbol)) {
              const nativeBalance = nativeBalances.get(chainSymbol)!;
              const balance = nativeBalance.balance || 0;

              if (balance > 0) {
                const price = getPriceFromPortfolio(account);

                account.balance = balance;
                if (price > 0) {
                  account.totalUsdValue = balance * price;
                  updatedCount++;
                  nativeTokensUpdated++;
                } else {
                  account.totalUsdValue = 0;
                  updatedCount++;
                  nativeTokensUpdated++;
                  console.warn(`⚠️ Native token balance found but no price: accountId=${account._id}, chainSymbol=${chainSymbol}, balance=${balance}`);
                }
              }
            }
          }
          // Accounts without batch results already have balance = 0 from clearAllBackendBalances
        }
      );
    }

    // Update account balances in walletGroupPortfolios
    // Same logic - match by account._id which is the assetId we used
    if (updatedPortfolio.walletGroupPortfolios) {
      Object.values(updatedPortfolio.walletGroupPortfolios).forEach(
        (walletGroup: any) => {
          if (walletGroup?.mainWalletPortfolio?.accounts) {
            walletGroup.mainWalletPortfolio.accounts.forEach(
              (account: any) => {
                const accountId = account._id; // This matches the assetId we passed to getBatchBalancesForAssets
                const balanceResult = balanceResults.get(accountId);

                if (balanceResult && !balanceResult.error) {
                  // Contract tokens: update balance and price from batch results
                  const balance = parseFloat(
                    balanceResult.balanceFormatted || balanceResult.balance
                  );
                  updateAccountBalance(account, balance);
                  contractTokensUpdated++;
                } else if (isNativeTokenAccount(account) && nativeBalances) {
                  // Native tokens: get balance from SDK nativeBalances (not from backend)
                  const chainSymbol = getChainSymbolFromAccount(account);
                  if (chainSymbol && nativeBalances.has(chainSymbol)) {
                    const nativeBalance = nativeBalances.get(chainSymbol)!;
                    const balance = nativeBalance.balance || 0;

                    if (balance > 0) {
                      const price = getPriceFromPortfolio(account);

                      account.balance = balance;
                      if (price > 0) {
                        account.totalUsdValue = balance * price;
                        updatedCount++;
                        nativeTokensUpdated++;
                      } else {
                        account.totalUsdValue = 0;
                        updatedCount++;
                        nativeTokensUpdated++;
                        console.warn(`⚠️ Native token balance found but no price: accountId=${account._id}, chainSymbol=${chainSymbol}, balance=${balance}`);
                      }
                    }
                  }
                }
                // Accounts without batch results already have balance = 0 from clearAllBackendBalances
              }
            );
          }
        }
      );
    }

    // Auto-enable DISABLED tokens that have balances
    let autoEnabledCount = 0;
    if (updatedPortfolio.userTokenList) {
      const userTokenList = Array.isArray(updatedPortfolio.userTokenList)
        ? updatedPortfolio.userTokenList
        : (updatedPortfolio.userTokenList as any)?.data || [];

      userTokenList.forEach((userToken: any) => {
        // Find matching account to check balance
        const supportedCurrencyId =
          typeof userToken.supportedCurrencyId === 'string'
            ? userToken.supportedCurrencyId
            : userToken.supportedCurrencyId?._id;

        if (!supportedCurrencyId) return;

        // Find account with this supportedCurrencyId
        const account = (
          updatedPortfolio.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts ||
          []
        ).find((acc: any) => {
          const accSupportedCurrencyId =
            typeof acc.supportedCurrencyId === 'string'
              ? acc.supportedCurrencyId
              : acc.supportedCurrencyId?._id;
          return accSupportedCurrencyId === supportedCurrencyId;
        });

        // Auto-enable if: status is DISABLED (not HIDDEN), account exists, and balance > 0
        if (
          account &&
          account.balance > 0 &&
          userToken.status === 'DISABLED'
        ) {
          userToken.status = 'ENABLED';
          autoEnabledCount++;
        }
      });
    }


    return updatedPortfolio;
  }

  /**
   * Update portfolio accounts with batch price results
   * This will be called once batch price fetching is implemented
   * 
   * TODO: Implement this once batch price fetching is available
   * Expected signature:
   * static updatePortfolioWithBatchPrices(
   *   portfolioData: IUserPortfolio | UserPortfolioData,
   *   priceResults: Map<string, BatchPriceResult>
   * ): IUserPortfolio | UserPortfolioData {
   *   // Update account.totalUsdValue = account.balance * price
   * }
   */

  /**
   * Helper to get chain symbol from chainId or supportedCurrency
   */
  private static getChainSymbol(chainId: any, supportedCurrency: any): string {
    // chainId might be an object with a symbol property
    if (chainId && typeof chainId === 'object' && chainId.symbol) {
      return chainId.symbol;
    }

    // Try to get from supportedCurrency.chainSymbol
    if (supportedCurrency.chainSymbol) {
      return supportedCurrency.chainSymbol;
    }

    // If chainId is a string, try to use it (though this is unlikely to match)
    if (typeof chainId === 'string') {
      return chainId;
    }

    // Last resort: return empty string (will be filtered out)
    console.warn('Could not determine chain symbol for token:', supportedCurrency);
    return '';
  }
}

