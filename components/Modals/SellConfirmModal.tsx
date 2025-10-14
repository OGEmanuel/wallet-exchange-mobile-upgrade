import React, { forwardRef, useCallback } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedCancelIcon } from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CustomText } from "../general";

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

interface BankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  bankLogo?: string;
}

interface SellConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedToken: Token;
  selectedCurrency: Currency;
  selectedBank: BankAccount;
  amount: string;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: theme.colors.mainBackgroundColor,
      borderRadius: 20,
      marginHorizontal: 20,
      maxWidth: 400,
      width: "100%",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.bodyTextColor,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.headerTextColor,
    },
    flagContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    flag: {
      fontSize: 16,
      marginRight: 8,
    },
    buttonContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.borderColor,
    },
    confirmButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: theme.colors.primaryColor,
    },
  });

const SellConfirmModal = forwardRef<any, SellConfirmModalProps>(
  (
    {
      visible,
      onClose,
      onConfirm,
      selectedToken,
      selectedCurrency,
      selectedBank,
      amount,
    },
    ref
  ) => {
    const theme = useTheme<Theme>();
    const styles = createStyles(theme);

    const handleConfirm = useCallback(() => {
      onConfirm();
      onClose();
    }, [onConfirm, onClose]);

    const fiatAmount = parseFloat(amount) * 500; // Dummy exchange rate
    const networkFee = 0.09; // Dummy network fee
    const lpFee = 1200; // Dummy LP fee in fiat
    const total = networkFee + lpFee / 500; // Convert LP fee to token amount

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <CustomText
                variant="subheader"
                textAlign="center"
                style={{ fontSize: 16 }}
              >
                Confirm Transaction
              </CustomText>
              <Pressable onPress={onClose} accessibilityLabel="Close">
                <ThemedCancelIcon />
              </Pressable>
            </View>

            <View style={styles.content}>
              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>You Send</CustomText>
                <CustomText style={styles.detailValue}>
                  {amount} {selectedToken.symbol}
                </CustomText>
              </View>

              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>You Receive</CustomText>
                <View style={styles.flagContainer}>
                  <CustomText style={styles.flag}>
                    {selectedCurrency.flag}
                  </CustomText>
                  <CustomText style={styles.detailValue}>
                    {selectedCurrency.symbol}
                    {fiatAmount.toLocaleString()} {selectedCurrency.code}
                  </CustomText>
                </View>
              </View>

              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>To</CustomText>
                <CustomText style={styles.detailValue}>
                  {selectedBank.accountHolderName}
                </CustomText>
              </View>

              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>Network Fee</CustomText>
                <CustomText style={styles.detailValue}>
                  ${networkFee.toFixed(2)}
                </CustomText>
              </View>

              <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>LP Fee</CustomText>
                <CustomText style={styles.detailValue}>
                  {selectedCurrency.symbol}
                  {lpFee.toLocaleString()} ${(lpFee / 500).toFixed(2)}
                </CustomText>
              </View>

              <View style={styles.detailRow}>
                <CustomText
                  style={[styles.detailLabel, { fontWeight: "bold" }]}
                >
                  Total
                </CustomText>
                <CustomText
                  style={[styles.detailValue, { fontWeight: "bold" }]}
                >
                  ${total.toFixed(2)}
                </CustomText>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <CustomText variant="bodyBold">Cancel</CustomText>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                <CustomText variant="bodyBold" color="white">
                  Confirm
                </CustomText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);

export default SellConfirmModal;

