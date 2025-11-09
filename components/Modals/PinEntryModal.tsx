import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { StorageKeys } from "@/src/core/storage/storage-types";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-native";
import { WalletPinEntryStep } from "../wallet/steps/WalletPinEntryStep";
import { WalletPinSetupStep } from "../wallet/steps/WalletPinSetupStep";

interface PinEntryModalProps {
  visible: boolean;
  onSuccess: (pin: string) => void;
  onClose: () => void;
  type: "VERIFY" | "SETUP";
}

export const PinEntryModal: React.FC<PinEntryModalProps> = ({
  visible,
  onSuccess = (pin: string) => {},
  onClose,
  type,
}) => {
  console.log("is visible", visible);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCheckedPin, setHasCheckedPin] = useState(false);
  const [hasStoredPin, setHasStoredPin] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [hasCheckedBiometric, setHasCheckedBiometric] = useState(false);
  const hasCalledOnSuccessRef = useRef(false); // Prevent multiple calls to onSuccess
  const biometricAttemptedRef = useRef(false); // Track if biometric was attempted

  useEffect(() => {
    // Only check PIN status when modal becomes visible
    // Reset state when modal closes
    if (visible && !hasCheckedPin) {
      hasCalledOnSuccessRef.current = false; // Reset when modal opens
      biometricAttemptedRef.current = false; // Reset biometric attempt
      setHasCheckedBiometric(false); // Reset biometric check status
      checkPinStatus();
      checkBiometricStatus();
    } else if (!visible) {
      // Reset state when modal closes to prevent stale state
      setHasCheckedPin(false);
      setHasStoredPin(false);
      setShowPinEntry(false);
      setHasCheckedBiometric(false);
      hasCalledOnSuccessRef.current = false;
      biometricAttemptedRef.current = false;
    }
  }, [visible, hasCheckedPin]);

  // Check biometric status
  const checkBiometricStatus = async () => {
    try {
      // Check if biometric is enabled
      const biometricEnabled = await SecureStore.getItemAsync(StorageKeys.BIOMETRIC_ENABLED);
      const isEnabled = biometricEnabled === "true";
      setIsBiometricEnabled(isEnabled);

      // Check if device has biometric hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      let hasHardwareSupport = false;
      if (hasHardware) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        hasHardwareSupport = types.length > 0;
      }
      setHasBiometricHardware(hasHardwareSupport);
      
      // Mark biometric check as complete
      setHasCheckedBiometric(true);
      
      console.log("🔐 Biometric status checked:", { isEnabled, hasHardwareSupport });
    } catch (error) {
      console.error("Failed to check biometric status:", error);
      setIsBiometricEnabled(false);
      setHasBiometricHardware(false);
      setHasCheckedBiometric(true); // Mark as checked even on error
    }
  };

  // Attempt biometric authentication
  const attemptBiometricAuth = async () => {
    if (biometricAttemptedRef.current) {
      return; // Already attempted
    }

    try {
      biometricAttemptedRef.current = true;
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to continue",
        cancelLabel: "Cancel",
        disableDeviceFallback: false, // Allow fallback to device PIN/password
      });

      if (result.success) {
        console.log("✅ Biometric authentication successful");
        // Biometric succeeded - call onSuccess with empty PIN (biometric is the auth)
        hasCalledOnSuccessRef.current = true;
        onSuccess('');
      } else {
        console.log("❌ Biometric authentication failed or cancelled:", result.error);
        // Biometric failed - show PIN entry as fallback
        setShowPinEntry(true);
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      // On error, fall back to PIN entry
      setShowPinEntry(true);
    }
  };

  // Attempt biometric when modal opens and biometric is enabled
  useEffect(() => {
    // Wait for both PIN and biometric checks to complete
    if (
      visible &&
      !isChecking &&
      hasCheckedPin &&
      hasCheckedBiometric &&
      hasStoredPin &&
      isBiometricEnabled &&
      hasBiometricHardware &&
      type === "VERIFY" &&
      !biometricAttemptedRef.current &&
      !showPinEntry
    ) {
      console.log("🔐 Biometric enabled - attempting authentication");
      attemptBiometricAuth();
    } else if (
      visible &&
      !isChecking &&
      hasCheckedPin &&
      hasCheckedBiometric &&
      hasStoredPin &&
      (!isBiometricEnabled || !hasBiometricHardware) &&
      type === "VERIFY" &&
      !showPinEntry
    ) {
      // Biometric not enabled or not available - show PIN entry
      console.log("🔐 Biometric not available - showing PIN entry");
      setShowPinEntry(true);
    }
  }, [
    visible,
    isChecking,
    hasCheckedPin,
    hasCheckedBiometric,
    hasStoredPin,
    isBiometricEnabled,
    hasBiometricHardware,
    type,
    showPinEntry,
  ]);
  
  // Handle auto-proceed when no PIN is stored
  // This should only happen AFTER user has confirmed (e.g., clicked "Yes, remove")
  useEffect(() => {
    if (visible && !isChecking && hasCheckedPin && !hasStoredPin && !hasCalledOnSuccessRef.current) {
      console.log("🔐 No PIN stored - auto-proceeding after user confirmation");
      hasCalledOnSuccessRef.current = true; // Prevent multiple calls
      // Small delay to ensure this happens after render
      const timer = setTimeout(() => {
        onSuccess('');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, isChecking, hasCheckedPin, hasStoredPin, onSuccess]);

  const checkPinStatus = async () => {
    try {
      const hasStoredPin = await pinStorageService.hasPin();

      console.log("Has Stored PIN", hasStoredPin);

      if (hasStoredPin) {
        setHasStoredPin(true);
      } else {
        setHasStoredPin(false);
      }
    } catch (error) {
      console.error("Failed to check PIN status:", error);
      // setShowPinSetup(true);
    } finally {
      setIsChecking(false);
      setHasCheckedPin(true); // Mark that we've checked PIN status
    }
  };

  // if (isChecking) {
  //   return null;
  // }

  // If no PIN is stored, don't render the PIN entry screen
  // The useEffect above will handle calling onSuccess
  if (visible && !isChecking && hasCheckedPin && !hasStoredPin) {
    console.log("🔐 No PIN stored - not rendering PIN entry (will auto-proceed via useEffect)");
    return null;
  }
  
  // Don't render if modal is not visible
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      style={{ backgroundColor: "transparent" }}
      onRequestClose={onClose} // Prevent back button dismissal
    >
      {!isChecking && type === "VERIFY" && (
        <WalletPinEntryStep
          onSuccess={(pin: string) => onSuccess(pin)}
          onBack={onClose}
        />
      )}
      {!isChecking && type === "SETUP" && (
        <WalletPinSetupStep
          onBack={onClose}
          isLoading={isChecking}
          onContinue={() => onClose()}
          onUpdateData={(data) => {
            console.log("onUpdateData", data);
          }}
        />
      )}
    </Modal>
  );
};
