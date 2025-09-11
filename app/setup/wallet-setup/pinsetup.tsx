import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentPage,
  setCurrentPage,
} from "@/state/reducers/currentPage.reducer";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import { router } from "expo-router";
import WhatIsSeedPhraseModal from "@/components/Modals/onboardingInformationModal";
import { PinInput, PinInputRef } from "@pakenfit/react-native-pin-input";
import AppBar from "@/components/general/AppBar";

const PinSetup = () => {
  // states
  const [showWhatIsASeedPhreasModal, setShowImportWalletModal] =
    React.useState(false);

  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentPage);
  const ref = React.useRef<PinInputRef>(null);

  const handleNext = () => {
    router.push("/setup/wallet-setup/success");
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
    }
    dispatch(setCurrentPage(1));
  };
  return (
    <Box flex={1} padding="m" backgroundColor="mainBackgroundColor">
      <WhatIsSeedPhraseModal
        type="SeedPhrase"
        isOpen={showWhatIsASeedPhreasModal}
        onClose={() => {
          setShowImportWalletModal(false);
          router.push("/");
        }}
      />
      <AppBar
        leading={
          <ChevronLeft
            size={30}
            color={theme.colors.bodyTextColor}
            onPress={handleBack}
          />
        }
        paddingHorizontal={0}
      />

      <CustomText variant="subheader" fontSize={22} textAlign="center">
        Create Passcode
      </CustomText>
      <CustomText variant="body" fontSize={16} textAlign="center" mt="m">
        You will use this to unlock your app. This cannot be used to restore
        your wallet
      </CustomText>

      <PinInput
        onFillEnded={(otp) => handleNext()}
        autoFocus
        ref={ref}
        inputStyle={{
          width: 56,
          height: 70,
          backgroundColor: theme.colors.secondaryBackgroundColor,
          borderRadius: 8,
          borderWidth: 0,
          color: theme.colors.bodyTextColor,
          marginRight: 5,
        }}
        containerStyle={{
          marginVertical: 20,
        }}
        inputProps={{
          placeholderTextColor: theme.colors.bodyTextColor,
        }}
      />
    </Box>
  );
};

export default PinSetup;
