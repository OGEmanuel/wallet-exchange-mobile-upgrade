import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { SwapMetaData, SupportedCurrencyModel } from '../types';
import { ensureSingleDollarSign } from '../utils/formatUtils';

interface RootState {
  swap: {
    sellCurrency?: SupportedCurrencyModel | null;
    swapRateError?: string | null;
  };
}

interface Props {
  isSwapped: boolean;
  swapMetaData: SwapMetaData;
  isTransitioning: boolean;
  triggerDollarCryptoSwap: () => void;
  defaultSellValue?: string | null;
  openSupportedCurrenciesModal: (type: 'sell' | 'receive') => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  sellInputValue: string;
}

const SellSection: React.FC<Props> = ({
  isSwapped,
  isTransitioning,
  triggerDollarCryptoSwap,
  swapMetaData,
  openSupportedCurrenciesModal,
  isLoading = false,
  onInputChange,
  sellInputValue,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { sellCurrency, swapRateError } = useSelector((state: RootState) => state.swap);

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
    if (!swapMetaData.dollarValue) return '$0';

    // Remove any existing dollar signs first
    const cleanValue = swapMetaData.dollarValue.replace(/\$/g, '');

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
        <Text style={[styles.label, isDark && styles.labelDark]}>Sell</Text>
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
            <Text style={styles.swapIcon}>⇄</Text>
          </View>
          <Animated.View style={animatedDollarStyle}>
            <Text
              style={[
                styles.dollarValue,
                swapRateError && styles.errorText,
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
          <View style={[styles.currencyButton, isDark && styles.currencyButtonDark]}>
            <ActivityIndicator size="small" color={isDark ? '#fff' : '#000'} />
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => openSupportedCurrenciesModal('sell')}
            style={[styles.currencyButton, isDark && styles.currencyButtonDark]}
          >
            {sellCurrency?.image || sellCurrency?.currencyId?.logo ? (
              <Image
                source={{ uri: sellCurrency.image || sellCurrency.currencyId?.logo }}
                style={styles.currencyImage}
              />
            ) : null}
            <Text style={[styles.currencyCode, isDark && styles.currencyCodeDark]}>
              {sellCurrency?.currencyId?.code}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Animated container */}
      <Animated.View
        style={[
          styles.inputContainer,
          isDark && styles.inputContainerDark,
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
              placeholderTextColor={isDark ? '#6D7076' : '#A7A7AF'}
              style={[
                styles.input,
                isDark && styles.inputDark,
                swapRateError && styles.errorText,
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
    position: 'relative',
    marginBottom: 8,
  },
  labelContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 20,
  },
  label: {
    fontSize: 14,
    color: '#6D7076',
  },
  labelDark: {
    color: '#A7A7AF',
  },
  dollarContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    zIndex: 20,
  },
  dollarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dollarIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapIcon: {
    fontSize: 16,
    color: '#C7E64D',
  },
  dollarValue: {
    fontSize: 14,
    color: '#000',
  },
  errorText: {
    color: '#EF4444',
  },
  currencyButtonContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minWidth: 96,
    justifyContent: 'center',
  },
  currencyButtonDark: {
    backgroundColor: '#131722',
  },
  currencyImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  currencyCode: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  currencyCodeDark: {
    color: '#fff',
  },
  chevron: {
    fontSize: 10,
    color: '#6D7076',
  },
  inputContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 16,
  },
  inputContainerDark: {
    backgroundColor: '#2F333D',
  },
  inputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContent: {
    flex: 1,
    gap: 8,
  },
  input: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
  },
  inputDark: {
    color: '#fff',
  },
});

export default SellSection;

