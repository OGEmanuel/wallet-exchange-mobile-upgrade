import { checkTerms, docGuide } from "@/assets/images";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { CustomButton, CustomText } from "../general";

export default function DocumentCapure() {
  const theme = useTheme<Theme>();
  return (
    <View style={styles.container}>
      <CustomText variant="header" style={styles.title}>
        National ID
      </CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        Make sure you take a clear and complete photo of your card
      </CustomText>
      <View
        style={[
          styles.dashedContainer,
          { backgroundColor: theme.colors.bodyTextColorInverse },
        ]}
      >
        <Image source={docGuide} style={{ height: 125 }} resizeMode="contain" />
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingTop: 16,
        }}
      >
        <Image
          source={checkTerms}
          style={{ width: 16, height: 20 }}
          resizeMode="contain"
        />
        <CustomText
          variant="body"
          style={[styles.subtitle, { fontSize: 12, opacity: 1 }]}
        >
          I consent to Zap collecting, processing and sharing my information for
          KYC purposes as stated in the policy
        </CustomText>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          text="Take a photo"
          onPress={() => {}}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          variant="bodySubheader"
          fontSize={14}
          disabled={false}
          disabledColor={theme.colors.borderColor}
        />
        <CustomButton
          text="Upload photo"
          onPress={() => {}}
          width="100%"
          height={56}
          borderRadius={56}
          bgColor={theme.colors.mainBackgroundColor}
          color={theme.colors.white}
          variant="bodySubheader"
          fontSize={14}
          disabled={false}
          disabledColor={theme.colors.borderColor}
          borderWidth={1}
          borderColor={theme.colors.borderColor}
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
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 16,
    width: SCREEN_WIDTH * 0.9,
    color: "#FFFFFF",
  },
  subtitle: {
    marginBottom: 24,
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 20,
  },
  cardsContainer: {
    gap: 16,
    marginTop: 16,
    width: SCREEN_WIDTH * 0.75,
  },
  contentContainer: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 0.9,
    justifyContent: "space-between",
  },
  dashedContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.3,
    borderWidth: 1,
    borderColor: "#58585D",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 150,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: "center",
    gap: 16,
  },
});
