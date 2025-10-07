import TokenSelectionBottomSheet from "@/components/bottomsheets/TokenSelectionBottomSheet";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
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
  useSwap,
} from "@/src/modules/swap";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { SwapButton, SwapDetailsCard, TokenInputCard } from "../components";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const Swap = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation();
  const { showBottomSheet } = useAppBottomSheet();
  const { user } = useSelector((state: AppRootState) => state.kyc);

  const [cryptoAddress, setCryptoAddress] = useState("");

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
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    isRateLoading,
    marketRate,
    error,
    isLoading,
    activeTab,
    lastEditedField,
    setBaseAmount,
    setBaseCurrency,
    setTargetAmount,
    setTargetCurrency,
    handleBaseAmountChange,
    handleTargetAmountChange,
    handleBaseAmountFormat,
    handleTargetAmountFormat,
    handleSwapCurrencies,
    validateExchange,
    setActiveTab,
  } = useSwap();

  // 🔹 Animations hook
  const {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    handleSwapPress,
  } = useSwapAnimations();

  // 🔹 Set defaults once currencies load
  useEffect(() => {
    if (currenciesLoading || !currencies.length) return;

    const btc = currencies.find((c) => c.currencyId?.symbol === "BTC");
    const eth = currencies.find((c) => c.currencyId?.symbol === "ETH");
    const ngn = currencies.find((c) => c.currencyId?.symbol === "₦");

    if (!baseCurrency && (btc || eth)) {
      setBaseCurrency(btc || eth);
      if (btc && baseAmount === 0) setBaseAmount(0.0025);
    }

    if (!targetCurrency && ngn) {
      setTargetCurrency(ngn);
    }
  }, [currencies, currenciesLoading]);

  // 🔹 Reusable bottom sheet handler
  const openTokenSelector = useCallback(
    (type: "base" | "target") => {
      showBottomSheet({
        component: (
          <TokenSelectionBottomSheet
            title="Select Token"
            onTokenSelect={(token) => {
              type === "base"
                ? setBaseCurrency(token)
                : setTargetCurrency(token);
            }}
            selectedToken={
              (type === "base" ? baseCurrency : targetCurrency)
                ? {
                    symbol:
                      (type === "base" ? baseCurrency : targetCurrency)
                        ?.currencyId?.symbol || "",
                    image:
                      (type === "base" ? baseCurrency : targetCurrency)
                        ?.image ||
                      (type === "base" ? baseCurrency : targetCurrency)
                        ?.currencyId?.logo ||
                      null,
                    balance: `20${
                      (type === "base" ? baseCurrency : targetCurrency)
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
    [baseCurrency, targetCurrency]
  );

  // 🔹 Swap currencies (with animation)
  const handleSwapButtonPress = useCallback(() => {
    handleSwapPress();
    handleSwapCurrencies();
  }, [handleSwapPress, handleSwapCurrencies]);

  // 🔹 Order creation
  const handleContinue = useCallback(async () => {
    if (!validateExchange()) return;

    if (targetCurrency?.currencyId?.isCrypto && !cryptoAddress.trim()) {
      console.warn("Please enter a receiving address");
      return;
    }

    // Create payload based on which field was last edited
    const payload: any = {
      buySupportedCurrencyId: baseCurrency?._id || "",
      sellSupportedCurrencyId: targetCurrency?._id || "",
    };

    // Add withdrawal address if target currency is crypto
    if (targetCurrency?.currencyId?.isCrypto && cryptoAddress.trim()) {
      payload.withdrawalAddress = cryptoAddress;
    }

    // Add the appropriate amount field based on lastEditedField
    if (lastEditedField === "targetAmount") {
      payload.sellAmount = targetAmount;
    } else {
      payload.buyAmount = baseAmount;
    }

    console.log("Creating order with payload:", payload);
    const orderResult = await createOrder(payload);

    if (orderResult) {
      console.log("Order created successfully:", orderResult);
      // Navigate to success screen or order details
      navigation.navigate("History" as never);
    }
  }, [
    baseAmount,
    marketRate,
    user,
    baseCurrency,
    targetCurrency,
    cryptoAddress,
    validateExchange,
    navigation,
    createOrder,
  ]);

  const rateDetails = useMemo(
    () =>
      marketRate && baseCurrency && targetCurrency
        ? {
            rate: `1 ${
              baseCurrency.currencyId?.symbol
            } = ${marketRate.rate?.toFixed(2)} ${
              targetCurrency.currencyId?.symbol
            }`,
            fee: `$${marketRate.rate?.toFixed(6) || "0.000000"}`,
            min: `${targetAmount?.toFixed(2)} ${
              targetCurrency.currencyId?.symbol
            }`,
          }
        : null,
    [marketRate, baseCurrency, targetCurrency, targetAmount]
  );

  return (
    <PageWrapper>
      <Box flex={1} p="m">
        <CustomText variant="subheader" textAlign="center" mb="m">
          Swap
        </CustomText>

        <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

        {error && (
          <Box bg="secondaryBackgroundColor" p="s" borderRadius={8} mb="s">
            <CustomText variant="body" color="bodyTextColor">
              {error}
            </CustomText>
          </Box>
        )}

        {createOrderError && (
          <Box bg="secondaryBackgroundColor" p="s" borderRadius={8} mb="s">
            <CustomText variant="body" color="bodyTextColor">
              {createOrderError}
            </CustomText>
          </Box>
        )}

        <TokenInputCard
          amount={handleBaseAmountFormat()}
          tokenSymbol={baseCurrency?.currencyId?.symbol || "Select"}
          tokenImage={baseCurrency?.image || baseCurrency?.currencyId?.logo}
          showBalance
          showMaxButton
          onTokenSelect={() => openTokenSelector("base")}
          onAmountChange={handleBaseAmountChange}
          animatedStyle={sellContainerStyle}
          isReceive={false}
          isCrypto={baseCurrency?.currencyId?.isCrypto}
        />

        <Box position="relative" mb="m">
          <TokenInputCard
            amount={handleTargetAmountFormat()}
            tokenSymbol={targetCurrency?.currencyId?.symbol || "Select"}
            tokenImage={
              targetCurrency?.image || targetCurrency?.currencyId?.logo
            }
            animatedStyle={receiveContainerStyle}
            isReceive
            usdValue={`$${targetAmount?.toFixed(2) || "0"}`}
            onTokenSelect={() => openTokenSelector("target")}
            onAmountChange={handleTargetAmountChange}
            isCrypto={targetCurrency?.currencyId?.isCrypto}
          />
          <SwapButton
            onPress={handleSwapButtonPress}
            animatedStyle={swapButtonStyle}
            disabled={isAnimating || !baseCurrency || !targetCurrency}
          />
        </Box>

        {rateDetails && (
          <SwapDetailsCard
            provider="Zap Exchange"
            providerIcon={require("@/assets/images/btc.png")}
            zapFee={rateDetails.fee}
            rate={rateDetails.rate}
            minimumReceived={rateDetails.min}
          />
        )}

        {targetCurrency?.currencyId?.isCrypto && (
          <CustomInputWithoutForm
            value={cryptoAddress}
            onChange={setCryptoAddress}
            placeholder="Address"
            autoCapitalize="none"
          />
        )}

        <CustomButton
          text={isCreatingOrder ? "Creating Order..." : "Continue"}
          fontSize={14}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          onPress={handleContinue}
          disabled={
            isLoading ||
            isCreatingOrder ||
            !baseCurrency ||
            !targetCurrency ||
            baseAmount <= 0 ||
            (targetCurrency?.currencyId?.isCrypto && !cryptoAddress.trim())
          }
        />
      </Box>
    </PageWrapper>
  );
};

export default Swap;
