import { ErrorModalProps } from "@/components/general/ErrorModal";

export interface ErrorContext {
  chain?: string;
  amount?: string;
  tokenSymbol?: string;
  recipientAddress?: string;
  errorCode?: string;
  originalError?: any;
}

export const createErrorModalProps = (
  error: any,
  context: ErrorContext = {}
): Partial<ErrorModalProps> => {
  const errorMessage = error?.message || error?.toString() || "Unknown error";
  const errorCode = error?.code || context.errorCode;

  console.log("🔍 Creating error modal props:", {
    message: errorMessage,
    code: errorCode,
    context,
  });

  // Network/Connection errors
  if (
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("connection") ||
    errorMessage.toLowerCase().includes("timeout") ||
    errorMessage.toLowerCase().includes("fetch") ||
    errorCode === "NETWORK_ERROR"
  ) {
    return {
      type: "network",
      title: "Network Error",
      message: "Unable to connect to the blockchain network. Please check your internet connection and try again.",
      details: `Error: ${errorMessage}`,
      showRetry: true,
      showSupport: true,
    };
  }

  // Insufficient funds errors
  if (
    errorMessage.toLowerCase().includes("insufficient") ||
    errorMessage.toLowerCase().includes("not enough") ||
    errorMessage.toLowerCase().includes("balance") ||
    errorCode === "INSUFFICIENT_FUNDS"
  ) {
    return {
      type: "error",
      title: "Insufficient Funds",
      message: `You don't have enough ${context.tokenSymbol || "tokens"} to complete this transaction. Please check your balance and try again.`,
      details: `Required: ${context.amount} ${context.tokenSymbol}\nError: ${errorMessage}`,
      primaryAction: {
        text: "Check Balance",
        onPress: () => {
          // This will be handled by the parent component
        },
      },
      showSupport: true,
    };
  }

  // Unsupported chain errors
  if (
    errorMessage.toLowerCase().includes("unsupported") ||
    errorMessage.toLowerCase().includes("chain") ||
    errorMessage.toLowerCase().includes("not supported") ||
    errorCode === "UNSUPPORTED_CHAIN"
  ) {
    return {
      type: "warning",
      title: "Unsupported Chain",
      message: `The ${context.chain || "selected"} blockchain is not supported for this transaction. Please try with a different token.`,
      details: `Chain: ${context.chain}\nError: ${errorMessage}`,
      primaryAction: {
        text: "Select Different Token",
        onPress: () => {
          // This will be handled by the parent component
        },
      },
      showSupport: true,
    };
  }

  // Wallet/Private key errors
  if (
    errorMessage.toLowerCase().includes("private key") ||
    errorMessage.toLowerCase().includes("wallet") ||
    errorMessage.toLowerCase().includes("signature") ||
    errorMessage.toLowerCase().includes("authentication") ||
    errorCode === "WALLET_ERROR"
  ) {
    return {
      type: "wallet",
      title: "Wallet Error",
      message: "There was an issue with your wallet. Please ensure your wallet is properly set up and try again.",
      details: `Error: ${errorMessage}`,
      primaryAction: {
        text: "Check Wallet",
        onPress: () => {
          // This will be handled by the parent component
        },
      },
      showSupport: true,
    };
  }

  // Service unavailable errors
  if (
    errorMessage.toLowerCase().includes("service") ||
    errorMessage.toLowerCase().includes("unavailable") ||
    errorMessage.toLowerCase().includes("temporarily") ||
    errorCode === "SERVICE_UNAVAILABLE"
  ) {
    return {
      type: "network",
      title: "Service Unavailable",
      message: "The transaction service is temporarily unavailable. Please try again in a few moments.",
      details: `Error: ${errorMessage}`,
      showRetry: true,
      showSupport: true,
    };
  }

  // Validation errors
  if (
    errorMessage.toLowerCase().includes("invalid") ||
    errorMessage.toLowerCase().includes("validation") ||
    errorMessage.toLowerCase().includes("address") ||
    errorCode === "VALIDATION_ERROR"
  ) {
    return {
      type: "validation",
      title: "Invalid Input",
      message: "Please check your transaction details and try again.",
      details: `Error: ${errorMessage}`,
      primaryAction: {
        text: "Review Details",
        onPress: () => {
          // This will be handled by the parent component
        },
      },
    };
  }

  // Default unknown error
  return {
    type: "error",
    title: "Transaction Failed",
    message: "An unexpected error occurred while processing your transaction. Please try again.",
    details: `Error: ${errorMessage}\nCode: ${errorCode || "Unknown"}`,
    showRetry: true,
    showSupport: true,
  };
};
