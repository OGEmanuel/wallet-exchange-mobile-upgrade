import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import {
    SwapMetaData
} from "../../domain/entities/currency.types";

interface Props {
  isSwapped: boolean;
  swapMetaData: SwapMetaData;
  isTransitioning: boolean;
  triggerDollarCryptoSwap: () => void;
  defaultSellValue?: string | null;
  openSupportedCurrenciesModal: (type: "sell" | "receive") => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  sellInputValue: string;
}

const SellSectionNew: React.FC<Props> = ({
  isSwapped,
  isTransitioning,
  triggerDollarCryptoSwap,
  swapMetaData,
  openSupportedCurrenciesModal,
  isLoading = false,
  onInputChange,
  sellInputValue,
}) => {
  const theme = useTheme<Theme>();
  const { sellCurrency, swapRateError } = useSelector(
    (state: AppRootState) => state.swap
  );

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
    <View style={styles.container}>
      {/* Static elements that don't move */}
      <View
        style={[
          styles.labelContainer,
          { opacity: isTransitioning ? 0 : 1 },
        ]}
      >
        <Text
          style={[
            styles.label,
            { color: theme.colors.disabledTextColor },
          ]}
        >
          Sell
        </Text>
      </View>

      <View
        style={[
          styles.dollarContainer,
          { opacity: isTransitioning ? 0 : 1 },
        ]}
      >
        <TouchableOpacity
          onPress={triggerDollarCryptoSwap}
          style={styles.dollarButton}
        >
          <View style={styles.dollarIconContainer}>
            <Text style={[styles.swapIcon, { color: theme.colors.secondaryColor }]}>
              ⇄
            </Text>
          </View>
          <Animated.View style={animatedDollarStyle}>
            <Text
              style={[
                styles.dollarValue,
                { color: theme.colors.bodyTextColor },
                swapRateError && { color: theme.colors.error },
              ]}
            >
              {formattedDollarValue()}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.currencyButtonContainer,
          { opacity: isTransitioning ? 0 : 1 },
        ]}
      >
        {isLoading ? (
          <View
            style={[
              styles.currencyButton,
              { backgroundColor: theme.colors.surfaceContainer },
            ]}
          >
            <ActivityIndicator
              size="small"
              color={theme.colors.bodyTextColor}
            />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => openSupportedCurrenciesModal("sell")}
            style={[
              styles.currencyButton,
              { backgroundColor: theme.colors.surfaceContainer },
            ]}
          >
            {sellCurrency?.image || sellCurrency?.currencyId?.logo ? (
              <Image
                source={{
                  uri:
                    sellCurrency.image || sellCurrency.currencyId?.logo,
                }}
                style={styles.currencyImage}
              />
            ) : null}
            <Text
              style={[
                styles.currencyCode,
                { color: theme.colors.bodyTextColor },
              ]}
            >
              {sellCurrency?.currencyId?.code}
            </Text>
            <Text
              style={[
                styles.chevron,
                { color: theme.colors.disabledTextColor },
              ]}
            >
              ▼
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Animated container */}
      <Animated.View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.secondaryBackgroundColor },
          {
            transform: [{ translateY: containerTranslateY }],
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          <View style={styles.inputContent}>
            <TextInput
              value={sellInputValue}
              onChangeText={onInputChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.placeholderTextColor}
              style={[
                styles.input,
                { color: theme.colors.bodyTextColor },
                swapRateError && { color: theme.colors.error },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginBottom: 8,
  },
  labelContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Regular",
  },
  dollarContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    zIndex: 20,
  },
  dollarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dollarIconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  swapIcon: {
    fontSize: 16,
  },
  dollarValue: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Regular",
  },
  currencyButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 20,
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minWidth: 96,
    justifyContent: "center",
  },
  currencyImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans_Medium",
  },
  chevron: {
    fontSize: 10,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContent: {
    flex: 1,
    gap: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlusJakartaSans_Bold",
    marginTop: 24,
  },
});

export default SellSectionNew;

