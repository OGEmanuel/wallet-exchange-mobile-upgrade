import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { AppButton, AppInput } from "../../../components/ui";
import { Onboarding } from "../types";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const AuthBvnVerificationInputStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { uploadCreditDocument, updateUser, fetchUserById } = useKyc();
  const { user } = useSelector((state: AppRootState) => state.kyc);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bvn, setBvn] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [bvnError, setBvnError] = useState("");
  const [touched, setTouched] = useState({ firstName: false, lastName: false, bvn: false });
  const [isLoading, setIsLoading] = useState(false);

  const validateBVN = (value: string): boolean => {
    return /^\d{11}$/.test(value);
  };

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    if (touched.firstName) {
      setFirstNameError(text.trim() ? "" : "First name is required");
    }
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    if (touched.lastName) {
      setLastNameError(text.trim() ? "" : "Last name is required");
    }
  };

  const handleBvnChange = (text: string) => {
    const numericText = text.replace(/\D/g, "").slice(0, 11);
    setBvn(numericText);
    if (touched.bvn) {
      setBvnError(
        numericText.length === 11 ? "" : "BVN must be exactly 11 digits"
      );
    }
  };

  const handleVerify = async () => {
    const newTouched = { firstName: true, lastName: true, bvn: true };
    setTouched(newTouched);

    let hasError = false;
    if (!firstName.trim()) {
      setFirstNameError("First name is required");
      hasError = true;
    }
    if (!lastName.trim()) {
      setLastNameError("Last name is required");
      hasError = true;
    }
    if (!bvn.trim()) {
      setBvnError("BVN is required");
      hasError = true;
    } else if (!validateBVN(bvn)) {
      setBvnError("BVN must be exactly 11 digits");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    setBvnError("");
    try {
      const response = await uploadCreditDocument({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        verificationType: "BVN",
        idNumber: bvn.trim(),
        docUrl: "https://example.com/uploads/id.jpg",
        countryId: user?.metaData?.documentVerification?.selectedVerifiedCountry?._id,
      });

      if (response?.success) {
        // Update user metadata to indicate BVN verification is complete
        updateUser({
          ...user,
          metaData: {
            ...user?.metaData,
            bvnMarkedAsVerified: true,
            shownIdentificationOverviewOnboardingIntro: true,
          },
        });

        // Fetch updated user data
        fetchUserById(user);
        setCurrentOnboardingStep(Onboarding.AuthBvnVerificationSuccess);
      } else {
        setBvnError(response?.message || "Failed to verify BVN. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload credit document error:", error);
      setBvnError(error?.message || "Failed to verify BVN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentOnboardingStep(Onboarding.AuthIdentityVerificationOverview);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={[styles.backIcon, { color: theme.colors.bodyTextColor }]}>←</Text>
      </TouchableOpacity>

      <View style={styles.badge}>
        <Text style={[styles.badgeText, { color: theme.colors.primaryColor }]}>
          Step 1 of 2
        </Text>
      </View>

      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        Bank Verification
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.placeholderTextColor }]}>
        Please provide your bank verification number
      </Text>

      <View style={styles.nameRow}>
        <View style={styles.nameInput}>
          <AppInput
            value={firstName}
            onChangeText={handleFirstNameChange}
            onBlur={() => setTouched({ ...touched, firstName: true })}
            placeholder="First Name"
            error={firstNameError}
            touched={touched.firstName}
            // style={styles.input}
          />
        </View>
        <View style={styles.nameInput}>
          <AppInput
            value={lastName}
            onChangeText={handleLastNameChange}
            onBlur={() => setTouched({ ...touched, lastName: true })}
            placeholder="Last Name"
            error={lastNameError}
            touched={touched.lastName}
            // style={styles.input}
          />
        </View>
      </View>

      <AppInput
        value={bvn}
        onChangeText={handleBvnChange}
        onBlur={() => setTouched({ ...touched, bvn: true })}
        placeholder="Enter Bank Verification Number"
        type="number"
        maxLength={11}
        error={bvnError}
        touched={touched.bvn}
        // style={styles.input}
      />

      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: theme.colors.warningBackgroundColor || "#FFF7D9",
            borderLeftColor: theme.colors.warningColor || "#FEDB24",
          },
        ]}
      >
        <Text style={[styles.infoText, { color: theme.colors.bodyTextColor }]}>
          You are able to transact up to $150 over 3 transactions with BVN verification. Verify
          your ID to increase your limit
        </Text>
      </View>

      <AppButton
        title="Verify"
        onPress={handleVerify}
        isLoading={isLoading}
        disabled={!firstName.trim() || !lastName.trim() || !validateBVN(bvn) || isLoading}
        variant="primary"
        size="lg"
        style={styles.button}
      />

      <View
        style={[
          styles.securityBox,
          { backgroundColor: theme.colors.secondaryBackgroundColor },
        ]}
      >
        <Text style={[styles.securityTitle, { color: theme.colors.bodyTextColor }]}>
          We need only access to your
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bullet, { color: theme.colors.bodyTextColor }]}>• Full Name</Text>
          <Text style={[styles.bullet, { color: theme.colors.bodyTextColor }]}>
            • Date of Birth
          </Text>
          <Text style={[styles.bullet, { color: theme.colors.bodyTextColor }]}>
            • Phone Number
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.securityNote}>
          <View
            style={[
              styles.lockIcon,
              { backgroundColor: theme.colors.primaryColor },
            ]}
          >
            <Text style={styles.lockText}>🔒</Text>
          </View>
          <Text style={[styles.securityNoteText, { color: theme.colors.bodyTextColor }]}>
            Your BVN does not give us access to your bank accounts or transactions.
          </Text>
        </View>
      </View>
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
  infoBox: {
    padding: 12,
    borderLeftWidth: 4,
    marginBottom: 24,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
  button: {
    width: "100%",
    marginBottom: 24,
  },
  securityBox: {
    padding: 12,
    borderRadius: 12,
  },
  securityTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "PlusJakartaSans_Regular",
  },
  bulletList: {
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "PlusJakartaSans_Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 12,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  lockText: {
    fontSize: 12,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
});

export default AuthBvnVerificationInputStep;
