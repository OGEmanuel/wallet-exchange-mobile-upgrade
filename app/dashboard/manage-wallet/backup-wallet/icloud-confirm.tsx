import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import { WALLET_GROUP_CLASS } from "@/configs/constants";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { createWalletGroupBackup } from "@/src/core/utils/backup-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { useTheme } from "@shopify/restyle";
import { router, useLocalSearchParams } from "expo-router";
import { Check, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICloudConfirmScreen = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { originalPassword, walletGroupId } = useLocalSearchParams<{
    originalPassword: string;
    walletGroupId: string;
  }>();
  const { userWalletGroups, refreshPortfolio, getAddress } = useWallet();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Compare with the original password from the previous screen
    const decodedOriginalPassword = originalPassword
      ? decodeURIComponent(originalPassword)
      : "";
    setIsPasswordMatch(text === decodedOriginalPassword && text.length > 0);
  };

  const handleCompleteBackup = async () => {
    if (!isPasswordMatch || isBackingUp) return;

    try {
      setIsBackingUp(true);

      // Find any wallet that belongs to this wallet group
      const walletInGroup = userWalletGroups.find(
        (wallet) => wallet.walletGroupId?._id === walletGroupId
      );
      if (!walletInGroup) {
        Alert.alert("Error", "Wallet group not found");
        return;
      }

      // Get wallets in this group
      const walletsInGroup = userWalletGroups.filter(
        (wallet) => wallet.walletGroupId?._id === walletGroupId
      );

      // Get wallet credentials
      const walletCredentials =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          walletGroupId
        );
      const address = await getAddress(
        walletCredentials?.chain || "",
        walletsInGroup[0]?._id
      );

      // Prepare wallet data for backup
      const walletData = walletsInGroup.map((wallet) => ({
        id: wallet._id,
        name:
          wallet.name || `Wallet ${wallet.walletId?.slice(0, 6) || "Unknown"}`,
        address: address || "Unknown",
        chain: walletCredentials?.chain || "Unknown",
        seedPhrase:
          walletCredentials?.class === WALLET_GROUP_CLASS.SEEDPHRASE
            ? walletCredentials?.credential
            : undefined,
        privateKey:
          walletCredentials?.class === WALLET_GROUP_CLASS.PRIVATE_KEY
            ? walletCredentials?.credential
            : undefined,
      }));

      // Create the backup
      const success = await createWalletGroupBackup(
        walletGroupId,
        walletInGroup.walletGroupId.name,
        walletData,
        password
      );

      if (success) {
        // Refresh portfolio to update backup status
        await refreshPortfolio(walletInGroup._id, true);

        // Navigate to success screen
        console.log(
          "🔍 iCloud Confirm - Navigating to backup complete with walletGroupId:",
          walletGroupId
        );
        router.push(
          `/dashboard/manage-wallet/backup-wallet/backup-complete?walletGroupId=${walletGroupId}`
        );
      } else {
        Alert.alert("Error", "Failed to create backup. Please try again.");
      }
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert("Error", "Failed to create backup. Please try again.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <Box style={{ paddingTop: insets.top , paddingBottom: 20}}>
        <SettingsHeader
          title="iCloud Backup"
          onBackPress={handleBack}
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
            Confirm password
          </CustomText>

          {/* Description */}
          <CustomText
            variant="body"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
            marginBottom="xl"
            lineHeight={24}
          >
            Re-enter your password to complete your iCloud backup.
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

            {/* Password Match Indicator */}
            {password.length > 0 && (
              <Box
                flexDirection="row"
                alignItems="center"
                marginTop="m"
                marginBottom="l"
              >
                <Box
                  width={16}
                  height={16}
                  borderRadius={8}
                  style={{
                    backgroundColor: isPasswordMatch ? "#00ff88" : "#ff4444",
                  }}
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s"
                >
                  <Check size={12} color="white" />
                </Box>
                <CustomText
                  variant="body"
                  fontSize={14}
                  style={{ color: isPasswordMatch ? "#00ff88" : "#ff4444" }}
                >
                  {isPasswordMatch ? "Password Match" : "Password Mismatch"}
                </CustomText>
              </Box>
            )}
          </Box>
        </ScrollView>

        {/* Complete Backup Button */}
        <Box paddingHorizontal="l" paddingBottom="xl">
          <CustomButton
            bgColor={
              isPasswordMatch
                ? theme.colors.primaryColor
                : "rgba(255, 255, 255, 0.2)"
            }
            text={isBackingUp ? "Creating Backup..." : "Complete Back up"}
            onPress={handleCompleteBackup}
            width="100%"
            borderRadius={30}
            paddingVertical={16}
            disabled={!isPasswordMatch || isBackingUp}
          />
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
};

export default ICloudConfirmScreen;
