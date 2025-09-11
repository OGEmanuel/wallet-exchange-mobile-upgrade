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
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import CustomButton from "@/components/general/CustomButton";
import { router } from "expo-router";
import CustomTextareaWithoutForm from "@/components/form/CustomTextarea";
import WhatIsSeedPhraseModal from "@/components/Modals/onboardingInformationModal";
import AppBar from "@/components/general/AppBar";
import CustomDropDown from "@/components/general/CustomDropDown";

const data = [
  { label: "1", value: "Bitcoin" },
  { label: "2", value: "Ethereum" },
  { label: "3", value: "BNB Smart Chain" },
  { label: "4", value: "Polygon" },
  { label: "5", value: "Avalanche" },
  { label: "6", value: "Solana" },
  { label: "7", value: "Cardano" },
  { label: "8", value: "Polkadot" },
  { label: "9", value: "Tron" },
  { label: "10", value: "Cosmos" },
];

const PrivateKeyPage = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentPage);

  const [showModal, setShowModal] = React.useState(false);
  const [privateKey, setPrivateKey] = React.useState("");
  const [keyName, setKeyName] = React.useState("");

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
  return (
    <Box flex={1} paddingHorizontal="m">
      <WhatIsSeedPhraseModal
        type="PrivateKey"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
      <AppBar
        paddingHorizontal={0}
        height={60}
        leading={
          <ChevronLeft
            size={20}
            color={theme.colors.bodyTextColor}
            onPress={handleBack}
          />
        }
        trailing={
          <CircleQuestionMark
            size={20}
            color={theme.colors.bodyTextColor}
            onPress={() => setShowModal(true)}
          />
        }
      />

      <CustomText variant="medium" fontSize={14}>
        Enter your private key
      </CustomText>
      <Box height={20} />

      <CustomDropDown
        data={data}
        placeholder="Select Chain"
        onChange={(value) => setKeyName(value as string)}
      />

      <Box height={0} />

      <CustomTextareaWithoutForm
        onChange={(value) => setPrivateKey(value as string)}
        value={privateKey}
        label=""
        placeholder="Enter your 64 character private key"
        placeholderTextColor={theme.colors.bodyTextColor}
      />
      <Box flexDirection="row" mt="m">
        <Copy size={20} color={theme.colors.bodyTextColor} />
        <CustomText variant="body" ml="m" fontSize={12}>
          Paste from clipboard
        </CustomText>
      </Box>

      <Box height={50} />

      <CustomButton
        disabled={privateKey.length < 64}
        disabledColor={theme.colors.disabledTextColor}
        onPress={handleNext}
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

export default PrivateKeyPage;
