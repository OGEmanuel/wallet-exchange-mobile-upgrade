import { Theme } from "@/theme";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { CustomButton, CustomText } from "../general";
import CountryPhoneInput from "./CountryPhoneInput";

export default function PhoneNumber() {
  const [phoneDetails, setPhoneDetails] = useState({
    phone: "",
    countryCode: "",
  });
  const [verified, setVerified] = useState(false);
  const theme = useTheme<Theme>();
  const handleOtpSent = (data: { phone: string; countryCode: string }) => {
    setPhoneDetails(data);
    setVerified(true);
    console.log("OTP sent to:", data);
  };

  const handleValidate = (isValid: boolean) => {
    console.log("Phone validation:", isValid);
  };

  return (
    <View style={styles.container}>
      <CustomText variant="header" style={styles.title}>
        Choose country
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        Select a country to start your ID verification.
      </CustomText>

      <CountryPhoneInput
        verified={verified}
        onOtpSent={handleOtpSent}
        phoneDets={phoneDetails}
        onValidate={handleValidate}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          text="Verify"
          onPress={() => {}}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          variant="bodySubheader"
          fontSize={16}
          disabled={false}
          disabledColor={theme.colors.borderColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    width: SCREEN_WIDTH * 0.9,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 16,
    width: SCREEN_WIDTH * 0.9,
  },
  subtitle: {
    marginBottom: 24,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 150,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
  },
});
