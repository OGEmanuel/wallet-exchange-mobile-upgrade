import CustomTextareaWithoutForm from "@/components/form/CustomTextarea";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import WhatIsSeedPhraseModal from "@/components/Modals/WhatIsSeedPhraseModal";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { ChevronLeft, CircleQuestionMark, Copy } from "lucide-react-native";
import React, { useState } from "react";
import { Keyboard, Pressable, TouchableWithoutFeedback } from "react-native";

interface WalletSeedPhraseStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletSeedPhraseStep: React.FC<WalletSeedPhraseStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const [seedPhrase, setSeedPhrase] = useState(walletData.seedPhrase || "");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [focused, setFocused] = useState(false);
  const handleContinue = () => {
    Keyboard.dismiss();
    onUpdateData({ seedPhrase });
    onContinue();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        setSeedPhrase(clipboardText);
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const isValidSeedPhrase = seedPhrase.trim().split(" ").length >= 12;

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
            <ChevronLeft
              size={24}
              color={theme.colors.bodyTextColor}
            />
          </Pressable>
        }
        trailing={
          <Pressable
            onPress={() => setShowHelpModal(true)}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 20,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <CircleQuestionMark
              size={20}
              color={theme.colors.bodyTextColor}
            />
          </Pressable>
        }
        paddingHorizontal={10}
        fontSize={18}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box flex={1} paddingHorizontal="l">
          <CustomText variant="medium" fontSize={22} mb="l" color="white">
            Enter your seed phrase
          </CustomText>

        <CustomTextareaWithoutForm
          onChange={(value) => setSeedPhrase(value.toString())}
          label=""
          value={seedPhrase}
          placeholder="Use spaces between the words"
          placeholderTextColor={theme.colors.placeholderTextColor}
          focusable
          multiline
          numberOfLines={6}
          style={{
            backgroundColor: theme.colors.secondaryBackgroundColor,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            fontWeight: '300',
            color: theme.colors.white,
            minHeight: 120,
            borderColor: focused ? theme.colors.primaryColor : theme.colors.borderColor,
            borderWidth: focused ? 1 : 0,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        <Pressable
          onPress={handlePasteFromClipboard}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing["2xl"],
            opacity: pressed ? 0.3 : 1,
          })}
        >
          <Copy size={16} color={theme.colors.white} />
          <CustomText variant="body" ml="s" fontSize={14} color="white">
            Paste from Clipboard
          </CustomText>
        </Pressable>

        <CustomButton
          disabled={!isValidSeedPhrase}
          disabledColor={theme.colors.disabledTextColor}
          width="100%"
          text="Import"
          onPress={handleContinue}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          borderRadius={56}
          isLoading={isLoading}
        />
        </Box>
      </TouchableWithoutFeedback>

      <WhatIsSeedPhraseModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </Box>
  );
};
