import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PageWrapper = ({ children }: PropsWithChildren) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.mainBackgroundColor,
        paddingTop: insets.top,
      }}
    >
      {children}
    </View>
  );
};

export default PageWrapper;
