import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface RadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  name?: string;
  id?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  checked,
  onChange,
  name,
  id,
}) => {
  const theme = useTheme<Theme>();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onChange}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.radioCircle,
          {
            borderColor: checked
              ? theme.colors.primaryColor
              : theme.colors.borderColor,
            borderWidth: checked ? 2 : 1.5,
          },
        ]}
      >
        {checked && (
          <View
            style={[
              styles.radioInner,
              { backgroundColor: theme.colors.primaryColor },
            ]}
          />
        )}
      </View>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.bodyTextColor,
            marginLeft: 12,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_Regular",
    flex: 1,
  },
});

