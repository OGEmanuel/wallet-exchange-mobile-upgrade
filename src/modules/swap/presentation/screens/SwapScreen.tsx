import TokenSelectionBottomSheet from "@/components/bottomsheets/TokenSelectionBottomSheet";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import { CustomButton, PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useFetchCurrencies } from "@/src/modules/swap";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import { SupportedCurrency } from "../../domain/entities/currency.types";

// Import modular components
import { SwapButton, SwapDetailsCard, TokenInputCard } from "../components";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const Swap = () => {
  const theme = useTheme<Theme>();
  const [activeTab, setActiveTab] = useState<"EXCHANGE" | "WALLET">("EXCHANGE");
  const { showBottomSheet } = useAppBottomSheet();

  // Fetch currencies for default selection
  const { currencies, isLoading: currenciesLoading } = useFetchCurrencies({
    includeFiat: true,
    enabled: true,
  });

  // Use the custom animation hook
  const {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    handleSwapPress,
  } = useSwapAnimations();

  // State for selected tokens
  const [sellToken, setSellToken] = useState({
    symbol: "BTC",
    image: require("@/assets/images/btc.png"),
    amount: "0.009",
    balance: "20BTC",
  });

  const [receiveToken, setReceiveToken] = useState({
    symbol: "NGN",
    image: require("@/assets/images/btc.png"),
    amount: "30,027,060.88",
    usdValue: "$180",
  });

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
        (currency: SupportedCurrency) => currency.currencyId?.symbol === "NGN"
      );

      // Set default sell token (BTC with ETH fallback)
      if (btcCurrency || ethCurrency) {
        const selectedCurrency = btcCurrency || ethCurrency;
        setSellToken({
          symbol: selectedCurrency?.currencyId?.symbol || "BTC",
          image: selectedCurrency?.image || selectedCurrency?.currencyId?.logo,
          amount: "0.009",
          balance: `20${selectedCurrency?.currencyId?.symbol}`,
        });
      }

      // Set default receive token (NGN)
      if (ngnCurrency) {
        setReceiveToken({
          symbol: ngnCurrency.currencyId?.symbol || "NGN",
          image: ngnCurrency.image || ngnCurrency.currencyId?.logo,
          amount: "30,027,060.88",
          usdValue: "$180",
        });
      }
    }
  }, [currencies, currenciesLoading]);

  // Handle token selection for sell token
  const handleSellTokenSelect = () => {
    showBottomSheet({
      component: (
        <TokenSelectionBottomSheet
          onTokenSelect={(token: any) => {
            setSellToken({
              symbol: token.symbol,
              image: token.image,
              amount: sellToken.amount,
              balance: token.balance,
            });
          }}
          selectedToken={sellToken}
          title="Select Token to Sell"
        />
      ),
      props: {
        snapPoints: ["80%"],
        enablePanDownToClose: true,
        showGradientHandle: false,
      },
    });
  };

  // Handle token selection for receive token
  const handleReceiveTokenSelect = () => {
    showBottomSheet({
      component: (
        <TokenSelectionBottomSheet
          onTokenSelect={(token: any) => {
            setReceiveToken({
              symbol: token.symbol,
              image: token.image,
              amount: receiveToken.amount,
              usdValue: token.usdValue,
            });
          }}
          selectedToken={receiveToken}
          title="Select Token to Receive"
        />
      ),
      props: {
        snapPoints: ["80%"],
        enablePanDownToClose: true,
        showGradientHandle: false,
      },
    });
  };

  return (
    <PageWrapper>
      <Box flex={1} p="m">
        <CustomText variant="subheader" textAlign="center" mb="m">
          Swap
        </CustomText>
        <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

        {/* Sell Token Input */}
        <Box marginBottom="s" mt="m" position="relative">
          <TokenInputCard
            amount={sellToken.amount}
            tokenSymbol={sellToken.symbol}
            tokenImage={sellToken.image}
            balance={sellToken.balance}
            showBalance={true}
            showMaxButton={true}
            onTokenSelect={handleSellTokenSelect}
            onMaxPress={() => {}}
            animatedStyle={sellContainerStyle}
            isReceive={false}
          />
        </Box>

        {/* Receive Token Input with Swap Button */}
        <Box position="relative">
          <TokenInputCard
            amount={receiveToken.amount}
            tokenSymbol={receiveToken.symbol}
            tokenImage={receiveToken.image}
            animatedStyle={receiveContainerStyle}
            isReceive={true}
            usdValue={receiveToken.usdValue}
            onTokenSelect={handleReceiveTokenSelect}
          />

          <SwapButton
            onPress={handleSwapPress}
            animatedStyle={swapButtonStyle}
            disabled={isAnimating}
          />
        </Box>

        {/* Swap Details */}
        <SwapDetailsCard
          provider="Zap exchange"
          providerIcon={require("@/assets/images/btc.png")}
          zapFee="$0.009"
          rate="1BNB = 500 USDC"
          minimumReceived="327,060.88 NGN"
          showLess={false}
        />

        {/* Continue Button */}
        <CustomButton
          text="Continue"
          fontSize={14}
          width={"100%"}
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          onPress={() => {}}
        />
      </Box>
    </PageWrapper>
  );
};

export default Swap;
