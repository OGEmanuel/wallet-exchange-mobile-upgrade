import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AddWalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddWallet: (walletName: string) => void;
  walletCount: number;
  isLoading?: boolean;
}

const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isVisible,
  onClose,
  onAddWallet,
  walletCount,
  isLoading = false,
}) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const [walletName, setWalletName] = useState("");

  const handleAddWallet = () => {
    if (walletName.trim()) {
      onAddWallet(walletName.trim());
      setWalletName("");
    }
  };

  const handleClose = () => {
    setWalletName("");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={handleClose}
        >
          <Box
            flex={1}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            justifyContent="flex-end"
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Box
                backgroundColor="modalBackgroundColor"
                borderTopLeftRadius={20}
                borderTopRightRadius={20}
                paddingHorizontal="l"
                paddingTop="l"
                paddingBottom="xl"
                style={{ paddingBottom: insets.bottom + 20 }}
              >
          {/* Drag Handle */}
          <Box
            width={40}
            height={4}
            backgroundColor="borderColor"
            borderRadius={2}
            alignSelf="center"
            marginBottom="l"
          />

          {/* Header */}
          <CustomText
            variant="header"
            fontSize={20}
            color="headerTextColor"
            marginBottom="xl"
          >
            Choose a name for your wallet
          </CustomText>

          {/* Wallet Name Input */}
          <Box marginBottom="xl">
            <TextInput
              value={walletName}
              onChangeText={setWalletName}
              placeholder={`Wallet ${walletCount}`}
              placeholderTextColor={theme.colors.placeholderTextColor}
              style={{
                backgroundColor: theme.colors.secondaryBackgroundColor,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                fontFamily: theme.textVariants.body.fontFamily,
                color: theme.colors.headerTextColor,
                borderColor: theme.colors.borderColor,
              }}
              autoFocus
            />
          </Box>

          {/* Add Wallet Button */}
          <CustomButton
            onPress={handleAddWallet}
            text={isLoading ? "Creating wallet..." : "Add wallet"}
            width="100%"
            borderRadius={30}
            paddingVertical={16}
            disabled={!walletName.trim() || isLoading}
          />
              </Box>
            </Pressable>
          </Box>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddWalletModal;
