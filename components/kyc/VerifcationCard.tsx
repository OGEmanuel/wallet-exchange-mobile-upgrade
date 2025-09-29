import icons from "@/assets/icons";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CustomText } from "../general";

interface VerificationCardProps {
  title: string;
  description: string;
  status: "approved" | "rejected" | "pending" | string;
  isCompleted: boolean;
  isActionable: boolean;
  icon: any;
  limit?: string;
  onPress?: () => void;
}

const VerificationCard = ({
  title,
  description,
  status,
  isCompleted,
  isActionable,
  icon,
  limit,
  onPress,
}: VerificationCardProps) => {
  const theme = useTheme<Theme>();

  const isRejected = status === "rejected";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isActionable}
      style={[
        styles.container,
        !isActionable && { opacity: 0.8 },
        isCompleted && styles.completedBorder,
        isRejected && styles.rejectedBorder,
        { backgroundColor: theme.colors.secondaryBackgroundColor },
      ]}
    >
      <Image
        source={icon}
        style={styles.icon}
        tintColor={
          !isActionable
            ? theme.colors.placeholderTextColor
            : theme.colors.bodyTextColor
        }
      />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {limit && (
              <View
                style={[
                  styles.limitBadge,
                  // isCompleted &&
                  {
                    backgroundColor: theme.colors.secondaryColor,
                  },
                  // !isCompleted && styles.pendingLimitBadge,
                ]}
              >
                <Text style={[styles.limitText]}>{limit}</Text>
              </View>
            )}
          </View>
          {isCompleted && (
            <Image source={icons.checkFill} style={styles.icon} />
          )}
        </View>
        <CustomText
          variant="body"
          style={{
            fontSize: 12,
            fontWeight: "400",
            color: "rgba(255, 255, 255, 0.60)",
          }}
        >
          {isRejected
            ? "Your submission was rejected. Please try again."
            : description}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "auto",
    minHeight: 96,
    width: "100%",
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    gap: 16,
    borderColor: "transparent",
  },
  completedBorder: {
    borderColor: "#FDE047", // border-lemon equivalent
  },
  rejectedBorder: {
    borderColor: "#F87171", // border-red-400 equivalent
  },
  icon: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flex: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  statusBadge: {
    minWidth: 50,
    minHeight: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  completedBadge: {
    backgroundColor: "#FDE047", // bg-lemon
  },
  rejectedBadge: {
    backgroundColor: "#EF4444", // bg-red-500
  },
  pendingBadge: {
    backgroundColor: "#EAB308", // bg-yellow-500
  },
  statusText: {
    fontSize: 12,
    textTransform: "capitalize",
    fontWeight: "500",
  },
  limitBadge: {
    minWidth: 50,
    minHeight: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  pendingLimitBadge: {
    backgroundColor: "#6B7280", // bg-gray-500
  },
  limitText: {
    fontSize: 12,
    fontWeight: "400",
  },
  description: {
    fontSize: 14,
  },
});

export default VerificationCard;
