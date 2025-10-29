import { ZapperSiginBottomSheet } from "@/components";
import { AnimatedGradientBottomSheetRef } from "@/components/bottomsheets/AnimatedGradientBottomSheet";
import { Box, PageWrapper } from "@/components/general";
import ThemedText from "@/components/general/ThemedText";
import { SIZES } from "@/data";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import useActiveTheme from "@/hooks/useTheme";
import { StorageKeys } from "@/src/core/api/models";
import storageService from "@/src/core/storage/app-storage";
import { WalletProvider, useWallet } from "@/src/core/wallet/wallet-context";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
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
        <WalletProvider>
          <PageWrapper>{children}</PageWrapper>
        </WalletProvider>
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
      <Box justifyContent="center" width={75}>
        {image}
      </Box>
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

  // Get exchange authentication state from wallet context
  const { isExchangeAuthenticated } = useWallet();
  const { exchangeUserData } = useExchangeAuth();
  const { fetchUserById, updateUser } = useKyc();

  // Get user state from Redux store for KYC
  const { user } = useSelector((state: AppRootState) => state.kyc);

  // Check if user is exchange authenticated
  const isUserLoggedIn = isExchangeAuthenticated;

  const theme = useTheme<Theme>();

  const item: {
    title: string;
    body: string;
    image: React.ReactNode;
    btnText: string;
    onPress: () => void;
  }[] = [
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
      onPress: async () => {
        if (isUserLoggedIn) {
          // Navigate to dashboard for exchange authenticated users
          // router.push("/dashboard/home/wallet-home/home");
          const userProfile: UserModel = JSON.parse(
            (await storageService.getItem(StorageKeys.USER_PROFILE)) || "{}"
          );

          const userResponse = await fetchUserById(userProfile);
          if (userResponse.data?.username) {
            // User has username, close bottom sheet and navigate to app
            console.log(
              "User has username, closing bottom sheet and navigating to app"
            );
            updateUser(userResponse.data);
            setIsZapperBottomSheetVisible(false);
            router.push("/dashboard/home/wallet-home/swap");
          } else {
            // User doesn't have username, continue with normal flow
            setIsZapperBottomSheetVisible(true);
            // Use setTimeout to ensure the component is rendered before opening
            setTimeout(() => {
              zapperBottomSheetRef.current?.snapToIndex(0);
            }, 100);
          }
        } else {
          // Show exchange login bottom sheet for non-authenticated users
          setIsZapperBottomSheetVisible(true);
          // Use setTimeout to ensure the component is rendered before opening
          setTimeout(() => {
            zapperBottomSheetRef.current?.snapToIndex(0);
          }, 100);
        }
      },
    },
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
      onPress: () => router.push("/dashboard/home/wallet-home/swap"),
    },
  ];
  return (
    <Wrapper>
      <Box style={styles.container}>
        <ThemedText
          type="subtitle"
          color={theme.colors.bodyTextColor}
          style={{ fontSize: 32 }}
        >
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
            setIsZapperBottomSheetVisible(false);
            // Navigate to dashboard after successful exchange authentication
            router.push("/dashboard/home/wallet-home/swap");
          }}
          onClose={() => {
            setIsZapperBottomSheetVisible(false);
          }}
        />
      )}
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
