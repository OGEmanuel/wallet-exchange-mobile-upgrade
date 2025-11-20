import ZapShieldLogo from "@/assets/svg/wallet-icons-components/ZapShieldLogo";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable } from "react-native";

interface BackupWalletPromptProps {
  walletGroupId: string;
  onDismiss?: () => void;
}

const BACKUP_PROMPT_DISMISSED_KEY = "backup_wallet_prompt_dismissed";

export const BackupWalletPrompt: React.FC<BackupWalletPromptProps> = ({
  walletGroupId,
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const handleBackupNow = () => {
    router.push(`/dashboard/manage-wallet/backup-wallet?walletGroupId=${walletGroupId}`);
  };

  const handleDismiss = async () => {
    setIsDismissed(true);
    
    if (doNotShowAgain) {
      // Store preference to never show again
      await SecureStore.setItemAsync(BACKUP_PROMPT_DISMISSED_KEY, "true");
    }
    
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Box
      marginHorizontal="m"
      marginBottom="m"
      borderRadius={20}
      overflow="hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={["#7055FF", "#8B5CF6", "#A855F7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          padding: 20, 
          paddingBottom: 16,
          position: "relative",
          minHeight: 200,
        }}
      >
        {/* Close Button - Top Right */}
        <Pressable
          onPress={handleDismiss}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            padding: 4,
          }}
        >
          <X size={20} color="white" />
        </Pressable>

        {/* Zapper Shield Logo in bottom right - larger, partially overlapping */}
        <Box
          position="absolute"
          bottom={-20}
          right={-20}
          width={100}
          height={100}
          alignItems="center"
          justifyContent="center"
        >
          <ZapShieldLogo width={100} height={100} />
        </Box>

        {/* Content - Left side with space for logo */}
        <Box 
          flex={1}
          style={{ marginRight: 80, paddingRight: 8 }}
        >
          {/* Title */}
          <CustomText
            variant="medium"
            fontSize={22}
            color="white"
            marginBottom="s"
            style={{ fontWeight: "600" }}
          >
            Backup Wallet
          </CustomText>

          {/* Description */}
          <CustomText
            variant="body"
            fontSize={14}
            style={{ color: "rgba(255, 255, 255, 0.95)", lineHeight: 20 }}
            marginBottom="m"
          >
            Back up your wallet and keep your funds safe
          </CustomText>

          {/* Back up Now Button - Full width, white with black text */}
          <Box marginBottom="m" width="100%">
            <CustomButton
              text="Back up Now"
              onPress={handleBackupNow}
              bgColor="white"
              color="black"
              borderRadius={30}
              height={44}
              borderWidth={0}
              width="100%"
            />
          </Box>

          {/* Do not show again checkbox - Bottom left */}
          <Pressable
            onPress={() => setDoNotShowAgain(!doNotShowAgain)}
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Box
              width={18}
              height={18}
              borderRadius={4}
              borderWidth={2}
              borderColor="white"
              alignItems="center"
              justifyContent="center"
              marginRight="s"
              style={{
                backgroundColor: doNotShowAgain
                  ? "white"
                  : "transparent",
              }}
            >
              {doNotShowAgain && (
                <CustomText
                  variant="medium"
                  fontSize={10}
                  color="primaryColor"
                  style={{ fontWeight: "bold" }}
                >
                  ✓
                </CustomText>
              )}
            </Box>
            <CustomText
              variant="body"
              fontSize={12}
              style={{ color: "rgba(255, 255, 255, 0.95)" }}
            >
              Do not show this again
            </CustomText>
          </Pressable>
        </Box>
      </LinearGradient>
    </Box>
  );
};

export async function shouldShowBackupPrompt(): Promise<boolean> {
  try {
    const dismissed = await SecureStore.getItemAsync(BACKUP_PROMPT_DISMISSED_KEY);
    return dismissed !== "true";
  } catch (error) {
    console.error("Error checking backup prompt preference:", error);
    return true; // Show by default if there's an error
  }
}

