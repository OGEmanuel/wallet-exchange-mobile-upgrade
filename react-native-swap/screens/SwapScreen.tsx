import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { swapActions } from '../state/swapSlice';
import { useSwapLogic } from '../hooks/useSwapLogic';
import { SupportedCurrencyModel } from '../types';

// Components
import SellSection from '../components/SellSection';
import ReceiveSection from '../components/ReceiveSection';
import SwapButton from '../components/SwapButton';
import WithdrawalAddressInput from '../components/WithdrawalAddressInput';
import ErrorIndicator from '../components/ErrorIndicator';
import CurrencySelector from '../components/CurrencySelector';

interface RootState {
  swap: {
    supportedCurrencies?: SupportedCurrencyModel[] | null;
    sellCurrency?: SupportedCurrencyModel | null;
    receiveCurrency?: SupportedCurrencyModel | null;
    swapRate?: any;
  };
}

interface SwapScreenProps {
  defaultTokenSymbol?: string | null;
  onSwapComplete?: (data: any) => void;
}

const SwapScreen: React.FC<SwapScreenProps> = ({
  defaultTokenSymbol = 'BTC',
  onSwapComplete,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const dispatch = useDispatch();

  const { supportedCurrencies, sellCurrency, receiveCurrency, swapRate } = useSelector(
    (state: RootState) => state.swap
  );

  const {
    swapMetaData,
    isTransitioning,
    isBackgroundRefresh,
    fetchingSwapRate,
    isSwapped,
    swapRateError,
    supportedCurrenciesError,
    handleSellInputChange,
    handleReceiveInputChange,
    handleSwap,
    triggerDollarCryptoSwap,
    retryFetchSwapRate,
  } = useSwapLogic();

  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [withdrawalAddressError, setWithdrawalAddressError] = useState<string | null>(
    null
  );
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [currencyModalType, setCurrencyModalType] = useState<'sell' | 'receive'>('sell');

  // Mock supported currencies - replace with actual data
  useEffect(() => {
    const mockCurrencies: SupportedCurrencyModel[] = [
      {
        _id: '1',
        image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        currencyId: {
          code: 'BTC',
          symbol: 'BTC',
          logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
          isCrypto: true,
        },
      },
      {
        _id: '2',
        image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        currencyId: {
          code: 'ETH',
          symbol: 'ETH',
          logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
          isCrypto: true,
        },
      },
      {
        _id: '3',
        image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        currencyId: {
          code: 'USDC',
          symbol: 'USDC',
          logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
          isCrypto: true,
        },
      },
      {
        _id: '4',
        currencyId: {
          code: 'USD',
          symbol: '$',
          isCrypto: false,
        },
      },
      {
        _id: '5',
        currencyId: {
          code: 'EUR',
          symbol: '€',
          isCrypto: false,
        },
      },
      {
        _id: '6',
        currencyId: {
          code: 'GBP',
          symbol: '£',
          isCrypto: false,
        },
      },
    ];

    dispatch(swapActions.setSupportedCurrencies(mockCurrencies));

    // Set default currencies
    const btc = mockCurrencies.find((c) => c.currencyId?.code === defaultTokenSymbol);
    const usd = mockCurrencies.find((c) => c.currencyId?.code === 'USD');

    dispatch(swapActions.setSellCurrency(btc || mockCurrencies[0]));
    dispatch(swapActions.setReceiveCurrency(usd || mockCurrencies[3]));
  }, [defaultTokenSymbol]);

  const openSupportedCurrenciesModal = (type: 'sell' | 'receive') => {
    setCurrencyModalType(type);
    setCurrencyModalVisible(true);
  };

  const handleSelectCurrency = (currency: SupportedCurrencyModel) => {
    // If the user selects token that is on the other side, swap the tokens
    if (currency._id === sellCurrency?._id && currencyModalType === 'receive') {
      handleSwap();
    } else if (currency._id === receiveCurrency?._id && currencyModalType === 'sell') {
      handleSwap();
    } else {
      if (currencyModalType === 'sell') {
        dispatch(swapActions.setSellCurrency(currency));
      } else {
        dispatch(swapActions.setReceiveCurrency(currency));
      }
    }

    setCurrencyModalVisible(false);
  };

  const handleWithdrawalAddressChange = (address: string) => {
    setWithdrawalAddress(address);
    setWithdrawalAddressError(null);
  };

  const shouldShowWithdrawalAddress =
    swapRate?.sellCurrency?.currencyId?.isCrypto === true &&
    !swapRateError &&
    !fetchingSwapRate;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.scrollView, isDark && styles.scrollViewDark]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error Indicator */}
        <ErrorIndicator
          error={swapRateError || supportedCurrenciesError}
          retry={retryFetchSwapRate}
          retryText="Retry"
          isBackgroundRefresh={isBackgroundRefresh}
        />

        {/* Sell Section */}
        <SellSection
          isSwapped={isSwapped}
          isTransitioning={isTransitioning}
          swapMetaData={swapMetaData}
          triggerDollarCryptoSwap={triggerDollarCryptoSwap}
          openSupportedCurrenciesModal={openSupportedCurrenciesModal}
          isLoading={!sellCurrency}
          onInputChange={handleSellInputChange}
          sellInputValue={swapMetaData.sellInputValue}
        />

        {/* Swap Button */}
        <SwapButton onPress={handleSwap} isLoading={fetchingSwapRate} />

        {/* Receive Section */}
        <ReceiveSection
          isSwapped={isSwapped}
          isTransitioning={isTransitioning}
          openSupportedCurrenciesModal={openSupportedCurrenciesModal}
          isLoading={!receiveCurrency}
          onInputChange={handleReceiveInputChange}
          receiveInputValue={swapMetaData.receiveInputValue}
        />

        {/* Withdrawal Address Input (for crypto) */}
        {shouldShowWithdrawalAddress && (
          <WithdrawalAddressInput
            value={withdrawalAddress}
            onChangeText={handleWithdrawalAddressChange}
            error={withdrawalAddressError}
          />
        )}

        {/* You can add additional components here like:
          - Swap summary
          - Fee information
          - Action button (Zap Now/Swap Now)
          - Terms and conditions
        */}
      </ScrollView>

      {/* Currency Selector Modal */}
      <CurrencySelector
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
        currencies={supportedCurrencies || []}
        selectedCurrency={
          currencyModalType === 'sell' ? sellCurrency : receiveCurrency
        }
        onSelect={handleSelectCurrency}
        title={`Select ${currencyModalType === 'sell' ? 'Sell' : 'Receive'} Currency`}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewDark: {
    backgroundColor: '#131722',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
});

export default SwapScreen;

