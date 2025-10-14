import icons from "@/assets/icons";
import images from "@/assets/images";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { SellFlowProps } from "@/types/sell.types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";

interface SuccessStepProps extends SellFlowProps {
  onZapAgain: () => void;
  onGoToHistory: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  onZapAgain,
  onGoToHistory,
}) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  return (
    <BottomSheetView
      style={{
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 30,
      }}
    >
      <Box
        alignContent="center"
        alignItems="center"
        justifyContent="center"
        mb="xl"
      >
        <Image source={images.success} style={{ width: 100, height: 100 }} />
      </Box>

      <Box
        p="m"
        alignContent="center"
        bg={isDark ? "modalBackgroundColor" : "secondaryBackgroundColor"}
        borderRadius={10}
        borderWidth={1}
        justifyContent="center"
        alignItems="center"
        gap="m"
        mb="m"
        style={{ borderColor: "#39393F" }}
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

      <Box
        width={200}
        bg="mainBackgroundColor"
        borderRadius={10}
        borderWidth={1}
        p="s"
        flexDirection="row"
        alignItems="center"
        mb="4xl"
        justifyContent="center"
        alignContent="center"
        alignSelf="center"
        style={{ borderColor: "#39393F" }}
      >
        <Image
          source={icons.sumsubLighting}
          style={{ width: 15, height: 15 }}
          tintColor={theme.colors.secondaryColor}
        />
        <Box flexDirection="row" gap="s" alignItems="center">
          <CustomText fontSize={13} variant="body" color="disabledTextColor">
            Completed in
          </CustomText>
          <CustomText variant="body" fontSize={13}>
            {" "}
            1.20s
          </CustomText>
        </Box>
      </Box>

      <Box gap="m">
        <CustomButton
          text="Zap again"
          onPress={() => onZapAgain()}
          width={"100%"}
          borderRadius={50}
          bgColor={theme.colors.primaryColor}
        />
        <CustomButton
          text="Go to History"
          onPress={() => onGoToHistory()}
          width={"100%"}
          borderRadius={50}
          borderWidth={1}
          borderColor="#39393F"
          color={
            isDark ? theme.colors.bodyTextColor : theme.colors.bodyTextColor
          }
          bgColor={
            isDark
              ? theme.colors.mainBackgroundColor
              : theme.colors.secondaryBackgroundColor
          }
        />
      </Box>
    </BottomSheetView>
  );
};

export default SuccessStep;
