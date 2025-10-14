import { ThemedFaceIDIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Modal, Pressable } from "react-native";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import { PinEntryModal } from "./PinEntryModal";

interface RemoveWalletModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  walletName?: string;
  showPinModal: boolean;
  setShowPinModal: (show: boolean) => void;
  handlePinSuccess: (pin: string) => void;
}

const RemoveWalletModal: React.FC<RemoveWalletModalProps> = ({
  visible,
  onClose,
  onConfirm,
  walletName = "wallet group",
  showPinModal,
  setShowPinModal,
  handlePinSuccess,
}) => {
  console.log(
    "🗑️ RemoveWalletModal - visible:",
    visible,
    "walletName:",
    walletName
  );
  const theme = useTheme<Theme>();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Box
          flex={1}
          backgroundColor="black"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          justifyContent="flex-end"
          alignItems="center"
          paddingHorizontal="l"
          paddingBottom="2xl"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 320 }}
          >
            <Box
              backgroundColor="modalBackgroundColor"
              borderRadius={16}
              paddingHorizontal="l"
              paddingBottom="l"
              paddingTop="s"
              width="100%"
              maxWidth={320}
            >
              {/* Draggable handle */}
              <Box
                width={40}
                height={4}
                backgroundColor="disabledTextColor"
                borderRadius={2}
                alignSelf="center"
                marginBottom="m"
              />

              {/* Title */}
              <CustomText
                variant="header"
                fontSize={20}
                color="headerTextColor"
                textAlign="center"
                marginBottom="m"
              >
                Remove wallet group
              </CustomText>

              {/* Warning message */}
              <CustomText
                variant="body"
                fontSize={14}
                color="whiteBodyText"
                textAlign="center"
                lineHeight={20}
                marginBottom="xl"
              >
                Removing wallet group will result in permanent erasure of data
                from your device. Your Recovery phrase and private keys will be
                removed.
                {"\n\n"}
                This action is not reversible, are you sure you want to remove?
              </CustomText>

              {/* Delete button */}
              <CustomButton
                onPress={onConfirm}
                text="Yes, remove  "
                height={48}
                width="100%"
                borderRadius={30}
                bgColor={theme.colors.error}
                color={theme.colors.white}
                variant="bodySubheader"
                fontSize={16}
                trailingIcon={<ThemedFaceIDIcon />}
              />
            </Box>
          </Pressable>
        </Box>
      </Pressable>

      {/* PIN Verification Modal - Nested inside RemoveWalletModal */}
      <PinEntryModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSuccess}
      />
    </Modal>
  );
};

export default RemoveWalletModal;
