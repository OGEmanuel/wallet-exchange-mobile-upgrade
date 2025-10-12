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
import { Image } from "expo-image";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { CreateOrderResponse } from "../../domain/entities/order.types";
import DepositDetails from "./DepositDetails";
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
              style={{ paddingTop: 16 }}
              alignItems="center"
            >
              <CustomText variant="body" color="bodyTextColor" mb="s">
                You're Sending
              </CustomText>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  style={{ width: 20, height: 20, borderRadius: 10 }}
                  source={orderDetails?.buyCurrency?.currencyId?.logo || ""}
                />
                <CustomText variant="subheader" style={{ fontSize: 22 }}>
                  {orderDetails?.buyCurrency?.currencyId?.symbol === "₦" &&
                    orderDetails?.buyCurrency?.currencyId?.symbol}{" "}
                  {Number(orderDetails?.buyAmount || "0")}
                  {orderDetails?.buyCurrency?.currencyId?.symbol !== "₦" &&
                    orderDetails?.buyCurrency?.currencyId?.symbol}
                </CustomText>
              </View>
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
          <DepositDetails orderDetails={orderDetails} />
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
