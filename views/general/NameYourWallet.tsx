import React from "react";
import Box from "@/components/general/Box";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import CustomText from "@/components/general/CustomText";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import CustomButton from "@/components/general/CustomButton";
import { router } from "expo-router";
import { ChevronLeft, CircleQuestionMark } from "lucide-react-native";
import ImportWalletModal from "@/components/Modals/ImportWalletModal";
import OnboardingInformationModal from "@/components/Modals/onboardingInformationModal";
import AppBar from "@/components/general/AppBar";
import { NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  selectWalletName,
  setWalletName,
} from "@/state/reducers/currentPage.reducer";
interface IProps {
  onContinuePress: () => void;
  title?: string;
  showHelpIcon?: boolean;
  onBackPress?: () => void;
}

const NameYourWallet = ({
  onContinuePress,
  title = "",
  showHelpIcon = true,
  onBackPress,
}: IProps) => {
  const walletName = useSelector(selectWalletName);
  const dispatch = useDispatch();

  const [open, setIsOpen] = React.useState(false);
  const [showImportWalletModal, setShowImportWalletModal] =
    React.useState(false);
  const theme = useTheme<Theme>();
  return (
    <Box flex={1} backgroundColor="mainBackgroundColor" padding="m">
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
        height={60}
        paddingHorizontal={0}
        backgroundColor="transparent"
        leading={
          <ChevronLeft
            size={20}
            color={theme.colors.bodyTextColor}
            onPress={() => (onBackPress ? onBackPress() : router.back())}
          />
        }
        trailing={
          showHelpIcon && (
            <CircleQuestionMark
              size={20}
              color={theme.colors.bodyTextColor}
              onPress={() => setIsOpen(true)}
            />
          )
        }
      />
      <Box flex={1}>
        <CustomText variant="medium" fontSize={22} mb="l">
          Name your wallet
        </CustomText>
        <CustomInputWithoutForm
          label={title}
          onChange={(e) => {
            dispatch(setWalletName(e));
          }}
          value={walletName}
          placeholder="Wallet name"
          placeholderTextColor={theme.colors.bodyTextColor}
        />
        <Box height={50} />
        <CustomButton
          disabled={walletName.length < 1}
          disabledColor={theme.colors.borderColor}
          width={"100%"}
          height={56}
          borderRadius={56}
          text="Continue"
          onPress={() => onContinuePress()}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
        />
      </Box>
    </Box>
  );
};

export default NameYourWallet;
