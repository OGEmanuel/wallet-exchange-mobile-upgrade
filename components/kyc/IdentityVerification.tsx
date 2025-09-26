import { accounts, idCard } from "@/assets/images";
import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { CustomText } from "../general";
import ProgressTrack from "./ProgressTrack";
import VerificationCard from "./VerifcationCard";

export default function IdentityVerification() {
  const theme = useTheme<Theme>();
  const [currentStep, setCurrentStep] = useState(1);

  // Verification steps data
  const verificationSteps = [
    {
      title: "BVN",
      description:
        "This is a unique 11 digit number that is tied to your bank account.",
      status: "pending",
      isCompleted: false,
      isActionable: true,
      icon: accounts,

      limit: "₦100,000 Max",
      onPress: () => {
        console.log("BVN verification pressed");
        // Handle BVN verification
      },
    },
    {
      title: "ID Verification",
      description:
        "Kindly take clear picture of your government issued document.",
      status: "pending",
      isCompleted: false,
      isActionable: false,
      limit: "Unlimited",
      icon: idCard,
      onPress: () => {
        console.log("ID verification pressed");
        // Handle ID verification
      },
    },
  ];

  return (
    <View style={styles.container}>
      <CustomText variant="header" style={styles.title}>
        Identity Verification
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        Before you can buy BTC we will need to verify who you are. Be sure your
        data is safe.
      </CustomText>
      <View style={styles.contentContainer}>
        <ProgressTrack
          currentStep={currentStep}
          totalSteps={2}
          stepLabels={["BVN", "ID Verification"]}
        />

        <View style={styles.cardsContainer}>
          {verificationSteps.map((step, index) => (
            <VerificationCard
              key={index}
              title={step.title}
              description={step.description}
              status={step.status}
              isCompleted={step.isCompleted}
              isActionable={step.isActionable}
              icon={step.icon}
              limit={step.limit}
              onPress={step.onPress}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 16,
    width: SCREEN_WIDTH * 0.9,
    color: "#FFFFFF",
  },
  subtitle: {
    marginBottom: 24,
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginTop: 16,
    width: SCREEN_WIDTH * 0.75,
  },
  contentContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 0.9,
    justifyContent: "space-between",
  },
});
