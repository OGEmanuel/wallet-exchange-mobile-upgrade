import { CustomButton } from "@/components/general";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import React from "react";

interface TokenInputCardProps {
  amount: string;
  token: string;
  balance?: string;
  showMaxButton?: boolean;
  onTokenPress?: () => void;
  onMaxPress?: () => void;
  onAmountChange?: (amount: string) => void;
  placeholder?: string;
}

const TokenInputCard: React.FC<TokenInputCardProps> = ({
  amount,
  token,
  balance,
  showMaxButton = false,
  onTokenPress,
  onMaxPress,
  onAmountChange,
  placeholder = "0.00",
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box
      width={"100%"}
      height={105}
      borderRadius={12}
      backgroundColor="secondaryBackgroundColor"
      p="m"
      justifyContent="space-between"
    >
      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <CustomText variant="medium">{amount || placeholder}</CustomText>
        <CustomButton
          width={107}
          height={36}
          borderRadius={36}
          bgColor={theme.colors.mainBackgroundColor}
          text={token}
          fontSize={12}
          onPress={onTokenPress}
          leadingIcon={
            <Image
              source={require("@/assets/images/btc.png")}
              style={{ width: 20, height: 20, marginRight: 5 }}
            />
          }
          trailingIcon={
            <ChevronDown
              color={theme.colors.bodyTextColor}
              size={12}
              style={{ marginLeft: 5 }}
            />
          }
        />
      </Box>

      {balance && (
        <Box
          width={"100%"}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mt="s"
        >
          <CustomText variant="medium">{amount || placeholder}</CustomText>
          <Box flexDirection="row" justifyContent="center" alignItems="center">
            <CustomText fontSize={12} variant="body" marginRight="s">
              Bal: {balance}
            </CustomText>
            {showMaxButton && (
              <CustomButton
                width={50}
                height={25}
                borderRadius={36}
                bgColor={theme.colors.white}
                color="black"
                text="MAX"
                fontSize={12}
                onPress={onMaxPress}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TokenInputCard;
