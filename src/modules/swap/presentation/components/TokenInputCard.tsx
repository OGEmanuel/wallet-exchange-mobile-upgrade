import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";

import icons from "@/assets/icons";
import { Theme } from "@/theme";
import { Image } from "expo-image";
import { formatInputAmount, parseFormattedAmount } from "../../utils";

// Create animated components
const AnimatedBox = Animated.createAnimatedComponent(Box);

interface TokenInputCardProps {
  amount: string;
  tokenSymbol: string;
  tokenImage: any;
  balance?: string;
  showBalance?: boolean;
  showMaxButton?: boolean;
  onAmountChange?: (amount: string) => void;
  onTokenSelect?: () => void;
  onMaxPress?: () => void;
  animatedStyle?: any;
  isReceive?: boolean;
  usdValue?: string;
  isCrypto?: boolean;
}

const TokenInputCard: React.FC<TokenInputCardProps> = ({
  amount,
  tokenSymbol,
  tokenImage,
  balance,
  showBalance = true,
  showMaxButton = true,
  onAmountChange,
  onTokenSelect,
  onMaxPress,
  animatedStyle,
  isReceive = false,
  usdValue,
  isCrypto = false,
}) => {
  const theme = useTheme<Theme>();
  const [formattedAmount, setFormattedAmount] = useState(amount);

  // Update formatted amount when prop changes
  useEffect(() => {
    setFormattedAmount(amount);
  }, [amount]);

  // Handle input change with formatting
  const handleInputChange = (text: string) => {
    const formatted = formatInputAmount(text, isCrypto);
    setFormattedAmount(formatted);

    // Parse the formatted value back to number for the parent component
    const numericValue = parseFormattedAmount(formatted);
    onAmountChange?.(numericValue.toString());
  };

  return (
    <AnimatedBox
      width={"100%"}
      height={105}
      borderRadius={12}
      backgroundColor="modalBackgroundColor"
      p="m"
      justifyContent="space-between"
      style={animatedStyle}
    >
      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextInput
          value={formattedAmount}
          onChangeText={handleInputChange}
          placeholder="0"
          placeholderTextColor={theme.colors.bodyTextColor}
          keyboardType="numeric"
          style={{
            fontSize: 16,
            fontWeight: "500",
            color: theme.colors.headerTextColor,
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 0,
            fontFamily: "NewScience_Bold",
          }}
          editable={!isReceive}
        />

        <TouchableOpacity
          style={[
            styles.selectedToken,
            { backgroundColor: theme.colors.mainBackgroundColor },
          ]}
          onPress={onTokenSelect || (() => {})}
        >
          <Image source={tokenImage} style={styles.selectedTokenImage} />
          <CustomText
            variant="body"
            style={{ fontSize: 14, fontWeight: "400" }}
            marginRight="s"
          >
            {tokenSymbol === "₦" ? "NGN" : tokenSymbol}
          </CustomText>
          <Image
            source={icons.down}
            style={styles.selectedTokenImage}
            tintColor={theme.colors.bodyTextColor}
          />
        </TouchableOpacity>
      </Box>

      {isReceive ? (
        <CustomText variant="body" mt="s">
          {usdValue}
        </CustomText>
      ) : (
        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt="s"
        >
          {showBalance && (
            <Box
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <CustomText fontSize={12} variant="body" marginRight="s">
                Bal: {balance}
              </CustomText>
              {showMaxButton && (
                <CustomButton
                  width={50}
                  height={25}
                  borderRadius={36}
                  bgColor={theme.colors.white}
                  color="black"
                  text="MAX"
                  fontSize={12}
                  onPress={onMaxPress || (() => {})}
                />
              )}
            </Box>
          )}
        </Box>
      )}
    </AnimatedBox>
  );
};

export default TokenInputCard;

const styles = StyleSheet.create({
  selectedToken: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 107,
    height: 36,
    maxWidth: 120,
    borderRadius: 36,
    paddingHorizontal: 8,
    justifyContent: "space-between",
  },
  selectedTokenImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
});
