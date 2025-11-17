import { Href, useRouter } from "expo-router";
import React, { memo, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import icons from "../../assets/icons";
import { CryptoData } from "../../interfaces/account.interface";
import { useAppDispatch, useAppSelector, useAppUtilities } from "../hooks";
import {
  Currency,
  formatAccountValue,
  formatToSigFigMax6Digits,
} from "../utils/cryptoHelpers";
import TokenImage from "./TokenImage";

function TableItem({
  data,
  number,
  selectedCurrency,
  onPress,
}: {
  data: CryptoData;
  number: number;
  selectedCurrency: Currency;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isPositive = data?.change24h > 0;
  const nairaRate = useAppSelector((state: any) => state.currency.nairaRate);
  const ngnRate = nairaRate ? 1 / nairaRate : 0;
  const { getApproximateAmount } = useAppUtilities();

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();
    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start();
  }, [fadeAnim, translateY]);

  // Format price based on selected currency
  const formattedPrice = formatAccountValue({
    value: data?.rate || 0,
    currency: selectedCurrency,
    convert: true,
    rate: ngnRate,
    showSymbol: true,
    getApproximateAmount: getApproximateAmount,
  });

  const handlePress = (event: GestureResponderEvent) => {
    router.push({
      pathname: "/modules/markets/AssetInfo",
      params: { asset: JSON.stringify(data) },
    } as Href);
    // if (onPress) onPress(event);
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        className="flex-row justify-between px-[16px] h-[41px]"
      >
        <View className="flex-row items-center gap-[8px]">
          <Text className="w-[16px]">{number}</Text>
          <View className="flex-row gap-[8px] pl-[8px]">
            <View className="w-[16px] h-[16px] rounded-[8px] bg-card items-center justify-center">
              <TokenImage
                size={16}
                uri={data?.currencyId?.logo}
                name={data?.currencyId?.symbol}
              />
            </View>

            <Text>{data?.symbol}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-[24px]">
          <Text>{formattedPrice}</Text>
          <View className="flex-row gap-[4px] items-center w-[60px] justify-end">
            <Image
              source={isPositive ? icons.evaArrowUp : icons.evaArrowDown}
              className="w-[8px] h-[5px]"
              resizeMode="contain"
            />
            <Text
              allowFontScaling={true}
              className={`${isPositive ? "text-success" : "text-error"}`}
            >
              {formatToSigFigMax6Digits(data?.change24h || 0)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default memo(TableItem);
