import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";

export interface AppErrorIndicatorProps {
  error: string;
  retry?: () => void;
  retryText?: string;
}

export const AppErrorIndicator: React.FC<AppErrorIndicatorProps> = ({
  error,
  retry,
  retryText = "Retry",
}) => {
  const theme = useTheme<Theme>();

  return (
    <View style={styles.container}>
      <Text style={[styles.errorIcon, { color: theme.colors.error }]}>⚠️</Text>
      <Text
        style={[
          styles.errorText,
          {
            color: theme.colors.error,
            marginTop: 12,
            marginBottom: retry ? 16 : 0,
          },
        ]}
      >
        {error}
      </Text>
      {retry && (
        <AppButton
          title={retryText}
          onPress={retry}
          variant="outline"
          size="md"
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
    textAlign: "center",
  },
});

