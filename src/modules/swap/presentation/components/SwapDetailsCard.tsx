import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";

import { ThemedLinkExternalIcon } from "@/assets/svg/wallet-icons-components";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";

interface SwapDetailsCardProps {
  provider?: string;
  providerIcon?: any;
  zapFee?: string;
  rate?: string;
  minimumReceived?: string;
  onToggleDetails?: () => void;
  showLess?: boolean;
}

const SwapDetailsCard: React.FC<SwapDetailsCardProps> = ({
  provider = "Zap exchange",
  providerIcon,
  zapFee = "$0.009",
  rate = "1BNB = 500 USDC",
  minimumReceived = "327,060.88 NGN",
  onToggleDetails,
  showLess = false,
}) => {
  const theme = useTheme<Theme>();
  const [isExpanded, setIsExpanded] = useState(!showLess);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggleDetails?.();
  };

  return (
    <Box
      marginVertical="m"
      width={"100%"}
      borderRadius={10}
      borderWidth={2}
      borderColor="borderColor"
      height={isExpanded ? 150 : 60}
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
          {providerIcon && (
            <Image
              source={providerIcon}
              style={{ width: 20, height: 20, marginHorizontal: 5 }}
              contentFit="cover"
            />
          )}
          <CustomText variant="body" fontSize={12}>
            {provider}
          </CustomText>
        </Box>
      </Box>

      {isExpanded && (
        <>
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
        </>
      )}

      <Box alignItems="center" width={"100%"}>
        <CustomButton
          trailingIcon={<ChevronDown color={"white"} size={15} />}
          width={120}
          height={22}
          borderRadius={22}
          onPress={handleToggle}
          text={isExpanded ? "Show Less" : "Show More"}
          fontSize={12}
          bgColor={theme.colors.secondaryBackgroundColor}
        />
      </Box>
    </Box>
  );
};

export default SwapDetailsCard;
