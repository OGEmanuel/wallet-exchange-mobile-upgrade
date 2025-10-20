import SelectChainBottomSheet from "@/components/bottomsheets/SelectChainBottomSheet";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import AppBar from "@/components/general/AppBar";
import Box from "@/components/general/Box";
import ChainLogo from "@/components/general/ChainLogo";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { useChains } from "@/src/core/chains/chains-context";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { ChevronDown, ChevronLeft, Copy, QrCode } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WalletWatchAddressStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletWatchAddressStep: React.FC<WalletWatchAddressStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const {
    walletChains,
    isLoading: loadingChains,
    getChainBySymbol,
  } = useChains();
  const [watchAddress, setWatchAddress] = useState(
    walletData.watchAddress || ""
  );
  const [selectedChain, setSelectedChain] = useState(walletData.chain || "SOL");
  const chainBottomSheetRef = useRef<any>(null);
  const [focused, setFocused] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [validationError, setValidationError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Set default chain when walletChains are loaded
  useEffect(() => {
    if (!selectedChain && walletChains.length > 0) {
      setSelectedChain(walletChains[0].symbol);
    }
  }, [walletChains, selectedChain]);

  // Real-time validation with debounce
  useEffect(() => {
    if (watchAddress.trim() && selectedChain) {
      const timeoutId = setTimeout(() => {
        validateAddress(watchAddress, selectedChain);
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
    }
  }, [watchAddress, selectedChain]);

  const handleContinue = () => {
    Keyboard.dismiss();
    onUpdateData({ watchAddress, chain: selectedChain });
    onContinue();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const getChainLabel = (chainValue: string) => {
    const chain = getChainBySymbol(chainValue);
    return chain ? chain.name : "Select Chain";
  };

  const handleChainSelect = (chain: string) => {
    setSelectedChain(chain);
    chainBottomSheetRef.current?.close();
  };

  const handleQRCode = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to scan QR codes"
        );
        return;
      }
    }
    setShowQRScanner(true);
  };

  const onQRCodeScanned = ({ data }: { data: string }) => {
    setWatchAddress(data);
    setShowQRScanner(false);
    // Validate the scanned address
    if (data.trim() && selectedChain) {
      validateAddress(data, selectedChain);
    }
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        setWatchAddress(clipboardText);
        if (validationError) {
          setValidationError("");
        }
        // Validate the pasted address
        if (selectedChain) {
          validateAddress(clipboardText, selectedChain);
        }
      }
    } catch (error) {
      console.error("Failed to get clipboard content:", error);
    }
  };

  const validateAddress = async (address: string, chain: string) => {
    if (!address.trim()) {
      setValidationError("");
      return true;
    }

    setIsValidating(true);
    setValidationError("");

    try {
      const result = await zapSDKService.validateAddress(address, chain);
      if (!result.isValid) {
        setValidationError(result.error || "Invalid address");
        return false;
      }
      setValidationError("");
      return true;
    } catch (error) {
      console.error("Address validation error:", error);
      setValidationError("Failed to validate address");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const isValidAddress = watchAddress.trim().length > 0;
  const isFormValid =
    isValidAddress && selectedChain && !validationError && !isValidating;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
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
          <Box flex={1} paddingHorizontal="l">
            <CustomText variant="medium" fontSize={22} mb="m" color="white">
              Watch a wallet
            </CustomText>

            <CustomText variant="body" fontSize={14} mb="2xl" color="white">
              View the assets and activity of any wallet address. You cannot
              control assets or sign transactions though.
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

            {/* Address Input */}
            <CustomInputWithoutForm
              onChange={(value) => setWatchAddress(value.toString())}
              value={watchAddress}
              label=""
              placeholder="Address, domain or identity"
              placeholderTextColor={theme.colors.placeholderTextColor}
              focusable
              style={{
                backgroundColor: theme.colors.secondaryBackgroundColor,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontWeight: "300",
                color: theme.colors.white,
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              iconRight={
                <Pressable
                  onPress={handleQRCode}
                  style={({ pressed }) => ({
                    padding: 8,
                    opacity: pressed ? 0.5 : 1,
                  })}
                >
                  <QrCode size={20} color={theme.colors.bodyTextColor} />
                </Pressable>
              }
            />

            {/* Validation Error Display */}
            {validationError && (
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
            )}

            {/* Paste from Clipboard Button */}
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

            <Box flex={1} />

            <Box paddingBottom="xl" paddingTop="l">
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
          </Box>
        </TouchableWithoutFeedback>

        {/* QR Code Scanner Modal */}
        {showQRScanner && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="black"
            zIndex={1000}
          >
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={onQRCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />

            {/* Overlay UI positioned absolutely */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingHorizontal="l"
              paddingTop="xl"
              paddingBottom="l"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <Pressable
                onPress={closeQRScanner}
                style={({ pressed }) => ({
                  padding: 12,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <ChevronLeft size={24} color="white" />
              </Pressable>
              <CustomText variant="medium" fontSize={18} color="white">
                Scan QR Code
              </CustomText>
              <Box width={48} />
            </Box>

            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              paddingHorizontal="l"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <CustomText
                variant="body"
                fontSize={14}
                color="white"
                textAlign="center"
              >
                Position the QR code within the frame to scan
              </CustomText>
            </Box>
          </Box>
        )}

        {/* Chain Selection Bottom Sheet */}
        <SelectChainBottomSheet
          ref={chainBottomSheetRef}
          onChainSelect={(chainSymbol) => {
            setSelectedChain(chainSymbol);
            chainBottomSheetRef.current?.close();
          }}
        />
      </Box>
    </KeyboardAvoidingView>
  );
};
