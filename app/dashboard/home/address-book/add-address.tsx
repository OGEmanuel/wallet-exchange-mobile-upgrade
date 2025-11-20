import { ThemedScanIcon } from "@/assets/svg/wallet-icons-components";
import SelectChainBottomSheet from "@/components/bottomsheets/SelectChainBottomSheet";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  AppBar,
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { useAddressBookSDK } from "@/hooks/useAddressBookSDK";
import { useChains } from "@/src/core/chains/chains-context";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { Theme } from "@/theme";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@shopify/restyle";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Addresses = () => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { getChainBySymbol } = useChains();
  const { createAddressBook } = useAddressBookSDK();
  const chainBottomSheetRef = useRef<BottomSheetMethods>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  const [name, setName] = useState("");
  const [selectedChainSymbol, setSelectedChainSymbol] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<string | null>(null);

  const selectedChain = selectedChainSymbol ? getChainBySymbol(selectedChainSymbol) : null;

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setAddress(text);
      }
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
    }
  };

  const handleScanQR = async () => {
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
    setAddress(data);
    setShowQRScanner(false);
    // Validate the scanned address if chain is selected
    if (data.trim() && selectedChain) {
      validateAddress(data, selectedChain.symbol);
    }
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  // Address validation using SDK
  const validateAddress = useCallback(
    async (addressToValidate: string, chainSymbol: string) => {
      if (!addressToValidate || addressToValidate.trim().length === 0) {
        setAddressValidationError(null);
        return true;
      }

      try {
        setIsValidatingAddress(true);
        setAddressValidationError(null);

        // Use SDK to validate address format
        const validationResult = await zapSDKService.validateAddress(
          addressToValidate,
          chainSymbol
        );

        if (validationResult.isValid) {
          setAddressValidationError(null);
          return true;
        }
        const errorMessage =
          validationResult.error ||
          "Invalid address format for this blockchain";
        setAddressValidationError(errorMessage);
        return false;
      } catch (error) {
        console.error("Address validation error:", error);
        setAddressValidationError("Unable to validate address");
        return false;
      } finally {
        setIsValidatingAddress(false);
      }
    },
    []
  );

  // Validate address when it or chain changes
  useEffect(() => {
    if (address.trim() && selectedChain) {
      const timeoutId = setTimeout(() => {
        validateAddress(address, selectedChain.symbol);
      }, 500); // Debounce validation

      return () => clearTimeout(timeoutId);
    } else {
      setAddressValidationError(null);
    }
  }, [address, selectedChain, validateAddress]);

  const handleAddAddress = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a name for this address");
      return;
    }

    if (!selectedChain) {
      Alert.alert("Error", "Please select a chain");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Error", "Please enter an address");
      return;
    }

    // Validate address format
    try {
      const validation = await zapSDKService.validateAddress(
        address.trim(),
        selectedChain.symbol
      );
      
      if (!validation.isValid) {
        Alert.alert("Invalid Address", validation.error || "Please enter a valid address");
        return;
      }
    } catch (error) {
      console.error("Address validation error:", error);
      // Continue anyway - let the backend validate
    }

    try {
      setIsLoading(true);
      await createAddressBook("wallet", {
        name: name.trim(),
        address: address.trim(),
        chainId: selectedChain._id || "",
      });
      
      Alert.alert("Success", "Address added successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to add address:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to add address. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor" paddingHorizontal="m">
        <AppBar
          paddingHorizontal={0}
          height={20}
          title={<CustomText variant="bodySubheader">Add Address</CustomText>}
          leading={
            <Pressable onPress={() => router.back()}>
              <ChevronLeft size={25} color={theme.colors.bodyTextColor} />
            </Pressable>
          }
        />
        <Box height={40} />
        <Box flex={1}>
          <CustomInputWithoutForm
            placeholder="Choose Name"
            value={name}
            onChange={setName}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
          />
          <Pressable onPress={() => chainBottomSheetRef.current?.snapToIndex(0)}>
            <CustomInputWithoutForm
              placeholder="Select chain"
              value={selectedChain?.name || ""}
              onChange={() => {}}
              editable={false}
              placeholderTextColor={theme.colors.disabledTextColor}
              boxStyle={{ borderWidth: 0, marginBottom: 10 }}
              iconRight={<ChevronDown color={theme.colors.bodyTextColor} />}
            />
          </Pressable>
          <CustomInputWithoutForm
            placeholder="Enter address, domain or identity"
            value={address}
            onChange={setAddress}
            placeholderTextColor={theme.colors.disabledTextColor}
            boxStyle={{ borderWidth: 0, marginBottom: 10 }}
            iconRight={
              <Pressable onPress={handlePaste}>
                <CustomText color="secondaryColor">Paste</CustomText>
              </Pressable>
            }
          />
          {addressValidationError && (
            <Box mb="s">
              <CustomText color="error" fontSize={12}>
                {addressValidationError}
              </CustomText>
            </Box>
          )}
          {isValidatingAddress && (
            <Box mb="s">
              <CustomText color="bodyTextColor" fontSize={12}>
                Validating address...
              </CustomText>
            </Box>
          )}
          <Pressable
            onPress={handleScanQR}
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <ThemedScanIcon
              darkModeColor={theme.colors.tabBarActiveColor}
              lightModeColor={theme.colors.tabBarActiveColor}
            />
            <CustomText color="tabBarActiveColor" ml="s" fontSize={12}>
              Scan QR Code
            </CustomText>
          </Pressable>
        </Box>
        <Box style={{ marginBottom: insets.bottom + 10 }}>
          <CustomButton
            width={"100%"}
            borderRadius={50}
            text={
              isValidatingAddress
                ? "Validating..."
                : addressValidationError
                ? "Invalid Address"
                : "Add address"
            }
            onPress={handleAddAddress}
            disabled={
              isLoading ||
              !name.trim() ||
              !selectedChain ||
              !address.trim() ||
              !!addressValidationError ||
              isValidatingAddress
            }
          />
        </Box>
      </Box>

      <SelectChainBottomSheet
        ref={chainBottomSheetRef}
        onChainSelect={(chainSymbol) => {
          setSelectedChainSymbol(chainSymbol);
          chainBottomSheetRef.current?.close();
          // Re-validate address when chain changes
          if (address.trim()) {
            validateAddress(address, chainSymbol);
          }
        }}
        onClose={() => {
          chainBottomSheetRef.current?.close();
        }}
      />

      {/* QR Scanner Modal */}
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

          {/* Overlay UI positioned absolutely with safe area */}
          <Box
            position="absolute"
            top={insets.top}
            left={0}
            right={0}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="l"
            paddingVertical="l"
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
            bottom={insets.bottom}
            left={0}
            right={0}
            paddingHorizontal="l"
            paddingVertical="l"
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
    </PageWrapper>
  );
};

export default Addresses;
