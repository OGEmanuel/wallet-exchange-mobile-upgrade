import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index" />
  );
};

export default _layout;
