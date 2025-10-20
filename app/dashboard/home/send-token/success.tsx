import ThemedSuccessIcon from "@/assets/svg/wallet-icons-components/ThemedSuccessIcon";
import SaveAddressBottomSheet from "@/components/bottomsheets/SaveAddressBottomSheet";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Copy } from "iconsax-react-nativejs";
import React, { useState } from "react";
import { Dimensions, Linking, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function TransactionSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    txHash,
    amount,
    tokenSymbol,
    recipientAddress,
    networkFee,
    networkName = "Ethereum",
    fiatValue,
  } = params;

  const handleCopyTxHash = async () => {
    try {
      await Clipboard.setStringAsync(txHash as string);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // You could show a toast here
    } catch (error) {
      console.error("Failed to copy transaction hash:", error);
    }
  };

  const handleViewOnExplorer = async () => {
    try {
      const explorerUrl = `https://etherscan.io/tx/${txHash}`;
      await Linking.openURL(explorerUrl);
    } catch (error) {
      console.error("Failed to open explorer:", error);
    }
  };

  const handleSaveAddress = async (addressName: string) => {
    setIsSaving(true);
    try {
      // TODO: Implement save address functionality
      // This would typically save to local storage or send to backend
      console.log("Saving address:", {
        name: addressName,
        address: recipientAddress,
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // You could show a success toast here
    } catch (error) {
      console.error("Failed to save address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToHistory = () => {
    router.push("/dashboard/home/wallet-home/activity");
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <PageWrapper>
      <Box flex={1}>
        {/* Success Content with Linear Gradient Background */}
        <LinearGradient
          colors={[theme.colors.primaryColor, theme.colors.mainBackgroundColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 0.4 }}
          style={{ flex: 1 }}
        >
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            paddingHorizontal="l"
          >
            {/* Success Icon */}
            <Box marginBottom="xl">
              <ThemedSuccessIcon width={120} height={120} />
            </Box>

            {/* Success Message */}
            <CustomText
              variant="header"
              color="headerTextColor"
              fontSize={32}
              fontWeight="bold"
              marginBottom="s"
            >
              SENT!
            </CustomText>

            {/* Transaction Date */}
            <CustomText variant="body" color="bodyTextColor" marginBottom="xl">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at{" "}
              {new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </CustomText>

            {/* Transaction Summary Card */}
            <Box
              backgroundColor="modalBackgroundColor"
              borderRadius={12}
              padding="l"
              borderWidth={1}
              borderColor="borderColor"
              width="100%"
              marginBottom="l"
            >
              {/* Token Icon and Amount */}
              <Box alignItems="center" marginBottom="m">
                <CustomText
                  variant="header"
                  color="headerTextColor"
                  fontSize={24}
                  fontWeight="bold"
                  marginBottom="s"
                >
                  -{amount} {tokenSymbol}
                </CustomText>

                {fiatValue && (
                  <CustomText
                    variant="body"
                    color="bodyTextColor"
                    fontSize={16}
                  >
                    ${fiatValue}
                  </CustomText>
                )}
              </Box>

              {/* Transaction Details */}
              <Box>
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  paddingVertical="s"
                  borderBottomWidth={1}
                  borderBottomColor="borderColor"
                  marginBottom="s"
                >
                  <CustomText variant="body" color="bodyTextColor">
                    Sent To:
                  </CustomText>
                  <CustomText
                    variant="body"
                    color="headerTextColor"
                    numberOfLines={1}
                  >
                    {recipientAddress.slice(0, 6)}...
                    {recipientAddress.slice(-4)}
                  </CustomText>
                </Box>

                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  paddingVertical="s"
                  borderBottomWidth={1}
                  borderBottomColor="borderColor"
                  marginBottom="s"
                >
                  <CustomText variant="body" color="bodyTextColor">
                    Network:
                  </CustomText>
                  <CustomText variant="body" color="headerTextColor">
                    {networkName}
                  </CustomText>
                </Box>

                {networkFee && (
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingVertical="s"
                    borderBottomWidth={1}
                    borderBottomColor="borderColor"
                    marginBottom="s"
                  >
                    <CustomText variant="body" color="bodyTextColor">
                      Network Fee:
                    </CustomText>
                    <CustomText variant="body" color="headerTextColor">
                      {networkFee}
                    </CustomText>
                  </Box>
                )}

                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  paddingVertical="s"
                >
                  <CustomText variant="body" color="bodyTextColor">
                    Txn Hash:
                  </CustomText>
                  <Pressable
                    onPress={handleCopyTxHash}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.5 : 1,
                    })}
                  >
                    <Box flexDirection="row" alignItems="center">
                      <CustomText variant="body" color="white" marginRight="s">
                        {txHash.slice(0, 6)}...{txHash.slice(-4)}
                      </CustomText>
                      <Copy size={16} color={theme.colors.white} />
                    </Box>
                  </Pressable>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box width="100%" gap="m">
               {/* Save Address Button */}
               <CustomButton
                 text="Save address"
                 onPress={() => setShowSaveModal(true)}
                 width="100%"
                 height={56}
                 borderRadius={50}
               />

              {/* Go to History Button */}
              <CustomButton
                text="Go to History"
                onPress={handleGoToHistory}
                width="100%"
                height={56}
                borderRadius={50}
                bgColor="transparent"
                borderWidth={1}
                borderColor={theme.colors.borderColor}
              />
            </Box>
          </Box>
        </LinearGradient>
      </Box>

      {/* Save Address Modal */}
      <SaveAddressBottomSheet
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveAddress}
        recipientAddress={recipientAddress as string}
        isLoading={isSaving}
      />
    </PageWrapper>
  );
}
