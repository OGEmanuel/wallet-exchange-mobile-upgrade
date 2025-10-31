import { Box, CustomText } from "@/components/general";
import { SIZES } from "@/data";
import { formatToSigFigMax6Digits } from "@/lib/utils/market/helpers";
import { formatPrice } from "@/lib/utils/market/priceFormatter";
import { MarketTokenModel } from "@/src/modules/market/domain/entities/models/market-token-model";
import { TokenDetailModel } from "@/src/modules/market/domain/entities/models/token-detail-model";
import { TokenHistoryDetailModel } from "@/src/modules/market/domain/entities/models/token-history-model";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowDown3, ArrowUp3 } from "iconsax-react-nativejs";
import React, { useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import CurrencyTab from "./CurrencyTab";
import TimeFrame from "./TimeFrame";
import TokenImage from "./TokenImage";

interface AssetChartDetailsProps {
  tokenDetails: TokenDetailModel | null;
  asset?: MarketTokenModel | null;
  nairaCurrency?: CurrencyModel | null;
  usdCurrency?: CurrencyModel | null;
  tokenHistory?: TokenHistoryDetailModel | null;
  selectedCurrency?: "USD" | "NGN";
  onCurrencyChange?: (currency: "USD" | "NGN") => void;
}

export default function AssetChartDetails({
  tokenDetails,
  asset,
  nairaCurrency,
  usdCurrency,
  tokenHistory,
  selectedCurrency: propSelectedCurrency,
  onCurrencyChange,
}: AssetChartDetailsProps) {
  const theme = useTheme<Theme>();
  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB"; // Dark theme text color

  // Use passed token details data
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "NGN">(
    propSelectedCurrency || "USD"
  );

  useEffect(() => {
    if (tokenHistory?.rates && Array.isArray(tokenHistory?.rates)) {
      const sortedHistory = [...tokenHistory.rates].sort(
        (a, b) => Number(a.date ?? 0) - Number(b.date ?? 0)
      );
      const labels = sortedHistory.map((item) =>
        new Date(Number(item.date)).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      const data = sortedHistory.map((item) => item.rate ?? 0);

      setChartData({ labels, datasets: [{ data }] });
    }
  }, [tokenHistory, selectedCurrency]); // Added selectedCurrency to trigger Y-axis update

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

  // Update local state when prop changes
  useEffect(() => {
    if (propSelectedCurrency) {
      setSelectedCurrency(propSelectedCurrency);
    }
  }, [propSelectedCurrency]);

  const [timeRange, setTimeRange] = useState("24H");
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  const TIME_RANGES = ["24H", "W", "M", "6M", "1Y"];

  // Determine which time ranges have data - for now, all have data
  const timeRangeDataMap = TIME_RANGES.map((range) => ({
    range,
    hasData: true,
  }));

  const getYAxisLabels = () => {
    const data = chartData.datasets[0]?.data || [];
    if (!data.length) return [];

    let values = [...data];
    
    // Convert to NGN if needed
    if (selectedCurrency === "NGN" && nairaCurrency?.sellRate) {
      values = values.map(v => v / nairaCurrency.sellRate!);
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return [formatCompactCurrency(max, selectedCurrency)];
    }

    const step = (max - min) / 4;

    return Array.from({ length: 5 }, (_, i) => {
      const value = max - step * i;
      return formatCompactCurrency(value, selectedCurrency);
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

  const isPositive = asset?.change24h && asset.change24h > 0;

  return (
    <Box width="100%" paddingHorizontal="m">
      <Box
        bg="secondaryBackgroundColor"
        height={383}
        borderRadius={16}
        marginTop="m"
        padding="m"
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box flexDirection="row" alignItems="center" gap="s">
            <TokenImage
              uri={tokenDetails?.tokenDetails?.logo || asset?.currencyId?.logo}
              name={tokenDetails?.tokenDetails?.symbol}
              size={24}
            />
            <CustomText variant="bodySubheader" fontSize={20}>
              {tokenDetails?.tokenDetails?.name || asset?.currencyId?.name}
            </CustomText>
          </Box>
          <Box
            flexDirection="row"
            style={{ gap: 3 }}
            alignItems="center"
            width={60}
            justifyContent="flex-end"
          >
            {isPositive ? (
              <ArrowUp3 size={8} color="#16A34A" variant="Bold" />
            ) : (
              <ArrowDown3 size={8} color="#DC2626" variant="Bold" />
            )}
            <CustomText
              variant="bodyMedium"
              fontSize={12}
              color={isPositive ? "success" : "error"}
            >
              {formatToSigFigMax6Digits(asset?.change24h || 0) || 0}%
            </CustomText>
          </Box>
        </Box>

        <Box width="100%" flexDirection="row" justifyContent="space-between">
          <Box>
            <CustomText variant="bodyBold" fontSize={22} marginTop="s">
              {formatPrice(
                asset?.rate,
                selectedCurrency,
                nairaCurrency,
                usdCurrency
              )}
            </CustomText>
            <CurrencyTab
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={onCurrencyChange ? 
                ((currency: React.SetStateAction<"USD" | "NGN">) => {
                  if (typeof currency === 'string') {
                    onCurrencyChange(currency);
                  }
                }) as React.Dispatch<React.SetStateAction<"USD" | "NGN">>
                : setSelectedCurrency
              }
            />
          </Box>
          <Box alignItems="flex-end">
            <CustomText variant="body" fontSize={14} color="disabledTextColor">
              past 24 hours
            </CustomText>
          </Box>
        </Box>

        {/* Chart */}
        <Box width="100%" alignItems="center">
          <Box width="100%" flexDirection="row" alignItems="center">
            <Box width="82%" alignItems="center">
              <LineChart
                data={chartData}
                width={SIZES.width - 180}
                height={250}
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
        </Box>

        <Box
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
          position="absolute"
          bottom={16}
          alignSelf="center"
        >
          {timeRangeDataMap.map(({ range, hasData }) => (
            <TimeFrame
              key={range}
              active={timeRange === range}
              onPress={() => setTimeRange(range)}
              range={range}
              disabled={!hasData}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
