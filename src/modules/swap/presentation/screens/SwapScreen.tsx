import icons from "@/assets/icons";
import TokenSelectionBottomSheet from "@/components/bottomsheets/TokenSelectionBottomSheet";
import ActivityTabar from "@/components/dashboard/ActivityTabar";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import {
  useCreateOrder,
  useFetchCurrencies,
  useSwap,
} from "@/src/modules/swap";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import {
  OrderDetailsSheet,
  SwapButton,
  SwapDetailsCard,
  TokenInputCard,
} from "../components";
import { useSwapAnimations } from "../hooks/useSwapAnimations";

const Swap = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation();
  const { showBottomSheet } = useAppBottomSheet();
  const { user } = useSelector((state: AppRootState) => state.kyc);

  const [cryptoAddress, setCryptoAddress] = useState("");
  const [createdOrder, setCreatedOrder] = useState<any>({
    _id: "68e6ffba76e8c705fab0db99",
    amountToReceive: 4493.992951464471,
    buyAmount: 1,
    buyCurrency: {
      __v: 1,
      _id: "6780418b0fab8ff8dc85d501",
      chainId: {
        __v: 0,
        _id: "678041880fab8ff8dc85d450",
        chainId: 1,
        createdAt: "2025-01-09T21:37:12.490Z",
        explorerUrl: "https://etherscan.io",
        isEVM: true,
        name: "Ethereum",
        nativeCurrencyId: "6780417c0fab8ff8dc85d03f",
        nativeCurrencySymbol: "ETH",
        rpcUrl:
          "https://eth-mainnet.g.alchemy.com/v2/VnmQ0ryoowBx4cpgS3BtEqu_6USkQlik",
        symbol: "ETH",
        updatedAt: "2025-01-09T21:37:12.490Z",
      },
      createdAt: "2025-01-09T21:37:15.884Z",
      currencyId: {
        __v: 0,
        _id: "6780417c0fab8ff8dc85d03f",
        ath: 0,
        buyRate: 0,
        circulatingSupply: 0,
        code: "ETH",
        createdAt: "2025-01-09T21:37:00.177Z",
        defaultNewsProvider: "CryptoCompare",
        defaultRatesProvider: "DexScreener",
        isActive: true,
        isCrypto: true,
        isStable: false,
        isUserToken: false,
        logo: "https://res.cloudinary.com/dbkwvangu/image/upload/v1747862691/currencies/logos/ethereum.svg",
        maxSupply: 0,
        name: "Ethereum",
        preferredNewsProviders: [Array],
        preferredRatesProviders: [Array],
        preferredTokenMetricsProviders: [Array],
        sellRate: 0,
        symbol: "ETH",
        totalSupply: 0,
        updatedAt: "2025-10-09T00:18:02.656Z",
        volatility: 0,
      },
      decimals: 18,
      defaultBalancesProvider: "Ethers",
      defaultBuyProvider: "Uniswap",
      defaultSellProvider: "Uniswap",
      defaultTradesProvider: "Uniswap",
      defaultTransactionsProvider: "Moralis",
      image:
        "https://res.cloudinary.com/dbkwvangu/image/upload/v1747862691/currencies/logos/ethereum.svg",
      isActive: true,
      isStable: false,
      isWalletDefault: true,
      preferredBalancesProviders: ["Ethers", "Web3"],
      preferredRPCProviders: [],
      preferredTradesProviders: [
        "Uniswap",
        "ChangeNow",
        "FixedFloat",
        "CowSwap",
      ],
      preferredTransactionsProviders: ["Moralis"],
      tokenAddress: "0xC02aaa39b223FE8D0a0e5C4F27eAD9083C756Cc2",
      updatedAt: "2025-10-07T15:52:29.158Z",
    },
    buyRate: 4511.203248985788,
    childOrder: {
      __v: 0,
      _id: "68e6ffba76e8c705fab0dba7",
      amount: 0,
      amountToReceive: 4493.992951464471,
      blockchainFeesPaid: 0,
      blockchainFeesToPay: 1,
      buyChain: null,
      calculatedAmount: 0,
      calculatedBlockchainFeesPaid: 0,
      calculatedFeesGained: 0,
      calculatedProviderFeesPaid: 0,
      calculatedRate: 0,
      childOrder: null,
      createdAt: "2025-10-09T00:20:10.393Z",
      currencyId: {
        _id: "6780417c0fab8ff8dc85d03d",
        code: "USDT",
        logo: "https://res.cloudinary.com/dbkwvangu/image/upload/v1747862705/currencies/logos/tetherusd.svg",
        name: "Tether USD",
      },
      depositAccountIds: [[Object]],
      expiresAt: "2025-10-09T00:40:08.422Z",
      feesGained: 0,
      feesToGain: 0,
      feesTxHash: null,
      flow: "SELL",
      gasStatus: "pending",
      isDepositTransferred: false,
      isFeesTransferred: false,
      latestTxHash: null,
      openAmount: 4528.8916,
      openRate: 1,
      parentOrder: {
        _id: "68e6ffba76e8c705fab0db99",
        currencyId: [Object],
        depositAccountIds: [Array],
        openAmount: 1,
        openRate: 4528.8916,
        sellChain: null,
      },
      platform: "App",
      provider: "Uniswap",
      providerFeesPaid: 0,
      providerFeesToPay: 0,
      providerOrderId: null,
      rate: 0,
      refundAccountId: null,
      sellChain: {
        __v: 0,
        _id: "678041880fab8ff8dc85d450",
        chainId: 1,
        createdAt: "2025-01-09T21:37:12.490Z",
        explorerUrl: "https://etherscan.io",
        isEVM: true,
        name: "Ethereum",
        nativeCurrencyId: "6780417c0fab8ff8dc85d03f",
        nativeCurrencySymbol: "ETH",
        rpcUrl:
          "https://eth-mainnet.g.alchemy.com/v2/VnmQ0ryoowBx4cpgS3BtEqu_6USkQlik",
        symbol: "ETH",
        updatedAt: "2025-01-09T21:37:12.490Z",
      },
      status: "PENDING",
      transactionIds: [],
      transactionTypes: [],
      updatedAt: "2025-10-09T00:20:10.393Z",
      userId: { _id: "68da63aa6615b2d4dfe2edc1" },
      withdrawalAccountIds: [[Object]],
    },
    createdAt: "2025-10-09T00:20:10.243Z",
    depositAccount: {
      _id: "68e6ffba76e8c705fab0db94",
      holderName: "Deposit Account",
      walletAddress: "0xa3DeB69D2F51FD8fB3f5cde56B34866DE15c3bb5",
    },
    expiresAt: "2025-10-09T00:40:13.025Z",
    lpFee: 34.898648535528835,
    lpFeeUsd: 34.898648535528835,
    maxAmount: 2.208045783211062,
    minAmount: 0.0002208045783211062,
    rate: 4496.724793042247,
    sellAmount: 4528.8916,
    sellCurrency: {
      __v: 1,
      _id: "6780418b0fab8ff8dc85d4f4",
      chainId: {
        __v: 0,
        _id: "678041880fab8ff8dc85d450",
        chainId: 1,
        createdAt: "2025-01-09T21:37:12.490Z",
        explorerUrl: "https://etherscan.io",
        isEVM: true,
        name: "Ethereum",
        nativeCurrencyId: "6780417c0fab8ff8dc85d03f",
        nativeCurrencySymbol: "ETH",
        rpcUrl:
          "https://eth-mainnet.g.alchemy.com/v2/VnmQ0ryoowBx4cpgS3BtEqu_6USkQlik",
        symbol: "ETH",
        updatedAt: "2025-01-09T21:37:12.490Z",
      },
      createdAt: "2025-01-09T21:37:15.884Z",
      currencyId: {
        __v: 0,
        _id: "6780417c0fab8ff8dc85d03d",
        ath: 0,
        buyRate: 0,
        circulatingSupply: 0,
        code: "USDT",
        createdAt: "2025-01-09T21:37:00.177Z",
        defaultNewsProvider: "CryptoCompare",
        defaultRatesProvider: "DexScreener",
        isActive: true,
        isCrypto: true,
        isStable: true,
        isUserToken: false,
        logo: "https://res.cloudinary.com/dbkwvangu/image/upload/v1747862705/currencies/logos/tetherusd.svg",
        maxSupply: 0,
        name: "Tether USD",
        preferredNewsProviders: [Array],
        preferredRatesProviders: [Array],
        preferredTokenMetricsProviders: [Array],
        sellRate: 0,
        symbol: "USDT",
        totalSupply: 0,
        updatedAt: "2025-10-09T00:18:01.874Z",
        volatility: 0,
      },
      decimals: 6,
      defaultBalancesProvider: "Ethers",
      defaultBuyProvider: "Uniswap",
      defaultSellProvider: "Uniswap",
      defaultTradesProvider: "Uniswap",
      defaultTransactionsProvider: "Moralis",
      image:
        "https://res.cloudinary.com/dbkwvangu/image/upload/v1747867509/supportedCurrencies/icons/USDT-ETH.svg",
      isActive: true,
      isStable: true,
      isWalletDefault: true,
      preferredBalancesProviders: ["Ethers", "Web3"],
      preferredRPCProviders: [],
      preferredTradesProviders: [
        "Uniswap",
        "ChangeNow",
        "FixedFloat",
        "CowSwap",
      ],
      preferredTransactionsProviders: ["Moralis"],
      tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      updatedAt: "2025-10-07T15:52:29.154Z",
    },
    sellRate: 0.9967905556135613,
    status: "PENDING",
    updatedAt: "2025-10-09T00:20:10.243Z",
    withdrawalAccount: {
      _id: "68e5776b76e8c705faaf26c3",
      walletAddress: "0x72c5d68940275366Af924a7bDCEF84126aDA0793",
    },
  });
  const orderDetailsSheetRef = useRef<any>(null);

  // 🔹 Create order hook
  const {
    createOrder,
    isLoading: isCreatingOrder,
    error: createOrderError,
  } = useCreateOrder();

  // 🔹 Fetch all currencies
  const { currencies = [], isLoading: currenciesLoading } = useFetchCurrencies({
    includeFiat: true,
    enabled: true,
  });

  // 🔹 Swap logic from custom hook
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    marketRate,
    error,
    isLoading,
    activeTab,
    lastEditedField,
    setBaseAmount,
    setBaseCurrency,
    setTargetCurrency,
    handleBaseAmountChange,
    handleTargetAmountChange,
    handleBaseAmountFormat,
    handleTargetAmountFormat,
    handleSwapCurrencies,
    validateExchange,
    setActiveTab,
  } = useSwap();

  // 🔹 Animations hook
  const {
    isAnimating,
    sellContainerStyle,
    receiveContainerStyle,
    swapButtonStyle,
    handleSwapPress,
  } = useSwapAnimations();

  // 🔹 Set defaults once currencies load
  useEffect(() => {
    orderDetailsSheetRef.current?.open();
    if (currenciesLoading || !currencies.length) return;

    const btc = currencies.find((c) => c.currencyId?.symbol === "BTC");
    const eth = currencies.find((c) => c.currencyId?.symbol === "ETH");
    const ngn = currencies.find((c) => c.currencyId?.symbol === "₦");

    if (!baseCurrency && (btc || eth)) {
      setBaseCurrency(btc || eth);
      if (btc && baseAmount === 0) setBaseAmount(0.0025);
    }

    if (!targetCurrency && ngn) {
      setTargetCurrency(ngn);
    }
  }, [currencies, currenciesLoading]);

  // 🔹 Reusable bottom sheet handler
  const openTokenSelector = useCallback(
    (type: "base" | "target") => {
      showBottomSheet({
        component: (
          <TokenSelectionBottomSheet
            title="Select Token"
            onTokenSelect={(token) => {
              type === "base"
                ? setBaseCurrency(token)
                : setTargetCurrency(token);
            }}
            selectedToken={
              (type === "base" ? baseCurrency : targetCurrency)
                ? {
                    symbol:
                      (type === "base" ? baseCurrency : targetCurrency)
                        ?.currencyId?.symbol || "",
                    image:
                      (type === "base" ? baseCurrency : targetCurrency)
                        ?.image ||
                      (type === "base" ? baseCurrency : targetCurrency)
                        ?.currencyId?.logo ||
                      null,
                    balance: `20${
                      (type === "base" ? baseCurrency : targetCurrency)
                        ?.currencyId?.symbol || ""
                    }`,
                  }
                : {
                    symbol: "Select",
                    image: require("@/assets/images/btc.png"),
                  }
            }
          />
        ),
        props: {
          snapPoints: ["80%"],
          enablePanDownToClose: true,
          showGradientHandle: true,
          backgroundColor: theme.colors.mainBackgroundColor,
          gradientColors: [
            theme.colors.secondaryBackgroundColor,
            theme.colors.secondaryBackgroundColor,
          ],
        },
      });
    },
    [baseCurrency, targetCurrency]
  );

  // 🔹 Swap currencies (with animation)
  const handleSwapButtonPress = useCallback(() => {
    handleSwapPress();
    handleSwapCurrencies();
  }, [handleSwapPress, handleSwapCurrencies]);

  // 🔹 Order creation
  const handleContinue = useCallback(async () => {
    orderDetailsSheetRef.current?.open();
    if (!validateExchange()) return;

    if (targetCurrency?.currencyId?.isCrypto && !cryptoAddress.trim()) {
      console.warn("Please enter a receiving address");
      return;
    }

    // Create payload based on which field was last edited
    const payload: any = {
      buySupportedCurrencyId: baseCurrency?._id || "",
      sellSupportedCurrencyId: targetCurrency?._id || "",
    };

    // Add withdrawal address if target currency is crypto
    if (targetCurrency?.currencyId?.isCrypto && cryptoAddress.trim()) {
      payload.withdrawalAddress = cryptoAddress;
    }

    // Add the appropriate amount field based on lastEditedField
    if (lastEditedField === "targetAmount") {
      payload.sellAmount = targetAmount;
    } else {
      payload.buyAmount = baseAmount;
    }

    console.log("Creating order with payload:", payload);
    const orderResult = await createOrder(payload);

    if (orderResult) {
      console.log("Order created successfully:", orderResult?.data);
      setCreatedOrder(orderResult?.data);
      orderDetailsSheetRef.current?.open();
    }
  }, [
    baseAmount,
    marketRate,
    user,
    baseCurrency,
    targetCurrency,
    cryptoAddress,
    validateExchange,
    navigation,
    createOrder,
  ]);

  const rateDetails = useMemo(
    () =>
      marketRate && baseCurrency && targetCurrency
        ? {
            rate: `1 ${
              baseCurrency.currencyId?.symbol
            } = ${marketRate.rate?.toFixed(2)} ${
              targetCurrency.currencyId?.symbol
            }`,
            fee: `$${marketRate.rate?.toFixed(6) || "0.000000"}`,
            min: `${targetAmount?.toFixed(2)} ${
              targetCurrency.currencyId?.symbol
            }`,
          }
        : null,
    [marketRate, baseCurrency, targetCurrency, targetAmount]
  );

  return (
    <PageWrapper>
      <Box flex={1} p="m">
        <CustomText variant="subheader" textAlign="center" mb="m">
          Swap
        </CustomText>

        <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

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
            tokenSymbol={baseCurrency?.currencyId?.symbol || "Select"}
            tokenImage={baseCurrency?.image || baseCurrency?.currencyId?.logo}
            showBalance
            showMaxButton
            onTokenSelect={() => openTokenSelector("base")}
            onAmountChange={handleBaseAmountChange}
            animatedStyle={sellContainerStyle}
            isReceive={false}
            isCrypto={baseCurrency?.currencyId?.isCrypto}
          />
        </Box>
        <Box position="relative" style={{ marginTop: 5, marginBottom: 16 }}>
          <TokenInputCard
            amount={handleTargetAmountFormat()}
            tokenSymbol={targetCurrency?.currencyId?.symbol || "Select"}
            tokenImage={
              targetCurrency?.image || targetCurrency?.currencyId?.logo
            }
            animatedStyle={receiveContainerStyle}
            isReceive
            usdValue={`$${targetAmount?.toFixed(2) || "0"}`}
            onTokenSelect={() => openTokenSelector("target")}
            onAmountChange={handleTargetAmountChange}
            isCrypto={targetCurrency?.currencyId?.isCrypto}
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
            providerIcon={require("@/assets/images/btc.png")}
            zapFee={rateDetails.fee}
            rate={rateDetails.rate}
            minimumReceived={rateDetails.min}
          />
        )}

        {targetCurrency?.currencyId?.isCrypto && (
          <>
            <CustomText variant="body" fontSize={12} color="bodyTextColor">
              Receiving Address
            </CustomText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.colors.surfaceContainer },
              ]}
            >
              <TextInput
                style={{
                  height: "100%",
                  width: "80%",
                  color: theme.colors.bodyTextColor,
                }}
                placeholder=""
                value={cryptoAddress}
                onChangeText={(text) => setCryptoAddress(text)}
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
          </>
        )}

        <CustomButton
          text={isCreatingOrder ? "..." : "Zap Now"}
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
            (targetCurrency?.currencyId?.isCrypto && !cryptoAddress.trim())
          }
        />
      </Box>

      <OrderDetailsSheet
        ref={orderDetailsSheetRef}
        orderDetails={createdOrder}
        onClose={() => {
          setCreatedOrder(null);
        }}
        title="Order Created"
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
