import {
  ThemedBookIcon,
  ThemedScanIcon,
} from "@/assets/svg/wallet-icons-components";
import ConfirmSend from "@/components/bottomsheets/send/ConfirmSend";
import SaveAddress from "@/components/bottomsheets/send/SaveAddress";
import SendSuccessModal from "@/components/bottomsheets/send/SendSuccessModal";
import WhatIsNetworkFeeBottomsheet from "@/components/bottomsheets/send/WhatIsNetworkFeeBottomSheet";
import TokenSelectorBottomSheet from "@/components/bottomsheets/TokenSelectorBottomSheet";
import WalletSelectorBottomSheet from "@/components/bottomsheets/WalletSelectorBottomSheet";
import {
  AppBar,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import Box from "@/components/general/Box";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import {
  ProcessedAsset,
  ProcessedPortfolio,
} from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import WalletCredentialsStorage from "@/src/core/storage/wallet-credentials-storage";
import { formatNumber } from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronLeft, HelpCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { ChevronRight } from "react-native-feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

// Blockchain transaction type definitions
type TransactionType =
  | "NATIVE_ETH"
  | "ERC20_TOKEN"
  | "NATIVE_BTC"
  | "NATIVE_SOL"
  | "SPL_TOKEN"
  | "NATIVE_TRX"
  | "TRC20_TOKEN"
  | "NATIVE_EVM" // For other EVM chains (MATIC, ARB, OP, BASE, etc.)
  | "EVM_TOKEN"; // For tokens on EVM chains

// Blockchain-specific parameter interface
interface BlockchainParams {
  fromAddress: string;
  toAddress: string;
  amount: number;
  chainSymbol: string;
  privateKey: string;
  tokenDecimals?: number;
  // ETH/ERC-20 parameters
  tokenAddress?: string;
  gasPrice?: string;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  // Solana/SPL parameters
  tokenMintAddress?: string;
  memo?: string;
  // Tron/TRC-20 parameters
  tokenContractAddress?: string;
  // Bitcoin parameters
  utxos?: any[];
  feeRate?: number;
  // General parameters
  nonce?: number;
}

// Determine transaction type based on token and chain
const determineTransactionType = (
  token: ProcessedAsset,
  chainSymbol: string
): TransactionType => {
  console.log("🔍 Determining transaction type:", {
    symbol: token.symbol,
    chainSymbol,
    tokenAddress: token.tokenAddress,
    chainName: token.chainName,
  });

  // Check if it's a native token (no token address)
  const isNativeToken =
    !token.tokenAddress ||
    token.tokenAddress === "" ||
    token.tokenAddress === "0x0000000000000000000000000000000000000000";

  // Bitcoin
  if (chainSymbol === "BTC" || chainSymbol === "BITCOIN") {
    return "NATIVE_BTC";
  }

  // Solana
  if (chainSymbol === "SOL" || chainSymbol === "SOLANA") {
    return isNativeToken ? "NATIVE_SOL" : "SPL_TOKEN";
  }

  // Tron
  if (chainSymbol === "TRX" || chainSymbol === "TRON") {
    return isNativeToken ? "NATIVE_TRX" : "TRC20_TOKEN";
  }

  // Ethereum and EVM chains
  if (
    chainSymbol === "ETH" ||
    chainSymbol === "MATIC" ||
    chainSymbol === "ARB" ||
    chainSymbol === "OP" ||
    chainSymbol === "BASE" ||
    chainSymbol === "AVAX" ||
    chainSymbol === "BNB" ||
    chainSymbol === "FTM" ||
    chainSymbol === "ONE"
  ) {
    // Check if it's Ethereum mainnet
    if (chainSymbol === "ETH") {
      return isNativeToken ? "NATIVE_ETH" : "ERC20_TOKEN";
    }

    // Other EVM chains
    return isNativeToken ? "NATIVE_EVM" : "EVM_TOKEN";
  }

  // Default fallback
  console.warn(
    "⚠️ Unknown chain symbol, defaulting to NATIVE_ETH:",
    chainSymbol
  );
  return isNativeToken ? "NATIVE_ETH" : "ERC20_TOKEN";
};

// Add blockchain-specific parameters based on transaction type
const addBlockchainSpecificParams = (
  baseParams: any,
  token: ProcessedAsset,
  transactionType: TransactionType,
  chainSymbol: string
): BlockchainParams => {
  console.log("🔍 Adding blockchain-specific parameters:", {
    transactionType,
    chainSymbol,
  });

  const params: BlockchainParams = { ...baseParams };

  // Ensure chainSymbol is preserved
  params.chainSymbol = chainSymbol;
  console.log("🔍 Set chainSymbol in params:", params.chainSymbol);

  switch (transactionType) {
    case "NATIVE_ETH":
      console.log("🔧 Configuring for native ETH transaction");
      // No additional parameters needed for native ETH
      break;

    case "ERC20_TOKEN":
      console.log("🔧 Configuring for ERC-20 token transaction");
      params.tokenAddress = token.tokenAddress || undefined;
      params.gasPrice = "20000000000"; // 20 Gwei
      params.gasLimit = "100000"; // Higher gas limit for token transfers
      break;

    case "NATIVE_BTC":
      console.log("🔧 Configuring for native BTC transaction");
      params.feeRate = 10; // sat/byte
      // Note: UTXOs would be fetched by the SDK
      break;

    case "NATIVE_SOL":
      console.log("🔧 Configuring for native SOL transaction");
      params.memo = ""; // Optional memo
      break;

    case "SPL_TOKEN":
      console.log("🔧 Configuring for SPL token transaction");
      params.tokenMintAddress = token.tokenAddress || undefined;
      params.memo = ""; // Optional memo
      break;

    case "NATIVE_TRX":
      console.log("🔧 Configuring for native TRX transaction");
      params.memo = ""; // Optional memo
      break;

    case "TRC20_TOKEN":
      console.log("🔧 Configuring for TRC-20 token transaction");
      params.tokenContractAddress = token.tokenAddress || undefined;
      params.memo = ""; // Optional memo
      break;

    case "NATIVE_EVM":
      console.log("🔧 Configuring for native EVM transaction");
      // Set appropriate gas parameters for EVM chains
      if (chainSymbol === "MATIC") {
        params.gasPrice = "30000000000"; // 30 Gwei for Polygon
        params.gasLimit = "21000";
      } else if (chainSymbol === "ARB" || chainSymbol === "OP") {
        params.maxFeePerGas = "20000000000"; // EIP-1559 for L2s
        params.maxPriorityFeePerGas = "2000000000";
        params.gasLimit = "21000";
      } else {
        params.gasPrice = "20000000000"; // Default 20 Gwei
        params.gasLimit = "21000";
      }
      break;

    case "EVM_TOKEN":
      console.log("🔧 Configuring for EVM token transaction");
      params.tokenAddress = token.tokenAddress || undefined;
      // Set appropriate gas parameters for EVM token transfers
      if (chainSymbol === "MATIC") {
        params.gasPrice = "30000000000"; // 30 Gwei for Polygon
        params.gasLimit = "100000";
      } else if (chainSymbol === "ARB" || chainSymbol === "OP") {
        params.maxFeePerGas = "20000000000"; // EIP-1559 for L2s
        params.maxPriorityFeePerGas = "2000000000";
        params.gasLimit = "100000";
      } else {
        params.gasPrice = "20000000000"; // Default 20 Gwei
        params.gasLimit = "100000";
      }
      break;

    default:
      console.warn(
        "⚠️ Unknown transaction type, using default parameters:",
        transactionType
      );
      break;
  }

  console.log("✅ Final transaction parameters:", {
    transactionType,
    chainSymbol,
    hasTokenAddress: !!params.tokenAddress,
    hasTokenMintAddress: !!params.tokenMintAddress,
    hasTokenContractAddress: !!params.tokenContractAddress,
    gasPrice: params.gasPrice,
    gasLimit: params.gasLimit,
  });

  return params;
};

// Calculate network fees based on blockchain and transaction type
const calculateNetworkFee = async (
  selectedToken: ProcessedAsset | null,
  chainSymbol: string,
  transactionType: TransactionType,
  amount: string
): Promise<{
  fee: string;
  feeInUSD: string;
  speed: string;
  gasPrice?: string;
  gasLimit?: string;
  feeRate?: number;
}> => {
  console.log("🔍 Calculating network fee:", {
    chainSymbol,
    transactionType,
    amount,
  });

  if (!selectedToken) {
    return {
      fee: "0",
      feeInUSD: "$0.00",
      speed: "Standard",
    };
  }

  // Mock fee calculation - in real implementation, this would call the SDK
  const mockFees = {
    // Ethereum fees
    ETH: {
      native: { fee: "0.001", usd: "$2.50", gasPrice: "20", gasLimit: "21000" },
      token: { fee: "0.003", usd: "$7.50", gasPrice: "20", gasLimit: "100000" },
    },
    // Bitcoin fees
    BTC: { native: { fee: "0.0001", usd: "$3.20", feeRate: 10 } },
    // Solana fees
    SOL: {
      native: { fee: "0.000005", usd: "$0.01" },
      token: { fee: "0.000005", usd: "$0.01" },
    },
    // Tron fees
    TRX: {
      native: { fee: "1", usd: "$0.10" },
      token: { fee: "1", usd: "$0.10" },
    },
    // EVM chain fees
    MATIC: {
      native: { fee: "0.01", usd: "$0.02", gasPrice: "30", gasLimit: "21000" },
      token: { fee: "0.05", usd: "$0.10", gasPrice: "30", gasLimit: "100000" },
    },
    ARB: {
      native: {
        fee: "0.0001",
        usd: "$0.25",
        gasPrice: "0.1",
        gasLimit: "21000",
      },
      token: {
        fee: "0.0003",
        usd: "$0.75",
        gasPrice: "0.1",
        gasLimit: "100000",
      },
    },
    OP: {
      native: {
        fee: "0.0001",
        usd: "$0.25",
        gasPrice: "0.1",
        gasLimit: "21000",
      },
      token: {
        fee: "0.0003",
        usd: "$0.75",
        gasPrice: "0.1",
        gasLimit: "100000",
      },
    },
    BASE: {
      native: {
        fee: "0.0001",
        usd: "$0.25",
        gasPrice: "0.1",
        gasLimit: "21000",
      },
      token: {
        fee: "0.0003",
        usd: "$0.75",
        gasPrice: "0.1",
        gasLimit: "100000",
      },
    },
    AVAX: {
      native: { fee: "0.01", usd: "$0.35", gasPrice: "25", gasLimit: "21000" },
      token: { fee: "0.05", usd: "$1.75", gasPrice: "25", gasLimit: "100000" },
    },
    BNB: {
      native: { fee: "0.0005", usd: "$1.50", gasPrice: "5", gasLimit: "21000" },
      token: { fee: "0.002", usd: "$6.00", gasPrice: "5", gasLimit: "100000" },
    },
    FTM: {
      native: { fee: "0.1", usd: "$0.10", gasPrice: "1", gasLimit: "21000" },
      token: { fee: "0.5", usd: "$0.50", gasPrice: "1", gasLimit: "100000" },
    },
    ONE: {
      native: { fee: "0.01", usd: "$0.01", gasPrice: "1", gasLimit: "21000" },
      token: { fee: "0.05", usd: "$0.05", gasPrice: "1", gasLimit: "100000" },
    },
  };

  const chainFees = mockFees[chainSymbol as keyof typeof mockFees];
  if (!chainFees) {
    // Default fallback
    return {
      fee: "0.001",
      feeInUSD: "$2.50",
      speed: "Standard",
    };
  }

  // Determine if it's a token transaction
  const isTokenTransaction =
    transactionType.includes("TOKEN") ||
    transactionType.includes("ERC") ||
    transactionType.includes("SPL") ||
    transactionType.includes("TRC");
  const feeData =
    isTokenTransaction && "token" in chainFees
      ? chainFees.token
      : chainFees.native;

  return {
    fee: feeData.fee,
    feeInUSD: feeData.usd,
    speed: "Fast",
    gasPrice: "gasPrice" in feeData ? (feeData.gasPrice as string) : undefined,
    gasLimit: "gasLimit" in feeData ? (feeData.gasLimit as string) : undefined,
    feeRate: "feeRate" in feeData ? (feeData.feeRate as number) : undefined,
  };
};

const SendToken = () => {
  const { tokenId } = useLocalSearchParams();
  const [amount, setAmount] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<ProcessedAsset | null>(
    null
  );
  const [processedPortfolio, setProcessedPortfolio] =
    useState<ProcessedPortfolio | null>(null);
  const [showRecentTransfers, setShowRecentTransfers] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<
    string | null
  >(null);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [inputMode, setInputMode] = useState<"value" | "dollar">("value");
  const [networkFee, setNetworkFee] = useState<{
    fee: string;
    feeInUSD: string;
    speed: string;
    gasPrice?: string;
    gasLimit?: string;
    feeRate?: number;
  } | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [balanceValidationError, setBalanceValidationError] = useState<
    string | null
  >(null);
  const [isValidatingBalance, setIsValidatingBalance] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const balanceValidationTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Global cache for derived private keys (persists across app session)
  // We use deriveAddress for single chain derivation and cache results
  // to avoid re-deriving the same chain multiple times
  const globalDerivedKeysCache = useRef<{
    [walletId: string]: { [chain: string]: string };
  }>({});

  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { networkFeeRef, confirmSendRef, saveAddressRef } =
    useBottomSheetRefs();
  const sendTokenRef = useRef<BottomSheet>(null);
  const { mainUserWalletGroup, portfolio } = useWallet();
  const [permission, requestPermission] = useCameraPermissions();

  // Mock recent transfers data - matching the exact design from images
  const recentTransfers = [
    {
      name: "Moonbag",
      address: "Vincent.Zap",
      type: "username",
      hasLabel: true,
    },
    {
      name: "0xd5321...de32",
      address: "0xd5321...de32",
      type: "address",
      hasLabel: false,
    },
    {
      name: "Vincent.zap",
      address: "Vincent.zap",
      type: "username",
      hasLabel: false,
    },
    {
      name: "Moonbag",
      address: "0xdf53...de32",
      type: "address",
      hasLabel: true,
    },
  ];

  const handlePasteAddress = async () => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      setRecipientAddress(clipboardText);
    } catch (error) {
      console.error("Failed to get clipboard content:", error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Validate balance including gas fees
  const validateBalance = useCallback(
    async (
      amount: string,
      selectedToken: ProcessedAsset | null,
      networkFee: any
    ) => {
      console.log("🔍 Validating balance:", {
        amount,
        selectedToken: !!selectedToken,
        networkFee: !!networkFee,
      });

      if (!selectedToken || !amount || parseFloat(amount) <= 0) {
        setBalanceValidationError(null);
        return true;
      }

      try {
        setIsValidatingBalance(true);
        setBalanceValidationError(null);

        const amountValue = parseFloat(amount);
        const tokenBalance = selectedToken.balance || 0;

        // For native tokens, we need to account for gas fees
        const isNativeToken =
          !selectedToken.tokenAddress ||
          selectedToken.tokenAddress === "" ||
          selectedToken.tokenAddress ===
            "0x0000000000000000000000000000000000000000";

        let totalRequired = amountValue;

        if (isNativeToken && networkFee) {
          // For native tokens, add gas fee to the amount
          const feeValue = parseFloat(networkFee.fee || "0");
          totalRequired = amountValue + feeValue;
          console.log("🔍 Native token - adding gas fee:", {
            amountValue,
            feeValue,
            totalRequired,
          });
        }

        console.log("🔍 Balance validation:", {
          tokenBalance,
          amountValue,
          totalRequired,
          isNativeToken,
          hasNetworkFee: !!networkFee,
        });

        if (totalRequired > tokenBalance) {
          const shortfall = totalRequired - tokenBalance;
          const errorMessage = isNativeToken
            ? `Insufficient balance. You need ${shortfall.toFixed(6)} more ${
                selectedToken.symbol
              } (including gas fees).`
            : `Insufficient balance. You need ${shortfall.toFixed(6)} more ${
                selectedToken.symbol
              }.`;

          setBalanceValidationError(errorMessage);
          console.log("❌ Balance validation failed:", errorMessage);
          return false;
        }

        console.log("✅ Balance validation passed");
        setBalanceValidationError(null);
        return true;
      } catch (error) {
        console.error("Balance validation error:", error);
        setBalanceValidationError("Unable to validate balance");
        return false;
      } finally {
        setIsValidatingBalance(false);
      }
    },
    []
  );

  // Address validation using SDK
  const validateAddress = useCallback(
    async (address: string) => {
      console.log("🔍 Starting address validation for:", address);

      if (!address || address.trim().length === 0) {
        console.log("🔍 Address is empty, clearing validation error");
        setAddressValidationError(null);
        return true;
      }

      try {
        console.log("🔍 Setting validating state to true");
        setIsValidatingAddress(true);
        setAddressValidationError(null);

        // Use SDK to validate address format
        const validationResult = await zapSDKService.validateAddress(
          address,
          selectedToken?.chainSymbol || "ETH"
        );

        console.log("🔍 SDK validation result:", validationResult);

        // Handle SDK response - it returns { isValid: boolean, error?: string }
        if (!validationResult.isValid) {
          const errorMessage =
            validationResult.error ||
            "Invalid address format for this blockchain";
          setAddressValidationError(errorMessage);
          console.log("❌ Address validation failed:", errorMessage);
          return false;
        }

        console.log("✅ Address validation passed");
        setAddressValidationError(null);
        return true;
      } catch (error) {
        console.error("Address validation error:", error);
        setAddressValidationError("Unable to validate address");
        return false;
      } finally {
        setIsValidatingAddress(false);
      }
    },
    [selectedToken]
  );

  const validateInputs = () => {
    const errors = [];

    if (!selectedToken) {
      errors.push("Please select a token");
    }

    if (!recipientAddress || recipientAddress.trim().length === 0) {
      errors.push("Please enter a recipient address");
    } else if (recipientAddress.length < 10) {
      errors.push("Recipient address is too short");
    } else if (addressValidationError) {
      console.log("❌ Address validation error found:", addressValidationError);
      errors.push(addressValidationError);
    } else if (
      recipientAddress.trim().length >= 10 &&
      !addressValidationError &&
      !isValidatingAddress
    ) {
      // Address looks valid, no additional validation needed
      console.log("✅ Address validation passed - no errors found");
    }

    if (balanceValidationError) {
      console.log("❌ Balance validation error found:", balanceValidationError);
      errors.push(balanceValidationError);
    }

    if (!amount || amount.trim().length === 0) {
      errors.push("Please enter an amount");
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errors.push("Please enter a valid amount");
    } else if (selectedToken) {
      const amountValue = parseFloat(amount);
      const tokenBalance = selectedToken.balance || 0;

      // For native tokens, we need to account for gas fees
      const isNativeToken =
        !selectedToken.tokenAddress ||
        selectedToken.tokenAddress === "" ||
        selectedToken.tokenAddress ===
          "0x0000000000000000000000000000000000000000";

      let totalRequired = amountValue;

      if (isNativeToken && networkFee) {
        // For native tokens, add gas fee to the amount
        const feeValue = parseFloat(networkFee.fee || "0");
        totalRequired = amountValue + feeValue;
      }

      if (totalRequired > tokenBalance) {
        const shortfall = totalRequired - tokenBalance;
        const errorMessage = isNativeToken
          ? `Insufficient balance. You need ${shortfall.toFixed(6)} more ${
              selectedToken.symbol
            } (including gas fees).`
          : `Insufficient balance. You need ${shortfall.toFixed(6)} more ${
              selectedToken.symbol
            }.`;
        errors.push(errorMessage);
      }
    }

    if (isValidatingAddress) {
      errors.push("Please wait for address validation to complete");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSendTransaction = async () => {
    console.log("🚀 handleSendTransaction called");
    console.log("🔍 Current state:", {
      hasSelectedToken: !!selectedToken,
      hasAmount: !!amount,
      hasRecipientAddress: !!recipientAddress,
      isValidatingAddress,
      hasAddressValidationError: !!addressValidationError,
      isContinueDisabled,
    });

    // Dismiss keyboard first
    Keyboard.dismiss();

    // Trigger final address validation if not already validating
    if (
      recipientAddress &&
      recipientAddress.trim().length >= 10 &&
      !isValidatingAddress
    ) {
      console.log("🔍 Triggering final address validation before continue");
      await validateAddress(recipientAddress);
    }

    // Show confirm modal first
    console.log("🔍 Opening confirm modal");
    confirmSendRef.current?.snapToIndex(0);
  };

  // Debug function to emergency stop SDK
  const emergencyStopSDK = () => {
    console.log("🚨 Emergency stopping SDK...");
    zapSDKService.emergencyStop();
    Alert.alert("Emergency Stop", "SDK emergency stopped. Check console for results.");
  };

  // Debug function to check retry loop status
  const checkRetryLoopStatus = () => {
    const status = zapSDKService.getDetailedStatus();
    console.log("📊 Retry Loop Status:", status);
    Alert.alert(
      "Retry Loop Status", 
      `Circuit Breaker: ${status.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED'}\nFailure Count: ${status.circuitBreaker.failureCount}\nSDK Status: ${status.hasSDK ? 'ACTIVE' : 'DESTROYED'}\nRetrying: ${status.isRetrying ? 'YES' : 'NO'}`
    );
  };

  const handleConfirmSend = async () => {
    console.log("🚀 handleConfirmSend called");

    // Check circuit breaker status before proceeding
    const circuitStatus = zapSDKService.getCircuitBreakerStatus();
    console.log("🔍 Circuit breaker status:", circuitStatus);
    
    if (circuitStatus.isOpen) {
      Alert.alert(
        "Service Temporarily Unavailable", 
        "Authentication service is temporarily unavailable. Please try again later."
      );
      return;
    }

    // Emergency circuit breaker trigger (for testing)
    if (circuitStatus.failureCount > 2) {
      console.warn("🚨 Too many auth failures detected, triggering circuit breaker");
      zapSDKService.triggerCircuitBreaker();
      Alert.alert(
        "Service Temporarily Unavailable", 
        "Authentication service is temporarily unavailable. Please try again later."
      );
      return;
    }

    const validation = validateInputs();
    console.log("🔍 Validation result:", validation);

    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
      Alert.alert("Validation Error", validation.errors.join("\n"));
      return;
    }

    console.log("✅ Validation passed, proceeding with transaction");

    try {
      setIsSending(true);

      // Get the wallet's private key
      console.log("🔍 Getting private key...");
      const privateKey = await getPrivateKey();
      console.log("🔍 Private key retrieved:", !!privateKey);

      if (!privateKey) {
        console.log("❌ Private key not found");
        Alert.alert(
          "Error",
          "Private key not found. Please unlock your wallet."
        );
        return;
      }

      console.log("✅ Private key found, proceeding with transaction");

      // Debug selectedToken properties
      console.log("🔍 SelectedToken debug:", {
        symbol: selectedToken?.symbol,
        chainSymbol: selectedToken?.chainSymbol,
        chainName: selectedToken?.chainName,
        chainId: selectedToken?.chainId,
        tokenAddress: selectedToken?.tokenAddress,
        decimals: selectedToken?.decimals,
      });

      // Debug the full selectedToken object
      console.log(
        "🔍 Full selectedToken object:",
        JSON.stringify(selectedToken, null, 2)
      );

      // Determine the correct chain symbol with better fallbacks
      let chainSymbol = selectedToken?.chainSymbol;

      // If chainSymbol is empty or "UNKNOWN", try to determine from other properties
      if (!chainSymbol || chainSymbol === "UNKNOWN" || chainSymbol === "") {
        console.log(
          "🔍 ChainSymbol is empty/unknown, trying to determine from other properties"
        );

        // Try to determine from chainName
        if (selectedToken?.chainName) {
          const chainNameMap: { [key: string]: string } = {
            Ethereum: "ETH",
            Bitcoin: "BTC",
            Solana: "SOL",
            Tron: "TRX",
            // Map EVM chains to ETH for now (SDK might only support ETH for EVM)
            Polygon: "ETH", // MATIC -> ETH
            Arbitrum: "ETH", // ARB -> ETH
            Optimism: "ETH", // OP -> ETH
            Base: "ETH", // BASE -> ETH
            Avalanche: "ETH", // AVAX -> ETH
            BSC: "ETH", // BNB -> ETH
            Fantom: "ETH", // FTM -> ETH
            Harmony: "ETH", // ONE -> ETH
            // Add more chains as needed
          };

          chainSymbol = chainNameMap[selectedToken.chainName] || "ETH";
          console.log("🔍 Determined chainSymbol from chainName:", chainSymbol);
        } else {
          // Final fallback based on token symbol
          const symbolChainMap: { [key: string]: string } = {
            BTC: "BTC",
            ETH: "ETH",
            SOL: "SOL",
            TRX: "TRX",
            // Map EVM chains to ETH for now (SDK might only support ETH for EVM)
            MATIC: "ETH", // Polygon -> ETH
            AVAX: "ETH", // Avalanche -> ETH
            BNB: "ETH", // BSC -> ETH
            FTM: "ETH", // Fantom -> ETH
            ONE: "ETH", // Harmony -> ETH
            USDT: "ETH", // USDT is usually on ETH by default
            USDC: "ETH", // USDC is usually on ETH by default
            DAI: "ETH", // DAI is usually on ETH by default
            WETH: "ETH", // Wrapped ETH
            WBTC: "ETH", // Wrapped BTC on ETH
          };

          chainSymbol = symbolChainMap[selectedToken?.symbol || ""] || "ETH";
          console.log(
            "🔍 Determined chainSymbol from token symbol:",
            chainSymbol
          );
        }
      }

      console.log("🔍 Final chainSymbol determined:", chainSymbol);

      // Ensure we always have a valid chain symbol
      if (!chainSymbol || chainSymbol === "" || chainSymbol === "UNKNOWN") {
        console.log("⚠️ ChainSymbol is still invalid, forcing ETH fallback");
        chainSymbol = "ETH";
      }

      // Ensure uppercase format as SDK expects uppercase chain symbols
      chainSymbol = chainSymbol.toUpperCase();
      console.log(
        "🔍 Final chainSymbol after validation and uppercase conversion:",
        chainSymbol
      );

      // Determine transaction type and prepare blockchain-specific parameters
      const transactionType = determineTransactionType(
        selectedToken!,
        chainSymbol
      );
      console.log("🔍 Transaction type determined:", transactionType);

      // Prepare base transaction parameters
      const baseParams = {
        fromAddress: mainUserWalletGroup?.address || "",
        toAddress: recipientAddress,
        amount: parseFloat(amount),
        chainSymbol: chainSymbol,
        privateKey: privateKey,
        tokenDecimals: selectedToken!.decimals,
      };

      // Add blockchain-specific parameters based on transaction type
      console.log("🔍 Before addBlockchainSpecificParams:", {
        baseParams,
        selectedToken: selectedToken?.symbol,
        transactionType,
        chainSymbol,
      });

      const transactionParams = addBlockchainSpecificParams(
        baseParams,
        selectedToken!,
        transactionType,
        chainSymbol
      );

      console.log("🔍 After addBlockchainSpecificParams:", {
        chainSymbol: transactionParams.chainSymbol,
        fromAddress: transactionParams.fromAddress,
        toAddress: transactionParams.toAddress,
        amount: transactionParams.amount,
      });

      console.log("🚀 Sending transaction with params:", {
        fromAddress: transactionParams.fromAddress,
        toAddress: transactionParams.toAddress,
        amount: transactionParams.amount,
        chainSymbol: transactionParams.chainSymbol,
        tokenAddress: transactionParams.tokenAddress,
      });

      // Debug: Log all transaction parameters
      console.log(
        "🔍 Full transaction parameters being sent to SDK:",
        JSON.stringify(transactionParams, null, 2)
      );

      // Final validation before sending
      console.log("🔍 Final chainSymbol validation:", {
        chainSymbol: transactionParams.chainSymbol,
        isEmpty: !transactionParams.chainSymbol,
        isBlank: transactionParams.chainSymbol === "",
        length: transactionParams.chainSymbol?.length,
      });

      if (
        !transactionParams.chainSymbol ||
        transactionParams.chainSymbol === ""
      ) {
        console.error("❌ Invalid chainSymbol, aborting transaction");
        Alert.alert("Error", "Invalid chain configuration. Please try again.");
        return;
      }

      // Send the transaction using the SDK
      console.log("🚀 Calling SDK sendTransaction...");
      let result: any;
      try {
        result = await zapSDKService.sendTransaction(transactionParams);
        console.log("✅ Transaction sent successfully:", result);
      } catch (error: any) {
        console.error("❌ Transaction failed:", error);
        console.error("❌ Error details:", {
          message: error?.message,
          code: error?.code,
          chainSymbol: transactionParams.chainSymbol,
          fullError: JSON.stringify(error, null, 2),
        });

        // Check if it's an unsupported chain error
        if (
          error?.message?.includes("unsupported") ||
          error?.message?.includes("chain")
        ) {
          Alert.alert(
            "Unsupported Chain",
            `The chain "${transactionParams.chainSymbol}" is not supported by the SDK. Please try with a different token.`
          );
          return;
        }

        // Re-throw other errors
        throw error;
      }

      const txHash =
        (result as any)?.transactionHash ||
        (result as any)?.hash ||
        (result as any)?.txHash ||
        "Unknown";

      // Show success modal or navigate to success screen
      Alert.alert(
        "Success!",
        `Transaction sent successfully!\nHash: ${txHash}`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setAmount("");
              setRecipientAddress("");
              setSelectedToken(null);
              // Navigate back or to success screen
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);

      // Handle specific error types
      let errorMessage = "Transaction failed. Please try again.";

      if (error?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for this transaction.";
      } else if (error?.message?.includes("invalid address")) {
        errorMessage = "Invalid recipient address.";
      } else if (error?.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Transaction Failed", errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Get private key from stored seed phrase using Zap SDK
  const getPrivateKey = async (): Promise<string | null> => {
    try {
      if (!mainUserWalletGroup?._id) {
        console.error("No main user wallet group found");
        return null;
      }

      // Get the stored credentials for this wallet group
      const credentials =
        await WalletCredentialsStorage.getCredentialsByUserWalletGroupId(
          mainUserWalletGroup._id
        );

      if (!credentials) {
        console.error(
          "No credentials found for wallet group:",
          mainUserWalletGroup._id
        );
        return null;
      }

      console.log("🔍 Found credentials:", {
        id: credentials.id,
        class: credentials.class,
        hasCredential: !!credentials.credential,
        isCreated: credentials.isCreated,
        userWalletGroupId: credentials.userWalletGroupId,
        derivationIndex: credentials.derivationIndex,
      });

      // Check if the wallet is properly created
      if (!credentials.isCreated) {
        console.error(
          "Wallet not created in SDK yet. Please ensure your wallet is fully set up."
        );
        Alert.alert(
          "Wallet Not Ready",
          "Your wallet is not fully set up yet. Please ensure you have completed the wallet creation process."
        );
        return null;
      }

      // For seed phrase wallets, we need to derive the private key
      if (credentials.class === "SEEDPHRASE" && credentials.credential) {
        try {
          const chainSymbol = selectedToken?.chainSymbol || "ETH";
          const walletId = mainUserWalletGroup._id;

          // Map chain symbols to the keys used in the derived result (same as manage-wallet)
          const chainSymbolMap = {
            ETH: "eth",
            BTC: "btc",
            SOL: "sol",
            TRX: "trx",
            MATIC: "eth", // Polygon uses ETH derivation
            ARB: "eth", // Arbitrum uses ETH derivation
            OP: "eth", // Optimism uses ETH derivation
            BASE: "eth", // Base uses ETH derivation
            AVAX: "eth", // Avalanche uses ETH derivation
            BNB: "eth", // BSC uses ETH derivation
            FTM: "eth", // Fantom uses ETH derivation
            ONE: "eth", // Harmony uses ETH derivation
          };

          const mappedSymbol =
            chainSymbolMap[chainSymbol as keyof typeof chainSymbolMap];
          console.log("🔍 Debug - mappedSymbol:", mappedSymbol);

          if (!mappedSymbol) {
            console.log("🔍 Debug - no mapped symbol for:", chainSymbol);
            return null;
          }

          // Check global cache first using mapped symbol
          if (globalDerivedKeysCache.current[walletId]?.[mappedSymbol]) {
            console.log(
              "✅ Using globally cached private key for",
              chainSymbol
            );
            return globalDerivedKeysCache.current[walletId][mappedSymbol];
          }

          console.log(
            "🔍 Deriving private key for specific chain only:",
            mappedSymbol
          );

          // Use Zap SDK to derive address for specific chain only
          const derivedResult = await zapSDKService.deriveAddress(
            credentials.credential,
            mappedSymbol, // specific chain symbol
            0 // wallet depth (use 0 for main account)
          );

          console.log(
            "🔍 Derived result for",
            mappedSymbol,
            ":",
            derivedResult
          );

          // Get the private key for this specific chain
          const privateKey = derivedResult.privateKey;
          console.log(
            "🔍 Retrieved private key for chain:",
            mappedSymbol,
            !!privateKey
          );

          if (!privateKey) {
            console.error(`Private key not found for chain: ${mappedSymbol}`);
            return null;
          }

          // Cache the specific private key for future use
          if (!globalDerivedKeysCache.current[walletId]) {
            globalDerivedKeysCache.current[walletId] = {};
          }
          globalDerivedKeysCache.current[walletId][mappedSymbol] = privateKey;
          console.log(`✅ Cached private key for ${mappedSymbol} only`);

          return privateKey;
        } catch (error) {
          console.error(
            "Failed to derive private key from seed phrase:",
            error
          );
          return null;
        }
      }

      // For private key wallets, return the credential directly
      if (credentials.class === "PRIVATE_KEY" && credentials.credential) {
        console.log("✅ Using stored private key");
        return credentials.credential;
      }

      console.error(
        "Unsupported wallet class or missing credential:",
        credentials.class
      );
      return null;
    } catch (error) {
      console.error("Failed to retrieve private key:", error);
      return null;
    }
  };

  const handleSelectRecentTransfer = (transfer: any) => {
    setRecipientAddress(transfer.address);
    setShowRecentTransfers(false);
    dismissKeyboard();
  };

  // Enhanced amount handler with $ symbol support
  const handleAmountChange = useCallback(
    (text: string) => {
      // Handle $ symbol for USD mode
      if (inputMode === "dollar") {
        // Remove $ symbol if user types it, or add it if they don't
        const cleanText = text.replace(/[$]/g, "");
        setAmount(cleanText);
      } else {
        // For token mode, just set the amount
        setAmount(text);
      }

      // Clear existing timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Set new timeout for debounced update
      debounceTimeout.current = setTimeout(() => {
        // Handle any debounced logic here if needed
        console.log("Debounced amount:", text);
      }, 300);
    },
    [inputMode]
  );

  // Switch between value and dollar input
  const handleInputModeSwitch = useCallback(() => {
    if (!selectedToken) return;

    const currentAmount = parseFloat(amount || "0");

    if (inputMode === "value") {
      // Switch to dollar mode
      const usdValue = currentAmount * (selectedToken.price || 0);
      setAmount(usdValue.toFixed(2));
      setInputMode("dollar");
    } else {
      // Switch to value mode
      const tokenValue = currentAmount / (selectedToken.price || 1);
      setAmount(tokenValue.toFixed(6));
      setInputMode("value");
    }
  }, [inputMode, amount, selectedToken]);

  // Load recent contacts (placeholder - implement with backend)
  const loadRecentContacts = useCallback(async () => {
    try {
      // TODO: Implement with backend API
      // const contacts = await api.getRecentContacts();
      // setRecentContacts(contacts);
      setRecentContacts([]); // Empty for now
    } catch (error) {
      console.error("Failed to load recent contacts:", error);
      setRecentContacts([]);
    }
  }, []);

  // Calculate network fees when token is selected (for max button)
  useEffect(() => {
    const calculateInitialFees = async () => {
      if (!selectedToken) {
        setNetworkFee(null);
        return;
      }

      try {
        setIsCalculatingFee(true);

        // Determine transaction type
        const chainSymbol = selectedToken.chainSymbol || "ETH";
        const transactionType = determineTransactionType(
          selectedToken,
          chainSymbol
        );

        // Calculate fees with a small amount (0.001) to get base fee
        const feeData = await calculateNetworkFee(
          selectedToken,
          chainSymbol,
          transactionType,
          "0.001"
        );
        setNetworkFee(feeData);

        console.log(
          "✅ Initial network fee calculated for max button:",
          feeData
        );
      } catch (error) {
        console.error("❌ Failed to calculate initial network fee:", error);
        setNetworkFee(null);
      } finally {
        setIsCalculatingFee(false);
      }
    };

    calculateInitialFees();
  }, [selectedToken]);

  // Calculate network fees when amount changes (for real-time updates)
  useEffect(() => {
    const calculateFees = async () => {
      if (!selectedToken || !amount || parseFloat(amount) <= 0) {
        // Don't clear network fee here, keep the initial one for max button
        return;
      }

      try {
        setIsCalculatingFee(true);

        // Determine transaction type
        const chainSymbol = selectedToken.chainSymbol || "ETH";
        const transactionType = determineTransactionType(
          selectedToken,
          chainSymbol
        );

        // Calculate fees
        const feeData = await calculateNetworkFee(
          selectedToken,
          chainSymbol,
          transactionType,
          amount
        );
        setNetworkFee(feeData);

        console.log("✅ Network fee calculated for amount:", feeData);
      } catch (error) {
        console.error("❌ Failed to calculate network fee:", error);
        // Don't clear network fee on error, keep the initial one
      } finally {
        setIsCalculatingFee(false);
      }
    };

    // Debounce fee calculation
    const timeoutId = setTimeout(calculateFees, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedToken, amount]);

  // Validate balance when amount, token, or network fee changes
  useEffect(() => {
    const validateBalanceDebounced = async () => {
      if (!selectedToken || !amount || parseFloat(amount) <= 0) {
        setBalanceValidationError(null);
        return;
      }

      // Clear existing timeout
      if (balanceValidationTimeout.current) {
        clearTimeout(balanceValidationTimeout.current);
      }

      // Debounce balance validation
      balanceValidationTimeout.current = setTimeout(async () => {
        console.log("🔍 Triggering debounced balance validation");
        await validateBalance(amount, selectedToken, networkFee);
      }, 500);
    };

    validateBalanceDebounced();
    return () => {
      if (balanceValidationTimeout.current) {
        clearTimeout(balanceValidationTimeout.current);
      }
    };
  }, [selectedToken, amount, networkFee, validateBalance]);

  // Address validation on change with better debouncing
  const handleAddressChange = useCallback(
    async (text: string) => {
      setRecipientAddress(text);

      // Clear any existing validation error immediately when user types
      if (addressValidationError) {
        setAddressValidationError(null);
      }

      // Clear existing timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Only validate if address is long enough and not empty
      if (text.trim().length >= 10) {
        // Set validating state immediately for better UX
        setIsValidatingAddress(true);

        // Debounce address validation with reasonable delay
        debounceTimeout.current = setTimeout(async () => {
          console.log("🔍 Debounced address validation triggered for:", text);
          await validateAddress(text);
        }, 500); // 500ms is a good balance between responsiveness and performance
      } else if (text.trim().length === 0) {
        // Clear validation state when input is empty
        setAddressValidationError(null);
        setIsValidatingAddress(false);
      }
    },
    [validateAddress, addressValidationError]
  );

  // Show dropdown only if there are recent contacts
  const shouldShowDropdown = useCallback(() => {
    return showRecentTransfers && recentContacts.length > 0;
  }, [showRecentTransfers, recentContacts]);

  // Animation effects for dropdown
  useEffect(() => {
    if (showRecentTransfers) {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showRecentTransfers, dropdownAnimation, dropdownOpacity]);

  // Process portfolio data when it changes
  useEffect(() => {
    if (portfolio) {
      const processPortfolio = async () => {
        try {
          console.log("🔍 SEND TOKEN: Processing portfolio data...");
          const processed = await PortfolioService.processPortfolioData(
            portfolio
          );
          setProcessedPortfolio(processed);
          console.log(
            "🔍 SEND TOKEN: Portfolio processed, enabledAssets:",
            processed.enabledAssets.length
          );
        } catch (error) {
          console.error("Failed to process portfolio data:", error);
        }
      };

      processPortfolio();
    }
  }, [portfolio]);

  // Set token based on tokenId parameter or default token when portfolio loads
  useEffect(() => {
    console.log("🔍 SEND TOKEN DEBUG:");
    console.log("  - tokenId from URL:", tokenId);
    console.log("  - processedPortfolio exists:", !!processedPortfolio);
    console.log(
      "  - processedPortfolio.enabledAssets length:",
      processedPortfolio?.enabledAssets?.length || 0
    );
    console.log("  - current selectedToken:", selectedToken?.symbol || "none");

    // Wait for portfolio to be fully processed
    if (
      processedPortfolio?.enabledAssets &&
      processedPortfolio.enabledAssets.length > 0
    ) {
      console.log(
        "  - Available tokens:",
        processedPortfolio.enabledAssets.map((t) => ({
          id: t.id,
          symbol: t.symbol,
        }))
      );

      if (tokenId && !selectedToken) {
        console.log("  - Looking for token with ID:", tokenId);
        const token = processedPortfolio.enabledAssets.find(
          (token: ProcessedAsset) => token.id === tokenId
        );
        if (token) {
          console.log("  ✅ Found token:", {
            id: token.id,
            symbol: token.symbol,
            name: token.name,
          });
          setSelectedToken(token);
        } else {
          console.log("  ❌ Token not found with ID:", tokenId);
          // Fallback to default token
          const tokenWithBalance = processedPortfolio.enabledAssets.find(
            (token: ProcessedAsset) => token.balance > 0
          );
          setSelectedToken(
            tokenWithBalance || processedPortfolio.enabledAssets[0]
          );
        }
      } else if (!tokenId && !selectedToken) {
        console.log("  - No tokenId parameter, using default token");
        const tokenWithBalance = processedPortfolio.enabledAssets.find(
          (token: ProcessedAsset) => token.balance > 0
        );
        setSelectedToken(
          tokenWithBalance || processedPortfolio.enabledAssets[0]
        );
      }
    } else {
      console.log(
        "  - Portfolio not ready or no enabled assets - waiting for portfolio to load..."
      );
    }
  }, [processedPortfolio, selectedToken, tokenId]);

  // Load recent contacts on mount
  useEffect(() => {
    loadRecentContacts();
  }, [loadRecentContacts]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleScanQRCode = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required to scan QR codes"
        );
        return;
      }
    }
    setShowQRScanner(true);
  };

  const onQRCodeScanned = ({ data }: { data: string }) => {
    setRecipientAddress(data);
    setShowQRScanner(false);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
  };

  const handleWalletSelectorPress = () => {
    setShowWalletSelector(true);
  };

  const handleWalletSelect = (walletGroup: any) => {
    // Handle wallet selection if needed
    setShowWalletSelector(false);
  };

  const handleManageWallets = () => {
    setShowWalletSelector(false);
    router.push("/dashboard/manage-wallet");
  };

  const handleAddWallet = () => {
    setShowWalletSelector(false);
    // TODO: Navigate to add wallet flow
  };

  const handleMaxAmount = () => {
    if (selectedToken) {
      const tokenBalance = selectedToken.balance || 0;

      // For native tokens, we need to reserve some balance for gas fees
      const isNativeToken =
        !selectedToken.tokenAddress ||
        selectedToken.tokenAddress === "" ||
        selectedToken.tokenAddress ===
          "0x0000000000000000000000000000000000000000";

      if (isNativeToken && networkFee) {
        // Reserve gas fee from the balance with a small buffer (5% of fee as safety margin)
        const feeValue = parseFloat(networkFee.fee || "0");
        const safetyBuffer = feeValue * 0.05; // 5% buffer
        const totalReserve = feeValue + safetyBuffer;
        const maxAmount = Math.max(0, tokenBalance - totalReserve);

        // Round to 6 decimal places to avoid precision issues
        const roundedAmount = Math.floor(maxAmount * 1000000) / 1000000;
        setAmount(roundedAmount.toString());

        console.log("🔍 Max amount for native token:", {
          tokenBalance,
          feeValue,
          safetyBuffer,
          totalReserve,
          maxAmount: roundedAmount,
        });
      } else {
        // For tokens, use full balance (gas is paid in native token)
        const roundedAmount = Math.floor(tokenBalance * 1000000) / 1000000;
        setAmount(roundedAmount.toString());
        console.log("🔍 Max amount for token:", {
          tokenBalance,
          roundedAmount,
        });
      }
    }
  };

  const calculateUSDValue = () => {
    if (!amount || !selectedToken) return "$0.00";
    const usdValue = parseFloat(amount) * (selectedToken.price || 0);
    return `$${usdValue.toFixed(2)}`;
  };

  // Real-time balance validation when amount changes
  useEffect(() => {
    if (balanceValidationTimeout.current) {
      clearTimeout(balanceValidationTimeout.current);
    }

    if (amount && selectedToken && networkFee) {
      balanceValidationTimeout.current = setTimeout(() => {
        const amountValue = parseFloat(amount);
        const tokenBalance = selectedToken.balance || 0;

        // For native tokens, we need to account for gas fees
        const isNativeToken =
          !selectedToken.tokenAddress ||
          selectedToken.tokenAddress === "" ||
          selectedToken.tokenAddress ===
            "0x0000000000000000000000000000000000000000";

        let totalRequired = amountValue;

        if (isNativeToken && networkFee) {
          // For native tokens, add gas fee to the amount
          const feeValue = parseFloat(networkFee.fee || "0");
          totalRequired = amountValue + feeValue;
        }

        if (totalRequired > tokenBalance) {
          const shortfall = totalRequired - tokenBalance;
          const errorMessage = isNativeToken
            ? `Insufficient balance. You need ${shortfall.toFixed(6)} more ${
                selectedToken.symbol
              } (including gas fees).`
            : `Insufficient balance. You need ${shortfall.toFixed(6)} more ${
                selectedToken.symbol
              }.`;
          setBalanceValidationError(errorMessage);
        } else {
          setBalanceValidationError(null);
        }
      }, 500); // Debounce validation by 500ms
    } else {
      setBalanceValidationError(null);
    }

    return () => {
      if (balanceValidationTimeout.current) {
        clearTimeout(balanceValidationTimeout.current);
      }
    };
  }, [amount, selectedToken, networkFee]);

  const isContinueDisabled =
    !amount ||
    !recipientAddress ||
    !selectedToken ||
    isValidatingAddress ||
    isValidatingBalance ||
    !!addressValidationError ||
    !!balanceValidationError;

  // Debug logging for Continue button state
  console.log("🔍 Continue button state:", {
    hasAmount: !!amount,
    hasRecipientAddress: !!recipientAddress,
    hasSelectedToken: !!selectedToken,
    isValidatingAddress,
    isValidatingBalance,
    hasAddressValidationError: !!addressValidationError,
    hasBalanceValidationError: !!balanceValidationError,
    isContinueDisabled,
  });

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
    <PageWrapper>
          <Box
            flex={1}
            backgroundColor="mainBackgroundColor"
            paddingHorizontal="m"
          >
            {/* Header */}
        <AppBar
          height={30}
          paddingHorizontal={0}
          leading={
            <ChevronLeft
              size={25}
              color={theme.colors.bodyTextColor}
              onPress={() => router.back()}
            />
          }
          title={
            <Pressable
                  onPress={handleWalletSelectorPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "auto",
              }}
            >
              <Box
                width={20}
                height={20}
                borderRadius={2}
                bg="secondaryBackgroundColor"
              >
                <Image
                  source={require("@/assets/images/rect2.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                  }}
                />
              </Box>
              <CustomText variant="body" fontSize={14} marginHorizontal="m">
                    {mainUserWalletGroup?.name || "Dangerman"}
              </CustomText>
              <ChevronDown size={20} color={theme.colors.bodyTextColor} />
            </Pressable>
          }
        />

            {/* Recipient Section */}
            <Box marginTop="l" position="relative">
              <Box
                flexDirection="row"
                alignItems="center"
                backgroundColor="secondaryBackgroundColor"
                borderRadius={12}
                paddingHorizontal="m"
                paddingVertical="m"
              >
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="headerTextColor"
                  marginRight="s"
                >
                  To:
            </CustomText>
                <TextInput
                  value={recipientAddress}
                  onChangeText={handleAddressChange}
                  placeholder="Enter address or Zap username"
                  placeholderTextColor={theme.colors.disabledTextColor}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: theme.colors.headerTextColor,
                    fontFamily: "NewScience_Regular",
                  }}
                  onFocus={() => {
                    if (recentContacts.length > 0) {
                      setShowRecentTransfers(true);
                    }
                  }}
                  onBlur={() => {
                    // Small delay to allow for recent transfer selection
                    setTimeout(() => {
                      if (!showRecentTransfers) {
                        dismissKeyboard();
                      }
                    }, 100);
                  }}
                />

                <Pressable
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                    marginLeft: 8,
                  })}
                  onPress={handlePasteAddress}
                >
                  <CustomText variant="body" fontSize={14} color="white">
              Paste
            </CustomText>
                </Pressable>
              </Box>

              {/* Address Validation States */}
              {isValidatingAddress && (
                <Box
                  marginTop="s"
                  paddingHorizontal="m"
                  flexDirection="row"
                  alignItems="center"
                >
                  <Box
                    width={12}
                    height={12}
                    borderRadius={6}
                    backgroundColor="secondaryColor"
                    marginRight="s"
                  />
                  <CustomText
                    variant="body"
                    fontSize={12}
                    color="disabledTextColor"
                  >
                    Validating address...
                  </CustomText>
                </Box>
              )}

              {/* Address Validation Error */}
              {addressValidationError && (
                <Box
                  marginTop="s"
                  paddingHorizontal="m"
                  flexDirection="row"
                  alignItems="center"
                >
                  <Box
                    width={12}
                    height={12}
                    borderRadius={6}
                    backgroundColor="error"
                    marginRight="s"
                  />
                  <CustomText variant="body" fontSize={12} color="error">
                    {addressValidationError}
                  </CustomText>
                </Box>
              )}

              {/* Address Validation Success */}
              {recipientAddress &&
                !addressValidationError &&
                !isValidatingAddress &&
                recipientAddress.length >= 10 && (
                  <Box
                    marginTop="s"
                    paddingHorizontal="m"
                    flexDirection="row"
                    alignItems="center"
                  >
                    <Box
                      width={12}
                      height={12}
                      borderRadius={6}
                      backgroundColor="secondaryColor"
                      marginRight="s"
                    />
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="secondaryColor"
                    >
                      Valid address
                    </CustomText>
                  </Box>
                )}

              {/* Balance Validation Error */}
              {balanceValidationError && (
                <Box
                  marginTop="s"
                  paddingHorizontal="m"
                  flexDirection="row"
                  alignItems="center"
                >
                  <Box
                    width={12}
                    height={12}
                    borderRadius={6}
                    backgroundColor="error"
                    marginRight="s"
                  />
                  <CustomText variant="body" fontSize={12} color="error">
                    {balanceValidationError}
                  </CustomText>
                </Box>
              )}

              {/* Recent Transfers Dropdown */}
              {shouldShowDropdown() && (
                <>
                  {/* Backdrop */}
                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999,
                      opacity: dropdownOpacity,
                    }}
                  >
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => {
                        setShowRecentTransfers(false);
                        dismissKeyboard();
                      }}
                    />
                  </Animated.View>

                  <Animated.View
                    style={{
                      position: "absolute",
                      top: 60,
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      opacity: dropdownOpacity,
                      transform: [
                        {
                          translateY: dropdownAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                        {
                          scaleY: dropdownAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    }}
                  >
                    <Box
                      backgroundColor="secondaryBackgroundColor"
                      borderRadius={12}
                      maxHeight={200}
                      elevation={8}
                      shadowColor="black"
                      shadowOffset={{ width: 0, height: 4 }}
                      shadowOpacity={0.3}
                      shadowRadius={8}
                      marginTop="s"
                    >
                      <Box paddingHorizontal="m" paddingVertical="s">
                        <CustomText
                          variant="body"
                          fontSize={14}
                          color="disabledTextColor"
                        >
                          Recent contacts
                        </CustomText>
                      </Box>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={dismissKeyboard}
                      >
                        {recentTransfers.map((transfer, index) => (
                          <Pressable
                            key={index}
                            onPress={() => handleSelectRecentTransfer(transfer)}
                            style={({ pressed }) => ({
                              opacity: pressed ? 0.7 : 1,
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              borderBottomWidth:
                                index < recentTransfers.length - 1 ? 1 : 0,
                              borderBottomColor:
                                theme.colors.mainBackgroundColor,
                            })}
                          >
                            <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
                            >
                              <Box
                                flexDirection="row"
                                alignItems="center"
                                flex={1}
                              >
                                <Box
                                  width={32}
                                  height={32}
                                  borderRadius={16}
                                  backgroundColor="mainBackgroundColor"
                                  marginRight="m"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Box
                                    width={20}
                                    height={20}
                                    borderRadius={10}
                                    backgroundColor="secondaryBackgroundColor"
                                  />
                                </Box>
                                <Box flex={1}>
                                  <CustomText
                                    variant="body"
                                    fontSize={16}
                                    color="headerTextColor"
                                    fontWeight="500"
                                  >
                                    {transfer.name}
                                  </CustomText>
                                </Box>
                              </Box>
                              {transfer.hasLabel && (
                                <Box
                                  backgroundColor="mainBackgroundColor"
                                  paddingHorizontal="s"
                                  paddingVertical="s"
                                  borderRadius={12}
                                >
                                  <CustomText
                                    variant="body"
                                    fontSize={12}
                                    color="disabledTextColor"
                                  >
                                    {transfer.address}
                                  </CustomText>
                                </Box>
                              )}
                            </Box>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </Box>
                  </Animated.View>
                </>
              )}

              {/* Scan QR Code and Address Book */}
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                marginVertical="m"
              >
                <Pressable
                  onPress={handleScanQRCode}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
            <ThemedScanIcon
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
                  <CustomText
                    variant="body"
                    fontSize={12}
                    marginLeft="s"
                    color="bodyTextColor"
                  >
              Scan QR Code
            </CustomText>
          </Pressable>
                <Pressable
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
            <ThemedBookIcon
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
                  <CustomText
                    variant="body"
                    fontSize={12}
                    marginLeft="s"
                    color="bodyTextColor"
                  >
              Address Book
            </CustomText>
          </Pressable>
              </Box>
        </Box>

            {/* Amount Section */}
            <Box marginTop="l">
              <Box
                backgroundColor="secondaryBackgroundColor"
                borderRadius={12}
                padding="m"
              >
                <Box
                  flexDirection="row"
                  mb="s"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <TextInput
                    value={inputMode === "dollar" ? `$${amount}` : amount}
                    onChangeText={handleAmountChange}
                    placeholder={inputMode === "dollar" ? "$0" : "0"}
                    placeholderTextColor={theme.colors.bodyTextColor}
                    keyboardType="numeric"
                    style={{
                      fontSize: 32,
                      color: theme.colors.headerTextColor,
                      fontFamily: "NewScience_SemiBold",
                      height: 50,
                      flex: 1,
                      paddingHorizontal: 0,
                      marginRight: 5,
                    }}
                  />
                  <Pressable
                    onPress={() => {
                      sendTokenRef.current?.snapToIndex(1);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.mainBackgroundColor,
                      paddingHorizontal: 12,
                      height: 35,
                      borderRadius: 20,
                      width: 100,
                    }}
                  >
                    {selectedToken?.image ? (
                      <SvgUri
                        uri={selectedToken.image}
                        width={20}
                        height={20}
                        style={{ marginRight: 8, borderWidth: 0 }}
                      />
                    ) : (
                      <Box
                        width={20}
                        height={20}
                        borderRadius={10}
                        backgroundColor="secondaryBackgroundColor"
                        marginRight="s"
                      />
                    )}
                    <CustomText
                      variant="body"
                      fontSize={14}
                      color="bodyTextColor"
                    >
                      {selectedToken?.symbol || "AVAX"}
                    </CustomText>
                    <ChevronDown
                      size={16}
                      color={theme.colors.bodyTextColor}
                      style={{ marginLeft: 4 }}
                    />
                  </Pressable>
      </Box>
      <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box flexDirection="row" alignItems="center" marginTop="s">
                    <Pressable
                      onPress={handleInputModeSwitch}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: theme.colors.secondaryBackgroundColor,
                      }}
                    >
                      <Image
                        source={require("@/assets/images/updownarrow.png")}
                        style={{ width: 16, height: 16 }}
                        contentFit="contain"
                      />
                    </Pressable>
                    <CustomText
                      variant="body"
                      color="disabledTextColor"
                      marginLeft="s"
                    >
                      {inputMode === "value"
                        ? calculateUSDValue()
                        : `${amount} ${selectedToken?.symbol || ""}`}
                    </CustomText>
                  </Box>
                  <Box flexDirection="row" alignItems="center" marginTop="s">
                    <CustomText
                      variant="body"
                      color="disabledTextColor"
                      fontSize={12}
                      marginRight="s"
                    >
                      Bal:{" "}
                      {selectedToken
                        ? `${formatNumber(selectedToken.balance || 0, 9)} ${
                            selectedToken.symbol
                          }`
                        : "0 AVAX"}
                    </CustomText>
                    <Pressable
                      onPress={handleMaxAmount}
                      style={{
                        backgroundColor: theme.colors.bodyTextColor,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <CustomText variant="body" fontSize={12} color="black">
                        Max
                      </CustomText>
                    </Pressable>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Network Fee Section */}
            <Box
              borderRadius={12}
              marginTop="l"
              borderWidth={1}
              borderColor="borderColor"
              padding="m"
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box flexDirection="row" alignItems="center">
                  <CustomText
                    variant="body"
                    fontSize={14}
                    color="placeholderTextColor"
                  >
                    Network Fee
                  </CustomText>
                  <Pressable
                    onPress={() => networkFeeRef.current?.snapToIndex(0)}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: theme.colors.mainBackgroundColor,
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 8,
                    }}
                  >
                    <HelpCircle width={18} height={18} color="white" />
                  </Pressable>
                </Box>
                <Box flexDirection="row" alignItems="center">
                  <CustomText
                    variant="body"
                    fontSize={14}
                    color="secondaryColor"
                  >
                    {isCalculatingFee
                      ? "Calculating..."
                      : networkFee?.speed || "Standard"}
                    &nbsp;
                  </CustomText>
                  <CustomText variant="body" fontSize={14} color="white">
                    •{" "}
                    {isCalculatingFee ? "..." : networkFee?.feeInUSD || "$0.00"}
                  </CustomText>
                  <Pressable
                    style={{
                      marginLeft: 8,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      width={18}
                      height={18}
                      borderRadius={12}
                      backgroundColor="mainBackgroundColor"
                      alignItems="center"
                      justifyContent="center"
                      marginRight="s"
                    >
                      {selectedToken?.image ? (
                        <SvgUri
                          uri={selectedToken.image}
                          width={18}
                          height={18}
                        />
                      ) : (
                        <Box
                          width={20}
                          height={20}
                          borderRadius={10}
                          backgroundColor="secondaryBackgroundColor"
                        />
                      )}
                    </Box>
                    <ChevronRight width={18} height={18} color="white" />
                  </Pressable>
                </Box>
              </Box>
              <Box height={15} />
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                marginTop="s"
              >
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="placeholderTextColor"
                >
                  Total
                </CustomText>
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="headerTextColor"
                >
                  {(() => {
                    if (!selectedToken || !amount || parseFloat(amount) <= 0)
                      return "$0.00";

                    const amountValue = parseFloat(amount);
                    const usdValue = amountValue * (selectedToken.price || 0);
                    const feeValue = networkFee
                      ? parseFloat(networkFee.feeInUSD.replace("$", ""))
                      : 0;
                    const total = usdValue + feeValue;

                    return `$${total.toFixed(2)}`;
                  })()}
                </CustomText>
              </Box>
            </Box>
          </Box>

          {/* Continue Button */}
          <Box
            width="100%"
        height={60}
        justifyContent="center"
        paddingHorizontal="m"
            backgroundColor="mainBackgroundColor"
            style={{ paddingBottom: insets.bottom + 30 }}
      >
        <CustomButton
              text={
                isSending
                  ? "Sending..."
                  : isValidatingAddress
                  ? "Validating..."
                  : isValidatingBalance
                  ? "Checking Balance..."
                  : addressValidationError
                  ? "Invalid Address"
                  : balanceValidationError
                  ? "Insufficient Balance"
                  : "Continue"
              }
              onPress={handleSendTransaction}
              width="100%"
          borderRadius={50}
              disabled={isContinueDisabled || isSending}
          disabledColor={theme.colors.disabledTextColor}
        />
      </Box>

          {/* Debug Emergency Stop Button (Development Only) */}
          {__DEV__ && (
            <Box
              width="100%"
              paddingHorizontal="m"
              marginBottom="s"
            >
              <CustomButton
                text="🚨 Emergency Stop SDK"
                onPress={emergencyStopSDK}
                width="100%"
                borderRadius={50}
                backgroundColor="disabledTextColor"
                marginBottom="s"
              />
              <CustomButton
                text="📊 Check Retry Loop Status"
                onPress={checkRetryLoopStatus}
                width="100%"
                borderRadius={50}
                backgroundColor="secondaryColor"
              />
            </Box>
          )}

          {/* Select Token Bottom Sheet */}
          <TokenSelectorBottomSheet
            ref={sendTokenRef}
            mode="send"
            onTokenSelect={(token) => {
              console.log("🔄 SEND TOKEN: Token selected from send page:", {
                id: token.id,
                symbol: token.symbol,
                name: token.name,
              });
              setSelectedToken(token);
            }}
          />

          {/* QR Scanner Modal */}
          {showQRScanner && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundColor="black"
              zIndex={1000}
            >
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                onBarcodeScanned={onQRCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />

              {/* Overlay UI positioned absolutely with safe area */}
              <Box
                position="absolute"
                top={insets.top}
                left={0}
                right={0}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal="l"
                paddingVertical="l"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <Pressable
                  onPress={closeQRScanner}
                  style={({ pressed }) => ({
                    padding: 12,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 20,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <ChevronLeft size={24} color="white" />
                </Pressable>
                <CustomText variant="medium" fontSize={18} color="white">
                  Scan QR Code
                </CustomText>
                <Box width={48} />
              </Box>

              <Box
                position="absolute"
                bottom={insets.bottom}
                left={0}
                right={0}
                paddingHorizontal="l"
                paddingVertical="l"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="white"
                  textAlign="center"
                >
                  Position the QR code within the frame to scan
                </CustomText>
              </Box>
            </Box>
          )}

          {/* Bottom Sheets */}
      <WhatIsNetworkFeeBottomsheet ref={networkFeeRef} />
          {selectedToken && (
      <ConfirmSend
        ref={confirmSendRef}
              send={handleConfirmSend}
              selectedToken={selectedToken}
              recipientAddress={recipientAddress}
              amount={amount}
              usdValue={parseFloat(amount) * (selectedToken.price || 0)}
              networkFee={networkFee}
              onClose={() => confirmSendRef.current?.close()}
              onTransactionComplete={() => {
                // This will be called when transaction completes
                console.log("Transaction completed, resetting loading state");
              }}
            />
          )}
      <SendSuccessModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          saveAddressRef.current?.snapToIndex(1);
        }}
      />
      <SaveAddress
        ref={saveAddressRef}
        save={() => saveAddressRef.current?.close()}
      />

          {/* Wallet Selector Bottom Sheet */}
          <WalletSelectorBottomSheet
            visible={showWalletSelector}
            onClose={() => setShowWalletSelector(false)}
            onWalletSelect={handleWalletSelect}
            onManagePress={handleManageWallets}
            onAddWalletPress={handleAddWallet}
            selectedWalletGroupId={mainUserWalletGroup?._id}
      />
    </PageWrapper>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default SendToken;
