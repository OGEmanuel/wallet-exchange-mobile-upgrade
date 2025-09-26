import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProgressTrackProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

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
        const isActive = stepNumber <= currentStep;
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
                    isCompleted && styles.completedStepText,
                  ]}
                >
                  {stepNumber}
                </Text>
              </View>
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: theme.colors.secondaryBackgroundColor },
                  isCompleted && styles.completedConnector,
                ]}
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
  connector: {
    height: 40,
    width: 2,
    backgroundColor: "#4B5563", // gray-600
    marginHorizontal: 8,
  },
  completedConnector: {
    backgroundColor: "#10B981", // green-500
  },
});

export default ProgressTrack;
