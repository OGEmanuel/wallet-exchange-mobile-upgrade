import { ZapperSiginBottomSheet } from "@/components";
import { AnimatedGradientBottomSheetRef } from "@/components/bottomsheets/AnimatedGradientBottomSheet";
import ZapLinkBottomSheet from "@/components/bottomsheets/ZapLinkBottomSheet";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { useWallet } from "@/src/core/wallet/wallet-context";
import {
  resetBuyState,
  selectBuyCreatedOrder,
  selectBuyStage,
  selectBuyToken,
  setBuyCreatedOrder,
  setBuyStage,
} from "@/src/modules/buy/presentation/state/buy-slice";
import OrderDetailsSheet, {
  OrderDetailsSheetRef,
} from "@/src/modules/swap/presentation/components/OrderDetailsSheet";
import SwapProgressSheet from "@/src/modules/swap/presentation/components/SwapProgressSheet";
import { useOrderStatusUpdates } from "@/src/modules/swap/presentation/hooks/useOrderStatusUpdates";
import { Theme } from "@/theme";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { usePathname } from "expo-router";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AmountStep from "./steps/AmountStep";
import ChainsStep from "./steps/ChainsStep";
import ConfirmedStep from "./steps/ConfirmedStep";
import ConfirmingStep from "./steps/ConfirmingStep";
import OrderDetailsStep from "./steps/OrderDetailsStep";
import SelectCurrencyStep from "./steps/SelectCurrencyStep";
import SelectTokenStep from "./steps/SelectTokenStep";
import TransferDetailsStep from "./steps/TransferDetailsStep";

const SelectBuyTokens = forwardRef<BottomSheet, {}>((props, ref) => {
  const stage = useSelector(selectBuyStage);
  const createdOrder = useSelector(selectBuyCreatedOrder);
  const selectedToken = useSelector(selectBuyToken);
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { supportedCurrenciesForSwap } = useSupportedCurrencies();
  const zapLinkBottomSheetRef = useRef<BottomSheet>(null);
  const { isUserLoggedIn, exchangeUserData } = useExchangeAuth();
  const { logoutFromExchange } = useWallet();
  const [isZapperBottomSheetVisible, setIsZapperBottomSheetVisible] = useState(false);
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);
  const orderDetailsSheetRef = useRef<OrderDetailsSheetRef>(null);
  const progressSheetRef = useRef<OrderDetailsSheetRef>(null);

  // Order status tracking
  const {
    currentOrder,
    orderStatus,
    progress,
    isOrderActive,
    isCompleted,
    isFailed,
    getCurrentStep,
  } = useOrderStatusUpdates({
    orderId: createdOrder?._id,
    onStatusChange: (order, status) => {
      console.log(`Order ${order._id} status changed to: ${status}`);
      // Switch to progress screen when order starts processing
      if (status === "DEPOSIT_CONFIRMING" || status === "DEPOSIT_CONFIRMED") {
        orderDetailsSheetRef.current?.close();
        progressSheetRef.current?.open();
      }
      // Show success screen when order is completed
      if (status === "FILLED") {
        orderDetailsSheetRef.current?.close();
        progressSheetRef.current?.open();
      }
    },
    onProgressUpdate: (order, progressValue) => {
      console.log(`Order ${order._id} progress: ${progressValue}%`);
    },
  });

  // Tab bar height: 90 on iOS, 70 on Android
  const tabBarHeight = Platform.OS === "ios" ? 90 : 70;
  const pathname = usePathname();
  // Use 0 when on token details page (no tab bar), otherwise use tab bar height
  const isTokenDetailsPage = pathname?.includes("/token-details/");
  const bottomInset = isTokenDetailsPage ? 0 : tabBarHeight;

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
        enableTouchThrough={false}
      />
    ),
    []
  );

  const handleConnectZapExchange = useCallback(() => {
    zapLinkBottomSheetRef.current?.close();
    setIsZapperBottomSheetVisible(true);
    setTimeout(() => {
      zapperBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  }, []);

  const handleDisconnectZapExchange = useCallback(async () => {
    try {
      await logoutFromExchange();
      zapLinkBottomSheetRef.current?.close();
    } catch (error) {
      console.error("Logout from exchange failed:", error);
    }
  }, [logoutFromExchange]);

  const handleOpenZapLink = useCallback(() => {
    zapLinkBottomSheetRef.current?.snapToIndex(0);
  }, []);

  // Auto-advance to currency selection if token is already selected (from token details page)
  useEffect(() => {
    if (selectedToken && stage === "crypto_select") {
      // Token is pre-selected, skip to currency selection
      dispatch(setBuyStage("currency_select"));
    }
  }, [selectedToken, stage, dispatch]);

  // Auto-open order details when order is created and close main bottom sheet
  React.useEffect(() => {
    if (createdOrder && orderDetailsSheetRef.current) {
      // Store the created order before resetting state
      const orderToShow = createdOrder;
      // Close the main bottom sheet first
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
      // Reset the buy state so next time it opens from the beginning
      // But preserve the createdOrder for the order details sheet
      dispatch(resetBuyState());
      dispatch(setBuyCreatedOrder(orderToShow));
      // Then open the order details sheet
      setTimeout(() => {
        orderDetailsSheetRef.current?.open();
      }, 300);
    }
  }, [createdOrder, ref, dispatch]);

  const renderComponent = React.useCallback(() => {
    switch (stage) {
      case "crypto_select":
        return <SelectTokenStep />;
      case "currency_select":
        return <SelectCurrencyStep />;
      case "buy":
        return <AmountStep onOpenZapLink={handleOpenZapLink} />;
      case "order_details":
        return <OrderDetailsStep />;
      case "transfer_details":
        return <TransferDetailsStep />;
      case "confirming":
        return <ConfirmingStep />;
      case "confirmed":
        return <ConfirmedStep />;
      case "chains":
        return <ChainsStep />;
    }
  }, [stage, handleOpenZapLink]);

  return (
    <>
    <BottomSheet
      ref={ref}
      index={-1}
        enableOverDrag={false}
        enableDynamicSizing={false}
        snapPoints={["85%", "90%"]}
      enablePanDownToClose
        bottomInset={bottomInset}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.secondaryBackgroundColor,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        backdropComponent={renderBackdrop}
        onChange={(index) => {
          if (index === -1) {
            // Reset state when bottom sheet closes so next time it opens fresh
            dispatch(resetBuyState());
          }
        }}
      >
        {renderComponent()}
    </BottomSheet>
      
      {isZapperBottomSheetVisible && (
        <ZapperSiginBottomSheet
          key="zapper-bottom-sheet"
          ref={zapperBottomSheetRef}
          onContinue={() => {
            zapperBottomSheetRef.current?.close();
            setIsZapperBottomSheetVisible(false);
          }}
          onClose={() => {
            setIsZapperBottomSheetVisible(false);
          }}
        />
      )}

      <ZapLinkBottomSheet
        onDisconnect={handleDisconnectZapExchange}
        onConnect={handleConnectZapExchange}
        isZapLinked={isUserLoggedIn}
        username={exchangeUserData?.username}
        onClose={() => zapLinkBottomSheetRef.current?.close()}
        ref={zapLinkBottomSheetRef}
      />

      <OrderDetailsSheet
        ref={orderDetailsSheetRef}
        orderDetails={createdOrder}
        onClose={() => {
          // Don't automatically open progress sheet - let WebSocket updates handle it
        }}
        title="Order Created"
      />
      <SwapProgressSheet
        ref={progressSheetRef}
        orderDetails={currentOrder || createdOrder}
        onClose={() => {}}
        title="Order Progress"
        orderStatus={orderStatus}
        progress={progress}
        currentStep={getCurrentStep()}
      />
    </>
  );
});

export default SelectBuyTokens;
