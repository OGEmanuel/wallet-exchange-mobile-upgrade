import Box from "@/components/general/Box";
import CryptoIcon from "@/components/general/CrptoIcon";
import CustomText from "@/components/general/CustomText";
import { PortfolioService } from "@/services/portfolio.service";
import { Rate } from "@/src/modules/market/domain/entities/models/token-history-model";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import { Dimensions, Pressable } from "react-native";
import { LineChart } from "react-native-chart-kit";

const SCREEN_WIDTH = Dimensions.get("window").width;

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
}) => {
  const theme = useTheme<Theme>();
  const [selectedPeriod, setSelectedPeriod] = useState(period);

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
          rate = rate / ngnSellRate;
        }
        return rate;
      });

      setChartKitData({ labels, datasets: [{ data: chartValues }] });
    }
  }, [data, currency, ngnSellRate]);

  // Period labels matching screenshot: "24h", "W" (week), "M" (month), "6M", "1Y"
  const periods = ["24h", "7D", "3M", "6M", "1Y"];
  const periodLabels: Record<string, string> = {
    "24h": "24h",
    "7D": "W",
    "3M": "M",
    "6M": "6M",
    "1Y": "1Y",
  };

  // Y-axis label formatting function
  const getYAxisLabels = () => {
    const data = chartKitData.datasets[0]?.data || [];
    if (!data.length) return [];

    let values = [...data];
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return [PortfolioService.formatBalanceCompact(max)];
    }

    const step = (max - min) / 4;

    return Array.from({ length: 5 }, (_, i) => {
      const value = max - step * i;
      return PortfolioService.formatBalanceCompact(value);
    });
  };

  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  // Enhanced chart config for modern, clean look (matching screenshot)
  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    fillShadowGradientFromOpacity: 0,
    fillShadowGradientToOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primaryColor,
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(255, 255, 255, ${opacity})`, // White labels
    strokeWidth: 3, // Thicker, smoother line
    style: {
      borderRadius: 0,
    },
    propsForDots: {
      r: "0", // No dots for cleaner look
      strokeWidth: "0",
      stroke: "transparent",
    },
    propsForBackgroundLines: {
      strokeWidth: 0, // No grid lines for cleaner look
      strokeDasharray: "",
      stroke: "transparent",
    },
  };

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
            {price}
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
      <Box height={240} marginBottom="m" borderRadius={16} overflow="hidden">
        {chartKitData.datasets[0].data.length > 0 ? (
          <Box
            width="100%"
            flexDirection="row"
            alignItems="center"
            position="relative"
          >
            {/* Chart area - minimal left padding to match screenshot */}
            <Box width="80%" overflow="hidden" alignItems="flex-start">
              <LineChart
                data={chartKitData}
                width={SCREEN_WIDTH - 100}
                height={220}
                yAxisSuffix=""
                withInnerLines={false}
                withOuterLines={false}
                withHorizontalLabels={false}
                withVerticalLabels={false}
                withDots={false}
                bezier
                transparent={true}
                segments={4}
                chartConfig={chartConfig}
                style={{
                  paddingRight: 0,
                  marginLeft: -20,
                  marginRight: 0,
                  borderRadius: 0,
                }}
              />
            </Box>
            {/* Y-axis labels on the right */}
            <Box
              width="20%"
              paddingLeft="s"
              height={220}
              justifyContent="space-between"
              alignItems="flex-end"
              paddingTop="s"
              paddingRight="s"
            >
              {getYAxisLabels().map((label, i) => (
                <CustomText
                  key={`y-axis-${i}`}
                  variant="body"
                  fontSize={12}
                  color="white"
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
            <CustomText color="white" fontSize={14} textAlign="center">
              No data available for the selected period
            </CustomText>
          </Box>
        )}
      </Box>

      {/* Period Selector - matching screenshot design */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        padding="s"
        gap="s"
      >
        {periods.map((p) => {
          const isActive = selectedPeriod === p && isPeriodAvailable(p);
          const displayLabel = periodLabels[p] || p;
          return (
            <Pressable
              key={p}
              onPress={() => handlePeriodChange(p)}
              disabled={!isPeriodAvailable(p)}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 10,
                backgroundColor: isActive
                  ? "rgba(35, 43, 15, 1)" // Vibrant green matching screenshot
                  : "transparent",
                opacity: !isPeriodAvailable(p) ? 0.8 : pressed ? 0.9 : 1,
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <CustomText
                fontSize={13}
                style={{
                  color: isActive
                    ? "rgba(199, 230, 77, 1)"
                    : theme.colors.placeholderTextColor,
                }}
                fontWeight={isActive ? "600" : "400"}
              >
                {displayLabel}
              </CustomText>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
};

export default TokenGraph;
