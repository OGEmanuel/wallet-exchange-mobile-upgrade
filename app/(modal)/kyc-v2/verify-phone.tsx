import CustomLink from "@/components/custom-link";
import CountrySelect from "@/components/kyc/v2/country-select";
import HeaderText from "@/components/kyc/v2/header-text";
import PhoneVerification from "@/components/kyc/v2/phone-verification";
import SkipButton from "@/components/kyc/v2/skip-btn";
import { CountryData } from "@/src/core/utils/countryData";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const VerifyPhone = () => {
  const [country, setCountry] = useState<CountryData | null>(null);
  const [sendOTP, setSendOTP] = useState(false);
  const router = useRouter();

  const handleSkip = () => {
    router.replace("/(modal)/kyc-v2/identity");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Phone Number Verification",
          contentStyle: {
            backgroundColor: "#1f232d",
          },
        }}
      />
      <View style={styles.container}>
        {sendOTP ? (
          <PhoneVerification
            phoneNumber={"4567890"}
            countryCode={"+1"}
            onOTPVerified={() => {}}
            onSkip={handleSkip}
          />
        ) : (
          <>
            <View style={styles.content}>
              <View>
                <HeaderText>Verify Phone Number</HeaderText>
                <Text style={styles.desc}>
                  Enter and verify your phone number for your account security
                </Text>
              </View>
              <View style={styles.formContainer}>
                <CountrySelect value={country!!} onChange={setCountry} />
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="Phone Number"
                />
              </View>
            </View>
            <CustomLink label="Continue" onPress={() => setSendOTP(true)} />
            <SkipButton onSkip={handleSkip} />
          </>
        )}
      </View>
    </>
  );
};

export default VerifyPhone;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  desc: {
    textAlign: "center",
    marginTop: 16,
    fontWeight: 500,
    color: "#FFFFFF",
  },
  formContainer: {
    width: "100%",
    position: "relative",
    marginTop: 16,
  },
  input: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    backgroundColor: "#2f333d",
    color: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderColor: "#6045FF",
    marginTop: 16,
  },
});
