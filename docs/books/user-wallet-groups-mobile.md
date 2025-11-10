# Book of User Wallet Groups Management — Mobile

**Keeper**: Mobile Team | **Last Review**: 2025-01-22 | **Status**: Active

## I. Mission

- Manage user wallet groups with complete CRUD operations
- Handle wallet group creation, deletion, and switching
- Maintain wallet group state and persistence
- Integrate with Zap SDK for wallet group operations

## II. Detailed Implementation

### 1. Get User Wallet Groups

**Location**: `src/core/wallet/wallet-context.tsx` - `refreshUserWalletGroups` function

**Step-by-Step Logic**:

1. **Authentication Check**:
   ```typescript
   const refreshUserWalletGroups = async (): Promise<any> => {
     try {
       if (!isWalletAuthenticated || !currentWalletUser) {
         console.log("⚠️ Cannot refresh wallet groups - not authenticated");
         return [];
       }
   ```

2. **SDK Validation**:
   ```typescript
   const sdk = zapSDKService.getSDK();
   if (!sdk) {
     console.log("⚠️ Cannot refresh wallet groups - SDK not available");
     return [];
   }
   ```

3. **API Call**:
   ```typescript
   console.log("🔄 Refreshing user wallet groups...");
   const uWalletGroups = await zapSDKService.getUserWalletGroups(
     currentWalletUser,
     { useCache: false }
   );
   ```

4. **Response Processing**:
   ```typescript
   let walletGroupsArray: IUserWalletGroup[] = [];
   if (Array.isArray(uWalletGroups)) {
     walletGroupsArray = uWalletGroups;
   } else if (
     uWalletGroups &&
     uWalletGroups.userWalletGroups &&
     Array.isArray(uWalletGroups.userWalletGroups)
   ) {
     walletGroupsArray = uWalletGroups.userWalletGroups;
   } else {
     console.warn("⚠️ Invalid user wallet groups response:", uWalletGroups);
     setUserWalletGroups([]);
     return [];
   }
   ```

5. **Cache Management**:
   ```typescript
   await clearWalletGroupsCache();
   await clearPortfolioCache(mainUserWalletGroup?._id);
   if (walletGroupsArray.length > 0) {
     await saveWalletGroupsToCache(walletGroupsArray);
   }
   ```

6. **State Update**:
   ```typescript
   setUserWalletGroups(walletGroupsArray);
   return walletGroupsArray;
   ```

### 2. Create Wallet Group

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
   ```typescript
   if (!result?.userWalletGroupId) {
     await WalletCredentialsStorage.markWalletCreationAttempt(
       walletStorageId,
       false
     );
     throw new Error("Failed to create wallet group");
   }

   await WalletCredentialsStorage.markWalletAsCreated(
     walletStorageId,
     result.userWalletGroupId
   );

   const newUserWalletGroups = await refreshUserWalletGroups();
   await switchWallet(result.userWalletGroupId, newUserWalletGroups);
   ```

### 3. Delete Wallet Group

**Location**: `src/core/wallet/wallet-context.tsx` - `removeWalletGroup` function

**Step-by-Step Logic**:

1. **SDK Removal**:
   ```typescript
   const removeWalletGroup = async (
     walletGroupId: string,
     userWalletGroupId: string
   ): Promise<boolean> => {
     try {
       console.log("🗑️ Removing wallet group:", walletGroupId);

       const sdk = zapSDKService.getSDK();
       if (!sdk) {
         throw new Error("SDK not initialized");
       }

       await zapSDKService.deleteWalletGroup(walletGroupId);
       console.log("✅ Wallet group removed from SDK");
   ```

2. **Credential Cleanup**:
   ```typescript
   await WalletCredentialsStorage.deleteCredentialsByUserWalletGroupId(
     userWalletGroupId
   );
   console.log("✅ Wallet credentials removed from storage");
   ```

3. **Address/Key Cleanup**:
   ```typescript
   try {
     await AddressesStorage.clearAddresses(userWalletGroupId);
     await PrivateKeysStorage.clearPrivateKeys(userWalletGroupId);
     await SeedPhraseStorage.clearSeedPhrase(userWalletGroupId);
     console.log("✅ Stored addresses, private keys, and seed phrase cleared");
   } catch (error) {
     console.warn("⚠️ Failed to clear stored credentials:", error);
   }
   ```

4. **Cache Cleanup**:
   ```typescript
   await clearPortfolioCache(userWalletGroupId);
   ```

5. **Smart Switching**:
   ```typescript
   if (mainUserWalletGroup?._id === userWalletGroupId) {
     const remainingGroups = userWalletGroups.filter(
       (group) => group._id !== userWalletGroupId
     );
     
     if (remainingGroups.length > 0) {
       await switchWallet(remainingGroups[0]._id, remainingGroups);
     } else {
       setMainUserWalletGroup(null);
       setPortfolio(null);
     }
   }
   ```

6. **State Update**:
   ```typescript
   const updatedGroups = userWalletGroups.filter(
     (group) => group._id !== userWalletGroupId
   );
   setUserWalletGroups(updatedGroups);
   ```

### 4. Switch Wallet Group

**Location**: `src/core/wallet/wallet-context.tsx` - `switchWallet` function

**Step-by-Step Logic**:

1. **Input Validation**:
   ```typescript
   const switchWallet = async (
     userWalletGroupId: string,
     walletGroupsToUse?: any[]
   ): Promise<void> => {
     const groupsToUse = walletGroupsToUse || userWalletGroups;
     try {
       const sdk = zapSDKService.getSDK();
       if (!sdk) {
         throw new Error("SDK not initialized");
       }
   ```

2. **Group Selection**:
   ```typescript
   const selectedGroup = groupsToUse.find(
     (group) => group._id === userWalletGroupId
   );

   if (!selectedGroup) {
     throw new Error("Selected wallet group not found");
   }
   ```

3. **State Update**:
   ```typescript
   setMainUserWalletGroup(selectedGroup);
   setPortfolio(null);
   ```

4. **Portfolio Loading**:
   ```typescript
   const portfolio = await loadPortfolioFromCache(selectedGroup._id);
   if (portfolio) setPortfolio(portfolio);
   setLastUpdate(null);
   setError(null);
   ```

5. **Persistence**:
   ```typescript
   await SecureStore.setItemAsync(
     StorageKeys.MAIN_WALLET_GROUP_ID,
     userWalletGroupId
   );
   ```

6. **Credential Loading**:
   ```typescript
   const credentials = await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
     userWalletGroupId
   );
   if (credentials?.class === WALLET_GROUP_CLASS.SEEDPHRASE) {
     setCurrentSeedPhrase(credentials?.credential.toString() || null);
   }
   ```

### 5. Update Wallet Group Name

**Location**: TBD - Not yet implemented in current codebase

**Required Implementation**:

1. **Input Validation**:
   ```typescript
   const updateWalletGroupName = async (
     userWalletGroupId: string,
     newName: string
   ): Promise<boolean> => {
     // Validate input
     if (!newName || newName.trim().length === 0) {
       throw new Error("Wallet group name cannot be empty");
     }
   ```

2. **SDK Update**:
   ```typescript
   const result = await zapSDKService.updateWalletGroupName(
     userWalletGroupId,
     newName
   );
   ```

3. **Local Storage Update**:
   ```typescript
   await WalletCredentialsStorage.updateWalletGroupName(
     userWalletGroupId,
     newName
   );
   ```

4. **State Update**:
   ```typescript
   const updatedGroups = userWalletGroups.map(group =>
     group._id === userWalletGroupId
       ? { ...group, name: newName }
       : group
   );
   setUserWalletGroups(updatedGroups);
   
   if (mainUserWalletGroup?._id === userWalletGroupId) {
     setMainUserWalletGroup({ ...mainUserWalletGroup, name: newName });
   }
   ```

### 6. Wallet Group Caching

**Location**: `src/core/wallet/wallet-context.tsx` - Cache management functions

**Step-by-Step Logic**:

1. **Save to Cache**:
   ```typescript
   const saveWalletGroupsToCache = async (walletGroups: IUserWalletGroup[]) => {
     try {
       await SecureStore.setItemAsync(
         StorageKeys.USER_WALLET_GROUPS,
         JSON.stringify(walletGroups)
       );
     } catch (error) {
       console.error("Failed to save wallet groups to cache:", error);
     }
   };
   ```

2. **Load from Cache**:
   ```typescript
   const loadWalletGroupsFromCache = async (): Promise<IUserWalletGroup[]> => {
     try {
       const cached = await SecureStore.getItemAsync(StorageKeys.USER_WALLET_GROUPS);
       return cached ? JSON.parse(cached) : [];
     } catch (error) {
       console.error("Failed to load wallet groups from cache:", error);
       return [];
     }
   };
   ```

3. **Clear Cache**:
   ```typescript
   const clearWalletGroupsCache = async () => {
     try {
       await SecureStore.deleteItemAsync(StorageKeys.USER_WALLET_GROUPS);
     } catch (error) {
       console.error("Failed to clear wallet groups cache:", error);
     }
   };
   ```

## III. Architecture

### High-Level Flow
```
User Action → WalletContext → SDK Service → Backend API
     ↓              ↓            ↓           ↓
UI Component → useWallet Hook → zapSDKService → Zap SDK
     ↓              ↓            ↓           ↓
State Update → Redux Store → SecureStore → Blockchain
```

### Key Components
- **WalletContext**: Main wallet group state management
- **zapSDKService**: SDK integration for wallet operations
- **WalletCredentialsStorage**: Secure credential storage
- **AddressesStorage**: Address management
- **PrivateKeysStorage**: Private key management
- **SeedPhraseStorage**: Seed phrase management

### External Dependencies
- **SDK**: `@zap/blockchain-sdk` - Wallet group operations
- **Storage**: `expo-secure-store` - Secure credential storage
- **State**: `@reduxjs/toolkit` - State management
- **Navigation**: `expo-router` - Screen navigation

## IV. Data & State

### Wallet Group State
```typescript
interface WalletGroupState {
  userWalletGroups: IUserWalletGroup[];
  isUserWalletGroups: boolean;
  mainUserWalletGroup: IUserWalletGroup | null;
  isCreatingWallet: boolean;
  error: string | null;
}
```

### Wallet Group Structure
```typescript
interface IUserWalletGroup {
  _id: string;
  name: string;
  walletGroupId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Storage Keys
```typescript
enum StorageKeys {
  USER_WALLET_GROUPS = 'USER_WALLET_GROUPS',
  MAIN_WALLET_GROUP_ID = 'MAIN_WALLET_GROUP_ID',
  WALLET_CREDENTIALS = 'WALLET_CREDENTIALS_',
  ADDRESSES = 'ADDRESSES_',
  PRIVATE_KEYS = 'PRIVATE_KEYS_',
  SEED_PHRASES = 'SEED_PHRASES_',
}
```

## V. Security

### Credential Management
- **Secure Storage**: All credentials stored in `expo-secure-store`
- **Wallet Group Isolation**: Each wallet group has separate credential storage
- **Automatic Cleanup**: Credentials are cleared when wallet groups are deleted

### Access Control
- **Authentication Required**: All operations require wallet authentication
- **SDK Validation**: All operations validated through Zap SDK
- **Error Handling**: No sensitive information in error messages

### Threat Model
- **Credential Theft**: Secure storage prevents credential extraction
- **Unauthorized Access**: Authentication required for all operations
- **Data Leakage**: Credentials cleared on wallet group deletion

## VI. Error Handling

### Wallet Group Operations
```typescript
try {
  // Wallet group operation
} catch (error) {
  console.error("Wallet group operation failed:", error);
  setError("Operation failed");
  return false;
}
```

### SDK Integration
- Handled by `zapSDKService.executeWithNetworkHandling`
- Automatic retry logic
- Circuit breaker pattern

### Cache Operations
```typescript
try {
  // Cache operation
} catch (error) {
  console.error("Cache operation failed:", error);
  // Continue without cache
}
```

## VII. Testing

### Critical Test Cases
- **Create Wallet Group**: Valid and invalid inputs
- **Delete Wallet Group**: With and without remaining groups
- **Switch Wallet Group**: Valid and invalid group IDs
- **Update Wallet Group Name**: Valid and invalid names
- **Cache Operations**: Save, load, and clear operations
- **Error Handling**: Network errors and invalid inputs

### Test Coverage
- **Unit Tests**: Wallet group operations and state management
- **Integration Tests**: SDK integration and storage operations
- **E2E Tests**: Complete wallet group management flow

## VIII. Changelog & Owners

### Current Owner(s)
- **Primary**: Mobile Team (mobile@zap.exchange)
- **Secondary**: Blockchain Team (blockchain@zap.exchange)

### Recent Changes
- **2025-01-22**: Implemented centralized wallet group removal with complete cleanup
- **2025-01-22**: Added smart wallet switching when deleting main wallet group
- **2025-01-22**: Improved cache management for wallet groups
- **2025-01-22**: Enhanced error handling and state management

### TODO / Open Questions
- [ ] Implement wallet group name updating
- [ ] Add wallet group backup and restore
- [ ] Implement wallet group sharing
- [ ] Add wallet group organization features
- [ ] Implement wallet group export/import

---

**Note**: This documentation is generated from code analysis. All behavior is derived from actual implementation in `src/core/wallet/wallet-context.tsx`.
