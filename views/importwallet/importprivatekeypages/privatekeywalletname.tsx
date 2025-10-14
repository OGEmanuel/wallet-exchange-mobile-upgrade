import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import WalletImportSuccessful from "@/components/Modals/WalletImportSuccessfulModal";
import {
  resetCurrentPage,
  selectCurrentPage,
  selectKeyName,
  setCurrentPage,
  setKeyName,
} from "@/state/reducers/currentPage.reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const PrivateKeyWalletNamePage = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const currentStep = useSelector(selectCurrentPage);
  const [showModal, setShowModal] = React.useState(false);
  const keyName = useSelector(selectKeyName);
  const handleNext = () => {
    dispatch(resetCurrentPage());
    router.push("/setup");
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
      <WalletImportSuccessful
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onContinue={() => handleNext()}
      />
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
      <CustomText variant="body" mt="s" mb="m">
        Choose a nice name for your wallet
      </CustomText>

      <CustomInputWithoutForm
        onChange={(value) => dispatch(setKeyName(value))}
        value={keyName}
        label="Choose"
        placeholder="Wallet name"
        placeholderTextColor={theme.colors.bodyTextColor}
      />

      <Box height={150} />

      <CustomButton
        onPress={() => setShowModal(true)}
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

export default PrivateKeyWalletNamePage;
