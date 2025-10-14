import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { iCloudBackupService, WalletGroupBackup } from "@/src/core/storage/icloud-backup.service";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Pressable, TouchableWithoutFeedback } from "react-native";

interface WalletRestoreStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletRestoreStep: React.FC<WalletRestoreStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const [password, setPassword] = useState(walletData.password || "");
  const [focused, setFocused] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const fadeInAnimation = useRef(new Animated.Value(0)).current;

  const handleContinue = async () => {
    Keyboard.dismiss();
    
    if (!password.trim()) {
      setVerificationError("Please enter your backup password");
      return;
    }

    const selectedGroup = walletData.selectedWalletGroup as WalletGroupBackup;
    if (!selectedGroup) {
      setVerificationError("No wallet group selected");
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationError("");

      console.log('🔐 Verifying backup password...');
      
      // Verify password and restore wallet group
      const restoredGroup = await iCloudBackupService.restoreWalletGroup(
        selectedGroup.id,
        password
      );

      if (!restoredGroup) {
        setVerificationError("Invalid password or backup not found");
        return;
      }

      console.log('✅ Wallet group restored successfully');
      
      // Update wallet data with restored information
      onUpdateData({ 
        password,
        selectedWalletGroup: restoredGroup,
        // Store the restored wallet data for SDK integration
        restoredWallets: restoredGroup.wallets
      });
      
      onContinue();
    } catch (error) {
      console.error('❌ Failed to restore wallet group:', error);
      setVerificationError("Failed to restore wallet group. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const isValidPassword = password.trim().length > 0;

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeInAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeInAnimation]);

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor" paddingTop="xl">
      <AppBar
        leading={
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 20,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <ChevronLeft size={24} color={theme.colors.bodyTextColor} />
          </Pressable>
        }
        paddingHorizontal={10}
        fontSize={18}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={{ flex: 1, opacity: fadeInAnimation }}>
          <Box flex={1} paddingHorizontal="l">
            <CustomText variant="medium" fontSize={22} mb="m" color="white">
              Restore your wallet
            </CustomText>

            <CustomText variant="body" fontSize={14} mb="2xl" color="white">
              Enter your password to restore {walletData.selectedWalletGroup?.name || 'your wallet'} from iCloud.
            </CustomText>

          {/* Password Input */}
          <CustomInputWithoutForm
            onChange={(value) => setPassword(value.toString())}
            value={password}
            label=""
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.placeholderTextColor}
            isPassword={true}
            focusable
            style={{
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              fontWeight: "300",
              color: theme.colors.white,
              borderColor: focused ? theme.colors.primaryColor : theme.colors.borderColor,
              borderWidth: focused ? 1 : 0,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {/* Error Display */}
          {verificationError && (
            <Box
              backgroundColor="error"
              borderRadius={8}
              padding="s"
              mt="s"
              borderWidth={1}
              borderColor="error"
            >
              <CustomText variant="body" fontSize={12} color="white">
                ⚠️ {verificationError}
              </CustomText>
            </Box>
          )}

          <Box flex={1} />

          <Box paddingBottom="xl" paddingTop="l">
            <CustomButton
              disabled={!isValidPassword || isVerifying}
              disabledColor={theme.colors.disabledTextColor}
              width="100%"
              text={isVerifying ? "Verifying..." : "Restore wallet"}
              onPress={handleContinue}
              bgColor={theme.colors.primaryColor}
              color={theme.colors.white}
              borderRadius={56}
              isLoading={isVerifying || isLoading}
            />
          </Box>
          </Box>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Box>
  );
};
