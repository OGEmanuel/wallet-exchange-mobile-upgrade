import {
  AppBar,
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";

const EmptyState = () => {
  return (
    <Box width={"100%"} flex={1} alignItems="center" justifyContent="center">
      <Image
        source={require("@/assets/images/addressbook.png")}
        style={{ width: 250, height: 250 }}
        contentFit="contain"
      />
      <CustomText variant="subheader">No Contacts</CustomText>
      <CustomText textAlign="center" style={{ width: "70%" }} mt="m">
        You need to add your addresses to view a list of addresses here
      </CustomText>
      <Box height={30} />
      <CustomButton
        width={"70%"}
        text="Add address"
        onPress={() => router.push("/dashboard/home/address-book/add-address")}
        borderRadius={50}
      />
    </Box>
  );
};

const Addresses = () => {
  const theme = useTheme<Theme>();
  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor">
        <AppBar
          height={20}
          title={<CustomText variant="bodySubheader">Address book</CustomText>}
          leading={<ChevronLeft size={25} color={theme.colors.bodyTextColor} />}
        />
        <EmptyState />
      </Box>
    </PageWrapper>
  );
};

export default Addresses;
