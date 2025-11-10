# Batch Balance Integration Plan

## Overview

This document outlines where and how to integrate the batch balance fetching functionality (`getBatchBalancesForAssets`) into the ZAP Mobile application.

## Strategy

**Two-Step Approach:**
1. **Backend Portfolio Call**: Get token list with metadata (enabled/disabled status, token info, chain info)
2. **Batch Balance Fetching**: Get actual balances for tokens, grouped by address

**Key Insight:**
- Token list contains tokens from multiple chains
- Batch balance API requires **one address per request**
- Different chains may have different addresses (or same address for EVM chains)
- **Group tokens by address**, then make separate batch requests for each unique address

**Flow:**
```
1. getUserPortfolio() → Get token list (metadata only)
2. Extract token list with addresses per chain
3. Group tokens by address (addresses can be same across EVM chains)
4. For each unique address → create batch balance request
5. Execute multiple batch requests in parallel
6. Merge batch balance results back into portfolio structure
```

## Integration Points

### 1. **Create Batch Balance Service** ⭐ PRIMARY LOCATION
**Location:** `services/batch-balance.service.ts` (NEW FILE)

**Purpose:** 
- Encapsulate batch balance logic
- Convert portfolio accounts to batch balance requests
- Handle batch balance responses and map them back to portfolio structure

**Why here:**
- Follows the existing pattern (`portfolio.service.ts`)
- Centralized business logic
- Reusable across components and hooks

---

### 2. **Create Custom Hook** ⭐ SECONDARY LOCATION
**Location:** `hooks/useBatchBalances.tsx` (NEW FILE)

**Purpose:**
- React hook wrapper for batch balance fetching
- Integrate with React Query for caching
- Provide loading/error states
- Handle refresh functionality

**Why here:**
- Follows existing hook patterns (`useAggregatedBalances.tsx`, `usePortfolio.tsx`)
- Provides React-friendly API
- Can be used by multiple components

---

### 3. **Integrate into Portfolio Refresh Flow** ⭐ INTEGRATION POINT
**Location:** `src/core/wallet/wallet-context.tsx` (MODIFY)

**Specific function:** `refreshPortfolio()` (around line 1843)

**Purpose:**
- Replace or supplement existing portfolio balance fetching with batch calls
- Use batch balances for faster portfolio updates
- Maintain backward compatibility

**Integration strategy:**
- Option A: Use batch balances as primary method, fallback to existing
- Option B: Use batch balances for refresh, keep existing for initial load
- Option C: Make it configurable via feature flag

---

### 4. **Extend Portfolio Service** ⭐ HELPER LOCATION
**Location:** `services/portfolio.service.ts` (EXTEND)

**Purpose:**
- Add helper methods to convert portfolio data structures
- Map batch balance results back to portfolio format
- Process batch balance responses alongside existing portfolio processing

**Why here:**
- Already handles portfolio data transformation
- Natural place for portfolio-related utilities

---

### 5. **Update Aggregated Balances Hook** ⭐ OPTIMIZATION POINT
**Location:** `hooks/useAggregatedBalances.tsx` (MODIFY)

**Purpose:**
- Use batch balances to improve aggregated balance calculations
- Reduce API calls when calculating wallet/wallet group totals

---

## Recommended Implementation Order

### Phase 1: Foundation (Start Here)
1. ✅ Create `services/batch-balance.service.ts`
   - Build request converters
   - Response mappers
   - Error handling

2. ✅ Create `hooks/useBatchBalances.tsx`
   - Basic hook implementation
   - React Query integration
   - Test with simple use cases

### Phase 2: Integration
3. ✅ Integrate into `PortfolioService`
   - Add conversion utilities
   - Extend processing methods

4. ✅ Update `wallet-context.tsx` refresh flow
   - Add batch balance option
   - A/B test or feature flag

### Phase 3: Optimization
5. ✅ Update `useAggregatedBalances.tsx`
   - Use batch balances for calculations
   - Improve cache strategies

6. ✅ Add to WebSocket refresh flow
   - Use batch balances on WebSocket updates

---

## Detailed Integration Steps

### Step 1: Create Batch Balance Service

```typescript
// services/batch-balance.service.ts
import { ZapSDK } from '@zap/blockchain-sdk';
import type { 
  AssetBatchBalanceRequest, 
  AssetBatchBalanceResponse,
  AssetBatchBalanceResult 
} from '@zap/blockchain-sdk';
import { AccountPortfolioData, IUserPortfolio } from '@zap/blockchain-sdk';
import { zapSDKService } from '@/src/core/sdk/zap-sdk.service';
import { Chain } from '@/src/core/chains/chains-context';

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
   */
  static extractTokensFromPortfolio(
    portfolioData: IUserPortfolio,
    addressesByChain: Map<string, string> // chainSymbol -> walletAddress
  ): TokenWithAddress[] {
    const tokens: TokenWithAddress[] = [];
    const userTokenList = portfolioData.userTokenList || [];

    // Handle different userTokenList formats
    const tokenList = Array.isArray(userTokenList) 
      ? userTokenList 
      : (userTokenList as any)?.data || [];

    tokenList.forEach((userToken: any) => {
      const supportedCurrency = userToken.supportedCurrencyId;
      if (!supportedCurrency) return;

      const chainId = supportedCurrency.chainId;
      const chainSymbol = this.getChainSymbol(chainId, supportedCurrency);
      const walletAddress = addressesByChain.get(chainSymbol);

      if (!walletAddress || !supportedCurrency.tokenAddress) {
        return; // Skip tokens without address or tokenAddress
      }

      tokens.push({
        accountId: userToken._id || `${supportedCurrency._id}_${chainSymbol}`,
        supportedCurrencyId: supportedCurrency._id,
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
  static groupTokensByAddress(tokens: TokenWithAddress[]): Map<string, AddressGroup> {
    const addressGroups = new Map<string, AddressGroup>();

    tokens.forEach(token => {
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
        .filter(token => token.tokenAddress) // Ensure tokenAddress exists
        .map(token => ({
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

    if (!sdk || !sdk.getBatchBalancesForAssets) {
      throw new Error('SDK or getBatchBalancesForAssets method not available');
    }

    return await zapSDKService.executeWithNetworkHandling(
      () => sdk.getBatchBalancesForAssets(request),
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
        console.error(`Failed to fetch batch balances for ${request.targetAddress}:`, error);
        // Continue with other requests even if one fails
      }
    });

    await Promise.allSettled(promises);

    return results;
  }

  /**
   * Merge all batch balance results into a single map keyed by accountId
   */
  static mergeBatchResults(
    responses: Map<string, AssetBatchBalanceResponse>
  ): Map<string, AssetBatchBalanceResult> {
    const resultMap = new Map<string, AssetBatchBalanceResult>();

    responses.forEach((response) => {
      response.results.forEach((result) => {
        resultMap.set(result.assetId, result);
      });
    });

    return resultMap;
  }

  /**
   * Update portfolio accounts with batch balance results
   */
  static updatePortfolioWithBatchBalances(
    portfolioData: IUserPortfolio,
    balanceResults: Map<string, AssetBatchBalanceResult>
  ): IUserPortfolio {
    // Clone portfolio data to avoid mutations
    const updatedPortfolio = JSON.parse(JSON.stringify(portfolioData));

    // Update account balances in mainWalletGroupPortfolio
    if (updatedPortfolio.mainWalletGroupPortfolio?.mainWalletPortfolio?.accounts) {
      updatedPortfolio.mainWalletGroupPortfolio.mainWalletPortfolio.accounts.forEach(
        (account: any) => {
          const accountId = account._id;
          const balanceResult = balanceResults.get(accountId);

          if (balanceResult && !balanceResult.error) {
            // Update balance from batch result
            const balance = parseFloat(balanceResult.balanceFormatted || balanceResult.balance);
            account.balance = balance;
            // Update timestamp
            account.balanceUpdatedAt = new Date().toISOString();
          }
        }
      );
    }

    // Update account balances in walletGroupPortfolios
    if (updatedPortfolio.walletGroupPortfolios) {
      Object.values(updatedPortfolio.walletGroupPortfolios).forEach((walletGroup: any) => {
        if (walletGroup?.mainWalletPortfolio?.accounts) {
          walletGroup.mainWalletPortfolio.accounts.forEach((account: any) => {
            const accountId = account._id;
            const balanceResult = balanceResults.get(accountId);

            if (balanceResult && !balanceResult.error) {
              const balance = parseFloat(balanceResult.balanceFormatted || balanceResult.balance);
              account.balance = balance;
              account.balanceUpdatedAt = new Date().toISOString();
            }
          });
        }
      });
    }

    return updatedPortfolio;
  }

  /**
   * Helper to get chain symbol from chainId or supportedCurrency
   */
  private static getChainSymbol(chainId: string, supportedCurrency: any): string {
    // Try to get from supportedCurrency first
    if (supportedCurrency.chainSymbol) {
      return supportedCurrency.chainSymbol;
    }
    
    // Fallback to chainId
    return chainId;
  }
}
```

### Step 2: Create Custom Hook

```typescript
// hooks/useBatchBalances.tsx
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { BatchBalanceService } from '@/services/batch-balance.service';
import type { 
  AssetBatchBalanceRequest, 
  AssetBatchBalanceResponse 
} from '@zap/blockchain-sdk';
import { AccountPortfolioData } from '@zap/blockchain-sdk';
import { Chain } from '@/src/core/chains/chains-context';

interface UseBatchBalancesParams {
  accounts: AccountPortfolioData[];
  chainsMap: Map<string, Chain>;
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export const useBatchBalances = ({
  accounts,
  chainsMap,
  enabled = true,
  refetchInterval = 60000, // 1 minute
  staleTime = 30000, // 30 seconds
}: UseBatchBalancesParams) => {
  const request = BatchBalanceService.createBatchRequest(accounts, chainsMap);

  return useQuery<AssetBatchBalanceResponse | null, Error>({
    queryKey: ['batchBalances', request?.targetAddress, request?.assets],
    queryFn: async () => {
      if (!request) return null;
      return await BatchBalanceService.fetchBatchBalances(request);
    },
    enabled: enabled && !!request && accounts.length > 0,
    refetchInterval,
    staleTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

### Step 3: Integrate into Portfolio Refresh

```typescript
// In wallet-context.tsx, modify refreshPortfolio()

const refreshPortfolio = async (): Promise<void> => {
  try {
    // ... existing validation code ...

    const sdk = zapSDKService.getSDK();

    // STEP 1: Get portfolio data from backend (token list with metadata)
    let portfolioData;
    if (sdk.portfolio && typeof sdk.portfolio.getUserPortfolio === "function") {
      portfolioData = await zapSDKService.executeWithNetworkHandling(
        () => sdk.portfolio.getUserPortfolio(currentWalletUser, portfolioOptions),
        "getUserPortfolio"
      );
    }

    if (!portfolioData) {
      setPortfolio(null);
      return;
    }

    // STEP 2: Get wallet addresses for all chains
    const addressesByChain = new Map<string, string>();
    
    // Get addresses for each chain
    // (You'll need to get this from your address storage/getAddress function)
    for (const chain of walletChains) {
      const address = await getAddress(chain.symbol, mainUserWalletGroup?._id);
      if (address) {
        addressesByChain.set(chain.symbol, address);
      }
    }

    // STEP 3: Extract tokens from portfolio and group by address
    const tokens = BatchBalanceService.extractTokensFromPortfolio(
      portfolioData,
      addressesByChain
    );

    if (tokens.length > 0) {
      // STEP 4: Group tokens by address
      const addressGroups = BatchBalanceService.groupTokensByAddress(tokens);

      // STEP 5: Create batch requests for each address
      const batchRequests = BatchBalanceService.createBatchRequests(addressGroups);

      // STEP 6: Fetch batch balances for all addresses in parallel
      try {
        const batchResponses = await BatchBalanceService.fetchBatchBalancesForAllAddresses(
          batchRequests
        );

        // STEP 7: Merge all results
        const balanceResults = BatchBalanceService.mergeBatchResults(batchResponses);

        // STEP 8: Update portfolio with batch balance results
        portfolioData = BatchBalanceService.updatePortfolioWithBatchBalances(
          portfolioData,
          balanceResults
        );

        console.log(
          `✅ Updated ${balanceResults.size} account balances via batch fetching`
        );
      } catch (batchError) {
        console.warn('Batch balance fetch failed, using portfolio balances:', batchError);
        // Continue with portfolio data as-is (has balances from backend)
      }
    }

    // STEP 9: Cache and set portfolio
    if (portfolioData) {
      await savePortfolioToCache(
        portfolioData,
        portfolioOptions.mainUserWalletGroupId
      );
    }

    setPortfolio(portfolioData);
    setLastUpdate(new Date());
    setError(null);
  } catch (error: any) {
    setError("Failed to refresh portfolio. Please check your authentication.");
  } finally {
    setIsRefreshingPortfolio(false);
    setPortfolioAbortController(null);
  }
};
```

---

## File Structure After Integration

```
services/
├── batch-balance.service.ts          ← NEW: Core batch balance logic
├── portfolio.service.ts              ← MODIFY: Add batch balance helpers
└── ...

hooks/
├── useBatchBalances.tsx              ← NEW: React hook for batch balances
├── useAggregatedBalances.tsx         ← MODIFY: Use batch balances
└── ...

src/core/wallet/
└── wallet-context.tsx                ← MODIFY: Integrate into refresh flow

components/dashboard/
└── (existing components can use useBatchBalances hook)
```

---

## Benefits of This Approach

1. **Separation of Concerns**: Business logic in service, React logic in hooks
2. **Reusability**: Can be used in multiple components
3. **Backward Compatibility**: Existing code continues to work
4. **Gradual Migration**: Can be rolled out incrementally
5. **Testability**: Services and hooks can be tested independently
6. **Performance**: Significantly faster balance updates

---

## Migration Strategy

### Option A: Feature Flag (Recommended)
Add a feature flag to toggle between batch and regular portfolio fetching:

```typescript
const USE_BATCH_BALANCES = true; // or from config/env

if (USE_BATCH_BALANCES && batchRequest) {
  // Use batch balances
} else {
  // Use regular portfolio
}
```

### Option B: A/B Testing
Start with 10% of users, gradually increase

### Option C: Hybrid Approach
- Use batch balances for refresh operations
- Use regular portfolio for initial load (which includes metadata)

---

## Testing Checklist

- [ ] Batch balance service converts accounts correctly
- [ ] Hook fetches and caches data properly
- [ ] Integration with portfolio refresh works
- [ ] Error handling and fallbacks work
- [ ] Performance improvement verified (90% fewer RPC calls)
- [ ] Edge cases: empty accounts, missing addresses, invalid chains
- [ ] Multi-chain support verified
- [ ] Cache invalidation works correctly

---

## Performance Expectations

**Before (Current):**
- 100 tokens = 100+ individual RPC calls
- ~10-30 seconds for full portfolio refresh

**After (With Batch Balances):**
- 100 tokens = ~5-10 RPC calls (multicall batching)
- ~2-5 seconds for full portfolio refresh
- **90% reduction in network requests**

---

## Next Steps

1. Review this plan
2. Create the batch balance service
3. Create the hook
4. Integrate into one component first (test)
5. Roll out to portfolio refresh
6. Monitor performance improvements
7. Document usage patterns

---

**Created:** 2025-01-22
**Status:** Ready for Implementation

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. getUserPortfolio() - Backend API Call                        │
│    └─> Returns: Token List (metadata, enabled/disabled status)  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Get Wallet Addresses                                         │
│    └─> For each chain: getAddress(chainSymbol)                 │
│    └─> Result: Map<chainSymbol, walletAddress>                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Extract Tokens from Portfolio                                │
│    └─> Loop through userTokenList                              │
│    └─> Match tokens with addresses by chain                    │
│    └─> Result: TokenWithAddress[]                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Group Tokens by Address                                      │
│    └─> Group tokens that share the same wallet address         │
│    └─> Example:                                               │
│        Address A (ETH/BSC/Polygon) → [USDC, USDT, DAI]        │
│        Address B (SOL) → [USDC, USDT]                         │
│        Address C (TRX) → [USDT]                               │
│    └─> Result: Map<address, AddressGroup>                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Create Batch Requests                                        │
│    └─> For each address group:                                 │
│        createBatchRequest(address, tokens[])                   │
│    └─> Result: AssetBatchBalanceRequest[]                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Execute Batch Requests in Parallel                           │
│    └─> Promise.all([                                           │
│           getBatchBalancesForAssets(requestA),                 │
│           getBatchBalancesForAssets(requestB),                 │
│           getBatchBalancesForAssets(requestC)                  │
│        ])                                                       │
│    └─> Result: Map<address, AssetBatchBalanceResponse>        │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. Merge Results                                                │
│    └─> Combine all responses into single map                  │
│    └─> Key: accountId, Value: AssetBatchBalanceResult         │
│    └─> Result: Map<accountId, balanceResult>                  │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Update Portfolio                                             │
│    └─> Update account.balance for each account                │
│    └─> Update account.balanceUpdatedAt                        │
│    └─> Result: Updated portfolio data with fresh balances     │
└─────────────────────────────────────────────────────────────────┘
```

## Example Scenario

**Input:**
- Wallet has tokens on ETH, BSC, SOL, TRX
- ETH address: `0xABC...` (same for BSC, Polygon - EVM chains)
- SOL address: `SOL123...`
- TRX address: `TRX456...`

**Processing:**
1. Backend returns 50 tokens (USDC, USDT, DAI, etc.) with metadata
2. Extract tokens and match addresses:
   - ETH tokens → `0xABC...`
   - BSC tokens → `0xABC...` (same as ETH)
   - SOL tokens → `SOL123...`
   - TRX tokens → `TRX456...`
3. Group by address:
   - Group 1: `0xABC...` → [ETH tokens + BSC tokens + Polygon tokens]
   - Group 2: `SOL123...` → [SOL tokens]
   - Group 3: `TRX456...` → [TRX tokens]
4. Create 3 batch requests (one per address)
5. Execute 3 batch requests in parallel
6. Merge results → Update 50 account balances

**Result:** 
- 50 tokens fetched in 3 batch requests instead of 50 individual calls
- ~94% reduction in API calls
