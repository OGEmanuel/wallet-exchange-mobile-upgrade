import { View, Text } from "react-native";
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
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import CustomButton from "@/components/general/CustomButton";
import { router } from "expo-router";

const WalletNamePage = () => {
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
  return (
    <Box flex={1} padding="m">
      <Box width="100%" height={50} justifyContent="center">
        <ChevronLeft
          size={30}
          color={theme.colors.bodyTextColor}
          onPress={handleBack}
        />
      </Box>
      <CustomText variant="subheader" fontSize={30}>
        Name your wallet
      </CustomText>
      <CustomText variant="body" mt="s">
        Choose a nice name for your wallet
      </CustomText>

      <CustomInputWithoutForm
        onChange={() => {}}
        value=""
        label=""
        placeholder="Wallet name"
        placeholderTextColor={theme.colors.bodyTextColor}
      />

      <Box height={150} />

      <CustomButton
        onPress={handleNext}
        text="Continue"
        bgColor={theme.colors.primaryColor}
        color={theme.colors.bodyTextColor}
        width={"100%"}
        height={56}
        borderRadius={56}
      />
    </Box>
  );
};

export default WalletNamePage;
