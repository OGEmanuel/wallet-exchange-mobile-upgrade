import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";

const _layout = () => {
  const theme = useTheme<Theme>();
  return (
    <Stack
      screenOptions={{ headerShown: false }}
      // drawerContent={() => <Sidebar />}
    >
      <Drawer.Screen />
    </Stack>
  );
};

export default _layout;
