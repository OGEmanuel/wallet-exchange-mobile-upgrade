import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import useAppUtilities from "../hooks/useAppUtilities";
import BankInfo from "./BankInfo";
import DetailRow from "./DetailRow";
import ExpirationTimer from "./ExpirationTimer";

const OverviewDetails = ({ orderDetails, setActive }: any) => {
  const { getApproximateAmount, truncateString } = useAppUtilities();
  const theme = useTheme<Theme>();

  const symbol = orderDetails?.sellCurrency?.currencyId?.symbol;
  const isCrypto = orderDetails?.sellCurrency?.currencyId?.isCrypto;

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.secondaryBackgroundColor },
        ]}
      >
        <DetailRow label="You Receive:">
          <Text
            style={[styles.walletText, { color: theme.colors.bodyTextColor }]}
          >
            {symbol === "₦" && symbol}
            {getApproximateAmount(
              Number(orderDetails?.childOrder?.amountToReceive ?? "0"),
              isCrypto,
              false
            )}
            {symbol !== "₦" && symbol}
          </Text>
        </DetailRow>

        <DetailRow label="LP Fee:">
          <Text
            style={[styles.walletText, { color: theme.colors.bodyTextColor }]}
          >
            {symbol === "₦" && symbol}
            {getApproximateAmount(Number(0), isCrypto, false)}
            {symbol !== "₦" && symbol}
          </Text>
        </DetailRow>

        <DetailRow label="Sent To:">
          {isCrypto ? (
            <Text
              numberOfLines={1}
              style={[styles.walletText, { color: theme.colors.bodyTextColor }]}
            >
              {truncateString(orderDetails?.withdrawalAccount?.walletAddress)}
            </Text>
          ) : (
            <Text>{orderDetails?.withdrawalAccount?.holderName}</Text>
          )}
        </DetailRow>

        {!isCrypto && (
          <DetailRow label="Bank:">
            <BankInfo
              icon={orderDetails?.withdrawalAccount?.bankId?.icon}
              name={orderDetails?.withdrawalAccount?.bankId?.name}
            />
          </DetailRow>
        )}
        <ExpirationTimer />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 8,
    padding: 12,
  },
  walletText: {
    maxWidth: 150,
    fontWeight: "600",
  },
});

export default OverviewDetails;
