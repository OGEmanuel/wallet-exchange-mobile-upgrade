import icons from "@/assets/icons";
import { CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SvgUri } from "react-native-svg";
import useAppUtilities from "../hooks/useAppUtilities";

interface DepositDetailsProps {
  orderDetails: any;
  chainImage?: string;
  copy: (value: string) => void;
}

const DepositDetails: React.FC<DepositDetailsProps> = ({
  orderDetails,
  chainImage = "",
  copy,
}) => {
  const theme = useTheme<Theme>();
  const isCrypto = orderDetails?.buyCurrency.currencyId.isCrypto;
  const { truncateString } = useAppUtilities();
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <CustomText
          variant="header"
          style={[styles.title, { color: theme.colors.bodyTextColor }]}
        >
          {isCrypto ? "Deposit Address" : "Deposit Bank"}
        </CustomText>

        {/* QR Code */}
        <View style={styles.qrWrapper}>
          <QRCode
            value={
              isCrypto
                ? orderDetails?.depositAccount?.walletAddress
                : orderDetails?.depositAccount?.number
            }
            size={180}
            color="black"
            backgroundColor="white"
          />
        </View>

        <View style={styles.detailsContainer}>
          {isCrypto && (
            <View style={[styles.row, { backgroundColor: "#2F333D" }]}>
              <Text
                style={[
                  styles.label,
                  { color: theme.colors.placeholderTextColor },
                ]}
              >
                Chain:
              </Text>
              <View style={styles.rowRight}>
                <Text
                  style={[styles.value, { color: theme.colors.bodyTextColor }]}
                >
                  {orderDetails?.buyCurrency.chainId?.name}
                </Text>
                <View style={styles.iconCircle}>
                  <SvgUri uri={chainImage || ""} width={16} height={16} />
                </View>
              </View>
            </View>
          )}

          {/* Address / Account Number */}
          <View style={[styles.row, { backgroundColor: "#2F333D" }]}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.placeholderTextColor },
              ]}
            >
              {isCrypto ? "Address" : "Account Number"}
            </Text>
            <View style={styles.rowRight}>
              <Text
                numberOfLines={1}
                style={[
                  styles.valueShort,
                  { color: theme.colors.bodyTextColor },
                ]}
              >
                {isCrypto
                  ? truncateString(
                      orderDetails?.depositAccount?.walletAddress,
                      5,
                      5
                    )
                  : orderDetails?.depositAccount?.number}
              </Text>
              <TouchableOpacity
                disabled
                onPress={() =>
                  copy(
                    isCrypto
                      ? orderDetails?.depositAccount?.walletAddress
                      : orderDetails?.depositAccount?.number
                  )
                }
              >
                <Image
                  source={icons.copy}
                  style={[
                    styles.copyIcon,
                    {
                      tintColor: theme.colors.bodyTextColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bank Details (Non-crypto) */}
          {!isCrypto && (
            <>
              <View style={[styles.row, { backgroundColor: "#2F333D" }]}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.colors.placeholderTextColor },
                  ]}
                >
                  Bank Name
                </Text>
                <View style={styles.rowRight}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.valueShort,
                      { color: theme.colors.bodyTextColor },
                    ]}
                  >
                    {orderDetails?.depositAccount?.bankId?.name ||
                      orderDetails?.buyCurrency?.defaultTradesProvider}
                  </Text>
                  <Image
                    source={{ uri: orderDetails?.depositAccount?.bankId?.icon }}
                    style={styles.bankIcon}
                  />
                </View>
              </View>

              <View style={[styles.row, { backgroundColor: "#2F333D" }]}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.colors.placeholderTextColor },
                  ]}
                >
                  Account Name
                </Text>
                <View style={styles.rowRight}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.valueShort,
                      { color: theme.colors.bodyTextColor },
                    ]}
                  >
                    {orderDetails?.depositAccount?.holderName}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {isCrypto && (
          <View style={styles.warningBox}>
            <Text
              style={[
                styles.warningText,
                { color: theme.colors.bodyTextColor },
              ]}
            >
              Please ensure you send your funds to the{" "}
              {orderDetails?.buyCurrency.chainId?.name} network. If you send
              your funds to the wrong network, your funds may be lost.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DepositDetails;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
  },
  innerContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  qrWrapper: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  detailsContainer: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    // substitute for bg-keyPad
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: "#888",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  valueShort: {
    fontSize: 16,
    fontWeight: "500",
    maxWidth: 150,
  },
  copyIcon: {
    width: 20,
    height: 20,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bankIcon: {
    width: 16,
    height: 16,
  },
  warningBox: {
    marginTop: 24,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EAB308", // yellow-500
    backgroundColor: "#57522033",
    width: "100%",
  },
  warningText: {
    fontSize: 14,
    color: "#222",
  },
});
