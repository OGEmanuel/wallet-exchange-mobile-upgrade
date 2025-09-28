import { checkTerms, docGuide } from "@/assets/images";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { CustomText } from "../general";

export default function DocumentCapure() {
  const theme = useTheme<Theme>();
  return (
    <View>
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
        <CustomText variant="body" style={[styles.subtitle, { fontSize: 12 }]}>
          I consent to Zap collecting, processing and sharing my information for
          KYC purposes as stated in the policy
        </CustomText>
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
});
