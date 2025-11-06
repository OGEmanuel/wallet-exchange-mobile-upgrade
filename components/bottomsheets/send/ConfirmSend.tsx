import { ThemedFaceIDIcon } from "@/assets/svg/wallet-icons-components";
import NetworkFeeCard from "@/components/dashboard/NetworkFeeCard";
import { CustomButton, CustomText } from "@/components/general";
import CryptoIcon from "@/components/general/CrptoIcon";
import { PinEntryModal } from "@/components/Modals/PinEntryModal";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { SvgUri } from "react-native-svg";
import Box from "../../general/Box";
import Identicon from "../../general/Identicon";

enum FeeSpeed {
  Standard = "Standard",
  Fast = "Fast",
  Instant = "Instant",
}

interface ConfirmSendProps {
  send: () => void;
  selectedToken: ProcessedAsset;
  recipientAddress: string;
  amount: string;
  usdValue: number;
  networkFee?: {
    fee: number;
    feeInUSD: number;
    speed: FeeSpeed;
    gasPrice?: number;
    gasLimit?: number;
    feeRate?: number;
  } | null;
  onClose?: () => void;
  onTransactionComplete?: () => void;
}

const ConfirmSend = forwardRef<BottomSheet, ConfirmSendProps>((props, ref) => {
  const {
    send,
    selectedToken,
    recipientAddress,
    amount,
    usdValue,
    networkFee,
    onClose,
  } = props;
  const theme = useTheme<Theme>();
  const { mainUserWalletGroup } = useWallet();
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendPress = async () => {
    // Check if PIN is required
    const hasPin = await pinStorageService.hasPin();

    if (hasPin) {
      setShowPinEntry(true);
    } else {
      // No PIN required, proceed with send
      setIsProcessing(true);
      send();
    }
  };

  const handlePinSuccess = (pin: string) => {
    setShowPinEntry(false);
    setIsProcessing(true);
    // Add a small delay to show the PIN modal closing before starting the transaction
    setTimeout(() => {
      send();
    }, 300);
  };

  const handlePinClose = () => {
    setShowPinEntry(false);
  };

  // Reset processing state after a timeout (fallback)
  useEffect(() => {
    if (isProcessing) {
      const timeout = setTimeout(() => {
        setIsProcessing(false);
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isProcessing]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    []
  );

  // Don't render if selectedToken is null
  if (!selectedToken) {
    return null;
  }

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["70%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box height={4} bg="white" width={50} borderRadius={2} />
        </Box>
      )}
    >
      <BottomSheetView
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.mainBackgroundColor,
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      >
        <CustomText textAlign="center" variant="medium" mb="s">
          Confirm Send
        </CustomText>

        {/* Wallet Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          width="100%"
          marginTop="m"
          marginBottom="m"
        >
          <Box
            width={20}
            height={20}
            borderRadius={2}
            mr="s"
            bg="secondaryBackgroundColor"
          >
            <Identicon
              value={
                mainUserWalletGroup?.name ||
                "0x0000000000000000000000000000000000000000"
              }
              size={20}
            />
          </Box>
          <CustomText variant="body" fontSize={14} color="bodyTextColor">
            {mainUserWalletGroup?.name || "Wallet"}
          </CustomText>
          <Box width={20} />
        </Box>

        <Box alignItems="center" mb="m">
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "auto",
              marginTop: 20,
              marginBottom: 30,
            }}
          >
            <Box
              width={20}
              height={20}
              borderRadius={10}
              bg="secondaryBackgroundColor"
              overflow="hidden"
              justifyContent="center"
              alignItems="center"
            >
              {selectedToken.image ? (
                <SvgUri uri={selectedToken.image} width={20} height={20} />
              ) : (
                <Box width={20} height={20} bg="secondaryBackgroundColor" />
              )}
            </Box>
            <CustomText variant="body" fontSize={14} marginHorizontal="m">
              {selectedToken.symbol}
            </CustomText>
          </Pressable>

          <Box position="relative" width={"100%"}>
            <Box
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              width={"100%"}
              height={101}
              borderRadius={12}
              bg="modalBackgroundColor"
              p="m"
            >
              <Box flex={1}>
                <CustomText>You&apos;re sending</CustomText>
                <CustomText
                  variant="subheader"
                  fontSize={22}
                  style={{ marginVertical: 4 }}
                >
                  {PortfolioService.formatBalance(amount)} {selectedToken.symbol}
                </CustomText>
                <CustomText>
                  {PortfolioService.formatCurrency(usdValue)}
                </CustomText>
              </Box>
              <Box
                width={30}
                height={30}
                borderRadius={15}
                overflow="hidden"
                justifyContent="center"
                alignItems="center"
              >
                {selectedToken.image ? (
                  <SvgUri uri={selectedToken.image} width={30} height={30} />
                ) : (
                  <Box width={30} height={30} bg="secondaryBackgroundColor" />
                )}
              </Box>
            </Box>

            <Box
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              width={"100%"}
              height={101}
              borderRadius={12}
              bg="modalBackgroundColor"
              mt="s"
              p="m"
            >
              <Box flex={1}>
                <CustomText>To</CustomText>
                <CustomText
                  variant="subheader"
                  fontSize={16}
                  style={{ marginVertical: 4 }}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {recipientAddress}
                </CustomText>
              </Box>
              <Box
                width={30}
                height={30}
                borderRadius={15}
                overflow="hidden"
                justifyContent="center"
                alignItems="center"
              >
                {selectedToken.chainImage ? (
                  <CryptoIcon
                    image={selectedToken.chainImage}
                    size={30}
                  />
                ) : (
                  <Box width={30} height={30} bg="secondaryBackgroundColor" />
                )}
              </Box>
            </Box>
            <Image
              source={require("@/assets/images/arrowsdown.png")}
              style={{
                width: 40,
                height: 40,
                position: "absolute",
                left: "45%",
                top: "40%",
              }}
              contentFit="contain"
            />
          </Box>
        </Box>
        <NetworkFeeCard
          networkFee={networkFee}
          selectedToken={selectedToken}
          amount={amount}
        />
        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt="l"
          gap="m"
        >
          <CustomButton
            width="48%"
            height={56}
            borderRadius={50}
            text="Cancel"
            bgColor={theme.colors.borderColor}
            color={theme.colors.headerTextColor}
            onPress={onClose || (() => {})}
          />
          <CustomButton
            width="48%"
            height={56}
            borderRadius={50}
            text="Send"
            disabled={isProcessing}
            isLoading={isProcessing}
            trailingIcon={
              <Box ml="s">
                <ThemedFaceIDIcon
                  darkModeColor={theme.colors.bodyTextColor}
                  lightModeColor={theme.colors.bodyTextColor}
                />
              </Box>
            }
            onPress={handleSendPress}
          />
        </Box>

        {/* PIN Entry Modal */}
        <PinEntryModal
          type="VERIFY"
          visible={showPinEntry}
          onSuccess={handlePinSuccess}
          onClose={handlePinClose}
        />
      </BottomSheetView>
    </BottomSheet>
  );
});

ConfirmSend.displayName = "ConfirmSend";

export default ConfirmSend;
