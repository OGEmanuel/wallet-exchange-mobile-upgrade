import { Box, PageWrapper } from "@/components/general";
import { AppRootState } from "@/state";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFetchCurrencies } from "../../data/remote/swap-currencies.service";
import { useSwapLogic } from "../hooks/useSwapLogic";
import {
  setBaseCurrency,
  setTargetCurrency,
} from "../state/swap-slice";

// New themed components
import {
  SwapCurrencySelector,
  SwapErrorIndicator,
  SwapExchangeButton,
  SwapReceiveSection,
  SwapSellSection,
  SwapWithdrawalInput,
} from "../components";

export default function SwapComponent() {
  const dispatch = useDispatch();

  // Fetch all currencies
  const { currencies = [], isLoading: currenciesLoading } = useFetchCurrencies({
    includeFiat: true,
    enabled: true,
  });

  const { baseCurrency: sellCurrency, targetCurrency: receiveCurrency } =
    useSelector((state: AppRootState) => state.swap);

  const {
    swapMetaData,
    isTransitioning,
    isBackgroundRefresh,
    fetchingSwapRate,
    isSwapped,
    swapRateError,
    handleSellInputChange,
    handleReceiveInputChange,
    handleSwap,
    triggerDollarCryptoSwap,
    retryFetchSwapRate,
  } = useSwapLogic();

  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [withdrawalAddressError, setWithdrawalAddressError] = useState<
    string | null
  >(null);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [currencyModalType, setCurrencyModalType] = useState<"sell" | "receive">(
    "sell"
  );

  // Set default currencies when currencies are loaded
  useEffect(() => {
    if (currenciesLoading || !currencies.length) return;

    if (!sellCurrency) {
      // Try to set BTC or first crypto as default sell currency
      const btc = currencies.find((c) => c.currencyId?.symbol === "BTC");
      const eth = currencies.find((c) => c.currencyId?.symbol === "ETH");
      const firstCrypto = currencies.find((c) => c.currencyId?.isCrypto);

      dispatch(setBaseCurrency(btc || eth || firstCrypto || currencies[0]));
    }

    if (!receiveCurrency) {
      // Try to set USD or NGN as default receive currency
      const usd = currencies.find((c) => c.currencyId?.code === "USD");
      const ngn = currencies.find((c) => c.currencyId?.symbol === "₦");
      const firstFiat = currencies.find((c) => !c.currencyId?.isCrypto);

      dispatch(setTargetCurrency(usd || ngn || firstFiat || currencies[1]));
    }
  }, [currencies, currenciesLoading, sellCurrency, receiveCurrency, dispatch]);

  const openSupportedCurrenciesModal = (type: "sell" | "receive") => {
    setCurrencyModalType(type);
    setCurrencyModalVisible(true);
  };

  const handleSelectCurrency = (currency: any) => {
    // If the user selects token that is on the other side, swap the tokens
    if (currency._id === sellCurrency?._id && currencyModalType === "receive") {
      handleSwap();
    } else if (
      currency._id === receiveCurrency?._id &&
      currencyModalType === "sell"
    ) {
      handleSwap();
    } else {
      if (currencyModalType === "sell") {
        dispatch(setBaseCurrency(currency));
      } else {
        dispatch(setTargetCurrency(currency));
      }
    }

    setCurrencyModalVisible(false);
  };

  const handleWithdrawalAddressChange = (address: string) => {
    setWithdrawalAddress(address);
    setWithdrawalAddressError(null);
  };

  // Determine if withdrawal address should be shown
  const shouldShowWithdrawalAddress =
    receiveCurrency?.currencyId?.isCrypto === true &&
    !swapRateError &&
    !fetchingSwapRate;

  return (
    <PageWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Error Indicator */}
          <SwapErrorIndicator
            error={swapRateError}
            retry={retryFetchSwapRate}
            retryText="Retry"
            isBackgroundRefresh={isBackgroundRefresh}
          />

          {/* Sell Section */}
          <SwapSellSection
            isSwapped={isSwapped}
            isTransitioning={isTransitioning}
            swapMetaData={swapMetaData}
            triggerDollarCryptoSwap={triggerDollarCryptoSwap}
            openSupportedCurrenciesModal={openSupportedCurrenciesModal}
            isLoading={!sellCurrency || currenciesLoading}
            onInputChange={handleSellInputChange}
            sellInputValue={swapMetaData.sellInputValue}
            sellCurrency={sellCurrency}
            swapRateError={swapRateError}
          />

          {/* Swap Exchange Button */}
          <SwapExchangeButton
            onPress={handleSwap}
            isLoading={fetchingSwapRate}
          />

          {/* Receive Section */}
          <SwapReceiveSection
            isSwapped={isSwapped}
            isTransitioning={isTransitioning}
            openSupportedCurrenciesModal={openSupportedCurrenciesModal}
            isLoading={!receiveCurrency || currenciesLoading}
            onInputChange={handleReceiveInputChange}
            receiveInputValue={swapMetaData.receiveInputValue}
            receiveCurrency={receiveCurrency}
            swapRateError={swapRateError}
          />

          {/* Withdrawal Address Input (for crypto) */}
          {shouldShowWithdrawalAddress && (
            <SwapWithdrawalInput
              value={withdrawalAddress}
              onChangeText={handleWithdrawalAddressChange}
              error={withdrawalAddressError}
            />
          )}

          {/* Additional Info or Action Buttons can be added here */}
          <Box mt="l">
            {/* You can add swap summary, fee information, action button, etc. */}
          </Box>
        </ScrollView>

        {/* Currency Selector Modal */}
        <SwapCurrencySelector
          visible={currencyModalVisible}
          onClose={() => setCurrencyModalVisible(false)}
          currencies={currencies}
          selectedCurrency={
            currencyModalType === "sell" ? sellCurrency : receiveCurrency
          }
          onSelect={handleSelectCurrency}
          title={`Select ${
            currencyModalType === "sell" ? "Sell" : "Receive"
          } Currency`}
        />
      </KeyboardAvoidingView>
    </PageWrapper>
  );
}
