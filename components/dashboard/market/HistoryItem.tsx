import { useRouter } from "expo-router";
import React, { memo, useEffect, useState } from "react";
import { Pressable } from "react-native";

import { Box, CustomText } from "@/components/general";
import TokenImage from "./TokenImage";

// Mock interfaces and types
interface TransactionStatus {
  status?: string;
}

interface Order {
  _id?: string;
  createdAt?: string;
  status?: string;
  sellAmount?: number;
  sellCurrency?: {
    currencyId?: {
      symbol?: string;
      code?: string;
      isCrypto?: boolean;
    };
    image?: string;
  };
  withdrawalAccount?: {
    walletAddress?: string;
    holderName?: string;
    bankId?: {
      name?: string;
      icon?: string;
    };
  };
}

// Mock utility functions
const formatCurrencyAmount = (
  amount: number | undefined,
  code?: string
): string => {
  if (!amount) return "0";
  return amount.toLocaleString();
};

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-500";
    case "successful":
    case "filled":
      return "bg-green-500";
    case "failed":
    case "expired":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Mock moment functionality
const formatTime = (dateString?: string): string => {
  if (!dateString) return "00:00 AM";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatStatus = (status: string | undefined): string => {
  if (!status) return "Processing";

  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";
    case "deposit_confirming":
      return "Deposit Confirming";
    case "deposit_confirmed":
      return "Deposit Confirmed";
    case "withdrawal_confirming":
      return "Withdrawal Confirming";
    case "withdrawal_confirmed":
      return "Withdrawal Confirmed";
    case "filled":
      return "Successful";
    case "expired":
      return "Expired";
    case "overpaid":
      return "Overpaid";
    case "underpaid":
      return "Underpaid";
    case "failed":
      return "Failed";
    default:
      return (
        status.charAt(0).toUpperCase() +
        status.split("_").join(" ").slice(1).toLowerCase()
      );
  }
};

interface HistoryItemProps {
  data: Order;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ data }) => {
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (data?._id) {
      setOrderDetails(data);
    }
  }, [data]);

  const isTargetCrypto = orderDetails?.sellCurrency?.currencyId?.isCrypto;

  const handlePress = () => {
    // Hard-coded navigation - replace with actual route when available
    console.log("Navigate to order details:", orderDetails);
  };

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{
        color: "rgba(255,255,255,0.1)",
        borderless: true,
      }}
    >
      <Box
        width="100%"
        height={64}
        paddingHorizontal="s"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="borderColor"
      >
        <Box flexDirection="row" alignItems="center" gap="m">
          <Box height={32} width={32} borderRadius={8} justifyContent="center">
            <TokenImage
              uri={
                isTargetCrypto
                  ? orderDetails?.sellCurrency?.image
                  : orderDetails?.withdrawalAccount?.bankId?.icon
              }
              name={
                isTargetCrypto
                  ? orderDetails?.sellCurrency?.currencyId?.symbol
                  : orderDetails?.withdrawalAccount?.bankId?.name
              }
              size={32}
            />
          </Box>
          <Box gap="s">
            <CustomText
              variant="body"
              fontSize={14}
              numberOfLines={1}
              width={150}
              color="bodyTextColor"
            >
              To{" "}
              {isTargetCrypto
                ? orderDetails?.withdrawalAccount?.walletAddress ??
                  "Unknown Address"
                : orderDetails?.withdrawalAccount?.holderName ??
                  "Unknown Account"}
            </CustomText>
            <CustomText variant="body" fontSize={12} color="disabledTextColor">
              {formatTime(data?.createdAt)}
            </CustomText>
          </Box>
        </Box>

        <Box gap="s" alignItems="flex-end">
          <CustomText
            variant="body"
            fontSize={14}
            numberOfLines={1}
            color="bodyTextColor"
          >
            {data?.sellCurrency?.currencyId?.symbol === "₦" && "₦ "}
            {formatCurrencyAmount(
              data?.sellAmount,
              data?.sellCurrency?.currencyId?.code
            )}{" "}
            {data?.sellCurrency?.currencyId?.symbol !== "₦" &&
              data?.sellCurrency?.currencyId?.symbol}
          </CustomText>
          <Box
            flexDirection="row"
            alignItems="center"
            gap="s"
            alignSelf="flex-end"
          >
            <Box
              width={8}
              height={8}
              borderRadius={4}
              style={{
                backgroundColor: getStatusColor(data?.status ?? "").includes(
                  "green"
                )
                  ? "#10B981"
                  : getStatusColor(data?.status ?? "").includes("red")
                  ? "#EF4444"
                  : getStatusColor(data?.status ?? "").includes("yellow")
                  ? "#F59E0B"
                  : "#6B7280",
              }}
            />
            <CustomText
              variant="body"
              fontSize={12}
              color="disabledTextColor"
              style={{ textTransform: "capitalize" }}
            >
              {formatStatus(data?.status)}
            </CustomText>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
};

export default memo(HistoryItem);
