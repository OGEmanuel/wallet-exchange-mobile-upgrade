import { ThemedLinkExternalIcon } from "@/assets/svg/wallet-icons-components";
import { CustomButton } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import React from "react";

interface SwapDetailsCardProps {
  provider?: string;
  providerIcon?: any;
  zapFee?: string;
  rate?: string;
  minimumReceived?: string;
  showLess?: boolean;
  onShowLessPress?: () => void;
}

const SwapDetailsCard: React.FC<SwapDetailsCardProps> = ({
  provider = "Zap exchange",
  providerIcon,
  zapFee = "$0.009",
  rate = "1BNB = 500 USDC",
  minimumReceived = "327,060.88 NGN",
  showLess = true,
  onShowLessPress,
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box
      marginVertical="m"
      width={"100%"}
      borderRadius={10}
      borderWidth={2}
      borderColor="borderColor"
      height={150}
      p="m"
    >
      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <CustomText variant="body" fontSize={12}>
          Provider
        </CustomText>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <ThemedLinkExternalIcon
            darkModeColor={theme.colors.bodyTextColor}
            lightModeColor={theme.colors.bodyTextColor}
            width={15}
            height={15}
          />
          <Image
            source={providerIcon || require("@/assets/images/btc.png")}
            style={{ width: 20, height: 20, marginHorizontal: 5 }}
            contentFit="cover"
          />
          <CustomText variant="body" fontSize={12}>
            {provider}
          </CustomText>
        </Box>
      </Box>

      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <CustomText variant="body" fontSize={12} color="bodyTextColor">
          Zap Fee
        </CustomText>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <CustomText
            variant="bodyMedium"
            fontSize={12}
            color="headerTextColor"
          >
            {zapFee}
          </CustomText>
        </Box>
      </Box>

      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <CustomText variant="body" fontSize={12}>
          Rate
        </CustomText>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <CustomText variant="bodyMedium" fontSize={12}>
            {rate}
          </CustomText>
        </Box>
      </Box>

      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <CustomText variant="body" fontSize={12}>
          Minimum Received
        </CustomText>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <CustomText variant="bodyMedium" fontSize={12}>
            {minimumReceived}
          </CustomText>
        </Box>
      </Box>

      {showLess && (
        <Box alignItems="center" width={"100%"}>
          <CustomButton
            trailingIcon={<ChevronDown color={"white"} size={15} />}
            width={120}
            height={22}
            borderRadius={22}
            onPress={onShowLessPress}
            text="Show Less"
            fontSize={12}
            bgColor={theme.colors.secondaryBackgroundColor}
          />
        </Box>
      )}
    </Box>
  );
};

export default SwapDetailsCard;
