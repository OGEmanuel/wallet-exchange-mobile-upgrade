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
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
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
    const { subscribeToOrderStatus, isConnected, connect } = useSocketConnection();
    
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

    // Get all possible order IDs to match against (parent, child, and current)
    // Check both the stored IDs and nested structures
    const orderIdsToMatch = useMemo(() => {
      if (!orderDetails?._id) return [];
      return [
        orderDetails._id,
        (orderDetails as any)?.childOrderId,
        (orderDetails as any)?.parentOrderId,
        (orderDetails as any)?.childOrder?._id,
        (orderDetails as any)?.parentOrder?._id,
      ].filter(Boolean);
    }, [orderDetails]);

    // Ensure socket connection when sheet opens
    useEffect(() => {
      if (orderDetails?._id && !isConnected) {
        console.log("📊 SwapProgressSheet: Socket not connected, attempting to connect...");
        connect();
      }
    }, [orderDetails?._id, isConnected, connect]);

    // Set up socket connection and event listeners
    useEffect(() => {
      if (!orderDetails?._id || orderIdsToMatch.length === 0) {
        return;
      }

      // Ensure socket connection is established
      const setupConnection = async () => {
        if (!isConnected) {
          console.log("📊 SwapProgressSheet: Socket not connected, attempting to connect...");
          try {
            await connect();
          } catch (err) {
            console.warn("📊 SwapProgressSheet: Failed to connect socket:", err);
          }
        }
      };
      setupConnection();

      // Don't wait for isConnected - SDK subscription should work regardless
      // The ExchangeSocketLibrary subscription will be set up asynchronously
      console.log("📊 SwapProgressSheet: Setting up socket listener for order:", orderDetails._id, "isConnected:", isConnected);
      console.log("📊 SwapProgressSheet: Listening for order IDs:", orderIdsToMatch);

      // Subscribe to order status updates
      const unsubscribe = subscribeToOrderStatus((data) => {
        // Extract order ID from various possible fields
        const eventOrderId = data.order?._id || data.transaction?._id || data.transactionId;
        const eventStatus = data.status || data.order?.status || data.transaction?.status;
        
        // Also check nested order structures
        const nestedOrderId = data.order?.childOrder?._id || data.order?.parentOrder?._id;
        const allEventOrderIds = [eventOrderId, nestedOrderId].filter(Boolean);

        console.log("📊 SwapProgressSheet: Received socket event:", {
          eventOrderId,
          nestedOrderId,
          allEventOrderIds,
          eventStatus,
          currentOrderId: orderDetails._id,
          orderIdsToMatch,
        });

        // Check if the event order ID matches any of our order IDs (parent, child, or current)
        const isMatchingOrder = allEventOrderIds.some(id => 
          orderIdsToMatch.some(matchId => id === matchId)
        );

        if (!isMatchingOrder) {
          console.log("📊 SwapProgressSheet: Ignoring event - order ID mismatch. Event IDs:", allEventOrderIds, "Expected IDs:", orderIdsToMatch);
          return;
        }

        console.log("📊 SwapProgressSheet: Processing event for current order:", {
          eventStatus,
          matchedOrderId: allEventOrderIds.find(id => orderIdsToMatch.includes(id)),
        });

        if (eventStatus) {
          // Update local state
          setCurrentOrderStatus(eventStatus);
          
          const newProgress = calculateProgress(eventStatus);
          setCurrentProgress(newProgress);
          
          const stepName = getProgressStep(eventStatus);
          setCurrentStepName(stepName);
          
          console.log(`[SwapProgressSheet] Order ${allEventOrderIds.find(id => orderIdsToMatch.includes(id))} status: ${eventStatus} - Progress: ${newProgress}% - Step: ${stepName}`);
        }
      });

      // Cleanup on unmount
      return () => {
        console.log("📊 SwapProgressSheet: Cleaning up socket listener");
        unsubscribe();
      };
    }, [orderDetails?._id, orderIdsToMatch, subscribeToOrderStatus, isConnected, connect]);

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
