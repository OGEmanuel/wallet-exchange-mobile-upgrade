import Box from "@/components/general/Box";
import CryptoIcon from "@/components/general/CrptoIcon";
import CustomText from "@/components/general/CustomText";
import { filterRatesByPeriod, getLatestRate } from "@/lib/utils/market/chartHelpers";
import { formatPrice } from "@/lib/utils/market/priceFormatter";
import { Rate } from "@/src/modules/market/domain/entities/models/token-history-model";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Pressable } from "react-native";
import { LineChart } from "react-native-chart-kit";

const SCREEN_WIDTH = Dimensions.get("window").width;

// Local currency formatting function
const formatCurrencyValue = (value: number, currency: string = "USD"): string => {
  const symbol = currency === "NGN" ? "₦" : "$";
  if (value >= 1000000000000) {
    return `${symbol}${(value / 1000000000000).toFixed(1)}T`;
  } else if (value >= 1000000000) {
    return `${symbol}${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  } else if (value >= 1) {
    return `${symbol}${value.toFixed(2)}`;
  } else {
    return `${symbol}${value.toFixed(6)}`;
  }
};

interface TokenData {
  value: number;
  label?: string;
  dataPointText?: string;
}

interface TokenGraphProps {
  symbol?: string;
  price: string;
  priceChangePercentage: number;
  period: string;
  data: Rate[];
  currency?: "USD" | "NGN";
  availablePeriods?: string[];
  onPeriodChange?: (period: string) => void;
  onCurrencyChange?: (currency: "USD" | "NGN") => void;
  tokenLogo?: string;
  ngnSellRate?: number;
  nairaCurrency?: CurrencyModel | null;
  usdCurrency?: CurrencyModel | null;
}

const TokenGraph: React.FC<TokenGraphProps> = ({
  symbol,
  price,
  priceChangePercentage,
  period,
  data,
  currency = "USD",
  availablePeriods = ["24h", "7D", "3M", "6M", "1Y"],
  onPeriodChange,
  onCurrencyChange,
  tokenLogo,
  ngnSellRate,
  nairaCurrency,
  usdCurrency,
}) => {
  const theme = useTheme<Theme>();
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  
  // Chart data state for react-native-chart-kit
  const [chartKitData, setChartKitData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  // Update selectedPeriod when period prop changes
  useEffect(() => {
    setSelectedPeriod(period);
  }, [period]);

  // Convert data to chart-kit format
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const sortedHistory = [...data].sort(
        (a, b) => Number(a.date ?? 0) - Number(b.date ?? 0)
      );
      const labels = sortedHistory.map((item) =>
        new Date(Number(item.date)).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      const chartValues = sortedHistory.map((item) => {
        let rate = item.rate ?? 0;
        // Convert to NGN if needed
        if (currency === "NGN" && ngnSellRate) {
          rate = rate * ngnSellRate;
        }
        return rate;
      });

      setChartKitData({ labels, datasets: [{ data: chartValues }] });
    }
  }, [data, currency, ngnSellRate]);

  const periods = ["24h", "7D", "3M", "6M", "1Y"];

  // Y-axis label formatting function
  const getYAxisLabels = () => {
    const data = chartKitData.datasets[0]?.data || [];
    if (!data.length) return [];

    let values = [...data];
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return [formatCompactCurrency(max, currency)];
    }

    const step = (max - min) / 4;

    return Array.from({ length: 5 }, (_, i) => {
      const value = max - step * i;
      return formatCompactCurrency(value, currency);
    });
  };

  // Helper function to format numbers compactly for Y-axis with currency
  const formatCompactCurrency = (value: number, currency: string): string => {
    const symbol = currency === "NGN" ? "₦" : "$";
    
    if (value >= 1000000000) {
      return `${symbol}${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(1)}K`;
    } else if (value >= 1) {
      return `${symbol}${value.toFixed(0)}`;
    } else {
      return `${symbol}${value.toFixed(2)}`;
    }
  };

  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  // Theme-aware chart config
  const chartConfig = {
    backgroundColor: isDark ? "#2F333D" : "#ffffff",
    backgroundGradientFrom: isDark ? "#2F333D" : "#ffffff",
    backgroundGradientTo: isDark ? "#2F333D" : "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(96, 69, 255, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#6045FF",
    },
  };

  // Format rates data for chart
  const chartData = useMemo((): TokenData[] => {
    if (!data || data.length === 0) return [];

    // Filter data by period first
    const filteredData = filterRatesByPeriod(data, period);

    // Convert rates to chart data format
    const formattedData = filteredData.map((rate, index) => {
      let value = rate.rate || 0;
      const originalValue = value;

      // Convert to NGN if needed
      if (currency === "NGN" && ngnSellRate && ngnSellRate > 0) {
        value = value / ngnSellRate;
      }

      // Format label based on period
      let label = "";
      if (rate.date) {
        const date = new Date(Number(rate.date));
        if (period === "24h") {
          label = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } else if (period === "7D") {
          label = date.toLocaleDateString("en-US", { weekday: "short" });
        } else if (period === "3M" || period === "6M") {
          label = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        } else if (period === "1Y") {
          label = date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
        }
      } else {
        label = `${index + 1}`;
      }

      return {
        value,
        label: index % Math.ceil(data.length / 5) === 0 ? label : "",
        dataPointText: formatCurrencyValue(value, currency),
      };
    });

    // Reduce data points for better chart performance if we have too many
    let finalData = formattedData;
    if (formattedData.length > 50) {
      const step = Math.ceil(formattedData.length / 50);
      finalData = formattedData.filter((_, index) => index % step === 0);
    }

    return finalData;
  }, [data, currency, ngnSellRate, period]);


  const handlePeriodChange = (newPeriod: string): void => {
    if (availablePeriods.includes(newPeriod)) {
      setSelectedPeriod(newPeriod);
      if (onPeriodChange) {
        onPeriodChange(newPeriod);
      }
    }
  };

  const handleCurrencyToggle = (): void => {
    const newCurrency = currency === "USD" ? "NGN" : "USD";
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
  };

  const isPeriodAvailable = (p: string): boolean => {
    // Make 7D specifically unavailable/unclickable
    if (p === "7D") {
      return false;
    }
    return availablePeriods.includes(p);
  };

  // Calculate min and max for the chart
  const values = chartData.map((item) => item.value);
  const minValue = Math.min(...values) * 0.998;
  const maxValue = Math.max(...values) * 1.002;


  const getPeriodLabel = (p: string): string => {
    switch (p) {
      case "24h":
        return "Last 24 hours";
      case "7D":
        return "Last 7 days";
      case "3M":
        return "Last 3 months";
      case "6M":
        return "Last 6 months";
      case "1Y":
        return "Last year";
      default:
        return p;
    }
  };

  return (
    <Box
      backgroundColor="modalBackgroundColor"
      borderRadius={20}
      padding="l"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Header Section */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
        marginBottom="m"
      >
        <Box flex={1}>
          <Box flexDirection="row" alignItems="center" marginBottom="s">
            {tokenLogo && (
              <Box marginRight="s">
                <CryptoIcon image={tokenLogo} size={28} symbol={symbol || ""} />
              </Box>
            )}
            <CustomText
              variant="body"
              fontSize={16}
              color="headerTextColor"
              fontWeight="600"
            >
              {symbol}
            </CustomText>
          </Box>
          <CustomText
            variant="header"
            fontSize={24}
            color="headerTextColor"
            marginBottom="s"
          >
            {(() => {
              // Calculate dynamic price based on current currency
              const latestRate = getLatestRate(data, "USD");
              return formatPrice(latestRate, currency, nairaCurrency, usdCurrency);
            })()}
          </CustomText>
        </Box>

        <Box alignItems="flex-end">
          <CustomText
            fontSize={14}
            color={priceChangePercentage >= 0 ? "success" : "error"}
            marginBottom="s"
          >
            {priceChangePercentage >= 0 ? "+" : ""}
            {priceChangePercentage.toFixed(2)}%
          </CustomText>
          <CustomText fontSize={12} color="placeholderTextColor">
            {getPeriodLabel(selectedPeriod)}
          </CustomText>
        </Box>
      </Box>

      {/* Currency Toggle */}
      <Box marginBottom="m" flexDirection="row" alignItems="center">
        <Pressable
          onPress={handleCurrencyToggle}
          style={({ pressed }) => ({
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: pressed
              ? theme.colors.borderColor
              : "rgba(96, 69, 255, 0.1)",
            flexDirection: "row",
            alignItems: "center",
          })}
        >
          <CustomText fontSize={12} color="headerTextColor" fontWeight="600">
            {currency}
          </CustomText>
          <CustomText fontSize={10} color="placeholderTextColor" marginLeft="s">
            {" "}
            • Tap to switch
          </CustomText>
        </Pressable>
      </Box>

      {/* Chart */}
      <Box height={220} marginBottom="m">
        {chartKitData.datasets[0].data.length > 0 ? (
          <Box width="100%" flexDirection="row" alignItems="center">
            <Box width="82%" alignItems="center">
              <LineChart
                data={chartKitData}
                width={SCREEN_WIDTH - 180}
                height={200}
                yAxisSuffix=""
                withInnerLines={true}
                withOuterLines={false}
                withHorizontalLabels={false}
                withVerticalLabels={false}
                withDots={false}
                bezier
                chartConfig={chartConfig}
                style={{
                  paddingRight: 0,
                  marginLeft: -20,
                  marginRight: -20,
                }}
              />
            </Box>
            <Box
              width="18%"
              paddingLeft="s"
              height={180}
              justifyContent="space-between"
              alignItems="flex-start"
            >
              {getYAxisLabels().map((label, i) => (
                <CustomText
                  key={`y-axis-${i}`}
                  variant="body"
                  fontSize={10}
                  color="disabledTextColor"
                  numberOfLines={1}
                  style={{ flexShrink: 0 }}
                >
                  {label}
                </CustomText>
              ))}
            </Box>
          </Box>
        ) : (
          <Box flex={1} justifyContent="center" alignItems="center">
            <CustomText
              color="placeholderTextColor"
              fontSize={14}
              textAlign="center"
            >
              No data available for the selected period
            </CustomText>
          </Box>
        )}
      </Box>

      {/* Period Selector */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="s"
        backgroundColor="borderColor"
        borderRadius={25}
        padding="s"
      >
        {periods.map((p) => (
          <Pressable
            key={p}
            onPress={() => handlePeriodChange(p)}
            disabled={!isPeriodAvailable(p)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 20,
              backgroundColor:
                selectedPeriod === p && isPeriodAvailable(p)
                  ? theme.colors.primaryColor
                  : "transparent",
              opacity:
                !isPeriodAvailable(p) ? 0.3 : pressed ? 0.7 : 1,
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <CustomText
              fontSize={13}
              color={
                selectedPeriod === p && isPeriodAvailable(p)
                  ? "white"
                  : "placeholderTextColor"
              }
              fontWeight={selectedPeriod === p ? "700" : "500"}
            >
              {p}
            </CustomText>
          </Pressable>
        ))}
      </Box>
    </Box>
  );
};

export default TokenGraph;

