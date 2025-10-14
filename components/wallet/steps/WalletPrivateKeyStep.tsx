import SelectChainBottomSheet from "@/components/bottomsheets/SelectChainBottomSheet";
import CustomTextareaWithoutForm from "@/components/form/CustomTextarea";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import ChainLogo from "@/components/general/ChainLogo";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import WhatIsPrivateKeyModal from "@/components/Modals/WhatIsPrivateKeyModal";
import { useChains } from "@/src/core/chains/chains-context";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import {
  ChevronDown,
  ChevronLeft,
  CircleQuestionMark,
  Copy,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Pressable, TouchableWithoutFeedback } from "react-native";

// Chain options will be loaded dynamically from SDK

interface WalletPrivateKeyStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletPrivateKeyStep: React.FC<WalletPrivateKeyStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const {
    walletChains,
    isLoading: loadingChains,
    getChainBySymbol,
  } = useChains();
  const [privateKey, setPrivateKey] = useState(walletData.privateKey || "");
  const [selectedChain, setSelectedChain] = useState(walletData.chain || "SOL");
  const chainBottomSheetRef = useRef<any>(null);
  const [focused, setFocused] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const errorAnimation = useRef(new Animated.Value(0)).current;

  // Animation functions
  const showError = () => {
    Animated.timing(errorAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideError = () => {
    Animated.timing(errorAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Set default chain when walletChains are loaded
  useEffect(() => {
    if (!selectedChain && walletChains.length > 0) {
      setSelectedChain(walletChains[0].symbol);
    }
  }, [walletChains, selectedChain]);

  // Validate private key
  const validatePrivateKey = async (key: string, chain: string) => {
    if (!key.trim()) {
      setValidationError("");
      hideError();
      return true;
    }

    setIsValidating(true);
    setValidationError("");

    try {
      const result = await zapSDKService.validatePrivateKey(key, chain);
      if (!result.isValid) {
        setValidationError(result.error || "Invalid private key");
        showError();
        return false;
      }
      setValidationError("");
      hideError();
      return true;
    } catch (error: any) {
      console.error("Validation error:", error);
      
      // Handle specific SDK validation errors
      let errorMessage = "Failed to validate private key";
      if (error?.error?.code === "VALIDATION_ERROR") {
        errorMessage = error.error.message || "Invalid private key format";
      } else if (error?.status === 400) {
        errorMessage = "Invalid private key format";
      } else if (error?.message?.includes("Invalid Ethereum private key")) {
        errorMessage = "Invalid Ethereum private key";
      } else if (error?.message?.includes("Invalid")) {
        errorMessage = error.message;
      }
      
      setValidationError(errorMessage);
      showError();
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = async () => {
    Keyboard.dismiss();

    // Validate private key before continuing
    const isValid = await validatePrivateKey(privateKey, selectedChain);
    if (!isValid) {
      return;
    }

    onUpdateData({ privateKey, chain: selectedChain });
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
        setPrivateKey(clipboardText);
        // Clear validation error when pasting
        if (validationError) {
          setValidationError("");
        }
        // Trigger immediate validation for pasted content
        validatePrivateKey(clipboardText, selectedChain);
      }
    } catch (error) {
      console.error("Failed to get clipboard content:", error);
    }
  };

  // Real-time validation with debounce
  useEffect(() => {
    if (privateKey.trim() && selectedChain) {
      const timeoutId = setTimeout(() => {
        validatePrivateKey(privateKey, selectedChain);
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [privateKey, selectedChain]);

  const getChainLabel = (chainValue: string) => {
    const chain = getChainBySymbol(chainValue);
    return chain ? chain.name : "Select Chain";
  };

  const handleChainSelect = (chain: string) => {
    setSelectedChain(chain);
    chainBottomSheetRef.current?.close();
  };

  const isValidPrivateKey = privateKey.trim().length >= 64 && !validationError;
  const isFormValid = isValidPrivateKey && selectedChain && !isValidating;

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
        trailing={
          <Pressable
            onPress={() => setShowHelpModal(true)}
            style={({ pressed }) => ({
              padding: 8,
              borderRadius: 20,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <CircleQuestionMark size={20} color={theme.colors.bodyTextColor} />
          </Pressable>
        }
        paddingHorizontal={10}
        fontSize={18}
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box flex={1} paddingHorizontal="l">
          <CustomText variant="medium" fontSize={22} mb="l" color="white">
            Enter your private key
          </CustomText>

          {/* Chain Selection Button */}
          <Pressable
            onPress={() =>
              !loadingChains && chainBottomSheetRef.current?.snapToIndex(0)
            }
            style={({ pressed }) => ({
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.spacing.l,
              opacity: pressed ? 0.7 : loadingChains ? 0.5 : 1,
            })}
          >
            <Box flexDirection="row" alignItems="center">
              {/* Chain Icon */}
              {(() => {
                const chain = getChainBySymbol(selectedChain);
                console.log(
                  "🔍 Rendering ChainLogo for:",
                  selectedChain,
                  getChainLabel(selectedChain),
                  chain?.nativeCurrencyId?.logo
                );
                return (
                  <ChainLogo
                    symbol={selectedChain}
                    name={getChainLabel(selectedChain)}
                    logoUrl={chain?.nativeCurrencyId?.logo}
                    width={32}
                    height={32}
                    style={{ marginRight: theme.spacing.m }}
                  />
                );
              })()}
              <CustomText variant="body" fontSize={16} color="white">
                {loadingChains
                  ? "Loading chains..."
                  : getChainLabel(selectedChain)}
              </CustomText>
            </Box>
            <ChevronDown size={20} color={theme.colors.bodyTextColor} />
          </Pressable>

          {/* Private Key Textarea */}
          <CustomTextareaWithoutForm
            label=""
            onChange={(value) => setPrivateKey(value.toString())}
            value={privateKey}
            placeholder="Enter your 64 character private key"
            placeholderTextColor={theme.colors.placeholderTextColor}
            focusable
            multiline
            numberOfLines={6}
            style={{
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              fontWeight: "300",
              color: theme.colors.white,
              minHeight: 120,
              borderColor: validationError
                ? theme.colors.error
                : focused
                ? theme.colors.primaryColor
                : theme.colors.borderColor,
              borderWidth: validationError || focused ? 1 : 0,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          {/* Validation Error */}
          {validationError && (
            <Animated.View
              style={{
                opacity: errorAnimation,
                transform: [
                  {
                    translateY: errorAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              }}
            >
              <Box
                backgroundColor="error"
                borderRadius={8}
                padding="s"
                mt="s"
                borderWidth={1}
                borderColor="error"
              >
                <CustomText variant="body" fontSize={12} color="white">
                  ⚠️ {validationError}
                </CustomText>
              </Box>
            </Animated.View>
          )}

          {/* Paste from Clipboard */}
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

          {/* Import Button */}
          <CustomButton
            disabled={!isFormValid}
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

      {/* Chain Selection Bottom Sheet */}
      <SelectChainBottomSheet
        ref={chainBottomSheetRef}
        onChainSelect={handleChainSelect}
      />

      {/* What's a Private Key Modal */}
      <WhatIsPrivateKeyModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </Box>
  );
};
