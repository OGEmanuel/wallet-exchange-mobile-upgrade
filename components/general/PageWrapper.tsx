import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

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
