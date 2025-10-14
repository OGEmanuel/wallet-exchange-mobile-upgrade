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
import Animated from "react-native-reanimated";
import { useSelector } from "react-redux";

interface Props {
  isSwapped: boolean;
  isTransitioning: boolean;
  defaultReceiveValue?: string | null;
  openSupportedCurrenciesModal: (type: "sell" | "receive") => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  receiveInputValue: string;
}

const ReceiveSectionNew: React.FC<Props> = ({
  isTransitioning,
  openSupportedCurrenciesModal,
  isLoading = false,
  onInputChange,
  receiveInputValue,
  isSwapped,
}) => {
  const theme = useTheme<Theme>();
  const { receiveCurrency, swapRateError } = useSelector(
    (state: AppRootState) => state.swap
  );

  const containerTranslateY = isSwapped ? -210 : 0;

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
          Receive
        </Text>
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
            onPress={() => openSupportedCurrenciesModal("receive")}
            style={[
              styles.currencyButton,
              { backgroundColor: theme.colors.surfaceContainer },
            ]}
          >
            {receiveCurrency?.image || receiveCurrency?.currencyId?.logo ? (
              <Image
                source={{
                  uri:
                    receiveCurrency.image || receiveCurrency.currencyId?.logo,
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
              {receiveCurrency?.currencyId?.code}
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
              value={receiveInputValue}
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
    marginTop: 8,
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

export default ReceiveSectionNew;

