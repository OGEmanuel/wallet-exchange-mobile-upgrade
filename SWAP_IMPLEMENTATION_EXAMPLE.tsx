/**
 * SWAP IMPLEMENTATION EXAMPLE
 * 
 * This file shows how to use the new swap implementation in your app.
 * Copy the relevant code to your swap route file.
 */

// ============================================================================
// EXAMPLE 1: Using the Complete SwapScreenNew (Recommended)
// ============================================================================

// In your route file (e.g., app/dashboard/home/wallet-home/swap.tsx)
import { SwapScreenNew } from "@/src/modules/swap";

export default function SwapPage() {
  return <SwapScreenNew />;
}

// ============================================================================
// EXAMPLE 2: Custom Implementation Using Individual Components
// ============================================================================

import { CustomButton } from "@/components/general";
import {
    ErrorIndicator,
    ReceiveSectionNew,
    SellSectionNew,
    SwapButtonNew,
    WithdrawalAddressInput,
    swapActions,
    useFetchCurrencies,
    useSwapLogic,
} from "@/src/modules/swap";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useDispatch } from "react-redux";

function CustomSwapScreen() {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  
  // Get currencies
  const { currencies } = useFetchCurrencies({ includeFiat: true });
  
  // Use swap logic hook
  const {
    swapMetaData,
    isTransitioning,
    isBackgroundRefresh,
    fetchingSwapRate,
    isSwapped,
    swapRateError,
    supportedCurrenciesError,
    sellCurrency,
    receiveCurrency,
    handleSellInputChange,
    handleReceiveInputChange,
    handleSwap,
    triggerDollarCryptoSwap,
    retryFetchSwapRate,
  } = useSwapLogic();
  
  const [cryptoAddress, setCryptoAddress] = useState("");
  
  const openCurrencySelector = useCallback((type: "sell" | "receive") => {
    // Show your currency selector modal
    // Then dispatch:
    // dispatch(swapActions.setSellCurrency(selectedCurrency));
    // or
    // dispatch(swapActions.setReceiveCurrency(selectedCurrency));
  }, [dispatch]);
  
  const handleContinue = useCallback(() => {
    // Your order creation logic
    console.log("Create order with:", {
      sellCurrency,
      receiveCurrency,
      sellAmount: swapMetaData.sellInputValue,
      receiveAmount: swapMetaData.receiveInputValue,
      withdrawalAddress: cryptoAddress,
    });
  }, [sellCurrency, receiveCurrency, swapMetaData, cryptoAddress]);
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Error Indicator */}
        <ErrorIndicator
          error={swapRateError || supportedCurrenciesError}
          retry={retryFetchSwapRate}
          isBackgroundRefresh={isBackgroundRefresh}
        />
        
        {/* Sell Section */}
        <SellSectionNew
          isSwapped={isSwapped}
          isTransitioning={isTransitioning}
          swapMetaData={swapMetaData}
          triggerDollarCryptoSwap={triggerDollarCryptoSwap}
          openSupportedCurrenciesModal={openCurrencySelector}
          isLoading={!sellCurrency}
          onInputChange={handleSellInputChange}
          sellInputValue={swapMetaData.sellInputValue}
        />
        
        {/* Swap Button */}
        <SwapButtonNew onPress={handleSwap} isLoading={fetchingSwapRate} />
        
        {/* Receive Section */}
        <ReceiveSectionNew
          isSwapped={isSwapped}
          isTransitioning={isTransitioning}
          openSupportedCurrenciesModal={openCurrencySelector}
          isLoading={!receiveCurrency}
          onInputChange={handleReceiveInputChange}
          receiveInputValue={swapMetaData.receiveInputValue}
        />
        
        {/* Withdrawal Address (for crypto) */}
        {receiveCurrency?.currencyId?.isCrypto && (
          <WithdrawalAddressInput
            value={cryptoAddress}
            onChangeText={setCryptoAddress}
          />
        )}
        
        {/* Continue Button */}
        <CustomButton
          text="Continue"
          onPress={handleContinue}
          disabled={
            fetchingSwapRate ||
            !sellCurrency ||
            !receiveCurrency ||
            (receiveCurrency?.currencyId?.isCrypto && !cryptoAddress)
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================================
// EXAMPLE 3: Using useSwapLogic Hook Directly
// ============================================================================


function MyComponent() {
  const {
    // Input values
    swapMetaData,
    
    // State flags
    isTransitioning,
    isBackgroundRefresh,
    fetchingSwapRate,
    isSwapped,
    
    // Errors
    swapRateError,
    supportedCurrenciesError,
    
    // Selected currencies
    sellCurrency,
    receiveCurrency,
    
    // Current swap rate
    swapRate,
    
    // Handlers
    handleSellInputChange,
    handleReceiveInputChange,
    handleSwap,
    triggerDollarCryptoSwap,
    retryFetchSwapRate,
    triggerSwapRateFetch,
  } = useSwapLogic();
  
  // Use these values in your custom UI
  return (
    <View>
      {/* Your custom implementation */}
    </View>
  );
}

// ============================================================================
// EXAMPLE 4: Integrating with Existing API Service
// ============================================================================

/**
 * In src/modules/swap/presentation/hooks/useSwapLogic.ts
 * 
 * Replace the mockFetchSwapRate function with your actual API service:
 */

import { swapRatesService } from "../../data/remote/swap-rates.service";

// Replace the mock function with:
const fetchSwapRate = async (
  sellCurrencyId: string,
  buyCurrencyId: string,
  amount: number,
  isReceiveInput = false
): Promise<SwapRateModel> => {
  try {
    const response = await swapRatesService.fetchSwapRate({
      sellSupportedCurrencyId: sellCurrencyId,
      buySupportedCurrencyId: buyCurrencyId,
      [isReceiveInput ? "sellAmount" : "buyAmount"]: amount,
    });

    return {
      sellAmount: response.sellAmount,
      buyAmount: response.buyAmount,
      sellRate: response.sellRate,
      buyRate: response.buyRate,
      sellCurrency: sellCurrency || undefined,
      buyCurrency: receiveCurrency || undefined,
    };
  } catch (error) {
    throw new Error("Failed to fetch swap rate");
  }
};

// ============================================================================
// EXAMPLE 5: Redux Integration
// ============================================================================

import { AppRootState } from "@/state";
import { useSelector } from "react-redux";

function MySwapComponent() {
  const dispatch = useDispatch();
  
  // Select state
  const {
    sellCurrency,
    receiveCurrency,
    isSwapped,
    fetchingSwapRate,
    swapRate,
    swapRateError,
  } = useSelector((state: AppRootState) => state.swap);
  
  // Dispatch actions
  const handleSelectSellCurrency = (currency: SupportedCurrency) => {
    dispatch(swapActions.setSellCurrency(currency));
  };
  
  const handleSelectReceiveCurrency = (currency: SupportedCurrency) => {
    dispatch(swapActions.setReceiveCurrency(currency));
  };
  
  const handleSwapCurrencies = () => {
    dispatch(swapActions.setIsSwapped(!isSwapped));
  };
  
  return <View>{/* Your UI */}</View>;
}

// ============================================================================
// EXAMPLE 6: Using Format Utilities
// ============================================================================

import {
    cleanNumericInput,
    ensureSingleDollarSign,
    formatNumberWithCommas,
    getApproximateAmount,
    isValidNumber,
} from "@/src/modules/swap/utils/formatUtils";

function FormattingExample() {
  // Format large numbers with commas
  const formatted = formatNumberWithCommas("1000000"); // "1,000,000"
  
  // Ensure single dollar sign
  const withDollar = ensureSingleDollarSign("100", true); // "$100"
  
  // Clean input (remove special characters)
  const cleaned = cleanNumericInput("$1,234.56"); // "1234.56"
  
  // Get approximate amount
  const cryptoAmount = getApproximateAmount(0.00123456, true);  // "0.00123456"
  const fiatAmount = getApproximateAmount(123.456, false);      // "123.46"
  
  // Validate number
  const valid = isValidNumber("123.45"); // true
  
  return <View>{/* Use formatted values */}</View>;
}

// ============================================================================
// EXAMPLE 7: Theming
// ============================================================================


function ThemedComponent() {
  const theme = useTheme<Theme>();
  
  // All swap components automatically use your theme:
  // - theme.colors.primaryColor
  // - theme.colors.secondaryBackgroundColor
  // - theme.colors.bodyTextColor
  // - theme.colors.error
  // - etc.
  
  return <SellSectionNew /* props */ />;
}

// ============================================================================
// NOTES
// ============================================================================

/**
 * 1. The new implementation is fully backward compatible
 * 2. Old SwapScreen.tsx still works if needed
 * 3. All components are theme-aware
 * 4. Full TypeScript support
 * 5. Production ready (after replacing mock API)
 * 
 * For more details, see:
 * - src/modules/swap/SWAP_IMPLEMENTATION_GUIDE.md
 * - src/modules/swap/NEW_IMPLEMENTATION_SUMMARY.md
 */

export { };

