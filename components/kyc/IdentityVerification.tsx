import images from "@/assets/images";
import {
  CountryVerificationDocumentModel,
  FilteredVerifiedCountryDocumentModel,
  filterVerificationClasses,
  groupByVerificationClass,
  userSubmittedDocumentIsApprovedOrPending,
} from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { VerifiedCountryModel } from "@/src/modules/kyc/domain/entities/models/verified-country-model";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { CustomText, LoaderWrapper } from "../general";
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
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { updateUser } = useKyc();
  const [currentStep, setCurrentStep] = useState(1);
  const [showBvnForm, setShowBvnForm] = useState(false);
  const [showIdForm, setShowIdForm] = useState(false);
  const [showIdVerificationFlow, setShowIdVerificationFlow] = useState(false);
  const [bvnCompleted, setBvnCompleted] = useState(false);
  const [idCompleted, setIdCompleted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<
    VerifiedCountryModel | null | undefined
  >(user?.countryId || null);
  const [documentTypes, setDocumentTypes] = useState<
    CountryVerificationDocumentModel[] | null | undefined
  >(null);
  const [countryDocumentsLoading, setCountryDocumentsLoading] = useState(false);
  const [fetchDocumentTypesError, setFetchDocumentTypesError] = useState<
    string | null
  >(null);
  const { fetchVerifiedCountries, fetchDocumentTypes } = useUtilities();
  const { verifiedCountries } = useSelector(
    (state: AppRootState) => state.utilities
  );

  useEffect(() => {
    if (user?.countryId) {
      setSelectedCountry(user.countryId);
    }
  }, [user]);

  useEffect(() => {
    fetchVerifiedCountries({
      body: {},
      params: {},
      extra: {},
    });
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      triggerFetchDocumentTypes();
    }
  }, [selectedCountry]);

  // useEffect(() => {
  //   if (documentTypes) {
  //     userSubmittedDocumentIsApprovedOrPending(documentTypes, user);
  //   }
  // }, [documentTypes]);

  useEffect(() => {
    if (documentTypes) {
      const bvnCompleted = userSubmittedDocumentIsApprovedOrPending(
        documentTypes,
        user
      );
      setBvnCompleted(!!bvnCompleted);
    }
  }, [documentTypes]);

  const triggerFetchDocumentTypes = () => {
    setCountryDocumentsLoading(true);
    setFetchDocumentTypesError(null);

    const payload = {
      body: selectedCountry || null,
      params: {},
      extra: {},
    };
    console.log("payload 3920842", payload);

    fetchDocumentTypes(payload)
      .then((response) => {
        if (response?.data) {
          setDocumentTypes(response.data || null);
        }
      })
      .catch((e) => {
        setFetchDocumentTypesError(
          e instanceof Error
            ? e.message
            : "An unexpected error occurred. Please try again."
        );
      })
      .finally(() => {
        setCountryDocumentsLoading(false);
      });
  };

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
  // const verificationSteps = [
  //   {
  //     title: "Bank Verification",
  //     description:
  //       "This is a unqiue set of numbers that is tied to your bank account.",
  //     status: bvnCompleted ? "completed" : "pending",
  //     isCompleted: bvnCompleted,
  //     isActionable: true,
  //     icon: accounts,
  //     // limit: "",
  //     onPress: handleBvnPress,
  //   },
  //   {
  //     title: "ID Verification",
  //     description:
  //       "Kindly take clear picture of your government issued document.",
  //     status: idCompleted ? "completed" : "pending",
  //     isCompleted: idCompleted,
  //     isActionable: bvnCompleted, // Only actionable after BVN is completed
  //     limit: "Unlimited",
  //     icon: idCard,
  //     onPress: handleIdPress,
  //   },
  // ];

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

  const filteredVerificationClasses = filterVerificationClasses(documentTypes);

  const countryDocuments: FilteredVerifiedCountryDocumentModel =
    groupByVerificationClass(documentTypes);
  const creditDocuments = countryDocuments.credit;
  const userSubmittedCreditDocumentIsApproved =
    userSubmittedDocumentIsApprovedOrPending(creditDocuments, user);

  const identityDocuments = countryDocuments.identity;

  const userHasSubmittedIdentityDocument =
    userSubmittedDocumentIsApprovedOrPending(identityDocuments, user);

  const steps = (filteredVerificationClasses || []).map((verificationClass) =>
    verificationClass.toLocaleLowerCase() === "credit"
      ? {
          title: "Bank Verification",
          description:
            "This is a unqiue set of numbers that is tied to your bank account.",
          status: userSubmittedCreditDocumentIsApproved
            ? "completed"
            : "pending",
          isCompleted: !!userSubmittedCreditDocumentIsApproved,
          isActionable: true,
          icon: images.accounts,
          limit: "",
          onPress: handleBvnPress,
        }
      : verificationClass.toLocaleLowerCase() === "identity"
      ? {
          title: "ID Verification",
          description:
            "Kindly take clear a picture of your government issued document.",
          status: userHasSubmittedIdentityDocument ? "completed" : "pending",
          isCompleted: !!userHasSubmittedIdentityDocument,
          // isActionable: bvnCompleted, // Only actionable after BVN is completed
          isActionable: true, // Only actionable after BVN is completed
          limit: "Unlimited",
          icon: images.idCard,
          onPress: handleIdPress,
        }
      : {}
  ).filter(step => step && Object.keys(step).length > 0); // Filter out empty objects

  return (
    <View style={styles.container}>
      <CustomText variant="header" style={styles.title}>
        Identity Verification
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        Before you can buy BTC we will need to verify who you are. Be sure your
        data is safe
      </CustomText>

      <Select
        options={
          (verifiedCountries || []).map((country) => ({
            label: country.name || "",
            value: country,
          })) || []
        }
        disabled={!!user?.countryId?._id}
        searchable
        value={selectedCountry}
        selectedLabel={selectedCountry?.name || ""}
        onSelect={(value) => {
          if (!Array.isArray(value)) {
            setSelectedCountry(value);

            updateUser({
              metaData: {
                ...user?.metaData,
                documentVerification: {
                  ...user?.metaData?.documentVerification,
                  selectedVerifiedCountry: value,
                },
              },
            });
          }
        }}
      />

      <LoaderWrapper
        isLoading={countryDocumentsLoading}
        isError={fetchDocumentTypesError !== null}
        errorMessage={fetchDocumentTypesError}
        customLoader={<ActivityIndicator />}
      >
        <View style={styles.contentContainer}>
          <ProgressTrack
            currentStep={currentStep}
            totalSteps={filteredVerificationClasses?.length || 0}
            stepLabels={
              documentTypes?.map(
                (document) => document.verificationClass || ""
              ) || []
            }
          />

          <View style={styles.cardsContainer}>
            {steps?.map((step, index) => (
              <VerificationCard
                key={index.toString()}
                title={step.title || ""}
                description={step.description || ""}
                status={step.status || "pending"}
                isCompleted={step.isCompleted || false}
                isActionable={step.isActionable || false}
                icon={step.icon}
                limit={step.limit}
                onPress={step.onPress}
              />
            ))}
          </View>
        </View>
      </LoaderWrapper>
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
