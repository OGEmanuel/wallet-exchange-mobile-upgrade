import icons from "@/assets/icons";
import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import TokenSelectorBottomSheet from "@/components/bottomsheets/TokenSelectorBottomSheet";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
// import { useNavigation } from "@react-navigation/native";
import { formatCurrency, formatNumber } from "@/src/core/utils/format-utils";
import { useTheme } from "@shopify/restyle";
import { IChain, ICurrency } from "@zap/blockchain-sdk";
import {
  getAddressRequirements,
  validateAddress,
} from "../../utils/addressValidation";
import { useSwapSDK } from "../hooks/useSwapSDK";

// Import modular components
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import {
  SupportedCurrency,
  useSupportedCurrencies,
} from "@/src/core/supported-currencies/supported-currencies-context";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  OrderDetailsSheet,
  SwapButton,
  SwapDetailsCard,
  TokenInputCard,
} from "../components";
import SwapProgressSheet from "../components/SwapProgressSheet";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const Swap = () => {
  const theme = useTheme<Theme>();
  const baseTokenRef = useRef<BottomSheet>(null);
  const targetTokenRef = useRef<BottomSheet>(null);

  const [cryptoAddress, setCryptoAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const orderDetailsSheetRef = useRef<any>(null);
  const progressSheetRef = useRef<any>(null);
  const [isUSDValueShowing, setIsUSDValueShowing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shouldShake, setShouldShake] = useState(false);
  // 🔹 Order creation state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);

  // 🔹 Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔹 Supported currencies context for refresh
  const { refreshSupportedCurrencies } = useSupportedCurrencies();
  const { isExchangeAuthenticated } = useExchangeAuth();

  // 🔹 SDK-based swap logic
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    marketRate,
    error,
    isLoading,
    // supportedCurrencies,
    setBaseCurrency,
    setTargetCurrency,
    handleBaseAmountChange,
    handleTargetAmountChange,
    handleBaseAmountFormat,
    handleTargetAmountFormat,
    handleSwapCurrencies,
    validateExchange,
    createOrder,
    fetchMarketRate,
  } = useSwapSDK();

  // 🔹 Validation and shake animation
  useEffect(() => {
    if (error) {
      setValidationError(error);
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    } else {
      setValidationError(null);
    }
  }, [error]);

  // 🔹 Animations hook
  const {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    handleSwapPress,
  } = useSwapAnimations();

  // 🔹 Set defaults once currencies load (handled in useSwapSDK)
  useEffect(() => {
    // Auto-open order details for testing (remove in production)
    // orderDetailsSheetRef.current?.open();
  }, []);

  // 🔹 Token selector handlers
  const openBaseTokenSelector = useCallback(() => {
    baseTokenRef.current?.snapToIndex(1);
  }, []);

  const openTargetTokenSelector = useCallback(() => {
    targetTokenRef.current?.snapToIndex(1);
  }, []);

  // 🔹 Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // Refresh supported currencies first
      await refreshSupportedCurrencies();

      // Then refresh rates if we have both currencies selected
      if (baseCurrency && targetCurrency && baseAmount > 0) {
        await fetchMarketRate(baseCurrency, targetCurrency, baseAmount, true);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    baseCurrency,
    targetCurrency,
    baseAmount,
    fetchMarketRate,
    refreshSupportedCurrencies,
  ]);

  // 🔹 Swap currencies (with animation)
  const handleSwapButtonPress = useCallback(() => {
    handleSwapPress();
    handleSwapCurrencies();
  }, [handleSwapPress, handleSwapCurrencies]);

  // 🔹 Address validation
  const validateCryptoAddress = useCallback(
    (address: string) => {
      if (
        !targetCurrency ||
        !(targetCurrency.chainId as Partial<IChain>)?.isEVM
      ) {
        setAddressError(null);
        return true;
      }

      if (!address.trim()) {
        setAddressError("Receiving address is required");
        return false;
      }

      const validation = validateAddress(address, targetCurrency);
      setAddressError(validation.error || null);
      return validation.isValid;
    },
    [targetCurrency]
  );

  // 🔹 Order creation
  const handleContinue = useCallback(async () => {
    if (!validateExchange()) return;

    // Validate crypto address if required
    if ((targetCurrency?.chainId as Partial<IChain>)?.isEVM) {
      if (!validateCryptoAddress(cryptoAddress)) {
        return;
      }
    }

    try {
      setIsCreatingOrder(true);
      setCreateOrderError(null);

      const orderResult = await createOrder(cryptoAddress.trim() || undefined);

      if (orderResult) {
        console.log("Order created successfully:", orderResult);
        setCreatedOrder(orderResult);
        orderDetailsSheetRef.current?.open();
      } else {
        setCreateOrderError("Failed to create order");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      setCreateOrderError(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }, [
    validateExchange,
    targetCurrency,
    validateCryptoAddress,
    cryptoAddress,
    createOrder,
  ]);

  const rateDetails = useMemo(() => {
    if (marketRate && baseCurrency && targetCurrency) {
      const tCurrency = targetCurrency.currencyId as Partial<ICurrency>;
      const bCurrency = baseCurrency.currencyId as Partial<ICurrency>;
      const isTargetStable = tCurrency.isStable || false;
      const isTargetCrypto = tCurrency.isCrypto || false;
      const isBaseStable = bCurrency.isStable || false;
      const isBaseCrypto = bCurrency.isCrypto || false;
      const precision = isTargetStable || isTargetCrypto ? 9 : 2;
      const basePrecision = isBaseStable || isBaseCrypto ? 9 : 2;

      return {
        rate: `1 ${bCurrency.symbol} ≈ ${
          !isTargetCrypto ? tCurrency.symbol : ""
        }${formatNumber(marketRate.rate, precision)} ${
          isTargetCrypto ? tCurrency.symbol : ""
        }`,
        fee: `${!isTargetCrypto ? tCurrency.symbol : ""}${formatNumber(
          marketRate.lpFee || 0,
          precision
        )} ${isTargetCrypto ? tCurrency.symbol : ""}`,
        min: `${!isBaseCrypto ? bCurrency.symbol : ""}${formatNumber(
          marketRate.minAmount || 0,
          precision
        )} ${isBaseCrypto ? bCurrency.symbol : ""}`,
        // Calculate base currency USD value from LP fee
        baseCurrencyUsdValue: formatCurrency(
          baseAmount * (marketRate.buyRate || 0),
          "USD"
        ),
      };
    } else {
      return null;
    }
  }, [marketRate, baseCurrency, targetCurrency]);

  return (
    <PageWrapper>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primaryColor}
            colors={[theme.colors.primaryColor]}
          />
        }
      >
        <Box flex={1} p="m">
          <CustomText variant="medium" textAlign="center" mb="m">
            Swap
          </CustomText>

          <ActivityTabar activeTab="EXCHANGE" onPress={() => {}} />

          {error && (
            <Box bg="secondaryBackgroundColor" p="s" borderRadius={8} mb="s">
              <CustomText variant="body" color="bodyTextColor">
                {error}
              </CustomText>
            </Box>
          )}

          {createOrderError && (
            <Box bg="secondaryBackgroundColor" p="s" borderRadius={8} mb="s">
              <CustomText variant="body" color="bodyTextColor">
                {createOrderError}
              </CustomText>
            </Box>
          )}
          <Box style={{ marginTop: 16 }}>
            <TokenInputCard
              amount={handleBaseAmountFormat()}
              tokenCode={(baseCurrency?.currencyId as Partial<ICurrency>)?.code}
              tokenSymbol={
                (baseCurrency?.currencyId as Partial<ICurrency>)?.symbol ||
                "Select"
              }
              tokenImage={
                baseCurrency?.image ||
                (baseCurrency?.currencyId as Partial<ICurrency>)?.logo
              }
              balance={
                baseCurrency
                  ? `${formatNumber((baseCurrency as any).balance || 0, 6)} ${
                      (baseCurrency?.currencyId as Partial<ICurrency>)?.symbol
                    }`
                  : "0"
              }
              onToggleUSDValueShowing={() => {
                setIsUSDValueShowing(!isUSDValueShowing);
              }}
              isUSDValueShowing={isUSDValueShowing}
              showBalance
              showMaxButton
              onTokenSelect={openBaseTokenSelector}
              onAmountChange={handleBaseAmountChange}
              animatedStyle={[
                sellContainerStyle,
                shouldShake && {
                  transform: [
                    { translateX: -10 },
                    { translateX: 10 },
                    { translateX: -10 },
                    { translateX: 10 },
                    { translateX: 0 },
                  ],
                },
              ]}
              usdValue={rateDetails?.baseCurrencyUsdValue || "$0.00"}
              isReceive={false}
              isCrypto={
                (baseCurrency?.currencyId as Partial<ICurrency>)?.isCrypto
              }
              hasError={!!validationError}
              errorColor={theme.colors.error}
            />
          </Box>

          {/* Validation Error Message */}
          {validationError && (
            <Box
              backgroundColor="error"
              borderRadius={8}
              padding="s"
              marginTop="s"
              marginBottom="s"
            >
              <CustomText variant="body" color="white" textAlign="center">
                {validationError}
              </CustomText>
            </Box>
          )}

          <Box position="relative" style={{ marginTop: 5, marginBottom: 16 }}>
            <TokenInputCard
              amount={handleTargetAmountFormat()}
              tokenCode={
                (targetCurrency?.currencyId as Partial<ICurrency>)?.code
              }
              tokenSymbol={
                (targetCurrency?.currencyId as Partial<ICurrency>)?.symbol ||
                "Select"
              }
              tokenImage={
                targetCurrency?.image ||
                (targetCurrency?.currencyId as Partial<ICurrency>)?.logo
              }
              animatedStyle={receiveContainerStyle}
              isReceive
              onTokenSelect={openTargetTokenSelector}
              onAmountChange={handleTargetAmountChange}
              isCrypto={
                (targetCurrency?.currencyId as Partial<ICurrency>)?.isCrypto
              }
            />
            <SwapButton
              onPress={handleSwapButtonPress}
              animatedStyle={swapButtonStyle}
              disabled={isAnimating || !baseCurrency || !targetCurrency}
            />
          </Box>

          {rateDetails && (
            <SwapDetailsCard
              provider="Zap Exchange"
              providerIcon={<ZapLogo width={20} height={20} />}
              zapFee={rateDetails.fee}
              rate={rateDetails.rate}
              minimumReceived={rateDetails.min}
              baseCurrencyUsdValue={rateDetails.baseCurrencyUsdValue}
              onProviderPress={() => {
                console.log("Provider pressed");
              }}
              isZapLinked={isExchangeAuthenticated}
            />
          )}

          {(targetCurrency?.chainId as Partial<IChain>)?.isEVM && (
            <>
              <CustomText
                variant="body"
                fontSize={12}
                color="bodyTextColor"
                mb="s"
              >
                Receiving Address
              </CustomText>
              <CustomText variant="body" color="bodyTextColor" mb="s">
                {getAddressRequirements(targetCurrency as SupportedCurrency)}
              </CustomText>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.surfaceContainer,
                    borderColor: addressError
                      ? theme.colors.primaryColor
                      : theme.colors.borderColor,
                    borderWidth: addressError ? 1 : 0,
                  },
                ]}
              >
                <TextInput
                  style={{
                    height: "100%",
                    width: "80%",
                    color: theme.colors.bodyTextColor,
                  }}
                  placeholder="Enter receiving address"
                  value={cryptoAddress}
                  onChangeText={(text) => {
                    setCryptoAddress(text);
                    validateCryptoAddress(text);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={{
                    height: 24,
                    width: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: theme.colors.borderColor,
                    borderRadius: 4,
                  }}
                >
                  <Image
                    source={icons.copy}
                    tintColor={theme.colors.bodyTextColor}
                    style={{ width: 12, height: 12 }}
                  />
                </TouchableOpacity>
              </View>
              {addressError && (
                <CustomText variant="body" color="primaryColor" mt="s">
                  {addressError}
                </CustomText>
              )}
            </>
          )}

          <Box mt="l">
            <CustomButton
              text={"Zap Now"}
              isLoading={isCreatingOrder}
              fontSize={14}
              width="100%"
              height={56}
              borderRadius={56}
              bgColor={theme.colors.primaryColor}
              onPress={handleContinue}
              disabled={
                isLoading ||
                isCreatingOrder ||
                !baseCurrency ||
                !targetCurrency ||
                baseAmount <= 0 ||
                ((targetCurrency?.chainId as Partial<IChain>)?.isEVM &&
                  (!cryptoAddress.trim() || !!addressError))
              }
            />
          </Box>
        </Box>
      </ScrollView>

      <OrderDetailsSheet
        ref={orderDetailsSheetRef}
        orderDetails={createdOrder}
        onClose={() => {
          progressSheetRef.current?.open();
        }}
        title="Order Created"
      />
      <SwapProgressSheet
        ref={progressSheetRef}
        orderDetails={createdOrder}
        onClose={() => {}}
        title="Order Created"
      />

      {/* Token Selector Bottom Sheets */}
      <TokenSelectorBottomSheet
        ref={baseTokenRef}
        mode="swap"
        onTokenSelect={(token) => {
          setBaseCurrency(token as any);
        }}
      />

      <TokenSelectorBottomSheet
        ref={targetTokenRef}
        mode="swap"
        onTokenSelect={(token) => {
          setTargetCurrency(token as any);
        }}
      />
    </PageWrapper>
  );
};

export default Swap;

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 8,
    padding: 8,
    height: 48,
    marginTop: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
