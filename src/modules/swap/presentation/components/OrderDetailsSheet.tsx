import icons from "@/assets/icons";
import { TouchableIcon } from "@/components";
import { Box, CustomButton, CustomText } from "@/components/general";
import SwitchTab from "@/components/general/SwitchTab";
import { SIZES } from "@/data";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { CreateOrderResponse } from "../../domain/entities/order.types";
import OverviewDetails from "./OverviewDetails";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.snapToIndex(0),
    close: () => bottomSheetRef.current?.close(),
  }));

  useEffect(() => {
    console.log("djdjd");
    setTimeout(() => {
      bottomSheetRef.current?.close();
      onClose?.();
    }, 5000);
  }, []);

  if (!orderDetails) return null;

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
            source={icons.cancel}
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
              mb="m"
              alignItems="center"
            >
              <CustomText variant="body" color="bodyTextColor" mb="s">
                Order Status
              </CustomText>
              <CustomText
                variant="subheader"
                color={
                  orderDetails?.status === "completed"
                    ? "successColor"
                    : "warningColor"
                }
              >
                {/* {orderDetails?.status?.toUpperCase()} */}
              </CustomText>
            </Box>

            {/* You're Sending */}
            <Box
              bg="secondaryBackgroundColor"
              borderRadius={8}
              p="m"
              mb="m"
              alignItems="center"
            >
              <CustomText variant="body" color="bodyTextColor" mb="s">
                You're Sending
              </CustomText>
              <CustomText variant="subheader">
                {orderDetails?.baseAmount} {orderDetails?.baseCurrency?.symbol}
              </CustomText>
            </Box>

            {/* You Receive */}
            <Box bg="secondaryBackgroundColor" borderRadius={8} p="m" mb="m">
              <Box flexDirection="row" justifyContent="space-between" py="s">
                <CustomText variant="body" color="bodyTextColor">
                  You Receive:
                </CustomText>
                <CustomText>
                  {orderDetails?.targetAmount}{" "}
                  {orderDetails?.targetCurrency?.symbol}
                </CustomText>
              </Box>

              <Box flexDirection="row" justifyContent="space-between" py="s">
                <CustomText variant="body" color="bodyTextColor">
                  Exchange Rate:
                </CustomText>
                <CustomText>
                  1 {orderDetails?.baseCurrency?.symbol} ={" "}
                  {orderDetails?.marketRate}{" "}
                  {orderDetails?.targetCurrency?.symbol}
                </CustomText>
              </Box>

              {orderDetails?.withdrawalAddress && (
                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Sent To:
                  </CustomText>
                  <CustomText numberOfLines={1} style={{ maxWidth: 150 }}>
                    {orderDetails?.withdrawalAddress?.slice(0, 10)}...
                    {orderDetails?.withdrawalAddress?.slice(-6)}
                  </CustomText>
                </Box>
              )}

              <Box flexDirection="row" justifyContent="space-between" py="s">
                <CustomText variant="body" color="bodyTextColor">
                  Order ID:
                </CustomText>
                <CustomText numberOfLines={1} style={{ maxWidth: 150 }}>
                  {orderDetails?.orderId?.slice(0, 8)}...
                  {orderDetails?.orderId?.slice(-8)}
                </CustomText>
              </Box>
            </Box>
            <OverviewDetails orderDetails={orderDetails} />

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
                We will complete your transaction after we confirm receipt of
                your deposit. Please keep this order ID for reference.
              </CustomText>
            </Box>
            <CustomButton
              onPress={() => {}}
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
            <Box alignItems="center" mt="m">
              <CustomText variant="subheader" mb="m">
                Order Information
              </CustomText>

              <Box
                width="100%"
                bg="secondaryBackgroundColor"
                borderRadius={8}
                p="m"
              >
                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Order ID:
                  </CustomText>
                  <CustomText>{orderDetails?.orderId}</CustomText>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Status:
                  </CustomText>
                  <CustomText
                    color={
                      orderDetails?.status === "completed"
                        ? "successColor"
                        : "warningColor"
                    }
                  >
                    {orderDetails?.status}
                  </CustomText>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Base Amount:
                  </CustomText>
                  <CustomText>
                    {orderDetails?.baseAmount}{" "}
                    {orderDetails?.baseCurrency?.symbol}
                  </CustomText>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Target Amount:
                  </CustomText>
                  <CustomText>
                    {orderDetails?.targetAmount}{" "}
                    {orderDetails?.targetCurrency?.symbol}
                  </CustomText>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Market Rate:
                  </CustomText>
                  <CustomText>{orderDetails?.marketRate}</CustomText>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Created At:
                  </CustomText>
                  <CustomText>
                    {new Date(orderDetails?.createdAt).toLocaleString()}
                  </CustomText>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="bodyTextColor">
                    Updated At:
                  </CustomText>
                  <CustomText>
                    {new Date(orderDetails?.updatedAt).toLocaleString()}
                  </CustomText>
                </Box>

                {orderDetails?.withdrawalAddress && (
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    py="s"
                  >
                    <CustomText variant="body" color="bodyTextColor">
                      Withdrawal Address:
                    </CustomText>
                    <CustomText numberOfLines={1} style={{ maxWidth: 150 }}>
                      {orderDetails?.withdrawalAddress}
                    </CustomText>
                  </Box>
                )}
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
