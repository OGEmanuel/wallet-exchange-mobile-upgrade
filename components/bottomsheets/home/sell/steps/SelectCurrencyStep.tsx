import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Currency, SellFlowProps } from "@/types/sell.types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import React from "react";
import { FlatList, Pressable, View } from "react-native";

const CURRENCIES: Currency[] = [
  {
    code: "NGN",
    name: "Nigerian Naira",
    url: "https://flagcdn.com/w40/ng.png",
  },
  {
    code: "USD",
    name: "United States Dollar",
    url: "https://flagcdn.com/w40/us.png",
  },
  {
    code: "GBP",
    name: "British Pound Sterling",
    url: "https://flagcdn.com/w40/gb.png",
  },
  { code: "EUR", name: "Euro", url: "https://flagcdn.com/w40/eu.png" },
  {
    code: "CAD",
    name: "Canadian Dollar",
    url: "https://flagcdn.com/w40/ca.png",
  },
];

const SelectCurrencyStep: React.FC<SellFlowProps> = ({
  onNext,
  setSelectedCurrency,
}) => {
  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    onNext("amount");
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}>
      <CustomText variant="medium" textAlign="center">
        Sell To
      </CustomText>
      <Box bg="secondaryBackgroundColor" p="m" borderRadius={12} mt="m">
        <FlatList
          data={CURRENCIES}
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
                  source={{ uri: item.url }}
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
      </Box>
    </BottomSheetView>
  );
};

export default SelectCurrencyStep;
