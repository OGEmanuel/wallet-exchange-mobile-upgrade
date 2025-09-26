import { startVerification } from "@/assets/images";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, View } from "react-native";
import { CustomButton, CustomText } from "../general";

export default function VerifyYourIdentity({
  onContinue,
}: {
  onContinue?: () => void;
}) {
  const theme = useTheme<Theme>();
  return (
    <View>
      <View
        style={{
          alignSelf: "center",
          marginTop: 30,
          height: SCREEN_HEIGHT * 0.8,
        }}
      >
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
          Verify Your Identity
        </CustomText>
        <Image
          source={startVerification}
          style={{
            width: 200,
            height: 200,
            alignSelf: "center",
            marginBottom: 24,
          }}
        />
        <CustomText
          variant="body"
          fontSize={16}
          color="bodyTextColor"
          textAlign="center"
        >
          To conduct swaps on Zap, you will need to complete KYC
        </CustomText>
        <View
          style={{
            marginTop: 24,
            position: "absolute",
            bottom: 150,
            width: SCREEN_WIDTH * 0.9,
          }}
        >
          <CustomButton
            width={"100%"}
            height={56}
            borderRadius={56}
            text="Continue"
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}
            onPress={() => onContinue?.()}
            disabledColor={theme.colors.borderColor}
          />
        </View>
      </View>
    </View>
  );
}
