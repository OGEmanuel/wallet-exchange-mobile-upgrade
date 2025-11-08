import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Currency } from "@/interfaces/account.interface";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import { setSellCurrency, setSellStage } from "@/src/modules/sell/presentation/state/sell-slice";
import { Theme } from "@/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ICurrency } from "@zap/blockchain-sdk";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { FlatList, Pressable, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch } from "react-redux";

// Helper function to get flag URL from currency code
const getFlagUrl = (code: string): string => {
  const flagMap: { [key: string]: string } = {
    NGN: "https://flagcdn.com/w40/ng.png",
    USD: "https://flagcdn.com/w40/us.png",
    GBP: "https://flagcdn.com/w40/gb.png",
    EUR: "https://flagcdn.com/w40/eu.png",
    CAD: "https://flagcdn.com/w40/ca.png",
    GHS: "https://flagcdn.com/w40/gh.png",
    KES: "https://flagcdn.com/w40/ke.png",
    ZAR: "https://flagcdn.com/w40/za.png",
  };
  return flagMap[code] || `https://flagcdn.com/w40/${code.toLowerCase().slice(0, 2)}.png`;
};

const SelectCurrencyStep = () => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();
  const { supportedCurrenciesForSwap, isLoading } = useSupportedCurrencies();

  // Filter and map fiat currencies from supportedCurrenciesForSwap
  const fiatCurrencies = useMemo(() => {
    if (!supportedCurrenciesForSwap || supportedCurrenciesForSwap.length === 0) {
      return [];
    }

    return supportedCurrenciesForSwap
      .filter((supportedCurrency) => {
        const currency = supportedCurrency.currencyId as Partial<ICurrency>;
        return currency && !currency.isCrypto;
      })
      .map((supportedCurrency) => {
        const currency = supportedCurrency.currencyId as Partial<ICurrency>;
        return {
          code: currency?.code || currency?.symbol || "",
          name: currency?.name || "",
          flag: currency?.logo || getFlagUrl(currency?.code || currency?.symbol || ""),
          country: "", // Required by Currency interface
        } as Currency;
      })
      .filter((currency) => currency.code && currency.name); // Filter out invalid entries
  }, [supportedCurrenciesForSwap]);

  const handleCurrencySelect = (currency: Currency) => {
    dispatch(setSellCurrency(currency));
    dispatch(setSellStage("amount"));
  };

  const handleBack = () => {
    dispatch(setSellStage("select-token"));
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
      >
        <Pressable onPress={handleBack}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
        <CustomText variant="medium" color="bodyTextColor">
          Sell To
        </CustomText>
        <Box width={30} />
      </Box>
      <Box bg="secondaryBackgroundColor" p="m" borderRadius={12} mt="m">
        {isLoading ? (
          <CustomText variant="body" color="disabledTextColor" textAlign="center" mt="m">
            Loading currencies...
          </CustomText>
        ) : fiatCurrencies.length === 0 ? (
          <CustomText variant="body" color="disabledTextColor" textAlign="center" mt="m">
            No fiat currencies available
          </CustomText>
        ) : (
          <FlatList
            data={fiatCurrencies}
            keyExtractor={(i) => i.code}
            style={{ marginTop: 16 }}
            renderItem={({ item }) => (
            <Pressable
              onPress={() => handleCurrencySelect(item)}
              style={{
                padding: 1,
                marginBottom: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{ uri: item.flag }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    marginRight: 12,
                  }}
                  contentFit="contain"
                />
                <View>
                  <CustomText variant="bodyBold">{item.code}</CustomText>
                  <CustomText variant="body" color="disabledTextColor">
                    {item.name}
                  </CustomText>
                </View>
              </View>
            </Pressable>
          )}
          />
        )}
      </Box>
    </BottomSheetView>
  );
};

export default SelectCurrencyStep;
