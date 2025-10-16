import CryptoIcon from "@/components/general/CrptoIcon";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { BlockchainTransaction } from "@zap/blockchain-sdk";
import { Copy, ExternalLink } from "lucide-react-native";
import React, { forwardRef, useCallback } from "react";
import { Pressable } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface TransactionDetailsBottomSheetProps {
  transaction: BlockchainTransaction | null;
  selectedToken: ProcessedAsset | null;
  onClose?: () => void;
  visible?: boolean;
}

const TransactionDetailsBottomSheet = forwardRef<
  BottomSheet,
  TransactionDetailsBottomSheetProps
>(({ transaction, selectedToken, onClose, visible = false }, ref) => {
  const theme = useTheme<Theme>();

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

  const getTransactionType = (direction: string) => {
    switch (direction) {
      case "OUT":
        return "Sent";
      case "IN":
        return "Received";
      case "SWAP":
        return "Swapped";
      default:
        return "Transaction";
    }
  };

  const getTransactionIcon = (direction: string) => {
    const iconSize = 24;
    switch (direction) {
      case "OUT":
        return "→";
      case "IN":
        return "←";
      case "SWAP":
        return "⇄";
      default:
        return "✓";
    }
  };

  const getTransactionColor = (direction: string) => {
    switch (direction) {
      case "OUT":
        return "error";
      case "IN":
        return "success";
      case "SWAP":
        return "pendingColor";
      default:
        return "primaryColor";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    // You can implement clipboard functionality here
    console.log("Copy to clipboard:", text);
  };

  const openExplorer = (hash: string) => {
    // You can implement block explorer opening here
    console.log("Open explorer for hash:", hash);
  };

  if (!transaction) {
    return null;
  }

  return (
    <BottomSheet
      ref={ref}
      index={visible ? 0 : -1}
      snapPoints={["80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      enableOverDrag={false}
      enableHandlePanningGesture={true}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={4}
            bg="secondaryBackgroundColor"
            width={50}
            borderRadius={2}
          />
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
          paddingTop: 20,
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <Box alignItems="center" marginBottom="xl">
          <CustomText
            variant="header"
            fontSize={24}
            color="headerTextColor"
            marginBottom="s"
          >
            {getTransactionType(transaction.direction)}
          </CustomText>
          <CustomText color="placeholderTextColor" fontSize={14}>
            {formatDate(transaction.timestamp)}
          </CustomText>
        </Box>

        {/* Main Transaction Card */}
        <Box
          backgroundColor="secondaryBackgroundColor"
          borderRadius={16}
          padding="l"
          alignItems="center"
          marginBottom="xl"
        >
          {/* Token Icon */}
          <CryptoIcon
            image={selectedToken?.image}
            size={40}
            symbol={selectedToken?.chainSymbol}
          />

          {/* Amount */}
          <CustomText
            variant="header"
            fontSize={30}
            color="headerTextColor"
            marginVertical="m"
            textAlign="center"
          >
            {transaction.direction === "OUT" ? "-" : "+"}
            {transaction.amount} {transaction.tokenSymbol}
          </CustomText>

          {/* USD Value */}
          <CustomText color="placeholderTextColor" fontSize={16}>
            {PortfolioService.formatCurrency(
              transaction.amount * (selectedToken?.price || 0)
            )}
          </CustomText>
        </Box>

        {/* Transaction Details */}
        <Box
          borderRadius={12}
          padding="m"
          borderWidth={1}
          borderColor="borderColor"
        >
          {/* Direction Details */}
          {transaction.direction === "OUT" && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="m"
              borderBottomWidth={1}
              borderBottomColor="modalBackgroundColor"
            >
              <CustomText color="placeholderTextColor" fontSize={14}>
                Sent To
              </CustomText>
              <Box flexDirection="row" alignItems="center">
                <CustomText
                  color="headerTextColor"
                  fontSize={14}
                  marginRight="s"
                >
                  {transaction.to?.slice(0, 6)}...{transaction.to?.slice(-4)}
                </CustomText>
                <Pressable
                  onPress={() => copyToClipboard(transaction.to || "")}
                >
                  <Copy size={16} color={theme.colors.placeholderTextColor} />
                </Pressable>
              </Box>
            </Box>
          )}

          {transaction.direction === "IN" && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="m"
              borderBottomWidth={1}
              borderBottomColor="modalBackgroundColor"
            >
              <CustomText color="placeholderTextColor" fontSize={14}>
                Received From
              </CustomText>
              <Box flexDirection="row" alignItems="center">
                <CustomText
                  color="headerTextColor"
                  fontSize={14}
                  marginRight="s"
                >
                  {transaction.from?.slice(0, 6)}...
                  {transaction.from?.slice(-4)}
                </CustomText>
                <Pressable
                  onPress={() => copyToClipboard(transaction.from || "")}
                >
                  <Copy size={16} color={theme.colors.placeholderTextColor} />
                </Pressable>
              </Box>
            </Box>
          )}

          {/* Network */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="m"
            borderBottomWidth={1}
            borderBottomColor="modalBackgroundColor"
          >
            <CustomText color="placeholderTextColor" fontSize={14}>
              Network
            </CustomText>
            <Box flexDirection="row" alignItems="center">
              <CryptoIcon
                image={selectedToken?.image}
                size={20}
                symbol={selectedToken?.chainSymbol}
              />
              <CustomText ml="s" color="headerTextColor" fontSize={14}>
                {selectedToken?.chainName || "Unknown Network"}
              </CustomText>
            </Box>
          </Box>

          {/* Network Fee */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="m"
            borderBottomWidth={1}
            borderBottomColor="modalBackgroundColor"
          >
            <CustomText color="placeholderTextColor" fontSize={14}>
              Network Fee
            </CustomText>
            <CustomText color="headerTextColor" fontSize={14}>
              {transaction.fee
                ? `${transaction.fee} ${selectedToken?.chainSymbol}`
                : "N/A"}
            </CustomText>
          </Box>

          {/* Transaction Hash */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="m"
          >
            <CustomText color="placeholderTextColor" fontSize={14}>
              Txn Hash
            </CustomText>
            <Pressable
              onPress={() => openExplorer(transaction.hash || "")}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <CustomText color="headerTextColor" fontSize={14} marginRight="s">
                {transaction.hash?.slice(0, 6)}...{transaction.hash?.slice(-4)}
              </CustomText>
              <ExternalLink
                size={16}
                color={theme.colors.placeholderTextColor}
              />
            </Pressable>
          </Box>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

TransactionDetailsBottomSheet.displayName = "TransactionDetailsBottomSheet";

export default TransactionDetailsBottomSheet;
