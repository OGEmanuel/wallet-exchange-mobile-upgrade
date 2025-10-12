import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { type TextProps, StyleSheet, Text } from "react-native";

export type ThemedTextProps = TextProps & {
  color?: string;
  type?:
    | "default"
    | "title"
    | "cardTitle"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "card"
    | "cardInfo"
    | "subTitleLg";
};

export default function ThemedText({
  style,
  type = "default",
  color,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme<Theme>();
  return (
    <Text
      style={[
        type === "default" ? styles.default : undefined,
        type === "cardTitle" ? styles.cardTitle : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "subTitleLg" ? styles.subTitleLg : undefined,
        type === "link" ? styles.link : undefined,
        type === "card" ? styles.card : undefined,
        type === "cardInfo" ? styles.cardInfo : undefined,
        color && { color: color || theme.colors.bodyTextColor },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
  defaultSemiBold: {
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
    fontFamily: "PlusJakartaSans_Medium",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "PlusJakartaSans_Bold",
    lineHeight: 48,
  },
  subTitleLg: {
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "NewScience_Bold",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "NewScience_SemiBold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
  card: {
    fontWeight: "600",
    letterSpacing: 0.28,
    fontSize: 14,
    color: "#000",
  },
  cardInfo: {
    fontWeight: "500",
    lineHeight: 16.8,
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Medium",
    fontWeight: "500",
    lineHeight: 14.4,
  },
});
