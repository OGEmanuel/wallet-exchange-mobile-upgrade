import icons from "@/assets/icons";
import { TouchableIcon } from "@/components";
import { SIZES } from "@/data";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { CreateOrderResponse } from "../../data/remote";
import { useSwap } from "../hooks";
import ProgressView from "./ProgressView";
import SuccessView from "./SuccessView";

interface OrderDetailsSheetProps {
  orderDetails?: CreateOrderResponse;
  onClose?: () => void;
  title?: string;
  orderStatus?: string;
  progress?: number;
  currentStep?: string;
}

export interface OrderDetailsSheetRef {
  open: () => void;
  close: () => void;
}

const SwapProgressSheet = forwardRef<
  OrderDetailsSheetRef,
  OrderDetailsSheetProps
>(
  (
    {
      orderDetails,
      onClose,
      title = "Order Details",
      orderStatus,
      progress,
      currentStep,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { targetCurrency, baseCurrency } = useSwap();
    const theme = useTheme<Theme>();
    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => bottomSheetRef.current?.close(),
    }));

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

            <View style={{ width: 24 }} />
          </View>
          {orderStatus === "FILLED" ? (
            <SuccessView
              fromAmount={orderDetails?.buyAmount || "0"}
              fromCurrency={orderDetails?.buyCurrency?.currencyId?.code || ""}
              toAmount={orderDetails?.sellAmount}
              toCurrency={orderDetails?.sellCurrency?.currencyId?.code || ""}
              recipient={"John Doe"}
              network={(() => {})() as string}
              transactionTime={orderDetails?.createdAt ? new Date(orderDetails.createdAt).toLocaleTimeString() : ""}
              orderDetails={orderDetails}
            />
          ) : (
            <ProgressView
              key={orderDetails?._id}
              fromAmount={orderDetails?.buyAmount || "0"}
              fromCurrency={orderDetails?.buyCurrency?.currencyId?.code || ""}
              toAmount={orderDetails?.sellAmount}
              toCurrency={orderDetails?.sellCurrency?.currencyId?.code || ""}
              recipient={"John Doe"}
              network={(() => {})() as string}
              status={(() => {
                // Map API order status to ProgressView status type
                if (orderStatus === "DEPOSIT_CONFIRMING" || orderStatus === "PENDING") return "confirming";
                if (orderStatus === "DEPOSIT_CONFIRMED" || orderStatus === "WITHDRAWAL_CONFIRMING") return "swapping";
                if (orderStatus === "WITHDRAWAL_CONFIRMED") return "sending";
                return "confirming";
              })() as any}
              orderDetails={orderDetails}
              progress={progress || 0}
              currentStep={currentStep || "Confirming"}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
); // 👈 this closing parenthesis was missing

export default SwapProgressSheet;

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
