import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";

const ItemCards = () => {
  return (
    <Box width={"100%"} mb="m">
      <Box
        height={160}
        borderRadius={12}
        bg="secondaryBackgroundColor"
        width={"100%"}
        justifyContent="center"
        alignItems="center"
      >
        <Box height={60} width={60} borderRadius={50} bg="borderColor" />
      </Box>
      <CustomText variant="medium" fontSize={16} mt="s">
        How to get onbaord zap wallet
      </CustomText>
    </Box>
  );
};

const Tutorials = () => {
  return (
    <PageWrapper>
      <SettingsHeader title="Tutorials" onBackPress={() => router.back()} />
      <Box flex={1} backgroundColor="mainBackgroundColor">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]).map((item) => (
            <ItemCards key={item} />
          ))}
        </ScrollView>
      </Box>
    </PageWrapper>
  );
};

export default Tutorials;
