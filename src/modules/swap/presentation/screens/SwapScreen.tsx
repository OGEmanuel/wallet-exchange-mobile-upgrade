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
import ButtonLightDecoration from "@/components/general/ButtonLightDecoration";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
// import { useNavigation } from "@react-navigation/native";
import { formatCurrency, formatNumber } from "@/src/core/utils/format-utils";
import { useTheme } from "@shopify/restyle";
import { Bank, IChain, ICurrency, UserBankAccount } from "@zap/blockchain-sdk";
import * as Clipboard from "expo-clipboard";
import { useOrderStatusUpdates } from "../hooks/useOrderStatusUpdates";
import { useSwapSDK } from "../hooks/useSwapSDK";

// Import modular components
import { ZapperSiginBottomSheet } from "@/components";
import { AnimatedGradientBottomSheetRef } from "@/components/bottomsheets/AnimatedGradientBottomSheet";
import BankAccountsBottomSheet from "@/components/bottomsheets/BankAccountsBottomSheet";
import ZapLinkBottomSheet from "@/components/bottomsheets/ZapLinkBottomSheet";
import KYCFlowManager from "@/components/kyc/KYCFlowManager";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import zapSDKService from "@/src/core/sdk/zap-sdk.service";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { getDeviceIpAndLocation } from "@/src/core/utils/device-info-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import useExchange from "@/src/modules/exchange/presentation/hooks/useExchange";
import { userHasAtleastOneDocumentApproved } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { ArrowDown2 } from "iconsax-react-nativejs";
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
import SwapProgressSheet, {
  OrderDetailsSheetRef,
} from "../components/SwapProgressSheet";
import { useBankAccounts } from "../hooks/useBankAccounts";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const Swap = () => {
  const theme = useTheme<Theme>();
  const baseTokenRef = useRef<BottomSheet>(null);
  const targetTokenRef = useRef<BottomSheet>(null);
  const addressRef = useRef<TextInput>(null);
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);
  const bankAccountsBottomSheetRef = useRef<BottomSheet>(null);
  const zapLinkBottomSheetRef = useRef<BottomSheet>(null);
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const orderDetailsSheetRef = useRef<OrderDetailsSheetRef>(null);
  const progressSheetRef = useRef<any>(null);
  const [shouldShake, setShouldShake] = useState(false);

  // Order status tracking
  const {
    currentOrder,
    orderStatus,
    progress,
    isOrderActive,
    isCompleted,
    isFailed,
    getCurrentStep,
  } = useOrderStatusUpdates({
    orderId: createdOrder?._id,
    onStatusChange: (order, status) => {
      console.log(`Order ${order._id} status changed to: ${status}`);

      // Switch to progress screen when order starts processing
      if (status === "DEPOSIT_CONFIRMING" || status === "DEPOSIT_CONFIRMED") {
        orderDetailsSheetRef.current?.close();
        progressSheetRef.current?.open();
      }
    },
    onProgressUpdate: (order, progressValue) => {
      console.log(`Order ${order._id} progress: ${progressValue}%`);
    },
  });
  const [bankAccountSelected, setBankAccountSelected] =
    useState<UserBankAccount | null>(null);

  const { logoutFromExchange } = useWallet();
  // 🔹 Order creation state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);

  // 🔹 Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔹 Supported currencies context for refresh
  const { refreshSupportedCurrenciesForSwap } = useSupportedCurrencies();
  const { isExchangeAuthenticated, isUserLoggedIn, exchangeUserData } = useExchangeAuth();
  const { showBottomSheet } = useAppBottomSheet();
  const { fetchExchangeActivities } = useExchange();
  const { loginAsGuest } = useKyc();

  const [isZapperBottomSheetVisible, setIsZapperBottomSheetVisible] =
    useState(false);

  // 🔹 SDK-based swap logic
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    marketRate,
    error,
    setError,
    isLoading,
    baseAmountUSD,
    isInputtingUSD,
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
    toggleUSDInput,
    handleBaseAmountFocus,
    handleTargetAmountFocus,
  } = useSwapSDK();

  const { fetchBankAccounts } = useBankAccounts();

  // 🔹 Validation and shake animation
  useEffect(() => {
    if (error) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    } else {
    }
  }, [error]);

  useEffect(() => {
    orderDetailsSheetRef.current?.close();
  }, []);

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
      await refreshSupportedCurrenciesForSwap();

      // Then refresh rates if we have both currencies selected
      if (baseCurrency && targetCurrency && baseAmount > 0) {
        await fetchMarketRate(baseCurrency, targetCurrency, baseAmount, true);
      }

      // fetch bank accounts
      await fetchBankAccounts();
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
    refreshSupportedCurrenciesForSwap,
    fetchBankAccounts,
  ]);

  // 🔹 Swap currencies (with animation)
  const handleSwapButtonPress = useCallback(() => {
    setAddressError(null);
    setCreateOrderError(null);
    setError(null);
    handleSwapPress();
    handleSwapCurrencies();
  }, [handleSwapPress, handleSwapCurrencies]);

  // 🔹 Address validation
  const validateCryptoAddress = useCallback(
    async (address: string) => {
      if (
        !targetCurrency ||
        !(targetCurrency.currencyId as Partial<ICurrency>)?.isCrypto
      ) {
        setAddressError(null);
        return true;
      }

      if (!address.trim()) {
        setAddressError("Receiving address is required");
        return false;
      }

      const validation = await zapSDKService.validateAddress(
        address,
        (targetCurrency.chainId as Partial<IChain>)?.symbol || ""
      );
      setAddressError(validation.error || null);
      return validation.isValid;
    },
    [targetCurrency]
  );

  // 🔹 Order creation
  const handleContinue = useCallback(async () => {
    setCreateOrderError(null);
    setAddressError(null);
    if (!validateExchange()) return;

    // Check if either currency is fiat (not crypto) - if so, require authentication
    const isBaseCrypto =
      (baseCurrency?.currencyId as Partial<ICurrency>)?.isCrypto || false;
    const isTargetCrypto =
      (targetCurrency?.currencyId as Partial<ICurrency>)?.isCrypto || false;
    const involvesFiat = !isBaseCrypto || !isTargetCrypto;
    const isCryptoToCrypto = isBaseCrypto && isTargetCrypto;

    // If trade involves fiat and user is not logged in, require full authentication
    if (involvesFiat && !isExchangeAuthenticated) {
      // Show zapper login modal
      setIsZapperBottomSheetVisible(true);
      setTimeout(() => {
        zapperBottomSheetRef.current?.snapToIndex(0);
      }, 100);
      return;
    }

    // If crypto-to-crypto trade and user is not logged in, login as guest
    if (isCryptoToCrypto && !isExchangeAuthenticated) {
      try {
        setIsCreatingOrder(true); // Show loading state
        // Fetch device IP and location, then login as guest
        try {
          const { ip, location } = await getDeviceIpAndLocation();
          await loginAsGuest({
            ip: ip || undefined,
            platform: "mobile",
            location: location || undefined,
          });
        } catch (error) {
          console.warn("Failed to fetch device IP and location, proceeding without it:", error);
          // Proceed with login even if device info fetch fails
          await loginAsGuest({
            platform: "mobile",
          });
        }
        // Guest login successful, continue with order creation
      } catch (guestLoginError) {
        console.error("Failed to login as guest:", guestLoginError);
        setCreateOrderError("Failed to initialize guest session. Please try again.");
        setIsCreatingOrder(false);
        return;
      }
    }

    const isCrypto = (targetCurrency?.currencyId as Partial<ICurrency>)
      ?.isCrypto;

    if (isCrypto && !cryptoAddress.trim()) {
      setCreateOrderError("Please enter a valid receiving address");
      return;
    }

    if (!isCrypto && !bankAccountSelected?._id) {
      setCreateOrderError("Please select a bank account to receive");
      return;
    }

    // Validate crypto address if required
    if (isCrypto) {
      if (!validateCryptoAddress(cryptoAddress)) {
        return;
      }
    }

    try {
      setIsCreatingOrder(true);
      setCreateOrderError(null);

      const orderResult = await createOrder(
        isCrypto ? cryptoAddress.trim() : undefined,
        !isCrypto ? bankAccountSelected?._id : undefined
      );

      if (orderResult) {
        setCreatedOrder(orderResult);
        
        // Refresh exchange history after order creation
        if (exchangeUserData?._id) {
          try {
            await fetchExchangeActivities({
              user: exchangeUserData,
              page: 1,
              limit: 10,
            });
            console.log("✅ Exchange history refreshed after order creation");
          } catch (error) {
            console.error("Failed to refresh exchange history:", error);
          }
        }
        
        // Open order details modal
        setTimeout(() => {
          if (orderDetailsSheetRef.current) {
            orderDetailsSheetRef.current.open();
          }
        }, 300); // Increased timeout to ensure component is mounted
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
    bankAccountSelected,
    isExchangeAuthenticated,
    baseCurrency,
    exchangeUserData,
    fetchExchangeActivities,
    loginAsGuest,
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

  const handleConnectZapExchange = useCallback(() => {
    zapLinkBottomSheetRef.current?.close();
    setIsZapperBottomSheetVisible(true);
    setTimeout(() => {
      zapperBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  }, []);

  const handleDisconnectZapExchange = useCallback(async () => {
    try {
      await logoutFromExchange();
      zapLinkBottomSheetRef.current?.close();
    } catch (error) {
      console.error("Logout from exchange failed:", error);
    }
  }, []);

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

          {createOrderError && (
            <Box bg="error" p="s" borderRadius={8} marginVertical="s">
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
              onToggleUSDValueShowing={toggleUSDInput}
              isUSDValueShowing={isInputtingUSD}
              showBalance
              showMaxButton
              onFocus={handleBaseAmountFocus}
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
              usdValue={
                isInputtingUSD
                  ? `${formatNumber(
                      baseAmount,
                      (baseCurrency?.currencyId as Partial<ICurrency>)?.isCrypto
                        ? 8
                        : 2
                    )} ${
                      (baseCurrency?.currencyId as Partial<ICurrency>)
                        ?.symbol || ""
                    }`
                  : `${formatCurrency(baseAmountUSD, "USD")}`
              }
              isReceive={false}
              isCrypto={
                (baseCurrency?.currencyId as Partial<ICurrency>)?.isCrypto
              }
              hasError={!!error}
              errorColor={theme.colors.error}
              isLoading={isLoading}
            />
          </Box>

          {error && (
            <Box
              backgroundColor="error"
              borderRadius={8}
              padding="s"
              marginTop="s"
              marginBottom="s"
            >
              <CustomText variant="body" color="white" textAlign="center">
                {error}
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
              onFocus={handleTargetAmountFocus}
              isCrypto={
                (targetCurrency?.currencyId as Partial<ICurrency>)?.isCrypto
              }
              isLoading={isLoading}
            />
            <SwapButton
              onPress={handleSwapButtonPress}
              animatedStyle={swapButtonStyle}
              disabled={isAnimating || !baseCurrency || !targetCurrency}
            />
          </Box>
          {(targetCurrency?.currencyId as Partial<ICurrency>)?.isCrypto ? (
            <>
              <CustomText
                variant="body"
                fontSize={12}
                color="bodyTextColor"
                mb="s"
              >
                Receiving Address
              </CustomText>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.colors.surfaceContainer,
                    borderColor: addressError
                      ? theme.colors.error
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
                  ref={addressRef}
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
                  onPress={async () => {
                    // Paste address from clipboard
                    const text = await Clipboard.getStringAsync();
                    setCryptoAddress(text);
                    validateCryptoAddress(text);
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
                <CustomText variant="body" color="error" mt="s">
                  {addressError}
                </CustomText>
              )}
            </>
          ) : (
            <>
              {isUserLoggedIn && (
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.colors.surfaceContainer,
                      borderColor: addressError
                        ? theme.colors.error
                        : theme.colors.borderColor,
                      borderWidth: addressError ? 1 : 0,
                    },
                  ]}
                >
                  <CustomText
                    flex={1}
                    color="placeholderTextColor"
                    fontSize={12}
                  >
                    Sending To
                  </CustomText>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      maxWidth: "50%",
                    }}
                    onPress={() => {
                      // Check if user is verified
                      const isVerificationComplete =
                        userHasAtleastOneDocumentApproved(exchangeUserData);

                      if (!isVerificationComplete) {
                        // Show KYC flow instead of bank account bottom sheet
                        showBottomSheet({
                          component: (
                            <KYCFlowManager
                              onComplete={() => {
                                // After KYC completion, they can try again
                              }}
                              onBack={() => {
                                // Handle close if needed
                              }}
                            />
                          ),
                          props: {
                            snapPoints: ["90%"],
                            enablePanDownToClose: true,
                            showGradientHandle: true,
                            gradientColors: [
                              theme.colors.primaryColor,
                              theme.colors.mainBackgroundColor,
                              theme.colors.mainBackgroundColor,
                            ],
                          },
                        });
                        return;
                      }

                      // User is verified, show bank account bottom sheet
                      bankAccountsBottomSheetRef.current?.snapToIndex(0);
                    }}
                  >
                    <Box flex={1} flexDirection="row" alignItems="center">
                      <Image
                        source={{
                          uri: (bankAccountSelected?.bankId as unknown as Bank)
                            ?.icon,
                        }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 3,
                          marginRight: 7,
                        }}
                      />
                      <CustomText
                        color="headerTextColor"
                        variant="body"
                        fontSize={14}
                        numberOfLines={1}
                        flex={1}
                      >
                        {bankAccountSelected?.name.trim() || "Select Account"}
                      </CustomText>
                    </Box>
                    <ArrowDown2
                      size={16}
                      fontWeight="bold"
                      color={theme.colors.bodyTextColor}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {rateDetails && (
            <SwapDetailsCard
              provider="Zap Exchange"
              providerIcon={<ZapLogo width={20} height={20} />}
              zapFee={rateDetails.fee}
              rate={rateDetails.rate}
              minimumReceived={rateDetails.min}
              baseCurrencyUsdValue={rateDetails.baseCurrencyUsdValue}
              onProviderPress={() =>
                zapLinkBottomSheetRef.current?.snapToIndex(0)
              }
              isZapLinked={isUserLoggedIn}
              isLoading={isLoading}
            />
          )}

          <Box mt="l">
            <ButtonLightDecoration interval={12000}>
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
                  ((targetCurrency?.currencyId as Partial<ICurrency>)?.isCrypto &&
                    (!cryptoAddress.trim() || !!addressError))
                }
              />
            </ButtonLightDecoration>
          </Box>
        </Box>
      </ScrollView>

      {isZapperBottomSheetVisible && (
        <ZapperSiginBottomSheet
          key="zapper-bottom-sheet"
          ref={zapperBottomSheetRef}
          onContinue={() => {
            zapperBottomSheetRef.current?.close();
            setIsZapperBottomSheetVisible(false);
          }}
          onClose={() => {
            setIsZapperBottomSheetVisible(false);
          }}
        />
      )}

      <ZapLinkBottomSheet
        onDisconnect={handleDisconnectZapExchange}
        onConnect={handleConnectZapExchange}
        isZapLinked={isExchangeAuthenticated}
        username={exchangeUserData?.username}
        onClose={() => zapLinkBottomSheetRef.current?.close()}
        ref={zapLinkBottomSheetRef}
      />

      <BankAccountsBottomSheet
        ref={bankAccountsBottomSheetRef}
        onBankAccountSelect={(bankAccount) => {
          setBankAccountSelected(bankAccount);
        }}
        onClose={() => {
          bankAccountsBottomSheetRef.current?.close();
        }}
        onContinue={() => {
          if (bankAccountSelected) {
            bankAccountsBottomSheetRef.current?.close();
          }
        }}
        targetCurrency={targetCurrency}
      />

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
        orderDetails={currentOrder || createdOrder}
        onClose={() => {}}
        title="Order Progress"
        orderStatus={orderStatus}
        progress={progress}
        currentStep={getCurrentStep()}
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
    paddingHorizontal: 13,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
