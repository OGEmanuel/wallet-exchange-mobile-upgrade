/**
 * Create Wallet Parameters
 * 
 * Defines the required parameters for creating a new wallet
 * 
 * @example
 * ```typescript
 * const params: CreateWalletParams = {
 *   walletName: 'My Bitcoin Wallet',
 *   walletType: 'bitcoin',
 *   walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
 *   walletPrivateKey: 'L5EZftvrYaSu...',
 *   walletPublicKey: '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc',
 *   walletSeedPhrase: 'abandon abandon abandon...'
 * };
 * ```
 */
export interface CreateWalletParams {
  /** Human-readable name for the wallet */
  walletName: string;
  
  /** Type of wallet (bitcoin, ethereum, etc.) */
  walletType: WalletType;
  
  /** Wallet address (derived from public key) */
  walletAddress: string;
  
  /** Private key for wallet access */
  walletPrivateKey: string;
  
  /** Public key for wallet operations */
  walletPublicKey: string;
  
  /** Seed phrase for wallet recovery (12, 15, 18, 21, or 24 words) */
  walletSeedPhrase: string;
}

/**
 * Supported wallet types
 */
export enum WalletType {
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  LITECOIN = 'litecoin',
  BITCOIN_CASH = 'bitcoin_cash',
  DOGECOIN = 'dogecoin'
}

/**
 * Wallet creation response
 */
export interface CreateWalletResponse {
  /** Unique wallet identifier */
  walletId: string;
  
  /** Wallet address */
  address: string;
  
  /** Wallet type */
  type: WalletType;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Wallet status */
  status: WalletStatus;
}

/**
 * Wallet status enumeration
 */
export enum WalletStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}