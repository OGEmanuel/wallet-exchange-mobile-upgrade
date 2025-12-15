import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export type LoadingSize = "sm" | "md" | "lg";

export interface AppLoadingProps {
  isLoading: boolean;
  size?: LoadingSize;
  color?: string;
}

export const AppLoading: React.FC<AppLoadingProps> = ({
  isLoading,
  size = "md",
  color,
}) => {
  const theme = useTheme<Theme>();

  if (!isLoading) return null;

  const getSize = () => {
    switch (size) {
      case "sm":
        return "small";
      case "md":
        return "small";
      case "lg":
        return "large";
      default:
        return "small";
    }
  };

  const getSizeValue = () => {
    switch (size) {
      case "sm":
        return 20;
      case "md":
        return 24;
      case "lg":
        return 32;
      default:
        return 24;
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={getSize() as "small" | "large"}
        color={color || theme.colors.primaryColor}
        style={{ width: getSizeValue(), height: getSizeValue() }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

