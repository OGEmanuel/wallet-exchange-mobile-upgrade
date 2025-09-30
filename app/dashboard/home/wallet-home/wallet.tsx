import SwapButton from "@/components/dashboard/SwapButton";
import SwapDetailsCard from "@/components/dashboard/SwapDetailsCard";
import TokenInputCard from "@/components/dashboard/TokenInputCard";
import { CustomButton, PageWrapper } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";

const Wallet = () => {
  const theme = useTheme<Theme>();
  const [fromAmount, setFromAmount] = useState("0.009");
  const [toAmount, setToAmount] = useState("30,027,060.88");
  const [fromToken, setFromToken] = useState("BUSD");
  const [toToken, setToToken] = useState("BUSD");

  const handleFromTokenPress = () => {
    // Handle token selection for from token
    console.log("Select from token");
  };

  const handleToTokenPress = () => {
    // Handle token selection for to token
    console.log("Select to token");
  };

  const handleMaxPress = () => {
    setFromAmount("20");
  };

  const handleSwapPress = () => {
    // Handle swap action
    console.log("Swap tokens");
  };

  const handleContinuePress = () => {
    // Handle continue action
    console.log("Continue with wallet transaction");
  };

  return (
    <PageWrapper>
      <Box flex={1} p="m">
        <CustomText variant="subheader" textAlign="center" mb="m">
          Wallet
        </CustomText>

        <Box marginBottom="s" mt="m" position="relative">
          <TokenInputCard
            amount={fromAmount}
            token={fromToken}
            balance="20BNB"
            showMaxButton={true}
            onTokenPress={handleFromTokenPress}
            onMaxPress={handleMaxPress}
            onAmountChange={setFromAmount}
          />
        </Box>

        <Box position="relative">
          <TokenInputCard
            amount={toAmount}
            token={toToken}
            onTokenPress={handleToTokenPress}
            onAmountChange={setToAmount}
          />
          <SwapButton onPress={handleSwapPress} />
        </Box>

        <SwapDetailsCard
          provider="Zap Wallet"
          zapFee="$0.009"
          rate="1BNB = 500 USDC"
          minimumReceived="327,060.88 NGN"
          onShowLessPress={() => console.log("Show less details")}
        />

        <CustomButton
          text="Continue"
          fontSize={14}
          width={"100%"}
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          onPress={handleContinuePress}
        />
      </Box>
    </PageWrapper>
  );
};

export default Wallet;
