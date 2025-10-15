import icons from "@/assets/icons";
import images from "@/assets/images";
import { ThemedFaceIDIcon } from "@/assets/svg/wallet-icons-components";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";
import { Modal, View } from "react-native";

interface ConfirmTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmTransactionModal: React.FC<ConfirmTransactionModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 15,
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: theme.colors.mainBackgroundColor,
            borderRadius: 20,
            padding: 15,
          }}
        >
          <CustomText variant="medium" textAlign="center" marginBottom="m">
            Confirm transaction
          </CustomText>

          <Box position="relative">
            <Image
              source={images.arrowsDown}
              style={{
                width: 40,
                height: 40,
                position: "absolute",
                top: 85,
                left: "50%",
                transform: [{ translateX: -20 }],
                zIndex: 500,
              }}
            />

            <Box
              bg={isDark ? "modalBackgroundColor" : "secondaryBackgroundColor"}
              borderRadius={8}
              style={{ padding: 10, marginBottom: 4 }}
              gap="m"
            >
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <Box gap="m">
                  <CustomText
                    variant="body"
                    color="disabledTextColor"
                    fontSize={12}
                  >
                    Pay
                  </CustomText>
                  <CustomText
                    variant="bodyBold"
                    color="bodyTextColor"
                    fontSize={17}
                  >
                    3 BNB
                  </CustomText>
                  <CustomText
                    variant="body"
                    color="disabledTextColor"
                    fontSize={12}
                  >
                    4,543.00
                  </CustomText>
                </Box>
                <Image
                  source={{
                    uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
                  }}
                  style={{ width: 35, height: 35 }}
                />
              </Box>
            </Box>

            <Box
              bg={isDark ? "modalBackgroundColor" : "secondaryBackgroundColor"}
              borderRadius={8}
              style={{ padding: 10 }}
              mb="m"
              gap="m"
            >
              <Box
                alignItems="center"
                flexDirection="row"
                justifyContent="space-between"
              >
                <Box gap="m">
                  <CustomText
                    variant="body"
                    color="disabledTextColor"
                    fontSize={12}
                  >
                    Receive
                  </CustomText>
                  <CustomText
                    variant="bodyBold"
                    color="bodyTextColor"
                    fontSize={17}
                  >
                    4,543,800 NGN
                  </CustomText>
                  <CustomText
                    variant="body"
                    color="disabledTextColor"
                    fontSize={12}
                  >
                    4,543.00
                  </CustomText>
                </Box>
                <Image
                  source={images.nigeria}
                  style={{ width: 35, height: 35, borderRadius: 50 }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            bg={isDark ? "modalBackgroundColor" : "secondaryBackgroundColor"}
            borderRadius={8}
            p="m"
            mb="m"
            gap="m"
          >
            <Box
              alignItems="center"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Box gap="s">
                <CustomText
                  variant="body"
                  color="disabledTextColor"
                  fontSize={12}
                >
                  To
                </CustomText>
                <CustomText variant="body" color="bodyTextColor">
                  Salami Adeoti
                </CustomText>
              </Box>
              <Box
                width={5}
                height={5}
                backgroundColor="warningColor"
                borderRadius={50}
              />
            </Box>
          </Box>

          <Box
            borderColor="borderColor"
            borderWidth={1}
            borderRadius={8}
            p="m"
            mb="m"
            gap="m"
          >
            <Box
              alignItems="center"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Box flexDirection="row" alignItems="center" style={{ gap: 3 }}>
                <CustomText
                  variant="body"
                  color="disabledTextColor"
                  fontSize={12}
                >
                  Network Fee
                </CustomText>
                <Image
                  source={icons.help}
                  style={{
                    width: 14,
                    height: 14,
                  }}
                />
              </Box>

              <CustomText variant="body" color="bodyTextColor" fontSize={12}>
                $0.09
              </CustomText>
            </Box>
            <Box
              alignItems="center"
              flexDirection="row"
              justifyContent="space-between"
            >
              <CustomText
                variant="body"
                color="disabledTextColor"
                fontSize={12}
              >
                LP fee
              </CustomText>

              <Box flexDirection="row" alignItems="center" gap="s">
                <CustomText
                  variant="body"
                  color="disabledTextColor"
                  fontSize={12}
                >
                  1,200 NGN
                </CustomText>
                <CustomText variant="body" color="bodyTextColor" fontSize={12}>
                  $0.09
                </CustomText>
              </Box>
            </Box>
            <Box
              alignItems="center"
              flexDirection="row"
              justifyContent="space-between"
            >
              <CustomText
                variant="body"
                color="disabledTextColor"
                fontSize={12}
              >
                Total
              </CustomText>

              <CustomText variant="body" color="bodyTextColor" fontSize={12}>
                $0.12
              </CustomText>
            </Box>
          </Box>

          <Box
            gap="m"
            mt="m"
            flexDirection="row"
            justifyContent="space-between"
            alignContent="center"
            alignItems="center"
          >
            <CustomButton
              text="Cancel"
              onPress={onClose}
              borderRadius={50}
              bgColor="#1F232D"
              width={155}
            />

            <CustomButton
              text="Confirm"
              onPress={onConfirm}
              borderRadius={50}
              width={155}
              trailingIcon={
                <Box ml="s">
                  <ThemedFaceIDIcon
                    width={20}
                    height={20}
                    darkModeColor={theme.colors.bodyTextColor}
                    lightModeColor={theme.colors.white}
                  />
                </Box>
              }
            />
          </Box>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmTransactionModal;
