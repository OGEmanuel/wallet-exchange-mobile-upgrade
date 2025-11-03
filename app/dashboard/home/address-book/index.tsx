import SettingsHeader from "@/components/dashboard/SettingsHeader";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { Image } from "expo-image";
import { router } from "expo-router";
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
  return (
    <PageWrapper>
      <Box flex={1} bg="mainBackgroundColor">
        <SettingsHeader title="Address book" onBackPress={() => router.back()} />
        <EmptyState />
      </Box>
    </PageWrapper>
  );
};

export default Addresses;
