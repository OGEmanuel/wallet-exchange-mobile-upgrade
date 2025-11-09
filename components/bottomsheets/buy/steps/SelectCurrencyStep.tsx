import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import { Box, CustomText } from "@/components/general";
import { Currency } from "@/interfaces/account.interface";
import { useSupportedCurrencies } from "@/src/core/supported-currencies/supported-currencies-context";
import {
  setBuyCurrency,
  setBuyStage,
} from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { ICurrency } from "@zap/blockchain-sdk";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
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

interface FiatCurrency {
  code: string;
  name: string;
  url: string;
}

const TokenCard = ({ currency, onSelect }: { currency: FiatCurrency; onSelect: () => void }) => {
  return (
    <Pressable
      onPress={onSelect}
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
          source={{ uri: currency.url || getFlagUrl(currency.code) }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            marginRight: 12,
          }}
          contentFit="contain"
        />
        <View>
          <CustomText variant="bodyBold">{currency.code}</CustomText>
          <CustomText variant="body" color="disabledTextColor">
            {currency.name}
          </CustomText>
        </View>
      </View>
    </Pressable>
  );
};

const SelectCurrencyStep = () => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();
  const { supportedCurrenciesForSwap, isLoading } = useSupportedCurrencies();

  const handleBack = () => {
    dispatch(setBuyStage("crypto_select"));
  };

  // Filter and map fiat currencies from supportedCurrenciesForSwap
  const fiatCurrencies = useMemo(() => {
    if (!supportedCurrenciesForSwap || supportedCurrenciesForSwap.length === 0) {
      return [];
    }

    return supportedCurrenciesForSwap
      .filter((supportedCurrency: any) => {
        const currency = supportedCurrency.currencyId as Partial<ICurrency>;
        return currency && !currency.isCrypto;
      })
      .map((supportedCurrency: any) => {
        const currency = supportedCurrency.currencyId as Partial<ICurrency>;
        return {
          code: currency?.code || currency?.symbol || "",
          name: currency?.name || "",
          url: currency?.logo || getFlagUrl(currency?.code || currency?.symbol || ""),
        } as FiatCurrency;
      })
      .filter((currency: FiatCurrency) => currency.code && currency.name); // Filter out invalid entries
  }, [supportedCurrenciesForSwap]);

  const handleCurrencySelect = (currency: FiatCurrency) => {
    // Convert to Currency format for Redux state
    const currencyForState: Currency = {
      code: currency.code,
      name: currency.name,
      flag: currency.url || getFlagUrl(currency.code), // Use url as flag for display
      country: "", // Required by Currency interface
    };
    dispatch(setBuyStage("buy"));
    dispatch(setBuyCurrency(currencyForState));
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
          Buy With
        </CustomText>
        <Box width={30} />
      </Box>
      <Box bg="secondaryBackgroundColor" borderRadius={12} mt="m" flex={1} overflow="hidden">
        {isLoading ? (
          <Box p="m">
            <CustomText variant="body" color="disabledTextColor" textAlign="center" mt="m">
              Loading currencies...
            </CustomText>
          </Box>
        ) : fiatCurrencies.length === 0 ? (
          <Box p="m">
            <CustomText variant="body" color="disabledTextColor" textAlign="center" mt="m">
              No fiat currencies available
            </CustomText>
          </Box>
        ) : (
          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
          >
            {fiatCurrencies.map((item: FiatCurrency) => (
              <TokenCard
                key={item.code}
                currency={item}
                onSelect={() => handleCurrencySelect(item)}
              />
            ))}
          </BottomSheetScrollView>
        )}
      </Box>
    </BottomSheetView>
  );
};

export default SelectCurrencyStep;
