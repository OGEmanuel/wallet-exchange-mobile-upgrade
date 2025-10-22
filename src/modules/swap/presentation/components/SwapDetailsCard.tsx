import { useTheme } from "@shopify/restyle";
import { ChevronDown, ChevronUp, LinkIcon } from "lucide-react-native";
import React, { useState } from "react";

import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { ArrowSwapHorizontal } from "iconsax-react-nativejs";
import { TouchableOpacity } from "react-native";

interface SwapDetailsCardProps {
  provider?: string;
  providerIcon?: any;
  zapFee?: string;
  rate?: string;
  minimumReceived?: string;
  baseCurrencyUsdValue?: string;
  onToggleDetails?: () => void;
  showLess?: boolean;
  onProviderPress?: () => void;
  isZapLinked?: boolean;
}

const SwapDetailsCard: React.FC<SwapDetailsCardProps> = ({
  provider = "Zap exchange",
  providerIcon,
  zapFee = "$0.00",
  rate = "1BNB = 500 USDC",
  minimumReceived = "327,060.88 NGN",
  baseCurrencyUsdValue = "$0.00",
  onToggleDetails,
  showLess = false,
  onProviderPress,
  isZapLinked = false,
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
      height={isExpanded ? 105 : 60}
      p="m"
    >
      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="s"
      >
        <CustomText variant="body" color="placeholderTextColor" fontSize={12}>
          Provider
        </CustomText>
        <TouchableOpacity
          onPress={() => {
            onProviderPress?.();
          }}
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <LinkIcon
              color={
                isZapLinked
                  ? theme.colors.secondaryColor
                  : theme.colors.placeholderTextColor
              }
              width={15}
              height={15}
            />
            <Box marginHorizontal="s">{providerIcon}</Box>
            <CustomText variant="body" fontSize={12}>
              {provider}
            </CustomText>
          </Box>
        </TouchableOpacity>
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
            <CustomText
              variant="body"
              color="placeholderTextColor"
              fontSize={12}
            >
              Rate
            </CustomText>
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <ArrowSwapHorizontal
                size={15}
                color={theme.colors.secondaryColor}
              />
              <CustomText
                variant="bodyMedium"
                color="secondaryColor"
                fontSize={12}
                ml="s"
              >
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
            <CustomText
              variant="body"
              color="placeholderTextColor"
              fontSize={12}
            >
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
        </>
      )}

      <Box alignItems="center" width={"100%"}>
        <CustomButton
          trailingIcon={
            isExpanded ? (
              <ChevronUp color={"white"} size={15} />
            ) : (
              <ChevronDown color={"white"} size={15} />
            )
          }
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
