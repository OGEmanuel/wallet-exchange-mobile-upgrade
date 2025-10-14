import ThemedChecktrueIcon from "@/assets/svg/wallet-icons-components/ThemedChecktrueIcon";
import { CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";

const BackupCompleteScreen = () => {
  const theme = useTheme();
  const { walletGroupId } = useLocalSearchParams<{ walletGroupId: string }>();

  console.log("🔍 Backup Complete - Received walletGroupId:", walletGroupId);

  const handleContinue = () => {
    console.log("🔍 Backup Complete - Navigating to wallet home screen");
    // Navigate to wallet home screen after successful backup
    router.push("/dashboard/home/wallet-home/home");
  };

  return (
    <LinearGradient
      colors={["#7055FF", "#000000"]}
      style={{ flex: 1 }}
      end={{ x: 0, y: 1 }}
    >
      <Box flex={1}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 60,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon */}
          <Box
            alignItems="center"
            justifyContent="center"
            marginBottom="xl"
          >
            <ThemedChecktrueIcon 
              width={120} 
              height={120}
              lightModeColor="#00ff88"
              darkModeColor="#00ff88"
            />
          </Box>

          {/* Title */}
          <CustomText
            variant="bodyBold"
            color="white"
            textAlign="center"
            marginBottom="m"
            fontSize={24}
          >
            Backup completed
          </CustomText>

          {/* Description */}
          <CustomText
            variant="body"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
            textAlign="center"
            marginBottom="xl"
            lineHeight={24}
          >
            You can start enjoying your wallet.
          </CustomText>
        </ScrollView>

        {/* Continue Button */}
        <Box paddingHorizontal="l" paddingBottom="xl">
          <CustomButton
            bgColor={theme.colors.primaryColor}
            text="Continue"
            onPress={handleContinue}
            width="100%"
            borderRadius={30}
            paddingVertical={16}
          />
        </Box>
      </Box>
    </LinearGradient>
  );
};

export default BackupCompleteScreen;
