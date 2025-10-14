import useActiveTheme from "@/hooks/useTheme";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import Box from "../general/Box";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import FullPageModalWrapper from "./FullPaperModalWrapper";

const WhatIsPrivateKeyModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme<Theme>();
  const { colorTheme: activeTheme } = useActiveTheme();

  return (
    <FullPageModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      color={
        activeTheme === "dark"
          ? ["#7055FF", "#000000DD"]
          : ["#7055FF", "#FFFFFF"]
      }
    >
      <Box width="100%" height={200} alignItems="center">
        <Image
          source={require("@/assets/images/lock.png")}
          contentFit="contain"
          style={{ width: 200, height: 200 }}
        />
      </Box>
      <Box flex={1}>
        <ScrollView style={{ flexGrow: 1 }}>
          <CustomText variant="header" fontSize={36} mt="l">
            {"What's a private key?"}
          </CustomText>
          <CustomText variant="body" mt="l" textAlign="justify">
            This is a 64-character cryptographic key that grants you access to an individual wallet address and its contained assets.
          </CustomText>
          <CustomText variant="body" mt="l" textAlign="justify">
            It's similar to a personal password, granting you sole authority over the cryptocurrency associated with your wallet address.
          </CustomText>
          <CustomText variant="body" mt="l" textAlign="justify">
            This cryptographic code plays a pivotal role in securing and managing your digital assets, ensuring that only you can authorize transactions and access your funds.
          </CustomText>
        </ScrollView>
      </Box>
      <Box width="100%" height={60} mb="l" justifyContent="center">
        <CustomButton
          width={"100%"}
          height={56}
          borderRadius={56}
          text="Got it"
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          onPress={() => onClose()}
        />
      </Box>
    </FullPageModalWrapper>
  );
};

export default WhatIsPrivateKeyModal;
