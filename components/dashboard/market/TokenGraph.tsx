import Box from "@/components/general/Box";
import CryptoIcon from "@/components/general/CrptoIcon";
import CustomText from "@/components/general/CustomText";
import { Rate } from "@/src/modules/market/domain/entities/models/token-history-model";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useMemo, useState } from "react";
import { Dimensions, Pressable } from "react-native";
import { LineChart } from "react-native-gifted-charts";

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
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const periods = ["24h", "7D", "3M", "6M", "1Y"];

  // Format rates data for chart
  const chartData = useMemo((): TokenData[] => {
    if (!data || data.length === 0) return [];

    // Convert rates to chart data format
    const formattedData = data.map((rate, index) => {
      let value = rate.rate || 0;

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

    return formattedData;
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
      <Box height={220} marginBottom="m">
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            width={SCREEN_WIDTH - 80}
            height={200}
            spacing={Math.max(40, (SCREEN_WIDTH - 120) / chartData.length)}
            color={theme.colors.primaryColor}
            thickness={2}
            startFillColor={theme.colors.primaryColor}
            endFillColor="transparent"
            startOpacity={0.3}
            endOpacity={0.1}
            initialSpacing={10}
            noOfSections={4}
            yAxisColor={theme.colors.placeholderTextColor}
            xAxisColor={theme.colors.placeholderTextColor}
            yAxisTextStyle={{
              color: theme.colors.placeholderTextColor,
              fontSize: 10,
            }}
            xAxisLabelTextStyle={{
              color: theme.colors.placeholderTextColor,
              fontSize: 10,
              width: 50,
            }}
            hideDataPoints={chartData.length > 20}
            dataPointsColor={theme.colors.primaryColor}
            dataPointsRadius={4}
            curved
            areaChart
            hideRules
            yAxisExtraHeight={20}
            formatYLabel={(value) => {
              const numValue = parseFloat(value);
              return formatCurrencyValue(numValue, currency);
            }}
            onPress={(item: any, index: number) => {
              setHoveredValue(item.value);
            }}
            showVerticalLines={false}
            verticalLinesColor="rgba(255,255,255,0.1)"
            rulesColor="rgba(255,255,255,0.05)"
            rulesType="solid"
            pointerConfig={{
              pointerStripHeight: 200,
              pointerStripColor: theme.colors.primaryColor,
              pointerStripWidth: 2,
              pointerColor: theme.colors.primaryColor,
              radius: 6,
              pointerLabelWidth: 120,
              pointerLabelHeight: 60,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: any) => {
                const item = items[0];
                return (
                  <Box
                    backgroundColor="mainBackgroundColor"
                    padding="s"
                    borderRadius={8}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
            <CustomText
              fontSize={14}
              color="headerTextColor"
              fontWeight="bold"
            >
              {formatCurrencyValue(item.value, currency)}
            </CustomText>
                    <CustomText fontSize={10} color="placeholderTextColor">
                      {item.label}
                    </CustomText>
                  </Box>
                );
              },
            }}
          />
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

