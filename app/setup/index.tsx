import AppBottomSheet from "@/components/Modals/AppBottomSheet";
import ImportWalletModal from "@/components/Modals/ImportWalletModal";
import TermsAndConditions from "@/components/Modals/TermsAndConditions";
import OnboardingInformationModal from "@/components/Modals/onboardingInformationModal";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import ThemedText from "@/components/general/ThemedText";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronLeft, CircleQuestionMark } from "lucide-react-native";
import React, { useState } from "react";

const SetUp = () => {
  const [isTermsAndConditonsOpen, setIsTermsAndConditonsOpen] = useState(false);
  const [open, setIsOpen] = React.useState(false);
  const [showImportWalletModal, setShowImportWalletModal] =
    React.useState(false);
  const [walletName, setWalletName] = React.useState("");
  const theme = useTheme<Theme>();
  return (
    <Box
      flex={1}
      backgroundColor="mainBackgroundColor"
      paddingHorizontal="m"
      paddingTop="2xl"
    >
      <OnboardingInformationModal
        type="Wallet"
        isOpen={open}
        onClose={() => setIsOpen(false)}
      />
      <ImportWalletModal
        isOpen={showImportWalletModal}
        onClose={() => setShowImportWalletModal(false)}
      />
      <AppBar
        leading={
          <ChevronLeft
            size={25}
            color={theme.colors.bodyTextColor}
            onPress={() => router.back()}
          />
        }
        trailing={
          <CircleQuestionMark
            size={20}
            color={theme.colors.bodyTextColor}
            onPress={() => setIsOpen(true)}
          />
        }
        paddingHorizontal={0}
        height={70}
      />

      <Box flex={1}>
        <ThemedText
          type="subtitle"
          color={theme.colors.bodyTextColor}
          style={{ fontSize: 22, marginBottom: 12 }}
        >
          Name your wallet
        </ThemedText>
        <ThemedText
          type="default"
          color={theme.colors.bodyTextColor}
          style={{ marginBottom: 32 }}
        >
          Choose a nice name for your wallet
        </ThemedText>

        <CustomInputWithoutForm
          label=""
          onChange={(e) => setWalletName(e as string)}
          value={walletName}
          placeholder="Wallet name"
          placeholderTextColor={theme.colors.bodyTextColor}
        />
        <Box height={50} />
        <CustomButton
          disabled={walletName?.length === 0}
          disabledColor={theme.colors.disabledTextColor}
          width={"100%"}
          // height={56}
          borderRadius={56}
          text="Continue"
          onPress={() => {
            setIsTermsAndConditonsOpen(true);
          }}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
        />
      </Box>
      <Box width={"100%"} height={150} justifyContent="center">
        <CustomButton
          width={"100%"}
          // height={56}
          borderRadius={56}
          text="Import existing wallet"
          onPress={() => setShowImportWalletModal(true)}
          borderWidth={2}
          bgColor="transparent"
          borderColor={theme.colors.borderColor}
          color={theme.colors.bodyTextColor}
        />
      </Box>

      <AppBottomSheet
        isVisible={isTermsAndConditonsOpen}
        onClose={() => setIsTermsAndConditonsOpen(false)}
        maxHeight={SCREEN_HEIGHT * 0.8}
      >
        <TermsAndConditions
          onAccept={() => {
            router.push("/setup/wallet-setup/pinsetup");
            setIsTermsAndConditonsOpen(false);
          }}
        />
      </AppBottomSheet>
    </Box>
  );
};

export default SetUp;
