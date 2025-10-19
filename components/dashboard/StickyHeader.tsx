import { Triangle } from "lucide-react-native";
import React from "react";
import { Animated, View } from "react-native";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

// Utility function to format numbers with commas
const formatNumberWithCommas = (num: number): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface StickyHeaderProps {
  isVisible: boolean;
  portfolioValue: number;
  portfolioChange: number;
  portfolioChangePercentage: number;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({
  isVisible,
  portfolioValue,
  portfolioChange,
  portfolioChangePercentage,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isVisible, opacity]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        opacity,
        transform: [
          {
            translateY: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          },
        ],
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(19, 23, 34, 0.95)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255, 255, 255, 0.1)",
          paddingTop: 50,
          paddingHorizontal: 20,
        }}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          height={70}
        >
          <Box flex={1}>
            <CustomText
              fontSize={24}
              variant="header"
              color="headerTextColor"
              numberOfLines={1}
            >
              ${formatNumberWithCommas(portfolioValue)}
            </CustomText>
          </Box>

          <Box
            flexDirection="row"
            alignItems="center"
            backgroundColor="secondaryBackgroundColor"
            paddingHorizontal="s"
            paddingVertical="s"
            borderRadius={20}
            minWidth={100}
            justifyContent="center"
          >
            <Triangle size={12} color="#35B592" fill="#35B592" />
            <CustomText fontSize={12} color="success" marginLeft="s">
              +{portfolioChangePercentage.toFixed(2)}%
            </CustomText>
          </Box>
        </Box>
      </View>
    </Animated.View>
  );
};

export default StickyHeader;
