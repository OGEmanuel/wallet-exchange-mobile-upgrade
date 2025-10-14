import BottomSheet, {
  BottomSheetBackdrop,
  SCREEN_WIDTH,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedCancelIcon } from "@/assets/svg/wallet-icons-components";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useFetchCurrencies } from "@/src/modules/swap";
import { Theme } from "@/theme";
import TokenImage from "../dashboard/market/TokenImage";
import { Box, CustomText } from "../general";

interface CurrencyId {
  symbol?: string;
  name?: string;
  isCrypto?: boolean;
  logo?: string;
}

interface Token {
  symbol: string;
  name?: string;
  image: string | null;
  balance?: string;
  usdValue?: string;
  _id?: string;
  currencyId?: CurrencyId;
}

interface TokenSelectionBottomSheetProps {
  onTokenSelect: (token: Token) => void;
  selectedToken: Token;
  title: string;
}

// Constants
const TOKEN_ITEM_HEIGHT = 48;
const TOKEN_IMAGE_SIZE = 24;
const HEADER_HEIGHT = 48;
const BORDER_RADIUS = 12;
const PADDING_HORIZONTAL = 20;
const PADDING_TOP = 30;

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
      paddingHorizontal: PADDING_HORIZONTAL,
      paddingTop: PADDING_TOP,
    },
    scrollView: {
      backgroundColor: theme.colors.secondaryBackgroundColor,
      borderRadius: BORDER_RADIUS,
      padding: 10,
    },
    scrollViewContent: {
      paddingBottom: 20,
    },
    tokenItem: {
      flexDirection: "row",
      alignItems: "center",
      height: TOKEN_ITEM_HEIGHT,
      gap: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    tokenImageContainer: {
      width: TOKEN_IMAGE_SIZE,
      height: TOKEN_IMAGE_SIZE,
      borderRadius: TOKEN_IMAGE_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    tokenTextContainer: {
      flex: 1,
    },
    header: {
      width: SCREEN_WIDTH,
      alignItems: "center",
      height: HEADER_HEIGHT,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
      position: "absolute",
      paddingHorizontal: 16,
    },
    headerSpacer: {
      marginTop: HEADER_HEIGHT,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
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
  const tokens: Token[] = useMemo(
    () =>
      currencies?.map((currency) => ({
        symbol: currency.currencyId?.symbol || "Unknown",
        name: currency.currencyId?.name || currency.currencyId?.symbol,
        image: currency.image || currency.currencyId?.logo || null,
        balance: "0", // TODO: Add balance logic here
        usdValue: "$0", // TODO: Add USD value logic here
        _id: currency._id,
        currencyId: currency.currencyId,
      })) || [],
    [currencies]
  );

  const handleTokenSelect = useCallback(
    (token: Token) => {
      onTokenSelect(token);
      hideAllBottomSheets();
    },
    [onTokenSelect, hideAllBottomSheets]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable onPress={hideAllBottomSheets} accessibilityLabel="Close">
        <ThemedCancelIcon />
      </Pressable>
      <CustomText
        variant="subheader"
        textAlign="center"
        style={{ fontSize: 16 }}
        accessibilityRole="header"
      >
        {title}
      </CustomText>
      <View style={{ width: TOKEN_IMAGE_SIZE }} />
    </View>
  );

  const renderLoadingState = () => (
    <Box style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primaryColor} />
    </Box>
  );

  const renderErrorState = () => (
    <Box style={styles.loadingContainer}>
      <CustomText variant="body" color="disabledTextColor">
        Failed to load currencies
      </CustomText>
    </Box>
  );

  const renderEmptyState = () => (
    <Box style={styles.loadingContainer}>
      <CustomText variant="body" color="disabledTextColor">
        No currencies available
      </CustomText>
    </Box>
  );

  const renderTokenItem = (token: Token, index: number) => (
    <TouchableOpacity
      key={`token-${token._id || index}`}
      onPress={() => handleTokenSelect(token)}
      activeOpacity={0.7}
      style={styles.tokenItem}
      accessibilityRole="button"
      accessibilityLabel={`Select ${token.symbol} token`}
    >
      <View style={styles.tokenImageContainer}>
        <TokenImage
          size={TOKEN_IMAGE_SIZE}
          uri={token.image || undefined}
          name={token.name}
        />
      </View>
      <View style={styles.tokenTextContainer}>
        <CustomText variant="bodyBold" fontSize={16}>
          {token.symbol}
        </CustomText>
        {token.name && (
          <CustomText variant="body" fontSize={12} color="disabledTextColor">
            {token.name}
          </CustomText>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) return renderLoadingState();
    if (isError) return renderErrorState();
    if (tokens.length === 0) return renderEmptyState();

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {tokens.map(renderTokenItem)}
      </ScrollView>
    );
  };

  return (
    <>
      {renderHeader()}
      <View style={styles.headerSpacer} />
      {renderContent()}
    </>
  );
});

export default TokenSelectionBottomSheet;
