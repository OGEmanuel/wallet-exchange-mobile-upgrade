import { router } from "expo-router";
import { ArrowDown3, ArrowUp3 } from "iconsax-react-nativejs";
import React from "react";
import { Pressable } from "react-native";

import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { formatToSigFigMax6Digits } from "@/lib/utils/market/helpers";
import { MarketTokenModel } from "@/src/modules/market/domain/entities/models/market-token-model";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import TokenImage from "./TokenImage";

interface MarketTableItemProps {
  item: MarketTokenModel | null;
  index: number;
  selectedCurrency: "USD" | "NGN";
  nairaCurrency?: CurrencyModel | null;
  usdCurrency?: CurrencyModel | null;
}

const MarketTableItem: React.FC<MarketTableItemProps> = ({
  item,
  index,
  selectedCurrency,
  nairaCurrency,
  usdCurrency,
}) => {
  const isPositive = item?.change24h && item.change24h > 0;

  const handleAssetPress = (asset: MarketTokenModel | null) => {
    router.push({
      pathname: "/dashboard/home/market/[id]",
      params: {
        id: asset?.currencyId?._id || "",
        asset: JSON.stringify(asset),
      },
    });
  };

  // Helper function for approximate amount formatting
  const getApproximateAmount = (
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

  // Format price with commas and fixed decimals
  const formatPrice = (price?: number | null): string => {
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

  return (
    <Pressable
      onPress={() => handleAssetPress(item)}
      android_ripple={{
        color: "rgba(255,255,255,0.1)",
        borderless: true,
      }}
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="m"
        paddingVertical="m"
      >
        <Box flexDirection="row" alignItems="center" gap="s">
          <CustomText variant="body" fontSize={12} color="bodyTextColor">
            {index + 1}
          </CustomText>
          <Box flexDirection="row" gap="s" paddingLeft="s" alignItems="center">
            <TokenImage
              uri={item?.currencyId?.logo}
              name={item?.symbol}
              size={20}
            />
            <CustomText
              variant="bodyMedium"
              fontSize={12}
              color="bodyTextColor"
            >
              {item?.symbol}
            </CustomText>
          </Box>
        </Box>

        <Box flexDirection="row" alignItems="center" gap="l">
          <CustomText variant="body" fontSize={12} color="bodyTextColor">
            {formatPrice(item?.rate)}
          </CustomText>
          <Box
            flexDirection="row"
            gap="s"
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
              {formatToSigFigMax6Digits(item?.change24h || 0) || 0}%
            </CustomText>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
};

export default MarketTableItem;
