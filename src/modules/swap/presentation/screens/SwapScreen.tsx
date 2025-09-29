import ActivityTabar from "@/components/dashboard/ActivityTabar";
import { CustomButton, PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";

// Import modular components
import { SwapButton, SwapDetailsCard, TokenInputCard } from "../components";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const Swap = () => {
  const theme = useTheme<Theme>();
  const [activeTab, setActiveTab] = useState<"EXCHANGE" | "WALLET">("EXCHANGE");

  // Use the custom animation hook
  const {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    handleSwapPress,
  } = useSwapAnimations();

  // Mock data - in a real app, this would come from state management
  const sellToken = {
    symbol: "BUSD",
    image: require("@/assets/images/btc.png"),
    amount: "0.009",
    balance: "20BNB",
  };

  const receiveToken = {
    symbol: "BUSD",
    image: require("@/assets/images/btc.png"),
    amount: "30,027,060.88",
    usdValue: "$180",
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
            onTokenSelect={() => {}}
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
            onTokenSelect={() => {}}
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
