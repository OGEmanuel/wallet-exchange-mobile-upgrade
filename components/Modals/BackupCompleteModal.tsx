import React from "react";
import FullPageModalWrapper from "./FullPaperModalWrapper";
import Box from "../general/Box";
import { Image } from "expo-image";
import { ScrollView } from "react-native-gesture-handler";
import CustomButton from "../general/CustomButton";
import CustomText from "../general/CustomText";
import { useTheme } from "@shopify/restyle";
import { Theme } from "@/theme";
import useActiveTheme from "@/hooks/useTheme";
import { Pressable } from "react-native";

const BackupCompleteModal = ({
  isOpen,
  onClose,
  onContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}) => {
  const theme = useTheme<Theme>();
  const activeTheme = useActiveTheme();

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
      <Box flex={1} justifyContent="center">
        <Box alignItems="center" mt="m">
          <Image
            source={require("@/assets/images/check.png")}
            contentFit="contain"
            style={{ width: 97, height: 95 }}
          />
        </Box>

        <CustomText variant="body" textAlign="center" fontSize={22} mt="l">
          Backup completed
        </CustomText>

        <CustomText variant="body" textAlign="center" fontSize={14} mt="m">
          You can start enjoying your wallet.{" "}
        </CustomText>
      </Box>
      <Box width="100%" height={60} justifyContent="center" mb="m">
        <Pressable
          onPress={(e) => {
            e?.stopPropagation();
            onContinue();
            onClose();
          }}
        >
          <CustomButton
            width={"100%"}
            height={56}
            borderRadius={56}
            text="Continue"
            bgColor={theme.colors.primaryColor}
            color={theme.colors.white}
            onPress={() => {
              onContinue();
              onClose();
            }}
          />
        </Pressable>
      </Box>
    </FullPageModalWrapper>
  );
};

export default BackupCompleteModal;
