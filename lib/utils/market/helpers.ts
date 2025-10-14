export type Currency = "USD" | "NGN" | "BTC" | "ETH" | "USDT" | "USDC" | "DAI";
interface FormatOptions {
  value: number;
  currency?: Currency;
  convert?: boolean;
  rate?: number; // rate to convert between Naira and Dollar
  showSymbol?: boolean; // optionally show ₦ or $
  getApproximateAmount: (
    amount: number | undefined,
    isCrypto?: boolean,
    forMarket?: boolean
  ) => string;
}

export interface HistoryItem {
  cap: number
  date: number
  liquidity: number | null
  rate: number
  volume: number | null
  ngnRate: number
}

// utility functions
export function formatAccountValue({
  value,
  currency,
  convert = false,
  rate,
  showSymbol = true,
  getApproximateAmount,
}: FormatOptions): string {
  try {
    let finalValue = value;

    if (convert && currency && rate) {
      if (currency === "USD") {
        finalValue = value; // Naira to Dollar
      } else if (currency === "NGN") {
        finalValue = value * rate; // Dollar to Naira
      }
    }

    const formatted = getApproximateAmount
      ? getApproximateAmount(finalValue, false, true)
      : finalValue.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });

    if (!currency || !showSymbol) return formatted;

    return currency === "USD" ? `$${formatted}` : `₦${formatted}`;
  } catch (error) {
    return "0";
  }
}

export function formatToSigFigMax6Digits(value: number): string {
  try {
    // Take absolute value to remove negative sign
    const absValue = Math.abs(value);

    if (absValue === 0) return '0';

    const sigFigValue = Number(absValue.toPrecision(3));

    let formatted = sigFigValue.toString();

    const digitsOnly = formatted.replace('.', '');

    if (digitsOnly.length > 5) {
      return sigFigValue.toExponential(2);
    }

    return formatted;
  } catch (error) {
    return '0';
  }
}
export function createAxisLabels(history: HistoryItem[], time: number) {
  if (!history) return [];

  const ONE_DAY = 24 * 60 * 60 * 1000;
  let timeBoundary: number;
  let dateOptions: Intl.DateTimeFormatOptions;
  let labels: string[] = [];

  if (time === 1 / 365) {
    timeBoundary = Date.now() - ONE_DAY;
    dateOptions = {hour: '2-digit', hour12: true};
  } else if (time === 7 / 365) {
    timeBoundary = Date.now() - 7 * ONE_DAY;
    dateOptions = {weekday: 'short', month: 'short', day: 'numeric'};
  } else if (time === 1 / 12) {
    timeBoundary = Date.now() - 30 * ONE_DAY;
    labels = history
      .filter(entry => entry.date >= timeBoundary)
      .map(
        entry =>
          `${new Date(entry.date).toLocaleDateString('en-US', {
            day: 'numeric',
          })} ${new Date(entry.date).toLocaleDateString('en-US', {
            month: 'short',
          })}`,
      );
  } else {
    timeBoundary = Date.now() - time * 365 * ONE_DAY;
    dateOptions = {year: '2-digit', month: 'short'};
  }

  if (!labels.length) {
    labels = history
      .filter(entry => entry.date >= timeBoundary)
      .map(entry =>
        new Date(entry.date).toLocaleDateString('en-US', dateOptions),
      );
  }

  const step = Math.ceil(labels.length / 6);
  return labels.filter((_, index) => index % step === 0);
}
export function extractDateAndRate(
  history: HistoryItem[],
  time: number,
  selectedCurrency: string,
) {
  if (!history) {
    return [];
  }

  let timeBoundary = Date.now() - time * 365 * 24 * 60 * 60 * 1000; // Calculate the timestamp for the specified number of years ago

  let datapoints = (history || [])
    .filter(entry => entry?.date >= timeBoundary) // Filter valid entries within the time boundary
    .map(entry => (selectedCurrency === 'USD' ? entry?.rate : entry?.ngnRate))
    .filter(rate => rate !== undefined); // Remove undefined values

  // Return a default [1] array if no valid data points are found
  if (datapoints.length === 0) {
    return [1];
  }

  // Reduce the number of labels if needed (e.g., limiting to 7)
  const maxLabels = 7;
  if (datapoints.length > maxLabels) {
    const step = Math.ceil(datapoints.length / maxLabels);
    datapoints = datapoints.filter((_, index) => index % step === 0);
  }

  const step = Math.ceil(datapoints.length / 6);
  return datapoints.filter((_, index) => index % step === 0);
}

export function formatStats(
  value: number,
  decimalPlaces = 2,
  selectedCurrency: string,
) {
  const isDollar = selectedCurrency === 'USD';
  const currencySymbol = isDollar ? '$' : '₦';
  try {
    // Determine decimal places, handling if decimalPlaces is a function
    const getDecimalPlaces =
      typeof decimalPlaces === 'function' ? decimalPlaces : () => decimalPlaces;
    const decimalValue = getDecimalPlaces();

    if (!value) return `${currencySymbol}0`;

    // Define abbreviations based on value
    const units = [
      {threshold: 1e12, suffix: 'T'},
      {threshold: 1e9, suffix: 'B'},
      {threshold: 1e6, suffix: 'M'},
      {threshold: 1e3, suffix: 'k'},
    ];

    // Find the appropriate unit for the value
    const unit = units.find(u => value >= u.threshold);
    if (unit) {
      return `${currencySymbol}${(value / unit.threshold).toFixed(
        decimalValue,
      )}${unit.suffix}`;
    }

    // For values less than 1,000, use account function
    return formatAccountValue({value});
  } catch {
    return `${currencySymbol}0`;
  }
}

export const getApproximateAmount = (
  amount: number | undefined,
  isCrypto?: boolean,
  forMarket?: boolean
): string => {
  if (amount === undefined) return "0.00";

  let decimalPlaces: number;

  if (isCrypto || amount < 1) {
    // If crypto less than 1: use 6 or 8 decimal places depending on the forMarket flag
    // If crypto greater than or equal to 1: use 4 decimal places
    decimalPlaces = amount < 1 ? (forMarket ? 8 : 6) : 4;
  } else {
    decimalPlaces = 2;
  }

  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  });

  return formatted;
};