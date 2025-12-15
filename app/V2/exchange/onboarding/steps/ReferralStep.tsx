import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton, AppInput, AppRadio } from "../../../components/ui";
import { useExchangeOnboardingContext } from "../useExchangeOnboardingContext";

const USER_SOURCE_OPTIONS = [
  "Snapchat",
  "Facebook",
  "X",
  "Instagram",
  "Events",
  "Friends",
  "Telegram",
  "Other",
];

const ReferralStep: React.FC = () => {
  const theme = useTheme<Theme>();
  const { setCurrentOnboardingStep } = useExchangeOnboardingContext();
  const { exchangeUserData } =
  useExchangeAuth();
  const { addUsername, updateUser } = useKyc();
  // const { user } = useSelector((state: AppRootState) => state.kyc);
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [userSource, setUserSource] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("user in referral step", exchangeUserData);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (touched) {
      setUsernameError(text.trim() ? "" : "Username is required");
    }
  };

  const handleUsernameBlur = () => {
    setTouched(true);
    if (!username.trim()) {
      setUsernameError("Username is required");
    } else {
      setUsernameError("");
    }
  };

  const handleComplete = async () => {
    setTouched(true);
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }

    if (!exchangeUserData?._id) {
      setUsernameError("User ID is required. Please verify your email first.");
      return;
    }

    setIsLoading(true);
    setUsernameError("");

    try {
      await addUsername({
        username: username.trim(),
        userSource: userSource || null,
        referralCode: referralCode.trim(),
      });

      // Fetch updated user data after successful username addition
      // await fetchUserById(exchangeUserData);
      updateUser({
        ...exchangeUserData,
        username: username.trim(),
      });
      // setCurrentOnboardingStep(Onboarding.AuthVerificationIntro);
      // if (response?.success) {
      // } else {
      //   setUsernameError(response?.message || "Failed to complete onboarding");
      // }
    } catch (error: any) {
      console.error("Add username error:", error);
      setUsernameError(error?.message || "Username is already taken or an error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, { color: theme.colors.headerTextColor }]}>
        One more step!
      </Text>

      <AppInput
        value={username}
        onChangeText={handleUsernameChange}
        onBlur={handleUsernameBlur}
        placeholder="Choose a username"
        error={usernameError}
        touched={touched}
        // style={styles.input}
      />

      <AppInput
        value={referralCode}
        onChangeText={setReferralCode}
        placeholder="Referral Code (Optional)"
        // style={styles.input}
      />

      <Text style={[styles.label, { color: theme.colors.bodyTextColor }]}>
        How did you find Zap? (optional)
      </Text>

      <View style={styles.radioGrid}>
        {USER_SOURCE_OPTIONS.map((option) => (
          <View key={option} style={styles.radioItem}>
            <AppRadio
              label={option}
              checked={userSource === option}
              onChange={() => setUserSource(option)}
            />
          </View>
        ))}
      </View>

      <AppButton
        title="Complete"
        onPress={handleComplete}
        isLoading={isLoading}
        disabled={!username.trim() || isLoading}
        variant="primary"
        size="lg"
        style={styles.button}
      />
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
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "NewScience_SemiBold",
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
    fontFamily: "PlusJakartaSans_Regular",
  },
  radioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  radioItem: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  button: {
    width: "100%",
  },
});

export default ReferralStep;
