import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CircleQuestionMarkIcon } from "lucide-react-native";
import React from "react";
import { Box, CustomText } from "../general";
import CryptoIcon from "../general/CrptoIcon";

interface NetworkFeeCardProps {
  networkFee?: {
    fee: string;
    feeInUSD: string;
    speed: string;
    gasPrice?: string;
    gasLimit?: string;
    feeRate?: number;
  } | null;
  selectedToken?: ProcessedAsset;
  amount?: string;
}

const NetworkFeeCard = ({
  networkFee,
  selectedToken,
  amount,
}: NetworkFeeCardProps) => {
  const theme = useTheme<Theme>();
  const { networkFeeRef } = useBottomSheetRefs();

  return (
    <Box
      width={"100%"}
      height={76}
      borderRadius={8}
      borderWidth={1}
      borderColor="borderColor"
      p="m"
      flexDirection="row"
    >
      <Box flex={1} justifyContent="space-between">
        <Box flexDirection="row">
          <CustomText
            variant="body"
            color="placeholderTextColor"
            fontSize={12}
            mr="s"
          >
            Network Fee
          </CustomText>
          <CircleQuestionMarkIcon
            size={16}
            color={theme.colors.bodyTextColor}
            onPress={() => networkFeeRef.current?.snapToIndex(1)}
          />
        </Box>
        <CustomText variant="body" fontSize={12} color="placeholderTextColor">
          Total
        </CustomText>
      </Box>
      <Box flex={1} alignItems="flex-end" justifyContent="space-between">
        <Box flexDirection="row" alignItems="center">
          <CustomText variant="body" fontSize={12} color="secondaryColor" mr="s">
            {networkFee?.feeInUSD || "$0.00"}
          </CustomText>
          <CryptoIcon image={selectedToken?.image} size={12} />
        </Box>
        <CustomText variant="body" fontSize={12}>
          {(() => {
            if (!selectedToken || !networkFee || !amount) return "$0.00";
            const amountValue = parseFloat(amount);
            const usdValue = amountValue * (selectedToken.price || 0);
            const feeValue = parseFloat(networkFee.feeInUSD.replace("$", ""));
            const total = usdValue + feeValue;
            return `$${total.toFixed(2)}`;
          })()}
        </CustomText>
      </Box>
    </Box>
  );
};

export default NetworkFeeCard;
