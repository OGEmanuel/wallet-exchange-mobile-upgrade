import { ThemedScanIcon } from "@/assets/svg/wallet-icons-components";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  AppBar,
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React from "react";

const Addresses = () => {
  const theme = useTheme<Theme>();
  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor" paddingHorizontal="m">
        <AppBar
          paddingHorizontal={0}
          height={20}
          title={<CustomText variant="bodySubheader">Add Address</CustomText>}
          leading={<ChevronLeft size={25} color={theme.colors.bodyTextColor} />}
        />
        <Box height={40} />
        <Box flex={1}>
          <CustomInputWithoutForm
            placeholder="Choose Name"
            value=""
            onChange={() => {}}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
          />
          <CustomInputWithoutForm
            placeholder="Select chain"
            value=""
            onChange={() => {}}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
            iconRight={<ChevronDown color={theme.colors.bodyTextColor} />}
          />
          <CustomInputWithoutForm
            placeholder="Enter address, domain or identity"
            value=""
            onChange={() => {}}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
            iconRight={<CustomText>Paste</CustomText>}
          />
          <Box
            flexDirection="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <ThemedScanIcon
              darkModeColor={theme.colors.tabBarActiveColor}
              lightModeColor={theme.colors.tabBarActiveColor}
            />
            <CustomText color="tabBarActiveColor" ml="s" fontSize={12}>
              Scan QR Code
            </CustomText>
          </Box>
        </Box>
        <CustomButton
          width={"100%"}
          borderRadius={50}
          text="Add address"
          onPress={() => {}}
        />
      </Box>
    </PageWrapper>
  );
};

export default Addresses;
