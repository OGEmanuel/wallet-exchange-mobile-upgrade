import { Stack } from "expo-router";
import React from "react";

const SetUpLayout = () => {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default SetUpLayout;
