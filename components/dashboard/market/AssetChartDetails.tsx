import { Box, CustomText } from "@/components/general";
import { SIZES } from "@/data";
import React, { useEffect, useState } from "react";
import { LineChart } from "react-native-chart-kit";
import CurrencyTab from "./CurrencyTab";
import TimeFrame from "./TimeFrame";
import TokenImage from "./TokenImage";

// Mock interfaces and utilities
interface MarketData {
  date: string;
  value: number;
}

// Mock hooks
const useAppSelector = (selector: (state: any) => any) => ({
  rate: 56500,
  dailyChange: 2.5,
  currencyId: {
    logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
});

const useAppUtilities = () => ({
  getApproximateAmount: (value: number, rate: number) => value * rate,
});

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

const formatToSigFigMax6Digits = (value: number): string => {
  try {
    const absValue = Math.abs(value);
    if (absValue === 0) return "0";
    const sigFigValue = Number(absValue.toPrecision(3));
    let formatted = sigFigValue.toString();
    const digitsOnly = formatted.replace(".", "");
    if (digitsOnly.length > 5) {
      return sigFigValue.toExponential(2);
    }
    return formatted;
  } catch (error) {
    return "0";
  }
};

// Mock chart config
const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(96, 69, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#6045FF",
  },
};

export default function AssetChartDetails() {
  // Use passed asset data instead of directly accessing via useParams
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "NGN">(
    "USD"
  );
  // const { history, isFetchingHistory } = useAssetHistory();

  const params = useAppSelector((state) => state.market.selectedAsset);

  // console.log("params:", params);
  const [timeRange, setTimeRange] = useState("24H");
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  });

  // Function to filter history based on time range
  const filterHistoryByTimeRange = (data: MarketData[], range: string) => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let filteredData = [...data];

    try {
      switch (range) {
        case "24H":
          // Last 24 hours
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.date);
            return now.getTime() - itemDate.getTime() <= 24 * 60 * 60 * 1000;
          });
          break;
        case "W":
          // Last week
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.date);

            return (
              now.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000
            );
          });

          break;
        case "M":
          // Last month
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.date);
            return (
              now.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000
            );
          });

          break;
        case "6M":
          // Last 6 months
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.date);
            return (
              now.getTime() - itemDate.getTime() <= 180 * 24 * 60 * 60 * 1000
            );
          });

          break;
        case "1Y":
          // Last year
          filteredData = data.filter((item) => {
            const itemDate = new Date(item.date);
            return (
              now.getTime() - itemDate.getTime() <= 365 * 24 * 60 * 60 * 1000
            );
          });
          break;
      }
    } catch (error) {
      console.log("Error filtering data:", error);
      return data; // Return all data if there's an error
    }

    return filteredData;
  };

  // Format date based on time range
  const formatDateByTimeRange = (date: Date, range: string) => {
    try {
      switch (range) {
        case "24H":
          return date.getHours() + ":00";
        case "W":
          return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
            date.getDay()
          ];
        case "M":
        case "6M":
          return date.getDate() + "/" + (date.getMonth() + 1);
        case "1Y":
          return (
            date.getMonth() +
            1 +
            "/" +
            date.getFullYear().toString().substr(2, 2)
          );
        default:
          return "";
      }
    } catch (error) {
      console.log("Error formatting date:", error);
      return "";
    }
  };

  const TIME_RANGES = ["24H", "W", "M", "6M", "1Y"];

  // Determine which time ranges have data - for now, all have data
  const timeRangeDataMap = TIME_RANGES.map((range) => ({
    range,
    hasData: true,
  }));

  useEffect(() => {
    const generateDummyData = () => {
      const basePrice = 56500;
      let dataPoints = 20;
      let labelInterval = 4;
      let labelPrefix = "h";

      switch (timeRange) {
        case "24H":
          dataPoints = 24;
          labelInterval = 6;
          labelPrefix = "h";
          break;
        case "W":
          dataPoints = 7;
          labelInterval = 1;
          labelPrefix = "d";
          break;
        case "M":
          dataPoints = 30;
          labelInterval = 5;
          labelPrefix = "d";
          break;
        case "6M":
          dataPoints = 24;
          labelInterval = 4;
          labelPrefix = "w";
          break;
        case "1Y":
          dataPoints = 12;
          labelInterval = 2;
          labelPrefix = "m";
          break;
      }

      const labels = [];
      const data = [];

      for (let i = 0; i < dataPoints; i++) {
        // Create a smooth curve that goes up and down
        const variation =
          Math.sin((i / dataPoints) * Math.PI * 2) * 2000 +
          Math.sin((i / dataPoints) * Math.PI * 4) * 1000;
        data.push(basePrice + variation);

        // Only show labels for some points
        if (i % labelInterval === 0) {
          labels.push(`${i}${labelPrefix}`);
        } else {
          labels.push("");
        }
      }

      return { labels, data };
    };

    try {
      const { labels, data } = generateDummyData();

      setChartData({
        labels,
        datasets: [
          {
            data: data,
          },
        ],
      });
    } catch (error) {
      console.log("Error processing chart data:", error);
      setChartData({
        labels: ["", "", "", "", "", "", ""],
        datasets: [
          {
            data: [56500, 57000, 58000, 57500, 56000, 55000, 56500],
          },
        ],
      });
    }
  }, [timeRange]);

  // Calculate Y-axis labels based on the actual data
  const getYAxisLabels = () => {
    // Return fixed labels that match the image
    return ["40K", "30K", "20K", "10K"];
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return Math.round(value / 1000000) + "M";
    } else if (value >= 1000) {
      return Math.round(value / 1000) + "k";
    }
    return Math.round(value).toString();
  };

  const { getApproximateAmount } = useAppUtilities();

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
            <TokenImage uri={params?.currencyId?.logo} name="BTC" size={24} />
            <CustomText variant="bodySubheader" fontSize={20}>
              Bitcoin
            </CustomText>
          </Box>
          <Box>
            <CustomText variant="body" fontSize={14} color="success">
              +{formatToSigFigMax6Digits(params?.dailyChange ?? 0)}%
            </CustomText>
          </Box>
        </Box>

        <Box width="100%" flexDirection="row" justifyContent="space-between">
          <Box>
            <CustomText variant="bodyBold" fontSize={22} marginTop="s">
              {formatAccountValue({
                value: params?.rate ?? 56500,
                currency: selectedCurrency,
                showSymbol: true,
                rate: 1600,
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
