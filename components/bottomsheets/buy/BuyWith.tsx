import { Box, CustomText } from "@/components/general";
import { currencies } from "@/data";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { Currency } from "@/interfaces/account.interface";
import {
  setBuyCurrency,
  setBuyStage,
} from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";

const TokenCard = ({ currency }: { currency: Currency }) => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { sendTokenRef: bottomsheetRef } = useBottomSheetRefs();
  const handleClick = () => {
    bottomsheetRef.current?.close();
    dispatch(setBuyStage("buy"));
    dispatch(setBuyCurrency(currency));
  };
  return (
    <Pressable
      onPress={handleClick}
      style={{
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Box flex={1} flexDirection="row" alignItems="center">
        <Box
          width={40}
          height={40}
          borderRadius={40}
          //   bg="mainBackgroundColor"
          //   justifyContent="center"
          //   alignItems="center"
          overflow="hidden"
        >
          <CustomText fontSize={35}>{currency.flag}</CustomText>
        </Box>
        <Box ml="s">
          <CustomText fontSize={12} variant="medium">
            {currency.code}
          </CustomText>
          <CustomText fontSize={10} style={{ marginTop: 2 }}>
            {currency.name}
          </CustomText>
        </Box>
      </Box>
    </Pressable>
  );
};

const BuyWith = () => {
  const theme = useTheme<Theme>();

  return (
    <Box flex={0.75} paddingBottom="l" paddingHorizontal="m">
      <CustomText variant="subheader" fontSize={16} mt="m" textAlign="center">
        Buy With
      </CustomText>
      <ScrollView
        style={{
          backgroundColor: theme.colors.secondaryBackgroundColor,
          marginTop: 20,
          borderRadius: 12,
        }}
        contentContainerStyle={{
          paddingBottom: 100,

          padding: 10,
        }}
      >
        {currencies.map((item, index) => (
          <TokenCard key={`token-${item.code}-${index}`} currency={item} />
        ))}
      </ScrollView>
    </Box>
  );
};

export default BuyWith;
