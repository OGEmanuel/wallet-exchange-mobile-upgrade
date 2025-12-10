import { Stack } from "expo-router";
import React from "react";

const ModalLayout = () => (
  <Stack
    screenOptions={{
      presentation: "modal",
      headerShown: false,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="select-watchlist" />
  </Stack>
);

export default ModalLayout;
