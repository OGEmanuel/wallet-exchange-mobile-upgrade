/**
 * Currency formatting utilities for the exchange module
 * Extracted from zap-frontend-swap-module SwapProvider
 */

import { SupportedCurrency } from "../data/remote";

export interface FormattingOptions {
  baseAmount: number;
  targetAmount: number;
  baseToUsd: number;
  baseInputIsDollar: boolean;
  baseCurrency: SupportedCurrency;
  targetCurrency: SupportedCurrency;
}

/**
 * Formats the base amount based on currency type and input mode
 * @param options - Formatting options including amounts and currency info
 * @returns Formatted string representation of the base amount
 */
export function formatBaseAmount(options: FormattingOptions): string {
  const { baseAmount, baseToUsd, baseInputIsDollar, baseCurrency } = options;

  // If the user is inputting in dollars
  if (baseInputIsDollar) {
    if (isNaN(baseToUsd) || baseToUsd < 0) return "0";
    return baseToUsd.toLocaleString(undefined, {
      // For dollars, always show up to 2 decimal places.
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  // If the base currency is crypto
  if (baseCurrency?.currencyId?.isCrypto) {
    if (isNaN(Number(baseAmount)) || Number(baseAmount) < 0) return "0";

    // For stablecoins we want exactly 2 decimals:
    if (
      baseCurrency.currencyId?.symbol === "USDTBSC" ||
      baseCurrency.currencyId?.symbol === "USDCBSC" ||
      baseCurrency.currencyId?.symbol === "USDTERC20" ||
      baseCurrency.currencyId?.symbol === "USDTTRC20" ||
      baseCurrency.currencyId?.symbol === "DAI"
    ) {
      return baseAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // For other crypto tokens, allow between 3 and up to 10 decimals.
    return baseAmount.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 6,
    });
  }

  // For non-crypto currencies
  if (isNaN(Number(baseAmount)) || Number(baseAmount) < 0) return "0";
  return baseAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats the target amount based on currency type
 * @param options - Formatting options including amounts and currency info
 * @returns Formatted string representation of the target amount
 */
export function formatTargetAmount(options: FormattingOptions): string {
  const { targetAmount, targetCurrency } = options;

  // If the target currency is crypto
  if (targetCurrency?.currencyId?.isCrypto) {
    if (isNaN(Number(targetAmount)) || Number(targetAmount) < 0) return "0";

    // For stablecoins on target side
    if (
      targetCurrency.currencyId?.symbol === "USDTBSC" ||
      targetCurrency.currencyId?.symbol === "USDCBSC" ||
      targetCurrency.currencyId?.symbol === "USDTERC20" ||
      targetCurrency.currencyId?.symbol === "USDTTRC20" ||
      targetCurrency.currencyId?.symbol === "DAI"
    ) {
      return targetAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // For other crypto tokens, allow between 3 and up to 10 decimals.
    return targetAmount.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 6,
    });
  }

  // For non-crypto currencies
  if (isNaN(Number(targetAmount)) || Number(targetAmount) < 0) return "0";
  return targetAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats USD amounts with 2 decimal places
 * @param baseToUsd - USD amount to format
 * @returns Formatted string representation of the USD amount
 */
export function formatBaseToUsd(baseToUsd: number): string {
  if (isNaN(Number(baseToUsd)) || Number(baseToUsd) < 0) return "0";
  return baseToUsd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats input amounts with accounting-style formatting (e.g., 100000 -> 100,000)
 * @param value - The input value to format
 * @param isCrypto - Whether the currency is crypto (affects decimal places)
 * @returns Formatted string with proper comma separators
 */
export function formatInputAmount(
  value: string,
  isCrypto: boolean = false
): string {
  // Remove any non-numeric characters except decimal point
  const cleanValue = value.replace(/[^0-9.]/g, "");

  // Handle empty or invalid input
  if (!cleanValue || cleanValue === ".") return "";

  // Split by decimal point
  const parts = cleanValue.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // For crypto, limit decimal places to 8, for fiat limit to 2
  const maxDecimals = isCrypto ? 8 : 2;
  const formattedDecimal = decimalPart
    ? decimalPart.substring(0, maxDecimals)
    : "";

  // Combine parts
  return decimalPart
    ? `${formattedInteger}.${formattedDecimal}`
    : formattedInteger;
}

/**
 * Parses a formatted input string back to a number
 * @param formattedValue - The formatted string (e.g., "1,000.50")
 * @returns The numeric value
 */
export function parseFormattedAmount(formattedValue: string): number {
  // Remove commas and convert to number
  const cleanValue = formattedValue.replace(/,/g, "");
  const numValue = parseFloat(cleanValue);
  return isNaN(numValue) ? 0 : numValue;
}
