import { ThemedCopyIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React from "react";
import { Switch } from "react-native";
import QRCode from "react-native-qrcode-svg";

const EnableTwoFA = () => {
  const [enabled, setEnabled] = React.useState(false);
  const theme = useTheme<Theme>();
  return (
    <PageWrapper>
      <SettingsHeader
        title="Two Factor Authentication"
        onBackPress={() => router.back()}
      />
      <Box paddingHorizontal="m" mt="m" flex={1}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <CustomText variant="medium" fontFamily="14">
            Enable 2FA
          </CustomText>
          <Switch value={enabled} onValueChange={setEnabled} />
        </Box>

        {!enabled && (
          <CustomText variant="body" fontFamily="14" mt="m">
            Use a mobile authentication app to get an auth code to log in every
            time you sign in to Zap
          </CustomText>
        )}

        {enabled && (
          <Box mt="m" flex={1}>
            <Box flex={1}>
              <CustomText variant="body" fontFamily="14">
                Scan the QR code below with the Authenticator app on your phone.
                If you can’t scan, copy and paste the code
              </CustomText>
              <Box
                width={"100%"}
                justifyContent="center"
                alignItems="center"
                marginVertical="2xl"
              >
                <Box borderRadius={12} overflow="hidden" bg="white" padding="s">
                  <QRCode
                    value="http://awesome.link.qr"
                    size={200}
                    backgroundColor="white"
                    color="black"
                  />
                </Box>
                <Box flexDirection="row" mt="l">
                  <CustomText variant="body" fontFamily="14">
                    Click to copy
                  </CustomText>
                  <ThemedCopyIcon />
                </Box>
              </Box>

              <CustomText>Enter the 6-digit code from the app</CustomText>
              <Box height={20} />
              <CustomInputWithoutForm
                value=""
                onChange={() => {}}
                placeholder="authenticator code"
                placeholderTextColor={theme.colors.disabledTextColor}
              />
            </Box>
            <CustomButton
              text="Enable 2FA"
              onPress={() => {}}
              width={"100%"}
              borderRadius={50}
            />
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
};

export default EnableTwoFA;
