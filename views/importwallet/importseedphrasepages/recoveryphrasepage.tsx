import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentPage,
  setCurrentPage,
} from "@/state/reducers/currentPage.reducer";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { ChevronLeft, CircleQuestionMark, Copy } from "lucide-react-native";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import CustomButton from "@/components/general/CustomButton";
import { router } from "expo-router";
import CustomTextareaWithoutForm from "@/components/form/CustomTextarea";
import WhatIsSeedPhraseModal from "@/components/Modals/onboardingInformationModal";
import AppBar from "@/components/general/AppBar";

const RecoveryPhrasePage = () => {
  // states
  const [showWhatIsASeedPhreasModal, setShowImportWalletModal] =
    React.useState(false);
  const [seedPhrase, setSeedPhrase] = React.useState("");

  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentPage);

  const handleNext = () => {
    dispatch(setCurrentPage(2));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
    }
    dispatch(setCurrentPage(1));
  };

  const handleDisabled = () => {
    const length = seedPhrase.split(" ").length;
    return length !== 12;
  };
  return (
    <Box flex={1} paddingHorizontal="m">
      <WhatIsSeedPhraseModal
        type="SeedPhrase"
        isOpen={showWhatIsASeedPhreasModal}
        onClose={() => setShowImportWalletModal(false)}
      />

      <AppBar
        paddingHorizontal={0}
        title="Recovery Phrase"
        leading={
          <ChevronLeft
            size={24}
            color={theme.colors.bodyTextColor}
            onPress={handleBack}
          />
        }
        trailing={
          <CircleQuestionMark
            size={24}
            color={theme.colors.bodyTextColor}
            onPress={() => setShowImportWalletModal(true)}
          />
        }
      />

      <CustomText variant="subheader" fontSize={22}>
        Enter your recovery phrase
      </CustomText>

      <CustomTextareaWithoutForm
        onChange={(e) => setSeedPhrase(e as string)}
        value={seedPhrase}
        label=""
        placeholder="Use spaces between the words if you’re using recovery phrase"
        placeholderTextColor={theme.colors.bodyTextColor}
      />
      <Box flexDirection="row" mt="m">
        <Copy size={20} color={theme.colors.bodyTextColor} />
        <CustomText variant="body" ml="m" fontSize={12}>
          Paste from clipboard
        </CustomText>
      </Box>

      <Box height={150} />

      <CustomButton
        disabled={handleDisabled()}
        disabledColor={theme.colors.disabledTextColor}
        onPress={() => handleNext()}
        text="Import"
        bgColor={theme.colors.primaryColor}
        color={theme.colors.bodyTextColor}
        width={"100%"}
        height={56}
        borderRadius={56}
      />
    </Box>
  );
};

export default RecoveryPhrasePage;
