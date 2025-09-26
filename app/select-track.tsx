import { AnimatedGradientBottomSheetRef } from "@/components/bottomsheets/AnimatedGradientBottomSheet";
import PhoneVerificationBottomSheet from "@/components/bottomsheets/KYCBottomSheet";
import ZapperSiginBottomSheet from "@/components/bottomsheets/ZapperSiginBottomSheet";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import useActiveTheme from "@/hooks/useTheme";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { PropsWithChildren, useRef } from "react";
import { ScrollView } from "react-native-gesture-handler";

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
      borderColor="borderColor"
      flexDirection="row"
      p="m"
      alignItems="center"
      mb="l"
      bg="secondaryBackgroundColor"
    >
      <Box justifyContent="center">{image}</Box>
      <Box ml="m" justifyContent="center">
        <CustomText variant="bodyMedium" fontSize={18}>
          {title}
        </CustomText>
        <CustomText variant="body" fontSize={12} mb="m" mt="s">
          {body}
        </CustomText>
        <CustomButton
          text={btnText}
          onPress={() => onPress()}
          width={100}
          height={25}
          borderRadius={20}
          bgColor={colorTheme === "dark" ? colors.white : colors.fadedPrimary}
          color={colors.primaryColor}
          variant="bodySubheader"
          fontSize={12}
        />
      </Box>
    </Box>
  );
};

const SelectTrack = () => {
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);
  const phoneVerificationBottomSheetRef =
    useRef<AnimatedGradientBottomSheetRef>(null);
  const { colors } = useTheme<Theme>();

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
          style={{ width: 73, height: 73 }}
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
      body: "Sign in or  create your Zap account",
      btnText: "Get Started",
      image: (
        <Image
          source={require("@/assets/images/onb3.png")}
          style={{ width: 73, height: 73 }}
          contentFit="contain"
        />
      ),
      onPress: () => zapperBottomSheetRef.current?.snapToIndex(0),
    },
  ];
  return (
    <Wrapper>
      <Box padding="m">
        <CustomText variant="bodyMedium" fontSize={32}>
          Pick a start
        </CustomText>
        <ScrollView contentContainerStyle={{ paddingTop: 40 }}>
          {item.map((item, index) => (
            <Card {...item} key={index.toString()} />
          ))}
        </ScrollView>
      </Box>

      <ZapperSiginBottomSheet
        ref={zapperBottomSheetRef}
        onContinue={() => {
          zapperBottomSheetRef.current?.close();
          phoneVerificationBottomSheetRef.current?.snapToIndex(0);
        }}
      />
      <PhoneVerificationBottomSheet ref={phoneVerificationBottomSheetRef} />
    </Wrapper>
  );
};

export default SelectTrack;
