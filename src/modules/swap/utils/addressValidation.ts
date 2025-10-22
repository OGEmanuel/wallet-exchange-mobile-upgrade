/**
 * Address Validation Utilities
 * 
 * Provides chain-specific address validation for swap functionality
 */

import { SupportedCurrency } from "@/src/core/supported-currencies/supported-currencies-context";

export interface AddressValidationResult {
  isValid: boolean;
  error?: string;
  normalizedAddress?: string;
}

/**
 * Validates an address for a specific chain
 */
export const validateAddress = (
  address: string,
  currency: SupportedCurrency
): AddressValidationResult => {
  if (!address || !address.trim()) {
    return {
      isValid: false,
      error: "Address is required",
    };
  }

  const trimmedAddress = address.trim();

  // Get chain information
  const chainSymbol = currency.chainId?.symbol;
  const isEVM = currency.chainId?.isEVM;

  if (isEVM) {
    return validateEVMAddress(trimmedAddress, chainSymbol);
  }

  // Handle non-EVM chains
  switch (chainSymbol) {
    case "BTC":
      return validateBitcoinAddress(trimmedAddress);
    case "LTC":
      return validateLitecoinAddress(trimmedAddress);
    case "DOGE":
      return validateDogecoinAddress(trimmedAddress);
    case "SOL":
      return validateSolanaAddress(trimmedAddress);
    default:
      return {
        isValid: true,
        normalizedAddress: trimmedAddress,
      };
  }
};

/**
 * Validates EVM addresses (ETH, MATIC, ARB, etc.)
 */
const validateEVMAddress = (
  address: string,
  chainSymbol?: string
): AddressValidationResult => {
  // Basic EVM address validation
  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  if (!evmAddressRegex.test(address)) {
    return {
      isValid: false,
      error: `Invalid ${chainSymbol || "EVM"} address format`,
    };
  }

  // Additional chain-specific validations can be added here
  if (chainSymbol === "ETH") {
    // Ethereum-specific validation
    if (address === "0x0000000000000000000000000000000000000000") {
      return {
        isValid: false,
        error: "Invalid Ethereum address",
      };
    }
  }

  return {
    isValid: true,
    normalizedAddress: address.toLowerCase(),
  };
};

/**
 * Validates Bitcoin addresses
 */
const validateBitcoinAddress = (address: string): AddressValidationResult => {
  // Bitcoin address validation (Legacy, SegWit, Bech32)
  const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const segwitRegex = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const bech32Regex = /^bc1[a-z0-9]{39,59}$/;

  if (legacyRegex.test(address) || segwitRegex.test(address) || bech32Regex.test(address)) {
    return {
      isValid: true,
      normalizedAddress: address,
    };
  }

  return {
    isValid: false,
    error: "Invalid Bitcoin address format",
  };
};

/**
 * Validates Litecoin addresses
 */
const validateLitecoinAddress = (address: string): AddressValidationResult => {
  // Litecoin address validation
  const legacyRegex = /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/;
  const bech32Regex = /^ltc1[a-z0-9]{39,59}$/;

  if (legacyRegex.test(address) || bech32Regex.test(address)) {
    return {
      isValid: true,
      normalizedAddress: address,
    };
  }

  return {
    isValid: false,
    error: "Invalid Litecoin address format",
  };
};

/**
 * Validates Dogecoin addresses
 */
const validateDogecoinAddress = (address: string): AddressValidationResult => {
  // Dogecoin address validation
  const dogeRegex = /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/;

  if (dogeRegex.test(address)) {
    return {
      isValid: true,
      normalizedAddress: address,
    };
  }

  return {
    isValid: false,
    error: "Invalid Dogecoin address format",
  };
};

/**
 * Validates Solana addresses
 */
const validateSolanaAddress = (address: string): AddressValidationResult => {
  // Solana address validation (Base58, 32-44 characters)
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  if (solanaRegex.test(address)) {
    return {
      isValid: true,
      normalizedAddress: address,
    };
  }

  return {
    isValid: false,
    error: "Invalid Solana address format",
  };
};

/**
 * Gets address validation requirements for a currency
 */
export const getAddressRequirements = (currency: SupportedCurrency): string => {
  const chainSymbol = currency.chainId?.symbol;
  const isEVM = currency.chainId?.isEVM;

  if (isEVM) {
    return `Enter a valid ${chainSymbol} address (0x...)`;
  }

  switch (chainSymbol) {
    case "BTC":
      return "Enter a valid Bitcoin address";
    case "LTC":
      return "Enter a valid Litecoin address";
    case "DOGE":
      return "Enter a valid Dogecoin address";
    case "SOL":
      return "Enter a valid Solana address";
    default:
      return "Enter a valid address";
  }
};
