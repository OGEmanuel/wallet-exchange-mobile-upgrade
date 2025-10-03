import { router } from "expo-router";
import { ArrowDown3, ArrowUp3 } from "iconsax-react-nativejs";
import React from "react";
import { Pressable } from "react-native";

import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { formatToSigFigMax6Digits } from "@/lib/utils/market/helpers";
import { formatPrice } from "@/lib/utils/market/priceFormatter";
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

  // Use shared formatPrice function
  const formattedPrice = formatPrice(
    item?.rate,
    selectedCurrency,
    nairaCurrency,
    usdCurrency
  );

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
            {formattedPrice}
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
