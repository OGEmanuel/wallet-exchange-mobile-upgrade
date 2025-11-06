import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { exchangeActions } from "@/src/modules/exchange/presentation/state/exchange-slice";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { useDispatch } from "react-redux";
import { Box, CustomText } from "../general";
import SmartImage from "../general/SmartImage";

interface IProps {
  activity?: ExchangeActivityModel;
  // Legacy props for backward compatibility
  type?: "BUY" | "SEND" | "RECIEVD" | "SWAP" | "CONTRACT_INTERACTION";
  amount?: number;
  status?: "PENDING" | "SENT" | "FAILED";
}

const ActivityItemCard = ({
  activity,
  type = "BUY",
  amount = 12.12,
  status = "PENDING",
}: IProps) => {
  const dispatch = useDispatch();
  const { getApproximateAmount, getAmountToReceive } = useUtilities();
  const {
    buyActivityRef,
    sentActivityRef,
    recieveActivityRef,
    approvedActivityRef,
  } = useBottomSheetRefs();

  const handlePress = () => {
    if (activity && approvedActivityRef.current) {
      // Store the selected activity in Redux state
      dispatch(exchangeActions.setSelectedActivity(activity));
      approvedActivityRef.current.expand();
    }
  };

  // Format address to show first 6 and last 4 characters
  const formatAddress = (address?: string) => {
    if (!address) return "0xd5321...de32";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

  // Get status color
  const getStatusColor = (activityStatus?: string) => {
    if (!activityStatus) return { bg: "#6B7280", text: "#FFFFFF" }; // bg-gray-500

    switch (activityStatus.toLowerCase()) {
      case "pending":
      case "deposit_confirming":
      case "deposit_confirmed":
      case "overpaid":
      case "underpaid":
        return { bg: "#EAB308", text: "#000000" }; // bg-yellow-500
      case "withdrawal_confirming":
      case "withdrawal_confirmed":
      case "filled":
      case "completed":
      case "success":
      case "confirmed":
        return { bg: "#10B981", text: "#FFFFFF" }; // bg-green-500
      case "expired":
      case "failed":
      case "error":
      case "cancelled":
        return { bg: "#EF4444", text: "#FFFFFF" }; // bg-red-500
      default:
        return { bg: "#6B7280", text: "#FFFFFF" }; // bg-gray-500
    }
  };

  // Determine transaction type based on activity data
  const getTransactionType = () => {
    if (!activity) return type;

    // Check if it's a buy or sell based on the activity data
    if (activity.buyAmount && activity.buyCurrency) {
      return "BUY";
    } else if (activity.sellAmount && activity.sellCurrency) {
      return "SELL";
    } else if (activity.amountToReceive) {
      return "SWAP";
    }
    return type;
  };

  // Use activity data if available, otherwise fall back to legacy props
  const displayType = getTransactionType();
  const displayAmount = activity?.buyAmount || activity?.sellAmount || activity?.amountToReceive || amount;
  const displayStatus = activity?.status || status;
  const displayCurrency = activity?.buyCurrency?.currencyId?.code || activity?.sellCurrency?.currencyId?.code || "USDT";
  const displayAddress = formatAddress(activity?.withdrawalAccount?.number || activity?.depositAccount?.number || activity?.withdrawalAccount?.walletAddress || activity?.depositAccount?.walletAddress);
  const statusColors = getStatusColor(displayStatus);

  // Calculate USD value
  const usdValue = activity?.buyRate ?
    (activity.buyAmount || 0) * activity.buyRate :
    activity?.sellRate ?
      (activity.sellAmount || 0) * activity.sellRate :
      activity?.rate ?
        (activity.amountToReceive || 0) * activity.rate :
        displayAmount;

  // Get currency image
  // const currencyImage = activity?.buyCurrency?.image || activity?.sellCurrency?.image;
  const currencyImage = activity?.sellCurrency?.currencyId?.isCrypto ? activity?.sellCurrency.currencyId.logo : activity?.withdrawalAccount?.bankId?.icon;
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable
      style={{
        width: "100%",
        height: "auto",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
      }}
      onPress={handlePress}
    >
      <Box flexDirection="row" alignItems="center">
        <Box
          width={32}
          height={32}
          borderRadius={32}
          bg="secondaryBackgroundColor"
          marginRight="m"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
        >
          {currencyImage && !imageError ? (
            <SmartImage
              source={{ uri: currencyImage }}
                width={24}
                height={24}
              borderRadius={12}
                resizeMode="cover"
                onError={() => {
                  console.log("Failed to load currency image:", currencyImage);
                  setImageError(true);
                }}
              />
          ) : currencyImage && imageError ? (
            <CustomText fontSize={10} color="white" fontWeight="bold">
              {displayCurrency?.charAt(0) || "?"}
            </CustomText>
          ) : null}
        </Box>
        <Box>
          <Box flex={1} flexDirection="column">
            <CustomText fontSize={14} fontWeight="500" marginBottom="s" width={150}>
              To {
                activity?.withdrawalAccount?.walletAddress ?
                  abbreviateWalletAddress(activity.withdrawalAccount.walletAddress) :
                  activity?.withdrawalAccount?.holderName || activity?.depositAccount?.holderName || "Unknown"
              }
            </CustomText>
            <CustomText fontSize={12} color="disabledTextColor">
              {activity?.childOrder?.createdAt
                ? formatDate(activity.childOrder.createdAt)
                : activity?.createdAt
                  ? formatDate(activity.createdAt)
                  : "Unknown time"
              }
            </CustomText>
          </Box>
        </Box>
      </Box>
      <Box justifyContent="center" alignItems="flex-end">
        <CustomText variant="bodyMedium" fontSize={12}>
          {/* {displayType === "BUY" || displayType === "RECIEVD" ? "+" : "-"} */}
          {/* {displayAmount?.toFixed(2)} {displayCurrency} */}
          {getApproximateAmount(getAmountToReceive(activity), activity?.sellCurrency?.currencyId?.isCrypto)} {activity?.sellCurrency?.currencyId?.code}
        </CustomText>
        {/* <CustomText variant="bodyMedium" fontSize={10} color="disabledTextColor">
          ${usdValue?.toFixed(2)}
        </CustomText> */}
        <Box
          width={53}
          height={19}
          borderRadius={19}
          justifyContent="center"
          alignItems="center"
          marginLeft="s"
          marginTop="s"
          style={{ backgroundColor: statusColors.bg }}
        >
          <CustomText fontSize={10} style={{ color: statusColors.text }}>
            {displayStatus.charAt(0).toUpperCase()}
            {displayStatus.slice(1).toLowerCase()}
          </CustomText>
        </Box>
      </Box>
    </Pressable>
  );
};

export default ActivityItemCard;
