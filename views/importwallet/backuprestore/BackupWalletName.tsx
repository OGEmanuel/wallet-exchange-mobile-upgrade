import React from "react";
import Box from "@/components/general/Box";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import CustomText from "@/components/general/CustomText";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import CustomButton from "@/components/general/CustomButton";
import { resetCurrentPage } from "@/state/reducers/currentPage.reducer";
import { useDispatch } from "react-redux";

import { router } from "expo-router";

const BackupWalletName = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const [wallet, setWallet] = React.useState("");

  return (
    <Box flex={1} padding="m">
      <Box flexDirection="row" width="100%" height={100} alignItems="center">
        <ChevronLeft size={24} color={theme.colors.bodyTextColor} />
      </Box>
      <CustomText variant="medium" fontSize={20}>
        Name your wallet
      </CustomText>
      <CustomText variant="body" fontSize={14} mt="s">
        Choose a name for your crypto wallet
      </CustomText>

      <CustomInputWithoutForm
        label=""
        placeholder="Enter wallet name"
        value={wallet}
        placeholderTextColor={theme.colors.disabledTextColor}
        style={{
          color: theme.colors.bodyTextColor,
        }}
        onChange={(value) => setWallet(value as string)}
      />

      <Box height={40} />

      {
        <CustomButton
          disabled={wallet.length < 1}
          disabledColor={theme.colors.disabledTextColor}
          text="Continue"
          onPress={() => {
            router.push("/");
            dispatch(resetCurrentPage());
          }}
          width={"100%"}
          borderRadius={56}
          height={56}
          bgColor={theme.colors.primaryColor}
        />
      }
    </Box>
  );
};

export default BackupWalletName;
