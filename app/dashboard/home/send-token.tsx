import {
  ThemedBookIcon,
  ThemedScanIcon
} from "@/assets/svg/wallet-icons-components";
import ConfirmSend from "@/components/bottomsheets/send/ConfirmSend";
import SaveAddress from "@/components/bottomsheets/send/SaveAddress";
import SelectTokenBottomSheet from "@/components/bottomsheets/send/SelectTokens";
import SendSuccessModal from "@/components/bottomsheets/send/SendSuccessModal";
import WhatIsNetworkFeeBottomsheet from "@/components/bottomsheets/send/WhatIsNetworkFeeBottomSheet";
import WalletSelectorBottomSheet from "@/components/bottomsheets/WalletSelectorBottomSheet";
import {
  AppBar,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import Box from "@/components/general/Box";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, TouchableWithoutFeedback } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

const SendToken = () => {
  const [amount, setAmount] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<ProcessedAsset | null>(null);
  const [showRecentTransfers, setShowRecentTransfers] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;

  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { networkFeeRef, confirmSendRef, saveAddressRef, sendTokenRef } = useBottomSheetRefs();
  const { mainUserWalletGroup, portfolio } = useWallet();
  const [permission, requestPermission] = useCameraPermissions();

  // Mock recent transfers data - matching the exact design from images
  const recentTransfers = [
    { name: "Moonbag", address: "Vincent.Zap", type: "username", hasLabel: true },
    { name: "0xd5321...de32", address: "0xd5321...de32", type: "address", hasLabel: false },
    { name: "Vincent.zap", address: "Vincent.zap", type: "username", hasLabel: false },
    { name: "Moonbag", address: "0xdf53...de32", type: "address", hasLabel: true },
  ];


  const handlePasteAddress = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      setRecipientAddress(clipboardText);
    } catch (error) {
      console.error("Failed to get clipboard content:", error);
    }
  };

  const handleSelectRecentTransfer = (transfer: any) => {
    setRecipientAddress(transfer.address);
    setShowRecentTransfers(false);
  };

  // Animation effects for dropdown
  useEffect(() => {
    if (showRecentTransfers) {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showRecentTransfers, dropdownAnimation, dropdownOpacity]);

  // Set default token when portfolio loads
  useEffect(() => {
    if (portfolio?.assets && portfolio.assets.length > 0 && !selectedToken) {
      // Prefer tokens with balance, otherwise use the first token
      const tokenWithBalance = portfolio.assets.find((token: ProcessedAsset) => token.balance > 0);
      setSelectedToken(tokenWithBalance || portfolio.assets[0]);
    }
  }, [portfolio, selectedToken]);

  const handleScanQRCode = async () => {
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
    setRecipientAddress(data);
    setShowQRScanner(false);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  const handleWalletSelectorPress = () => {
    setShowWalletSelector(true);
  };

  const handleWalletSelect = (walletGroup: any) => {
    // Handle wallet selection if needed
    setShowWalletSelector(false);
  };

  const handleManageWallets = () => {
    setShowWalletSelector(false);
    router.push("/dashboard/manage-wallet");
  };

  const handleAddWallet = () => {
    setShowWalletSelector(false);
    // TODO: Navigate to add wallet flow
  };


  const handleMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance.toString());
    }
  };

  const calculateUSDValue = () => {
    if (!amount || !selectedToken) return "$0.00";
    const usdValue = parseFloat(amount) * (selectedToken.price || 0);
    return `$${usdValue.toFixed(2)}`;
  };

  const isContinueDisabled = !amount || !recipientAddress || !selectedToken;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <PageWrapper>
      <Box flex={1} backgroundColor="mainBackgroundColor" paddingHorizontal="m">
        {/* Header */}
        <AppBar
          height={30}
          paddingHorizontal={0}
          leading={
            <ChevronLeft
              size={25}
              color={theme.colors.bodyTextColor}
              onPress={() => router.back()}
            />
          }
          title={
            <Pressable
              onPress={handleWalletSelectorPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "auto",
              }}
            >
              <Box
                width={20}
                height={20}
                borderRadius={2}
                bg="secondaryBackgroundColor"
              >
                <Image
                  source={require("@/assets/images/rect2.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                  }}
                />
              </Box>
              <CustomText variant="body" fontSize={14} marginHorizontal="m">
                {mainUserWalletGroup?.name || "Dangerman"}
              </CustomText>
              <ChevronDown size={20} color={theme.colors.bodyTextColor} />
            </Pressable>
          }
        />

        {/* Recipient Section */}
        <Box marginTop="l" position="relative">
          <Box
            flexDirection="row"
            alignItems="center"
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
            paddingHorizontal="m"
            paddingVertical="m"
          >
            <CustomText variant="body" fontSize={14} color="headerTextColor" marginRight="s">
              To:
            </CustomText>
            <TextInput
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              placeholder="Enter address or Zap username"
              placeholderTextColor={theme.colors.disabledTextColor}
              style={{
                flex: 1,
                fontSize: 16,
                color: theme.colors.headerTextColor,
                fontFamily: "NewScience_Regular",
              }}
              onFocus={() => setShowRecentTransfers(true)}
            />
            <Pressable onPress={handlePasteAddress}>
              <CustomText variant="body" fontSize={14} color="white">
              Paste
            </CustomText>
            </Pressable>
          </Box>

          {/* Recent Transfers Dropdown */}
          {showRecentTransfers && (
            <>
              {/* Backdrop */}
              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                  opacity: dropdownOpacity,
                }}
              >
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => setShowRecentTransfers(false)}
                />
              </Animated.View>
              
              <Animated.View
                style={{
                  position: "absolute",
                  top: 60,
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  opacity: dropdownOpacity,
                  transform: [
                    {
                      translateY: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                    {
                      scaleY: dropdownAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                }}
              >
                <Box
                  backgroundColor="secondaryBackgroundColor"
                  borderRadius={12}
                  maxHeight={200}
                  elevation={8}
                  shadowColor="black"
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.3}
                  shadowRadius={8}
                >
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {recentTransfers.map((transfer, index) => (
                      <Pressable
                        key={index}
                        onPress={() => handleSelectRecentTransfer(transfer)}
                        style={({ pressed }) => ({
                          opacity: pressed ? 0.7 : 1,
                          paddingVertical: 16,
                          paddingHorizontal: 16,
                          borderBottomWidth: index < recentTransfers.length - 1 ? 1 : 0,
                          borderBottomColor: theme.colors.mainBackgroundColor,
                        })}
                      >
                        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                          <Box flexDirection="row" alignItems="center" flex={1}>
                            <Box
                              width={32}
                              height={32}
                              borderRadius={16}
                              backgroundColor="mainBackgroundColor"
                              marginRight="m"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Box
                                width={20}
                                height={20}
                                borderRadius={10}
                                backgroundColor="secondaryBackgroundColor"
                              />
                            </Box>
                            <Box flex={1}>
                              <CustomText variant="body" fontSize={16} color="headerTextColor" fontWeight="500">
                                {transfer.name}
                              </CustomText>
                            </Box>
                          </Box>
                          {transfer.hasLabel && (
                            <Box
                              backgroundColor="secondaryBackgroundColor"
                              paddingHorizontal="s"
                              paddingVertical="s"
                              borderRadius={12}
                            >
                              <CustomText variant="body" fontSize={12} color="disabledTextColor">
                                {transfer.address}
                              </CustomText>
                            </Box>
                          )}
                        </Box>
                      </Pressable>
                    ))}
                  </ScrollView>
                </Box>
              </Animated.View>
            </>
          )}

          {/* Scan QR Code and Address Book */}
          <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
            marginTop="m"
        >
            <Pressable onPress={handleScanQRCode} style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedScanIcon
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
              <CustomText variant="body" fontSize={12} marginLeft="s" color="bodyTextColor">
              Scan QR Code
            </CustomText>
          </Pressable>
          <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemedBookIcon
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
              <CustomText variant="body" fontSize={12} marginLeft="s" color="bodyTextColor">
              Address Book
            </CustomText>
          </Pressable>
          </Box>
        </Box>

        {/* Amount Section */}
        <Box marginTop="l">
          <Box
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
            padding="m"
            flexDirection="row"
          >
            <Box flex={1}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={theme.colors.bodyTextColor}
                keyboardType="numeric"
                style={{
                  fontSize: 32,
                  color: theme.colors.headerTextColor,
                  fontFamily: "NewScience_SemiBold",
                }}
              />
              <Box flexDirection="row" alignItems="center" marginTop="s">
                <Image
                  source={require("@/assets/images/updownarrow.png")}
                  style={{ width: 14, height: 14 }}
                  contentFit="contain"
                />
                <CustomText variant="body" color="disabledTextColor" marginLeft="s">
                  {calculateUSDValue()}
                </CustomText>
              </Box>
            </Box>
            <Box alignItems="flex-end" justifyContent="space-between">
                    <Pressable
                      onPress={() => sendTokenRef.current?.snapToIndex(0)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: theme.colors.mainBackgroundColor,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 20,
                      }}
                    >
                {selectedToken?.image ? (
                  <SvgUri
                    uri={selectedToken.image}
                    width={20}
                    height={20}
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <Box
                    width={20}
                    height={20}
                    borderRadius={10}
                    backgroundColor="secondaryBackgroundColor"
                    marginRight="s"
                  />
                )}
                <CustomText variant="body" fontSize={14} color="bodyTextColor">
                  {selectedToken?.symbol || "AVAX"}
                </CustomText>
              </Pressable>
              <Box flexDirection="row" alignItems="center" marginTop="s">
                <CustomText
                  variant="body"
                  color="disabledTextColor"
                  fontSize={12}
                  marginRight="s"
                >
                  Bal: {selectedToken ? `${selectedToken.balance} ${selectedToken.symbol}` : "20 AVAX"}
                </CustomText>
                <Pressable
                  onPress={handleMaxAmount}
                  style={{
                    backgroundColor: theme.colors.bodyTextColor,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <CustomText variant="body" fontSize={12} color="black">
                    Max
                  </CustomText>
                </Pressable>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Network Fee Section */}
        <Box marginTop="l">
          <Box
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
            padding="m"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flexDirection="row" alignItems="center">
              {/* Fee Token Image */}
              <Box
                width={24}
                height={24}
                borderRadius={12}
                backgroundColor="mainBackgroundColor"
                marginRight="s"
                alignItems="center"
                justifyContent="center"
              >
                {selectedToken?.image ? (
                  <SvgUri uri={selectedToken.image} width={20} height={20} />
                ) : (
                  <Box
                    width={16}
                    height={16}
                    borderRadius={8}
                    backgroundColor="secondaryBackgroundColor"
                  />
                )}
              </Box>
              <CustomText variant="body" fontSize={14} color="headerTextColor">
                Network Fee
              </CustomText>
              <Pressable onPress={() => networkFeeRef.current?.snapToIndex(0)}>
                <CustomText variant="body" fontSize={12} color="disabledTextColor" marginLeft="s">
                  ?
                </CustomText>
              </Pressable>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <CustomText variant="body" fontSize={14} color="secondaryColor">
                Fast • $10
              </CustomText>
              <Pressable style={{ marginLeft: 8 }}>
                <Box
                  width={20}
                  height={20}
                  borderRadius={10}
                  backgroundColor="secondaryColor"
                  alignItems="center"
                  justifyContent="center"
                >
                  <ChevronDown size={12} color="white" />
                </Box>
              </Pressable>
            </Box>
          </Box>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            marginTop="s"
          >
            <CustomText variant="body" fontSize={14} color="headerTextColor">
              Total
            </CustomText>
            <CustomText variant="body" fontSize={14} color="headerTextColor">
              $0.16
            </CustomText>
          </Box>
        </Box>
      </Box>

      {/* Continue Button */}
      <Box
        width="100%"
        height={60}
        justifyContent="center"
        paddingHorizontal="m"
        backgroundColor="mainBackgroundColor"
      >
        <CustomButton
          text="Continue"
          onPress={() => confirmSendRef.current?.snapToIndex(1)}
          width="100%"
          borderRadius={50}
          disabled={isContinueDisabled}
          disabledColor={theme.colors.disabledTextColor}
        />
      </Box>

      {/* Select Token Bottom Sheet */}
      <SelectTokenBottomSheet ref={sendTokenRef} />

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

      {/* Bottom Sheets */}
      <WhatIsNetworkFeeBottomsheet ref={networkFeeRef} />
      <ConfirmSend
        ref={confirmSendRef}
        send={() => {
          confirmSendRef.current?.close();
          setShowModal(true);
        }}
      />
      <SendSuccessModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          saveAddressRef.current?.snapToIndex(1);
        }}
      />
      <SaveAddress
        ref={saveAddressRef}
        save={() => saveAddressRef.current?.close()}
      />

      {/* Wallet Selector Bottom Sheet */}
      <WalletSelectorBottomSheet
        visible={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onWalletSelect={handleWalletSelect}
        onManagePress={handleManageWallets}
        onAddWalletPress={handleAddWallet}
        selectedWalletGroupId={mainUserWalletGroup?._id}
      />
    </PageWrapper>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SendToken;