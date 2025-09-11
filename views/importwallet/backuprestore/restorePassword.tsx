import React, { useRef } from "react";
import Box from "@/components/general/Box";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import CustomText from "@/components/general/CustomText";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import CustomButton from "@/components/general/CustomButton";
import { setCurrentPage } from "@/state/reducers/currentPage.reducer";
import { useDispatch } from "react-redux";
import BottomSheet from "@gorhom/bottom-sheet";

const RestorePassword = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const [wallet, setWallet] = React.useState("");

  return (
    <Box flex={1} padding="m">
      <Box flexDirection="row" width="100%" height={100} alignItems="center">
        <ChevronLeft
          size={24}
          color={theme.colors.bodyTextColor}
          onPress={() => dispatch(setCurrentPage(1))}
        />
      </Box>
      <CustomText variant="medium" fontSize={20}>
        Restore your wallet
      </CustomText>
      <CustomText variant="body" fontSize={14} mt="s" mb="s">
        Enter your password to restore your wallet from iCloud.
      </CustomText>

      <CustomInputWithoutForm
        label=""
        placeholder="Enter password"
        value={wallet}
        placeholderTextColor={theme.colors.disabledTextColor}
        style={{
          color: theme.colors.bodyTextColor,
        }}
        onChange={(value) => setWallet(value as string)}
        isPassword
      />

      <Box height={40} />

      <CustomButton
        disabled={wallet?.length < 8}
        disabledColor={theme.colors.disabledTextColor}
        text="Restore wallet"
        onPress={() => {
          dispatch(setCurrentPage(3));
        }}
        width={"100%"}
        borderRadius={56}
        height={56}
        bgColor={theme.colors.primaryColor}
      />
    </Box>
  );
};

export default RestorePassword;
