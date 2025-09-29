import React, { useState } from "react";
import { View } from "react-native";
import DocumentCapure from "./DocumentCapure";
import IDVerification from "./IDVerification";

export type IDVerificationStep = "document_selection" | "photo_capture";

interface IDVerificationFlowProps {
  onComplete?: (data: any) => void;
  onBack?: () => void;
}

export default function IDVerificationFlow({
  onComplete,
  onBack,
}: IDVerificationFlowProps) {
  const [currentStep, setCurrentStep] =
    useState<IDVerificationStep>("document_selection");
  const [userData, setUserData] = useState<any>({});

  const handleDocumentSelected = (data: any) => {
    setUserData((prev: any) => ({ ...prev, ...data }));
    setCurrentStep("photo_capture");
  };

  const handlePhotoCaptured = (photo: any) => {
    setUserData((prev: any) => ({ ...prev, photo }));
    console.log("User ID Verification Data:", { ...userData, photo });
    onComplete?.({ ...userData, photo });
  };

  const handleBack = () => {
    switch (currentStep) {
      case "photo_capture":
        setCurrentStep("document_selection");
        break;
      default:
        onBack?.();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "document_selection":
        return (
          <IDVerification
            userData={userData}
            onDocumentSelected={handleDocumentSelected}
            onBack={onBack}
          />
        );
      case "photo_capture":
        return (
          <DocumentCapure
            userData={userData}
            onPhotoCaptured={handlePhotoCaptured}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return <View style={{ flex: 1 }}>{renderCurrentStep()}</View>;
}
