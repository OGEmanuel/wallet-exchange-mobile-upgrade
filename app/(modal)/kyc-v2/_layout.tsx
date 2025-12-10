import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

const KYCLayout = () => {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: Platform.OS === "ios" ? false : true,
        }}
      />
    </>
  );
};

export default KYCLayout;
