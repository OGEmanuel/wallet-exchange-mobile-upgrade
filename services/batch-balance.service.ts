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
    let matchedAccounts = 0;

    // create map of supportedCurrencyId to account
    const supportedCurrencyToAccount = new Map<string, AccountPortfolioData>();
    accounts.forEach((account) => {
      supportedCurrencyToAccount.set(account.supportedCurrencyId._id, account);
    });

    tokenList.forEach((userToken) => {
      const supportedCurrency = userToken.supportedCurrencyId as unknown as ISupportedCurrency;
      if (!supportedCurrency) {
        return;
      }

      const chainId = supportedCurrency.chainId;
      const chainSymbol = this.getChainSymbol(chainId as IChain, supportedCurrency);
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
      const supportedCurrencyId = supportedCurrency._id;

      const matchingAccount = supportedCurrencyToAccount.get(supportedCurrencyId);

      // Skip if no matching account - we can't update an account that doesn't exist
      if (!matchingAccount) {
        console.warn(
          `⚠️ No matching account found for token ${supportedCurrency.symbol || supportedCurrencyId} on chain ${chainSymbol}. Skipping.`
        );
      } else {
        matchedAccounts++;
      }

      tokens.push({
        accountId: matchingAccount?._id || supportedCurrency._id,
        supportedCurrencyId: supportedCurrency._id,
        tokenAddress: supportedCurrency?.tokenAddress || '',
        chainSymbol,
        chainId: chainId as string,
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
   * =
   * This function:
   * 1. Update balances from batch results (contract tokens) and native balances (native tokens)
   */
  static updatePortfolioWithBatchBalances(
    portfolioData: UserPortfolioData,
    balanceResults: Map<string, AssetBatchBalanceResult>,
    nativeBalances?: Map<string, { balance: number; balanceFormatted?: string }>, // chainSymbol -> native balance from SDK
    supportedCurrenciesMap?: Map<string, ISupportedCurrency> // supportedCurrencyId -> supportedCurrency
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

    if (
      userTokenList.length > 0
    ) {
      userTokenList.forEach(
        (token) => {
          const supportedCurrencyId = (token.supportedCurrencyId as unknown as ISupportedCurrency)._id ? (token.supportedCurrencyId as unknown as ISupportedCurrency)._id : token.supportedCurrencyId;
          const supportedCurrency = supportedCurrenciesMap?.get(supportedCurrencyId);
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
            const chainSymbol = this.getChainSymbol(supportedCurrency?.chainId as IChain, supportedCurrency);
            if (chainSymbol && nativeBalances.has(chainSymbol)) {
              const nativeBalance = nativeBalances.get(chainSymbol)!;
              const balance = nativeBalance.balance || 0;
              updateAccountBalance(token, balance);
              nativeTokensUpdated++;
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
   */
  private static getChainSymbol(chainId?: IChain, supportedCurrency?: ISupportedCurrency): string {
    if (!chainId || !supportedCurrency) return '';
    return chainId.symbol || (supportedCurrency.chainId as IChain)?.symbol || '';
  }
}

