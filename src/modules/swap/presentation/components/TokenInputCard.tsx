import { useTheme } from "@shopify/restyle";
import React from "react";
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
import { ArrowSwapVertical } from "iconsax-react-nativejs";

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
  tokenCode?: string;
  onToggleUSDValueShowing?: () => void;
  isUSDValueShowing?: boolean;
  hasError?: boolean;
  errorColor?: string;
}

const TokenInputCard: React.FC<TokenInputCardProps> = ({
  amount,
  tokenSymbol,
  tokenCode,
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
  onToggleUSDValueShowing = () => {},
  isUSDValueShowing = false,
  hasError = false,
  errorColor = "#FF6B6B",
}) => {
  const theme = useTheme<Theme>();

  // Handle input change - let parent handle formatting
  const handleInputChange = (text: string) => {
    onAmountChange?.(text);
  };

  return (
    <AnimatedBox
      width={"100%"}
      height={105}
      borderRadius={12}
      backgroundColor="modalBackgroundColor"
      p="m"
      justifyContent="space-between"
      style={[
        animatedStyle,
        hasError && {
          borderWidth: 1,
          borderColor: errorColor,
        }
      ]}
    >
      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextInput
          value={amount}
          onChangeText={handleInputChange}
          placeholder="0"
          placeholderTextColor={theme.colors.bodyTextColor}
          keyboardType="numeric"
          style={{
            fontSize: 24,
            fontWeight: "500",
            color: hasError ? errorColor : theme.colors.headerTextColor,
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 0,
            fontFamily: "NewScience_Bold",
          }}
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
            style={{ fontSize: 14, fontWeight: "500" }}
            marginRight="s"
          >
            {tokenCode || tokenSymbol}
          </CustomText>
          <Image
            source={icons.down}
            style={styles.selectedTokenArrow}
            tintColor={theme.colors.bodyTextColor}
          />
        </TouchableOpacity>
      </Box>

      {isReceive ? null : (
        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt="s"
        >
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacity onPress={onToggleUSDValueShowing || (() => {})}>
              <Box
                mr="s"
                backgroundColor="secondaryColor"
                borderRadius={5}
                width={24}
                height={24}
                justifyContent="center"
                alignItems="center"
              >
                <ArrowSwapVertical color="rgba(21, 51, 35, 1)" size={15} />
              </Box>
            </TouchableOpacity>
            <CustomText color="placeholderTextColor" variant="body">
              {usdValue}
            </CustomText>
          </Box>
          {showBalance && (
            <Box
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <CustomText
                color="placeholderTextColor"
                fontSize={12}
                variant="body"
                marginRight="s"
              >
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
    borderRadius: 18,
    paddingHorizontal: 8,
    justifyContent: "space-between",
  },
  selectedTokenImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  selectedTokenArrow: {
    width: 12,
    height: 12,
    marginLeft: 4,
  },
});
