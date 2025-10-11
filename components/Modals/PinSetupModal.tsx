import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { WalletPinSetupStep } from "@/components/wallet/steps/WalletPinSetupStep";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Image, Modal, TouchableWithoutFeedback } from "react-native";

interface PinSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const theme = useTheme<Theme>();
  const [showCreatePin, setShowCreatePin] = useState(false);
  const [walletData, setWalletData] = useState<WalletFlowData>({
    name: "",
    passcode: "",
  });

  const handleCreatePin = () => {
    setShowCreatePin(true);
  };

  const handlePinSetupComplete = () => {
    console.log('🎉 PIN setup completed in modal');
    setShowCreatePin(false);
    onComplete();
  };

  const handleBack = () => {
    setShowCreatePin(false);
  };

  const handleUpdateData = (data: Partial<WalletFlowData>) => {
    console.log('📝 Updating wallet data in modal:', data);
    setWalletData((prev) => ({ ...prev, ...data }));
  };

  if (showCreatePin) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <WalletPinSetupStep
          walletData={walletData}
          isLoading={false}
          onBack={handleBack}
          onContinue={handlePinSetupComplete}
          onUpdateData={handleUpdateData}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Box
        flex={1}
        justifyContent="flex-end"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            style={{ backgroundColor: "transparent" }}
          />
        </TouchableWithoutFeedback>

        <Box
          backgroundColor="mainBackgroundColor"
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          padding="xl"
          paddingTop="m"
          marginHorizontal="l"
          width="90%"
          maxWidth={400}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            marginHorizontal: 0,
            width: "100%",
          }}
        >
          {/* Handle */}
          <Box
            width={40}
            height={4}
            borderRadius={2}
            alignSelf="center"
            mb="l"
            style={{ backgroundColor: "white" }}
          />

          {/* Header */}
          <Box alignItems="center" mb="xl">
            <Image
              source={require("@/assets/images/lock.png")}
              style={{
                width: 100,
                height: 100,
                resizeMode: "contain",
                marginBottom: theme.spacing.l,
              }}
            />

            <CustomText
              variant="medium"
              fontSize={24}
              color="white"
              textAlign="center"
              mb="s"
            >
              Protect your wallet
            </CustomText>

            <CustomText
              variant="body"
              fontSize={14}
              color="bodyTextColor"
              textAlign="center"
              mb="l"
            >
              Add a layer of security to your wallet. Create a secret PIN to
              further protect your funds.
            </CustomText>

            {/* Warning Box */}
            <Box
              borderRadius={4}
              padding="m"
              borderLeftWidth={4}
              width="100%"
              style={{
                backgroundColor: "#5752205E",
                borderLeftColor: "#FEDB24",
              }}
            >
              <CustomText
                variant="body"
                fontSize={14}
                color="bodyTextColor"
                textAlign="left"
              >
                Please be aware this pin is only useful in Zap wallet.
              </CustomText>
            </Box>
          </Box>

          {/* Buttons */}
          <Box flexDirection="row" gap="m">
            <CustomButton
              flex={1}
              text="Skip"
              onPress={onClose}
              bgColor={theme.colors.inActiveBtnColor}
              color={theme.colors.bodyTextColor}
              borderRadius={40}
              borderWidth={1}
              borderColor={theme.colors.inActiveBtnColor}
            />

            <CustomButton
              flex={1}
              text="Create Pin"
              onPress={handleCreatePin}
              bgColor={theme.colors.primaryColor}
              color={theme.colors.white}
              borderRadius={40}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};
