import Icons from "@/assets/icons";
import { TouchableIcon } from "@/components";
import { Box, CustomButton, CustomText } from "@/components/general";
import SwitchTab from "@/components/general/SwitchTab";
import { SIZES } from "@/data";
import { useChains } from "@/src/core/chains/chains-context";
import {
  formatNumber,
  formatWalletAddress,
} from "@/src/core/utils/format-utils";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CreateOrderResponse } from "../../domain/entities/order.types";
import OverviewDetails from "./OverviewDetails";

const ORDER_STATUSES = {
  PENDING: "PENDING",
  DEPOSIT_CONFIRMING: "DEPOSIT_CONFIRMING",
  DEPOSIT_CONFIRMED: "DEPOSIT_CONFIRMED",
  WITHDRAWAL_CONFIRMING: "WITHDRAWAL_CONFIRMING",
  WITHDRAWAL_CONFIRMED: "WITHDRAWAL_CONFIRMED",
  FILLED: "FILLED",
  OVERPAID: "OVERPAID",
  UNDERPAID: "UNDERPAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
};

interface OrderDetailsSheetProps {
  orderDetails?: CreateOrderResponse;
  onClose?: () => void;
  title?: string;
}

export interface OrderDetailsSheetRef {
  open: () => void;
  close: () => void;
}

const OrderDetailsSheet = forwardRef<
  OrderDetailsSheetRef,
  OrderDetailsSheetProps
>(({ orderDetails, onClose, title = "Order Details" }, ref) => {
  const theme = useTheme<Theme>();
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { getChainBySymbol } = useChains();

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.snapToIndex(0),
    close: () => bottomSheetRef.current?.close(),
  }));

  // Removed auto-close effect - let user manually close the sheet

  if (!orderDetails) return null;

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Address copied to clipboard");
  };

  const isSellCrypto = orderDetails?.sellCurrency?.currencyId?.isCrypto;
  const isBuyCrypto = orderDetails?.buyCurrency?.currencyId?.isCrypto;
  const sellCode = orderDetails?.sellCurrency?.currencyId?.code;
  const sellSymbol = orderDetails?.sellCurrency?.currencyId?.symbol;
  const buyCode = orderDetails?.buyCurrency?.currencyId?.code;
  const buySymbol = orderDetails?.buyCurrency?.currencyId?.symbol;
  const buyChain = getChainBySymbol(orderDetails?.buyCurrency?.chainId?.symbol);
  const sellChain = getChainBySymbol(
    orderDetails?.sellCurrency?.chainId?.symbol
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["90%"]}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      )}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: theme.colors.mainBackgroundColor,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.bodyTextColor,
        width: 32,
      }}
    >
      <BottomSheetView style={{ flex: 1, height: SIZES.height * 0.8 }}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderColor: theme.colors.secondaryBackgroundColor },
          ]}
        >
          <TouchableIcon
            source={Icons.cancel}
            onPress={() => bottomSheetRef.current?.close()}
            width={24}
          />
          <CustomText variant="header2" style={{ fontSize: 16 }}>
            Transaction Details
          </CustomText>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={{
            width: SIZES.width * 0.6,
            alignSelf: "center",
            marginBottom: 20,
          }}
        >
          <SwitchTab
            labels={["Summary", "Details"]}
            activeIndex={activeTab === "summary" ? 0 : 1}
            onPress={(i) => setActiveTab(i === 0 ? "summary" : "details")}
          />
        </View>

        {activeTab === "summary" ? (
          // Summary Tab
          <Box flex={1} px="m">
            {/* Order Status */}
            <Box
              bg="secondaryBackgroundColor"
              borderRadius={8}
              p="m"
              mb="s"
              alignItems="center"
            >
              <CustomText variant="body" color="placeholderTextColor" mb="s">
                YOU SEND
              </CustomText>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                  contentFit="fill"
                  source={
                    orderDetails?.buyCurrency?.currencyId?.logo ||
                    orderDetails?.buyCurrency?.image ||
                    ""
                  }
                />
                <CustomText variant="subheader" style={{ fontSize: 22 }}>
                  {isBuyCrypto
                    ? formatNumber(orderDetails.buyAmount) + " " + buySymbol
                    : buySymbol + formatNumber(orderDetails.buyAmount, 2)}
                </CustomText>
              </View>
            </Box>
            <OverviewDetails
              key={orderDetails?._id}
              orderDetails={orderDetails}
            />

            {/* Info Box */}
            <Box
              bg="warningBackgroundColor"
              borderRadius={4}
              p="m"
              flexDirection="row"
              alignItems="center"
              mb="m"
              mt="m"
            >
              <Box width={2} height="100%" bg="warningColor" mr="s" />
              <CustomText variant="body" flex={1} style={{ fontSize: 12 }}>
                We will complete your transaction of{" "}
                {isSellCrypto
                  ? formatNumber(orderDetails.sellAmount) + " " + sellSymbol
                  : sellSymbol + formatNumber(orderDetails.sellAmount, 2)}{" "}
                after we confirm receipt of your deposit.
              </CustomText>
            </Box>
            <CustomButton
              onPress={() => setActiveTab("details")}
              text="Show Deposit Details"
              color="primary"
              width="auto"
              borderRadius={56}
              paddingHorizontal={12}
              bgColor="#6045FF"
            />
          </Box>
        ) : (
          // Details Tab
          <Box flex={1} px="m">
            <Box alignItems="center">
              {isBuyCrypto && (
                <CustomText fontSize={18} variant="subheader" mb="m">
                  Deposit Address
                </CustomText>
              )}
              {isBuyCrypto ? (
                <Box padding="s" bg="white" mb="m">
                  <QRCode
                    value={orderDetails?.depositAccount?.walletAddress}
                    size={150}
                    color="black"
                    backgroundColor="white"
                  />
                </Box>
              ) : (
                <Box
                  bg="secondaryBackgroundColor"
                  borderRadius={8}
                  p="m"
                  mb="s"
                  alignItems="center"
                  width="100%"
                >
                  <CustomText
                    variant="body"
                    color="placeholderTextColor"
                    mb="s"
                  >
                    YOU SEND
                  </CustomText>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        marginRight: 10,
                      }}
                      contentFit="fill"
                      source={
                        orderDetails?.buyCurrency?.currencyId?.logo ||
                        orderDetails?.buyCurrency?.image ||
                        ""
                      }
                    />
                    <CustomText variant="subheader" style={{ fontSize: 22 }}>
                      {isBuyCrypto
                        ? formatNumber(orderDetails.buyAmount) + " " + buySymbol
                        : buySymbol + formatNumber(orderDetails.buyAmount, 2)}
                    </CustomText>
                  </View>
                </Box>
              )}
              <Box
                width="100%"
                bg="secondaryBackgroundColor"
                borderRadius={8}
                p="m"
                mt="s"
              >
                {!isBuyCrypto && (
                  <CustomText
                    textAlign="center"
                    variant="body"
                    color="bodyTextColor"
                    mb="s"
                  >
                    Make your deposit using the account details provided below.
                  </CustomText>
                )}
                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="placeholderTextColor">
                    {isBuyCrypto ? "Chain:" : "Bank:"}
                  </CustomText>
                  <Box flexDirection="row">
                    <Image
                      source={
                        isBuyCrypto
                          ? buyChain?.nativeCurrencyId?.logo || ""
                          : orderDetails?.depositAccount?.bankId?.icon || ""
                      }
                      style={{ width: 20, height: 20, marginRight: 10 }}
                    />
                    <CustomText>
                      {isBuyCrypto
                        ? buyChain?.name
                        : orderDetails?.depositAccount?.bankId?.name}
                    </CustomText>
                  </Box>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="placeholderTextColor">
                    {isBuyCrypto ? "Address:" : "Account Number:"}
                  </CustomText>
                  <Box flexDirection="row">
                    <CustomText style={{ margin: 0 }}>
                      {isBuyCrypto
                        ? formatWalletAddress(
                            orderDetails?.depositAccount?.walletAddress || "",
                            6,
                            6
                          )
                        : orderDetails?.depositAccount?.number || ""}
                    </CustomText>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(
                          isBuyCrypto
                            ? orderDetails?.depositAccount?.walletAddress || ""
                            : orderDetails?.depositAccount?.number || ""
                        )
                      }
                      style={{ marginLeft: 5 }}
                    >
                      <Image
                        source={Icons.copy}
                        style={{ width: 20, height: 20 }}
                      />
                    </TouchableOpacity>
                  </Box>
                </Box>

                {!isBuyCrypto && (
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    py="s"
                  >
                    <CustomText variant="body" color="placeholderTextColor">
                      Account Name:
                    </CustomText>
                    <Box flexDirection="row">
                      <CustomText style={{ margin: 0 }}>
                        {orderDetails?.depositAccount?.holderName || ""}
                      </CustomText>
                    </Box>
                  </Box>
                )}

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="placeholderTextColor">
                    Tx ID:
                  </CustomText>
                  <CustomText>{orderDetails?._id}</CustomText>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

OrderDetailsSheet.displayName = "OrderDetailsSheet";

export default OrderDetailsSheet;

const styles = StyleSheet.create({
  container: {},
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,

    marginBottom: 8,
  },
});
