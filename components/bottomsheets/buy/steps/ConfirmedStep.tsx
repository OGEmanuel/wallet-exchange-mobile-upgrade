import ThemedCopyIcon from "@/assets/svg/wallet-icons-components/ThemedCopyIcon";
import { Box, CustomButton, CustomText } from "@/components/general";
import { setBuyStage } from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Bolt, ChevronLeft } from "lucide-react-native";
import React from "react";
import { useDispatch } from "react-redux";

const ConfirmedStep = () => {
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();
  return (
    <LinearGradient
      colors={["#00000000", "#6045FF"]}
      start={{ x: 0.8, y: 0.4 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1, paddingHorizontal: 20, paddingTop: 18 }}
    >
      <ChevronLeft
        size={30}
        color={theme.colors.bodyTextColor}
        onPress={() => dispatch(setBuyStage("transfer_details"))}
        style={{ marginTop: 20 }}
      />
      <Box flex={1} justifyContent="flex-start" alignItems="center" mt="l">
        <Image
          source={require("@/assets/images/check.png")}
          contentFit="cover"
          style={{ width: 100, height: 100 }}
        />

        <Box
          width={"80%"}
          height={200}
          borderWidth={1}
          borderColor="borderColor"
          borderRadius={8}
          p="m"
          mt="2xl"
          bg="secondaryBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <CustomText color="disabledTextColor" fontSize={12}>
            You swapped 850,000 NGN for
          </CustomText>
          <CustomText variant="subheader" mt="m">
            1,000 USDC
          </CustomText>

          <Box
            width={"60%"}
            height={32}
            borderRadius={8}
            mt="m"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            bg="mainBackgroundColor"
          >
            <CustomText color="bodyTextColor" fontSize={14}>
              0x123456d33...
            </CustomText>
            <ThemedCopyIcon
              lightModeColor={theme.colors.bodyTextColor}
              darkModeColor={theme.colors.bodyTextColor}
            />
          </Box>

          <Box
            width={"30%"}
            height={32}
            borderRadius={8}
            mt="s"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            <CustomText color="bodyTextColor" fontSize={14}>
              ERC-20
            </CustomText>
          </Box>
        </Box>

        <Box
          width={"50%"}
          height={35}
          borderRadius={8}
          mt="l"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          bg="secondaryBackgroundColor"
          borderWidth={1}
          borderColor="borderColor"
        >
          <Bolt size={15} color={theme.colors.tabBarActiveColor} />
          <CustomText color="bodyTextColor" fontSize={14} ml="s">
            completed in
          </CustomText>
          <CustomText
            color="bodyTextColor"
            fontSize={14}
            variant="medium"
            ml="s"
          >
            1.20s
          </CustomText>
        </Box>

        <Box height={100} />

        <CustomButton
          width={"100%"}
          borderRadius={50}
          text="Zap again"
          onPress={() => dispatch(setBuyStage("crypto_select"))}
        />
        <Box height={20} />
        <CustomButton
          width={"100%"}
          borderRadius={50}
          text="Go to History"
          onPress={() => {}}
          bgColor={"transparent"}
          borderWidth={2}
          borderColor={theme.colors.borderColor}
        />
      </Box>
    </LinearGradient>
  );
};

export default ConfirmedStep;

