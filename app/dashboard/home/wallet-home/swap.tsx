import { View, Text } from "react-native";
import React from "react";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { PageWrapper } from "@/components/general";

const Swap = () => {
  return (
    <PageWrapper>
      <Box flex={1}>
        <CustomText>Hello There</CustomText>
      </Box>
    </PageWrapper>
  );
};

export default Swap;
