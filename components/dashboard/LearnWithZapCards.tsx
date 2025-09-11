import { View, Text } from "react-native";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import CustomButton from "../general/CustomButton";
import { LinearGradient } from "expo-linear-gradient";

const LearnWithZapCards = () => {
  return (
    <Box
      width={279}
      height={116}
      borderRadius={8}
      backgroundColor="secondaryBackgroundColor"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      p="m"
      marginRight="m"
      borderWidth={0.5}
      borderColor="disabledTextColor"
    >
      <Box width={"70%"}>
        <CustomText variant="medium" fontSize={14}>
          Learn with Zap
        </CustomText>
        <CustomText fontSize={12} variant="light" marginVertical="s">
          We help you get valueable crypto education
        </CustomText>
        <CustomButton
          text="Start"
          fontSize={10}
          onPress={() => {}}
          width={61}
          height={30}
          borderRadius={50}
        />
      </Box>

      <LinearGradient
        colors={["#FFDFFE", "#939393"]}
        style={{ width: 70, height: 72, borderRadius: 4 }}
      ></LinearGradient>
    </Box>
  );
};

export default LearnWithZapCards;
