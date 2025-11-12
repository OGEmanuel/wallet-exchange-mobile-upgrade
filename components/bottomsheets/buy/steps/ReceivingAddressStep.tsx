import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import { Box, CustomButton, CustomText } from "@/components/general";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import {
  selectBuyToken,
  setBuyReceivingAddress,
  setBuyStage,
} from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { IChain, ICurrency } from "@zap/blockchain-sdk";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

const ReceivingAddressStep = () => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();
  const selectedToken = useSelector(selectBuyToken);
  const [receivingAddress, setReceivingAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const tokenCurrency = selectedToken?.currencyId as Partial<ICurrency>;
  const tokenChain = selectedToken?.chainId as Partial<IChain>;
  const tokenSymbol = tokenCurrency?.symbol || "";

  const validateAddress = async (address: string) => {
    if (!address.trim()) {
      setAddressError("Receiving address is required");
      return false;
    }

    if (!tokenChain?.symbol) {
      setAddressError("Chain information not available");
      return false;
    }

    setIsValidating(true);
    try {
      const validation = await zapSDKService.validateAddress(
        address.trim(),
        tokenChain.symbol
      );
      
      if (validation.isValid) {
        setAddressError(null);
        return true;
      } else {
        setAddressError(validation.error || "Invalid address");
        return false;
      }
    } catch (error) {
      console.error("Address validation error:", error);
      setAddressError("Failed to validate address. Please try again.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddressChange = async (text: string) => {
    setReceivingAddress(text);
    setAddressError(null);
    
    // Validate on blur or when user stops typing
    if (text.trim().length > 10) {
      await validateAddress(text);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setReceivingAddress(text);
        await validateAddress(text);
      }
    } catch (error) {
      console.error("Failed to paste:", error);
    }
  };

  const handleContinue = async () => {
    const isValid = await validateAddress(receivingAddress);
    if (isValid) {
      dispatch(setBuyReceivingAddress(receivingAddress.trim()));
      // Order will be created in OrderDetailsStep
      dispatch(setBuyStage("order_details"));
    }
  };

  const handleBack = () => {
    dispatch(setBuyStage("buy"));
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
      >
        <Pressable onPress={handleBack}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
        <CustomText variant="medium" color="bodyTextColor">
          Receiving Address
        </CustomText>
        <Box width={30} />
      </Box>

      <Box mb="m">
        <CustomText variant="body" color="bodyTextColor" mb="s">
          Enter the {tokenSymbol} receiving address
        </CustomText>
        <CustomText variant="body" color="disabledTextColor" fontSize={12}>
          Make sure this address supports {tokenChain?.name || "the selected chain"}
        </CustomText>
      </Box>

      <Box
        bg="secondaryBackgroundColor"
        borderRadius={12}
        p="m"
        mb="s"
        borderWidth={addressError ? 1 : 0}
        borderColor={addressError ? "error" : "secondaryBackgroundColor"}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TextInput
            value={receivingAddress}
            onChangeText={handleAddressChange}
            placeholder="Enter receiving address"
            placeholderTextColor={theme.colors.disabledTextColor}
            style={{
              flex: 1,
              fontSize: 14,
              color: theme.colors.bodyTextColor,
              minHeight: 40,
            }}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />
          <Pressable
            onPress={handlePaste}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderRadius: 8,
              marginLeft: 8,
            }}
          >
            <CustomText variant="body" fontSize={12} color="secondaryColor">
              Paste
            </CustomText>
          </Pressable>
        </View>
      </Box>

      {addressError && (
        <Box mb="s">
          <CustomText variant="body" color="error" fontSize={12}>
            {addressError}
          </CustomText>
        </Box>
      )}

      {isValidating && (
        <Box mb="s">
          <CustomText variant="body" color="disabledTextColor" fontSize={12}>
            Validating address...
          </CustomText>
        </Box>
      )}

      <Box mt="xl">
        <CustomButton
          text="Continue"
          onPress={handleContinue}
          width="100%"
          borderRadius={50}
          disabled={!receivingAddress.trim() || !!addressError || isValidating}
        />
      </Box>
    </BottomSheetView>
  );
};

export default ReceivingAddressStep;

