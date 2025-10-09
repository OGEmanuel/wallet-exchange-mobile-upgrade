import { Box, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

interface SwapMetaData {
  isDollarMode: boolean;
  dollarValue: string | null | undefined;
  sellInputValue: string;
  receiveInputValue: string;
}

interface Props {
  isSwapped: boolean;
  swapMetaData: SwapMetaData;
  isTransitioning: boolean;
  triggerDollarCryptoSwap: () => void;
  openSupportedCurrenciesModal: (type: "sell" | "receive") => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  sellInputValue: string;
  sellCurrency?: any;
  swapRateError?: string | null;
}

const SwapSellSection: React.FC<Props> = ({
  isSwapped,
  isTransitioning,
  triggerDollarCryptoSwap,
  swapMetaData,
  openSupportedCurrenciesModal,
  isLoading = false,
  onInputChange,
  sellInputValue,
  sellCurrency,
  swapRateError,
}) => {
  const theme = useTheme<Theme>();

  // Animation for dollar value
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedDollarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Format the dollar value to ensure only one dollar sign
  const formattedDollarValue = (): string => {
    if (!swapMetaData.dollarValue) return "$0";

    // Remove any existing dollar signs first
    const cleanValue = swapMetaData.dollarValue.replace(/\$/g, "");

    // If it's supposed to be a dollar value (not in dollar mode), add a single dollar sign
    if (!swapMetaData.isDollarMode) {
      return `$${cleanValue}`;
    }

    return cleanValue;
  };

  const containerTranslateY = isSwapped ? 210 : 0;

  return (
    <Box position="relative" mb="s" style={{ marginBottom: 4 }}>
      {/* Static elements that don't move */}
      <Box
        position="absolute"
        top={16}
        left={16}
        zIndex={20}
        opacity={isTransitioning ? 0 : 1}
      >
        <CustomText variant="body" fontSize={14} color="disabledTextColor">
          Sell
        </CustomText>
      </Box>

      <Box
        position="absolute"
        bottom={16}
        left={16}
        zIndex={20}
        opacity={isTransitioning ? 0 : 1}
      >
        <TouchableOpacity onPress={triggerDollarCryptoSwap}>
          <Box flexDirection="row" alignItems="center" gap="s">
            <Box width={20} height={20} justifyContent="center" alignItems="center">
              <CustomText fontSize={16} color="secondaryColor">
                ⇄
              </CustomText>
            </Box>
            <Animated.View style={animatedDollarStyle}>
              <CustomText
                variant="body"
                fontSize={14}
                color={swapRateError ? "error" : "bodyTextColor"}
              >
                {formattedDollarValue()}
              </CustomText>
            </Animated.View>
          </Box>
        </TouchableOpacity>
      </Box>

      <Box
        position="absolute"
        top={16}
        right={16}
        zIndex={20}
        opacity={isTransitioning ? 0 : 1}
      >
        {isLoading ? (
          <Box
            backgroundColor="mainBackgroundColor"
            borderRadius={20}
            paddingHorizontal="m"
            paddingVertical="s"
            minWidth={96}
            alignItems="center"
          >
            <ActivityIndicator size="small" color={theme.colors.bodyTextColor} />
          </Box>
        ) : (
          <TouchableOpacity onPress={() => openSupportedCurrenciesModal("sell")}>
            <Box
              backgroundColor="mainBackgroundColor"
              borderRadius={20}
              paddingHorizontal="m"
              paddingVertical="s"
              flexDirection="row"
              alignItems="center"
              gap="s"
              minWidth={96}
              justifyContent="center"
            >
              {sellCurrency?.image || sellCurrency?.currencyId?.logo ? (
                <Image
                  source={{
                    uri: sellCurrency.image || sellCurrency.currencyId?.logo,
                  }}
                  style={styles.currencyImage}
                />
              ) : null}
              <CustomText variant="body" fontSize={14} fontWeight="500">
                {sellCurrency?.currencyId?.code}
              </CustomText>
              <CustomText fontSize={10} color="disabledTextColor">
                ▼
              </CustomText>
            </Box>
          </TouchableOpacity>
        )}
      </Box>

      {/* Animated container */}
      <Animated.View
        style={{
          transform: [{ translateY: containerTranslateY }],
        }}
      >
        <Box backgroundColor="modalBackgroundColor" borderRadius={16} p="m">
          <TextInput
            value={sellInputValue}
            onChangeText={onInputChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.colors.placeholderTextColor}
            style={[
              styles.input,
              {
                color: swapRateError
                  ? theme.colors.error
                  : theme.colors.headerTextColor,
                fontFamily: "NewScience_Bold",
              },
            ]}
          />
        </Box>
      </Animated.View>
    </Box>
  );
};

const styles = StyleSheet.create({
  currencyImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  input: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
  },
});

export default SwapSellSection;

