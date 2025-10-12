import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { setBuyStage } from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronRight, Search } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { useDispatch } from "react-redux";

const TokenCard = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { sendTokenRef: bottomsheetRef } = useBottomSheetRefs();
  const handleClick = () => {
    bottomsheetRef.current?.close();
    dispatch(setBuyStage("currency_select"));
  };
  return (
    <Pressable
      onPress={handleClick}
      style={{
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <Box flex={1} flexDirection="row" alignItems="center">
        <Box
          width={40}
          height={40}
          borderRadius={40}
          bg="mainBackgroundColor"
        ></Box>
        <Box ml="s">
          <CustomText fontSize={12} variant="medium">
            USDT
          </CustomText>
          <CustomText fontSize={10} style={{ marginTop: 2 }}>
            4.2 USDT-SPL
          </CustomText>
        </Box>
      </Box>
      <CustomText>$1000</CustomText>
    </Pressable>
  );
};

const Tokens = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();

  return (
    <Box flex={1} paddingBottom="l" paddingHorizontal="m">
      <CustomInputWithoutForm
        value=""
        onChange={(e) => console.log(e)}
        iconLeft={<Search color={theme.colors.bodyTextColor} />}
        placeholder="Search token"
        style={{}}
      />

      <Pressable
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
        onPress={() => dispatch(setBuyStage("chains"))}
      >
        <CustomText>Chains</CustomText>
        <Box flexDirection="row" alignItems="center">
          <Image
            source={require("@/assets/images/chains.png")}
            style={{ width: 100, height: 30 }}
            contentFit="contain"
          />
          <ChevronRight color={theme.colors.bodyTextColor} />
        </Box>
      </Pressable>

      <CustomText variant="medium" fontSize={16} mt="m">
        Your tokens
      </CustomText>
      <BottomSheetScrollView
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
        {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 1]).map((item, index) => (
          <TokenCard key={`token-${item}-${index}`} />
        ))}
      </BottomSheetScrollView>
    </Box>
  );
};

export default Tokens;
