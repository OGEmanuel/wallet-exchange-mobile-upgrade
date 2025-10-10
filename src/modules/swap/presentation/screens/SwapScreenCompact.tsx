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
} from "@/src/modules/swap";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@shopify/restyle";
import { ArrowUpDown } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { OrderDetailsSheet } from "../components";
import WithdrawalAddressInput from "../components/WithdrawalAddressInput";
import { useSwapLogic } from "../hooks/useSwapLogic";
import { swapActions } from "../state/swap-slice";

const SwapScreenCompact = () => {
    const theme = useTheme<Theme>();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { showBottomSheet } = useAppBottomSheet();
    const { user } = useSelector((state: AppRootState) => state.kyc);

    const [cryptoAddress, setCryptoAddress] = useState("");
    const [createdOrder, setCreatedOrder] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"EXCHANGE" | "WALLET">("EXCHANGE");
    const orderDetailsSheetRef = useRef<any>(null);

    // Animation values
    const rotationValue = useSharedValue(0);
    const scaleValue = useSharedValue(1);
    const sellOpacity = useSharedValue(1);
    const receiveOpacity = useSharedValue(1);
    const sellTranslateY = useSharedValue(0);
    const receiveTranslateY = useSharedValue(0);

    // Animated styles
    const swapButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotationValue.value}deg` },
            { scale: scaleValue.value },
        ],
    }));

    const sellSectionAnimatedStyle = useAnimatedStyle(() => ({
        opacity: sellOpacity.value,
        transform: [{ translateY: sellTranslateY.value }],
    }));

    const receiveSectionAnimatedStyle = useAnimatedStyle(() => ({
        opacity: receiveOpacity.value,
        transform: [{ translateY: receiveTranslateY.value }],
    }));

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
        swapMetaData,
        fetchingSwapRate,
        swapRateError,
        supportedCurrenciesError,
        sellCurrency,
        receiveCurrency,
        swapRate,
        handleSellInputChange,
        handleReceiveInputChange,
        handleSwap,
    } = useSwapLogic();

    // 🔹 Set defaults once currencies load
    useEffect(() => {
        if (currenciesLoading || !currencies.length) return;

        // Set supported currencies in Redux
        dispatch(swapActions.setSupportedCurrencies(currencies));

        const btc = currencies.find((c) => c.currencyId?.symbol === "BTC");
        const eth = currencies.find((c) => c.currencyId?.symbol === "ETH");
        const usdt = currencies.find((c) => c.currencyId?.symbol === "USDT");
        const ngn = currencies.find((c) => c.currencyId?.symbol === "₦");

        if (!sellCurrency && (btc || eth)) {
            dispatch(swapActions.setSellCurrency(btc || eth));
        }

        if (!receiveCurrency && (usdt || ngn)) {
            dispatch(swapActions.setReceiveCurrency(usdt || ngn));
        }
    }, [currencies, currenciesLoading, sellCurrency, receiveCurrency, dispatch]);

    // 🔹 Animated swap handler
    const handleAnimatedSwap = useCallback(() => {
        // Rotate the swap button 180 degrees
        rotationValue.value = withTiming(rotationValue.value + 180, {
            duration: 300,
        });

        // Scale button for press effect
        scaleValue.value = withSequence(
            withTiming(0.8, { duration: 100 }),
            withTiming(1, { duration: 150 })
        );

        // Animate sell section up and fade out
        sellTranslateY.value = withTiming(-20, { duration: 200 });
        sellOpacity.value = withTiming(0, { duration: 150 });

        // Animate receive section down and fade out
        receiveTranslateY.value = withTiming(20, { duration: 200 });
        receiveOpacity.value = withTiming(0, { duration: 150 });

        // Swap the currencies after animations start
        setTimeout(() => {
            handleSwap();

            // Animate sections back in from opposite directions
            sellTranslateY.value = withTiming(0, { duration: 200 });
            sellOpacity.value = withTiming(1, { duration: 200 });
            
            receiveTranslateY.value = withTiming(0, { duration: 200 });
            receiveOpacity.value = withTiming(1, { duration: 200 });
        }, 150);
    }, [handleSwap, rotationValue, scaleValue, sellOpacity, receiveOpacity, sellTranslateY, receiveTranslateY]);

    // 🔹 Reusable bottom sheet handler
    const openTokenSelector = useCallback(
        (type: "sell" | "receive") => {
            showBottomSheet({
                component: (
                    <TokenSelectionBottomSheet
                        title={`Select ${type === "sell" ? "Sell" : "Receive"} Token`}
                        onTokenSelect={(token) => {
                            // If the user selects token that is on the other side, swap the tokens
                            if (token._id === sellCurrency?._id && type === "receive") {
                                handleAnimatedSwap();
                            } else if (token._id === receiveCurrency?._id && type === "sell") {
                                handleAnimatedSwap();
                            } else {
                                if (type === "sell") {
                                    dispatch(swapActions.setSellCurrency(token));
                                } else {
                                    dispatch(swapActions.setReceiveCurrency(token));
                                }
                            }
                        }}
                        selectedToken={
                            (type === "sell" ? sellCurrency : receiveCurrency)
                                ? {
                                    symbol:
                                        (type === "sell" ? sellCurrency : receiveCurrency)
                                            ?.currencyId?.symbol || "",
                                    image:
                                        (type === "sell" ? sellCurrency : receiveCurrency)
                                            ?.image ||
                                        (type === "sell" ? sellCurrency : receiveCurrency)
                                            ?.currencyId?.logo ||
                                        null,
                                    balance: `20${(type === "sell" ? sellCurrency : receiveCurrency)
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
        [sellCurrency, receiveCurrency, handleAnimatedSwap, dispatch, showBottomSheet, theme.colors]
    );

    // 🔹 Order creation
    const handleContinue = useCallback(async () => {
        if (!sellCurrency || !receiveCurrency) {
            return;
        }

        if (receiveCurrency?.currencyId?.isCrypto && !cryptoAddress.trim()) {
            console.warn("Please enter a receiving address");
            return;
        }

        // Parse amounts from swap metadata
        const sellAmount = parseFloat(
            swapMetaData.sellInputValue.replace(/,/g, "").replace(/\$/g, "")
        );
        const receiveAmount = parseFloat(
            swapMetaData.receiveInputValue.replace(/,/g, "").replace(/\$/g, "")
        );

        if (isNaN(sellAmount) || sellAmount <= 0) {
            console.warn("Invalid sell amount");
            return;
        }

        // Create payload
        const payload: any = {
            buySupportedCurrencyId: receiveCurrency._id || "",
            sellSupportedCurrencyId: sellCurrency._id || "",
            buyAmount: receiveAmount,
        };

        // Add withdrawal address if receive currency is crypto
        if (receiveCurrency?.currencyId?.isCrypto && cryptoAddress.trim()) {
            payload.withdrawalAddress = cryptoAddress;
        }

        console.log("Creating order with payload:", payload);
        const orderResult = await createOrder(payload);

        if (orderResult) {
            console.log("Order created successfully:", orderResult?.data);
            setCreatedOrder(orderResult?.data);
            orderDetailsSheetRef.current?.open();
        }
    }, [
        sellCurrency,
        receiveCurrency,
        cryptoAddress,
        swapMetaData,
        createOrder,
    ]);

    const shouldShowWithdrawalAddress =
        receiveCurrency?.currencyId?.isCrypto === true &&
        !swapRateError &&
        !fetchingSwapRate;

    // Calculate rate details
    const rateDetails = useMemo(() => {
        if (swapRate && sellCurrency && receiveCurrency) {
            const rate = swapRate.buyRate || swapRate.sellRate || 0;
            const amount = parseFloat(swapMetaData.receiveInputValue.replace(/,/g, "")) || 0;
            const fee = amount * 0.013; // 1.3% fee example

            return {
                rate: `1 ${sellCurrency.currencyId?.symbol} ≈ ${rate.toLocaleString()} ${receiveCurrency.currencyId?.symbol}`,
                lpFee: `${fee.toFixed(2)} ${receiveCurrency.currencyId?.symbol}`,
            };
        }
        return null;
    }, [swapRate, sellCurrency, receiveCurrency, swapMetaData.receiveInputValue]);

    return (
        <PageWrapper>
            <Box flex={1} p="m">
                <CustomText variant="subheader" textAlign="center" mb="m">
                    Swap
                </CustomText>

                <ActivityTabar activeTab={activeTab} onPress={setActiveTab} />

                {/* Error Message */}
                {(swapRateError || supportedCurrenciesError || createOrderError) && (
                    <Box bg="warningBackgroundColor" p="s" borderRadius={8} mb="m">
                        <CustomText variant="body" color="error" fontSize={12}>
                            {swapRateError || supportedCurrenciesError || createOrderError}
                        </CustomText>
                    </Box>
                )}

                {/* Sell Section */}
                <Animated.View style={sellSectionAnimatedStyle}>
                    <Box backgroundColor="surfaceContainer" borderRadius={12} p="m">
                        <View style={styles.sectionHeader}>
                            <CustomText variant="body" color="disabledTextColor" fontSize={12}>
                                Sell
                            </CustomText>
                        <TouchableOpacity
                            onPress={() => openTokenSelector("sell")}
                            style={[
                                styles.currencyButton,
                                { backgroundColor: theme.colors.mainBackgroundColor },
                            ]}
                        >
                            {sellCurrency?.image || sellCurrency?.currencyId?.logo ? (
                                <Image
                                    source={{
                                        uri: sellCurrency.image || sellCurrency.currencyId?.logo,
                                    }}
                                    style={styles.currencyImage}
                                />
                            ) : null}
                            <CustomText variant="bodyMedium" fontSize={13}>
                                {sellCurrency?.currencyId?.code || "Select"}
                            </CustomText>
                            <CustomText
                                variant="body"
                                color="disabledTextColor"
                                fontSize={10}
                                ml="s"
                            >
                                ▼
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        value={swapMetaData.sellInputValue}
                        onChangeText={handleSellInputChange}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={theme.colors.placeholderTextColor}
                        style={[
                            styles.amountInput,
                            { color: theme.colors.bodyTextColor },
                        ]}
                    />
                        <CustomText variant="body" color="successColor" fontSize={13}>
                            {swapMetaData.dollarValue || "$0"}
                        </CustomText>
                    </Box>
                </Animated.View>

                {/* Swap Button */}
                <View style={styles.swapButtonContainer}>
                    <TouchableOpacity
                        onPress={handleAnimatedSwap}
                        disabled={fetchingSwapRate}
                    >
                        <Animated.View
                            style={[
                                styles.swapButton,
                                {
                                    backgroundColor: theme.colors.mainBackgroundColor,
                                    borderColor: theme.colors.mainBackgroundColor,
                                },
                                swapButtonAnimatedStyle,
                            ]}
                        >
                            {fetchingSwapRate ? (
                                <ActivityIndicator size="small" color={theme.colors.bodyTextColor} />
                            ) : (
                                <ArrowUpDown color={theme.colors.bodyTextColor} size={16} />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Receive Section */}
                <Animated.View style={receiveSectionAnimatedStyle}>
                    <Box backgroundColor="surfaceContainer" borderRadius={12} p="m" mb="m">
                        <View style={styles.sectionHeader}>
                            <CustomText variant="body" color="disabledTextColor" fontSize={12}>
                                Receive
                            </CustomText>
                        <TouchableOpacity
                            onPress={() => openTokenSelector("receive")}
                            style={[
                                styles.currencyButton,
                                { backgroundColor: theme.colors.mainBackgroundColor },
                            ]}
                        >
                            {receiveCurrency?.image || receiveCurrency?.currencyId?.logo ? (
                                <Image
                                    source={{
                                        uri: receiveCurrency.image || receiveCurrency.currencyId?.logo,
                                    }}
                                    style={styles.currencyImage}
                                />
                            ) : null}
                            <CustomText variant="bodyMedium" fontSize={13}>
                                {receiveCurrency?.currencyId?.code || "Select"}
                            </CustomText>
                            <CustomText
                                variant="body"
                                color="disabledTextColor"
                                fontSize={10}
                                ml="s"
                            >
                                ▼
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        value={swapMetaData.receiveInputValue}
                        onChangeText={handleReceiveInputChange}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={theme.colors.placeholderTextColor}
                        style={[
                            styles.amountInput,
                            { color: theme.colors.bodyTextColor },
                        ]}
                    />
                    </Box>
                </Animated.View>

                {/* Rate and Fee Information */}
                {rateDetails && (
                    <Box backgroundColor="surfaceContainer" borderRadius={12} p="m" mb="m">
                        <View style={styles.rateRow}>
                            <CustomText variant="body" color="disabledTextColor" fontSize={12}>
                                Rate
                            </CustomText>
                            <CustomText
                                variant="bodyMedium"
                                fontSize={11}
                                color="successColor"
                            >
                                {rateDetails.rate}
                            </CustomText>
                        </View>
                        <View style={styles.rateRow}>
                            <View style={styles.feeLabel}>
                                <CustomText
                                    variant="body"
                                    color="disabledTextColor"
                                    fontSize={12}
                                >
                                    LP Fee
                                </CustomText>
                                <CustomText
                                    variant="body"
                                    color="disabledTextColor"
                                    fontSize={10}
                                    ml="s"
                                >
                                    ⓘ
                                </CustomText>
                            </View>
                            <CustomText variant="bodyMedium" fontSize={11}>
                                {rateDetails.lpFee}
                            </CustomText>
                        </View>
                    </Box>
                )}

                {/* Withdrawal Address (for crypto) */}
                {shouldShowWithdrawalAddress && (
                    <WithdrawalAddressInput
                        value={cryptoAddress}
                        onChangeText={setCryptoAddress}
                    />
                )}

                {/* Continue Button */}
                <CustomButton
                    text={isCreatingOrder ? "..." : "Zap now"}
                    fontSize={14}
                    width="100%"
                    height={56}
                    borderRadius={56}
                    bgColor={theme.colors.primaryColor}
                    onPress={handleContinue}
                    disabled={
                        fetchingSwapRate ||
                        isCreatingOrder ||
                        !sellCurrency ||
                        !receiveCurrency ||
                        parseFloat(swapMetaData.sellInputValue.replace(/,/g, "")) <= 0 ||
                        (receiveCurrency?.currencyId?.isCrypto && !cryptoAddress.trim())
                    }
                />
            </Box>

            {/* Order Details Sheet */}
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

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    currencyButton: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 4,
    },
    currencyImage: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    amountInput: {
        fontSize: 22,
        fontFamily: "PlusJakartaSans_Bold",
        marginBottom: 4,
        padding: 0,
    },
    swapButtonContainer: {
        alignItems: "center",
        marginVertical: -16,
        zIndex: 10,
    },
    swapButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
    },
    rateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    feeLabel: {
        flexDirection: "row",
        alignItems: "center",
    },
});

export default SwapScreenCompact;

