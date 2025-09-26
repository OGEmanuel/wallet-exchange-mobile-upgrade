import FullPageModalWrapper from "@/components/Modals/FullPaperModalWrapper";
import { Box, CustomButton, CustomText } from "@/components/general";
import useActiveTheme from "@/hooks/useTheme";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";
import { Pressable } from "react-native";

const SendSuccessModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme<Theme>();
  const { colorTheme: activeTheme } = useActiveTheme();
  console.log(activeTheme);

  return (
    <FullPageModalWrapper
      onClose={onClose}
      isOpen={isOpen}
      color={
        activeTheme === "light"
          ? ["#7055FF", "#000000DD"]
          : ["#7055FF", "#FFFFFF"]
      }
    >
      <Box flex={1} justifyContent="center">
        <Box alignItems="center" mt="m">
          <Image
            source={require("@/assets/images/check.png")}
            contentFit="contain"
            style={{ width: 97, height: 95 }}
          />
        </Box>

        <CustomText variant="header" textAlign="center" fontSize={36} mt="l">
          SENT!
        </CustomText>

        <Box
          width={"100%"}
          height={90}
          borderRadius={12}
          borderWidth={1}
          borderColor="borderColor"
          bg="secondaryBackgroundColor"
          p="m"
          mt="2xl"
        >
          <CustomText variant="body" textAlign="center" fontSize={14} mt="m">
            You successfully sent 0.009BTC to 0xd5321...de32
          </CustomText>
        </Box>
      </Box>
      <Box width="100%" height={150} justifyContent="center" mb="m">
        <Pressable
          onPress={(e) => {
            e?.stopPropagation();
          }}
        >
          <CustomButton
            width={"100%"}
            height={56}
            borderRadius={56}
            text="Save address"
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}
            onPress={() => {
              onClose();
            }}
          />
        </Pressable>

        <Box height={20} />

        <Pressable
          onPress={(e) => {
            e?.stopPropagation();
          }}
        >
          <CustomButton
            width={"100%"}
            height={56}
            borderRadius={56}
            text="Go to History"
            bgColor={"transparent"}
            borderWidth={2}
            borderColor={theme.colors.borderColor}
            color={theme.colors.white}
            onPress={() => {}}
          />
        </Pressable>
      </Box>
    </FullPageModalWrapper>
  );
};

export default SendSuccessModal;
