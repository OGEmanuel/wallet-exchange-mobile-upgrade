import { Stack } from "expo-router";
import React from "react";

const ModalLayout = () => (
  <Stack screenOptions={{ presentation: "modal", headerShown: false }}>
    <Stack.Screen name="select-watchlist" />
  </Stack>
);

export default ModalLayout;
