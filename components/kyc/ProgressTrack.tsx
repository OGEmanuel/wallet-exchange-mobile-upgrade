import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";

interface ProgressTrackProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

// DottedLine component for vertical dotted connector
const DottedLine = ({
  height,
  color,
  isCompleted,
}: {
  height: number;
  color: string;
  isCompleted: boolean;
}) => {
  const strokeColor = isCompleted ? "#10B981" : color;

  return (
    <Svg height={height} width={2}>
      <Line
        x1="1"
        y1="0"
        x2="1"
        y2={height}
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray="4,4"
        strokeLinecap="round"
      />
    </Svg>
  );
};

const ProgressTrack = ({
  currentStep,
  totalSteps,
  stepLabels = [],
}: ProgressTrackProps) => {
  const theme = useTheme<Theme>();
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;

        return (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepCircle,
                  { backgroundColor: theme.colors.secondaryBackgroundColor },

                  isCompleted && {
                    backgroundColor: theme.colors.secondaryColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    isCompleted && {
                      ...styles.completedStepText,
                      color: theme.colors.black,
                    },
                  ]}
                >
                  {stepNumber}
                </Text>
              </View>
            </View>
            {index < totalSteps - 1 && (
              <DottedLine
                height={60}
                color={theme.colors.secondaryBackgroundColor}
                isCompleted={isCompleted}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  stepContainer: {
    alignItems: "center",
    flexDirection: "column",
  },
  stepWrapper: {
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeStep: {
    borderColor: "#FDE047", // lemon
    backgroundColor: "#FDE047",
  },
  completedStep: {
    borderColor: "#10B981", // green-500
    backgroundColor: "#10B981",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF", // gray-400
  },
  activeStepText: {
    color: "#000000",
  },
  completedStepText: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
});

export default ProgressTrack;
