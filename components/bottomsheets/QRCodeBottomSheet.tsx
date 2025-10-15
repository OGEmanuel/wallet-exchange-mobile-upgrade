import { CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import ChainLogo from "@/components/general/ChainLogo";
import { Theme } from "@/theme";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { X } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { Alert, Pressable } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface QRCodeBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  chain: string;
  symbol: string;
  address: string;
  logoUrl?: string;
}

const QRCodeBottomSheet: React.FC<QRCodeBottomSheetProps> = ({
  bottomSheetRef,
  chain,
  symbol,
  address,
  logoUrl,
}) => {
  const theme = useTheme<Theme>();

  const snapPoints = useMemo(() => ["100%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert("Copied", "Address copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy address");
    }
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.colors.modalBackgroundColor,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.borderColor,
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.m,
          paddingBottom: theme.spacing.xl,
        }}
      >
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          marginBottom="l"
        >
          <Box flexDirection="row" alignItems="center" flex={1}>
            <ChainLogo
              symbol={symbol}
              name={chain}
              logoUrl={logoUrl}
              width={32}
              height={32}
              style={{ marginRight: theme.spacing.s }}
            />
            <CustomText
              variant="bodyBold"
              fontSize={18}
              color="headerTextColor"
            >
              {chain}
            </CustomText>
          </Box>
          
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              padding: 8,
            })}
          >
            <X size={24} color={theme.colors.headerTextColor} />
          </Pressable>
        </Box>

        {/* Instructions */}
        <CustomText
          variant="body"
          fontSize={14}
          color="disabledTextColor"
          textAlign="center"
          marginBottom="l"
        >
          Copy address or scan bar code to receive token into your wallet with ease.
        </CustomText>

        {/* QR Code */}
        <Box
          alignItems="center"
          justifyContent="center"
          backgroundColor="white"
          borderRadius={16}
          padding="m"
          marginBottom="l"
        >
          <QRCode
            value={address}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </Box>

        {/* Address */}
        <Box
          backgroundColor="mainBackgroundColor"
          borderRadius={12}
          padding="m"
          marginBottom="l"
        >
          <CustomText
            variant="body"
            fontSize={14}
            color="headerTextColor"
            textAlign="center"
          >
            {address}
          </CustomText>
        </Box>

        {/* Copy Button */}
        <Pressable
          onPress={handleCopyAddress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            backgroundColor: theme.colors.primaryColor,
            borderRadius: 12,
            padding: theme.spacing.m,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <CustomText
            variant="bodyBold"
            fontSize={16}
            color="white"
          >
            Copy Address
          </CustomText>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default QRCodeBottomSheet;
