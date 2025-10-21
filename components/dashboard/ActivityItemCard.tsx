import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ExchangeActivityModel } from "@zap/blockchain-sdk";
import React from "react";
import { Pressable } from "react-native";
import { Box, CustomText } from "../general";

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
  const {
    buyActivityRef,
    sentActivityRef,
    recieveActivityRef,
    approvedActivityRef,
  } = useBottomSheetRefs();

  const handlePress = () => {
    if (approvedActivityRef.current) {
      approvedActivityRef.current.expand();
    }
  };

  // Format address to show first 6 and last 4 characters
  const formatAddress = (address?: string) => {
    if (!address) return "0xd5321...de32";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    switch (activityStatus?.toUpperCase()) {
      case "COMPLETED":
      case "SUCCESS":
        return { bg: "#023920", text: "#24FE89" };
      case "PENDING":
        return { bg: "#393002", text: "#FEDB24" };
      case "FAILED":
        return { bg: "#390202", text: "#FE2424" };
      default:
        return { bg: "#393002", text: "#FEDB24" };
    }
  };

  // Use activity data if available, otherwise fall back to legacy props
  const displayType = activity?.type || type;
  const displayAmount = activity?.amount || amount;
  const displayStatus = activity?.status || status;
  const displayCurrency = activity?.currency || "USDT";
  const displayAddress = formatAddress(activity?.toAddress);
  const statusColors = getStatusColor(displayStatus);

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
        ></Box>
        <Box>
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            <CustomText fontSize={14} variant="bodyMedium">
              {displayType.charAt(0).toUpperCase() + displayType.slice(1).toLowerCase()}
            </CustomText>
            <Box
              width={53}
              height={19}
              borderRadius={19}
              justifyContent="center"
              alignItems="center"
              marginLeft="s"
              style={{ backgroundColor: statusColors.bg }}
            >
              <CustomText fontSize={10} style={{ color: statusColors.text }}>
                {displayStatus.charAt(0).toUpperCase()}
                {displayStatus.slice(1).toLowerCase()}
              </CustomText>
            </Box>
          </Box>
          <CustomText fontSize={12} color="disabledTextColor">
            {activity?.createdAt 
              ? formatDate(activity.createdAt)
              : `To ${displayAddress}`
            }
          </CustomText>
        </Box>
      </Box>
      <Box justifyContent="center" alignItems="flex-end">
        <CustomText variant="bodyMedium" fontSize={12}>
          {displayType === "BUY" || displayType === "RECIEVD" ? "+" : "-"}
          {displayAmount} {displayCurrency}
        </CustomText>
        <CustomText variant="bodyMedium" fontSize={10} color="disabledTextColor">
          ${activity?.usdValue || displayAmount}
        </CustomText>
      </Box>
    </Pressable>
  );
};

export default ActivityItemCard;
