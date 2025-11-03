# Wallet Switch Flow & Balance Display Logic

## Overview
This document explains what happens when a user switches wallets and how balances are displayed in the wallet selector sheet.

---

## 1. WALLET SWITCHING FLOW (`switchWallet` in `wallet-context.tsx`)

### Step-by-Step Process:

**A. User clicks wallet in selector → `switchWallet(userWalletGroupId)` is called**

**B. Clear old wallet cache (lines 2691-2694)**
- Clears the previous wallet's portfolio cache from SecureStore
- Prevents stale data from showing

**C. Update state (lines 2696-2706)**
- `setMainUserWalletGroup(selectedGroup)` - Updates main wallet state FIRST
- `setTimeout(0)` - Waits for React state update
- `setPortfolio(null)` - Clears current portfolio (triggers Redux cleanup via useEffect in home.tsx)
- `setLastUpdate(null)`
- `setError(null)`

**D. Load credentials (lines 2714-2721)**
- Gets credentials for the selected wallet group
- Sets seed phrase if needed

**E. Load portfolio (lines 2723-2782)**
- If `forceRefresh = true`: Immediately calls `refreshPortfolio()`
- Otherwise:
  1. Check cache validity with `isPortfolioCacheValid(userWalletGroupId)`
  2. If cache valid:
     - Load cached portfolio from SecureStore
     - Set portfolio state: `setPortfolio(cachedPortfolio)`
     - If `shouldRefreshInBackground`: Call `refreshPortfolioInBackground()`
  3. If cache invalid: Call `refreshPortfolio()`

---

## 2. EFFECTS TRIGGERED BY WALLET SWITCH

### A. `useAggregatedBalances` - Wallet Change Effect (lines 291-315)

**Trigger:** `mainUserWalletGroup._id` changes

**What happens:**
1. Detects wallet change (compares current vs previous wallet ID)
2. **Preserves balance cache** (lines 302-309):
   - Creates new Map with existing `balanceCache`
   - Only deletes the previous wallet's balance from cache
   - Other wallets keep their balances
3. Does NOT clear `aggregatedBalances` - balances should persist

### B. `useAggregatedBalances` - Portfolio Change Effect (lines 318-326)

**Trigger:** `portfolio` or `userWalletGroups` changes

**What happens:**
- Calls `calculateAllBalances()` if `userWalletGroups` exists
- This runs even when `portfolio` is `null` (during switching)

### C. `home.tsx` - Wallet Change Effect (lines 74-92)

**Trigger:** `mainUserWalletGroup._id` changes

**What happens:**
- Clears Redux state: `clearPortfolioData()` and `clearTokenListData()`
- Prevents stale processed portfolio from showing

---

## 3. BALANCE CALCULATION (`calculateAllBalances` in `useAggregatedBalances.tsx`)

### Process (lines 151-285):

**A. Initialize (lines 176-178)**
```typescript
const newBalanceCache = new Map<string, any>(balanceCache);
```
- **CRITICAL**: Starts with existing `balanceCache` to preserve balances
- This prevents balances from going to 0 during wallet switching

**B. Calculate current portfolio balances (lines 169-174)**
- If `portfolio` exists: Calculate balances for main wallet
- If `portfolio` is null: Skip (will use cache for all wallets)

**C. Loop through all wallets (lines 181-249)**

For each wallet:

1. **Main Wallet + Portfolio exists** (line 194):
   - Recalculate from current portfolio data
   - Use fresh balances

2. **Other wallets OR Main wallet but portfolio is null**:
   - **Check preserved cache first** (line 198):
     - If balance exists in `newBalanceCache` and > 0: **PRESERVE IT**
     - Log: "💰 Preserving cached balance for wallet..."
   
   - **Try portfolio cache** (lines 206-222):
     - Load portfolio from SecureStore for that wallet
     - Calculate balance from cached portfolio
     - Log: "📦 Loaded balance from portfolio cache..."
   
   - **Fallback** (lines 224-227):
     - If no cache found, keep existing balance from `newBalanceCache`
     - Otherwise set to 0

3. **Store balance** (lines 236-248):
   - Creates `balanceData` object with wallet balance
   - Stores in `newBalanceCache.set(userWalletGroupId, balanceData)`

**D. Update state (lines 252-278)**
- `setBalanceCache(newBalanceCache)` - Updates balance cache
- Creates `enhancedWalletGroups` with balances
- `setAggregatedBalances(result)` - Updates aggregated balances

---

## 4. WALLET SELECTOR BALANCE DISPLAY

### Data Flow:

**A. Wallet Selector Component (`WalletSelectorBottomSheet.tsx` line 49-67)**

1. Gets `getEnhancedWalletGroups` from `useAggregatedBalances()` hook
2. Calls `getEnhancedWalletGroups()` (line 67)

**B. `getEnhancedWalletGroups()` (useAggregatedBalances.tsx lines 360-376)**

Returns:
- **If `aggregatedBalances.enhancedWalletGroups` exists**: Returns it (has balances)
- **Otherwise**: Creates basic structure from `userWalletGroups` with balances = 0

**C. Wallet Selector Processing (WalletSelectorBottomSheet.tsx lines 80-140)**

1. Uses `walletGroupsToUse`:
   - Priority: `enhancedWalletGroups` (has balances)
   - Fallback: `userWalletGroups` (balances = 0)

2. For each wallet group (line 96):
   ```typescript
   const totalValue = userWalletGroup.aggregatedBalance ?? 0;
   ```
   - Uses `aggregatedBalance` from `enhancedWalletGroups`
   - Falls back to 0 if not available

3. Displays balance in UI

---

## 5. THE PROBLEM: Why Balances Go to $0.00

### Root Cause:
When wallet switches:
1. `setPortfolio(null)` triggers `calculateAllBalances()`
2. `calculateAllBalances()` creates new `newBalanceCache = new Map(balanceCache)`
3. But if `portfolio` is null and no cached portfolio exists for other wallets:
   - It tries to preserve from `newBalanceCache`
   - But `newBalanceCache` might not have those balances yet
   - Result: Sets balance to 0

### Current Fix Attempt:
- Line 178: `new Map(balanceCache)` - Preserves existing balances
- Lines 198-203: Checks if balance exists in preserved cache and > 0, preserves it
- Lines 206-222: Tries to load from SecureStore portfolio cache

### Potential Issues:
1. `balanceCache` state might not be populated when wallet switches
2. SecureStore portfolio cache might not have balance calculated
3. Timing: `calculateAllBalances` might run before balances are calculated

---

## 6. SOLUTION APPROACH

The balance preservation logic should:
1. ✅ Preserve `balanceCache` Map (already doing this)
2. ✅ Check preserved cache before setting to 0 (already doing this)
3. ✅ Load from SecureStore portfolio cache (already doing this)
4. ❓ **BUT**: Need to ensure balances are calculated and stored when portfolio loads

**The real issue**: Balances might not be in `balanceCache` when switching because they were never calculated/stored in the first place, OR they're being cleared somewhere.

**Next steps to debug:**
1. Add logs to see if `balanceCache` has balances when switching
2. Check if `calculateAllBalances` is actually preserving balances
3. Verify SecureStore portfolio cache has balance data
4. Check timing - is `calculateAllBalances` running after balances are set?

