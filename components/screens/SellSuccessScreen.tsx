import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CheckCircle, Copy } from "lucide-react-native";
import { CustomText, PageWrapper } from "../general";

interface Token {
  symbol: string;
  name?: string;
  image: string | null;
  balance: string;
  usdValue: string;
  network: string;
  _id: string;
}

interface Currency {
  code: string;
  name: string;
  flag: string;
  symbol: string;
}

interface SellSuccessScreenProps {
  selectedToken: Token;
  selectedCurrency: Currency;
  amount: string;
  onZapAgain: () => void;
  onGoToHistory: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor:
        theme.colors.successBackground || theme.colors.primaryColor,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    transactionIdContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.secondaryBackgroundColor,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 24,
    },
    transactionIdText: {
      fontSize: 12,
      color: theme.colors.bodyTextColor,
      marginRight: 8,
    },
    networkContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    networkText: {
      fontSize: 14,
      color: theme.colors.bodyTextColor,
      marginLeft: 8,
    },
    completionTime: {
      fontSize: 14,
      color: theme.colors.bodyTextColor,
      marginBottom: 32,
    },
    buttonContainer: {
      width: "100%",
      gap: 12,
    },
    primaryButton: {
      backgroundColor: theme.colors.primaryColor,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    secondaryButton: {
      backgroundColor: "transparent",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
  });

const SellSuccessScreen: React.FC<SellSuccessScreenProps> = ({
  selectedToken,
  selectedCurrency,
  amount,
  onZapAgain,
  onGoToHistory,
}) => {
  const theme = useTheme<Theme>();
  const styles = createStyles(theme);

  const handleCopyTransactionId = useCallback(() => {
    // In a real app, this would copy to clipboard
    console.log("Copy transaction ID to clipboard");
  }, []);

  const fiatAmount = parseFloat(amount) * 500; // Dummy exchange rate
  const transactionId = "0x8E3E0F5C306536..."; // Dummy transaction ID

  return (
    <PageWrapper>
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <CheckCircle size={40} color="white" />
        </View>

        {/* Success Message */}
        <CustomText variant="header" textAlign="center" marginBottom="l">
          You swapped {amount} {selectedToken.symbol} for{" "}
          {selectedCurrency.symbol}
          {fiatAmount.toLocaleString()} {selectedCurrency.code}
        </CustomText>

        {/* Transaction ID */}
        <View style={styles.transactionIdContainer}>
          <CustomText style={styles.transactionIdText}>
            {transactionId}
          </CustomText>
          <Pressable onPress={handleCopyTransactionId}>
            <Copy size={16} color={theme.colors.bodyTextColor} />
          </Pressable>
        </View>

        {/* Network */}
        <View style={styles.networkContainer}>
          <CustomText style={styles.networkText}>
            {selectedToken.network}
          </CustomText>
        </View>

        {/* Completion Time */}
        <CustomText style={styles.completionTime}>
          Completed in 1.20s
        </CustomText>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.primaryButton} onPress={onZapAgain}>
            <CustomText variant="bodyBold" color="white">
              Zap again
            </CustomText>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onGoToHistory}>
            <CustomText variant="bodyBold">Go to History</CustomText>
          </Pressable>
        </View>
      </View>
    </PageWrapper>
  );
};

export default SellSuccessScreen;

