import icons from "@/assets/icons";
import { TouchableIcon } from "@/components";
import { SIZES } from "@/data";
import { useSocketConnection } from "@/src/core/websocket/useSocketConnection";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
    const { subscribeToOrderStatus, isConnected } = useSocketConnection();
    
    // Local state for order status, progress, and current step
    const [currentOrderStatus, setCurrentOrderStatus] = useState<string>(orderStatus || "PENDING");
    const [currentProgress, setCurrentProgress] = useState<number>(progress || 0);
    const [currentStepName, setCurrentStepName] = useState<string>(currentStep || "Confirming");
    
    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => bottomSheetRef.current?.close(),
    }));

    // Update local state when props change
    useEffect(() => {
      if (orderStatus) {
        setCurrentOrderStatus(orderStatus);
      }
      if (progress !== undefined) {
        setCurrentProgress(progress);
      }
      if (currentStep) {
        setCurrentStepName(currentStep);
      }
    }, [orderStatus, progress, currentStep]);

    /**
     * Calculate progress percentage based on order status
     */
    const calculateProgress = (status: string): number => {
      switch (status) {
        case "PENDING":
          return 0;
        case "DEPOSIT_CONFIRMING":
          return 25;
        case "DEPOSIT_CONFIRMED":
          return 50;
        case "WITHDRAWAL_CONFIRMING":
          return 75;
        case "WITHDRAWAL_CONFIRMED":
          return 90;
        case "FILLED":
          return 100;
        case "FAILED":
        case "EXPIRED":
        case "CANCELLED":
          return 0;
        default:
          return 0;
      }
    };

    /**
     * Map order status to progress step name
     */
    const getProgressStep = (status: string): string => {
      if (status === "DEPOSIT_CONFIRMING" || status === "PENDING") return "Confirming";
      if (status === "DEPOSIT_CONFIRMED" || status === "WITHDRAWAL_CONFIRMING") return "Swapping";
      if (status === "WITHDRAWAL_CONFIRMED") return "Sending";
      if (status === "FILLED") return "Completed";
      return "Confirming";
    };

    /**
     * Map order status to ProgressView status type
     */
    const getProgressViewStatus = (status: string): "confirming" | "swapping" | "sending" => {
      if (status === "DEPOSIT_CONFIRMING" || status === "PENDING") return "confirming";
      if (status === "DEPOSIT_CONFIRMED" || status === "WITHDRAWAL_CONFIRMING") return "swapping";
      if (status === "WITHDRAWAL_CONFIRMED") return "sending";
      return "confirming";
    };

    // Set up socket connection and event listeners
    useEffect(() => {
      if (!isConnected || !orderDetails?._id) {
        return;
      }

      // Subscribe to order status updates
      const unsubscribe = subscribeToOrderStatus((data) => {
        // Extract order ID from various possible fields
        const eventOrderId = data.order?._id || data.transaction?._id || data.transactionId;
        const eventStatus = data.status || data.order?.status || data.transaction?.status;

        // Only process updates for the current order
        if (eventOrderId && eventOrderId !== orderDetails._id) {
          return;
        }

        console.log('Order Status Update:', {
          orderId: eventOrderId,
          status: eventStatus,
          order: data.order || data.transaction
        });

        if (eventStatus) {
          // Update local state
          setCurrentOrderStatus(eventStatus);
          
          const newProgress = calculateProgress(eventStatus);
          setCurrentProgress(newProgress);
          
          const stepName = getProgressStep(eventStatus);
          setCurrentStepName(stepName);
          
          console.log(`[SwapProgressSheet] Order ${eventOrderId} status: ${eventStatus} - Progress: ${newProgress}% - Step: ${stepName}`);
        }
      });

      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    }, [isConnected, subscribeToOrderStatus, orderDetails?._id]);

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
        {/* <ExchangeSocketConnectionIndicator /> */}
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
          {currentOrderStatus === "FILLED" ? (
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
              fromAmount={(orderDetails?.buyAmount || 0).toString()}
              fromCurrency={orderDetails?.buyCurrency?.currencyId?.code || ""}
              toAmount={(orderDetails?.sellAmount || 0).toString()}
              toCurrency={orderDetails?.sellCurrency?.currencyId?.code || ""}
              recipient={"John Doe"}
              network={(() => {})() as string}
              status={getProgressViewStatus(currentOrderStatus)}
              orderDetails={orderDetails}
              progress={currentProgress}
              currentStep={currentStepName}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

SwapProgressSheet.displayName = 'SwapProgressSheet';

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
