import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface StepperStep {
  display: React.ReactNode;
  completed?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  orientation?: "vertical" | "horizontal";
  currentStep?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  orientation = "vertical",
  currentStep,
}) => {
  const theme = useTheme<Theme>();

  if (orientation === "horizontal") {
    return (
      <View style={styles.horizontalContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <View style={styles.horizontalStep}>
              <View
                style={[
                  styles.horizontalIndicator,
                  {
                    backgroundColor:
                      index <= (currentStep ?? steps.length - 1)
                        ? theme.colors.primaryColor
                        : theme.colors.borderColor,
                  },
                ]}
              >
                {step.completed && (
                  <View style={styles.checkmark}>
                    <Text style={{ color: theme.colors.white, fontSize: 12 }}>
                      ✓
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.horizontalContent}>{step.display}</View>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.horizontalConnector,
                  {
                    backgroundColor:
                      index < (currentStep ?? steps.length - 1)
                        ? theme.colors.primaryColor
                        : theme.colors.borderColor,
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.verticalContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.verticalStep}>
            <View style={styles.verticalIndicatorContainer}>
              <View
                style={[
                  styles.verticalIndicator,
                  {
                    backgroundColor:
                      index <= (currentStep ?? steps.length - 1)
                        ? theme.colors.primaryColor
                        : theme.colors.borderColor,
                  },
                ]}
              >
                {step.completed ? (
                  <Text style={{ color: theme.colors.white, fontSize: 12 }}>
                    ✓
                  </Text>
                ) : (
                  <Text
                    style={{
                      color: theme.colors.white,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.verticalConnector,
                    {
                      backgroundColor:
                        index < (currentStep ?? steps.length - 1)
                          ? theme.colors.primaryColor
                          : theme.colors.borderColor,
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.verticalContent}>{step.display}</View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  horizontalStep: {
    alignItems: "center",
    flex: 1,
  },
  horizontalIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  checkmark: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalContent: {
    alignItems: "center",
  },
  horizontalConnector: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  verticalContainer: {
    flexDirection: "column",
  },
  verticalStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  verticalIndicatorContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  verticalIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  verticalConnector: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: 8,
  },
  verticalContent: {
    flex: 1,
    paddingTop: 4,
  },
});

