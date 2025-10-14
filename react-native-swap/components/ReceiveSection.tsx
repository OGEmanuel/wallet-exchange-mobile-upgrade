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
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { SupportedCurrencyModel } from '../types';

interface RootState {
  swap: {
    receiveCurrency?: SupportedCurrencyModel | null;
    swapRateError?: string | null;
    isSwapped: boolean;
  };
}

interface Props {
  isSwapped: boolean;
  isTransitioning: boolean;
  defaultReceiveValue?: string | null;
  openSupportedCurrenciesModal: (type: 'sell' | 'receive') => void;
  isLoading?: boolean;
  onInputChange?: (text: string) => void;
  receiveInputValue: string;
}

const ReceiveSection: React.FC<Props> = ({
  isTransitioning,
  openSupportedCurrenciesModal,
  isLoading = false,
  onInputChange,
  receiveInputValue,
  isSwapped,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { receiveCurrency, swapRateError } = useSelector((state: RootState) => state.swap);

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
        <Text style={[styles.label, isDark && styles.labelDark]}>Receive</Text>
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
            onPress={() => openSupportedCurrenciesModal('receive')}
            style={[styles.currencyButton, isDark && styles.currencyButtonDark]}
          >
            {receiveCurrency?.image || receiveCurrency?.currencyId?.logo ? (
              <Image
                source={{
                  uri: receiveCurrency.image || receiveCurrency.currencyId?.logo,
                }}
                style={styles.currencyImage}
              />
            ) : null}
            <Text style={[styles.currencyCode, isDark && styles.currencyCodeDark]}>
              {receiveCurrency?.currencyId?.code}
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
              value={receiveInputValue}
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
    marginTop: 8,
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
  errorText: {
    color: '#EF4444',
  },
});

export default ReceiveSection;

