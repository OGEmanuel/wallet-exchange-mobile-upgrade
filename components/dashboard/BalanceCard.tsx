import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowUp3 } from "iconsax-react-nativejs";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import ThemedText from "../general/ThemedText";

const BalanceCard = () => {
  const theme = useTheme<Theme>();
  return (
    <Box width="100%" height={120} alignItems="center">
      <CustomText fontSize={12} variant="body">
        Your portfolio value
      </CustomText>

      <ThemedText
        type="subtitle"
        style={{ fontSize: 32, marginTop: 24, marginBottom: 16 }}
        color={theme.colors.bodyTextColor}
      >
        $123,390.00
      </ThemedText>

      <Box
        width={126}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        height={24}
        borderRadius={24}
        paddingHorizontal="s"
        style={{ backgroundColor: "#FFFFFF33" }}
      >
        <ArrowUp3 size={15} color="#35B592" variant="Bold" />
        <CustomText fontSize={10} style={{ marginHorizontal: 3 }}>
          $250
        </CustomText>

        <CustomText fontSize={10}>
          {" "}
          <CustomText fontSize={10} style={{ color: "#35B592" }}>
            +5%
          </CustomText>{" "}
          in 24H
        </CustomText>
      </Box>
    </Box>
  );
};

export default BalanceCard;
