import { Box, CustomButton, CustomText } from "@/components/general";
import CryptoIcon from "@/components/general/CrptoIcon";
import { useChains } from "@/src/core/chains/chains-context";
import { showErrorToast, showSuccessToast } from "@/src/core/utils/toast-utils";
import OrderDetailsSheet, {
  OrderDetailsSheetRef,
} from "@/src/modules/swap/presentation/components/OrderDetailsSheet";
import SwapProgressSheet, {
  OrderDetailsSheetRef as SwapProgressSheetRef,
} from "@/src/modules/swap/presentation/components/SwapProgressSheet";
import {
  getActualTransactionStatus,
  shouldShowExchangeSummary,
  shouldShowProgressButton,
} from "@/src/modules/swap/presentation/utils/transaction-status-utils";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy } from "lucide-react-native";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView } from "react-native";
import { useSelector } from "react-redux";

interface ApprovedBottomSheetProps {
  onShowProgress?: () => void;
}

const ApprovedBottomSheet = forwardRef<
  BottomSheet,
  ApprovedBottomSheetProps
>(({ onShowProgress }, ref) => {
  const theme = useTheme<Theme>();
  const { selectedActivity } = useSelector(
    (state: AppRootState) => state.exchange
  );
  const {
    getApproximateAmount,
    getAmountToReceive,
    getActualTransactionStatus,
  } = useUtilities();
  const { getChainById } = useChains();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={1}
        />
      ),
      []
    );

    // Get transaction type
    const getTransactionType = () => {
      if (!selectedActivity) return "Transaction";

      const sellIsCrypto =
        selectedActivity.sellCurrency?.currencyId?.isCrypto ?? false;
      const buyIsCrypto =
        selectedActivity.buyCurrency?.currencyId?.isCrypto ?? false;

      // If both are crypto OR both are fiat → Swap
      if (sellIsCrypto === buyIsCrypto) {
        return "Swap";
      }

      // If sell (parent order) is fiat and buy (child order) is crypto → Buy
      if (sellIsCrypto && !buyIsCrypto) {
        return "Buy";
      }

      // If sell (parent order) is crypto and buy (child order) is fiat → Sell
      if (!sellIsCrypto && buyIsCrypto) {
        return "Sell";
      }

      return "Transaction";
    };

    // Format date
    const formatDate = (dateString?: string | Date) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month} ${day}, ${year} ${hours}:${minutes}`;
    };

    const copyToClipboard = async (text: string) => {
      try {
        await Clipboard.setStringAsync(text);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        showSuccessToast("Copied to clipboard");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        showErrorToast("Failed to copy");
      }
    };

    // Handle show progress button press
    const handleShowProgress = () => {
      if (onShowProgress) {
        onShowProgress();
      }
    };

    const displayCurrency =
      selectedActivity?.sellCurrency?.currencyId?.code ||
      selectedActivity?.buyCurrency?.currencyId?.code ||
      "USDT";
    const actualStatus = getActualTransactionStatus(selectedActivity);

    // Get chain information from currencies
    // Buy chain comes from depositAccount (where you're depositing the buy currency)
    // Sell chain comes from withdrawalAccount (where you're withdrawing the sell currency)
    const buyChainId =
      (selectedActivity?.buyCurrency?.chainId as any)?._id ||
      (typeof selectedActivity?.buyCurrency?.chainId === "string"
        ? selectedActivity?.buyCurrency?.chainId
        : null);
    const sellChainId =
      (selectedActivity?.sellCurrency?.chainId as any)?._id ||
      (typeof selectedActivity?.sellCurrency?.chainId === "string"
        ? selectedActivity?.sellCurrency?.chainId
        : null);

    // Try to get chain from buy currency first (deposit account), then sell currency (withdrawal account)
    const buyChain = buyChainId ? getChainById(buyChainId) : null;
    const sellChain = sellChainId ? getChainById(sellChainId) : null;

    // Determine which chain to display (prefer buy chain, fallback to sell chain)
    const displayChain = buyChain || sellChain;

    // Get status color
    const getStatusColor = (activityStatus?: string) => {
      if (!activityStatus) return { bg: "#6B7280", text: theme.colors.white };
      switch (activityStatus.toLowerCase()) {
        case "pending":
        case "deposit_confirming":
        case "deposit_confirmed":
          return { bg: "#EAB308", text: theme.colors.white };
        case "withdrawal_confirming":
        case "withdrawal_confirmed":
        case "filled":
        case "completed":
        case "success":
        case "confirmed":
        case "successful":
          return { bg: "#10B981", text: theme.colors.white };
        case "expired":
        case "failed":
        case "error":
        case "cancelled":
          return { bg: "#EF4444", text: theme.colors.white };
        default:
          return { bg: "#6B7280", text: theme.colors.white };
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["60%", "85%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        style={{
          backgroundColor: theme.colors.mainBackgroundColor,
          zIndex: 1000,
          borderRadius: 12,
          marginBottom: 100, // Add margin to avoid bottom navigation
        }}
        handleComponent={() => (
          <Box
            height={20}
            bg="mainBackgroundColor"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              height={4}
              bg="secondaryBackgroundColor"
              width={50}
              borderRadius={2}
            />
          </Box>
        )}
      >
        <BottomSheetView
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: theme.colors.mainBackgroundColor,
          }}
        >
          <ScrollView
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingTop: 10,
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100, // Move padding to contentContainerStyle for proper scrolling
              flexGrow: 1,
            }}
          >
            {selectedActivity ? (
              <>
                {/* Header */}
                <Box alignItems="center" marginBottom="xl">
                  <CustomText
                    variant="header"
                    fontSize={24}
                    color="headerTextColor"
                    marginBottom="s"
                  >
                    {getTransactionType()}
                  </CustomText>
                  <CustomText color="placeholderTextColor" fontSize={14}>
                    {selectedActivity?.childOrder?.createdAt
                      ? formatDate(selectedActivity.childOrder.createdAt)
                      : selectedActivity?.createdAt
                      ? formatDate(selectedActivity.createdAt)
                      : "Unknown time"}
                  </CustomText>
                </Box>

                {/* Transaction Type Subtitle */}
                <CustomText
                  color="disabledTextColor"
                  fontSize={12}
                  textAlign="center"
                  marginBottom="s"
                >
                  {/* {selectedActivity?.sellAmount && selectedActivity?.sellCurrency && selectedActivity?.buyCurrency
                  ? `Swap ${getApproximateAmount(selectedActivity.sellAmount, selectedActivity.sellCurrency.currencyId?.isCrypto)} ${selectedActivity.sellCurrency.currencyId?.code} for`
                  : getTransactionType()
                } */}
                  {`Swap ${getApproximateAmount(
                    selectedActivity.buyAmount,
                    selectedActivity?.buyCurrency?.currencyId?.isCrypto
                  )} ${selectedActivity.buyCurrency?.currencyId?.code} for`}
                </CustomText>

                {/* Main Transaction Card */}
                <Box
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="s"
                  mb="xl"
                >
                  {/* Currency Icons - Side by Side */}
                  <Box flexDirection="row" alignItems="center" marginBottom="m">
                    {/* Buy Currency Icon */}
                    {selectedActivity?.buyCurrency && (
                      <Box
                        style={{
                          marginRight: selectedActivity?.sellCurrency ? -10 : 0,
                        }}
                        zIndex={1}
                      >
                        <CryptoIcon
                          image={
                            selectedActivity?.buyCurrency?.currencyId?.logo
                          }
                          size={40}
                          symbol={
                            selectedActivity?.buyCurrency?.currencyId?.code
                          }
                        />
                      </Box>
                    )}
                    {/* Sell Currency Icon */}
                    {selectedActivity?.sellCurrency && (
                      <Box zIndex={2}>
                        <CryptoIcon
                          image={
                            selectedActivity?.sellCurrency?.currencyId?.logo
                          }
                          size={40}
                          symbol={
                            selectedActivity?.sellCurrency?.currencyId?.code
                          }
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Amounts Display */}
                  <Box alignItems="center">
                    {/* Sell Amount */}
                    {selectedActivity?.sellAmount &&
                      selectedActivity?.sellCurrency && (
                        <CustomText
                          variant="header"
                          fontSize={32}
                          color="headerTextColor"
                        >
                          +
                          {getApproximateAmount(
                            selectedActivity.sellAmount,
                            selectedActivity.sellCurrency.currencyId?.isCrypto
                          )}{" "}
                          {selectedActivity.sellCurrency.currencyId?.code}
                        </CustomText>
                      )}
                    {/* Fallback if amounts not available */}
                    {!selectedActivity?.buyAmount &&
                      !selectedActivity?.sellAmount &&
                      selectedActivity?.amountToReceive && (
                        <CustomText
                          variant="header"
                          fontSize={32}
                          color="headerTextColor"
                        >
                          {getApproximateAmount(
                            getAmountToReceive(selectedActivity),
                            selectedActivity?.buyCurrency?.currencyId
                              ?.isCrypto ||
                              selectedActivity?.sellCurrency?.currencyId
                                ?.isCrypto
                          )}{" "}
                          {selectedActivity?.buyCurrency?.currencyId?.code ||
                            selectedActivity?.sellCurrency?.currencyId?.code ||
                            displayCurrency}
                        </CustomText>
                      )}
                  </Box>
                </Box>

                {/* Rate Display */}
                {(selectedActivity?.rate ||
                  selectedActivity?.buyRate ||
                  selectedActivity?.sellRate) && (
                  <CustomText
                    color="disabledTextColor"
                    fontSize={12}
                    textAlign="center"
                    marginBottom="xl"
                  >
                    @
                    {getApproximateAmount(
                      selectedActivity?.rate ||
                        selectedActivity?.buyRate ||
                        selectedActivity?.sellRate ||
                        0,
                      true
                    )}{" "}
                    {selectedActivity?.sellCurrency?.currencyId?.code}/
                    {selectedActivity?.buyCurrency?.currencyId?.code}
                  </CustomText>
                )}

                {/* Transaction Details */}
                <Box
                  borderRadius={12}
                  padding="m"
                  borderWidth={1}
                  borderColor="borderColor"
                  mb="l"
                >
                  {/* Transaction ID */}
                  {selectedActivity._id && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        ID
                      </CustomText>
                      <Box flexDirection="row" alignItems="center">
                        <CustomText
                          color="headerTextColor"
                          fontSize={14}
                          marginRight="s"
                        >
                          {selectedActivity._id}
                        </CustomText>
                        <Pressable
                          onPress={() =>
                            copyToClipboard(selectedActivity._id || "")
                          }
                        >
                          <Copy
                            size={16}
                            color={theme.colors.placeholderTextColor}
                          />
                        </Pressable>
                      </Box>
                    </Box>
                  )}

                  {/* Provider Transaction ID / Transaction Hash */}
                  {(() => {
                    // Check multiple possible locations for provider transaction ID
                    const buyProviderTxId = (selectedActivity as any)
                      ?.transactionIds?.[0];

                    const sellProviderTxId =
                      selectedActivity?.childOrder?.transactionIds?.[0];

                    if (buyProviderTxId || sellProviderTxId) {
                      const abbreviateAddress = (address: string) => {
                        if (!address || address.length <= 12) return address;
                        return `${address.slice(0, 8)}...${address.slice(-8)}`;
                      };

                      return (
                        <>
                          <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            paddingVertical="m"
                            borderBottomWidth={1}
                            borderBottomColor="modalBackgroundColor"
                          >
                            <CustomText
                              color="placeholderTextColor"
                              fontSize={14}
                            >
                              Buy Transaction Hash
                            </CustomText>
                            <Box flexDirection="row" alignItems="center">
                              <CustomText
                                color="headerTextColor"
                                fontSize={14}
                                marginRight="s"
                              >
                                {abbreviateAddress(buyProviderTxId)}
                              </CustomText>
                              <Pressable
                                onPress={() =>
                                  copyToClipboard(buyProviderTxId || "")
                                }
                                disabled={!buyProviderTxId}
                              >
                                <Copy
                                  size={16}
                                  color={theme.colors.placeholderTextColor}
                                />
                              </Pressable>
                            </Box>
                          </Box>
                          <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            paddingVertical="m"
                            borderBottomWidth={1}
                            borderBottomColor="modalBackgroundColor"
                          >
                            <CustomText
                              color="placeholderTextColor"
                              fontSize={14}
                            >
                              Sell Transaction Hash
                            </CustomText>
                            <Box flexDirection="row" alignItems="center">
                              <CustomText
                                color="headerTextColor"
                                fontSize={14}
                                marginRight="s"
                              >
                                {abbreviateAddress(sellProviderTxId || "")}
                              </CustomText>
                              <Pressable
                                onPress={() =>
                                  copyToClipboard(sellProviderTxId || "")
                                }
                                disabled={!sellProviderTxId}
                              >
                                <Copy
                                  size={16}
                                  color={theme.colors.placeholderTextColor}
                                />
                              </Pressable>
                            </Box>
                          </Box>
                        </>
                      );
                    }
                    return null;
                  })()}

                  {/* Amount Swapped */}
                  {selectedActivity?.buyAmount &&
                    selectedActivity?.buyCurrency && (
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        paddingVertical="m"
                        borderBottomWidth={1}
                        borderBottomColor="modalBackgroundColor"
                      >
                        <CustomText color="placeholderTextColor" fontSize={14}>
                          Amount Swapped
                        </CustomText>
                        <CustomText color="headerTextColor" fontSize={14}>
                          {getApproximateAmount(
                            selectedActivity.buyAmount,
                            selectedActivity.buyCurrency.currencyId?.isCrypto
                          )}{" "}
                          {selectedActivity.buyCurrency.currencyId?.code}
                        </CustomText>
                      </Box>
                    )}

                  {/* Amount Received */}
                  {selectedActivity?.sellAmount &&
                    selectedActivity?.sellCurrency && (
                      <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        paddingVertical="m"
                        borderBottomWidth={1}
                        borderBottomColor="modalBackgroundColor"
                      >
                        <CustomText color="placeholderTextColor" fontSize={14}>
                          Amount Received
                        </CustomText>
                        <CustomText color="headerTextColor" fontSize={14}>
                          {getApproximateAmount(
                            selectedActivity.sellAmount,
                            selectedActivity.sellCurrency.currencyId?.isCrypto
                          )}{" "}
                          {selectedActivity.sellCurrency.currencyId?.code}
                        </CustomText>
                      </Box>
                    )}

                  {/* Rate */}
                  {(selectedActivity?.rate ||
                    selectedActivity?.buyRate ||
                    selectedActivity?.sellRate) && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Rate
                      </CustomText>
                      <CustomText color="headerTextColor" fontSize={14}>
                        {getApproximateAmount(
                          selectedActivity?.rate ||
                            selectedActivity?.buyRate ||
                            selectedActivity?.sellRate ||
                            0,
                          true
                        )}{" "}
                        {selectedActivity?.sellCurrency?.currencyId?.code ||
                          "USDT"}
                        /
                        {selectedActivity?.buyCurrency?.currencyId?.code ||
                          displayCurrency}
                      </CustomText>
                    </Box>
                  )}

                  {/* Chain */}
                  {displayChain && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Chain
                      </CustomText>
                      <CustomText color="headerTextColor" fontSize={14}>
                        {displayChain.name || displayChain.symbol || "Unknown"}
                      </CustomText>
                    </Box>
                  )}

                  {/* Date */}
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingVertical="m"
                    borderBottomWidth={1}
                    borderBottomColor="modalBackgroundColor"
                  >
                    <CustomText color="placeholderTextColor" fontSize={14}>
                      Date
                    </CustomText>
                    <CustomText color="headerTextColor" fontSize={14}>
                      {selectedActivity?.childOrder?.createdAt
                        ? formatDate(selectedActivity.childOrder.createdAt)
                        : selectedActivity?.createdAt
                        ? formatDate(selectedActivity.createdAt)
                        : "Unknown time"}
                    </CustomText>
                  </Box>

                  {/* Receiver */}
                  {selectedActivity?.withdrawalAccount?.walletAddress && (
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      paddingVertical="m"
                      borderBottomWidth={1}
                      borderBottomColor="modalBackgroundColor"
                    >
                      <CustomText color="placeholderTextColor" fontSize={14}>
                        Receiver
                      </CustomText>
                      <Box
                        flexDirection="row"
                        alignItems="center"
                        flex={1}
                        justifyContent="flex-end"
                      >
                        <CustomText
                          color="headerTextColor"
                          fontSize={14}
                          marginRight="s"
                          numberOfLines={1}
                          flexShrink={1}
                        >
                          {selectedActivity.withdrawalAccount?.walletAddress
                            ? `${selectedActivity.withdrawalAccount.walletAddress.slice(
                                0,
                                6
                              )}...${selectedActivity.withdrawalAccount.walletAddress.slice(
                                -4
                              )}`
                            : "N/A"}
                        </CustomText>
                        <Pressable
                          onPress={() =>
                            copyToClipboard(
                              selectedActivity.withdrawalAccount
                                ?.walletAddress || ""
                            )
                          }
                        >
                          <Copy
                            size={16}
                            color={theme.colors.placeholderTextColor}
                          />
                        </Pressable>
                      </Box>
                    </Box>
                  )}

                  {/* Status */}
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingVertical="m"
                  >
                    <CustomText color="placeholderTextColor" fontSize={14}>
                      Status
                    </CustomText>
                    <Box flexDirection="row" alignItems="center">
                      <Box
                        width={8}
                        height={8}
                        borderRadius={4}
                        style={{
                          backgroundColor: getStatusColor(actualStatus).bg,
                        }}
                        marginRight="s"
                      />
                      <CustomText
                        fontSize={14}
                        style={{ color: getStatusColor(actualStatus).text }}
                      >
                        {actualStatus?.charAt(0).toUpperCase()}
                        {actualStatus?.slice(1).toLowerCase()}
                      </CustomText>
                    </Box>
                  </Box>
                </Box>

                {/* Show Progress Button - Conditionally rendered based on status */}
                {shouldShowProgressButton(selectedActivity) && (
                  <Box marginTop="l" marginBottom="m">
                    <CustomButton
                      text={
                        shouldShowExchangeSummary(selectedActivity)
                          ? "Show Deposit Details"
                          : "View Progress"
                      }
                      onPress={handleShowProgress}
                      width="100%"
                      borderRadius={50}
                      bgColor="secondaryColor"
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box alignItems="center" justifyContent="center" flex={1}>
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="disabledTextColor"
                >
                  No transaction selected
                </CustomText>
              </Box>
            )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ApprovedBottomSheet.displayName = "ApprovedBottomSheet";

/**
 * Map ExchangeActivityModel to CreateOrderResponse format
 * Handles both ExchangeActivityModel and childOrder structures
 */
const mapActivityToOrderDetails = (activity: any): any => {
  if (!activity) return undefined;

  // Use childOrder if available, otherwise use the activity itself
  const order = activity.childOrder || activity;

  // Helper to safely get nested values
  const getValue = (path: string[], defaultValue: any = undefined) => {
    let current: any = order;
    for (const key of path) {
      if (current?.[key] !== undefined && current?.[key] !== null) {
        current = current[key];
      } else {
        current = activity;
        for (const key2 of path) {
          if (current?.[key2] !== undefined && current?.[key2] !== null) {
            current = current[key2];
          } else {
            return defaultValue;
          }
        }
        break;
      }
    }
    return current !== undefined && current !== null ? current : defaultValue;
  };

  // Build the mapped order details
  // Prefer childOrder._id if available, as socket events typically use child order ID
  const childOrderId = activity?.childOrder?._id;
  const parentOrderId = activity?._id;
  const orderId = childOrderId || parentOrderId;
  const mapped: any = {
    _id: orderId,
    // Store both parent and child order IDs for socket matching
    parentOrderId: parentOrderId,
    childOrderId: childOrderId,
    status: getValue(['status'], activity?.status || "PENDING"),
    createdAt: getValue(['createdAt'], activity?.createdAt),
    updatedAt: getValue(['updatedAt'], activity?.updatedAt),
    
    // Amount fields - ensure they're numbers
    buyAmount: typeof getValue(['buyAmount']) === 'number' 
      ? getValue(['buyAmount']) 
      : (typeof activity?.buyAmount === 'number' ? activity.buyAmount : undefined),
    sellAmount: typeof getValue(['sellAmount']) === 'number'
      ? getValue(['sellAmount'])
      : (typeof activity?.sellAmount === 'number' ? activity.sellAmount : undefined),
    lpFee: typeof getValue(['lpFee']) === 'number'
      ? getValue(['lpFee'])
      : (typeof activity?.lpFee === 'number' ? activity.lpFee : 0),
    
    // Currency fields - ensure they have the proper structure
    buyCurrency: order.buyCurrency || activity.buyCurrency,
    sellCurrency: order.sellCurrency || activity.sellCurrency,
    
    // Account fields - merge from both sources
    depositAccount: order.depositAccount || activity.depositAccount || {
      walletAddress: activity.depositAccount?.walletAddress || order.depositAccount?.walletAddress,
      number: activity.depositAccount?.number || order.depositAccount?.number,
      holderName: activity.depositAccount?.holderName || order.depositAccount?.holderName,
      bankId: activity.depositAccount?.bankId || order.depositAccount?.bankId,
    },
    withdrawalAccount: order.withdrawalAccount || activity.withdrawalAccount || {
      walletAddress: activity.withdrawalAccount?.walletAddress || order.withdrawalAccount?.walletAddress,
      number: activity.withdrawalAccount?.number || order.withdrawalAccount?.number,
      holderName: activity.withdrawalAccount?.holderName || order.withdrawalAccount?.holderName,
      bankId: activity.withdrawalAccount?.bankId || order.withdrawalAccount?.bankId,
    },
    
    // Rate fields
    rate: order.rate || activity.rate,
    buyRate: order.buyRate || activity.buyRate,
    sellRate: order.sellRate || activity.sellRate,
    
    // Expiration
    expiresAt: order.expiresAt || activity.expiresAt,
  };

  // Preserve any other important fields from the order
  if (order && typeof order === 'object') {
    Object.keys(order).forEach(key => {
      if (!mapped.hasOwnProperty(key) && key !== 'childOrder') {
        mapped[key] = order[key];
      }
    });
  }

  // Preserve any other important fields from the activity
  if (activity && typeof activity === 'object') {
    Object.keys(activity).forEach(key => {
      if (!mapped.hasOwnProperty(key) && key !== 'childOrder') {
        mapped[key] = activity[key];
      }
    });
  }

  return mapped;
};

// Wrapper component to include OrderDetailsSheet and SwapProgressSheet
const ApprovedBottomSheetWithOrderDetails = forwardRef<
  BottomSheet,
  Record<string, never>
>((props, ref) => {
  const { selectedActivity } = useSelector(
    (state: AppRootState) => state.exchange
  );
  const orderDetailsSheetRef = useRef<OrderDetailsSheetRef>(null);
  const swapProgressSheetRef = useRef<SwapProgressSheetRef>(null);

  // Map selectedActivity to OrderDetailsSheet format
  const orderDetails = useMemo(() => {
    return mapActivityToOrderDetails(selectedActivity);
  }, [selectedActivity]);

  // Handle show progress - route to appropriate component based on status
  const handleShowProgress = useCallback(() => {
    if (!orderDetails) return;

    // If status is PENDING, show Exchange Summary (OrderDetailsSheet)
    if (shouldShowExchangeSummary(selectedActivity)) {
      if (orderDetailsSheetRef.current) {
        orderDetailsSheetRef.current.open();
      }
    } else {
      // Otherwise, show Transaction Progress (SwapProgressSheet)
      if (swapProgressSheetRef.current) {
        swapProgressSheetRef.current.open();
      }
    }
  }, [orderDetails, selectedActivity]);

  // Listen for status changes and automatically switch between sheets
  useEffect(() => {
    if (!selectedActivity) return;

    const actualStatus = getActualTransactionStatus(selectedActivity);
    
    // If status changes from PENDING to DEPOSIT_CONFIRMING, close OrderDetailsSheet and open SwapProgressSheet
    if (actualStatus === "DEPOSIT_CONFIRMING" || actualStatus === "DEPOSIT_CONFIRMED") {
      // Close OrderDetailsSheet if open
      if (orderDetailsSheetRef.current) {
        orderDetailsSheetRef.current.close();
      }
      // Open SwapProgressSheet
      setTimeout(() => {
        if (swapProgressSheetRef.current) {
          swapProgressSheetRef.current.open();
        }
      }, 300); // Small delay for smooth transition
    }
  }, [selectedActivity]);

  // Get current order status for SwapProgressSheet
  const currentOrderStatus = useMemo(() => {
    return selectedActivity?.childOrder?.status || selectedActivity?.status || "PENDING";
  }, [selectedActivity]);

  // Calculate progress based on status
  const getProgressFromStatus = (status: string): number => {
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
      default:
        return 0;
    }
  };

  const progress = getProgressFromStatus(currentOrderStatus);

  // Get current step name
  const getCurrentStep = (status: string): string => {
    if (status === "DEPOSIT_CONFIRMING" || status === "PENDING") return "Confirming";
    if (status === "DEPOSIT_CONFIRMED" || status === "WITHDRAWAL_CONFIRMING") return "Swapping";
    if (status === "WITHDRAWAL_CONFIRMED") return "Sending";
    if (status === "FILLED") return "Completed";
    return "Confirming";
  };

  const currentStep = getCurrentStep(currentOrderStatus);

  return (
    <>
      <ApprovedBottomSheet
        ref={ref}
        onShowProgress={handleShowProgress}
      />
      <OrderDetailsSheet
        ref={orderDetailsSheetRef}
        orderDetails={orderDetails}
        onClose={() => {
          orderDetailsSheetRef.current?.close();
        }}
        onStatusChange={(newStatus) => {
          console.log("📋 ApprovedBottomSheet: Order status changed to", newStatus, "- opening SwapProgressSheet");
          // Close OrderDetailsSheet if still open
          if (orderDetailsSheetRef.current) {
            orderDetailsSheetRef.current.close();
          }
          // Open SwapProgressSheet after a short delay
          setTimeout(() => {
            if (swapProgressSheetRef.current) {
              swapProgressSheetRef.current.open();
            }
          }, 300);
        }}
      />
      <SwapProgressSheet
        ref={swapProgressSheetRef}
        orderDetails={orderDetails}
        orderStatus={currentOrderStatus}
        progress={progress}
        currentStep={currentStep}
        onClose={() => {
          swapProgressSheetRef.current?.close();
        }}
      />
    </>
  );
});

ApprovedBottomSheetWithOrderDetails.displayName =
  "ApprovedBottomSheetWithOrderDetails";

export default ApprovedBottomSheetWithOrderDetails;
