import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { usePathname } from "expo-router";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { ZapperSiginBottomSheet } from "@/components";
import { AnimatedGradientBottomSheetRef } from "@/components/bottomsheets/AnimatedGradientBottomSheet";
import ZapLinkBottomSheet from "@/components/bottomsheets/ZapLinkBottomSheet";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { useWallet } from "@/src/core/wallet/wallet-context";
import {
  resetSellState,
  selectSellCreatedOrder,
  selectSellCurrency,
  selectSellStage,
  selectSellToken,
  setSellSelectedBank,
  setSellStage
} from "@/src/modules/sell/presentation/state/sell-slice";
import type {
  OrderDetailsSheetRef,
} from "@/src/modules/swap/presentation/components/OrderDetailsSheet";
import OrderDetailsSheet from "@/src/modules/swap/presentation/components/OrderDetailsSheet";
import SwapProgressSheet from "@/src/modules/swap/presentation/components/SwapProgressSheet";
import { useOrderStatusUpdates } from "@/src/modules/swap/presentation/hooks/useOrderStatusUpdates";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useDispatch, useSelector } from "react-redux";
import BankAccountsBottomSheet from "../BankAccountsBottomSheet";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import AmountStep from "./steps/AmountStep";
import ConfirmingStep from "./steps/ConfirmingStep";
import DetailsStep from "./steps/DetailsStep";
import OrderDetailsStep from "./steps/OrderDetailsStep";
import SelectCurrencyStep from "./steps/SelectCurrencyStep";
import SelectTokenStep from "./steps/SelectTokenStep";
import SuccessStep from "./steps/SuccessStep";

const SellFlowBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const step = useSelector(selectSellStage);
  const createdOrder = useSelector(selectSellCreatedOrder);
  const selectedCurrency = useSelector(selectSellCurrency);
  const selectedToken = useSelector(selectSellToken);
  const { supportedCurrenciesForSwap } = useSupportedCurrencies();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const orderDetailsSheetRef = useRef<OrderDetailsSheetRef>(null);
  const progressSheetRef = useRef<OrderDetailsSheetRef>(null);
  const zapLinkBottomSheetRef = useRef<BottomSheet>(null);
  const bankAccountsBottomSheetRef = useRef<BottomSheet>(null);
  const { isUserLoggedIn, exchangeUserData } = useExchangeAuth();
  const { logoutFromExchange } = useWallet();
  const [isZapperBottomSheetVisible, setIsZapperBottomSheetVisible] = useState(false);
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);

  // Get target currency (fiat) as ISupportedCurrency for BankAccountsBottomSheet
  const targetCurrency = React.useMemo(() => {
    if (!selectedCurrency) return null;
    return supportedCurrenciesForSwap.find(
      (c) => (c.currencyId as any)?.code === selectedCurrency.code
    ) || null;
  }, [selectedCurrency, supportedCurrenciesForSwap]);

  // Order status tracking
  const {
    currentOrder,
    orderStatus,
    progress,
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

  const steps = ["Confirming", "Swapping", "Sending"];

  // Auto-advance to currency selection if token is already selected (from token details page)
  useEffect(() => {
    if (selectedToken && step === "select-token") {
      // Token is pre-selected, skip to currency selection
      dispatch(setSellStage("select-currency"));
    }
  }, [selectedToken, step, dispatch]);

  // Auto-open order details when order is created and close main bottom sheet
  useEffect(() => {
    if (createdOrder) {
      console.log("📦 Order created, opening order details sheet:", createdOrder._id);
      
      // Close the main bottom sheet first
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
      
      // Wait a bit longer to ensure main sheet and its backdrop are fully closed
      // before the order details sheet tries to open
      const timer = setTimeout(() => {
        if (orderDetailsSheetRef.current) {
          console.log("✅ Manually opening order details sheet after main sheet closed");
          orderDetailsSheetRef.current.open();
        }
      }, 800); // Increased delay to ensure main sheet backdrop is gone
      
      return () => clearTimeout(timer);
    }
  }, [createdOrder, ref]);

  // Handle the confirming step animation
  useEffect(() => {
    if (step === "confirm") {
      let index = 0;
      const timer = setInterval(() => {
        if (index < 2) {
          index++;
          setCurrentStepIndex(index);
        } else {
          clearInterval(timer);
          setTimeout(() => dispatch(setSellStage("success")), 1000);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, dispatch]);

  const resetStates = () => {
    dispatch(resetSellState());
    setCurrentStepIndex(0);
    setShowConfirmModal(false);
  };

  const handleClose = () => {
    // Don't reset state if we have a created order - let the order details sheet handle it
    if (!createdOrder) {
      resetStates();
    }
    (ref as React.RefObject<BottomSheetMethods>).current?.close();
  };

  const handleZapAgain = () => {
    resetStates();
  };

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

  const handleOpenBankAccounts = useCallback(() => {
    bankAccountsBottomSheetRef.current?.snapToIndex(0);
  }, []);

  const renderStep = () => {
    switch (step) {
      case "select-token":
        return <SelectTokenStep />;
      case "select-currency":
        return <SelectCurrencyStep />;
      case "amount":
        return <AmountStep onOpenZapLink={handleOpenZapLink} onOpenBankAccounts={handleOpenBankAccounts} />;
      case "order_details":
        return <OrderDetailsStep />;
      case "details":
        return (
          <DetailsStep
            setShowConfirmModal={setShowConfirmModal}
          />
        );
      case "confirm":
        return (
          <ConfirmingStep
            currentStepIndex={currentStepIndex}
            steps={steps}
          />
        );
      case "success":
        return (
          <SuccessStep
            onZapAgain={handleZapAgain}
            onGoToHistory={handleClose}
          />
        );
      default:
        return <SelectTokenStep />;
    }
  };

  return (
    <>
      <BottomSheet
        ref={ref}
        index={-1}
        enableOverDrag={false}
        enableDynamicSizing={false}
        snapPoints={["90%", "95%"]}
        enablePanDownToClose
        bottomInset={bottomInset}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.secondaryBackgroundColor,
        }}
        backgroundStyle={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        backdropComponent={(props: any) => {
          // Hide backdrop immediately when we have a created order
          // This ensures the backdrop doesn't interfere with the order details sheet
          if (createdOrder) {
            return null;
          }
          return (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              pressBehavior="close"
              opacity={0.5}
              enableTouchThrough={false}
            />
          );
        }}
        onChange={(index) => {
          // Don't reset state when closing if we have a created order
          // The order details sheet should handle its own state
          if (index === -1 && !createdOrder) {
            handleClose();
            // handleClose already calls resetStates which resets the state
          }
        }}
      >
        {renderStep()}
      </BottomSheet>

      <ConfirmTransactionModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          dispatch(setSellStage("confirm"));
        }}
      />

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

      <BankAccountsBottomSheet
        ref={bankAccountsBottomSheetRef}
        targetCurrency={targetCurrency}
        onBankAccountSelect={(bankAccount) => {
          dispatch(setSellSelectedBank(bankAccount));
        }}
        onContinue={(bankAccount) => {
          if (bankAccount) {
            dispatch(setSellSelectedBank(bankAccount));
            // Close bank account modal and start order creation
            bankAccountsBottomSheetRef.current?.close();
            // Small delay to ensure modal closes before transitioning
            setTimeout(() => {
              dispatch(setSellStage("order_details"));
            }, 300);
          }
        }}
        onClose={() => {
          bankAccountsBottomSheetRef.current?.close();
        }}
      />

      <OrderDetailsSheet
        ref={orderDetailsSheetRef}
        orderDetails={createdOrder}
        onClose={() => {
          // Reset sell state when order details sheet is closed
          // This ensures the sell flow starts fresh next time
          dispatch(resetSellState());
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

SellFlowBottomSheet.displayName = "SellFlowBottomSheet";
export default SellFlowBottomSheet;
