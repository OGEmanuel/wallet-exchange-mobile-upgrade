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
  selectSellAmount,
  selectSellCurrency,
  selectSellFiatAmount,
  selectSellIsInputtingFiat,
  selectSellIsRateLoading,
  selectSellMarketRate,
  selectSellSelectedPercentage,
  selectSellToken,
  setSellAmount,
  setSellFiatAmount,
  setSellIsInputtingFiat,
  setSellIsRateLoading,
  setSellMarketRate,
  setSellMaxAmount,
  setSellMinAmount,
  setSellSelectedPercentage,
  setSellStage
} from "@/src/modules/sell/presentation/state/sell-slice";
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
  onOpenBankAccounts?: () => void;
}

const AmountStep: React.FC<AmountStepProps> = ({ onOpenZapLink, onOpenBankAccounts }) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();
  const selectedToken = useSelector(selectSellToken);
  const selectedCurrency = useSelector(selectSellCurrency);
  const amount = useSelector(selectSellAmount);
  const fiatAmount = useSelector(selectSellFiatAmount);
  const isInputtingFiat = useSelector(selectSellIsInputtingFiat);
  const marketRate = useSelector(selectSellMarketRate);
  const isRateLoading = useSelector(selectSellIsRateLoading);
  const selectedPercentage = useSelector(selectSellSelectedPercentage);
  const { supportedCurrenciesForSwap } = useSupportedCurrencies();
  const { isUserLoggedIn, isExchangeAuthenticated } = useExchangeAuth();

  // Get token as ISupportedCurrency
  const tokenSupportedCurrency = useMemo(() => {
    if (!selectedToken) return null;
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
  // For sell: we're selling crypto to get fiat
  // - If inputting crypto (isBuyAmount = true), send buyAmount (crypto amount) - we're buying fiat
  // - If inputting fiat (isBuyAmount = false), send sellAmount (fiat amount) - we're selling fiat
  const fetchMarketRate = useCallback(async (
    fiatCurrency: ISupportedCurrency,
    cryptoCurrency: ISupportedCurrency,
    amount: number,
    isBuyAmount: boolean
  ) => {
    if (!fiatCurrency || !cryptoCurrency || amount <= 0) return;

    try {
      dispatch(setSellIsRateLoading(true));
      const sdk = zapSDKService.getSDK();
      if (!sdk) {
        throw new Error("SDK not initialized");
      }

      // For selling crypto to get fiat:
      // - buySupportedCurrencyId = crypto (base currency, what we start with)
      // - sellSupportedCurrencyId = fiat (what we're selling to get)
      const rateResponse = await zapSDKService.executeWithNetworkHandling(
        () => sdk.marketRates.getOrderRates({
          buySupportedCurrencyId: cryptoCurrency._id || "",
          sellSupportedCurrencyId: fiatCurrency._id || "",
          ...(isBuyAmount
            ? { buyAmount: amount }
            : { sellAmount: amount }
          ),
        }),
        "getOrderRates"
      );

      const responseData = rateResponse?.data as any;
      // For selling crypto to get fiat, the rate should be: fiat per crypto (e.g., 1 USDT = 1500 NGN)
      // With swapped currency IDs: buySupportedCurrencyId = crypto, sellSupportedCurrencyId = fiat
      // The API returns: buyAmount (crypto) and sellAmount (fiat)
      // Rate = sellAmount (fiat) / buyAmount (crypto) = fiat per crypto
      let rate = responseData?.rate || 0;
      
      // If rate is not provided, calculate from buyAmount/sellAmount
      if (!rate || rate <= 0) {
        if (responseData?.buyAmount && responseData?.sellAmount && responseData.buyAmount > 0) {
          // Calculate: fiat per crypto = sellAmount (fiat) / buyAmount (crypto)
          rate = responseData.sellAmount / responseData.buyAmount;
        } else if (responseData?.sellRate && responseData.sellRate > 0) {
          // Sometimes API provides sellRate (fiat per crypto)
          rate = responseData.sellRate;
        }
      }
      
      console.log("📊 Sell rate fetched:", { 
        rate, 
        buyAmount: responseData?.buyAmount, 
        sellAmount: responseData?.sellAmount,
        apiRate: responseData?.rate,
        sellRate: responseData?.sellRate,
        isBuyAmount, 
        amount,
        cryptoCurrencyId: cryptoCurrency._id,
        fiatCurrencyId: fiatCurrency._id
      });
      dispatch(setSellMarketRate(rate));
      dispatch(setSellMaxAmount(responseData?.maxAmount || null));
      dispatch(setSellMinAmount(responseData?.minAmount || null));
      dispatch(setSellIsRateLoading(false));
    } catch (error) {
      console.error("Failed to fetch market rate:", error);
      dispatch(setSellIsRateLoading(false));
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
    const numFiatAmount = parseFloat(fiatAmount.replace(/[^\d.]/g, "")) || 0;

    // With swapped IDs: buySupportedCurrencyId = crypto, sellSupportedCurrencyId = fiat
    // When inputting crypto: send buyAmount (crypto) -> isBuyAmount = true
    // When inputting fiat: send sellAmount (fiat) -> isBuyAmount = false
    if (!isInputtingFiat && numAmount > 0) {
      debouncedFetchRate(currencySupportedCurrency, tokenSupportedCurrency, numAmount, true);
    } else if (isInputtingFiat && numFiatAmount > 0) {
      debouncedFetchRate(currencySupportedCurrency, tokenSupportedCurrency, numFiatAmount, false);
    }
  }, [amount, fiatAmount, isInputtingFiat, currencySupportedCurrency, tokenSupportedCurrency, debouncedFetchRate]);

  // Calculate equivalent amount based on rate
  useEffect(() => {
    if (!marketRate || marketRate <= 0) return;

    const numAmount = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    const numFiatAmount = parseFloat(fiatAmount.replace(/[^\d.]/g, "")) || 0;

    if (!isInputtingFiat && numAmount > 0 && marketRate > 0) {
      // Calculate fiat amount from crypto
      const calculatedFiat = numAmount * marketRate;
      dispatch(setSellFiatAmount(calculatedFiat.toFixed(2)));
    } else if (isInputtingFiat && numFiatAmount > 0 && marketRate > 0) {
      // Calculate crypto amount from fiat
      const calculatedCrypto = numFiatAmount / marketRate;
      dispatch(setSellAmount(calculatedCrypto.toFixed(8)));
    }
  }, [marketRate, isInputtingFiat, amount, fiatAmount, dispatch]);

  // Toggle between fiat and crypto input
  const handleToggleInput = useCallback(() => {
    dispatch(setSellIsInputtingFiat(!isInputtingFiat));
  }, [dispatch, isInputtingFiat]);

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
  const currentInputValue = isInputtingFiat ? fiatAmount : amount;
  const equivalentValue = isInputtingFiat 
    ? (marketRate && parseFloat(fiatAmount.replace(/[^\d.]/g, "")) > 0 
        ? (parseFloat(fiatAmount.replace(/[^\d.]/g, "")) / marketRate).toFixed(8)
        : "0")
    : (marketRate && parseFloat(amount.replace(/[^\d.]/g, "")) > 0
        ? (parseFloat(amount.replace(/[^\d.]/g, "")) * marketRate).toFixed(2)
        : "0");

  // Get available balance for the cryptocurrency (what we're selling)
  const availableBalance = useMemo(() => {
    let balance = 0;
    if (tokenSupportedCurrency) {
      balance = (tokenSupportedCurrency as any).balance || 0;
    }
    
    if (balance === 0 && selectedToken) {
      balance = (selectedToken as any).balance || 0;
    }
    
    return balance;
  }, [tokenSupportedCurrency, selectedToken]);

  const handlePercentageSelect = (percentage: string) => {
    if (availableBalance <= 0) {
      return;
    }
    
    dispatch(setSellSelectedPercentage(percentage));
    
    let calculatedCryptoAmount = 0;
    if (percentage === "Max") {
      calculatedCryptoAmount = availableBalance;
    } else if (percentage === "half") {
      calculatedCryptoAmount = availableBalance / 2;
    } else if (percentage === "10%") {
      calculatedCryptoAmount = availableBalance * 0.1;
    }
    
    if (calculatedCryptoAmount > 0) {
      if (isInputtingFiat) {
        // If inputting fiat, convert crypto amount to fiat using rate
        if (marketRate && marketRate > 0) {
          const fiatValue = calculatedCryptoAmount * marketRate;
          dispatch(setSellFiatAmount(fiatValue.toFixed(2)));
        }
      } else {
        // If inputting crypto, set crypto amount directly
        dispatch(setSellAmount(calculatedCryptoAmount.toFixed(8)));
      }
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    if (selectedPercentage) {
      dispatch(setSellSelectedPercentage(null));
    }
    if (isInputtingFiat) {
      dispatch(setSellFiatAmount(cleaned));
    } else {
      dispatch(setSellAmount(cleaned));
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
        <Pressable onPress={() => dispatch(setSellStage("select-currency"))}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
        <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
          Sell
        </CustomText>
        <Pressable
          onPress={() => dispatch(setSellStage("select-currency"))}
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
              onPress={() => handlePercentageSelect(label)}
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
          const num = parseFloat(isInputtingFiat ? fiatAmount.replace(/[^\d.]/g, "") : amount.replace(/[^\d.]/g, ""));
          if (!selectedToken || !selectedCurrency || !num || num <= 0) return;
          
          // Sell flow always involves fiat, so require authentication
          if (!isExchangeAuthenticated) {
            onOpenZapLink?.();
            return;
          }
          
          // Open bank account selection
          onOpenBankAccounts?.();
        }}
        width={"100%"}
        borderRadius={50}
        disabled={(!amount || parseFloat(amount.replace(/[^\d.]/g, "")) <= 0) && 
                  (!fiatAmount || parseFloat(fiatAmount.replace(/[^\d.]/g, "")) <= 0)}
      />
    </BottomSheetView>
  );
};

export default AmountStep;
