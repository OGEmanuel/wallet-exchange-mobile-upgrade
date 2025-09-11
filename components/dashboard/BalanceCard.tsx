import { View, Text } from "react-native";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import { ArrowUp3 } from "iconsax-react-nativejs";

const BalanceCard = () => {
  return (
    <Box width="100%" height={120} alignItems="center">
      <CustomText fontSize={12} variant="body">
        Your portfolio value
      </CustomText>

      <CustomText variant="header" marginVertical="s">
        $123,390.00
      </CustomText>

      <Box
        width={126}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        height={24}
        borderRadius={24}
        paddingHorizontal="s"
        bg="secondaryBackgroundColor"
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
