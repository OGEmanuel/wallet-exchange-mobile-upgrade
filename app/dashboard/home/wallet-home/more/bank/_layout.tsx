import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }} />
  );
};

export default _layout;
