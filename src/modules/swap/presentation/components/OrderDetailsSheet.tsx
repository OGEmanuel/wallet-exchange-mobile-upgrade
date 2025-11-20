import Icons from "@/assets/icons";
import { TouchableIcon } from "@/components";
import ConfirmSend from "@/components/bottomsheets/send/ConfirmSend";
import { Box, CustomButton, CustomText } from "@/components/general";
import BankIcon from "@/components/general/BankIcon";
import SmartImage from "@/components/general/SmartImage";
import SwitchTab from "@/components/general/SwitchTab";
import { SIZES } from "@/data";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { useChains } from "@/src/core/chains/chains-context";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import {
  formatNumber,
  formatWalletAddress,
} from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppRootState } from "@/state";
import { selectAssetBySupportedCurrencyId, selectProcessedPortfolio } from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSelector } from "react-redux";
import { CreateOrderResponse } from "../../domain/entities/order.types";
import OverviewDetails from "./OverviewDetails";

enum FeeSpeed {
  Standard = "Standard",
  Fast = "Fast",
  Instant = "Instant",
}

interface OrderDetailsSheetProps {
  orderDetails?: CreateOrderResponse;
  onClose?: () => void;
  title?: string;
}

export interface OrderDetailsSheetRef {
  open: () => void;
  close: () => void;
}

const OrderDetailsSheet = forwardRef<
  OrderDetailsSheetRef,
  OrderDetailsSheetProps
>(({ orderDetails, onClose, title = "Order Details" }, ref) => {
  const theme = useTheme<Theme>();
  const tabBarHeight = Platform.OS === "ios" ? 90 : 70;
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");
  const [networkFee, setNetworkFee] = useState<{
    fee: number;
    feeInUSD: number;
    speed: FeeSpeed;
    gasPrice?: number;
    gasLimit?: number;
    feeRate?: number;
  } | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const confirmSendRef = useRef<BottomSheet>(null);
  const { getChainBySymbol, getChainImage, chainsMap } = useChains();
  const { getPrivateKey, getAddress, mainUserWalletGroup } = useWallet();
  const processedPortfolio = useSelector(selectProcessedPortfolio);

  // Get order details early for hooks
  const isSellCrypto = orderDetails?.sellCurrency?.currencyId?.isCrypto;
  const isBuyCrypto = orderDetails?.buyCurrency?.currencyId?.isCrypto;
  const buySymbol = orderDetails?.buyCurrency?.currencyId?.symbol;
  const sellSymbol = orderDetails?.sellCurrency?.currencyId?.symbol;
  const buyChain = orderDetails ? getChainBySymbol(orderDetails?.buyCurrency?.chainId?.symbol) : null;
  const sellChain = orderDetails ? getChainBySymbol(orderDetails?.sellCurrency?.chainId?.symbol) : null;

  // Check if deposit is crypto (for buy orders, deposit is crypto; for sell orders, deposit is also crypto)
  const isDepositCrypto = isBuyCrypto || isSellCrypto;
  const depositAddress = orderDetails?.depositAccount?.walletAddress;

  // Determine which currency to use for send (buy currency for buy orders, sell currency for sell orders)
  const sendCurrency = isBuyCrypto ? orderDetails?.buyCurrency : orderDetails?.sellCurrency;
  const sendChain = isBuyCrypto ? buyChain : sellChain;
  const sendCurrencySupportedId = sendCurrency?._id || (sendCurrency as any)?.supportedCurrencyId?._id || (sendCurrency as any)?.supportedCurrencyId;
  
  // Get wallet balance for the currency (must be before early return)
  const walletToken = useSelector((state: AppRootState) => 
    sendCurrencySupportedId ? selectAssetBySupportedCurrencyId(state, sendCurrencySupportedId) : null
  );
  const hasBalance = walletToken && walletToken.balance > 0;

  // Verify currency and chain match (must be before early return)
  const currencyMatches = useMemo(() => {
    if (!walletToken || !sendCurrency || !orderDetails) return false;
    
    // Check if supported currency IDs match
    const walletSupportedId = typeof walletToken.supportedCurrencyId === 'string' 
      ? walletToken.supportedCurrencyId 
      : (walletToken.supportedCurrencyId as any)?._id;
    const orderSupportedId = sendCurrencySupportedId;
    
    if (walletSupportedId !== orderSupportedId) return false;
    
    // Check if chains match
    const walletChainId = walletToken.chainId;
    const orderChainId = sendChain?._id;
    
    return walletChainId === orderChainId;
  }, [walletToken, sendCurrency, sendChain, sendCurrencySupportedId, orderDetails]);

  // Calculate amount to send from order details (must be before early return)
  const sendAmount = useMemo(() => {
    if (!orderDetails) return "0";
    // For buy orders: user sends buyAmount (crypto)
    // For sell orders: user sends sellAmount (crypto)
    if (isBuyCrypto) {
      return orderDetails.buyAmount?.toString() || "0";
    } else {
      return orderDetails.sellAmount?.toString() || "0";
    }
  }, [orderDetails, isBuyCrypto]);

  // Calculate network fee when amount and token are available (must be before early return)
  useEffect(() => {
    const calculateFee = async () => {
      if (!walletToken || !depositAddress || !sendChain || !sendAmount || parseFloat(sendAmount) <= 0) {
        return;
      }

      try {
        setIsCalculatingFee(true);
        const chainSymbol = sendChain.symbol;
        const fromAddress = await getAddress(chainSymbol, mainUserWalletGroup?._id);
        
        if (!fromAddress) {
          console.warn("No address found for chain:", chainSymbol);
          return;
        }

        const gasEstimate = await zapSDKService.estimateTransactionCost(
          depositAddress,
          parseFloat(sendAmount),
          fromAddress,
          chainSymbol,
          {
            tokenContractAddress: walletToken.tokenAddress || "",
            tokenAddress: walletToken.tokenAddress || "",
            tokenMintAddress: walletToken.tokenAddress || "",
            memo: "",
            feeRate: null,
          }
        );

        const chainToUse = chainsMap.get(walletToken.chainId);
        if (!chainToUse) {
          throw new Error("Chain not found");
        }

        // Get native token price for fee calculation
        const nativeToken = processedPortfolio?.assets.find(
          (asset: ProcessedAsset) => {
            return (
              asset.symbol.toUpperCase() ===
                ((chainToUse?.nativeCurrencyId as any)?.symbol || "").toUpperCase() &&
              asset.chainSymbol.toUpperCase() === chainToUse?.symbol.toUpperCase()
            );
          }
        );
        const nativePrice = nativeToken?.price || 0;

        let feeData = {
          fee: 0,
          feeInUSD: 0,
          speed: FeeSpeed.Standard,
          gasPrice: 0,
          gasLimit: 0,
          feeRate: 0,
        };

        if (chainToUse?.isEVM) {
          feeData.fee = (gasEstimate as any)?.gasPrice
            ? Number((gasEstimate as any).gasPrice) * Number((gasEstimate as any).gasLimit || 21000) / 1e18
            : 0.001; // Default fallback
          feeData.feeInUSD = feeData.fee * nativePrice;
          feeData.gasPrice = (gasEstimate as any)?.gasPrice || 0;
          feeData.gasLimit = (gasEstimate as any)?.gasLimit || 21000;
        } else if (chainToUse?.symbol === "SOL") {
          feeData.fee = (gasEstimate as any)?.fee || 0.000005;
          feeData.feeInUSD = feeData.fee * nativePrice;
        } else if (chainToUse?.symbol === "BTC") {
          feeData.fee = (gasEstimate as any)?.feeRate || 0.00001;
          feeData.feeInUSD = feeData.fee * nativePrice;
          feeData.feeRate = (gasEstimate as any)?.feeRate || 0.00001;
        } else if (chainToUse?.symbol === "TRX") {
          feeData.fee = (gasEstimate as any)?.fee || 0;
          feeData.feeInUSD = 0; // TRX fees are typically 0
        }

        setNetworkFee(feeData);
      } catch (error) {
        console.error("Failed to calculate network fee:", error);
        // Set default fee
        setNetworkFee({
          fee: 0.001,
          feeInUSD: 0,
          speed: FeeSpeed.Standard,
        });
      } finally {
        setIsCalculatingFee(false);
      }
    };

    if (orderDetails) {
      calculateFee();
    }
  }, [walletToken, depositAddress, sendChain, sendAmount, getAddress, mainUserWalletGroup?._id, chainsMap, processedPortfolio, orderDetails]);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Address copied to clipboard");
  };

  useImperativeHandle(ref, () => ({
    open: () => {
      console.log("📋 OrderDetailsSheet: open() called via ref");
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(0);
      } else {
        console.warn("📋 OrderDetailsSheet: bottomSheetRef.current is null");
      }
    },
    close: () => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.close();
      }
    },
  }));

  // Auto-open when orderDetails is set
  useEffect(() => {
    if (orderDetails && bottomSheetRef.current) {
      console.log("📋 OrderDetailsSheet: orderDetails set, auto-opening:", orderDetails._id);
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        if (bottomSheetRef.current) {
          bottomSheetRef.current.snapToIndex(0);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [orderDetails]);

  // Handle send from wallet - open confirm send bottom sheet
  const handleSendFromWallet = () => {
    if (!depositAddress || !sendChain || !currencyMatches || !walletToken) {
      Alert.alert(
        "Cannot Send",
        "Currency or chain mismatch. Please ensure you're sending the correct currency on the correct chain."
      );
      return;
    }
    
    // Open confirm send bottom sheet
    confirmSendRef.current?.snapToIndex(0);
  };

  // Handle actual send transaction
  const handleConfirmSend = async () => {
    if (!walletToken || !depositAddress || !sendChain || !sendAmount) {
      Alert.alert("Error", "Missing required information for sending");
      return;
    }

    try {
      const privateKey = await getPrivateKey(sendChain.symbol, mainUserWalletGroup?._id);
      if (!privateKey) {
        Alert.alert("Error", "Private key not found. Please unlock your wallet.");
        return;
      }

      const fromAddress = await getAddress(sendChain.symbol, mainUserWalletGroup?._id);
      if (!fromAddress) {
        Alert.alert("Error", "Address not found for this chain.");
        return;
      }

      const chainSymbol = sendChain.symbol.toUpperCase();
      const chain = chainsMap.get(walletToken.chainId);

      let baseParams: any = {
        fromAddress,
        toAddress: depositAddress,
        amount: parseFloat(sendAmount),
        privateKey,
        tokenDecimals: walletToken.decimals,
        chainSymbol: chainSymbol,
      };

      if ((chain as any)?.isEVM) {
        baseParams.tokenAddress = walletToken.tokenAddress || undefined;
      } else if (chain?.symbol === "SOL") {
        baseParams.tokenMintAddress = walletToken.tokenAddress || undefined;
      } else if (chain?.symbol === "TRX") {
        baseParams.tokenAddress = walletToken.tokenAddress || undefined;
      }

      // Send transaction
      const result = await zapSDKService.sendTransaction(baseParams);
      console.log("✅ Transaction sent successfully:", result);

      // Close confirm send sheet
      confirmSendRef.current?.close();

      // Navigate to success screen
      router.push({
        pathname: "/dashboard/home/send-token/success",
        params: {
          txHash: result,
          amount: sendAmount,
          tokenSymbol: walletToken.symbol || "ETH",
          recipientAddress: depositAddress,
          networkFee: networkFee?.fee?.toString() || "0",
          networkName: sendChain.name || "Ethereum",
        },
      });
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);
      Alert.alert(
        "Transaction Failed",
        error?.message || "Failed to send transaction. Please try again."
      );
    }
  };

  return (
    <>
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["90%"]}
      enablePanDownToClose
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          enableTouchThrough={false}
        />
      )}
      onClose={onClose}
      onChange={(index) => {
        // Log when sheet state changes
        console.log("📊 OrderDetailsSheet onChange:", index);
        if (index === -1 && orderDetails) {
          console.log("⚠️ OrderDetailsSheet closed unexpectedly");
        }
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.mainBackgroundColor,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.bodyTextColor,
        width: 32,
      }}
    >
      <BottomSheetView style={{ flex: 1, height: SIZES.height * 0.8 }}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderColor: theme.colors.secondaryBackgroundColor },
          ]}
        >
          <TouchableIcon
            source={Icons.cancel}
            onPress={() => bottomSheetRef.current?.close()}
            width={24}
          />
          <CustomText variant="header2" style={{ fontSize: 16 }}>
            Transaction Details
          </CustomText>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={{
            width: SIZES.width * 0.6,
            alignSelf: "center",
            marginBottom: 20,
          }}
        >
          <SwitchTab
            labels={["Summary", "Details"]}
            activeIndex={activeTab === "summary" ? 0 : 1}
            onPress={(i) => setActiveTab(i === 0 ? "summary" : "details")}
          />
        </View>

        {activeTab === "summary" ? (
          // Summary Tab
          <Box flex={1} px="m">
            {/* Order Status */}
            <Box
              bg="secondaryBackgroundColor"
              borderRadius={8}
              p="m"
              mb="s"
              alignItems="center"
            >
              <CustomText variant="body" color="placeholderTextColor" mb="s">
                YOU SEND
              </CustomText>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <SmartImage
                  source={
                    orderDetails?.buyCurrency?.currencyId?.logo ||
                    orderDetails?.buyCurrency?.image ||
                    ""
                  }
                  width={20}
                  height={20}
                  style={{ marginRight: 10, borderRadius: 10 }}
                />
                <CustomText variant="subheader" style={{ fontSize: 22 }}>
                  {isBuyCrypto
                    ? formatNumber(orderDetails?.buyAmount || 0) + " " + buySymbol
                    : buySymbol + formatNumber(orderDetails?.buyAmount || 0, 2)}
                </CustomText>
              </View>
            </Box>
            {orderDetails && (
            <OverviewDetails
                key={orderDetails._id}
              orderDetails={orderDetails}
            />
            )}

            {/* Info Box */}
            <Box
              bg="warningBackgroundColor"
              borderRadius={4}
              p="m"
              flexDirection="row"
              alignItems="center"
              mb="m"
              mt="m"
            >
              <Box width={2} height="100%" bg="warningColor" mr="s" />
              <CustomText variant="body" flex={1} style={{ fontSize: 12 }}>
                We will complete your transaction of{" "}
                {isSellCrypto
                  ? formatNumber(orderDetails?.sellAmount || 0) + " " + sellSymbol
                  : sellSymbol + formatNumber(orderDetails?.sellAmount || 0, 2)}{" "}
                after we confirm receipt of your deposit.
              </CustomText>
            </Box>
            <CustomButton
              onPress={() => setActiveTab("details")}
              text="Show Deposit Details"
              color="primary"
              width="auto"
              borderRadius={56}
              paddingHorizontal={12}
              bgColor="#6045FF"
            />
          </Box>
        ) : (
          // Details Tab
          <Box flex={1} px="m">
            <Box alignItems="center">
              {isBuyCrypto && (
                <CustomText fontSize={18} variant="subheader" mb="m">
                  Deposit Address
                </CustomText>
              )}
              {isBuyCrypto ? (
                <Box padding="s" bg="white" mb="m">
                  <QRCode
                    value={orderDetails?.depositAccount?.walletAddress}
                    size={150}
                    color="black"
                    backgroundColor="white"
                  />
                </Box>
              ) : (
                <Box
                  bg="secondaryBackgroundColor"
                  borderRadius={8}
                  p="m"
                  mb="s"
                  alignItems="center"
                  width="100%"
                >
                  <CustomText
                    variant="body"
                    color="placeholderTextColor"
                    mb="s"
                  >
                    YOU SEND
                  </CustomText>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <SmartImage
                      source={
                        orderDetails?.buyCurrency?.currencyId?.logo ||
                        orderDetails?.buyCurrency?.image ||
                        ""
                      }
                      width={20}
                      height={20}
                      style={{ marginRight: 10, borderRadius: 10 }}
                    />
                    <CustomText variant="subheader" style={{ fontSize: 22 }}>
                      {isBuyCrypto
                        ? formatNumber(orderDetails?.buyAmount || 0) + " " + buySymbol
                        : buySymbol + formatNumber(orderDetails?.buyAmount || 0, 2)}
                    </CustomText>
                  </View>
                </Box>
              )}
              <Box
                width="100%"
                bg="secondaryBackgroundColor"
                borderRadius={8}
                p="m"
                mt="s"
              >
                {!isBuyCrypto && (
                  <CustomText
                    textAlign="center"
                    variant="body"
                    color="bodyTextColor"
                    mb="s"
                  >
                    Make your deposit using the account details provided below.
                  </CustomText>
                )}
                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="placeholderTextColor">
                    {isBuyCrypto ? "Chain:" : "Bank:"}
                  </CustomText>
                  <Box flexDirection="row">
                    {isBuyCrypto ? (
                      <SmartImage
                        source={getChainImage(buyChain?._id || "")}
                        width={20}
                        height={20}
                        style={{ marginRight: 10 }}
                      />
                    ) : (
                      <Box marginRight="s">
                        <BankIcon
                          bank={orderDetails?.depositAccount?.bankId as any}
                          size={20}
                          borderRadius={4}
                        />
                      </Box>
                    )}
                    <CustomText>
                      {isBuyCrypto
                        ? buyChain?.name
                        : orderDetails?.depositAccount?.bankId?.name}
                    </CustomText>
                  </Box>
                </Box>

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="placeholderTextColor">
                    {isBuyCrypto ? "Address:" : "Account Number:"}
                  </CustomText>
                  <Box flexDirection="row">
                    <CustomText style={{ margin: 0 }}>
                      {isBuyCrypto
                        ? formatWalletAddress(
                            orderDetails?.depositAccount?.walletAddress || "",
                            6,
                            6
                          )
                        : orderDetails?.depositAccount?.number || ""}
                    </CustomText>
                    <TouchableOpacity
                      onPress={() =>
                        copyToClipboard(
                          isBuyCrypto
                            ? orderDetails?.depositAccount?.walletAddress || ""
                            : orderDetails?.depositAccount?.number || ""
                        )
                      }
                      style={{ marginLeft: 5 }}
                    >
                      <Image
                        source={Icons.copy}
                        style={{ width: 20, height: 20 }}
                      />
                    </TouchableOpacity>
                  </Box>
                </Box>

                {!isBuyCrypto && (
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    py="s"
                  >
                    <CustomText variant="body" color="placeholderTextColor">
                      Account Name:
                    </CustomText>
                    <Box flexDirection="row">
                      <CustomText style={{ margin: 0 }}>
                        {orderDetails?.depositAccount?.holderName || ""}
                      </CustomText>
                    </Box>
                  </Box>
                )}

                <Box flexDirection="row" justifyContent="space-between" py="s">
                  <CustomText variant="body" color="placeholderTextColor">
                    Tx ID:
                  </CustomText>
                  <CustomText>{orderDetails?._id}</CustomText>
                </Box>

                {/* Send from wallet button for crypto deposits (both buy and sell orders) */}
                {isDepositCrypto && depositAddress && (
                  <Box mt="m">
                    <CustomButton
                      text={hasBalance ? "Send from Wallet" : "Insufficient Balance"}
                      onPress={handleSendFromWallet}
                      width="100%"
                      borderRadius={56}
                      bgColor={hasBalance && currencyMatches ? theme.colors.primaryColor : theme.colors.disabledTextColor}
                      color="white"
                      disabled={!hasBalance || !currencyMatches}
                    />
                    {!currencyMatches && (
                      <CustomText 
                        variant="body" 
                        color="error" 
                        fontSize={12} 
                        textAlign="center" 
                        style={{ marginTop: 8 }}
                      >
                        Currency or chain mismatch
                      </CustomText>
                    )}
                    {!hasBalance && (
                      <CustomText 
                        variant="body" 
                        color="disabledTextColor" 
                        fontSize={12} 
                        textAlign="center" 
                        style={{ marginTop: 8 }}
                      >
                        You don&apos;t have this token in your wallet
                      </CustomText>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </BottomSheetView>
    </BottomSheet>
    {/* Confirm Send Bottom Sheet - rendered as sibling to avoid nesting issues */}
    {walletToken && (
      <ConfirmSend
        ref={confirmSendRef}
        send={handleConfirmSend}
        selectedToken={walletToken}
        recipientAddress={depositAddress || ""}
        amount={sendAmount}
        usdValue={parseFloat(sendAmount) * (walletToken.price || 0)}
        networkFee={networkFee}
        onClose={() => confirmSendRef.current?.close()}
        onTransactionComplete={() => {
          console.log("Transaction completed");
        }}
        bottomInset={tabBarHeight}
      />
    )}
    </>
  );
});

OrderDetailsSheet.displayName = "OrderDetailsSheet";

export default OrderDetailsSheet;

const styles = StyleSheet.create({
  container: {},
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,

    marginBottom: 8,
  },
});
