import { accounts, idCard } from "@/assets/images";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { CustomText } from "../general";
import Select from "../Select";
import BvnInputForm from "./BvnInputForm";
import IDVerificationFlow from "./IDVerificationFlow";
import ProgressTrack from "./ProgressTrack";
import VerificationCard from "./VerifcationCard";

interface IdentityVerificationProps {
  onComplete?: () => void;
  onBack?: () => void;
}

export default function IdentityVerification({
  onComplete,
  onBack,
}: IdentityVerificationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showBvnForm, setShowBvnForm] = useState(false);
  const [showIdForm, setShowIdForm] = useState(false);
  const [showIdVerificationFlow, setShowIdVerificationFlow] = useState(false);
  const [bvnCompleted, setBvnCompleted] = useState(false);
  const [idCompleted, setIdCompleted] = useState(false);

  const handleBvnPress = () => {
    setShowBvnForm(true);
  };

  const handleIdPress = () => {
    setShowIdVerificationFlow(true);
  };

  const handleBvnComplete = (data: any) => {
    setBvnCompleted(true);
    setShowBvnForm(false);
    setCurrentStep(2);
    console.log("BVN completed:", data);
  };

  const handleIdComplete = (data: any) => {
    setIdCompleted(true);
    setShowIdVerificationFlow(false);
    console.log("ID completed:", data);
    // Check if both are completed
    if (bvnCompleted) {
      onComplete?.();
    }
  };

  const handleFormBack = () => {
    setShowBvnForm(false);
    setShowIdForm(false);
    setShowIdVerificationFlow(false);
  };

  // Verification steps data
  const verificationSteps = [
    {
      title: "BVN",
      description:
        "This is a unique 11 digit number that is tied to your bank account.",
      status: bvnCompleted ? "completed" : "pending",
      isCompleted: bvnCompleted,
      isActionable: true,
      icon: accounts,
      limit: "₦100,000 Max",
      onPress: handleBvnPress,
    },
    {
      title: "ID Verification",
      description:
        "Kindly take clear picture of your government issued document.",
      status: idCompleted ? "completed" : "pending",
      isCompleted: idCompleted,
      isActionable: bvnCompleted, // Only actionable after BVN is completed
      limit: "Unlimited",
      icon: idCard,
      onPress: handleIdPress,
    },
  ];

  // Show BVN form if selected
  if (showBvnForm) {
    return <BvnInputForm onNext={handleBvnComplete} onBack={handleFormBack} />;
  }

  // Show ID verification flow if selected
  if (showIdVerificationFlow) {
    return (
      <IDVerificationFlow
        onComplete={handleIdComplete}
        onBack={handleFormBack}
      />
    );
  }

  return (
    <View style={styles.container}>
      <CustomText variant="header" style={styles.title}>
        Identity Verification
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        Before you can buy BTC we will need to verify who you are. Be sure your
        data is saf
      </CustomText>

      <Select options />
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
