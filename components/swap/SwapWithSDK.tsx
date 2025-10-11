import { useZapSDK } from '@/src/core/sdk/useZapSDK';
import { Theme } from '@/theme';
import { useTheme } from '@shopify/restyle';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import CustomInputWithoutForm from '../form/CustomInputWithoutForm';
import { Box, CustomButton, CustomText } from '../general';

interface SwapWithSDKProps {
  onSwapSuccess?: (txHash: string) => void;
}

export default function SwapWithSDK({ onSwapSuccess }: SwapWithSDKProps) {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [marketRate, setMarketRate] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme<Theme>();
  const { sdk, isInitialized } = useZapSDK();

  useEffect(() => {
    if (isInitialized && sdk) {
      loadSupportedTokens();
    }
  }, [isInitialized, sdk]);

  const loadSupportedTokens = async () => {
    if (!sdk || !isInitialized) return;

    try {
      // Load supported tokens from SDK
      const tokens = await sdk.tokens.getSupportedTokens();
      console.log('Supported tokens:', tokens);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  const handleFromTokenSelect = () => {
    // This would open a token selection modal
    Alert.alert('Token Selection', 'Token selection modal would open here');
  };

  const handleToTokenSelect = () => {
    // This would open a token selection modal
    Alert.alert('Token Selection', 'Token selection modal would open here');
  };

  const handleAmountChange = async (amount: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromAmount(amount);
      if (fromToken && toToken && amount) {
        await fetchExchangeRate(amount, fromToken, toToken);
      }
    } else {
      setToAmount(amount);
    }
  };

  const fetchExchangeRate = async (amount: string, from: any, to: any) => {
    if (!sdk || !isInitialized) return;

    try {
      setIsRateLoading(true);
      setError(null);

      // This would use the SDK's exchange rate functionality
      // const rate = await sdk.exchange.getRate(from.symbol, to.symbol, parseFloat(amount));
      // setMarketRate(rate);
      
      // For demo purposes, simulate a rate
      const simulatedRate = {
        rate: 0.000025,
        fee: 0.001,
        min: 0.1
      };
      setMarketRate(simulatedRate);
      
      // Calculate target amount
      const targetAmount = parseFloat(amount) * simulatedRate.rate;
      setToAmount(targetAmount.toFixed(6));
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setError('Failed to fetch exchange rate');
    } finally {
      setIsRateLoading(false);
    }
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!sdk || !isInitialized) {
      Alert.alert('Error', 'SDK not initialized');
      return;
    }

    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      Alert.alert('Error', 'Please select tokens and enter amounts');
      return;
    }

    setIsLoading(true);
    try {
      // This would use the SDK's swap functionality
      // const result = await sdk.swap.executeSwap({
      //   fromToken: fromToken.symbol,
      //   toToken: toToken.symbol,
      //   fromAmount: parseFloat(fromAmount),
      //   toAmount: parseFloat(toAmount),
      //   slippage: 0.5
      // });

      // For demo purposes, simulate a successful swap
      const simulatedTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      Alert.alert('Success', 'Swap executed successfully!');
      onSwapSuccess?.(simulatedTxHash);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setFromToken(null);
      setToToken(null);
      setMarketRate(null);
    } catch (error) {
      console.error('Swap error:', error);
      Alert.alert('Error', 'Failed to execute swap');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return fromToken && toToken && fromAmount && toAmount && parseFloat(fromAmount) > 0;
  };

  return (
    <Box flex={1} padding="m">
      <CustomText variant="subheader" textAlign="center" marginBottom="m">
        Swap Tokens
      </CustomText>

      {/* From Token */}
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          From
        </CustomText>
        
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="secondaryBackgroundColor"
          borderRadius={12}
          padding="m"
        >
          <Box flex={1}>
            <CustomInputWithoutForm
              value={fromAmount}
              onChange={(value) => handleAmountChange(value, 'from')}
              placeholder="0.00"
              keyboardType="numeric"
              noBorder={true}
              style={{ fontSize: 18 }}
            />
            {fromToken && (
              <CustomText variant="caption" color="bodyTextColor">
                ≈ ${(parseFloat(fromAmount || '0') * (fromToken.price || 0)).toFixed(2)}
              </CustomText>
            )}
          </Box>
          
          <CustomButton
            text={fromToken ? fromToken.symbol : 'Select'}
            onPress={handleFromTokenSelect}
            bgColor="transparent"
            color={theme.colors.primaryColor}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.primaryColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          />
        </Box>
      </Box>

      {/* Swap Button */}
      <Box alignItems="center" marginVertical="m">
        <CustomButton
          text="⇅"
          onPress={handleSwapTokens}
          bgColor="secondaryBackgroundColor"
          color={theme.colors.bodyTextColor}
          width={40}
          height={40}
          borderRadius={20}
          disabled={!fromToken || !toToken}
        />
      </Box>

      {/* To Token */}
      <Box marginBottom="m">
        <CustomText variant="body" marginBottom="s">
          To
        </CustomText>
        
        <Box
          flexDirection="row"
          alignItems="center"
          backgroundColor="secondaryBackgroundColor"
          borderRadius={12}
          padding="m"
        >
          <Box flex={1}>
            <CustomInputWithoutForm
              value={toAmount}
              onChange={(value) => handleAmountChange(value, 'to')}
              placeholder="0.00"
              keyboardType="numeric"
              noBorder={true}
              style={{ fontSize: 18 }}
            />
            {toToken && (
              <CustomText variant="caption" color="bodyTextColor">
                ≈ ${(parseFloat(toAmount || '0') * (toToken.price || 0)).toFixed(2)}
              </CustomText>
            )}
          </Box>
          
          <CustomButton
            text={toToken ? toToken.symbol : 'Select'}
            onPress={handleToTokenSelect}
            bgColor="transparent"
            color={theme.colors.primaryColor}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.primaryColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          />
        </Box>
      </Box>

      {/* Rate Information */}
      {marketRate && (
        <Box
          backgroundColor="secondaryBackgroundColor"
          padding="m"
          borderRadius={12}
          marginBottom="m"
        >
          <CustomText variant="body" marginBottom="s">
            Exchange Details
          </CustomText>
          
          <Box flexDirection="row" justifyContent="space-between" marginBottom="xs">
            <CustomText variant="caption" color="bodyTextColor">Rate</CustomText>
            <CustomText variant="caption">
              1 {fromToken?.symbol} = {marketRate.rate} {toToken?.symbol}
            </CustomText>
          </Box>
          
          <Box flexDirection="row" justifyContent="space-between" marginBottom="xs">
            <CustomText variant="caption" color="bodyTextColor">Fee</CustomText>
            <CustomText variant="caption">{marketRate.fee} {fromToken?.symbol}</CustomText>
          </Box>
          
          <Box flexDirection="row" justifyContent="space-between">
            <CustomText variant="caption" color="bodyTextColor">Minimum</CustomText>
            <CustomText variant="caption">{marketRate.min} {toToken?.symbol}</CustomText>
          </Box>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Box
          backgroundColor="alertColor"
          padding="s"
          borderRadius={8}
          marginBottom="m"
        >
          <CustomText variant="body" color="white">
            {error}
          </CustomText>
        </Box>
      )}

      {/* Swap Button */}
      <CustomButton
        text={isLoading ? "Swapping..." : "Swap"}
        onPress={handleSwap}
        bgColor={theme.colors.primaryColor}
        color={theme.colors.white}
        width="100%"
        height={56}
        borderRadius={56}
        disabled={!isFormValid() || isLoading || isRateLoading}
        disabledColor={theme.colors.borderColor}
      />

      {/* Loading Indicator */}
      {isRateLoading && (
        <Box alignItems="center" marginTop="s">
          <CustomText variant="caption" color="bodyTextColor">
            Fetching exchange rate...
          </CustomText>
        </Box>
      )}
    </Box>
  );
}
