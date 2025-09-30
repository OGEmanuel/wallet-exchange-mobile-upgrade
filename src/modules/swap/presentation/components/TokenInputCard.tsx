import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import React from "react";
import { Animated, Pressable, TextInput } from "react-native";

import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";

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
}) => {
  const theme = useTheme<Theme>();

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
          value={amount}
          onChangeText={onAmountChange}
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
          }}
          editable={!isReceive}
        />
        <Pressable onPress={onTokenSelect || (() => {})}>
          <CustomButton
            width={107}
            height={36}
            borderRadius={36}
            bgColor={theme.colors.mainBackgroundColor}
            text={tokenSymbol}
            fontSize={12}
            onPress={onTokenSelect || (() => {})}
            leadingIcon={
              <Image
                source={tokenImage}
                style={{ width: 20, height: 20, marginRight: 5 }}
              />
            }
            trailingIcon={
              <ChevronDown
                color={theme.colors.bodyTextColor}
                size={12}
                style={{ marginLeft: 5 }}
              />
            }
          />
        </Pressable>
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
          <TextInput
            value={amount}
            onChangeText={onAmountChange}
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
            }}
          />
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
