/**
 * Utility functions for formatting numbers and currency values
 */

/**
 * Format numbers with commas for better readability
 */
export const formatNumberWithCommas = (value: string): string => {
  // Remove all dollar signs first to prevent duplicates
  const valueWithoutDollar = value.replace(/\$/g, '');

  // Remove all non-digit characters except decimal point
  const numericValue = valueWithoutDollar.replace(/[^\d.]/g, '');

  // Split by decimal point
  const parts = numericValue.split('.');

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Reunite with decimal part if it exists
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
};

/**
 * Ensure there's only one dollar sign at the beginning if needed
 */
export const ensureSingleDollarSign = (
  value: string | null | undefined,
  shouldHaveDollarSign: boolean
): string => {
  if (!value) return shouldHaveDollarSign ? '$0' : '0';

  // First, remove any existing dollar signs
  const cleanValue = value.replace(/\$/g, '');

  // Then add a single dollar sign if needed
  return shouldHaveDollarSign ? `$${cleanValue}` : cleanValue;
};

/**
 * Get approximate amount with proper decimal places
 */
export const getApproximateAmount = (
  amount: number,
  isCrypto = false
): string => {
  if (isCrypto) {
    // For crypto, show up to 8 decimal places
    return amount.toFixed(8).replace(/\.?0+$/, '');
  }
  // For fiat, show 2 decimal places
  return amount.toFixed(2);
};

/**
 * Clean input value by removing non-numeric characters except decimal point
 */
export const cleanNumericInput = (value: string): string => {
  return value.replace(/\$/g, '').replace(/,/g, '').replace(/[^\d.]/g, '');
};

/**
 * Validate if a string is a valid number
 */
export const isValidNumber = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Setup token ticker from supported currency
 */
export const setupTokenTicker = (currency?: SupportedCurrencyModel | null): string => {
  if (!currency) return '';
  return currency.currencyId?.code || currency.currencyId?.symbol || '';
};

