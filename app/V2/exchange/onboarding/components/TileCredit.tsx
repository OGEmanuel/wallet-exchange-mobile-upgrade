import images from "@/assets/images";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface TileCreditProps {
  completed: boolean;
  onPress: () => void;
}

export const TileCredit: React.FC<TileCreditProps> = ({ completed, onPress }) => {
  const theme = useTheme<Theme>();

  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Image source={images.accounts} style={styles.stepIcon} />
        <View style={styles.stepTitleContainer}>
          <Text style={[styles.stepTitle, { color: theme.colors.headerTextColor }]}>
            Credit Verification
          </Text>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: completed
                    ? theme.colors.success || "#10B981"
                    : "#F59E0B",
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {completed ? "Complete" : "Incomplete"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={[styles.stepDescription, { color: theme.colors.placeholderTextColor }]}>
        Verify your Bank Verification Number (BVN) to enable transactions up to $150 over 3
        transactions.
      </Text>
      {!completed && (
        <TouchableOpacity onPress={onPress} style={styles.actionButton}>
          <Text style={[styles.actionButtonText, { color: theme.colors.primaryColor }]}>
            Verify BVN
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  stepTitleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  badgeContainer: {
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
  actionButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
});

