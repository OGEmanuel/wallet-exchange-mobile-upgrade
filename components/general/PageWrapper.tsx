import { View, Text, SafeAreaView } from "react-native";
import React, { PropsWithChildren } from "react";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";

const PageWrapper = ({ children }: PropsWithChildren) => {
  const theme = useTheme<Theme>();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.mainBackgroundColor }}
    >
      {children}
    </SafeAreaView>
  );
};

export default PageWrapper;
