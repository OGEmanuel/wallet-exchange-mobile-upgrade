import TokenSelectionBottomSheet from "@/components/bottomsheets/TokenSelectionBottomSheet";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import { CustomButton, PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useFetchCurrencies, useSwap } from "@/src/modules/swap";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect } from "react";
import { SupportedCurrency } from "../../domain/entities/currency.types";

// Import modular components
import { AppRootState } from "@/state";
import { useSelector } from "react-redux";
import { SwapButton, SwapDetailsCard, TokenInputCard } from "../components";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const Swap = () => {
  const theme = useTheme<Theme>();
  const { showBottomSheet } = useAppBottomSheet();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  console.log(user);

  // Fetch currencies for selection
  const { currencies, isLoading: currenciesLoading } = useFetchCurrencies({
    includeFiat: true,
    enabled: true,
  });

  // Use the swap hook for state management and exchange rates
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
    setBaseAmount,
    setTargetAmount,
    setBaseCurrency,
    setTargetCurrency,
    handleBaseAmountChange,
    handleTargetAmountChange,
    handleBaseAmountFormat,
    handleTargetAmountFormat,
    handleSwapCurrencies,
    validateExchange,
    setActiveTab,
    refetchRates,
  } = useSwap();

  // Use the custom animation hook
  const {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    handleSwapPress,
  } = useSwapAnimations();

  // Set default currencies when currencies are loaded
  useEffect(() => {
    if (currencies && currencies.length > 0 && !currenciesLoading) {
      // Find BTC currency (with ETH fallback)
      const btcCurrency = currencies.find(
        (currency: SupportedCurrency) => currency.currencyId?.symbol === "BTC"
      );
      const ethCurrency = currencies.find(
        (currency: SupportedCurrency) => currency.currencyId?.symbol === "ETH"
      );
      const ngnCurrency = currencies.find(
        (currency: SupportedCurrency) => currency.currencyId?.symbol === "₦"
      );

      // Set default base currency (BTC with ETH fallback)
      if ((btcCurrency || ethCurrency) && !baseCurrency) {
        const selectedCurrency = btcCurrency || ethCurrency;
        setBaseCurrency(selectedCurrency);

        // Set default BTC amount to 0.0025 when BTC is selected
        if (btcCurrency && baseAmount === 0) {
          setBaseAmount(0.0025);
        }
      }

      // Set default target currency (NGN)
      if (ngnCurrency && !targetCurrency) {
        setTargetCurrency(ngnCurrency);
      }
    }
  }, [
    currencies,
    currenciesLoading,
    baseCurrency,
    targetCurrency,
    baseAmount,
    setBaseCurrency,
    setTargetCurrency,
    setBaseAmount,
  ]);

  // Handle token selection for base currency
  const handleBaseTokenSelect = () => {
    showBottomSheet({
      component: (
        <TokenSelectionBottomSheet
          onTokenSelect={(token: any) => {
            setBaseCurrency(token);
          }}
          selectedToken={
            baseCurrency
              ? {
                  symbol: baseCurrency.currencyId?.symbol || "",
                  image: baseCurrency.image || baseCurrency.currencyId?.logo,
                  balance: `20${baseCurrency.currencyId?.symbol}`,
                  _id: baseCurrency._id,
                  currencyId: baseCurrency.currencyId,
                }
              : {
                  symbol: "Select",
                  image: require("@/assets/images/btc.png"),
                  balance: "0",
                }
          }
          title="Select Token"
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
  };

  // Handle token selection for target currency
  const handleTargetTokenSelect = () => {
    showBottomSheet({
      component: (
        <TokenSelectionBottomSheet
          onTokenSelect={(token: any) => {
            setTargetCurrency(token);
          }}
          selectedToken={
            targetCurrency
              ? {
                  symbol: targetCurrency.currencyId?.symbol || "",
                  image:
                    targetCurrency.image || targetCurrency.currencyId?.logo,
                  usdValue: `$${targetAmount?.toFixed(2) || "0"}`,
                  _id: targetCurrency._id,
                  currencyId: targetCurrency.currencyId,
                }
              : {
                  symbol: "Select",
                  image: require("@/assets/images/btc.png"),
                  usdValue: "$0",
                }
          }
          title="Select Token"
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
  };

  // Handle swap button press with animation and state update
  const handleSwapButtonPress = () => {
    handleSwapPress(); // Animation
    handleSwapCurrencies(); // State update
  };

  // Handle continue button press
  const handleContinue = () => {
    if (validateExchange()) {
      // TODO: Navigate to confirmation screen or process swap
      console.log("Swap validated, proceeding...");
    }
  };

  return (
    <PageWrapper>
      <Box flex={1} p="m">
        <CustomText variant="subheader" textAlign="center" mb="m">
          Swap
        </CustomText>
        <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

        {/* Error Display */}
        {error && (
          <Box
            backgroundColor="secondaryBackgroundColor"
            p="s"
            borderRadius={8}
            mb="s"
          >
            <CustomText variant="body" color="bodyTextColor">
              {error}
            </CustomText>
          </Box>
        )}

        {/* Base Token Input */}
        <Box marginBottom="s" mt="m" position="relative">
          <TokenInputCard
            amount={handleBaseAmountFormat()}
            tokenSymbol={baseCurrency?.currencyId?.symbol || "Select"}
            tokenImage={baseCurrency?.image || baseCurrency?.currencyId?.logo}
            balance={`20${baseCurrency?.currencyId?.symbol || ""}`}
            showBalance={true}
            showMaxButton={true}
            onTokenSelect={handleBaseTokenSelect}
            onAmountChange={handleBaseAmountChange}
            onMaxPress={() => {
              console.log("Max pressed");
            }}
            animatedStyle={sellContainerStyle}
            isReceive={false}
            isCrypto={baseCurrency?.currencyId?.isCrypto || false}
          />
        </Box>

        {/* Target Token Input with Swap Button */}
        <Box position="relative">
          <TokenInputCard
            amount={handleTargetAmountFormat()}
            tokenSymbol={targetCurrency?.currencyId?.symbol || "Select"}
            tokenImage={
              targetCurrency?.image || targetCurrency?.currencyId?.logo
            }
            animatedStyle={receiveContainerStyle}
            isReceive={true}
            usdValue={`$${targetAmount?.toFixed(2) || "0"}`}
            onTokenSelect={handleTargetTokenSelect}
            onAmountChange={handleTargetAmountChange}
            isCrypto={targetCurrency?.currencyId?.isCrypto || false}
          />

          <SwapButton
            onPress={handleSwapButtonPress}
            animatedStyle={swapButtonStyle}
            disabled={isAnimating || !baseCurrency || !targetCurrency}
          />
        </Box>

        {/* Swap Details */}
        {marketRate && (
          <SwapDetailsCard
            provider="Zap exchange"
            providerIcon={require("@/assets/images/btc.png")}
            zapFee={`$${marketRate.rate?.toFixed(6) || "0.000000"}`}
            rate={`1 ${
              baseCurrency?.currencyId?.symbol
            } = ${marketRate.rate?.toFixed(2)} ${
              targetCurrency?.currencyId?.symbol
            }`}
            minimumReceived={`${targetAmount?.toFixed(2)} ${
              targetCurrency?.currencyId?.symbol
            }`}
            showLess={false}
          />
        )}

        {/* Continue Button */}
        <CustomButton
          text={"Continue"}
          fontSize={14}
          width={"100%"}
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          onPress={handleContinue}
          disabled={
            isLoading || !baseCurrency || !targetCurrency || baseAmount <= 0
          }
        />
      </Box>
    </PageWrapper>
  );
};

export default Swap;
