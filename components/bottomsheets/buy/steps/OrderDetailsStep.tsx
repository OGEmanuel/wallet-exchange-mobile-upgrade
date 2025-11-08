import { Box, CustomText } from "@/components/general";
import ZapLoader from "@/components/general/ZapLoader";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { useWallet } from "@/src/core/wallet/wallet-context";
import {
  selectBuyAmount,
  selectBuyCreatedOrder,
  selectBuyCryptoAmount,
  selectBuyCurrency,
  selectBuyIsInputtingFiat,
  selectBuyToken,
  setBuyCreatedOrder,
  setBuyIsCreatingOrder,
  setBuyStage,
} from "@/src/modules/buy/presentation/state/buy-slice";
import useExchange from "@/src/modules/exchange/presentation/hooks/useExchange";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { IChain, ICurrency } from "@zap/blockchain-sdk";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const OrderDetailsStep = () => {
  const dispatch = useDispatch();
  const selectedToken = useSelector(selectBuyToken);
  const selectedCurrency = useSelector(selectBuyCurrency);
  const amount = useSelector(selectBuyAmount);
  const cryptoAmount = useSelector(selectBuyCryptoAmount);
  const isInputtingFiat = useSelector(selectBuyIsInputtingFiat);
  const createdOrder = useSelector(selectBuyCreatedOrder);
  const { supportedCurrenciesForSwap } = useSupportedCurrencies();
  const { isExchangeAuthenticated, exchangeUserData } = useExchangeAuth();
  const { fetchExchangeActivities } = useExchange();
  const { getAddress, mainUserWalletGroup } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
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

  // Get the chain symbol from the token
  const tokenChain = selectedToken?.chainId as Partial<IChain>;
  const chainSymbol = tokenChain?.symbol || "";

  // Fetch wallet address for the selected token's chain
  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!chainSymbol || !mainUserWalletGroup?._id) {
        setIsLoadingAddress(false);
        return;
      }

      try {
        setIsLoadingAddress(true);
        const address = await getAddress(chainSymbol, mainUserWalletGroup._id);
        if (address) {
          setWalletAddress(address);
          console.log(`✅ Wallet address for ${chainSymbol}: ${address}`);
        } else {
          console.error(`❌ Failed to get wallet address for ${chainSymbol}`);
        }
      } catch (error) {
        console.error("Error fetching wallet address:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchWalletAddress();
  }, [chainSymbol, mainUserWalletGroup, getAddress]);

  useEffect(() => {
    const createOrder = async () => {
      if (hasCreatedOrder.current) return;
      if (!tokenSupportedCurrency || !currencySupportedCurrency || !walletAddress || isLoadingAddress) return;

      hasCreatedOrder.current = true;
      dispatch(setBuyIsCreatingOrder(true));

      try {
        // Buy flow always involves fiat (selling fiat to buy crypto)
        // So we require full authentication, not guest login
        if (!isExchangeAuthenticated) {
          throw new Error("Authentication required for fiat trades. Please log in.");
        }

        // Prepare order payload
        // When inputting fiat: we're selling fiat to buy crypto, so use sellAmount
        // When inputting crypto: we're buying crypto with fiat, so use buyAmount
        const fiatAmount = parseFloat(amount.replace(/[^\d.]/g, ""));
        const cryptoAmountValue = parseFloat(cryptoAmount.replace(/[^\d.]/g, ""));

        // Validate required fields
        if (!tokenSupportedCurrency?._id) {
          throw new Error("Token supported currency ID is missing");
        }
        if (!currencySupportedCurrency?._id) {
          throw new Error("Currency supported currency ID is missing");
        }
        if (!walletAddress) {
          throw new Error("Wallet address is missing");
        }

        const orderPayload: any = {
          buySupportedCurrencyId: currencySupportedCurrency._id, // Fiat (base currency)
          sellSupportedCurrencyId: tokenSupportedCurrency._id, // Crypto (target currency)
          withdrawalAddress: walletAddress,
        };

        // Add the appropriate amount based on what the user is inputting
        // With swapped IDs: buySupportedCurrencyId = fiat, sellSupportedCurrencyId = crypto
        if (isInputtingFiat && fiatAmount > 0) {
          orderPayload.buyAmount = fiatAmount; // Buying fiat (base currency)
        } else if (!isInputtingFiat && cryptoAmountValue > 0) {
          orderPayload.sellAmount = cryptoAmountValue; // Selling crypto (target currency)
        } else {
          throw new Error(`Invalid amount: fiatAmount=${fiatAmount}, cryptoAmount=${cryptoAmountValue}, isInputtingFiat=${isInputtingFiat}`);
        }

        // Validate amounts are valid numbers
        if (orderPayload.sellAmount && (isNaN(orderPayload.sellAmount) || orderPayload.sellAmount <= 0)) {
          throw new Error(`Invalid sellAmount: ${orderPayload.sellAmount}`);
        }
        if (orderPayload.buyAmount && (isNaN(orderPayload.buyAmount) || orderPayload.buyAmount <= 0)) {
          throw new Error(`Invalid buyAmount: ${orderPayload.buyAmount}`);
        }

        console.log("Creating buy order:", JSON.stringify(orderPayload, null, 2));
        console.log("Token supported currency:", tokenSupportedCurrency);
        console.log("Currency supported currency:", currencySupportedCurrency);

        // Create order using SDK
        const order = await zapSDKService.createOrder(orderPayload);

        if (order) {
          dispatch(setBuyCreatedOrder(order));
          
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
        dispatch(setBuyIsCreatingOrder(false));
        hasCreatedOrder.current = false;
        
        // Check if it's a circuit breaker error
        if (error?.message?.includes("circuit breaker")) {
          const circuitBreakerStatus = zapSDKService.getCircuitBreakerStatus();
          const waitTimeSeconds = Math.ceil(circuitBreakerStatus.timeUntilReset / 1000);
          console.error(
            `Circuit breaker is open. Please wait ${waitTimeSeconds} seconds before trying again.`
          );
          // Show error and go back to amount step
          dispatch(setBuyStage("buy"));
          // TODO: Show user-friendly error message (e.g., via Alert or toast)
          return;
        }
        
        // Show error and go back to amount step
        dispatch(setBuyStage("buy"));
      } finally {
        dispatch(setBuyIsCreatingOrder(false));
      }
    };

    createOrder();
  }, [
    tokenSupportedCurrency,
    currencySupportedCurrency,
    walletAddress,
    isLoadingAddress,
    amount,
    cryptoAmount,
    isInputtingFiat,
    isExchangeAuthenticated,
    dispatch,
    exchangeUserData,
    fetchExchangeActivities,
  ]);

  if (isLoadingAddress) {
    return (
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ZapLoader size={80} showText={true} text="Getting wallet address..." />
          <CustomText variant="body" color="disabledTextColor" mt="m" textAlign="center">
            Please wait while we fetch your wallet address
          </CustomText>
        </Box>
      </BottomSheetView>
    );
  }

  if (!walletAddress) {
    return (
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <CustomText variant="body" color="error" textAlign="center">
            Failed to get wallet address. Please try again.
          </CustomText>
        </Box>
      </BottomSheetView>
    );
  }

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

