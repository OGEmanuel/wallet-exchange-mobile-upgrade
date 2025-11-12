import { Box, CustomText } from "@/components/general";
import ZapLoader from "@/components/general/ZapLoader";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import useExchange from "@/src/modules/exchange/presentation/hooks/useExchange";
import {
  selectSellAmount,
  selectSellCreatedOrder,
  selectSellCurrency,
  selectSellFiatAmount,
  selectSellIsInputtingFiat,
  selectSellSelectedBank,
  selectSellToken,
  setSellCreatedOrder,
  setSellIsCreatingOrder,
  setSellSelectedBank,
  setSellStage,
} from "@/src/modules/sell/presentation/state/sell-slice";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { ICurrency } from "@zap/blockchain-sdk";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const OrderDetailsStep = () => {
  const dispatch = useDispatch();
  const selectedToken = useSelector(selectSellToken);
  const selectedCurrency = useSelector(selectSellCurrency);
  const amount = useSelector(selectSellAmount);
  const fiatAmount = useSelector(selectSellFiatAmount);
  const isInputtingFiat = useSelector(selectSellIsInputtingFiat);
  const selectedBank = useSelector(selectSellSelectedBank);
  const createdOrder = useSelector(selectSellCreatedOrder);
  const { supportedCurrenciesForSwap } = useSupportedCurrencies();
  const { isExchangeAuthenticated, exchangeUserData } = useExchangeAuth();
  const { fetchExchangeActivities } = useExchange();
  const hasCreatedOrder = useRef(false);

  // Get token and currency as ISupportedCurrency
  // For buy/sell mode, TokenSelector returns tokens from supportedCurrenciesForSwap,
  // so the selectedToken should already be an ISupportedCurrency with _id
  const tokenSupportedCurrency = React.useMemo(() => {
    if (!selectedToken) return null;
    
    // If selectedToken already has _id and matches a supported currency, use it directly
    if (selectedToken._id) {
      const found = supportedCurrenciesForSwap.find((c) => c._id === selectedToken._id);
      if (found) return found;
    }
    
    // Fallback: try to find by symbol
    const tokenSymbol = (selectedToken.currencyId as Partial<ICurrency>)?.symbol;
    if (tokenSymbol) {
      return supportedCurrenciesForSwap.find(
        (c) => (c.currencyId as Partial<ICurrency>)?.symbol === tokenSymbol
      ) || null;
    }
    
    return null;
  }, [selectedToken, supportedCurrenciesForSwap]);

  const currencySupportedCurrency = React.useMemo(() => {
    if (!selectedCurrency) return null;
    return supportedCurrenciesForSwap.find(
      (c) => (c.currencyId as Partial<ICurrency>)?.code === selectedCurrency.code
    ) || null;
  }, [selectedCurrency, supportedCurrenciesForSwap]);

  // selectedBank is now a UserBankAccount directly
  const selectedBankAccount = selectedBank;

  useEffect(() => {
    const createOrder = async () => {
      if (hasCreatedOrder.current) return;
      if (!tokenSupportedCurrency || !currencySupportedCurrency || !selectedBankAccount) return;

      hasCreatedOrder.current = true;
      dispatch(setSellIsCreatingOrder(true));

      try {
        // Sell flow always involves fiat (selling crypto to get fiat)
        // So we require full authentication
        if (!isExchangeAuthenticated) {
          throw new Error("Authentication required for fiat trades. Please log in.");
        }

        // Prepare order payload
        // For sell: we're selling crypto to get fiat
        // Use the appropriate amount based on input mode
        const cryptoAmount = parseFloat(amount.replace(/[^\d.]/g, ""));
        const fiatAmountValue = parseFloat(fiatAmount.replace(/[^\d.]/g, ""));

        // Validate required fields
        if (!tokenSupportedCurrency?._id) {
          throw new Error("Token supported currency ID is missing");
        }
        if (!currencySupportedCurrency?._id) {
          throw new Error("Currency supported currency ID is missing");
        }
        if (!selectedBankAccount?._id) {
          throw new Error("Bank account ID is missing");
        }

        const orderPayload: any = {
          buySupportedCurrencyId: tokenSupportedCurrency._id, // Crypto (base currency)
          sellSupportedCurrencyId: currencySupportedCurrency._id, // Fiat (what we're selling to get)
          withdrawalAccountId: selectedBankAccount._id, // Bank account to receive fiat
        };

        // Add the appropriate amount based on what the user is inputting
        // With swapped IDs: buySupportedCurrencyId = crypto, sellSupportedCurrencyId = fiat
        if (!isInputtingFiat && cryptoAmount > 0) {
          orderPayload.buyAmount = cryptoAmount; // Buying crypto (base currency)
        } else if (isInputtingFiat && fiatAmountValue > 0) {
          orderPayload.sellAmount = fiatAmountValue; // Selling fiat amount
        } else {
          throw new Error(`Invalid amount: cryptoAmount=${cryptoAmount}, fiatAmount=${fiatAmountValue}, isInputtingFiat=${isInputtingFiat}`);
        }

        // Validate amounts are valid numbers
        if (orderPayload.sellAmount && (isNaN(orderPayload.sellAmount) || orderPayload.sellAmount <= 0)) {
          throw new Error(`Invalid sellAmount: ${orderPayload.sellAmount}`);
        }
        if (orderPayload.buyAmount && (isNaN(orderPayload.buyAmount) || orderPayload.buyAmount <= 0)) {
          throw new Error(`Invalid buyAmount: ${orderPayload.buyAmount}`);
        }

        console.log("📦 Creating sell order payload:", JSON.stringify(orderPayload, null, 2));
        console.log("📦 Token supported currency:", tokenSupportedCurrency?._id, (tokenSupportedCurrency?.currencyId as any)?.symbol);
        console.log("📦 Currency supported currency:", currencySupportedCurrency?._id, (currencySupportedCurrency?.currencyId as any)?.code);
        console.log("📦 Selected bank account:", selectedBankAccount?._id, selectedBankAccount?.name);
        console.log("📦 Amounts:", { cryptoAmount, fiatAmountValue, isInputtingFiat });

        // Create order using SDK
        const order = await zapSDKService.createOrder(orderPayload);

        if (order) {
          dispatch(setSellCreatedOrder(order));
          
          // Refresh exchange history
          if (exchangeUserData?._id) {
            try {
              await fetchExchangeActivities({
                user: exchangeUserData,
                page: 1,
                limit: 10,
              });
            } catch (error) {
              console.error("Failed to refresh exchange history:", error);
            }
          }
        } else {
          throw new Error("Failed to create order");
        }
      } catch (error: any) {
        console.error("Order creation failed:", error);
        dispatch(setSellIsCreatingOrder(false));
        hasCreatedOrder.current = false;
        
        // Check if it's a circuit breaker error
        if (error?.message?.includes("circuit breaker")) {
          const circuitBreakerStatus = zapSDKService.getCircuitBreakerStatus();
          const waitTimeSeconds = Math.ceil(circuitBreakerStatus.timeUntilReset / 1000);
          console.error(
            `Circuit breaker is open. Please wait ${waitTimeSeconds} seconds before trying again.`
          );
          // TODO: Show user-friendly error message (e.g., via Alert or toast)
          return;
        }
        
        // Check if it's an "Account not found" error
        if (error?.message?.includes("Account not found") || error?.message?.includes("account not found")) {
          console.error("Bank account not found. The account may have been deleted. Please select a different account.");
          // Reset the selected bank account so user can select a new one
          dispatch(setSellSelectedBank(null));
          // Navigate back to bank selection step
          dispatch(setSellStage("select-bank"));
          return;
        }
        
        // Error will be handled by parent component
      } finally {
        dispatch(setSellIsCreatingOrder(false));
      }
    };

    createOrder();
  }, [
    tokenSupportedCurrency,
    currencySupportedCurrency,
    selectedBankAccount,
    amount,
    fiatAmount,
    isInputtingFiat,
    isExchangeAuthenticated,
    dispatch,
    exchangeUserData,
    fetchExchangeActivities,
  ]);

  // If order is created, unmount this component (order details sheet will show)
  if (createdOrder) {
    return null;
  }

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <Box flex={1} justifyContent="center" alignItems="center">
        <ZapLoader size={80} showText={true} text="Creating order..." />
        <CustomText variant="body" color="disabledTextColor" mt="m" textAlign="center">
          Please wait while we create your order
        </CustomText>
      </Box>
    </BottomSheetView>
  );
};

export default OrderDetailsStep;

