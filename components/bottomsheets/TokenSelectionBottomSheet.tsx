import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useFetchCurrencies } from "@/src/modules/swap";
import { Theme } from "@/theme";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import TokenImage from "../dashboard/market/TokenImage";
import { Box, CustomText } from "../general";

interface Token {
  symbol: string;
  name?: string;
  image: any;
  balance?: string;
  usdValue?: string;
  _id?: string;
  currencyId?: {
    symbol?: string;
    name?: string;
    isCrypto?: boolean;
  };
}

interface TokenSelectionBottomSheetProps {
  onTokenSelect: (token: Token) => void;
  selectedToken: Token;
  title: string;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: theme.colors.mainBackgroundColor,
    },
    bottomSheetView: {
      flex: 1,
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.mainBackgroundColor,
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    scrollView: {
      backgroundColor: theme.colors.secondaryBackgroundColor,
      borderRadius: 12,
      padding: 10,
    },
    scrollViewContent: {
      paddingBottom: 20,
    },
    tokenItem: {
      flexDirection: "row",
      alignItems: "center",
      height: 48,
      gap: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    tokenImageContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    tokenTextContainer: {
      flex: 1,
    },
  });

const TokenSelectionBottomSheet = forwardRef<
  BottomSheet,
  TokenSelectionBottomSheetProps
>(({ onTokenSelect, selectedToken, title }, ref) => {
  const theme = useTheme<Theme>();
  const styles = createStyles(theme);
  const { hideAllBottomSheets } = useAppBottomSheet();
  const { currencies, isLoading, isError } = useFetchCurrencies();

  // Debug logging
  console.log("TokenSelectionBottomSheet - currencies:", currencies);
  console.log("TokenSelectionBottomSheet - isLoading:", isLoading);
  console.log("TokenSelectionBottomSheet - isError:", isError);

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

  // Convert currencies to tokens format
  const tokens: Token[] =
    currencies?.map((currency) => ({
      symbol: currency.currencyId?.symbol || "Unknown",
      name: currency.currencyId?.name || currency.currencyId?.symbol,
      image: currency.image || currency.currencyId?.logo,
      balance: "0", // You can add balance logic here
      usdValue: "$0", // You can add USD value logic here
      _id: currency._id,
      currencyId: currency.currencyId,
    })) || [];

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    // Close the bottomsheet
    hideAllBottomSheets();
  };

  return (
    <>
      <CustomText variant="subheader" textAlign="center" mb="l">
        {title}
      </CustomText>

      {isLoading ? (
        <Box alignItems="center" justifyContent="center" py="xl">
          <CustomText variant="body" color="disabledTextColor">
            Loading currencies...
          </CustomText>
        </Box>
      ) : isError ? (
        <Box alignItems="center" justifyContent="center" py="xl">
          <CustomText variant="body" color="disabledTextColor">
            Failed to load currencies
          </CustomText>
        </Box>
      ) : tokens.length === 0 ? (
        <Box alignItems="center" justifyContent="center" py="xl">
          <CustomText variant="body" color="disabledTextColor">
            No currencies available
          </CustomText>
        </Box>
      ) : (
        <ScrollView>
          {tokens.map((token, index) => (
            <TouchableOpacity
              key={`token-${token._id || index}`}
              onPress={() => handleTokenSelect(token)}
              activeOpacity={0.7}
              style={styles.tokenItem}
            >
              <View style={styles.tokenImageContainer}>
                <TokenImage size={24} uri={token.image} name={token.name} />
              </View>
              <View style={styles.tokenTextContainer}>
                <CustomText variant="bodyBold" fontSize={16}>
                  {token.symbol}
                </CustomText>
                {token.name && (
                  <CustomText
                    variant="body"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    {token.name}
                  </CustomText>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
});

export default TokenSelectionBottomSheet;
