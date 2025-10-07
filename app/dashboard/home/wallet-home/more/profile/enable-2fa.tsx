import { ThemedCopyIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { SettingsModel } from "@/src/modules/settings/domain/entities/models/Settings-model";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import {
  selectSettingState,
  setSettings,
} from "@/src/modules/settings/presentation/state/settings-slice";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { setStringAsync } from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Switch } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const EnableTwoFA = () => {
  const [enabled, setEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState<string>("");
  const [secret, setSecret] = React.useState<string | null>(null);
  const [qrCode, setQrCode] = React.useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = React.useState(false);

  const userDetails = useSelector(selectUser);
  const { getSettings, generate2fa, verify2fa, disbale2fa } = useSettings();
  const settings = useSelector(selectSettingState);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!settings.settings) {
      (async function () {
        try {
          setLoading(true);
          const response = await getSettings({
            params: { user: userDetails as UserModel },
          });
          console.log(response.data);
          dispatch(setSettings(response.data as SettingsModel));
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      })();
    }
  }, []);

  const handleTrigger = async () => {
    try {
      const response = await generate2fa();
      setSecret(response.data.secret);
      setQrCode(response.data.secretQrCode);
      console.log(response);
      setEnabled(true);
    } catch (error) {}
  };

  const handleCopy = async () => {
    if (secret) {
      await setStringAsync(secret);
      alert("Code copied!");
    }
  };

  const handleEnable = async () => {
    try {
      setVerificationLoading(true);
      const response = await verify2fa({ body: { code } });
      console.log("RESPONSE AFTER VERIFICATION", response);
      dispatch(
        setSettings({
          ...(settings.settings as SettingsModel),
          twoFA: true,
        })
      );
      setVerificationLoading(false);
      setEnabled(false);
      setCode("");
    } catch (error) {
      setVerificationLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setVerificationLoading(true);
      const response = await disbale2fa({ body: { code } });
      console.log("RESPONSE AFTER VERIFICATION", response);
      dispatch(
        setSettings({
          ...(settings.settings as SettingsModel),
          twoFA: false,
        })
      );
      setVerificationLoading(false);
      setEnabled(false);
      setCode("");
    } catch (error) {
      setVerificationLoading(false);
    }
  };
  const theme = useTheme<Theme>();
  return (
    <PageWrapper>
      <SettingsHeader
        title="Two Factor Authentication"
        onBackPress={() => router.back()}
      />
      {!loading && (
        <Box paddingHorizontal="m" mt="m" flex={1}>
          {!settings.settings?.twoFA && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomText variant="medium" fontFamily="14">
                Enable 2FA
              </CustomText>
              <Switch
                value={settings.settings?.twoFA}
                onValueChange={handleTrigger}
              />
            </Box>
          )}

          {settings.settings?.twoFA && (
            <>
              <Box mb="l">
                <CustomText variant="subheader" fontFamily="14">
                  2FA Enabled
                </CustomText>
                <CustomText variant="body" fontFamily="14" mt="m">
                  You have 2fa enabled, to disable it, put the code from your
                  authenticator app
                </CustomText>
              </Box>
              <CustomInputWithoutForm
                value={code}
                onChange={(e) => setCode(e)}
                placeholder="authenticator code"
                placeholderTextColor={theme.colors.disabledTextColor}
              />
              <Box height={30} />
              <CustomButton
                text="Disable 2FA"
                disabled={code.length < 1}
                disabledColor={theme.colors.disabledTextColor}
                isLoading={verificationLoading}
                onPress={() => handleDisable()}
                width={"100%"}
                borderRadius={50}
              />
            </>
          )}

          {!settings.settings?.twoFA && (
            <CustomText variant="body" fontFamily="14" mt="m">
              Use a mobile authentication app to get an auth code to log in
              every time you sign in to Zap
            </CustomText>
          )}

          {enabled && (
            <Box mt="m" flex={1}>
              <Box flex={1}>
                <CustomText variant="body" fontFamily="14">
                  Scan the QR code below with the Authenticator app on your
                  phone. If you can’t scan, copy and paste the code
                </CustomText>
                <Box
                  width={"100%"}
                  justifyContent="center"
                  alignItems="center"
                  marginVertical="2xl"
                >
                  <Box
                    borderRadius={12}
                    overflow="hidden"
                    bg="white"
                    padding="s"
                  >
                    {/* <QRCode
                      value={secret as string}
                      size={200}
                      backgroundColor="white"
                      color="black"
                    /> */}
                    <Image
                      source={{ uri: qrCode as string }}
                      style={{ width: 200, height: 200 }}
                      contentFit="cover"
                    />
                  </Box>
                  <Box flexDirection="row" mt="l">
                    <CustomText
                      variant="body"
                      fontFamily="14"
                      onPress={handleCopy}
                    >
                      Click to copy
                    </CustomText>
                    <ThemedCopyIcon />
                  </Box>
                </Box>

                <CustomText>Enter the 6-digit code from the app</CustomText>
                <Box height={20} />
                <CustomInputWithoutForm
                  value={code}
                  onChange={(e) => setCode(e)}
                  placeholder="authenticator code"
                  placeholderTextColor={theme.colors.disabledTextColor}
                />
              </Box>
              <CustomButton
                text="Enable 2FA"
                disabled={code.length < 1}
                disabledColor={theme.colors.disabledTextColor}
                isLoading={verificationLoading}
                onPress={() => handleEnable()}
                width={"100%"}
                borderRadius={50}
              />
            </Box>
          )}
        </Box>
      )}
    </PageWrapper>
  );
};

export default EnableTwoFA;
