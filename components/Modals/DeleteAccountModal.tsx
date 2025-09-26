import { BankAccount } from "@/interfaces/account.interface";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Modal, Pressable } from "react-native";
import { Box, CustomButton, CustomText } from "../general";

interface DeleteAccountModalProps {
  visible: boolean;
  account: BankAccount | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  account,
  onClose,
  onConfirm,
}) => {
  const theme = useTheme<Theme>();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.mainBackgroundColor,
            borderRadius: 12,
            marginHorizontal: 20,
            width: "90%",
            maxWidth: 400,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Box paddingHorizontal="l" paddingVertical="m">
            <CustomText
              variant="bodyBold"
              textAlign="center"
              style={{
                fontFamily: "NewScience_Bold",
              }}
            >
              Delete Account?
            </CustomText>
          </Box>

          <Box paddingHorizontal="l" paddingBottom="m">
            <CustomText variant="body" color="bodyTextColor" textAlign="center">
              Are you sure you want to delete this account? You cannot undo this
              action.
            </CustomText>
          </Box>

          <Box
            flexDirection="row"
            paddingHorizontal="l"
            paddingBottom="l"
            gap="l"
          >
            <Box flex={1}>
              <CustomButton
                text="Cancel"
                onPress={onClose}
                bgColor={theme.colors.secondaryBackgroundColor}
                color={theme.colors.bodyTextColor}
                width="100%"
                borderRadius={50}
              />
            </Box>
            <Box flex={1}>
              <CustomButton
                text="Yes, Delete"
                onPress={handleConfirm}
                bgColor={theme.colors.error}
                color={theme.colors.white}
                width="100%"
                borderRadius={50}
              />
            </Box>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default DeleteAccountModal;
