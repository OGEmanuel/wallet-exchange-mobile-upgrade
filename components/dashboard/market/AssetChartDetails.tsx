import { Box, CustomText } from "@/components/general";
import { SIZES } from "@/data";
import {
  formatAccountValue,
  formatToSigFigMax6Digits,
  getApproximateAmount,
} from "@/lib/utils/market/helpers";
import { MarketTokenModel } from "@/src/modules/market/domain/entities/models/market-token-model";
import { TokenDetailModel } from "@/src/modules/market/domain/entities/models/token-detail-model";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { LineChart } from "react-native-chart-kit";
import CurrencyTab from "./CurrencyTab";
import TimeFrame from "./TimeFrame";
import TokenImage from "./TokenImage";

interface AssetChartDetailsProps {
  tokenDetails: TokenDetailModel | null;
  asset?: MarketTokenModel | null;
}

export default function AssetChartDetails({
  tokenDetails,
  asset,
}: AssetChartDetailsProps) {
  const theme = useTheme<Theme>();
  // console.log("asset", asset);
  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB"; // Dark theme text color

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

  // Use passed token details data
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "NGN">(
    "USD"
  );

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
    return ["40K", "30K", "20K", "10K"];
  };

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
              uri={tokenDetails?.tokenDetails?.logo}
              name={tokenDetails?.tokenDetails?.symbol}
              size={24}
            />
            <CustomText variant="bodySubheader" fontSize={20}>
              {tokenDetails?.tokenDetails?.name}
            </CustomText>
          </Box>
          <Box>
            <CustomText variant="body" fontSize={14} color="success">
              {formatToSigFigMax6Digits(asset?.dailyChange || 1)}%
            </CustomText>
          </Box>
        </Box>

        <Box width="100%" flexDirection="row" justifyContent="space-between">
          <Box>
            <CustomText variant="bodyBold" fontSize={22} marginTop="s">
              {formatAccountValue({
                value: asset?.rate || 1,
                currency: selectedCurrency,
                showSymbol: true,
                rate: asset?.rate || 1,
                convert: true,
                getApproximateAmount: getApproximateAmount,
              })}
            </CustomText>
            <CurrencyTab
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
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
            <Box width="90%" alignItems="center">
              <LineChart
                data={chartData}
                width={SIZES.width - 150}
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
              width="10%"
              paddingLeft="s"
              height={180}
              justifyContent="space-between"
            >
              {getYAxisLabels().map((label, i) => (
                <CustomText
                  key={`y-axis-${i}`}
                  variant="body"
                  fontSize={12}
                  color="disabledTextColor"
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

      {/* <Loader visible={isFetchingHistory || chartData.labels.length === 0} /> */}
    </Box>
  );
}
