import {
  CountryVerificationDocumentModel,
  groupByVerificationClass,
  userSubmittedDocumentIsApprovedOrPending,
} from "@/src/modules/kyc/domain/entities/models/document-type-model";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { VerifiedCountryModel } from "@/src/modules/utilities/domain/entities/models/verified-country-model";
import useUtilities from "@/src/modules/utilities/presentation/hooks/useUtilities";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import {
  AppErrorIndicator,
  AppLoading,
  AppSelect,
  AppStepper,
} from "../../../components/ui";
import { filterVerificationClasses } from "../../models/document-type-model";
import { TileCredit, TileIdentity } from "../components";
import { Onboarding } from "../types";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const AuthIdentityVerificationOverviewStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const { updateUser } = useKyc();
  const { fetchVerifiedCountries, fetchDocumentTypes } = useUtilities();
  const { verifiedCountries } = useSelector(
    (state: AppRootState) => state.utilities
  );

  const [selectedVerifiedCountry, setSelectedVerifiedCountry] =
    useState<VerifiedCountryModel | null>(
      user?.metaData?.documentVerification?.selectedVerifiedCountry || null
    );
  const [
    selectedVerifiedCountryDocuments,
    setSelectedVerifiedCountryDocuments,
  ] = useState<CountryVerificationDocumentModel[] | null>(null);
  const [
    fetchingverifiedCountryDocuments,
    setFetchingverifiedCountryDocuments,
  ] = useState(false);
  const [documentTypesError, setDocumentTypesError] = useState(false);
  const [fetchVerifiedCountriesLoading, setFetchVerifiedCountriesLoading] =
    useState(false);
  const [fetchVerifiedCountriesError, setFetchVerifiedCountriesError] =
    useState<string | null>(null);

  // Fetch verified countries on mount
  const loadVerifiedCountries = useCallback(async () => {
    setFetchVerifiedCountriesLoading(true);
    setFetchVerifiedCountriesError(null);
    try {
      await fetchVerifiedCountries({
        body: null,
        params: {},
        extra: {},
      });

      // Find user's country from response or use selectedVerifiedCountry from user metadata
      if (verifiedCountries && verifiedCountries.length > 0) {
        const userCountry =
          selectedVerifiedCountry ||
          verifiedCountries.find((c) => c._id === user?.countryId?._id) ||
          verifiedCountries.find(
            (c) =>
              c._id ===
              user?.metaData?.documentVerification?.selectedVerifiedCountry?._id
          ) ||
          verifiedCountries[0];

        if (userCountry && !selectedVerifiedCountry) {
          setSelectedVerifiedCountry(userCountry);
          // Don't update user metadata here to avoid triggering step recalculation
          // The country will be saved when user proceeds to next step (BVN or ID verification)
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch verified countries:", error);
      setFetchVerifiedCountriesError(
        error?.message || "Failed to load countries"
      );
    } finally {
      setFetchVerifiedCountriesLoading(false);
    }
  }, [
    fetchVerifiedCountries,
    verifiedCountries,
    selectedVerifiedCountry,
    user,
  ]);

  // Get document types for selected country
  const getDocumentTypes = useCallback(
    async (country: VerifiedCountryModel | null) => {
      if (!country?._id) return;

      setFetchingverifiedCountryDocuments(true);
      setDocumentTypesError(false);
      try {
        const response = await fetchDocumentTypes({
          body: country,
          params: {},
          extra: {},
        });

        if (response?.data) {
          setSelectedVerifiedCountryDocuments(response.data);
        } else {
          setDocumentTypesError(true);
        }
      } catch (error: any) {
        console.error("Failed to fetch document types:", error);
        setDocumentTypesError(true);
      } finally {
        setFetchingverifiedCountryDocuments(false);
      }
    },
    [fetchDocumentTypes]
  );

  // Handle country selection
  const handleCountrySelect = useCallback(
    (country: VerifiedCountryModel | null) => {
      if (country) {
        setSelectedVerifiedCountry(country);
        // Get document types for new country (don't update user metadata here to avoid step recalculation)
        getDocumentTypes(country);
      }
    },
    [getDocumentTypes]
  );

  // Group documents by verification class
  const countryDocuments = groupByVerificationClass(
    selectedVerifiedCountryDocuments
  );
  const creditDocuments = countryDocuments.credit || [];
  const identityDocuments = countryDocuments.identity || [];

  // Check verification status using utility functions
  const userSubmittedCreditDocument = userSubmittedDocumentIsApprovedOrPending(
    creditDocuments,
    user
  );
  const userSubmittedIdentityDocument =
    userSubmittedDocumentIsApprovedOrPending(identityDocuments, user);
  const bvnCompleted = !!userSubmittedCreditDocument;
  const idCompleted = !!userSubmittedIdentityDocument;

  // Fetch countries on mount
  useEffect(() => {
    if (!verifiedCountries || verifiedCountries.length === 0) {
      loadVerifiedCountries();
    }
  }, [loadVerifiedCountries, verifiedCountries]);

  // Get document types when country is selected
  useEffect(() => {
    if (selectedVerifiedCountry?._id && !selectedVerifiedCountryDocuments) {
      getDocumentTypes(selectedVerifiedCountry);
    }
  }, [
    selectedVerifiedCountry?._id,
    selectedVerifiedCountryDocuments,
    getDocumentTypes,
    selectedVerifiedCountry,
  ]);

  const countryOptions =
    verifiedCountries?.map((country) => ({
      label: country.name || "",
      value: country as VerifiedCountryModel,
      prefix: country.flagUrl ? (
        <Image
          source={{ uri: country.flagUrl }}
          style={{ width: 24, height: 16, marginRight: 8 }}
          resizeMode="contain"
        />
      ) : undefined,
    })) || [];

  const handleBvnPress = () => {
    // Set the step FIRST to prevent recalculation from overriding it
    setCurrentOnboardingStep(Onboarding.AuthBvnVerificationInput);

    // Then update metadata (this will trigger recalculation, but step is already set and tracked)
    if (selectedVerifiedCountry) {
      updateUser({
        ...user,
        metaData: {
          ...user?.metaData,
          shownIdentificationOverviewOnboardingIntro: true,
          documentVerification: {
            ...user?.metaData?.documentVerification,
            selectedVerifiedCountry: selectedVerifiedCountry,
          },
        },
      });
    } else {
      // If no country selected, just update the intro flag
      updateUser({
        ...user,
        metaData: {
          ...user?.metaData,
          shownIdentificationOverviewOnboardingIntro: true,
        },
      });
    }
  };

  const handleIdPress = () => {
    // Set the step FIRST to prevent recalculation from overriding it
    setCurrentOnboardingStep(Onboarding.AuthIdVerificationInput);

    // Then update metadata (this will trigger recalculation, but step is already set and tracked)
    if (selectedVerifiedCountry) {
      updateUser({
        ...user,
        metaData: {
          ...user?.metaData,
          shownIdentificationOverviewOnboardingIntro: true,
          skippedBvnVerification: true,
          authBvnVerificationSuccessShown: true,
          documentVerification: {
            ...user?.metaData?.documentVerification,
            selectedVerifiedCountry: selectedVerifiedCountry,
          },
          idVerificationData: {
            ...user?.metaData?.idVerificationData,
            shownAuthIdVerificationInput: false,
          },
        },
      });
    } else {
      // If no country selected, just update the flags
      updateUser({
        ...user,
        metaData: {
          ...user?.metaData,
          shownIdentificationOverviewOnboardingIntro: true,
          skippedBvnVerification: true,
          authBvnVerificationSuccessShown: true,
          idVerificationData: {
            ...user?.metaData?.idVerificationData,
            shownAuthIdVerificationInput: false,
          },
        },
      });
    }
  };

  const filteredVerificationClasses = filterVerificationClasses(
    selectedVerifiedCountryDocuments
  );

  const steps: { display: React.ReactNode; completed: boolean }[] = [];

  filteredVerificationClasses.forEach((verificationClass) => {
    const classLower = verificationClass.toLowerCase();

    if (classLower === "credit") {
      steps.push({
        display: (
          <TileCredit completed={bvnCompleted} onPress={handleBvnPress} />
        ),
        completed: bvnCompleted,
      });
    }

    if (classLower === "identity") {
      steps.push({
        display: (
          <TileIdentity completed={idCompleted} onPress={handleIdPress} />
        ),
        completed: idCompleted,
      });
    }
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Identity verification
      </Text>

      <Text
        style={[styles.subtitle, { color: theme.colors.placeholderTextColor }]}
      >
        Before you can buy BTC we will need to verify who you are. Be sure you
        data is safe.
      </Text>

      <View style={styles.countrySelect}>
        <AppSelect<VerifiedCountryModel | null>
          options={countryOptions.map((country) => ({
            label: country.label,
            value: country.value,
            prefix: country.prefix,
          }))}
          value={selectedVerifiedCountry}
          onChange={handleCountrySelect}
          placeholder="Select country"
          searchable={true}
          label="Country"
          disabled={!!user?.countryId || fetchVerifiedCountriesLoading}
          isLoading={fetchVerifiedCountriesLoading}
          prefix={
            selectedVerifiedCountry?.flagUrl ? (
              <Image
                source={{ uri: selectedVerifiedCountry.flagUrl }}
                style={{ width: 24, height: 16, marginRight: 8 }}
                resizeMode="contain"
              />
            ) : (
              "undefined"
            )
          }
          getOptionValue={(opt) => opt.value?._id || ""}
          getOptionLabel={(opt) => opt.label}
        />
      </View>

      {fetchVerifiedCountriesError && (
        <View style={styles.error}>
          <AppErrorIndicator
            error={fetchVerifiedCountriesError}
            retry={loadVerifiedCountries}
          />
        </View>
      )}

      {fetchingverifiedCountryDocuments || fetchVerifiedCountriesLoading ? (
        <AppLoading isLoading={true} size="lg" />
      ) : documentTypesError ? (
        <View style={styles.error}>
          <AppErrorIndicator
            error="Failed to load document types. Please try again."
            retry={() =>
              selectedVerifiedCountry &&
              getDocumentTypes(selectedVerifiedCountry)
            }
          />
        </View>
      ) : !selectedVerifiedCountryDocuments ||
        selectedVerifiedCountryDocuments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[
              styles.emptyText,
              { color: theme.colors.placeholderTextColor },
            ]}
          >
            No document types available for selected country
          </Text>
        </View>
      ) : (
        <AppStepper
          steps={steps}
          orientation="vertical"
          currentStep={bvnCompleted ? 1 : 0}
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
  countrySelect: {
    marginBottom: 24,
  },
  error: {
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_Regular",
    textAlign: "center",
  },
});

export default AuthIdentityVerificationOverviewStep;
