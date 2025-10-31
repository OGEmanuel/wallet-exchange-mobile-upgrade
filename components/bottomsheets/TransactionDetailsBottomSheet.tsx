import CryptoIcon from "@/components/general/CrptoIcon";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import { Copy } from "lucide-react-native";
import React, { forwardRef, useCallback } from "react";
import { Pressable } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

interface TransactionDetailsBottomSheetProps {
  activity: ExchangeActivityModel | null;
  onClose?: () => void;
  visible?: boolean;
}

const TransactionDetailsBottomSheet = forwardRef<
  BottomSheet,
  TransactionDetailsBottomSheetProps
>(({ activity, onClose, visible = false }, ref) => {
  const theme = useTheme<Theme>();
  const { getApproximateAmount, getAmountToReceive, getActualTransactionStatus } = useUtilities();

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
  const abbreviateWalletAddress = (walletAddress?: string | null, startLength = 5, endLength = 4): string => {
    if (!walletAddress) return '';
    return walletAddress.slice(0, startLength) + '...' + walletAddress.slice(-endLength);
  };

  // Format date
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // Get transaction type
  const getTransactionType = () => {
    if (!activity) return "Transaction";

    if (activity.buyAmount && activity.buyCurrency) {
      return "Buy";
    } else if (activity.sellAmount && activity.sellCurrency) {
      return "Sell";
    } else if (activity.amountToReceive) {
      return "Swap";
    }
    return "Transaction";
  };

  const copyToClipboard = (text: string) => {
    // You can implement clipboard functionality here
    console.log("Copy to clipboard:", text);
  };

  if (!activity) {
    return null;
  }

  const displayCurrency = activity?.sellCurrency?.currencyId?.code || activity?.buyCurrency?.currencyId?.code || "USDT";
  const actualStatus = getActualTransactionStatus(activity);

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
            {activity?.childOrder?.createdAt
              ? formatDate(activity.childOrder.createdAt)
              : activity?.createdAt
                ? formatDate(activity.createdAt)
                : "Unknown time"}
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
            image={activity?.sellCurrency?.currencyId?.logo}
            size={40}
            symbol={displayCurrency}
          />

          {/* Amount */}
          <CustomText
            variant="header"
            fontSize={30}
            color="headerTextColor"
            marginVertical="m"
            textAlign="center"
          >
            {getApproximateAmount(getAmountToReceive(activity), activity?.sellCurrency?.currencyId?.isCrypto)} {displayCurrency}
          </CustomText>

          {/* Status */}
          <CustomText color="placeholderTextColor" fontSize={16}>
            {actualStatus?.charAt(0).toUpperCase()}{actualStatus?.slice(1).toLowerCase()}
          </CustomText>
        </Box>

        {/* Transaction Details */}
        <Box
          borderRadius={12}
          padding="m"
          borderWidth={1}
          borderColor="borderColor"
        >
          {/* Recipient Details */}
          {(activity?.withdrawalAccount?.walletAddress || activity?.withdrawalAccount?.holderName) && (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="m"
              borderBottomWidth={1}
              borderBottomColor="modalBackgroundColor"
            >
              <CustomText color="placeholderTextColor" fontSize={14}>
                {activity?.withdrawalAccount?.holderName ? "Sent To" : "Recipient"}
              </CustomText>
              <Box flexDirection="row" alignItems="center">
                <CustomText
                  color="headerTextColor"
                  fontSize={14}
                  marginRight="s"
                >
                  {activity?.withdrawalAccount?.walletAddress
                    ? abbreviateWalletAddress(activity.withdrawalAccount.walletAddress)
                    : activity?.withdrawalAccount?.holderName || activity?.depositAccount?.holderName || "Unknown"}
                </CustomText>
                {(activity?.withdrawalAccount?.walletAddress || activity?.depositAccount?.walletAddress) && (
                  <Pressable
                    onPress={() => copyToClipboard(
                      activity?.withdrawalAccount?.walletAddress || 
                      activity?.depositAccount?.walletAddress || 
                      ""
                    )}
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
                image={activity?.sellCurrency?.currencyId?.logo}
                size={20}
                symbol={displayCurrency}
              />
              <CustomText ml="s" color="headerTextColor" fontSize={14}>
                {displayCurrency}
              </CustomText>
            </Box>
          </Box>

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
              {getApproximateAmount(getAmountToReceive(activity), activity?.sellCurrency?.currencyId?.isCrypto)} {displayCurrency}
            </CustomText>
          </Box>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

TransactionDetailsBottomSheet.displayName = "TransactionDetailsBottomSheet";

export default TransactionDetailsBottomSheet;
