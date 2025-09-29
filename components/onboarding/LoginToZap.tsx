import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { View } from "react-native";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { CustomText } from "../general";
import CustomButton from "../general/CustomButton";

interface LoginToZapProps {
  onLoginSuccess?: (email: string) => void;
}

export default function LoginToZap({ onLoginSuccess }: LoginToZapProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme<Theme>();

  const { authEmail } = useKyc();

  const handleLogin = () => {
    setLoading(true);
    authEmail({ email })
      .then((res) => {
        console.log(res);
        // navigate to email verification
        onLoginSuccess?.(email);
      })
      .catch((err) => {
        // If you need to do anything with error.
        // But there's already a default toast mechanism for each API call
      })
      .finally(() => {
        setLoading(false);
      });
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
          text={loading ? "Loading..." : "Continue"}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          onPress={handleLogin}
          disabled={email.length < 1 || loading}
          disabledColor={theme.colors.borderColor}
        />
      </View>
    </View>
  );
}
