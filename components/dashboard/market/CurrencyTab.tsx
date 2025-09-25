import React from "react";
import { Pressable } from "react-native";

import { Box, CustomText } from "@/components/general";

interface CurrencyTabProps {
  selectedCurrency: "USD" | "NGN";
  setSelectedCurrency: React.Dispatch<React.SetStateAction<"USD" | "NGN">>;
}

const CurrencyTab: React.FC<CurrencyTabProps> = ({
  setSelectedCurrency,
  selectedCurrency,
}) => {
  const currencies = ["USD", "NGN"] as const;

  return (
    <Box
      flexDirection="row"
      bg="secondaryBackgroundColor"
      borderRadius={20}
      padding="s"
    >
      {currencies.map((currency) => (
        <Pressable
          key={currency}
          onPress={() => setSelectedCurrency(currency)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor:
              selectedCurrency === currency
                ? "rgba(196, 230, 77, 0.2)"
                : "transparent",
            borderWidth: selectedCurrency === currency ? 1 : 0,
            borderColor:
              selectedCurrency === currency ? "#C7E64D" : "transparent",
          }}
          android_ripple={{
            color: "rgba(255,255,255,0.1)",
            borderless: true,
          }}
        >
          <CustomText variant="body" fontSize={10} color="bodyTextColor">
            {currency}
          </CustomText>
        </Pressable>
      ))}
    </Box>
  );
};

export default CurrencyTab;
