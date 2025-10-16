import { WalletPinEntryStep } from "@/components/wallet/steps/WalletPinEntryStep";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import React, { useEffect, useState } from "react";
import { Modal } from "react-native";

interface PinEntryModalProps {
  visible: boolean;
  onSuccess: (pin: string) => void;
  onClose: () => void;
}

export const PinEntryModal: React.FC<PinEntryModalProps> = ({
  visible,
  onSuccess = (pin: string) => {},
  onClose,
}) => {
  console.log(visible)
  const [isChecking, setIsChecking] = useState(false);
  const [hasCheckedPin, setHasCheckedPin] = useState(false);
  const [hasStoredPin, setHasStoredPin] = useState(false);

  useEffect(() => {
    if (!hasCheckedPin) {
      checkPinStatus();
    }
  }, [hasCheckedPin]);

  const checkPinStatus = async () => {
    setIsChecking(true);

    try {
      const hasStoredPin = await pinStorageService.hasPin();

      console.log("Has Stored PIN", hasStoredPin)

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

  if (isChecking) {
    return null;
  }

  if (!isChecking && hasCheckedPin && !hasStoredPin) {
    onSuccess('');
    return null
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose} // Prevent back button dismissal
    >
      <WalletPinEntryStep
        onSuccess={(pin: string) => onSuccess(pin)}
        onBack={onClose}
      />
    </Modal>
  );
};
