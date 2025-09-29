import { router } from "expo-router";
import { ArrowDown3, ArrowUp3 } from "iconsax-react-nativejs";
import React from "react";
import { Pressable } from "react-native";

import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import TokenImage from "./TokenImage";

interface MarketTableItemProps {
  item: any;
  index: number;
}

export function formatToSigFigMax6Digits(value: number): string {
  try {
    // Take absolute value to remove negative sign
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
}

const MarketTableItem: React.FC<MarketTableItemProps> = ({ item, index }) => {
  const isPositive = item.change24h > 0;

  const handleAssetPress = (asset: any) => {
    router.push({
      pathname: "/dashboard/home/market/[id]",
      params: {
        id: asset.id || index.toString(),
        asset: JSON.stringify(asset),
      },
    });
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
            <TokenImage uri={item.logo} name={item.symbol} size={20} />
            <CustomText
              variant="bodyMedium"
              fontSize={12}
              color="bodyTextColor"
            >
              {item.symbol}
            </CustomText>
          </Box>
        </Box>

        <Box flexDirection="row" alignItems="center" gap="l">
          <CustomText variant="body" fontSize={12} color="bodyTextColor">
            ${item.price.toLocaleString()}
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
              {formatToSigFigMax6Digits(item?.change24h || 0)}%
            </CustomText>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
};

export default MarketTableItem;
