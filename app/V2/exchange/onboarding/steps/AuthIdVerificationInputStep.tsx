import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import {
  CountryVerificationDocumentModel,
  filterVerificationClasses,
} from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { VerifiedCountryModel } from "@/src/modules/kyc/domain/entities/models/verified-country-model";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { Button, DatePicker, Input, Select } from "../../../components/ui";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";
import { Onboarding } from "../types";

const AuthIdVerificationInputStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { fetchDocumentTypes } = useUtilities();
  const [selectedCountry, setSelectedCountry] = useState<VerifiedCountryModel | null>(
    user?.metaData?.documentVerification?.selectedVerifiedCountry || null
  );
  const [documentType, setDocumentType] = useState<CountryVerificationDocumentModel | null>(null);
  const [documentTypes, setDocumentTypes] = useState<CountryVerificationDocumentModel[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  useEffect(() => {
    if (selectedCountry?._id) {
      setIsLoadingDocuments(true);
      fetchDocumentTypes({
        body: selectedCountry,
        params: {},
        extra: {},
      })
        .then((response) => {
          if (response?.data) {
            const identityDocs = filterVerificationClasses(response.data).identity || [];
            setDocumentTypes(identityDocs);
          }
        })
        .catch(() => {
          setErrors({ documentType: "Failed to load document types" });
        })
        .finally(() => {
          setIsLoadingDocuments(false);
        });
    }
  }, [selectedCountry?._id, fetchDocumentTypes]);

  const documentTypeOptions = documentTypes.map((doc) => ({
    label: doc.name || doc.verificationType || "",
    value: doc._id || "",
  }));

  const selectedDocType = documentTypes.find((doc) => doc._id === documentType?._id);

  const isExternal = selectedDocType?.isExternal?.token;

  const handleContinue = () => {
    const newTouched = {
      documentType: true,
      firstName: true,
      lastName: true,
      documentId: true,
      dateOfBirth: true,
    };
    setTouched(newTouched);

    const newErrors: Record<string, string> = {};
    if (!documentType) {
      newErrors.documentType = "Document type is required";
    }
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!documentId.trim()) {
      newErrors.documentId = "Document ID is required";
    } else if (
      selectedDocType?.verificationNumberLength &&
      documentId.length > selectedDocType.verificationNumberLength
    ) {
      newErrors.documentId = `Document ID cannot exceed ${selectedDocType.verificationNumberLength} characters`;
    }
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCurrentOnboardingStep(Onboarding.AuthIdVerificationUpload);
  };

  const handleBack = () => {
    setCurrentOnboardingStep(Onboarding.AuthIdentityVerificationOverview);
  };

  if (isExternal) {
    // TODO: Show external verification component (e.g., SumSub)
    return (
      <View style={styles.container}>
        <Text>External verification not implemented</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={[styles.backIcon, { color: theme.colors.bodyTextColor }]}>←</Text>
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={[styles.badgeText, { color: theme.colors.primaryColor }]}>
          Step 2 of 2
        </Text>
      </View>

      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        ID Verification
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.placeholderTextColor }]}>
        We require a photo of a government issued ID to verify your identity.
      </Text>

      <View style={styles.selectorsRow}>
        <View style={styles.countrySelector}>
          <Select
            options={[]} // TODO: Add country options
            value={selectedCountry?._id}
            onChange={() => {}}
            placeholder="Country"
            disabled={true}
            label="Country"
          />
        </View>
        <View style={styles.documentSelector}>
          <Select
            options={documentTypeOptions}
            value={documentType?._id}
            onChange={(value) => {
              const doc = documentTypes.find((d) => d._id === value);
              setDocumentType(doc || null);
              setErrors({ ...errors, documentType: "" });
            }}
            placeholder="Document Type"
            searchable={true}
            isLoading={isLoadingDocuments}
            label="Document Type"
          />
        </View>
      </View>

      {documentType && !isExternal && (
        <>
          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <Input
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  setErrors({ ...errors, firstName: "" });
                }}
                onBlur={() => setTouched({ ...touched, firstName: true })}
                placeholder="First Name"
                error={errors.firstName}
                touched={touched.firstName}
                style={styles.input}
              />
            </View>
            <View style={styles.nameInput}>
              <Input
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  setErrors({ ...errors, lastName: "" });
                }}
                onBlur={() => setTouched({ ...touched, lastName: true })}
                placeholder="Last Name"
                error={errors.lastName}
                touched={touched.lastName}
                style={styles.input}
              />
            </View>
          </View>

          <Input
            value={documentId}
            onChangeText={(text) => {
              const maxLength = selectedDocType?.verificationNumberLength || 50;
              setDocumentId(text.slice(0, maxLength));
              setErrors({ ...errors, documentId: "" });
            }}
            onBlur={() => setTouched({ ...touched, documentId: true })}
            placeholder="Document ID"
            error={errors.documentId}
            touched={touched.documentId}
            maxLength={selectedDocType?.verificationNumberLength}
            style={styles.input}
          />

          <DatePicker
            value={dateOfBirth}
            onChange={(date) => {
              setDateOfBirth(date);
              setErrors({ ...errors, dateOfBirth: "" });
            }}
            placeholder="Date of Birth"
            maxDate={new Date()}
            error={errors.dateOfBirth}
            touched={touched.dateOfBirth}
            label="Date of Birth"
          />
        </>
      )}

      {documentType && !isExternal && (
        <Button
          title="Continue"
          onPress={handleContinue}
          isLoading={isLoading}
          disabled={
            !firstName.trim() ||
            !lastName.trim() ||
            !documentId.trim() ||
            !dateOfBirth ||
            isLoading
          }
          variant="primary"
          size="lg"
          style={styles.button}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    minHeight: 400,
  },
  backButton: {
    width: 28,
    height: 28,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans_Regular",
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "NewScience_SemiBold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    fontFamily: "PlusJakartaSans_Regular",
  },
  selectorsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  countrySelector: {
    width: 90,
  },
  documentSelector: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  button: {
    width: "100%",
    marginTop: 24,
  },
});

export default AuthIdVerificationInputStep;
