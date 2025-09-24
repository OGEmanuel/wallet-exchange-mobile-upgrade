// TODO: Add the correct parameters for the create wallet
export interface CreateWalletParams {
  walletName: string | null;
  walletType: string | null;
  walletAddress: string | null;
  walletPrivateKey: string | null;
  walletPublicKey: string | null;
  walletSeedPhrase: string | null;
}