import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import AppBottomSheet from "@/components/Modals/AppBottomSheet";
import ImportWalletModal from "@/components/Modals/ImportWalletModal";
import OnboardingInformationModal from "@/components/Modals/onboardingInformationModal";
import TermsAndConditions from "@/components/Modals/TermsAndConditions";
import { WalletFlowData, WalletFlowType } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

interface WalletNameStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  flowType?: WalletFlowType;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletNameStep: React.FC<WalletNameStepProps> = ({
  walletData,
  isLoading,
  flowType,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [showTermsModal, setShowTermsModal] = React.useState(false);

  const handleContinue = () => {
    Keyboard.dismiss();
    setShowTermsModal(true);
  };

  const handleTermsAccept = () => {
    setShowTermsModal(false);
    onContinue();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box
        flex={1}
        backgroundColor="mainBackgroundColor"
        padding="m"
        paddingTop="2xl"
      >
      <OnboardingInformationModal
        type="Wallet"
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      <ImportWalletModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
      <AppBottomSheet
        isVisible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        minHeight={400}
        maxHeight={600}
      >
        <TermsAndConditions
          onAccept={handleTermsAccept}
          isLoading={isLoading}
        />
      </AppBottomSheet>

      <AppBar
        leading={
          <ChevronLeft
            size={24}
            color={theme.colors.bodyTextColor}
            onPress={handleBack}
          />
        }
        paddingHorizontal={10}
        fontSize={18}
      />

      <Box flex={1} paddingHorizontal="s">
        <CustomText variant="medium" fontSize={22} mb="m" color="white">
          Name your wallet
        </CustomText>

        <CustomText variant="body" fontSize={14} mb="l">
          Choose a nice name for your wallet
        </CustomText>

        <CustomInputWithoutForm
          borderOnFocus
          label=""
          onChange={(value) => onUpdateData({ name: value.toString() })}
          value={walletData.name}
          placeholder="Wallet name"
          placeholderTextColor={theme.colors.placeholderTextColor}
          autoCapitalize="sentences"
          noBorder
        />

        <Box height={50} />

        <CustomButton
          disabled={walletData.name.length < 3}
          disabledColor={theme.colors.disabledTextColor}
          isLoading={isLoading}
          width="100%"
          borderRadius={56}
          text="Continue"
          onPress={handleContinue}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
        />
      </Box>

      {flowType === "create" && (
        <Box width="100%" height={150} justifyContent="center">
          <CustomButton
            width="100%"
            borderRadius={56}
            text="Import Existing Wallet"
            onPress={() => setShowImportModal(true)}
            borderWidth={1}
            bgColor="transparent"
            borderColor={theme.colors.borderColor}
            color={theme.colors.bodyTextColor}
            fontSize={14}
            variant="body"
          />
        </Box>
      )}
      </Box>
    </TouchableWithoutFeedback>
  );
};
