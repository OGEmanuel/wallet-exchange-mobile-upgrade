import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Modal, Pressable } from "react-native";
import { Box, CustomButton, CustomText } from "../general";

interface DeleteAddressModalProps {
  visible: boolean;
  addressName: string;
  address: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAddressModal: React.FC<DeleteAddressModalProps> = ({
  visible,
  addressName,
  address,
  onClose,
  onConfirm,
}) => {
  const theme = useTheme<Theme>();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Format address to show first 6 and last 4 characters
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
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
              Delete Address?
            </CustomText>
          </Box>

          <Box paddingHorizontal="l" paddingBottom="m">
            <CustomText variant="body" color="bodyTextColor" textAlign="center" marginBottom="s">
              Are you sure you want to delete "{addressName}"?
            </CustomText>
            <CustomText variant="body" color="disabledTextColor" textAlign="center" fontSize={12}>
              {formatAddress(address)}
            </CustomText>
            <CustomText variant="body" color="bodyTextColor" textAlign="center" marginTop="s">
              You cannot undo this action.
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
                text="Delete"
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

export default DeleteAddressModal;

