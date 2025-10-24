import { CustomText } from "@/components/general";
import { formatNumber, formatWalletAddress } from "@/src/core/utils/format-utils";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CreateOrderResponse } from "../../domain/entities/order.types";
import BankInfo from "./BankInfo";
import DetailRow from "./DetailRow";
import ExpirationTimer from "./ExpirationTimer";

const OverviewDetails = ({
  orderDetails,
}: {
  orderDetails: CreateOrderResponse;
}) => {
  const theme = useTheme<Theme>();

  const sellSymbol = orderDetails?.sellCurrency?.currencyId?.symbol || "";
  const isSellCrypto =
    orderDetails?.sellCurrency?.currencyId?.isCrypto || false;

  return (
    <>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.secondaryBackgroundColor },
        ]}
      >
        <DetailRow label="You Receive:">
          <CustomText
            style={[styles.walletText, { color: theme.colors.bodyTextColor }]}
          >
            {isSellCrypto
              ? formatNumber(orderDetails.sellAmount) + " " + sellSymbol
              : sellSymbol + formatNumber(orderDetails.sellAmount, 2)}
          </CustomText>
        </DetailRow>

        <DetailRow label="LP Fee:">
          <CustomText fontSize={14}>
            {isSellCrypto
              ? formatNumber(orderDetails.lpFee ?? 0) + " " + sellSymbol
              : sellSymbol + formatNumber(orderDetails.lpFee ?? 0, 2)}
          </CustomText>
        </DetailRow>

        <DetailRow label="Receiver:">
          {isSellCrypto ? (
            <CustomText numberOfLines={1} fontSize={14}>
              {formatWalletAddress(orderDetails?.withdrawalAccount?.walletAddress, 12, 10)}
            </CustomText>
          ) : (
            <CustomText numberOfLines={1} fontSize={14}>
              {orderDetails?.withdrawalAccount?.holderName}
            </CustomText>
          )}
        </DetailRow>

        {!isSellCrypto && (
          <DetailRow label="Bank:">
            <BankInfo
              icon={orderDetails?.withdrawalAccount?.bankId?.icon}
              name={orderDetails?.withdrawalAccount?.bankId?.name}
            />
          </DetailRow>
        )}
        <ExpirationTimer expirationTime={new Date(orderDetails.expiresAt)} />
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
