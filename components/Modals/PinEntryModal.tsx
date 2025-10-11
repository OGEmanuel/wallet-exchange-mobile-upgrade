import { WalletPinEntryStep } from "@/components/wallet/steps/WalletPinEntryStep";
import React from "react";
import { Modal } from "react-native";

interface PinEntryModalProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinEntryModal: React.FC<PinEntryModalProps> = ({
  visible,
  onSuccess,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {}} // Prevent back button dismissal
    >
      <WalletPinEntryStep
        onSuccess={onSuccess}
        onBack={() => {}} // Remove back functionality
      />
    </Modal>
  );
};
