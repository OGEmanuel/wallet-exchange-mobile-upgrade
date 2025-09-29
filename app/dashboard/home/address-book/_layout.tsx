import { Stack } from "expo-router";
import React from "react";

const RootLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index" />
  );
};

export default RootLayout;
