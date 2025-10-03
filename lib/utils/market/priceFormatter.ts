import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";

// Helper function for approximate amount formatting
export const getApproximateAmount = (
  value: number,
  showDecimals: boolean = true,
  useCommas: boolean = true
): string => {
  if (showDecimals) {
    return useCommas
      ? value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : value.toFixed(2);
  }
  return useCommas
    ? Math.round(value).toLocaleString("en-US")
    : Math.round(value).toString();
};

// Format price with currency conversion
export const formatPrice = (
  price?: number | null,
  selectedCurrency: "USD" | "NGN" = "USD",
  nairaCurrency?: CurrencyModel | null,
  usdCurrency?: CurrencyModel | null
): string => {
  if (!price) return "0.00";

  // Convert to NGN if needed with proper validation
  let convertedPrice: number;
  let symbol: string;

  if (selectedCurrency === "NGN") {
    const sellRate = nairaCurrency?.sellRate;
    const isValidSellRate = sellRate && sellRate > 0;

    if (isValidSellRate) {
      convertedPrice = price / sellRate;
      symbol = "₦";
    } else {
      console.warn(
        "NGN sellRate not available or invalid for price formatting, using USD"
      );
      convertedPrice = price;
      symbol = "$";
    }
  } else {
    convertedPrice = price;
    symbol = "$";
  }

  if (selectedCurrency === "NGN" && symbol === "₦") {
    if (convertedPrice >= 1_000_000_000_000) {
      // Trillion
      return `${symbol}${getApproximateAmount(
        convertedPrice / 1_000_000_000_000,
        true,
        true
      )}T`;
    } else if (convertedPrice >= 1_000_000_000) {
      // Billion
      return `${symbol}${getApproximateAmount(
        convertedPrice / 1_000_000_000,
        true,
        true
      )}B`;
    } else if (convertedPrice >= 1_000_000) {
      // Million
      return `${symbol}${getApproximateAmount(
        convertedPrice / 1_000_000,
        true,
        true
      )}M`;
    }
  } else {
    if (convertedPrice >= 1_000_000_000) {
      // Billion
      return `${symbol}${getApproximateAmount(
        convertedPrice / 1_000_000_000,
        true,
        true
      )}B`;
    } else if (convertedPrice >= 1_000_000) {
      // Million
      return `${symbol}${getApproximateAmount(
        convertedPrice / 1_000_000,
        true,
        true
      )}M`;
    }
  }

  // Regular number formatting
  return `${symbol}${getApproximateAmount(convertedPrice, true, true)}`;
};

// Format price change percentage
export const formatPriceChange = (change?: number | null): string => {
  if (!change) return "0.00%";
  
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
};
