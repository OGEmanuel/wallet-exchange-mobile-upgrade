import { Box, CustomText } from "@/components/general";
import { SIZES } from "@/data";
import { TokenDetailModel } from "@/src/modules/market/domain/entities/models/token-detail-model";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useMemo, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import CurrencyTab from "./CurrencyTab";
import TimeFrame from "./TimeFrame";
import TokenImage from "./TokenImage";

// Mock interfaces and utilities (kept for potential future use)

// Utility function for currency conversion
const getApproximateAmount = (value: number, rate: number) => value * rate;

// const useAssetHistory = () => ({
//   history: [],
//   isFetchingHistory: false,
// });

// Mock utility functions
const formatAccountValue = ({
  value,
  currency,
  showSymbol,
  rate,
  convert,
  getApproximateAmount,
}: any) => {
  if (convert && currency === "NGN") {
    const ngnValue = getApproximateAmount(value, rate);
    return showSymbol
      ? `₦${ngnValue.toLocaleString()}`
      : ngnValue.toLocaleString();
  }
  return showSymbol ? `$${value.toLocaleString()}` : value.toLocaleString();
};

// const formatToSigFigMax6Digits = (value: number): string => {
//   try {
//     const absValue = Math.abs(value);
//     if (absValue === 0) return "0";
//     const sigFigValue = Number(absValue.toPrecision(3));
//     let formatted = sigFigValue.toString();
//     const digitsOnly = formatted.replace(".", "");
//     if (digitsOnly.length > 5) {
//       return sigFigValue.toExponential(2);
//     }
//     return formatted;
//   } catch {
//     return "0";
//   }
// };

interface AssetChartDetailsProps {
  tokenDetails: TokenDetailModel | null;
}

export default function AssetChartDetails({ tokenDetails }: AssetChartDetailsProps) {
  const theme = useTheme<Theme>();

  // Detect if we're in dark mode by checking theme colors
  const isDark = theme.colors.headerTextColor === "#FBFBFB"; // Dark theme text color

  // Fallback data when tokenDetails is not available
  const defaultTokenData = {
    name: "Bitcoin",
    symbol: "BTC", 
    logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    marketCap: 1100000000000, // 1.1T
    volume: 25000000000, // 25B
  };

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
  
  // Extract data from tokenDetails prop with fallbacks
  const tokenMetrics = useMemo(() => 
    tokenDetails?.tokenMetrics || {
      marketCap: defaultTokenData.marketCap,
      volume: defaultTokenData.volume,
    }, [tokenDetails?.tokenMetrics, defaultTokenData.marketCap, defaultTokenData.volume]
  );
  const tokenInfo = useMemo(() => 
    tokenDetails?.tokenDetails || {
      name: defaultTokenData.name,
      symbol: defaultTokenData.symbol,
      logo: defaultTokenData.logo,
    }, [tokenDetails?.tokenDetails, defaultTokenData.name, defaultTokenData.symbol, defaultTokenData.logo]
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

  // useEffect(() => {
  //   const generateDummyData = () => {
  //     // Use actual market cap as base price for chart, fallback to default
  //     const basePrice = tokenMetrics.marketCap ? tokenMetrics.marketCap / 1000000000 : 56500;
  //     let dataPoints = 20;
  //     let labelInterval = 4;
  //     let labelPrefix = "h";

  //     switch (timeRange) {
  //       case "24H":
  //         dataPoints = 24;
  //         labelInterval = 6;
  //         labelPrefix = "h";
  //         break;
  //       case "W":
  //         dataPoints = 7;
  //         labelInterval = 1;
  //         labelPrefix = "d";
  //         break;
  //       case "M":
  //         dataPoints = 30;
  //         labelInterval = 5;
  //         labelPrefix = "d";
  //         break;
  //       case "6M":
  //         dataPoints = 24;
  //         labelInterval = 4;
  //         labelPrefix = "w";
  //         break;
  //       case "1Y":
  //         dataPoints = 12;
  //         labelInterval = 2;
  //         labelPrefix = "m";
  //         break;
  //     }

  //     const labels = [];
  //     const data = [];

  //     for (let i = 0; i < dataPoints; i++) {
  //       // Create a smooth curve that goes up and down
  //       const variation =
  //         Math.sin((i / dataPoints) * Math.PI * 2) * 2000 +
  //         Math.sin((i / dataPoints) * Math.PI * 4) * 1000;
  //       data.push(basePrice + variation);

  //       // Only show labels for some points
  //       if (i % labelInterval === 0) {
  //         labels.push(`${i}${labelPrefix}`);
  //       } else {
  //         labels.push("");
  //       }
  //     }

  //     return { labels, data };
  //   };

  //   try {
  //     const { labels, data } = generateDummyData();

  //     setChartData({
  //       labels,
  //       datasets: [
  //         {
  //           data: data,
  //         },
  //       ],
  //     });
  //   } catch (error) {
  //     console.log("Error processing chart data:", error);
  //     const fallbackBasePrice = 56500;
  //     setChartData({
  //       labels: ["", "", "", "", "", "", ""],
  //       datasets: [
  //         {
  //           data: [fallbackBasePrice, fallbackBasePrice * 1.02, fallbackBasePrice * 1.05, fallbackBasePrice * 1.03, fallbackBasePrice * 0.98, fallbackBasePrice * 0.95, fallbackBasePrice],
  //         },
  //       ],
  //     });
  //   }
  // }, [timeRange, tokenMetrics]);

  // Calculate Y-axis labels based on the actual data
  const getYAxisLabels = () => {
    // Return fixed labels that match the image
    return ["40K", "30K", "20K", "10K"];
  };

    // Get the latest rate value for price display
    // const getLatestRate = (): number => {
    //   if (tokenDetails?.tokenHistory?.rates && tokenDetails.tokenHistory.rates.length > 0) {
    //     const lastRate = tokenDetails.tokenHistory.rates[tokenDetails.tokenHistory.rates.length - 1];
    //     const rateValue = (lastRate.rate || 0);
  
    //     if (selectedCurrency === 'NGN') {
    //       const sellRate = tokenDetails?.nairaCurrency?.sellRate;
    //       const isValidSellRate = sellRate && sellRate > 0;
  
    //       if (isValidSellRate) {
    //         return (rateValue || 1) / sellRate;
    //       } else {
    //         console.warn('NGN sellRate not available or invalid for latest rate, using USD rate');
    //         return rateValue;
    //       }
    //     }
  
    //     return rateValue;
    //   }
    //   return 0;
    // };

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
              uri={tokenInfo.logo} 
              name={tokenInfo.symbol} 
              size={24} 
            />
            <CustomText variant="bodySubheader" fontSize={20}>
              {tokenInfo.name}
            </CustomText>
          </Box>
          <Box>
            <CustomText variant="body" fontSize={14} color="success">
              {/* +{formatToSigFigMax6Digits(tokenMetrics.volume ? (tokenMetrics.volume / 1000000) : 2.5)}% */}
            </CustomText>
          </Box>
        </Box>

        <Box width="100%" flexDirection="row" justifyContent="space-between">
          <Box>
            <CustomText variant="bodyBold" fontSize={22} marginTop="s">
              {/* {formatAccountValue({
                value: tokenMetrics.marketCap ? tokenMetrics.marketCap / 1000000 : 56500,
                currency: selectedCurrency,
                showSymbol: true,
                rate: 1600,
                convert: true,
                getApproximateAmount: getApproximateAmount,
              })} */}
              {
                // getLatestRate()
              }
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
