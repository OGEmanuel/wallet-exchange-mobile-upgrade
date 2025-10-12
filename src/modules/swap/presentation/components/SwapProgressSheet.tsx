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

interface OrderDetailsSheetProps {
  orderDetails?: CreateOrderResponse;
  onClose?: () => void;
  title?: string;
}

export interface OrderDetailsSheetRef {
  open: () => void;
  close: () => void;
}

const SwapProgressSheet = forwardRef<
  OrderDetailsSheetRef,
  OrderDetailsSheetProps
>(({ orderDetails, onClose, title = "Order Details" }, ref) => {
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
        <ProgressView
          fromAmount={orderDetails?.buyAmount || "0"}
          fromCurrency={baseCurrency?.displayTicker || ""}
          toAmount={orderDetails?.sellAmount || "0"}
          toCurrency={targetCurrency?.displayTicker || ""}
          recipient={"John Doe"}
          network={
            (() => {
              const chainId = orderDetails?.buyCurrency?.chainId;
              if (!chainId) return "Network";
              if (
                typeof chainId === "object" &&
                "name" in chainId &&
                typeof chainId.name === "string"
              ) {
                return chainId.name;
              }
              return String(chainId);
            })() as string
          }
          status="confirming"
          orderDetails={orderDetails}
        />
      </BottomSheetView>
    </BottomSheet>
  );
}); // 👈 this closing parenthesis was missing

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
