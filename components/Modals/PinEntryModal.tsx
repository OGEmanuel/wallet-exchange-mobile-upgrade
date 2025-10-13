import { WalletPinEntryStep } from "@/components/wallet/steps/WalletPinEntryStep";
import React from "react";
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
