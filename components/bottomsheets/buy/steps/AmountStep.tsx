import icons from "@/assets/icons";
import images from "@/assets/images";
import { ThemedSwap2Icon } from "@/assets/svg/wallet-icons-components";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import SmartImage from "@/components/general/SmartImage";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { PortfolioService } from "@/services/portfolio.service";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { formatNumber } from "@/src/core/utils/format-utils";
import {
  selectBuyAmount,
  selectBuyCryptoAmount,
  selectBuyCurrency,
  selectBuyIsInputtingFiat,
  selectBuyIsRateLoading,
  selectBuyMarketRate,
  selectBuyMaxAmount,
  selectBuySelectedPercentage,
  selectBuyToken,
  setBuyAmount,
  setBuyCryptoAmount,
  setBuyIsInputtingFiat,
  setBuyIsRateLoading,
  setBuyMarketRate,
  setBuyMaxAmount,
  setBuyMinAmount,
  setBuySelectedPercentage,
  setBuyStage
} from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ICurrency, ISupportedCurrency } from "@zap/blockchain-sdk";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

// Debounce helper
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface AmountStepProps {
  onOpenZapLink?: () => void;
}

const AmountStep: React.FC<AmountStepProps> = ({ onOpenZapLink }) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();
  const selectedToken = useSelector(selectBuyToken);
  const selectedCurrency = useSelector(selectBuyCurrency);
  const amount = useSelector(selectBuyAmount);
  const cryptoAmount = useSelector(selectBuyCryptoAmount);
  const isInputtingFiat = useSelector(selectBuyIsInputtingFiat);
  const marketRate = useSelector(selectBuyMarketRate);
  const isRateLoading = useSelector(selectBuyIsRateLoading);
  const maxAmount = useSelector(selectBuyMaxAmount);
  const selectedPercentage = useSelector(selectBuySelectedPercentage);
  const { supportedCurrenciesForSwap } = useSupportedCurrencies();
  const { isUserLoggedIn, isExchangeAuthenticated } = useExchangeAuth();

  // Get token as ISupportedCurrency
  const tokenSupportedCurrency = useMemo(() => {
    if (!selectedToken) return null;
    // Find the token in supportedCurrenciesForSwap
    const tokenId = selectedToken._id || (selectedToken.currencyId as Partial<ICurrency>)?.symbol;
    return supportedCurrenciesForSwap.find(
      (c) => c._id === tokenId || 
      (c.currencyId as Partial<ICurrency>)?.symbol === (selectedToken.currencyId as Partial<ICurrency>)?.symbol
    ) || null;
  }, [selectedToken, supportedCurrenciesForSwap]);

  // Get currency as ISupportedCurrency
  const currencySupportedCurrency = useMemo(() => {
    if (!selectedCurrency) return null;
    return supportedCurrenciesForSwap.find(
      (c) => (c.currencyId as Partial<ICurrency>)?.code === selectedCurrency.code
    ) || null;
  }, [selectedCurrency, supportedCurrenciesForSwap]);

  // Fetch market rate
  const fetchMarketRate = useCallback(async (
    fiatCurrency: ISupportedCurrency,
    cryptoCurrency: ISupportedCurrency,
    amount: number,
    isBuyAmount: boolean
  ) => {
    if (!fiatCurrency || !cryptoCurrency || amount <= 0) return;

    try {
      dispatch(setBuyIsRateLoading(true));
      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // For buying crypto with fiat:
      // - buySupportedCurrencyId = fiat (base currency, what we start with)
      // - sellSupportedCurrencyId = crypto (target currency, what we're buying)
      const rateResponse = await zapSDKService.executeWithNetworkHandling(
        () => sdk.marketRates.getOrderRates({
          buySupportedCurrencyId: fiatCurrency._id || "",
          sellSupportedCurrencyId: cryptoCurrency._id || "",
          ...(isBuyAmount
            ? { buyAmount: amount }
            : { sellAmount: amount }
          ),
        }),
        "getOrderRates"
      );

      const responseData = rateResponse?.data as any;
      // For buying crypto with fiat, the rate should be: fiat per crypto (e.g., 1 USDT = 1500 NGN)
      // With swapped IDs: buySupportedCurrencyId = fiat, sellSupportedCurrencyId = crypto
      // The API returns: buyAmount (fiat) and sellAmount (crypto)
      // Try to use API rate first, then calculate if needed
      let rate = responseData?.rate || 0;
      
      // If rate is not provided or seems wrong, calculate from buyAmount/sellAmount
      if (!rate || rate <= 0) {
        if (responseData?.buyAmount && responseData?.sellAmount && responseData.sellAmount > 0) {
          // With buySupportedCurrencyId = fiat, sellSupportedCurrencyId = crypto:
          // buyAmount = fiat amount, sellAmount = crypto amount
          // Rate = buyAmount (fiat) / sellAmount (crypto) = fiat per crypto
          const calculatedRate = responseData.buyAmount / responseData.sellAmount;
          // If calculated rate is < 1, it might be inverted, try the inverse
          if (calculatedRate < 1 && calculatedRate > 0) {
            rate = 1 / calculatedRate; // Invert if it seems wrong
          } else {
            rate = calculatedRate;
          }
        } else if (responseData?.buyRate && responseData.buyRate > 0) {
          rate = responseData.buyRate;
        } else if (responseData?.sellRate && responseData.sellRate > 0) {
          // If only sellRate is available, it might need inversion
          rate = responseData.sellRate;
        }
      }
      
      // If rate is still < 1 and we have amounts, it's likely inverted
      if (rate > 0 && rate < 1 && responseData?.buyAmount && responseData?.sellAmount && responseData.sellAmount > 0) {
        const invertedRate = responseData.buyAmount / responseData.sellAmount;
        if (invertedRate > 1) {
          rate = invertedRate; // Use the inverted calculation
        }
      }
      
      console.log("📊 Buy rate fetched:", { 
        rate, 
        buyAmount: responseData?.buyAmount, 
        sellAmount: responseData?.sellAmount,
        apiRate: responseData?.rate,
        buyRate: responseData?.buyRate,
        isBuyAmount, 
        amount,
        fiatCurrencyId: fiatCurrency._id,
        cryptoCurrencyId: cryptoCurrency._id
      });
      dispatch(setBuyMarketRate(rate));
      dispatch(setBuyMaxAmount(responseData?.maxAmount || null));
      dispatch(setBuyMinAmount(responseData?.minAmount || null));
      dispatch(setBuyIsRateLoading(false));
    } catch (error) {
      console.error("Failed to fetch market rate:", error);
      dispatch(setBuyIsRateLoading(false));
    }
  }, [dispatch]);

  // Debounced rate fetching
  const debouncedFetchRate = useRef(
    debounce((fiatCurrency: ISupportedCurrency, cryptoCurrency: ISupportedCurrency, amount: number, isBuyAmount: boolean) => {
      fetchMarketRate(fiatCurrency, cryptoCurrency, amount, isBuyAmount);
    }, 500)
  ).current;

  // Fetch rate when amount changes
  useEffect(() => {
    if (!currencySupportedCurrency || !tokenSupportedCurrency) return;
    
    const numAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    const numCryptoAmount = parseFloat(cryptoAmount.replace(/[^\d.]/g, "")) || 0;

    // With swapped IDs: buySupportedCurrencyId = fiat, sellSupportedCurrencyId = crypto
    // When inputting fiat: send buyAmount (fiat) -> isBuyAmount = true
    // When inputting crypto: send sellAmount (crypto) -> isBuyAmount = false
    if (isInputtingFiat && numAmount > 0) {
      debouncedFetchRate(currencySupportedCurrency, tokenSupportedCurrency, numAmount, true);
    } else if (!isInputtingFiat && numCryptoAmount > 0) {
      debouncedFetchRate(currencySupportedCurrency, tokenSupportedCurrency, numCryptoAmount, false);
    }
  }, [amount, cryptoAmount, isInputtingFiat, currencySupportedCurrency, tokenSupportedCurrency, debouncedFetchRate]);

  // Calculate equivalent amount based on rate
  useEffect(() => {
    if (!marketRate || !marketRate) return;

    const numAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    const numCryptoAmount = parseFloat(cryptoAmount.replace(/[^\d.]/g, "")) || 0;

    if (isInputtingFiat && numAmount > 0 && marketRate > 0) {
      // Calculate crypto amount from fiat
      const calculatedCrypto = numAmount / marketRate;
      dispatch(setBuyCryptoAmount(calculatedCrypto.toFixed(8)));
    } else if (!isInputtingFiat && numCryptoAmount > 0 && marketRate > 0) {
      // Calculate fiat amount from crypto
      const calculatedFiat = numCryptoAmount * marketRate;
      dispatch(setBuyAmount(calculatedFiat.toFixed(2)));
    }
  }, [marketRate, isInputtingFiat, amount, cryptoAmount, dispatch]);

  // Toggle between fiat and crypto input
  const handleToggleInput = useCallback(() => {
    dispatch(setBuyIsInputtingFiat(!isInputtingFiat));
  }, [dispatch, isInputtingFiat]);

  const onContinueAmount = () => {
    const numAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    const numCryptoAmount = parseFloat(cryptoAmount.replace(/[^\d.]/g, "")) || 0;
    if (!selectedToken || !selectedCurrency || (numAmount <= 0 && numCryptoAmount <= 0)) return;
    dispatch(setBuyStage("transfer_details"));
  };

  // Get token symbol and image
  const tokenSymbol = selectedToken
    ? (selectedToken.currencyId as Partial<ICurrency>)?.symbol || 
      (selectedToken as any)?.symbol || 
      "BTC"
    : "BTC";
  
  const tokenImage = selectedToken
    ? selectedToken.image || 
      (selectedToken.currencyId as Partial<ICurrency>)?.logo || 
      "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    : "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";

  // Get currency symbol and flag
  const currencySymbol = selectedCurrency?.code || "NGN";
  const currencyFlag = selectedCurrency?.flag || "";

  // Get current input value and equivalent
  const currentInputValue = isInputtingFiat ? amount : cryptoAmount;
  const equivalentValue = isInputtingFiat 
    ? (marketRate && parseFloat(amount.replace(/[^\d.]/g, "")) > 0 
        ? (parseFloat(amount.replace(/[^\d.]/g, "")) / marketRate).toFixed(8)
        : "0")
    : (marketRate && parseFloat(cryptoAmount.replace(/[^\d.]/g, "")) > 0
        ? (parseFloat(cryptoAmount.replace(/[^\d.]/g, "")) * marketRate).toFixed(2)
        : "0");

  // Get available balance for the cryptocurrency (what we're buying)
  // For buying, use the crypto balance if available, otherwise use maxAmount from API
  const availableBalance = useMemo(() => {
    // First try to get balance from tokenSupportedCurrency (enriched with balances)
    let balance = 0;
    if (tokenSupportedCurrency) {
      balance = (tokenSupportedCurrency as any).balance || 0;
    }
    
    // If no balance found, try to get it from selectedToken directly
    if (balance === 0 && selectedToken) {
      balance = (selectedToken as any).balance || 0;
    }
    
    // If still no balance and we have maxAmount from API, use that as fallback
    // This allows buttons to work even when buying crypto you don't have yet
    if (balance === 0 && maxAmount && maxAmount > 0) {
      balance = maxAmount;
    }
    
    console.log("💰 Available balance:", { 
      tokenSymbol, 
      balance, 
      fromSupportedCurrency: tokenSupportedCurrency ? (tokenSupportedCurrency as any).balance : null,
      fromSelectedToken: selectedToken ? (selectedToken as any).balance : null,
      fromMaxAmount: maxAmount,
      tokenSupportedCurrencyId: tokenSupportedCurrency?._id,
      hasBalance: balance > 0
    });
    return balance;
  }, [tokenSupportedCurrency, selectedToken, tokenSymbol, maxAmount]);

  const handlePercentageSelect = (percentage: string) => {
    console.log("🔘 Percentage button clicked:", { percentage, availableBalance, marketRate, isInputtingFiat });
    
    if (availableBalance <= 0) {
      console.log("⚠️ No balance available");
      return; // Don't do anything if no balance
    }
    
    // Set the selected percentage for visual feedback
    dispatch(setBuySelectedPercentage(percentage));
    
    let calculatedCryptoAmount = 0;
    if (percentage === "Max") {
      calculatedCryptoAmount = availableBalance;
    } else if (percentage === "half") {
      calculatedCryptoAmount = availableBalance / 2;
    } else if (percentage === "10%") {
      calculatedCryptoAmount = availableBalance * 0.1;
    }
    
    console.log("📊 Calculated crypto amount:", calculatedCryptoAmount);
    
    if (calculatedCryptoAmount > 0) {
      if (isInputtingFiat) {
        // If inputting fiat, convert crypto amount to fiat using rate
        if (marketRate && marketRate > 0) {
          const fiatAmount = calculatedCryptoAmount * marketRate;
          console.log("💰 Setting fiat amount:", fiatAmount);
          dispatch(setBuyAmount(fiatAmount.toFixed(2)));
        } else {
          console.log("⚠️ No market rate available for conversion");
        }
      } else {
        // If inputting crypto, set crypto amount directly
        console.log("🪙 Setting crypto amount:", calculatedCryptoAmount);
        dispatch(setBuyCryptoAmount(calculatedCryptoAmount.toFixed(8)));
      }
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    // Clear selected percentage when user manually types
    if (selectedPercentage) {
      dispatch(setBuySelectedPercentage(null));
    }
    if (isInputtingFiat) {
      dispatch(setBuyAmount(cleaned));
    } else {
      dispatch(setBuyCryptoAmount(cleaned));
    }
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
      >
        <Pressable onPress={() => dispatch(setBuyStage("currency_select"))}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
        <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
          Buy
        </CustomText>
        <Pressable
          onPress={() => dispatch(setBuyStage("currency_select"))}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.secondaryBackgroundColor,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          {currencyFlag ? (
            <SmartImage
              source={{ uri: currencyFlag }}
              width={18}
              height={18}
              borderRadius={18}
            />
          ) : (
            <Image
              source={images.nigeria}
              style={{ width: 18, height: 18, borderRadius: 30 }}
              contentFit="cover"
            />
          )}
          <Image
            source={icons.down}
            tintColor={isDark ? "white" : "black"}
            style={{ width: 20, height: 20 }}
          />
        </Pressable>
      </Box>

      <Box
        alignItems="center"
        alignContent="center"
        justifyContent="center"
        flexDirection="row"
        gap="s"
        marginTop="xl"
      >
        {isInputtingFiat ? (
          <>
            <SmartImage
              source={{ uri: currencyFlag || "" }}
              width={25}
              height={25}
              borderRadius={12.5}
            />
            <CustomText variant="bodyBold" fontSize={14}>
              {currencySymbol}
            </CustomText>
          </>
        ) : (
          <>
            <SmartImage
              source={{ uri: tokenImage }}
              width={25}
              height={25}
              borderRadius={12.5}
            />
            <CustomText variant="bodyBold" fontSize={14}>
              {tokenSymbol}
            </CustomText>
          </>
        )}
      </Box>

      <View style={{ alignItems: "center", marginTop: 25, position: "relative" }}>
        <TextInput
          value={currentInputValue}
          autoFocus={true}
          onChangeText={handleAmountChange}
          placeholder="0"
          keyboardType="numeric"
          style={{
            fontSize: 36,
            color: theme.colors.bodyTextColor,
            fontWeight: "700",
            textAlign: "center",
          }}
        />
        <CustomText variant="body" color="bodyTextColor" fontSize={16}>
          {isInputtingFiat 
            ? `${formatNumber(parseFloat(equivalentValue || "0"), 8)} ${tokenSymbol}`
            : `${currencySymbol} ${formatNumber(parseFloat(equivalentValue || "0"), 2)}`
          }
        </CustomText>
        
        {/* Switcher Button */}
        <Pressable
          onPress={handleToggleInput}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: [{ translateY: -15 }],
            width: 30,
            height: 30,
            borderRadius: 8,
            backgroundColor: theme.colors.tabBarActiveColor,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ThemedSwap2Icon 
            darkModeColor="black" 
            lightModeColor="black" 
            width={16}
            height={16}
          />
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 40,
          gap: 10,
        }}
      >
        {["10%", "half", "Max"].map((label, i) => {
          const hasBalance = availableBalance > 0;
          const isDisabled = !hasBalance;
          const isSelected = selectedPercentage === label;
          
          return (
            <Pressable
              key={i}
              onPress={() => {
                console.log("🔘 Button pressed:", label);
                handlePercentageSelect(label);
              }}
              disabled={isDisabled}
              style={{
                backgroundColor: isSelected
                  ? theme.colors.tabBarLemonColor
                  : theme.colors.secondaryBackgroundColor,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isSelected
                  ? theme.colors.tabBarActiveColor
                  : theme.colors.secondaryBackgroundColor,
                paddingVertical: 5,
                paddingHorizontal: 18,
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <CustomText
                color={isSelected ? "tabBarActiveColor" : "disabledTextColor"}
                variant="body"
              >
                {label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={onOpenZapLink}>
        <Box
          borderColor="bodyTextColor"
          marginBottom="m"
          borderRadius={10}
          padding="m"
          marginTop="2xl"
          borderWidth={1}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          style={{
            borderColor: theme.colors.disabledTextColor,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap="s">
            <Image source={images.zapLogo} style={{ width: 16, height: 16 }} />
            <CustomText variant="body" color="bodyTextColor">
              Zap Exchange
            </CustomText>
            <Image 
              source={images.linked} 
              style={{ 
                width: 16, 
                height: 16,
                tintColor: isUserLoggedIn 
                  ? theme.colors.secondaryColor 
                  : theme.colors.placeholderTextColor
              }} 
            />
          </Box>
          <CustomText variant="body" color="disabledTextColor">
            {isRateLoading ? (
              "Loading rate..."
            ) : marketRate && marketRate > 0 ? (
              `1 ${tokenSymbol} ≈ ${PortfolioService.formatBalance(marketRate)} ${currencySymbol}`
            ) : (
              `1 ${tokenSymbol} ≈ -- ${currencySymbol}`
            )}
          </CustomText>
        </Box>
      </Pressable>

      <CustomButton
        text="Continue"
        onPress={() => {
          const num = parseFloat(isInputtingFiat ? amount.replace(/[^\d.]/g, "") : cryptoAmount.replace(/[^\d.]/g, ""));
          if (!selectedToken || !selectedCurrency || !num || num <= 0) return;
          
          // Buy flow always involves fiat, so require authentication
          if (!isExchangeAuthenticated) {
            // Open Zap link modal to prompt login
            onOpenZapLink?.();
            return;
          }
          
          // Go directly to order creation (wallet address will be fetched automatically)
          dispatch(setBuyStage("order_details"));
        }}
        width={"100%"}
        borderRadius={50}
        disabled={(!amount || parseFloat(amount.replace(/[^\d.]/g, "")) <= 0) && 
                  (!cryptoAmount || parseFloat(cryptoAmount.replace(/[^\d.]/g, "")) <= 0)}
      />
    </BottomSheetView>
  );
};

export default AmountStep;
