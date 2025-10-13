import { ZapperSiginBottomSheet } from "@/components";
import { AnimatedGradientBottomSheetRef } from "@/components/bottomsheets/AnimatedGradientBottomSheet";
<<<<<<< HEAD
import { Box, PageWrapper } from "@/components/general";
=======
import { Box, CustomText, PageWrapper } from "@/components/general";
>>>>>>> 5967650 (feat: refactor SelectTrack component for improved styling and functionality)
import ThemedText from "@/components/general/ThemedText";
import { SIZES } from "@/data";
import useActiveTheme from "@/hooks/useTheme";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { PropsWithChildren, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

const Wrapper = ({ children }: PropsWithChildren) => {
  const { colorTheme } = useActiveTheme();

  if (colorTheme === "dark") {
    return (
      <Box flex={1} bg="mainBackgroundColor">
        <PageWrapper>{children}</PageWrapper>
      </Box>
    );
  } else {
    return (
      <LinearGradient style={{ flex: 1 }} colors={["#846FFF", "#19087D"]}>
        <PageWrapper>{children}</PageWrapper>
      </LinearGradient>
    );
  }
};

const Card = ({
  title,
  body,
  image,
  btnText,
  onPress,
}: {
  title: string;
  body: string;
  image: React.ReactNode;
  btnText: string;
  onPress: () => void;
}) => {
  const { colorTheme } = useActiveTheme();
  const { colors } = useTheme<Theme>();
  return (
    <Box
      width={"100%"}
      height={131}
      borderRadius={10}
      borderWidth={colorTheme === "dark" ? 0.5 : 0}
      borderColor="cardBorder"
      flexDirection="row"
      p="m"
      alignItems="center"
      mb="l"
      bg="surfaceContainer"
    >
      <Box justifyContent="center">{image}</Box>
      <Box ml="m" justifyContent="center">
        <ThemedText
          style={{ marginBottom: 4 }}
          color={colors.bodyTextColor}
          type="subtitle"
        >
          {title}
        </ThemedText>
        <ThemedText
          type="cardTitle"
          style={{ marginBottom: 24 }}
          color={colors.placeholderTextColor}
        >
          {body}
        </ThemedText>

        <TouchableOpacity onPress={onPress} style={styles.button}>
          <ThemedText style={{ fontSize: 10 }} color={colors.primaryColor}>
            {btnText}
          </ThemedText>
        </TouchableOpacity>
      </Box>
    </Box>
  );
};

const SelectTrack = () => {
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);
  const phoneVerificationBottomSheetRef =
    useRef<AnimatedGradientBottomSheetRef>(null);

  // State to control bottomsheet visibility
  const [isZapperBottomSheetVisible, setIsZapperBottomSheetVisible] =
    useState(false);

  // Get user state from Redux store
  const { user } = useSelector((state: AppRootState) => state.kyc);

  // Check if user is logged in (has a user object and is not a guest)
  const isUserLoggedIn = user && !user.isGuest;

  const theme = useTheme<Theme>();

  const item: {
    title: string;
    body: string;
    image: React.ReactNode;
    btnText: string;
    onPress: () => void;
  }[] = [
    {
      title: "Noob",
      body: "Start your crypto journey here",
      btnText: "Create Wallet",
      image: (
        <Image
          source={require("@/assets/images/onb1.png")}
          style={{ width: 57, height: 72 }}
          contentFit="contain"
        />
      ),
      onPress: () => router.push("/setup"),
    },
    {
      title: "Trader",
      body: "Trade your cryptocurrency in a zap",
      btnText: "Make a trade",
      image: (
        <Image
          source={require("@/assets/images/onb2.png")}
          style={{ width: 73, height: 73 }}
          contentFit="contain"
        />
      ),
      onPress: () => router.push("/dashboard/home/wallet-home/home"),
    },
    {
      title: "Zapper",
      body: isUserLoggedIn
        ? "Continue to your dashboard"
        : "Sign in or  create your Zap account",
      btnText: isUserLoggedIn ? "Continue" : "Get Started",
      image: (
        <Image
          source={require("@/assets/images/onb3.png")}
          style={{ width: 58, height: 74 }}
          contentFit="contain"
        />
      ),
      onPress: () => {
        if (isUserLoggedIn) {
          // Navigate to dashboard for logged in users
          router.push("/dashboard/home/wallet-home/home");
        } else {
          // Show bottom sheet for non-logged in users
          setIsZapperBottomSheetVisible(true);
          // Use setTimeout to ensure the component is rendered before opening
          setTimeout(() => {
            zapperBottomSheetRef.current?.snapToIndex(0);
          }, 100);
        }
      },
    },
  ];
  return (
    <Wrapper>
      <Box style={styles.container}>
<<<<<<< HEAD
        <ThemedText
          type="subtitle"
          color={theme.colors.bodyTextColor}
          style={{ fontSize: 32 }}
        >
=======
        <CustomText variant="header" fontSize={32}>
>>>>>>> 5967650 (feat: refactor SelectTrack component for improved styling and functionality)
          Pick a start
        </ThemedText>
        <ScrollView contentContainerStyle={{ paddingTop: 40 }}>
          {item.map((item, index) => (
            <Card {...item} key={index.toString()} />
          ))}
        </ScrollView>
      </Box>

      {isZapperBottomSheetVisible && (
        <ZapperSiginBottomSheet
          ref={zapperBottomSheetRef}
          onContinue={() => {
            zapperBottomSheetRef.current?.close();
            phoneVerificationBottomSheetRef.current?.snapToIndex(0);
          }}
          onClose={() => {
            setIsZapperBottomSheetVisible(false);
          }}
        />
      )}
      {/* <PhoneVerificationBottomSheet ref={phoneVerificationBottomSheetRef} /> */}
    </Wrapper>
  );
};

export default SelectTrack;

const styles = StyleSheet.create({
  container: {
    width: SIZES.width * 0.9,
    alignSelf: "center",
    marginTop: 54,
  },
  button: {
    backgroundColor: "#FBFBFB",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    borderRadius: 32,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
