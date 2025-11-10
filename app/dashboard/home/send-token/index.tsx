import {
  ThemedBookIcon,
  ThemedScanIcon,
} from "@/assets/svg/wallet-icons-components";
import ConfirmSend from "@/components/bottomsheets/send/ConfirmSend";
import SaveAddress from "@/components/bottomsheets/send/SaveAddress";
import SendSuccessModal from "@/components/bottomsheets/send/SendSuccessModal";
import WhatIsNetworkFeeBottomsheet from "@/components/bottomsheets/send/WhatIsNetworkFeeBottomSheet";
import TokenSelectorBottomSheet from "@/components/bottomsheets/TokenSelectorBottomSheet";
import WalletSelectorHeader from "@/components/dashboard/WalletSelectorHeader";
import {
  AppBar,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import Box from "@/components/general/Box";
import CryptoIcon from "@/components/general/CrptoIcon";
import ErrorModal, { ErrorModalProps } from "@/components/general/ErrorModal";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { useChains } from "@/src/core/chains/chains-context";
import { default as zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { formatNumber } from "@/src/core/utils/format-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { AppRootState } from "@/state";
import {
  selectAssetBySupportedCurrencyId,
  selectProcessedPortfolio,
} from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import { createErrorModalProps } from "@/utils/error-handler";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import {
  ICurrency,
  ISupportedCurrency,
  SendTransactionRequest,
} from "@zap/blockchain-sdk";
import { ethers } from "ethers";
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
import { useSelector } from "react-redux";

// Unified transaction parameter interface (for reference)
// interface UnifiedTransactionParams {
//   fromAddress: string;
//   toAddress: string;
//   amount: number;
//   privateKey: string;
//   chain: string; // Unified chain identifier
//   tokenAddress?: string; // For ERC20/TRC20 tokens
//   tokenMintAddress?: string; // For SPL tokens
//   rpcUrl?: string; // Custom RPC endpoint
//   utxos?: { // For Bitcoin transactions
//     txid: string;
//     vout: number;
//     value: number;
//   }[];
//   tokenDecimals?: number;
// }

enum FeeSpeed {
  Standard = "Standard",
  Fast = "Fast",
  Instant = "Instant",
}

const SendToken = () => {
  const { tokenId: rawTokenId } = useLocalSearchParams();

  // Handle different tokenId formats (same as other pages)
  let tokenId: string;
  if (Array.isArray(rawTokenId)) {
    tokenId = rawTokenId[0];
  } else if (typeof rawTokenId === "object" && rawTokenId !== null) {
    tokenId =
      (rawTokenId as any)?._id ||
      (rawTokenId as any)?.id ||
      JSON.stringify(rawTokenId);
  } else {
    tokenId = rawTokenId || "";
  }

  // Ensure tokenId is a string
  tokenId = String(tokenId);
  const [amount, setAmount] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<ProcessedAsset | null>(
    null
  );
  const [isManuallySelected, setIsManuallySelected] = useState(false);
  // Use processed portfolio from Redux instead of local state
  const processedPortfolio = useSelector(selectProcessedPortfolio);

  // Also try to get token using Redux selector
  const reduxToken = useSelector((state: AppRootState) =>
    selectAssetBySupportedCurrencyId(state, tokenId)
  );
  const [showRecentTransfers, setShowRecentTransfers] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidationError, setAddressValidationError] = useState<
    string | null
  >(null);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [inputMode, setInputMode] = useState<"value" | "dollar">("value");
  const [networkFee, setNetworkFee] = useState<{
    fee: number;
    feeInUSD: number;
    speed: FeeSpeed;
    gasPrice?: number;
    gasLimit?: number;
    feeRate?: number;
  } | null>({
    fee: 0,
    feeInUSD: 0,
    speed: FeeSpeed.Standard,
    gasPrice: 0,
    gasLimit: 0,
    feeRate: 0,
  });
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [balanceValidationError, setBalanceValidationError] = useState<
    string | null
  >(null);
  const [isValidatingBalance, setIsValidatingBalance] = useState(false);

  const { chainsMap } = useChains();

  // Error modal state
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    props: Partial<ErrorModalProps>;
  }>({
    visible: false,
    props: {},
  });

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
  const { mainUserWalletGroup, portfolio, getPrivateKey, getAddress } =
    useWallet();
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
      handleAddressChange(clipboardText);
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

        if (validationResult.isValid) {
          console.log("✅ Address validation passed");
          setAddressValidationError(null);
          return true;
        }
        const errorMessage =
          validationResult.error ||
          "Invalid address format for this blockchain";
        setAddressValidationError(errorMessage);
        console.log("❌ Address validation failed:", errorMessage);
        return false;
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
        const feeValue = networkFee.fee;
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

  // Error handling functions
  const showErrorModal = (error: any, context: Record<string, any> = {}) => {
    const errorProps = createErrorModalProps(error, context);
    setErrorModal({
      visible: true,
      props: {
        ...errorProps,
        onClose: hideErrorModal,
        onRetry: handleRetryTransaction,
        onSupport: handleContactSupport,
        primaryAction: errorProps.primaryAction
          ? {
              ...errorProps.primaryAction,
              onPress: () => {
                hideErrorModal();
                handleErrorAction(
                  errorProps
                    .primaryAction!.text.toLowerCase()
                    .replace(/\s+/g, "_")
                );
              },
            }
          : undefined,
        secondaryAction: errorProps.secondaryAction
          ? {
              ...errorProps.secondaryAction,
              onPress: () => {
                hideErrorModal();
                handleErrorAction(
                  errorProps
                    .secondaryAction!.text.toLowerCase()
                    .replace(/\s+/g, "_")
                );
              },
            }
          : undefined,
      },
    });
  };

  const hideErrorModal = () => {
    setErrorModal({
      visible: false,
      props: {},
    });
  };

  const handleErrorAction = (actionType: string) => {
    switch (actionType) {
      case "check_balance":
        // Navigate to portfolio or refresh balance
        console.log("🔍 User wants to check balance");
        break;
      case "select_different_token":
        // Open token selector
        sendTokenRef.current?.snapToIndex(1);
        break;
      case "review_details":
        // Focus on input fields
        console.log("🔍 User wants to review transaction details");
        break;
      case "check_wallet":
        // Navigate to wallet settings
        router.push("/dashboard/manage-wallet");
        break;
      default:
        console.log("🔍 Unknown error action:", actionType);
    }
  };

  const handleRetryTransaction = () => {
    hideErrorModal();
    // Retry the transaction
    handleConfirmSend();
  };

  const handleContactSupport = () => {
    hideErrorModal();
    // Navigate to support or open support modal
    console.log("🔍 User wants to contact support");
    // You can implement support navigation here
  };

  const handleSendTransaction = async () => {
    console.log("🚀 handleSendTransaction called");

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

  const handleConfirmSend = async () => {
    console.log("🚀 handleConfirmSend called");

    const validation = validateInputs();
    console.log("🔍 Validation result:", validation);

    if (!validation.isValid) {
      console.log("❌ Validation failed:", validation.errors);
      showErrorModal(new Error(validation.errors.join(", ")), {
        errorCode: "VALIDATION_ERROR",
        amount,
        tokenSymbol: selectedToken?.symbol,
        recipientAddress,
      });
      return;
    }

    console.log("✅ Validation passed, proceeding with transaction");

    try {
      setIsSending(true);

      // Get the wallet's private key
      console.log("🔍 Getting private key...");
      const privateKey = await getPrivateKey(
        selectedToken?.chainSymbol || "ETH"
      );
      console.log("🔍 Private key retrieved:", !!privateKey);

      if (!privateKey) {
        console.log("❌ Private key not found");
        showErrorModal(
          new Error("Private key not found. Please unlock your wallet."),
          {
            errorCode: "WALLET_ERROR",
            tokenSymbol: selectedToken?.symbol,
          }
        );
        return;
      }

      console.log("✅ Private key found, proceeding with transaction");

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
        throw new Error("Chain symbol is empty/unknown");
      }

      console.log("🔍 Final chainSymbol determined:", chainSymbol);

      // Ensure uppercase format as SDK expects uppercase chain symbols
      chainSymbol = chainSymbol.toUpperCase();

      const chain = chainsMap.get(selectedToken?.chainId || "");

      // Prepare base transaction parameters
      let baseParams: SendTransactionRequest = {
        fromAddress: (await getAddress(chainSymbol)) || "",
        toAddress: recipientAddress,
        amount: parseFloat(amount),
        privateKey,
        tokenDecimals: selectedToken!.decimals,
        chainSymbol: chainSymbol,
      };

      if ((chain as any).isEVM) {
        baseParams = {
          ...baseParams,
          tokenAddress: selectedToken!.tokenAddress || undefined,
        };
      } else if (chain?.symbol === "SOL") {
        baseParams = {
          ...baseParams,
          tokenMintAddress: selectedToken!.tokenAddress || undefined,
        };
      } else if (chain?.symbol === "BTC") {
        baseParams = {
          ...baseParams,
        };
      } else if (chain?.symbol === "TRX") {
        baseParams = {
          ...baseParams,
          tokenAddress: selectedToken!.tokenAddress || undefined,
        };
      }

      if (!baseParams.chainSymbol || baseParams.chainSymbol === "") {
        throw new Error("Invalid chain configuration. Please try again.");
      }

      // Send the transaction using the SDK
      console.log("🚀 Calling SDK sendTransaction...");
      let result: string | null = null;
      try {
        result = await zapSDKService.sendTransaction(baseParams);
        console.log("✅ Transaction sent successfully:", result);

        // Navigate to success screen
        router.push({
          pathname: "/dashboard/home/send-token/success",
          params: {
            txHash: result,
            amount: amount,
            tokenSymbol: selectedToken?.symbol || "ETH",
            recipientAddress: recipientAddress,
            networkFee: networkFee?.fee || "0",
            networkName: selectedToken?.chainName || "Ethereum",
          },
        });
        return;
      } catch (error: any) {
        console.error("❌ Transaction failed:", error);
        console.error("❌ Error details:", {
          message: error?.message,
          code: error?.code,
          chain: baseParams.chainSymbol,
          fullError: JSON.stringify(error, null, 2),
        });

        // Show error modal with context
        showErrorModal(error, {
          chain: baseParams.chainSymbol,
          amount,
          tokenSymbol: selectedToken?.symbol,
          recipientAddress,
          errorCode: error?.code,
        });
        return;
      }
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);

      // Show error modal with context
      showErrorModal(error, {
        amount,
        tokenSymbol: selectedToken?.symbol,
        recipientAddress,
        errorCode: error?.code,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectRecentTransfer = (transfer: any) => {
    handleAddressChange(transfer.address);
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

  // Calculate network fees when amount changes (for real-time updates)
  useEffect(() => {
    const calculateFees = async () => {
      if (!selectedToken) {
        // Don't clear network fee here, keep the initial one for max button
        return;
      }

      try {
        setIsCalculatingFee(true);

        // Determine transaction type
        const chainSymbol = selectedToken.chainSymbol || "ETH";
        const address =
          (await getAddress(chainSymbol, mainUserWalletGroup?._id)) || "";

        console.log("🔍 Address:", address);
        console.log(amount);
        // Calculate fees
        const gasEstimate = await zapSDKService.estimateTransactionCost(
          address,
          parseFloat(amount) || 0.00001,
          address,
          chainSymbol,
          {
            tokenContractAddress: selectedToken?.tokenAddress || "",
            tokenAddress: selectedToken?.tokenAddress || "",
            tokenMintAddress: selectedToken?.tokenAddress || "",
            memo: "",
            feeRate: null,
          }
        );

        console.log("🔍 Gas estimate:", gasEstimate);
        const chainToUse = chainsMap.get(selectedToken.chainId);

        if (!chainToUse) {
          throw new Error("Chain not found");
        }
        let feeData = {
          fee: 0,
          feeInUSD: 0,
          speed: FeeSpeed.Standard,
          gasPrice: 0,
          gasLimit: 0,
          feeRate: 0,
        };

        const price = await processedPortfolio?.assets.find(
          (asset: ProcessedAsset) => {
            return (
              asset.symbol.toUpperCase() ===
                (
                  chainToUse?.nativeCurrencyId as ICurrency
                )?.symbol.toUpperCase() &&
              asset.chainSymbol.toUpperCase() ===
                chainToUse?.symbol.toUpperCase()
            );
          }
        )?.price;

        if (chainToUse?.isEVM) {
          feeData.fee = parseFloat(
            ethers.formatEther(
              BigInt(gasEstimate.gasPrice * gasEstimate.gasLimit)
            )
          );

          feeData.feeInUSD = feeData.fee * (price || 0);
          feeData.gasPrice = gasEstimate.gasPrice;
          feeData.gasLimit = gasEstimate.gasLimit;
        } else if (chainToUse?.symbol === "SOL") {
          feeData.fee = gasEstimate.estimatedCost;
          feeData.feeInUSD = feeData.fee * (price || 0);
        } else if (chainToUse?.symbol === "BTC") {
          feeData.fee = feeData.fee * (price || 0);
          console.log(price, "price");
          feeData.feeInUSD = feeData.fee * (price || 0);
        } else if (chainToUse?.symbol === "TRX") {
          feeData.fee = gasEstimate.estimatedCost;
          feeData.feeInUSD = feeData.fee * (price || 0);
        }

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
    calculateFees();
  }, [selectedToken, mainUserWalletGroup?._id]);

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
      // Clear any existing validation error immediately when user types
      if (addressValidationError) {
        setAddressValidationError(null);
      }

      setRecipientAddress(text);

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

  // Portfolio processing is now handled centrally in home.tsx
  // This component uses the processed data from Redux instead

  // Set token based on tokenId parameter or default token when portfolio loads
  useEffect(() => {
    // Wait for portfolio to be fully processed
    if (
      processedPortfolio?.enabledAssets &&
      processedPortfolio.enabledAssets.length > 0
    ) {
      // Don't override manual token selection
      if (isManuallySelected) {
        return;
      }
      if (tokenId) {
        const token = processedPortfolio.enabledAssets.find(
          (token: ProcessedAsset) => {
            // Try multiple matching strategies (same as token details page)
            const matchesId = token.id === tokenId;
            const matchesSupportedId =
              (token.supportedCurrencyId as ISupportedCurrency)?._id ===
              tokenId;
            const matchesSupportedIdString =
              (
                token.supportedCurrencyId as ISupportedCurrency
              )?._id?.toString() === tokenId;
            const matchesIdString = token.id?.toString() === tokenId;

            // Check if supportedCurrencyId is a string that matches
            const matchesSupportedIdDirect =
              token.supportedCurrencyId === tokenId;

            // Check if supportedCurrencyId is an object with _id that matches
            const matchesSupportedIdObject =
              typeof token.supportedCurrencyId === "object" &&
              token.supportedCurrencyId?._id === tokenId;

            // NEW: Check if tokenId matches the userPortfolio ID (which might be stored differently)
            // This handles the case where tokenId is a userPortfolio ID that should match supportedCurrencyId
            const matchesUserPortfolioId =
              token.supportedCurrencyId === tokenId ||
              (typeof token.supportedCurrencyId === "object" &&
                token.supportedCurrencyId?._id === tokenId);

            // Additional fallback: Check if tokenId matches any string field in the token
            const matchesAnyStringField = Object.values(token).some(
              (value) => typeof value === "string" && value === tokenId
            );

            const found =
              matchesId ||
              matchesSupportedId ||
              matchesSupportedIdString ||
              matchesIdString ||
              matchesSupportedIdDirect ||
              matchesSupportedIdObject ||
              matchesUserPortfolioId ||
              matchesAnyStringField;

            if (found) {
              // Match found
            }

            return found;
          }
        );
        if (token) {
          setSelectedToken(token);
        } else {
          // Try using Redux selector as fallback
          if (reduxToken) {
            setSelectedToken(reduxToken);
          } else {
            // Fallback to default token - prefer ETH if available, otherwise first token with balance
            const ethToken = processedPortfolio.enabledAssets.find(
              (token: ProcessedAsset) =>
                token.symbol === "ETH" && token.balance > 0
            );
            const tokenWithBalance = processedPortfolio.enabledAssets.find(
              (token: ProcessedAsset) => token.balance > 0
            );
            const fallbackToken =
              ethToken ||
              tokenWithBalance ||
              processedPortfolio.enabledAssets[0];
            setSelectedToken(fallbackToken);
          }
        }
      } else if (!selectedToken) {
        // Prefer ETH if available, otherwise first token with balance
        const ethToken = processedPortfolio.enabledAssets.find(
          (token: ProcessedAsset) => token.symbol === "ETH" && token.balance > 0
        );
        const tokenWithBalance = processedPortfolio.enabledAssets.find(
          (token: ProcessedAsset) => token.balance > 0
        );
        const defaultToken =
          ethToken || tokenWithBalance || processedPortfolio.enabledAssets[0];
        setSelectedToken(defaultToken);
      }
    }
  }, [
    processedPortfolio,
    selectedToken,
    tokenId,
    rawTokenId,
    reduxToken,
    isManuallySelected,
  ]);

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
    handleAddressChange(data);
    setShowQRScanner(false);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
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
        const feeValue = networkFee.fee;
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
          const feeValue = networkFee.fee;
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
              height={40}
              paddingHorizontal={0}
              leading={
                <ChevronLeft
                  size={25}
                  color={theme.colors.bodyTextColor}
                  onPress={() => router.back()}
                />
              }
              title={
                <WalletSelectorHeader
                  currentUserWalletGroup={mainUserWalletGroup}
                />
              }
            />

            {/* Recipient Section */}
            <Box marginTop="l" position="relative">
              <Box
                flexDirection="row"
                alignItems="center"
                backgroundColor="modalBackgroundColor"
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
                backgroundColor="modalBackgroundColor"
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
                      : networkFee?.speed || FeeSpeed.Standard}
                    &nbsp;
                  </CustomText>
                  <CustomText variant="body" fontSize={14} color="white">
                    •{" "}
                    {isCalculatingFee
                      ? "..."
                      : PortfolioService.formatCurrency(
                          networkFee?.feeInUSD || 0
                        ) || "$0.00"}
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
                      {selectedToken?.chainImage ? (
                        <CryptoIcon
                          image={selectedToken.chainImage}
                          size={18}
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
                    const feeValue = networkFee ? networkFee.feeInUSD : 0;
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
            justifyContent="center"
            paddingHorizontal="m"
            style={{ marginBottom: insets.bottom + 10 }}
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

          {/* Select Token Bottom Sheet */}
          <TokenSelectorBottomSheet
            ref={sendTokenRef}
            mode="send"
            onTokenSelect={(token) => {
              setSelectedToken(token);
              setIsManuallySelected(true);
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
          <WhatIsNetworkFeeBottomsheet
            networkName={selectedToken?.chainSymbol}
            ref={networkFeeRef}
          />
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

          {/* Error Modal */}
          <ErrorModal
            visible={errorModal.visible}
            onClose={hideErrorModal}
            onRetry={handleRetryTransaction}
            onSupport={handleContactSupport}
            primaryAction={errorModal.props.primaryAction}
            secondaryAction={errorModal.props.secondaryAction}
            title={errorModal.props.title}
            message={errorModal.props.message}
            details={errorModal.props.details}
            type={errorModal.props.type}
            showRetry={errorModal.props.showRetry}
          />
        </PageWrapper>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default SendToken;
