import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import React from "react";
import { Animated, Pressable } from "react-native";

import CustomButton from "@/components/general/CustomButton";
import { Theme } from "@/theme";

// Create animated components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CurrencySelectorProps {
  tokenSymbol: string;
  tokenImage: any;
  onPress: () => void;
  animatedStyle?: any;
  width?: number;
  height?: number;
  fontSize?: number;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  tokenSymbol,
  tokenImage,
  onPress,
  animatedStyle,
  width = 107,
  height = 36,
  fontSize = 12,
}) => {
  const theme = useTheme<Theme>();

  return (
    <AnimatedPressable style={animatedStyle} onPress={onPress}>
      <CustomButton
        width={width}
        height={height}
        borderRadius={height / 2}
        bgColor={theme.colors.mainBackgroundColor}
        text={tokenSymbol}
        fontSize={fontSize}
        onPress={onPress}
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
    </AnimatedPressable>
  );
};

export default CurrencySelector;
