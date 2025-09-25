import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { View } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomText } from "../general";
import CustomButton from "../general/CustomButton";

export default function LoginToZap() {
  const [email, setEmail] = useState("");
  const theme = useTheme<Theme>();

  const { authEmail } = useKyc();

  const handleLogin = () => {
    authEmail({ email });
  };

  return (
    <View>
      <CustomText
        variant="header"
        marginVertical="s"
        style={{
          fontSize: 22,
          textAlign: "center",
          fontWeight: "600",
          marginVertical: 24,
        }}
      >
        Login to Zap
      </CustomText>
      <CustomInputWithoutForm
        value={email}
        onChange={setEmail}
        placeholder="Enter your email address"
        noBorder={true}
      />
      <View style={{ marginTop: 24 }}>
        <CustomButton
          width={"100%"}
          height={56}
          borderRadius={56}
          text="Continue"
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          onPress={handleLogin}
          disabled={email.length < 1}
          disabledColor={theme.colors.borderColor}
        />
      </View>
    </View>
  );
}
