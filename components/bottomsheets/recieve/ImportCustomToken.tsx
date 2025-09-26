import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomButton, CustomText } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { setStage } from "@/state/reducers/recievePage.reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { X } from "lucide-react-native";
import React from "react";
import { useDispatch } from "react-redux";

const ImportCustomToken = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { recieveActivityRef } = useBottomSheetRefs();
  return (
    <Box flex={1}>
      <Box width="100%">
        <X
          size={20}
          color={theme.colors.bodyTextColor}
          onPress={() => {
            dispatch(setStage("token"));
            recieveActivityRef.current?.close();
          }}
        />
      </Box>
      <CustomText
        textAlign="center"
        mt="m"
        variant="bodySubheader"
        fontSize={18}
      >
        Import custom token
      </CustomText>

      <Box flex={0.9} alignItems="center" pt="2xl">
        <CustomInputWithoutForm
          value=""
          onChange={() => {}}
          iconRight={<CustomText>Paste</CustomText>}
          boxStyle={{ borderWidth: 0 }}
          placeholder="Token contract address"
          placeholderTextColor={theme.colors.disabledTextColor}
        />
        <Box height={20} />
        <CustomInputWithoutForm
          value=""
          onChange={() => {}}
          boxStyle={{ borderWidth: 0 }}
          placeholder="Token symbol"
          placeholderTextColor={theme.colors.disabledTextColor}
        />
        <Box height={20} />
        <CustomInputWithoutForm
          value=""
          onChange={() => {}}
          boxStyle={{ borderWidth: 0 }}
          placeholder="Token decimal"
          placeholderTextColor={theme.colors.disabledTextColor}
        />
      </Box>
      <CustomButton
        width={"100%"}
        borderRadius={50}
        text="Continue"
        onPress={() => {}}
      />
    </Box>
  );
};

export default ImportCustomToken;
