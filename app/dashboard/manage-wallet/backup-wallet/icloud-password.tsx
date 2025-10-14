import { AppBar, CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import { useTheme } from "@shopify/restyle";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { Check, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICloudPasswordScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { walletGroupId } = useLocalSearchParams<{ walletGroupId: string }>();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleBack = () => {
    router.back();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Calculate password strength
    let strength = 0;
    if (text.length >= 12) strength += 1;
    if (/\d/.test(text)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(text)) strength += 1;
    if (/[A-Z]/.test(text) && /[a-z]/.test(text)) strength += 1;
    setPasswordStrength(strength);
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength === 3) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "#ff4444";
    if (passwordStrength === 3) return "#ffaa00";
    return "#00ff88";
  };

  const handleContinue = () => {
    if (password.length >= 12) {
      router.push(`/dashboard/manage-wallet/backup-wallet/icloud-confirm?originalPassword=${encodeURIComponent(password)}&walletGroupId=${walletGroupId}`);
    }
  };

  const isPasswordValid = password.length >= 12;

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top }}>
        <AppBar
          title="iCloud Backup"
          leading={
            <ArrowLeft2
              onPress={handleBack}
              size={24}
              color={theme.colors.headerTextColor}
            />
          }
        />
      </Box>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <CustomText
            variant="header"
            fontSize={20}
            color="white"
            marginBottom="m"
          >
            Create password
          </CustomText>

          {/* Description */}
          <CustomText
            variant="body"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
            marginBottom="xl"
            lineHeight={24}
          >
            This password will secure your secret recovery phrase in the cloud.
            {" We can't recover it if you lose it, so keep it very safe."}
          </CustomText>

          {/* Password Input */}
          <Box marginBottom="l">
            <Box
              style={{ backgroundColor: "rgba(47, 51, 61, 0.6)" }}
              borderRadius={12}
              flexDirection="row"
              alignItems="center"
              paddingHorizontal="m"
              paddingVertical="s"
            >
              <TextInput
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Enter Password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "white",
                  paddingVertical: 12,
                }}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  padding: 8,
                })}
              >
                {showPassword ? (
                  <EyeOff size={20} color="rgba(255, 255, 255, 0.7)" />
                ) : (
                  <Eye size={20} color="rgba(255, 255, 255, 0.7)" />
                )}
              </Pressable>
            </Box>

            {/* Password Strength */}
            <Box marginTop="m" marginBottom="l" width="100%">
              <Box
                mb="m"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <CustomText variant="body" fontSize={14} color="white">
                  Password Strength
                </CustomText>
                <CustomText
                  variant="body"
                  fontSize={14}
                  style={{ color: getStrengthColor() }}
                >
                  {getStrengthText()}
                </CustomText>
              </Box>
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                marginBottom="s"
                width="100%"
              >
                <Box
                  width="31%"
                  height={4}
                  style={{
                    backgroundColor:
                      passwordStrength >= 1
                        ? getStrengthColor()
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  borderRadius={2}
                  marginRight="s"
                />
                <Box
                  width="31%"
                  height={4}
                  style={{
                    backgroundColor:
                      passwordStrength >= 2
                        ? getStrengthColor()
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  borderRadius={2}
                  marginRight="s"
                />
                <Box
                  width="31%"
                  height={4}
                  style={{
                    backgroundColor:
                      passwordStrength >= 3
                        ? getStrengthColor()
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  borderRadius={2}
                  marginRight="m"
                />
              </Box>
            </Box>

            {/* Password Requirements */}
            <Box gap="s">
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={16}
                  height={16}
                  borderRadius={8}
                  style={{
                    backgroundColor:
                      password.length >= 12
                        ? "#00ff88"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s"
                >
                  <Check color="white" size={12} />
                </Box>
                <CustomText variant="body" fontSize={14} color="white">
                  Min. 12 characters
                </CustomText>
              </Box>

              <Box flexDirection="row" alignItems="center">
                <Box
                  width={16}
                  height={16}
                  borderRadius={8}
                  style={{
                    backgroundColor: /\d/.test(password)
                      ? "#00ff88"
                      : "rgba(255, 255, 255, 0.3)",
                  }}
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s"
                >
                  <Check color="white" size={12} />
                </Box>
                <CustomText variant="body" fontSize={14} color="white">
                  Numbers
                </CustomText>
              </Box>

              <Box flexDirection="row" alignItems="center">
                <Box
                  width={16}
                  height={16}
                  borderRadius={8}
                  style={{
                    backgroundColor: /[!@#$%^&*(),.?":{}|<>]/.test(password)
                      ? "#00ff88"
                      : "rgba(255, 255, 255, 0.3)",
                  }}
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s"
                >
                  <Check color="white" size={12} />
                </Box>
                <CustomText variant="body" fontSize={14} color="white">
                  Symbols
                </CustomText>
              </Box>

              <Box flexDirection="row" alignItems="center">
                <Box
                  width={16}
                  height={16}
                  borderRadius={8}
                  style={{
                    backgroundColor:
                      /[A-Z]/.test(password) && /[a-z]/.test(password)
                        ? "#00ff88"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s"
                >
                  <Check color="white" size={12} />
                </Box>
                <CustomText variant="body" fontSize={14} color="white">
                  Mixed Case Letters
                </CustomText>
              </Box>
            </Box>
          </Box>
        </ScrollView>

        {/* Continue Button */}
        <Box paddingHorizontal="l" paddingBottom="xl">
          <CustomButton
            bgColor={
              isPasswordValid
                ? theme.colors.primaryColor
                : "rgba(255, 255, 255, 0.2)"
            }
            text="Confirm Password"
            onPress={handleContinue}
            width="100%"
            borderRadius={30}
            paddingVertical={16}
            disabled={!isPasswordValid}
          />
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
};

export default ICloudPasswordScreen;
