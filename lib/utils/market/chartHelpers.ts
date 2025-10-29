import { Rate } from "@/src/modules/market/domain/entities/models/token-history-model";

export interface TokenData {
  timestamp: string;
  value: number;
  formattedTime?: string;
  date?: Date;
}

/**
 * Filter rates based on the selected period
 */
export const filterRatesByPeriod = (
  rates: Rate[] | undefined,
  selectedPeriod: string
): Rate[] => {
  if (!rates || rates.length === 0) return [];

  // Create a copy of rates to avoid mutating the original
  const ratesCopy = [...rates];

  // For small datasets, return all data
  if (ratesCopy.length <= 12) return ratesCopy;

  // Sort rates chronologically
  const sortedRates = ratesCopy.sort((a, b) => {
    const dateA = Number(a.date || a.timestamp || 0);
    const dateB = Number(b.date || b.timestamp || 0);
    return dateA - dateB;
  });

  // Find the latest date
  const latestRate = sortedRates[sortedRates.length - 1];
  const latestTimestamp = Number(latestRate.date || latestRate.timestamp || Date.now());
  const latestDate = new Date(latestTimestamp);

  // Filter rates based on the time range
  let filteredRates: Rate[] = [];
  let dataPoints: number;

  const now = Date.now();

  switch (selectedPeriod) {
    case "24h":
      // For 24h: include data from the last 24 hours
      filteredRates = sortedRates.filter((rate) => {
        const rateTimestamp = Number(rate.date || rate.timestamp || 0);
        const hoursDiff = (latestTimestamp - rateTimestamp) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      });
      dataPoints = Math.min(filteredRates.length, 24);
      break;
    case "7D":
      // For 7D: include data from the last 7 days
      filteredRates = sortedRates.filter((rate) => {
        const rateTimestamp = Number(rate.date || rate.timestamp || 0);
        const daysDiff = (latestTimestamp - rateTimestamp) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });
      dataPoints = Math.min(filteredRates.length, 7);
      break;
    case "3M":
      // For 3M: include data from the last 3 months
      filteredRates = sortedRates.filter((rate) => {
        const rateTimestamp = Number(rate.date || rate.timestamp || 0);
        const daysDiff = (latestTimestamp - rateTimestamp) / (1000 * 60 * 60 * 24);
        return daysDiff <= 90;
      });
      dataPoints = Math.min(filteredRates.length, 30);
      break;
    case "6M":
      // For 6M: include data from the last 6 months
      filteredRates = sortedRates.filter((rate) => {
        const rateTimestamp = Number(rate.date || rate.timestamp || 0);
        const daysDiff = (latestTimestamp - rateTimestamp) / (1000 * 60 * 60 * 24);
        return daysDiff <= 180;
      });
      dataPoints = Math.min(filteredRates.length, 30);
      break;
    case "1Y":
      // For 1Y: include data from the last year
      filteredRates = sortedRates.filter((rate) => {
        const rateTimestamp = Number(rate.date || rate.timestamp || 0);
        const daysDiff = (latestTimestamp - rateTimestamp) / (1000 * 60 * 60 * 24);
        return daysDiff <= 365;
      });
      dataPoints = Math.min(filteredRates.length, 52);
      break;
    default:
      filteredRates = sortedRates;
      dataPoints = 5;
  }

  // If no filtered data, return all data
  if (filteredRates.length === 0) {
    filteredRates = sortedRates;
  }

  // Ensure we have at least 2 points
  dataPoints = Math.min(dataPoints, filteredRates.length);
  dataPoints = Math.max(dataPoints, 2);

  // Select evenly distributed points
  const result: Rate[] = [];
  for (let i = 0; i < dataPoints; i++) {
    const position = i / (dataPoints - 1); // 0 to 1
    const index = Math.min(
      filteredRates.length - 1,
      Math.floor(position * (filteredRates.length - 1))
    );
    result.push(filteredRates[index]);
  }

  return result;
};

/**
 * Calculate price change percentage based on historical data
 */
export const calculatePriceChange = (
  rates: Rate[] | undefined,
  period: string
): number => {
  if (!rates || rates.length < 2) return 0;

  // Filter rates based on period
  const filteredRates = filterRatesByPeriod(rates, period);

  if (filteredRates.length < 2) return 0;

  const currentRate = filteredRates[filteredRates.length - 1].rate || 0;
  const previousRate = filteredRates[0].rate || 0;

  if (previousRate === 0) return 0;

  return Number((((currentRate - previousRate) / previousRate) * 100).toFixed(2));
};

/**
 * Get the latest rate value for price display
 */
export const getLatestRate = (
  rates: Rate[] | undefined,
  currency: "USD" | "NGN" = "USD",
  ngnSellRate?: number
): number => {
  if (!rates || rates.length === 0) return 0;

  const lastRate = rates[rates.length - 1];
  const rateValue = lastRate.rate || 0;

  if (currency === "NGN" && ngnSellRate && ngnSellRate > 0) {
    return rateValue / ngnSellRate;
  }

  return rateValue;
};

/**
 * Format large numbers with appropriate suffix (T, B, M, K)
 */
export const formatLargeNumber = (
  num: number,
  currency: "USD" | "NGN" = "USD",
  ngnSellRate?: number
): string => {
  let convertedNum = num;
  let symbol = "$";

  if (currency === "NGN" && ngnSellRate && ngnSellRate > 0) {
    convertedNum = num / ngnSellRate;
    symbol = "₦";
  } else if (currency === "NGN") {
    symbol = "₦";
  }

  if (convertedNum >= 1000000000000) {
    return `${symbol}${(convertedNum / 1000000000000).toFixed(1)}T`;
  } else if (convertedNum >= 1000000000) {
    return `${symbol}${(convertedNum / 1000000000).toFixed(1)}B`;
  } else if (convertedNum >= 1000000) {
    return `${symbol}${(convertedNum / 1000000).toFixed(1)}M`;
  } else if (convertedNum >= 1000) {
    return `${symbol}${(convertedNum / 1000).toFixed(1)}K`;
  } else {
    return `${symbol}${convertedNum.toFixed(2)}`;
  }
};

/**
 * Get the latest market data (volume, marketCap)
 */
export const getLatestMarketData = (
  rates: Rate[] | undefined
): { volume: number; marketCap: number } => {
  if (!rates || rates.length === 0) {
    return { volume: 0, marketCap: 0 };
  }

  const latestRate = rates[rates.length - 1];
  return {
    volume: latestRate.volume || 0,
    marketCap: latestRate.marketCap || 0,
  };
};

/**
 * Determine which periods are valid based on the latest data date
 */
export const getAvailablePeriods = (rates: Rate[] | undefined): string[] => {
  if (!rates || rates.length === 0) {
    return [];
  }

  // Sort the rates by date to ensure we're working with chronological data
  const sortedRates = [...rates].sort((a, b) => {
    const dateA = Number(a.date || a.timestamp || 0);
    const dateB = Number(b.date || b.timestamp || 0);
    return dateA - dateB;
  });

  // Find the earliest and latest timestamps
  const earliestTimestamp = Number(
    sortedRates[0].date || sortedRates[0].timestamp || 0
  );
  const latestTimestamp = Number(
    sortedRates[sortedRates.length - 1].date ||
      sortedRates[sortedRates.length - 1].timestamp ||
      Date.now()
  );

  const now = Date.now();

  if (!earliestTimestamp || !latestTimestamp) {
    return [];
  }

  // Calculate the time span of the data
  const totalSpanInHours = (latestTimestamp - earliestTimestamp) / (1000 * 60 * 60);
  const totalSpanInDays = totalSpanInHours / 24;
  const totalSpanInMonths = totalSpanInDays / 30;
  const totalSpanInYears = totalSpanInDays / 365;

  // Calculate how recent the latest data is
  const hoursSinceLatest = (now - latestTimestamp) / (1000 * 60 * 60);
  const daysSinceLatest = hoursSinceLatest / 24;
  const monthsSinceLatest = daysSinceLatest / 30;
  const yearsSinceLatest = daysSinceLatest / 365;

  const validPeriods: string[] = [];

  // For 24h: we need at least 24 hours of data AND the latest data must be recent
  if (totalSpanInHours >= 24 && hoursSinceLatest <= 24) {
    validPeriods.push("24h");
  }

  // For 7D: we need at least 7 days of data AND the latest data must be recent
  if (totalSpanInDays >= 7 && daysSinceLatest <= 7) {
    validPeriods.push("7D");
  }

  // For 3M: we need at least 3 months of data
  if (totalSpanInMonths >= 3 && monthsSinceLatest <= 3) {
    validPeriods.push("3M");
  }

  // For 6M: we need at least 6 months of data
  if (totalSpanInMonths >= 6 && monthsSinceLatest <= 6) {
    validPeriods.push("6M");
  }

  // For 1Y: we need at least 1 year of data
  if (totalSpanInYears >= 1 && yearsSinceLatest <= 1) {
    validPeriods.push("1Y");
  }

  // If no valid periods determined, pick the most appropriate period
  if (validPeriods.length === 0) {
    if (hoursSinceLatest <= 24) {
      validPeriods.push("24h");
    } else if (daysSinceLatest <= 7) {
      validPeriods.push("7D");
    } else if (monthsSinceLatest <= 3) {
      validPeriods.push("3M");
    } else if (monthsSinceLatest <= 6) {
      validPeriods.push("6M");
    } else {
      validPeriods.push("1Y");
    }
  }

  return validPeriods;
};

