import icons from "@/assets/icons";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { setSellStage } from "@/src/modules/sell/presentation/state/sell-slice";
import { Theme } from "@/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";
import { Pressable } from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch } from "react-redux";
import ProgressSteps from "../ProgressSteps";

interface ConfirmingStepProps {
  currentStepIndex: number;
  steps: string[];
}

const ConfirmingStep: React.FC<ConfirmingStepProps> = ({
  currentStepIndex,
  steps,
}) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();

  const handleBack = () => {
    dispatch(setSellStage("details"));
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
        flex={1}
      >
        <Pressable onPress={handleBack}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
      </Box>
      <Box
        p="m"
        alignContent="center"
        bg={isDark ? "modalBackgroundColor" : "secondaryBackgroundColor"}
        borderRadius={10}
        justifyContent="center"
        alignItems="center"
        gap="m"
        mb="m"
      >
        <CustomText variant="body" color="disabledTextColor">
          Sell 3 BNB for
        </CustomText>
        <CustomText variant="medium" color="bodyTextColor" fontSize={20}>
          4,500,000 NGN
        </CustomText>
        <Box
          bg="mainBackgroundColor"
          borderRadius={10}
          p="s"
          flexDirection="row"
          gap="s"
          alignItems="center"
        >
          <CustomText fontSize={12}>0xB1aE3E09F5C3e01b53b3...</CustomText>
          <Image
            source={icons.copy}
            style={{ width: 20, height: 20 }}
            tintColor={theme.colors.secondaryColor}
          />
        </Box>

        <Box
          alignItems="center"
          alignContent="center"
          justifyContent="center"
          flexDirection="row"
          gap="s"
        >
          <Image
            source={{
              uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
            }}
            style={{ width: 18, height: 18 }}
          />
          <CustomText variant="bodyBold" fontSize={14}>
            ERC-20
          </CustomText>
        </Box>
      </Box>

      <ProgressSteps currentStepIndex={currentStepIndex} steps={steps} />
    </BottomSheetView>
  );
};

export default ConfirmingStep;
