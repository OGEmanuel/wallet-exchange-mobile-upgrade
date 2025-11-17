import TwoFactorAuthInputBottomSheet, {
  TwoFactorAuthInputBottomSheetRef,
} from "@/components/bottomsheets/TwoFactorAuthInputBottomSheet";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { twoFactorAuthService } from "../../services/two-factor-auth.service";

interface TwoFactorAuthContextType {
  show2FAInput: (onVerify: (code: string) => Promise<void>) => void;
  hide2FAInput: () => void;
  is2FAInputVisible: boolean;
}

const TwoFactorAuthContext = createContext<TwoFactorAuthContextType | undefined>(undefined);

export const useTwoFactorAuth = () => {
  const context = useContext(TwoFactorAuthContext);
  if (!context) {
    throw new Error("useTwoFactorAuth must be used within a TwoFactorAuthProvider");
  }
  return context;
};

interface TwoFactorAuthProviderProps {
  children: React.ReactNode;
}

export const TwoFactorAuthProvider: React.FC<TwoFactorAuthProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [verifyCallback, setVerifyCallback] = useState<((code: string) => Promise<void>) | null>(null);
  const bottomSheetRef = useRef<TwoFactorAuthInputBottomSheetRef>(null);

  const show2FAInput = useCallback((onVerify: (code: string) => Promise<void>) => {
    setVerifyCallback(() => onVerify);
    setIsVisible(true);
    bottomSheetRef.current?.open();
  }, []);

  const hide2FAInput = useCallback(() => {
    setIsVisible(false);
    setVerifyCallback(null);
    bottomSheetRef.current?.close();
  }, []);

  // Register callbacks with the service on mount
  useEffect(() => {
    twoFactorAuthService.registerCallbacks(show2FAInput, hide2FAInput);
    return () => {
      twoFactorAuthService.unregisterCallbacks();
    };
  }, [show2FAInput, hide2FAInput]);

  const handleVerify = useCallback(async (code: string) => {
    if (verifyCallback) {
      try {
        await verifyCallback(code);
        // On success, close the 2FA input
        hide2FAInput();
      } catch (error: any) {
        // Don't close the 2FA input on error - let the bottom sheet display the error
        // Re-throw error so the bottom sheet can display it
        throw error;
      }
    }
  }, [verifyCallback, hide2FAInput]);

  const handleCancel = useCallback(() => {
    hide2FAInput();
  }, [hide2FAInput]);

  const contextValue: TwoFactorAuthContextType = {
    show2FAInput,
    hide2FAInput,
    is2FAInputVisible: isVisible,
  };

  return (
    <TwoFactorAuthContext.Provider value={contextValue}>
      {children}
      <TwoFactorAuthInputBottomSheet
        ref={bottomSheetRef}
        onVerify={handleVerify}
        onCancel={handleCancel}
        onClose={hide2FAInput}
      />
    </TwoFactorAuthContext.Provider>
  );
};

