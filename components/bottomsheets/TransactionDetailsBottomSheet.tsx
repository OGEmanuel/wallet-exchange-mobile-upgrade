import CryptoIcon from "@/components/general/CrptoIcon";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { showErrorToast, showSuccessToast } from "@/src/core/utils/toast-utils";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import {
  BlockchainTransaction,
  ExchangeActivityModel,
} from "@zap/blockchain-sdk";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy } from "lucide-react-native";
import React, { forwardRef, useCallback } from "react";
import { Pressable } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface TransactionDetailsBottomSheetProps {
  activity?: ExchangeActivityModel | null;
  transaction?: BlockchainTransaction | null;
  selectedToken?: ProcessedAsset | null;
  onClose?: () => void;
  visible?: boolean;
}

const TransactionDetailsBottomSheet = forwardRef<
  BottomSheet,
  TransactionDetailsBottomSheetProps
>(({ activity, transaction, selectedToken, onClose, visible = false }, ref) => {
  const theme = useTheme<Theme>();
  const {
    getApproximateAmount,
    getAmountToReceive,
    getActualTransactionStatus,
  } = useUtilities();

  // Determine if we're displaying a wallet transaction or exchange activity
  const isWalletTransaction = !!transaction;

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

  // Abbreviate wallet address
  const abbreviateWalletAddress = (
    walletAddress?: string | null,
    startLength = 5,
    endLength = 4
  ): string => {
    if (!walletAddress) return "";
    return (
      walletAddress.slice(0, startLength) +
      "..." +
      walletAddress.slice(-endLength)
    );
  };

  // Format date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // Get transaction type
  const getTransactionType = () => {
    if (isWalletTransaction && transaction) {
      if (transaction.direction === "OUT") return "Sent";
      if (transaction.direction === "IN") return "Received";
      if (transaction.direction === "SELF") return "Self";
      return "Transaction";
    }

    if (activity) {
      if (activity.buyAmount && activity.buyCurrency) {
        return "Buy";
      } else if (activity.sellAmount && activity.sellCurrency) {
        return "Sell";
      } else if (activity.amountToReceive) {
        return "Swap";
      }
    }
    return "Transaction";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showSuccessToast("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      showErrorToast("Failed to copy");
    }
  };

  // Don't render if neither activity nor transaction is provided
  if (!activity && !transaction) {
    return null;
  }

  // Get display currency and status based on type
  const displayCurrency =
    isWalletTransaction && transaction
      ? transaction.tokenSymbol || "Unknown"
      : activity?.sellCurrency?.currencyId?.code ||
        activity?.buyCurrency?.currencyId?.code ||
        "USDT";

  const actualStatus =
    isWalletTransaction && transaction
      ? transaction.status === "SUCCESS"
        ? "Success"
        : transaction.status === "FAILED"
        ? "Failed"
        : transaction.status === "PENDING"
        ? "Pending"
        : "Unknown"
      : getActualTransactionStatus(activity);

  // Get status color based on status
  const getStatusColor = (status?: string) => {
    if (!status) return { bg: "#6B7280", text: "#FFFFFF" }; // gray
    switch (status.toLowerCase()) {
      case "pending":
        return { bg: "#EAB308", text: "#000000" }; // yellow
      case "success":
      case "successful":
      case "completed":
      case "confirmed":
      case "filled":
        return { bg: "#10B981", text: "#FFFFFF" }; // green
      case "failed":
      case "error":
      case "expired":
      case "cancelled":
        return { bg: "#EF4444", text: "#FFFFFF" }; // red
      default:
        return { bg: "#6B7280", text: "#FFFFFF" }; // gray
    }
  };

  const statusColors = getStatusColor(actualStatus);

  // Get transaction amount
  const transactionAmount =
    isWalletTransaction && transaction
      ? transaction.amount || 0
      : getAmountToReceive(activity);

  // Calculate USD value
  const usdValue =
    isWalletTransaction && transaction
      ? (transaction.valueFormatted
          ? parseFloat(transaction.valueFormatted)
          : transaction.amount || 0) * (selectedToken?.price || 0)
      : activity?.buyRate && activity?.buyAmount
      ? activity.buyAmount * activity.buyRate
      : activity?.sellRate && activity?.sellAmount
      ? activity.sellAmount * activity.sellRate
      : activity?.rate && activity?.amountToReceive
      ? activity.amountToReceive * activity.rate
      : transactionAmount * (selectedToken?.price || 0);

  // Get token logo/icon
  const tokenLogo =
    isWalletTransaction && transaction
      ? selectedToken?.image || undefined // Use selected token image if available
      : activity?.sellCurrency?.currencyId?.logo ||
        activity?.buyCurrency?.currencyId?.logo;

  // Get transaction date
  const transactionDate =
    isWalletTransaction && transaction
      ? transaction.timestamp
        ? new Date(transaction.timestamp * 1000)
        : null
      : activity?.childOrder?.createdAt || activity?.createdAt || null;

  // Get chain information
  const chainName = selectedToken?.chainName || "Unknown";
  const chainImage = selectedToken?.chainImage || undefined;
  const chainSymbol = selectedToken?.chainSymbol || "";

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
            {getTransactionType()}
          </CustomText>
          <CustomText color="placeholderTextColor" fontSize={14}>
            {transactionDate ? formatDate(transactionDate) : "Unknown time"}
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
          <CryptoIcon image={tokenLogo} size={30} symbol={displayCurrency} />

          {/* Amount */}
          <CustomText
            variant="header"
            fontSize={25}
            color="headerTextColor"
            marginTop="m"
            textAlign="center"
          >
            {isWalletTransaction && transaction
              ? `${PortfolioService.formatBalance(
                  transaction.valueFormatted
                    ? parseFloat(transaction.valueFormatted)
                    : transaction.amount || 0
                )} ${displayCurrency}`
              : `${getApproximateAmount(
                  transactionAmount,
                  activity?.sellCurrency?.currencyId?.isCrypto || false
                )} ${displayCurrency}`}
          </CustomText>

          {/* USD Value */}
          <CustomText
            color="placeholderTextColor"
            fontSize={14}
            marginVertical="s"
          >
            {PortfolioService.formatCurrency(usdValue)}
          </CustomText>

          {/* Status Badge */}
          <Box
            style={{ backgroundColor: statusColors.bg }}
            borderRadius={16}
            paddingHorizontal="m"
            paddingVertical="s"
            marginTop="s"
          >
            <CustomText
              style={{ color: statusColors.text }}
              fontSize={12}
              fontWeight="600"
              textTransform="capitalize"
            >
              {actualStatus?.charAt(0).toUpperCase()}
              {actualStatus?.slice(1).toLowerCase()}
            </CustomText>
          </Box>
        </Box>

        {/* Transaction Details */}
        <Box
          borderRadius={12}
          padding="m"
          borderWidth={1}
          borderColor="borderColor"
        >
          {/* Recipient/Sender Details */}
          {((isWalletTransaction &&
            transaction &&
            (transaction.from || transaction.to)) ||
            (!isWalletTransaction &&
              (activity?.withdrawalAccount?.walletAddress ||
                activity?.withdrawalAccount?.holderName))) && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="m"
              borderBottomWidth={1}
              borderBottomColor="modalBackgroundColor"
            >
              <CustomText color="placeholderTextColor" fontSize={14}>
                {isWalletTransaction && transaction
                  ? transaction.direction === "OUT"
                    ? "Sent To"
                    : transaction.direction === "IN"
                    ? "From"
                    : "Address"
                  : activity?.withdrawalAccount?.holderName
                  ? "Sent To"
                  : "Recipient"}
              </CustomText>
              <Box flexDirection="row" alignItems="center">
                <CustomText
                  color="headerTextColor"
                  fontSize={14}
                  marginRight="s"
                >
                  {isWalletTransaction && transaction
                    ? transaction.direction === "OUT"
                      ? abbreviateWalletAddress(transaction.to, 7, 7)
                      : transaction.direction === "IN"
                      ? abbreviateWalletAddress(transaction.from, 7, 7)
                      : abbreviateWalletAddress(
                          transaction.to || transaction.from,
                          7,
                          7
                        )
                    : activity?.withdrawalAccount?.walletAddress
                    ? abbreviateWalletAddress(
                        activity.withdrawalAccount.walletAddress,
                        7,
                        7
                      )
                    : activity?.withdrawalAccount?.holderName ||
                      activity?.depositAccount?.holderName ||
                      "Unknown"}
                </CustomText>
                {((isWalletTransaction &&
                  transaction &&
                  (transaction.from || transaction.to)) ||
                  (!isWalletTransaction &&
                    (activity?.withdrawalAccount?.walletAddress ||
                      activity?.depositAccount?.walletAddress))) && (
                  <Pressable
                    onPress={() =>
                      copyToClipboard(
                        isWalletTransaction && transaction
                          ? transaction.direction === "OUT"
                            ? transaction.to
                            : transaction.direction === "IN"
                            ? transaction.from
                            : transaction.to || transaction.from || ""
                          : activity?.withdrawalAccount?.walletAddress ||
                              activity?.depositAccount?.walletAddress ||
                              ""
                      )
                    }
                  >
                    <Copy size={16} color={theme.colors.placeholderTextColor} />
                  </Pressable>
                )}
              </Box>
            </Box>
          )}

          {/* Currency */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="m"
            borderBottomWidth={1}
            borderBottomColor="modalBackgroundColor"
          >
            <CustomText color="placeholderTextColor" fontSize={14}>
              Currency
            </CustomText>
            <Box flexDirection="row" alignItems="center">
              <CryptoIcon
                image={tokenLogo}
                size={20}
                symbol={displayCurrency}
              />
              <CustomText ml="s" color="headerTextColor" fontSize={14}>
                {displayCurrency}
              </CustomText>
            </Box>
          </Box>

          {/* Chain/Network */}
          {chainName && chainName !== "Unknown" && (
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
                {chainImage && (
                  <>
                    <CryptoIcon
                      image={chainImage}
                      size={20}
                      symbol={chainSymbol}
                    />
                    <CustomText ml="s" color="headerTextColor" fontSize={14}>
                      {chainName}
                    </CustomText>
                  </>
                )}
                {!chainImage && (
                  <CustomText color="headerTextColor" fontSize={14}>
                    {chainName}
                  </CustomText>
                )}
              </Box>
            </Box>
          )}

          {/* Amount */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="m"
          >
            <CustomText color="placeholderTextColor" fontSize={14}>
              Amount
            </CustomText>
            <CustomText color="headerTextColor" fontSize={14}>
              {isWalletTransaction && transaction
                ? `${PortfolioService.formatBalance(
                    transaction.valueFormatted
                      ? parseFloat(transaction.valueFormatted)
                      : transaction.amount || 0
                  )} ${displayCurrency}`
                : `${getApproximateAmount(
                    transactionAmount,
                    activity?.sellCurrency?.currencyId?.isCrypto || false
                  )} ${displayCurrency}`}
            </CustomText>
          </Box>

          {/* Transaction Hash (for wallet transactions) */}
          {isWalletTransaction && transaction?.hash && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="m"
              borderTopWidth={1}
              borderTopColor="modalBackgroundColor"
              mt="m"
            >
              <CustomText color="placeholderTextColor" fontSize={14}>
                Transaction Hash
              </CustomText>
              <Box flexDirection="row" alignItems="center">
                <CustomText
                  color="headerTextColor"
                  fontSize={14}
                  marginRight="s"
                >
                  {abbreviateWalletAddress(transaction.hash, 8, 8)}
                </CustomText>
                <Pressable onPress={() => copyToClipboard(transaction.hash)}>
                  <Copy size={16} color={theme.colors.placeholderTextColor} />
                </Pressable>
              </Box>
            </Box>
          )}
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

TransactionDetailsBottomSheet.displayName = "TransactionDetailsBottomSheet";

export default TransactionDetailsBottomSheet;
