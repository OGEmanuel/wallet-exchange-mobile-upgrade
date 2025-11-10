/**
 * Two-Factor Authentication Service
 * 
 * Singleton service to manage 2FA input bottom sheet globally.
 * Can be called from anywhere in the app, including non-React contexts.
 */

type TwoFAVerifyCallback = (code: string) => Promise<void>;

class TwoFactorAuthService {
  private static instance: TwoFactorAuthService;
  private show2FAInputCallback: ((onVerify: TwoFAVerifyCallback) => void) | null = null;
  private hide2FAInputCallback: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): TwoFactorAuthService {
    if (!TwoFactorAuthService.instance) {
      TwoFactorAuthService.instance = new TwoFactorAuthService();
    }
    return TwoFactorAuthService.instance;
  }

  /**
   * Register callbacks from the TwoFactorAuthProvider
   */
  public registerCallbacks(
    showCallback: (onVerify: TwoFAVerifyCallback) => void,
    hideCallback: () => void
  ) {
    this.show2FAInputCallback = showCallback;
    this.hide2FAInputCallback = hideCallback;
  }

  /**
   * Unregister callbacks
   */
  public unregisterCallbacks() {
    this.show2FAInputCallback = null;
    this.hide2FAInputCallback = null;
  }

  /**
   * Show the 2FA input bottom sheet
   * @param onVerify - Callback to handle verification
   */
  public show2FAInput(onVerify: TwoFAVerifyCallback) {
    if (this.show2FAInputCallback) {
      this.show2FAInputCallback(onVerify);
    } else {
      console.warn("2FA service not initialized. Make sure TwoFactorAuthProvider is mounted.");
    }
  }

  /**
   * Hide the 2FA input bottom sheet
   */
  public hide2FAInput() {
    if (this.hide2FAInputCallback) {
      this.hide2FAInputCallback();
    }
  }
}

export const twoFactorAuthService = TwoFactorAuthService.getInstance();

