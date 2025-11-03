import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!hasCheckedPin) {
      checkPinStatus();
    }
  }, [hasCheckedPin]);

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

  // if (!isChecking && hasCheckedPin && !hasStoredPin) {
  //   onSuccess("");
  //   return null;
  // }

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
