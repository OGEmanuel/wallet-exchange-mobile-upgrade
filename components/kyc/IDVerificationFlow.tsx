import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import React, { useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
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
  const { uploadIdentityDocument } = useKyc();
  const { uploadFile } = useUtilities();
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  const { user } = useSelector((state: AppRootState) => state.kyc);

  const handleDocumentSelected = (data: any) => {
    setUserData((prev: any) => ({ ...prev, ...data }));
    setCurrentStep("photo_capture");
  };

  const handlePhotoCaptured = (photo: FormData) => {
    setUserData((prev: any) => ({ ...prev, photo }));
    console.log("User ID Verification Data:", { ...userData, photo });

    setFileUploadLoading(true);

    uploadFile({
      body: photo,
      params: {},
      extra: {},
    }).then((response) => {
      uploadTheIdentityDocument(response?.data?.data?.url, photo);
    }).catch(() => {
      // throw new Error(error || "File Upload Error");
      setFileUploadLoading(false);
    })
  };

  const uploadTheIdentityDocument = (photoUrl?: string, photo?: any) => {
    uploadIdentityDocument({
      body: {
        countryId: user?.metaData?.documentVerification?.selectedVerifiedCountry?._id,
        lastName: userData?.lastName,
        firstName: userData?.firstName,
        idNumber: userData?.documentId,
        verificationType: userData?.documentType?.verificationType,
        docUrl: photoUrl,
        dateOfBirth: userData?.dateOfBirth,
      },
      params: {},
      extra: {},
    }).then(() => {
      onComplete?.({ ...userData, photo });
    }).catch(() => {
    }).finally(() => {
      setFileUploadLoading(false);
    });
  }

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
            fileUploadLoading={fileUploadLoading}
          />
        );
      default:
        return null;
    }
  };

  return <View style={{ flex: 1 }}>{renderCurrentStep()}</View>;
}
