import { pinStorageService } from "@/src/core/storage/pin-storage.service";
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
  const hasCalledOnSuccessRef = useRef(false); // Prevent multiple calls to onSuccess

  useEffect(() => {
    // Only check PIN status when modal becomes visible
    // Reset state when modal closes
    if (visible && !hasCheckedPin) {
      hasCalledOnSuccessRef.current = false; // Reset when modal opens
      checkPinStatus();
    } else if (!visible) {
      // Reset state when modal closes to prevent stale state
      setHasCheckedPin(false);
      setHasStoredPin(false);
      hasCalledOnSuccessRef.current = false;
    }
  }, [visible, hasCheckedPin]);
  
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
