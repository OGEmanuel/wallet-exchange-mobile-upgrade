import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  error?: string | null;
  retry?: () => void;
  retryText?: string;
  isBackgroundRefresh?: boolean;
}

const ErrorIndicator: React.FC<Props> = ({
  error,
  retry,
  retryText = "Retry",
  isBackgroundRefresh = false,
}) => {
  const theme = useTheme<Theme>();

  if (!error) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.warningBackgroundColor },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.errorText,
            { color: theme.colors.error },
          ]}
        >
          {error}
        </Text>
        {retry && (
          <TouchableOpacity
            onPress={retry}
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.error },
            ]}
            disabled={isBackgroundRefresh}
          >
            {isBackgroundRefresh ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.retryText}>{retryText}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
});

export default ErrorIndicator;

