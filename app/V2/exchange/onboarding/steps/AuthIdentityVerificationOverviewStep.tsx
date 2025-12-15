import images from "@/assets/images";
import countryData, { CountryData, getCountryFlagUrl } from "@/src/core/utils/countryData";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { AppErrorIndicator, AppLoading, AppSelect, AppStepper } from "../../../components/ui";
import { Onboarding } from "../types";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const AuthIdentityVerificationOverviewStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check verification status (mock - replace with actual user data)
  const bvnCompleted = user?.metaData?.documentVerification?.creditVerification?.status === "approved";
  const idCompleted = user?.metaData?.documentVerification?.identityVerification?.status === "approved";

  const countryOptions = countryData.map((country) => ({
    label: country.label,
    value: country.value,
    prefix: (
      <Image
        source={{ uri: getCountryFlagUrl(country.value) }}
        style={{ width: 24, height: 16, marginRight: 8 }}
        resizeMode="contain"
      />
    ),
  }));

  const handleCountrySelect = (value: string) => {
    const country = countryData.find((c) => c.value === value);
    setSelectedCountry(country || null);
  };

  const handleBvnPress = () => {
    setCurrentOnboardingStep(Onboarding.AuthBvnVerificationInput);
  };

  const handleIdPress = () => {
    setCurrentOnboardingStep(Onboarding.AuthIdVerificationInput);
  };

  const steps = [
    {
      display: (
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <Image source={images.accounts} style={styles.stepIcon} />
            <View style={styles.stepTitleContainer}>
              <Text style={[styles.stepTitle, { color: theme.colors.headerTextColor }]}>
                Credit Verification
              </Text>
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: bvnCompleted
                        ? theme.colors.success || "#10B981"
                        : theme.colors.warning || "#F59E0B",
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {bvnCompleted ? "Complete" : "Incomplete"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={[styles.stepDescription, { color: theme.colors.placeholderTextColor }]}>
            Verify your Bank Verification Number (BVN) to enable transactions up to $150 over 3
            transactions.
          </Text>
          {!bvnCompleted && (
            <TouchableOpacity onPress={handleBvnPress} style={styles.actionButton}>
              <Text style={[styles.actionButtonText, { color: theme.colors.primaryColor }]}>
                Verify BVN
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ),
      completed: bvnCompleted,
    },
    {
      display: (
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <Image source={images.idCard} style={styles.stepIcon} />
            <View style={styles.stepTitleContainer}>
              <Text style={[styles.stepTitle, { color: theme.colors.headerTextColor }]}>
                Identity Verification
              </Text>
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: idCompleted
                        ? theme.colors.success || "#10B981"
                        : theme.colors.warning || "#F59E0B",
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {idCompleted ? "Complete" : "Incomplete"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={[styles.stepDescription, { color: theme.colors.placeholderTextColor }]}>
            Upload a government-issued ID to increase your transaction limit to unlimited.
          </Text>
          {!idCompleted && (
            <TouchableOpacity onPress={handleIdPress} style={styles.actionButton}>
              <Text style={[styles.actionButtonText, { color: theme.colors.primaryColor }]}>
                Verify ID
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ),
      completed: idCompleted,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Identity verification
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.placeholderTextColor }]}>
        Before you can buy BTC we will need to verify who you are. Be sure you data is safe.
      </Text>

      <AppSelect
        options={countryOptions}
        value={selectedCountry?.value}
        onChange={handleCountrySelect}
        placeholder="Select country"
        searchable={true}
        label="Country"
        style={styles.countrySelect}
      />

      {error && (
        <AppErrorIndicator error={error} retry={() => setError(null)} style={styles.error} />
      )}

      {isLoading ? (
        <AppLoading isLoading={true} size="lg" />
      ) : (
        <AppStepper steps={steps} orientation="vertical" currentStep={bvnCompleted ? 1 : 0} />
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
  stepContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  stepTitleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  badgeContainer: {
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
  actionButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_SemiBold",
  },
});

export default AuthIdentityVerificationOverviewStep;
