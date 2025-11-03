import { SIZES } from "@/data";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, ViewStyle } from "react-native";

export interface ProgressStep {
  id: string;
  label: string;
  status?: "pending" | "active" | "completed";
}

interface ProgressBarProps {
  steps: ProgressStep[];
  currentStepIndex: number;
  showIcons?: boolean;
  containerStyle?: ViewStyle;
  progressColor?: string;
  inactiveColor?: string;
  completedColor?: string;
  textColor?: string;
  activeTextColor?: string;
  completedTextColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStepIndex,
  showIcons = true,
  containerStyle,
  progressColor = "#93CE20",
  inactiveColor = "#333A47",
  completedColor = "#93CE20",
  textColor = "#9CA3AF", // Tailwind 'text-gray-400'
  activeTextColor = "#93CE20",
  completedTextColor = "#FFFFFF",
}) => {
  const theme = useTheme<Theme>();
  const progressWidth = useRef(new Animated.Value(0)).current;

  const progressPercentage = Math.max(
    0,
    Math.min(1, currentStepIndex / Math.max(1, steps.length - 1))
  );

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progressPercentage,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  const getStepStatus = (
    stepIndex: number
  ): "pending" | "active" | "completed" => {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "active";
    return "pending";
  };

  const getStepBackgroundColor = (stepIndex: number): string => {
    const status = getStepStatus(stepIndex);
    switch (status) {
      case "active":
        return progressColor;
      case "completed":
        return completedColor;
      default:
        return inactiveColor;
    }
  };

  const getStepTextColor = (stepIndex: number): string => {
    const status = getStepStatus(stepIndex);
    switch (status) {
      case "active":
        return activeTextColor;
      case "completed":
        return completedTextColor;
      default:
        return textColor;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Base progress track */}
      <View style={[styles.progressTrack, { backgroundColor: inactiveColor }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: progressColor,
              width: progressWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.stepsRow}>
        {steps.map((step, index) => (
          <View key={`${index}-${step.id}`} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                { backgroundColor: getStepBackgroundColor(index) },
              ]}
            ></View>
          </View>
        ))}
      </View>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => (
          <Text key={`${index}-${step.id}`} style={{ color: theme.colors.bodyTextColor }}>
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZES.width * 0.9,
    alignSelf: "center",
  },
  progressTrack: {
    position: "absolute",
    backgroundColor: "red",
    width: SIZES.width * 0.85,
    alignSelf: "center",
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: SIZES.width * 0.9,
  },
  stepContainer: {
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    top: -4,
  },
  stepLabel: {
    fontSize: 16,
    textAlign: "center",
    width: 100,
  },
});

export default ProgressBar;
