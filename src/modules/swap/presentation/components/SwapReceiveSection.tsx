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
import Animated from "react-native-reanimated";

interface Props {
  isSwapped: boolean;
  isTransitioning: boolean;
  openSupportedCurrenciesModal: (type: "sell" | "receive") => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  receiveInputValue: string;
  receiveCurrency?: any;
  swapRateError?: string | null;
}

const SwapReceiveSection: React.FC<Props> = ({
  isTransitioning,
  openSupportedCurrenciesModal,
  isLoading = false,
  onInputChange,
  receiveInputValue,
  isSwapped,
  receiveCurrency,
  swapRateError,
}) => {
  const theme = useTheme<Theme>();

  const containerTranslateY = isSwapped ? -210 : 0;

  return (
    <Box position="relative" mt="s" style={{ marginTop: 4 }}>
      {/* Static elements that don't move */}
      <Box
        position="absolute"
        top={16}
        left={16}
        zIndex={20}
        opacity={isTransitioning ? 0 : 1}
      >
        <CustomText variant="body" fontSize={14} color="disabledTextColor">
          Receive
        </CustomText>
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
          <TouchableOpacity
            onPress={() => openSupportedCurrenciesModal("receive")}
          >
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
              {receiveCurrency?.image || receiveCurrency?.currencyId?.logo ? (
                <Image
                  source={{
                    uri:
                      receiveCurrency.image || receiveCurrency.currencyId?.logo,
                  }}
                  style={styles.currencyImage}
                />
              ) : null}
              <CustomText variant="body" fontSize={14} fontWeight="500">
                {receiveCurrency?.currencyId?.code}
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
            value={receiveInputValue}
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

export default SwapReceiveSection;

