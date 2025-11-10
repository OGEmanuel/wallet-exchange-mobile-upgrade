import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import React from "react";

interface ProgressStepsProps {
  currentStepIndex: number;
  steps: string[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStepIndex,
  steps,
}) => {
  return (
    <Box alignItems="center" justifyContent="center" mt="m">
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step}>
              {/* Node */}
              <Box
                width={20}
                height={20}
                borderRadius={6}
                bg={isActive ? "secondaryColor" : "secondaryBackgroundColor"}
                borderWidth={1}
                borderColor={isActive ? "secondaryColor" : "disabledTextColor"}
                justifyContent="center"
                alignItems="center"
              >
                {isActive && (
                  <Box
                    width={12}
                    height={12}
                    borderRadius={4}
                    bg="secondaryColor"
                  />
                )}
              </Box>

              {/* Line (connector) */}
              {!isLast && (
                <Box
                  flex={1}
                  height={3}
                  bg={
                    index < currentStepIndex
                      ? "secondaryColor"
                      : "secondaryBackgroundColor"
                  }
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Labels */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        width="100%"
        mt="s"
        style={{ paddingHorizontal: 10 }}
      >
        {steps.map((step, index) => (
          <CustomText
            key={step}
            fontSize={12}
            color={
              index <= currentStepIndex ? "bodyTextColor" : "disabledTextColor"
            }
          >
            {step}
          </CustomText>
        ))}
      </Box>
    </Box>
  );
};

export default ProgressSteps;
