import TokenSelectionBottomSheet from "@/components/bottomsheets/TokenSelectionBottomSheet";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import {
    Box,
    CustomButton,
    CustomText,
    PageWrapper,
} from "@/components/general";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import {
    useCreateOrder,
    useFetchCurrencies,
} from "@/src/modules/swap";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSwapLogic } from "../hooks/useSwapLogic";
import { swapActions } from "../state/swap-slice";

// New components
import { OrderDetailsSheet } from "../components";
import ErrorIndicator from "../components/ErrorIndicator";
import ReceiveSectionNew from "../components/ReceiveSectionNew";
import SellSectionNew from "../components/SellSectionNew";
import SwapButtonNew from "../components/SwapButtonNew";
import WithdrawalAddressInput from "../components/WithdrawalAddressInput";

const SwapScreenNew = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showBottomSheet } = useAppBottomSheet();
  const { user } = useSelector((state: AppRootState) => state.kyc);

  const [cryptoAddress, setCryptoAddress] = useState("");
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"EXCHANGE" | "WALLET">("EXCHANGE");
  const orderDetailsSheetRef = useRef<any>(null);

  // 🔹 Create order hook
  const {
    createOrder,
    isLoading: isCreatingOrder,
    error: createOrderError,
  } = useCreateOrder();

  // 🔹 Fetch all currencies
  const { currencies = [], isLoading: currenciesLoading } = useFetchCurrencies({
    includeFiat: true,
    enabled: true,
  });

  // 🔹 Swap logic from custom hook
  const {
    swapMetaData,
    isTransitioning,
    isBackgroundRefresh,
    fetchingSwapRate,
    isSwapped,
    swapRateError,
    supportedCurrenciesError,
    sellCurrency,
    receiveCurrency,
    swapRate,
    handleSellInputChange,
    handleReceiveInputChange,
    handleSwap,
    triggerDollarCryptoSwap,
    retryFetchSwapRate,
  } = useSwapLogic();

  // 🔹 Set defaults once currencies load
  useEffect(() => {
    if (currenciesLoading || !currencies.length) return;

    // Set supported currencies in Redux
    dispatch(swapActions.setSupportedCurrencies(currencies));

    const btc = currencies.find((c) => c.currencyId?.symbol === "BTC");
    const eth = currencies.find((c) => c.currencyId?.symbol === "ETH");
    const usdt = currencies.find((c) => c.currencyId?.symbol === "USDT");
    const ngn = currencies.find((c) => c.currencyId?.symbol === "₦");

    if (!sellCurrency && (btc || eth)) {
      dispatch(swapActions.setSellCurrency(btc || eth));
    }

    if (!receiveCurrency && (usdt || ngn)) {
      dispatch(swapActions.setReceiveCurrency(usdt || ngn));
    }
  }, [currencies, currenciesLoading, sellCurrency, receiveCurrency, dispatch]);

  // 🔹 Reusable bottom sheet handler
  const openTokenSelector = useCallback(
    (type: "sell" | "receive") => {
      showBottomSheet({
        component: (
          <TokenSelectionBottomSheet
            title={`Select ${type === "sell" ? "Sell" : "Receive"} Token`}
            onTokenSelect={(token) => {
              // If the user selects token that is on the other side, swap the tokens
              if (
                token._id === sellCurrency?._id &&
                type === "receive"
              ) {
                handleSwap();
              } else if (
                token._id === receiveCurrency?._id &&
                type === "sell"
              ) {
                handleSwap();
              } else {
                if (type === "sell") {
                  dispatch(swapActions.setSellCurrency(token));
                } else {
                  dispatch(swapActions.setReceiveCurrency(token));
                }
              }
            }}
            selectedToken={
              (type === "sell" ? sellCurrency : receiveCurrency)
                ? {
                    symbol:
                      (type === "sell" ? sellCurrency : receiveCurrency)
                        ?.currencyId?.symbol || "",
                    image:
                      (type === "sell" ? sellCurrency : receiveCurrency)
                        ?.image ||
                      (type === "sell" ? sellCurrency : receiveCurrency)
                        ?.currencyId?.logo ||
                      null,
                    balance: `20${
                      (type === "sell" ? sellCurrency : receiveCurrency)
                        ?.currencyId?.symbol || ""
                    }`,
                  }
                : {
                    symbol: "Select",
                    image: require("@/assets/images/btc.png"),
                  }
            }
          />
        ),
        props: {
          snapPoints: ["80%"],
          enablePanDownToClose: true,
          showGradientHandle: true,
          backgroundColor: theme.colors.mainBackgroundColor,
          gradientColors: [
            theme.colors.secondaryBackgroundColor,
            theme.colors.secondaryBackgroundColor,
          ],
        },
      });
    },
    [sellCurrency, receiveCurrency, handleSwap, dispatch]
  );

  // 🔹 Order creation
  const handleContinue = useCallback(async () => {
    if (!sellCurrency || !receiveCurrency) {
      return;
    }

    if (receiveCurrency?.currencyId?.isCrypto && !cryptoAddress.trim()) {
      console.warn("Please enter a receiving address");
      return;
    }

    // Parse amounts from swap metadata
    const sellAmount = parseFloat(
      swapMetaData.sellInputValue.replace(/,/g, "").replace(/\$/g, "")
    );
    const receiveAmount = parseFloat(
      swapMetaData.receiveInputValue.replace(/,/g, "").replace(/\$/g, "")
    );

    if (isNaN(sellAmount) || sellAmount <= 0) {
      console.warn("Invalid sell amount");
      return;
    }

    // Create payload
    const payload: any = {
      buySupportedCurrencyId: receiveCurrency._id || "",
      sellSupportedCurrencyId: sellCurrency._id || "",
      buyAmount: receiveAmount,
    };

    // Add withdrawal address if receive currency is crypto
    if (receiveCurrency?.currencyId?.isCrypto && cryptoAddress.trim()) {
      payload.withdrawalAddress = cryptoAddress;
    }

    console.log("Creating order with payload:", payload);
    const orderResult = await createOrder(payload);

    if (orderResult) {
      console.log("Order created successfully:", orderResult?.data);
      setCreatedOrder(orderResult?.data);
      orderDetailsSheetRef.current?.open();
    }
  }, [
    sellCurrency,
    receiveCurrency,
    cryptoAddress,
    swapMetaData,
    createOrder,
  ]);

  const shouldShowWithdrawalAddress =
    receiveCurrency?.currencyId?.isCrypto === true &&
    !swapRateError &&
    !fetchingSwapRate;

  return (
    <PageWrapper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <CustomText variant="subheader" textAlign="center" mb="m">
            Swap
          </CustomText>

          <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

          {/* Error Indicator */}
          <ErrorIndicator
            error={swapRateError || supportedCurrenciesError || createOrderError}
            retry={retryFetchSwapRate}
            retryText="Retry"
            isBackgroundRefresh={isBackgroundRefresh}
          />

          {/* Sell Section */}
          <SellSectionNew
            isSwapped={isSwapped}
            isTransitioning={isTransitioning}
            swapMetaData={swapMetaData}
            triggerDollarCryptoSwap={triggerDollarCryptoSwap}
            openSupportedCurrenciesModal={openTokenSelector}
            isLoading={!sellCurrency}
            onInputChange={handleSellInputChange}
            sellInputValue={swapMetaData.sellInputValue}
          />

          {/* Swap Button */}
          <SwapButtonNew onPress={handleSwap} isLoading={fetchingSwapRate} />

          {/* Receive Section */}
          <ReceiveSectionNew
            isSwapped={isSwapped}
            isTransitioning={isTransitioning}
            openSupportedCurrenciesModal={openTokenSelector}
            isLoading={!receiveCurrency}
            onInputChange={handleReceiveInputChange}
            receiveInputValue={swapMetaData.receiveInputValue}
          />

          {/* Withdrawal Address Input (for crypto) */}
          {shouldShowWithdrawalAddress && (
            <WithdrawalAddressInput
              value={cryptoAddress}
              onChangeText={setCryptoAddress}
            />
          )}

          {/* Continue Button */}
          <Box mt="l">
            <CustomButton
              text={isCreatingOrder ? "..." : "Zap Now"}
              fontSize={14}
              width="100%"
              height={56}
              borderRadius={56}
              bgColor={theme.colors.primaryColor}
              onPress={handleContinue}
              disabled={
                fetchingSwapRate ||
                isCreatingOrder ||
                !sellCurrency ||
                !receiveCurrency ||
                parseFloat(swapMetaData.sellInputValue.replace(/,/g, "")) <=
                  0 ||
                (receiveCurrency?.currencyId?.isCrypto &&
                  !cryptoAddress.trim())
              }
            />
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Order Details Sheet */}
      <OrderDetailsSheet
        ref={orderDetailsSheetRef}
        orderDetails={createdOrder}
        onClose={() => {
          setCreatedOrder(null);
        }}
        title="Order Created"
      />
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
});

export default SwapScreenNew;

