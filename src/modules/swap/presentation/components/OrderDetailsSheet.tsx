import Icons from "@/assets/icons";
import { TouchableIcon } from "@/components";
import { Box, CustomButton, CustomText } from "@/components/general";
import SmartImage from "@/components/general/SmartImage";
import SwitchTab from "@/components/general/SwitchTab";
import { SIZES } from "@/data";
import useAppUtilities from "@/hooks/useAppUtilities";
import { useChains } from "@/src/core/chains/chains-context";
import {
  formatWalletAddress,
} from "@/src/core/utils/format-utils";
import { useSocketConnection } from "@/src/core/websocket/useSocketConnection";
import { AppRootState } from "@/state";
import { selectAssetBySupportedCurrencyId } from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSelector } from "react-redux";
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
  onStatusChange?: (newStatus: string) => void;
  title?: string;
}

export interface OrderDetailsSheetRef {
  open: () => void;
  close: () => void;
}

const OrderDetailsSheet = forwardRef<
  OrderDetailsSheetRef,
  OrderDetailsSheetProps
>(({ orderDetails, onClose, onStatusChange, title = "Order Details" }, ref) => {
  const theme = useTheme<Theme>();
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { getChainBySymbol, getChainImage } = useChains();
  const { subscribeToOrderStatus, isConnected, connect } = useSocketConnection();
  const { getApproximateAmount } = useAppUtilities();
  
  // Track initial order status to detect changes
  const initialOrderStatusRef = useRef<string | null>(null);
  
  // Track if we've set up the listener
  const listenerSetupRef = useRef(false);

  // Get order details early for hooks
  const isSellCrypto = orderDetails?.sellCurrency?.currencyId?.isCrypto;
  const isBuyCrypto = orderDetails?.buyCurrency?.currencyId?.isCrypto;
  const buySymbol = orderDetails?.buyCurrency?.currencyId?.symbol;
  const sellSymbol = orderDetails?.sellCurrency?.currencyId?.symbol;
  const buyChain = orderDetails ? getChainBySymbol(orderDetails?.buyCurrency?.chainId?.symbol) : null;
  const sellChain = orderDetails ? getChainBySymbol(orderDetails?.sellCurrency?.chainId?.symbol) : null;

  // Check if deposit is crypto (for buy orders, deposit is crypto; for sell orders, deposit is also crypto)
  const isDepositCrypto = isBuyCrypto || isSellCrypto;
  const depositAddress = orderDetails?.depositAccount?.walletAddress;

  // Determine which currency to use for send (buy currency for buy orders, sell currency for sell orders)
  const sendCurrency = isBuyCrypto ? orderDetails?.buyCurrency : orderDetails?.sellCurrency;
  const sendChain = isBuyCrypto ? buyChain : sellChain;
  const sendCurrencySupportedId = sendCurrency?._id || (sendCurrency as any)?.supportedCurrencyId?._id || (sendCurrency as any)?.supportedCurrencyId;
  
  // Get wallet balance for the currency (must be before early return)
  const walletToken = useSelector((state: AppRootState) => 
    sendCurrencySupportedId ? selectAssetBySupportedCurrencyId(state, sendCurrencySupportedId) : null
  );
  const hasBalance = walletToken && walletToken.balance > 0;

  // Verify currency and chain match (must be before early return)
  const currencyMatches = useMemo(() => {
    if (!walletToken || !sendCurrency || !orderDetails) return false;
    
    // Check if supported currency IDs match
    const walletSupportedId = typeof walletToken.supportedCurrencyId === 'string' 
      ? walletToken.supportedCurrencyId 
      : (walletToken.supportedCurrencyId as any)?._id;
    const orderSupportedId = sendCurrencySupportedId;
    
    if (walletSupportedId !== orderSupportedId) return false;
    
    // Check if chains match
    const walletChainId = walletToken.chainId;
    const orderChainId = sendChain?._id;
    
    return walletChainId === orderChainId;
  }, [walletToken, sendCurrency, sendChain, sendCurrencySupportedId, orderDetails]);

  useImperativeHandle(ref, () => ({
    open: () => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(0);
      }
    },
    close: () => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.close();
      }
    },
  }));

  // Track initial order status when orderDetails changes
  useEffect(() => {
    if (orderDetails) {
      const currentStatus = orderDetails.status || "PENDING";
      initialOrderStatusRef.current = currentStatus;
      console.log("📋 OrderDetailsSheet: Tracking initial order status:", currentStatus, "for order:", orderDetails._id);
    }
  }, [orderDetails]);

  // Ensure socket connection when sheet opens
  useEffect(() => {
    if (orderDetails?._id && !isConnected) {
      console.log("📋 OrderDetailsSheet: Socket not connected, attempting to connect...");
      connect();
    }
  }, [orderDetails?._id, isConnected, connect]);

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

  // Listen for order status changes and dismiss sheet when status changes
  useEffect(() => {
    if (!orderDetails?._id || orderIdsToMatch.length === 0) {
      return;
    }

    // Ensure socket connection is established
    const setupConnection = async () => {
      if (!isConnected) {
        console.log("📋 OrderDetailsSheet: Socket not connected, attempting to connect...");
        try {
          await connect();
        } catch (err) {
          console.warn("📋 OrderDetailsSheet: Failed to connect socket:", err);
        }
      }
    };
    setupConnection();

    // Don't wait for isConnected - SDK subscription should work regardless
    // The ExchangeSocketLibrary subscription will be set up asynchronously
    console.log("📋 OrderDetailsSheet: Setting up socket listener for order:", orderDetails._id, "isConnected:", isConnected);
    console.log("📋 OrderDetailsSheet: Listening for order IDs:", orderIdsToMatch);

    // Subscribe to order status updates
    const unsubscribe = subscribeToOrderStatus((data) => {
      // Extract order ID from various possible fields
      const eventOrderId = data.order?._id || data.transaction?._id || data.transactionId;
      const eventStatus = data.status || data.order?.status || data.transaction?.status;
      
      // Also check nested order structures
      const nestedOrderId = data.order?.childOrder?._id || data.order?.parentOrder?._id;
      const allEventOrderIds = [eventOrderId, nestedOrderId].filter(Boolean);

      console.log("📋 OrderDetailsSheet: Received socket event:", {
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
        console.log("📋 OrderDetailsSheet: Ignoring event - order ID mismatch. Event IDs:", allEventOrderIds, "Expected IDs:", orderIdsToMatch);
        return;
      }

      console.log("📋 OrderDetailsSheet: Processing event for current order:", {
        eventStatus,
        initialStatus: initialOrderStatusRef.current,
        matchedOrderId: allEventOrderIds.find(id => orderIdsToMatch.includes(id)),
      });

      // Check if status has changed from initial status
      if (eventStatus && initialOrderStatusRef.current && eventStatus !== initialOrderStatusRef.current) {
        console.log("📋 OrderDetailsSheet: Order status changed from", initialOrderStatusRef.current, "to", eventStatus, "- dismissing sheet and opening progress");
        
        // Notify parent about status change (so it can open SwapProgressSheet)
        if (onStatusChange) {
          onStatusChange(eventStatus);
        }
        
        // Close the sheet
        if (bottomSheetRef.current) {
          bottomSheetRef.current.close();
        }
        
        // Call onClose callback if provided
        if (onClose) {
          onClose();
        }
        
        // Update the initial status ref to prevent multiple dismissals
        initialOrderStatusRef.current = eventStatus;
      } else if (eventStatus && !initialOrderStatusRef.current) {
        // If we haven't set initial status yet, set it now
        initialOrderStatusRef.current = eventStatus;
        console.log("📋 OrderDetailsSheet: Set initial status:", eventStatus);
      }
    });

    listenerSetupRef.current = true;

    // Cleanup on unmount
    return () => {
      console.log("📋 OrderDetailsSheet: Cleaning up socket listener");
      unsubscribe();
      listenerSetupRef.current = false;
    };
  }, [orderDetails?._id, orderIdsToMatch, subscribeToOrderStatus, onClose, onStatusChange, isConnected, connect]);

  // Always render the BottomSheet so the ref is available, but show empty content when no orderDetails
  if (!orderDetails) {
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
          />
        )}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View />
        </BottomSheetView>
      </BottomSheet>
    );
  }

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Address copied to clipboard");
  };

  // Handle send from wallet navigation
  const handleSendFromWallet = () => {
    if (!depositAddress || !sendChain || !currencyMatches) {
      Alert.alert(
        "Cannot Send",
        "Currency or chain mismatch. Please ensure you're sending the correct currency on the correct chain."
      );
      return;
    }
    
    // Find the token ID from the currency
    const tokenId = sendCurrencySupportedId || sendCurrency?._id || (sendCurrency as any)?.currencyId?._id;
    
    if (tokenId) {
      router.push(`/dashboard/home/send-token?tokenId=${encodeURIComponent(tokenId)}&address=${encodeURIComponent(depositAddress)}`);
    } else {
      Alert.alert("Error", "Unable to determine token ID for sending");
    }
  };

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
          enableTouchThrough={false}
        />
      )}
      onClose={onClose}
      onChange={(index) => {
        // Log when sheet state changes
        console.log("📊 OrderDetailsSheet onChange:", index);
        if (index === -1 && orderDetails) {
          console.log("⚠️ OrderDetailsSheet closed unexpectedly");
        }
      }}
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
                    ? getApproximateAmount(orderDetails.buyAmount, true) + " " + buySymbol
                    : buySymbol + getApproximateAmount(orderDetails.buyAmount, false)}
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
                  ? getApproximateAmount(orderDetails.sellAmount, true) + " " + sellSymbol
                  : sellSymbol + getApproximateAmount(orderDetails.sellAmount, false)}{" "}
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
                        ? getApproximateAmount(orderDetails.buyAmount, true) + " " + buySymbol
                        : buySymbol + getApproximateAmount(orderDetails.buyAmount, false)}
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
                    {isBuyCrypto ? (
                      <Image
                        source={getChainImage(buyChain?._id || "")}
                        style={{ width: 20, height: 20, marginRight: 10 }}
                      />
                    ) : (
                      <SmartImage
                        source={orderDetails?.depositAccount?.bankId?.icon || ""}
                        width={20}
                        height={20}
                        style={{ marginRight: 10 }}
                      />
                    )}
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

                {/* Send from wallet button for crypto deposits (both buy and sell orders) */}
                {isDepositCrypto && depositAddress && (
                  <Box mt="m">
                    <CustomButton
                      text={hasBalance ? "Send from Wallet" : "Insufficient Balance"}
                      onPress={handleSendFromWallet}
                      width="100%"
                      borderRadius={50}
                      bgColor={hasBalance && currencyMatches ? "secondaryColor" : "disabledTextColor"}
                      disabled={!hasBalance || !currencyMatches}
                    />
                    {!currencyMatches && (
                      <CustomText 
                        variant="body" 
                        color="error" 
                        fontSize={12} 
                        textAlign="center" 
                        style={{ marginTop: 8 }}
                      >
                        Currency or chain mismatch
                      </CustomText>
                    )}
                    {!hasBalance && (
                      <CustomText 
                        variant="body" 
                        color="disabledTextColor" 
                        fontSize={12} 
                        textAlign="center" 
                        style={{ marginTop: 8 }}
                      >
                        You don&apos;t have this token in your wallet
                      </CustomText>
                    )}
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
