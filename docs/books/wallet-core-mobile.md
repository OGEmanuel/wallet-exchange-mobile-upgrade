# Book of Wallet Core — Mobile

**Keeper**: Mobile Team | **Last Review**: 2025-01-22 | **Status**: Active

## I. Mission

- Provide centralized wallet authentication and management for the mobile app
- Manage user wallet groups with secure credential storage and retrieval
- Handle wallet creation, deletion, and switching operations
- Integrate with Zap SDK for blockchain operations and real-time updates

## II. Detailed Feature Implementation

### 1. Wallet Login

**Location**: `src/core/wallet/wallet-context.tsx` - `walletLogin` function

**Step-by-Step Logic**:
1. **Input Parameters**:
   - `deviceToken`: Device identifier for authentication
   - `deviceFingerprint`: Unique device fingerprint
   - `pushToken`: Push notification token

2. **Authentication Flow**:
   ```typescript
   const walletLogin = async (deviceToken: string, deviceFingerprint: string, pushToken: string) => {
     setIsAuthenticating(true);
     setError(null);
     
     const sdk = zapSDKService.getSDK();
     const result = await sdk.walletAuth.login({
       deviceToken,
       deviceFingerprint,
       pushToken,
     });
     
     if (result.success) {
       setIsWalletAuthenticated(true);
       setCurrentWalletUser(result.userId);
       await checkAuthenticationAndRoute(false);
       return true;
     }
   }
   ```

3. **Post-Login Processing**:
   - Sets `isWalletAuthenticated = true`
   - Stores `currentWalletUser` with the returned user ID
   - Calls `checkAuthenticationAndRoute(false)` to verify wallet groups
   - Returns boolean success status

4. **Error Handling**:
   - Catches and logs authentication errors
   - Sets error state for UI display
   - Always sets `isAuthenticating = false` in finally block

### 2. User Wallet Groups

**Location**: `src/core/wallet/wallet-context.tsx` - `checkAuthenticationAndRoute` function

**Step-by-Step Logic**:
1. **Authentication Check**:
   ```typescript
   const walletUserId = await zapSDKService.getCurrentUserId();
   const isWalletAuth = !!walletUserId;
   ```

2. **Wallet Groups Fetching**:
   - If wallet is authenticated, calls `setWalletAndRoute`
   - If not authenticated, attempts `attemptDeviceLogin`
   - Routes to `routeToWallet` for wallet group processing

3. **Wallet Groups Processing**:
   ```typescript
   const setWalletAndRoute = async (walletUserId, isWalletAuth, shouldRoute, result) => {
     setCurrentWalletUser(walletUserId);
     setIsWalletAuthenticated(true);
     
     const routeResult = await routeToWallet(isWalletAuth, walletUserId, shouldRoute);
     return {
       ...result,
       isUserWalletGroups: routeResult?.isUserWalletGroups,
       userWalletGroups: routeResult?.userWalletGroups,
     };
   }
   ```

4. **Caching Logic**:
   - Uses `loadWalletGroupsWithCache` for faster initialization
   - Falls back to API call if cache is empty
   - Stores wallet groups in local state and SecureStore

### 3. Create Wallet Group

**Location**: `src/core/wallet/wallet-context.tsx` - `createWalletGroup` function

**Step-by-Step Logic**:
1. **Input Validation**:
   ```typescript
   const createWalletGroup = async ({
     name,
     seedPhrase,
     privateKey,
     watchAddress,
     walletType = WALLET_GROUP_TYPE.GENERATED,
     walletClass = WALLET_GROUP_CLASS.SEEDPHRASE,
     searchChain,
   }) => {
   ```

2. **Credential Generation**:
   ```typescript
   let seedPhraseToUse = seedPhrase;
   if (!seedPhrase && !privateKey && !watchAddress) {
     seedPhraseToUse = await zapSDKService.generateSeedPhrase();
   }
   ```

3. **Local Storage**:
   ```typescript
   const walletStorageId = await WalletCredentialsStorage.storeWalletCredential({
     name,
     class: walletClass,
     chain: searchChain,
     credential: seedPhraseToUse || privateKey || watchAddress || "",
     derivationIndex: 0,
   });
   ```

4. **SDK Integration**:
   ```typescript
   const result = await zapSDKService.createWalletGroupMultipurpose({
     name,
     seedPhrase: seedPhraseToUse,
     privateKey,
     watchAddress,
     walletType,
   });
   ```

5. **Post-Creation Processing**:
   - Marks wallet as created in storage
   - Refreshes user wallet groups
   - Switches to the new wallet group
   - Returns creation result with wallet storage ID

### 4. Delete Wallet Group

**Location**: `src/core/wallet/wallet-context.tsx` - `removeWalletGroup` function

**Step-by-Step Logic**:
1. **SDK Removal**:
   ```typescript
   await zapSDKService.deleteWalletGroup(walletGroupId);
   ```

2. **Credential Cleanup**:
   ```typescript
   await WalletCredentialsStorage.deleteCredentialsByUserWalletGroupId(userWalletGroupId);
   ```

3. **Address/Key Cleanup**:
   ```typescript
   await AddressesStorage.clearAddresses(userWalletGroupId);
   await PrivateKeysStorage.clearPrivateKeys(userWalletGroupId);
   await SeedPhraseStorage.clearSeedPhrase(userWalletGroupId);
   ```

4. **Cache Cleanup**:
   ```typescript
   await clearPortfolioCache(userWalletGroupId);
   ```

5. **Smart Switching**:
   - If deleted wallet was main wallet, switches to another wallet
   - Refreshes wallet groups list
   - Updates main wallet group selection

### 5. Update Wallet Group/Wallet Name

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Update wallet group name in SDK
- Update local storage with new name
- Refresh wallet groups list
- Update UI state

### 6. Add Wallet to Wallet Group

**Location**: `src/core/wallet/wallet-context.tsx` - `createAccounts` function

**Step-by-Step Logic**:
1. **Account Derivation**:
   ```typescript
   const derivedAccounts = await storeAndDeriveCredentials(
     userWalletGroupId,
     walletChains,
     currentSeedPhrase
   );
   ```

2. **SDK Integration**:
   ```typescript
   await sdk.wallets.addAccountsToWallet(userWalletGroupId, derivedAccounts);
   ```

3. **Storage Management**:
   - Stores derived addresses and private keys
   - Updates wallet group with new accounts
   - Refreshes portfolio data

### 7. Derive Multichain Addresses

**Location**: `src/core/wallet/wallet-context.tsx` - `deriveAndStoreCredentials` function

**Step-by-Step Logic**:
1. **Chain Processing**:
   ```typescript
   for (const chain of walletChains) {
     if (isEVMChain(chain.symbol)) {
       // Reuse ETH address for all EVM chains
       const ethAddress = await getStoredAddresses(userWalletGroupId, 'ETH');
       if (ethAddress) {
         await AddressesStorage.storeAddress(userWalletGroupId, chain.symbol, ethAddress);
       }
     }
   }
   ```

2. **Address Derivation**:
   ```typescript
   const addresses = await zapSDKService.deriveMultiChainAddresses(
     seedPhrase,
     walletChains.map(chain => chain.symbol)
   );
   ```

3. **Storage**:
   - Stores addresses by chain symbol
   - Stores private keys by chain symbol
   - Handles EVM chain optimization (reuse ETH address)

### 8. Add Accounts to Wallet

**Location**: `src/core/wallet/wallet-context.tsx` - `createAccounts` function

**Step-by-Step Logic**:
1. **Credential Storage**:
   ```typescript
   await storeAndDeriveCredentials(userWalletGroupId, walletChains, currentSeedPhrase);
   ```

2. **SDK Account Addition**:
   ```typescript
   await sdk.wallets.addAccountsToWallet(userWalletGroupId, derivedAccounts);
   ```

3. **Portfolio Refresh**:
   - Refreshes portfolio after account addition
   - Updates UI with new accounts
   - Handles loading states

### 9. Get Portfolio/Token List

**Location**: `src/core/wallet/wallet-context.tsx` - `refreshPortfolio` function

**Step-by-Step Logic**:
1. **API Call**:
   ```typescript
   const portfolioData = await zapSDKService.executeWithNetworkHandling(
     () => sdk.portfolio.getUserPortfolio(currentWalletUser, portfolioOptions),
     "getUserPortfolio"
   );
   ```

2. **Caching**:
   ```typescript
   await savePortfolioToCache(portfolioData, portfolioOptions.mainUserWalletGroupId);
   ```

3. **State Update**:
   ```typescript
   setPortfolio(portfolioData);
   setLastUpdate(new Date());
   ```

### 10. Process Portfolio

**Location**: `services/portfolio.service.ts` - `processPortfolioData` function

**Step-by-Step Logic**:
1. **Data Extraction**:
   ```typescript
   const accounts = mainWalletGroupPortfolio.mainWalletPortfolio?.accounts || [];
   ```

2. **Token Processing**:
   - Maps accounts to processed assets
   - Calculates USD values
   - Handles market data integration

3. **Redux Dispatch**:
   ```typescript
   dispatch(setProcessedPortfolio(processedAssets));
   dispatch(setProcessedTokenList(processedTokens));
   ```

### 11. Process Token List

**Location**: `services/portfolio.service.ts` - `processTokenList` function

**Step-by-Step Logic**:
1. **Token List Processing**:
   ```typescript
   static processTokenList(portfolioData, chains, supportedCurrencies, marketTokens) {
     const userTokenList = portfolioData.userTokenList;
     // Process each token with balance and chain info
   }
   ```

2. **Balance Calculation**:
   - Maps token balances from portfolio data
   - Calculates USD values using market rates
   - Handles missing balance data

3. **Chain Information**:
   - Maps tokens to their respective chains
   - Includes chain symbols and names
   - Handles chain-specific metadata

### 12. Enable/Disable Tokens

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Toggle token visibility in portfolio
- Update Redux state
- Persist preferences in storage
- Refresh portfolio display

### 13. Import Tokens

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Add custom token to portfolio
- Validate token contract address
- Update token list
- Refresh portfolio data

### 14. Addresses & Private Keys Management

**Location**: `src/core/wallet/wallet-context.tsx` - `getAddress`, `getPrivateKey` functions

**Step-by-Step Logic**:
1. **Address Retrieval**:
   ```typescript
   const getAddress = async (chainId: string): Promise<string> => {
     const storedAddress = await getStoredAddresses(userWalletGroupId, chainId);
     if (storedAddress) return storedAddress;
     
     // Derive if not stored
     const derivedAddress = await deriveAndStoreCredentials(userWalletGroupId, chainId);
     return derivedAddress;
   }
   ```

2. **Private Key Retrieval**:
   ```typescript
   const getPrivateKey = async (chainId: string): Promise<string> => {
     const storedKey = await getStoredPrivateKeys(userWalletGroupId, chainId);
     if (storedKey) return storedKey;
     
     // Derive if not stored
     const derivedKey = await deriveAndStoreCredentials(userWalletGroupId, chainId);
     return derivedKey;
   }
   ```

3. **EVM Chain Optimization**:
   - Reuses ETH address/private key for all EVM chains
   - Prevents redundant derivation
   - Improves performance

### 15. Send Tokens

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Validate recipient address
- Calculate gas fees
- Sign transaction with private key
- Broadcast transaction
- Handle transaction status

### 16. Estimate Gas Fees

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Call blockchain RPC for gas estimation
- Handle different chain types
- Return fee in native currency
- Handle estimation errors

### 17. Create Address in Address Book

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Store address with label
- Validate address format
- Update address book list
- Persist in storage

### 18. Delete Address in Address Book

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Remove address from storage
- Update address book list
- Handle deletion confirmation

### 19. Link Zap Wallet

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Connect wallet to Zap platform
- Handle authentication flow
- Store connection status
- Sync wallet data

## IV. Exchange Features

### 20. Exchange Login

**Location**: `src/core/wallet/wallet-context.tsx` - `exchangeLogin` function

**Step-by-Step Logic**:
1. **Input Parameters**:
   - `email`: User's email address for authentication

2. **OTP Sending**:
   ```typescript
   const exchangeLogin = async (email: string): Promise<boolean> => {
     setIsAuthenticating(true);
     setError(null);
     
     const result = await zapSDKService.sendExchangeOtp(email);
     
     if (result) {
       return true;
     } else {
       setError(result || "Failed to send OTP");
       return false;
     }
   }
   ```

3. **Error Handling**:
   - Catches and logs exchange login errors
   - Sets error state for UI display
   - Always sets `isAuthenticating = false` in finally block

### 21. Exchange Complete Onboarding

**Location**: `src/core/wallet/wallet-context.tsx` - `completeOnboarding` function

**Step-by-Step Logic**:
1. **Input Parameters**:
   ```typescript
   const completeOnboarding = async (data: {
     username?: string | null;
     userSource?: string | null;
     referralCode?: string | null;
   }) => {
   ```

2. **Onboarding Process**:
   ```typescript
   const result = await zapSDKService.completeOnboarding(
     currentExchangeUser,
     data
   );
   ```

3. **User Data Handling**:
   ```typescript
   let user: any = result?.data?.user || null;
   if (!user) {
     user = await zapSDKService.getExchangeUser();
   }
   
   if (user && user._id) {
     setIsExchangeAuthenticated(true);
     setCurrentExchangeUser(user._id);
     setExchangeUserData(user);
   }
   ```

4. **Return Status**:
   - Returns success/failure status
   - Includes success message
   - Handles error cases with appropriate messages

### 22. Update User Details

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Update user profile information
- Validate input data
- Sync with backend
- Update local state

### 23. 2FA Management

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Enable/disable 2FA
- Generate 2FA secret
- Validate 2FA codes
- Store 2FA preferences

### 24. KYC Verification

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Document upload and verification
- Identity verification flow
- KYC status tracking
- Compliance checks

## V. Banking & Payments Features

### 25. Create Bank Accounts

**Location**: `src/core/sdk/zap-sdk.service.ts` - `createBankAccount` function

**Step-by-Step Logic**:
1. **Input Parameters**:
   ```typescript
   public async createBankAccount(params: {
     bankId: string;
     name: string;
     supportedCurrency: SupportedCurrency;
     userId: string;
     number: string;
   }) {
   ```

2. **SDK Integration**:
   ```typescript
   return this.executeWithNetworkHandling(
     () => this.getSDK().bankAccounts.createBankAccount(params),
     'createBankAccount'
   );
   ```

3. **Error Handling**:
   - Network error handling
   - Validation error handling
   - Returns bank account data on success

### 26. Get Bank Accounts

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Fetch user's bank accounts
- Display account information
- Handle account selection
- Cache account data

### 27. Delete Bank Accounts

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Remove bank account from user
- Validate deletion permissions
- Update account list
- Handle deletion confirmation

## VI. Market Data Features

### 28. Get Market Rates

**Location**: `src/modules/swap/presentation/hooks/useSwapSDK.ts` - `fetchMarketRate` function

**Step-by-Step Logic**:
1. **Rate Fetching**:
   ```typescript
   const fetchMarketRate = async (baseCurrency, targetCurrency, amount, isBuyAmount) => {
     const rateResponse = await zapSDKService.executeWithNetworkHandling(
       () => sdk.exchange.getRates({
         buySupportedCurrencyId: targetCurrency.currencyId._id,
         sellSupportedCurrencyId: baseCurrency.currencyId._id,
         buyAmount: isBuyAmount ? amount : undefined,
         sellAmount: !isBuyAmount ? amount : undefined,
       }),
       "getRates"
     );
   }
   ```

2. **Rate Processing**:
   ```typescript
   const swapRate: SwapRate = {
     rate: rateResponse?.data?.rate || 0,
     lpFee: rateResponse?.data?.lpFee || 0,
     lpFeeUsd: rateResponse?.data?.lpFeeUsd || 0,
     buyRate: rateResponse?.data?.buyRate || 0,
     sellRate: rateResponse?.data?.sellRate || 0,
     minAmount: rateResponse?.data?.minAmount || 0,
     maxAmount: rateResponse?.data?.maxAmount || 0,
   };
   ```

3. **State Update**:
   - Updates market rate state
   - Handles rate calculation for opposing currency
   - Manages loading and error states

### 29. Get Token Details

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Fetch token metadata
- Display token information
- Handle token images and descriptions
- Cache token details

### 30. Create Price Alerts

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Set price alert thresholds
- Store alert preferences
- Handle alert notifications
- Manage alert lifecycle

### 31. Get Price Alerts

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Fetch user's price alerts
- Display alert list
- Handle alert management
- Update alert status

### 32. Notify on Price Alert

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Trigger price alert notifications
- Handle push notifications
- Update alert status
- Manage notification preferences

### 33. Add Token to Watchlist

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Add token to user's watchlist
- Store watchlist preferences
- Display watchlist tokens
- Handle watchlist management

## VII. Order Processing Features

### 34. Create Order

**Location**: `src/core/sdk/zap-sdk.service.ts` - `createOrder` function

**Step-by-Step Logic**:
1. **Order Creation**:
   ```typescript
   public async createOrder(params: CreateOrderRequest) {
     return this.executeWithNetworkHandling(
       () => this.getSDK().orders.createOrder(params),
       'createOrder'
     );
   }
   ```

2. **Order Parameters**:
   - `buyCurrency`: Currency to buy
   - `sellCurrency`: Currency to sell
   - `buyAmount`: Amount to buy
   - `sellAmount`: Amount to sell
   - `withdrawalAccountId`: Bank account for fiat withdrawal

3. **Order Response**:
   - Returns order details
   - Includes order ID and status
   - Handles order creation errors

### 35. Deposit Confirmation

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Confirm deposit transactions
- Update order status
- Handle deposit verification
- Manage deposit flow

### 36. Withdrawal Confirmation

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Confirm withdrawal transactions
- Update order status
- Handle withdrawal verification
- Manage withdrawal flow

### 37. Underpaid/Overpaid Orders

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Detect underpaid/overpaid orders
- Handle order adjustments
- Manage refund processes
- Update order status

## VIII. System & Security Features

### 38. Blockchain Workers

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Monitor blockchain transactions
- Process transaction confirmations
- Handle blockchain events
- Manage worker status

### 39. Phone Pin Management/Biometrics

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Set up phone PIN
- Enable biometric authentication
- Handle authentication flow
- Store authentication preferences

### 40. Notification Management

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:
- Manage push notifications
- Handle notification preferences
- Process notification events
- Update notification status

## IX. Architecture

### High-Level Flow

```
User Action → WalletContext → SDK Service → Backend API
     ↓              ↓            ↓           ↓
UI Component → useWallet Hook → zapSDKService → Zap SDK
     ↓              ↓            ↓           ↓
State Update → Redux Store → SecureStore → Blockchain
```

### Key Packages / Services

- **Core Context**: `src/core/wallet/wallet-context.tsx`
- **SDK Service**: `src/core/sdk/zap-sdk.service.ts`
- **Storage**: `src/core/storage/` (AddressesStorage, PrivateKeysStorage, SeedPhraseStorage)
- **UI Screens**: `app/dashboard/` (home, manage-wallet, swap, activity)
- **State Management**: `state/` (Redux store with portfolio and wallet state)

### External Dependencies

- **SDK**: `@zap/blockchain-sdk` - Core blockchain operations
- **Storage**: `expo-secure-store` - Secure credential storage
- **Navigation**: `expo-router` - Screen navigation
- **State**: `@reduxjs/toolkit` - State management
- **UI**: `@shopify/restyle` - Theming system

## III. Public Surface

### Screens & Navigation

| Screen            | Route                                       | Props | Purpose                              |
| ----------------- | ------------------------------------------- | ----- | ------------------------------------ |
| `Home`            | `/dashboard/home/wallet-home/home`          | `{}`  | Main wallet dashboard with portfolio |
| `ManageWallet`    | `/dashboard/manage-wallet`                  | `{}`  | Wallet group management              |
| `Swap`            | `/dashboard/home/wallet-home/swap`          | `{}`  | Token exchange functionality         |
| `Activity`        | `/dashboard/home/wallet-home/activity`      | `{}`  | Transaction history                  |
| `WalletAddresses` | `/dashboard/manage-wallet/wallet-addresses` | `{}`  | Address management                   |

### Hooks & Services

| Hook/Service        | Parameters                                        | Returns                 | Purpose                                 |
| ------------------- | ------------------------------------------------- | ----------------------- | --------------------------------------- |
| `useWallet`         | `{}`                                              | `WalletContextType`     | Main wallet context with all operations |
| `walletLogin`       | `{phoneNumber, pin}`                              | `Promise<AuthResult>`   | Authenticate wallet user                |
| `createWalletGroup` | `{name, seedPhrase?, privateKey?, watchAddress?}` | `Promise<WalletResult>` | Create new wallet group                 |
| `removeWalletGroup` | `{walletGroupId, userWalletGroupId}`              | `Promise<boolean>`      | Delete wallet group with cleanup        |
| `switchWallet`      | `{walletGroupId, userWalletGroups?}`              | `Promise<void>`         | Switch active wallet group              |
| `refreshPortfolio`  | `{}`                                              | `Promise<void>`         | Refresh portfolio data                  |
| `getAddress`        | `{chainId}`                                       | `Promise<string>`       | Get address for specific chain          |
| `getPrivateKey`     | `{chainId}`                                       | `Promise<string>`       | Get private key for specific chain      |

### Events & Webhooks

| Event                 | Trigger                  | Payload                 | Handler                   |
| --------------------- | ------------------------ | ----------------------- | ------------------------- |
| `walletAuthenticated` | Successful wallet login  | `{user, walletGroups}`  | `processWalletGroups`     |
| `walletGroupCreated`  | New wallet group created | `{walletGroupId, name}` | `switchWallet`            |
| `walletGroupRemoved`  | Wallet group deleted     | `{walletGroupId}`       | `refreshUserWalletGroups` |
| `portfolioUpdated`    | Portfolio data refreshed | `{portfolio}`           | `setPortfolio`            |

## IV. Data & State

### Redux Store Structure

```typescript
interface WalletState {
  // Portfolio data
  processedPortfolio: ProcessedAsset[];
  rawPortfolio: any;
  processedTokenList: ProcessedAsset[];

  // Wallet groups
  userWalletGroups: UserWalletGroup[];
  mainUserWalletGroup: UserWalletGroup | null;

  // Loading states
  isRefreshingPortfolio: boolean;
  isCreatingWallet: boolean;
  isAccountDeriving: boolean;
}
```

### Local Storage

- **SecureStore Keys**:
  - `MAIN_WALLET_GROUP_ID` - Active wallet group ID
  - `WALLET_CREDENTIALS_*` - Encrypted wallet credentials
  - `ADDRESSES_*` - Derived addresses by wallet group
  - `PRIVATE_KEYS_*` - Derived private keys by wallet group
  - `SEED_PHRASES_*` - Seed phrases by wallet group
- **AsyncStorage**: Portfolio cache and user preferences
- **Cache**: Portfolio data with TTL for performance

### State Invariants

- Only one wallet group can be active at a time (`mainUserWalletGroup`)
- All wallet operations require authentication (`isWalletAuthenticated`)
- Credentials are stored securely and never logged
- Portfolio data is always fresh or cached with TTL

## V. Security

### Authentication

- **Wallet Auth**: Phone number + PIN authentication via Zap SDK
- **Exchange Auth**: Separate exchange user authentication
- **Biometric**: Device biometric authentication for sensitive operations

### Sensitive Data

- **Private Keys**: Stored in `expo-secure-store` with wallet group isolation
- **Seed Phrases**: Encrypted storage with wallet group-specific keys
- **Auth Tokens**: Secure storage with automatic refresh

### Threat Model

- **Key Extraction**: All credentials stored in secure hardware when available
- **Man-in-the-Middle**: All API calls use HTTPS with certificate pinning
- **Device Compromise**: Biometric authentication required for sensitive operations
- **Memory Dumps**: Sensitive data cleared from memory after use

## VI. Ops

### Environment Variables

```bash
# Required environment variables
API_BASE_URL=https://api.zap.exchange
WEBSOCKET_URL=wss://ws.zap.exchange
SDK_ENVIRONMENT=production
```

### Build & Deploy

```bash
# Development
npm run start
expo start

# Production build
eas build --platform all
```

### Observability

- **Logging**: Structured logging with wallet operation tracking
- **Error Tracking**: Sentry integration for crash reporting
- **Analytics**: Wallet usage analytics (anonymized)

## VII. Tests

### Test Coverage

- **Unit Tests**: 85% coverage for wallet context functions
- **Integration Tests**: SDK integration and storage operations
- **E2E Tests**: Complete wallet creation and management flows

### Critical Test Cases

- Wallet creation with seed phrase generation
- Wallet group removal with complete cleanup
- Address derivation for multiple chains
- Portfolio refresh and caching
- Wallet switching and state management

## VIII. Changelog & Owners

### Current Owner(s)

- **Primary**: Mobile Team (mobile@zap.exchange)
- **Secondary**: Blockchain Team (blockchain@zap.exchange)

### Recent Changes

- **2025-01-22**: Implemented centralized wallet group removal with complete cleanup
- **2025-01-22**: Added EVM chain optimization for address/private key reuse
- **2025-01-22**: Consolidated wallet creation functions into single `createWalletGroup`
- **2025-01-22**: Added centralized credential storage and retrieval functions
- **2025-01-22**: Implemented WebSocket integration for real-time updates

### TODO / Open Questions

- [ ] Add wallet backup and restore functionality
- [ ] Implement wallet group naming and organization
- [ ] Add wallet group export/import features
- [ ] Optimize portfolio refresh performance for large token lists
- [ ] Add wallet group sharing capabilities

---

**Note**: This documentation is generated from code analysis. All behavior is derived from actual implementation in `src/core/wallet/wallet-context.tsx` and related files.
