import { ThemedEditIcon } from "@/assets/svg/wallet-icons-components";
import { CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Cloud, Shield, X } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView } from "react-native";

const BackupWalletScreen = () => {
  const theme = useTheme();
  const { walletGroupId } = useLocalSearchParams<{ walletGroupId: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleICloudBackup = () => {
    router.push(`/dashboard/manage-wallet/backup-wallet/icloud-password?walletGroupId=${walletGroupId}`);
  };

  const handleManualBackup = () => {
    // TODO: Navigate to manual backup flow
    console.log("Manual backup selected");
  };

  return (
    <LinearGradient
      colors={["#7055FF", "#000000"]}
      style={{ flex: 1 }}
      end={{ x: 0.5, y: 0.6 }}
    >
      <Box flex={1} paddingHorizontal="l" paddingVertical="s">
        {/* Header */}
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Box width="100%" height={100} justifyContent="center" marginTop="m">
            <X color="white" />
          </Box>
        </Pressable>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Shield Icon */}
          <Box
            width="100%"
            height={80}
            alignItems="center"
            justifyContent="center"
            marginBottom="l"
          >
            <Box
              width={120}
              height={120}
              borderRadius={60}
              style={{ backgroundColor: "rgba(47, 51, 61, 0.6)" }}
              alignItems="center"
              justifyContent="center"
            >
              <Shield size={60} color="white" />
            </Box>
          </Box>

          {/* Title */}
          <CustomText
            variant="medium"
            textAlign="center"
            fontSize={22}
            marginTop="l"
            color="white"
          >
            Back up your wallet
          </CustomText>

          {/* Description */}
          <CustomText
            variant="body"
            textAlign="center"
            marginTop="m"
            marginBottom="l"
            fontSize={14}
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            Securely back up your recovery/seed phrase to restore your wallet in
            case of device loss or damage.
          </CustomText>

          {/* Backup Options */}
          <Box width="100%" paddingBottom="l">
            {/* iCloud Backup Option */}
            <Box
              width="100%"
              height={100}
              borderWidth={1}
              style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
              borderRadius={20}
              marginBottom="l"
              paddingHorizontal="s"
            >
              <Pressable
                onPress={handleICloudBackup}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 8,
                  opacity: pressed ? 0.3 : 1,
                })}
              >
                <Box
                  width={40}
                  height={40}
                  overflow="hidden"
                  borderRadius={10}
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Cloud size={24} color="white" />
                </Box>
                <Box flex={1} marginLeft="m">
                  <CustomText variant="header" color="white" fontSize={16}>
                    iCloud Backup
                  </CustomText>
                  <CustomText
                    variant="body"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    fontSize={12}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Encrypt your Recovery Phrase with a password and your keys
                    to iCloud.
                  </CustomText>
                </Box>
                <Box
                  width={35}
                  height="100%"
                  justifyContent="center"
                  alignItems="flex-end"
                >
                  <CustomText variant="body" fontSize={16} color="white">
                    ›
                  </CustomText>
                </Box>
              </Pressable>
            </Box>

            {/* Manual Backup Option */}
            <Box
              width="100%"
              height={100}
              borderWidth={1}
              style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
              borderRadius={20}
              paddingHorizontal="s"
            >
              <Pressable
                onPress={handleManualBackup}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 8,
                  opacity: pressed ? 0.3 : 1,
                })}
              >
                <Box
                  width={40}
                  height={40}
                  overflow="hidden"
                  borderRadius={10}
                  alignItems="center"
                  justifyContent="center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <ThemedEditIcon />
                </Box>
                <Box flex={1} marginLeft="m">
                  <CustomText variant="header" color="white" fontSize={16}>
                    Manual Backup
                  </CustomText>
                  <CustomText
                    variant="body"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    fontSize={12}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Write down your Recovery Phrase and store in a safe
                    location.
                  </CustomText>
                </Box>
                <Box
                  width={35}
                  height="100%"
                  justifyContent="center"
                  alignItems="flex-end"
                >
                  <CustomText variant="body" fontSize={16} color="white">
                    ›
                  </CustomText>
                </Box>
              </Pressable>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </LinearGradient>
  );
};

export default BackupWalletScreen;
