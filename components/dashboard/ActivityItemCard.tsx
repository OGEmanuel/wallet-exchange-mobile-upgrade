import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { formatWalletAddress } from "@/src/core/utils/format-utils";
import { exchangeActions } from "@/src/modules/exchange/presentation/state/exchange-slice";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import React, { useMemo, useState } from "react";
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
    approvedActivityRef,
  } = useBottomSheetRefs();

  const handlePress = () => {
    if (activity && approvedActivityRef.current) {
      // Store the selected activity in Redux state
      dispatch(exchangeActions.setSelectedActivity(activity));
      approvedActivityRef.current.expand();
    }
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

  // Use activity data if available, otherwise fall back to legacy props
  const displayStatus = activity?.status || status;
  const displayCurrency =
    activity?.buyCurrency?.currencyId?.code ||
    activity?.sellCurrency?.currencyId?.code ||
    "USDT";
  const statusColors = getStatusColor(displayStatus);

  // Get currency images for both buy and sell
  // For crypto: use currency logo, for fiat: use bank icon from banks list
  const sellCurrencyImage = useMemo(() => {
    if (
      activity?.sellCurrency?.currencyId?.isCrypto ||
      activity?.sellCurrency?.chainId
    ) {
      return activity?.sellCurrency?.currencyId?.logo;
    }
    // For fiat, try to get bank icon from the banks list
    return activity?.withdrawalAccount?.bankId?.icon || null;
  }, [activity?.sellCurrency?.currencyId, activity?.withdrawalAccount?.bankId]);

  const buyCurrencyImage = useMemo(() => {
    if (
      activity?.buyCurrency?.currencyId?.isCrypto ||
      activity?.buyCurrency?.chainId
    ) {
      return activity?.buyCurrency?.currencyId?.logo;
    }
    return activity?.depositAccount?.bankId?.icon || null;
  }, [activity?.buyCurrency?.currencyId, activity?.depositAccount?.bankId]);

  // Get currency codes for fallback
  const buyCurrencyCode = activity?.buyCurrency?.currencyId?.code || "?";
  const sellCurrencyCode = activity?.sellCurrency?.currencyId?.code || "?";

  const [sellImageError, setSellImageError] = useState(false);
  const [buyImageError, setBuyImageError] = useState(false);

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
        {/* Currency Images - Side by Side */}
        <Box flexDirection="row" marginRight="m" alignItems="center">
          {/* Buy Currency Image - Always show, even if no image URL */}
          <Box
            width={32}
            height={32}
            borderRadius={32}
            bg="secondaryBackgroundColor"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            style={{
              marginRight: sellCurrencyImage || sellCurrencyCode ? -10 : 0,
            }}
            borderColor="mainBackgroundColor"
            zIndex={1}
          >
            {buyCurrencyImage && !buyImageError ? (
              <SmartImage
                source={{ uri: buyCurrencyImage }}
                width={24}
                height={24}
                borderRadius={12}
                resizeMode="cover"
                onError={() => {
                  console.log(
                    "Failed to load buy currency image:",
                    buyCurrencyImage
                  );
                  setBuyImageError(true);
                }}
              />
            ) : (
              <CustomText fontSize={10} color="white" fontWeight="bold">
                {buyCurrencyCode.charAt(0)}
              </CustomText>
            )}
          </Box>
          {/* Sell Currency Image - Always show if there's a sell currency */}
          {activity?.sellCurrency && (
            <Box
              width={32}
              height={32}
              borderRadius={32}
              bg="secondaryBackgroundColor"
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
              borderWidth={2}
              borderColor="mainBackgroundColor"
              zIndex={2}
            >
              {sellCurrencyImage && !sellImageError ? (
                <SmartImage
                  source={{ uri: sellCurrencyImage }}
                  width={24}
                  height={24}
                  borderRadius={12}
                  resizeMode="cover"
                  onError={() => {
                    console.log(
                      "Failed to load sell currency image:",
                      sellCurrencyImage
                    );
                    setSellImageError(true);
                  }}
                />
              ) : (
                <CustomText fontSize={10} color="white" fontWeight="bold">
                  {sellCurrencyCode.charAt(0)}
                </CustomText>
              )}
            </Box>
          )}
        </Box>
        <Box>
          <Box flex={1} flexDirection="column" justifyContent="center">
            <CustomText
              fontSize={14}
              fontWeight="500"
              marginBottom="s"
              width={150}
            >
              To{" "}
              {activity?.withdrawalAccount?.walletAddress
                ? formatWalletAddress(activity.withdrawalAccount.walletAddress)
                : activity?.withdrawalAccount?.holderName ||
                  activity?.depositAccount?.holderName ||
                  "Unknown"}
            </CustomText>
            <CustomText fontSize={12} color="disabledTextColor">
              {activity?.childOrder?.createdAt
                ? formatDate(activity.childOrder.createdAt)
                : activity?.createdAt
                ? formatDate(activity.createdAt)
                : "Unknown time"}
            </CustomText>
          </Box>
        </Box>
      </Box>
      <Box justifyContent="center" alignItems="flex-end">
        {/* Buy Amount */}
        {activity?.buyAmount && activity?.buyCurrency && (
          <CustomText
            variant="bodyMedium"
            fontSize={12}
            color="disabledTextColor"
            style={{ marginBottom: 4 }}
          >
            -
            {getApproximateAmount(
              activity.buyAmount,
              activity.buyCurrency.currencyId?.isCrypto
            )}{" "}
            {activity.buyCurrency.currencyId?.code}
          </CustomText>
        )}
        {/* Sell Amount */}
        {activity?.sellAmount && activity?.sellCurrency && (
          <CustomText
            variant="bodyMedium"
            fontSize={12}
            style={{ marginBottom: 4 }}
          >
            +
            {getApproximateAmount(
              activity.sellAmount,
              activity.sellCurrency.currencyId?.isCrypto
            )}{" "}
            {activity.sellCurrency.currencyId?.code}
          </CustomText>
        )}
        {/* Fallback to amountToReceive if buy/sell amounts not available */}
        {!activity?.buyAmount &&
          !activity?.sellAmount &&
          activity?.amountToReceive && (
            <CustomText
              variant="bodyMedium"
              fontSize={12}
              style={{ marginBottom: 4 }}
            >
              {getApproximateAmount(
                getAmountToReceive(activity),
                activity?.buyCurrency?.currencyId?.isCrypto ||
                  activity?.sellCurrency?.currencyId?.isCrypto
              )}{" "}
              {activity?.buyCurrency?.currencyId?.code ||
                activity?.sellCurrency?.currencyId?.code ||
                displayCurrency}
            </CustomText>
          )}
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
