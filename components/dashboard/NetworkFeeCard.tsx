import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { InfoCircle } from "iconsax-react-nativejs";
import React from "react";
import { Box, CustomText } from "../general";

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

const NetworkFeeCard = ({ networkFee, selectedToken, amount }: NetworkFeeCardProps) => {
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
          <CustomText variant="body" fontSize={12} mr="s">
            Network Fee
          </CustomText>
          <InfoCircle
            size={20}
            color={theme.colors.bodyTextColor}
            onPress={() => networkFeeRef.current?.snapToIndex(1)}
          />
        </Box>
        <CustomText variant="body" fontSize={12}>
          Total
        </CustomText>
      </Box>
      <Box flex={1} alignItems="flex-end" justifyContent="space-between">
        <CustomText variant="body" fontSize={12}>
          {networkFee?.feeInUSD || "$0.00"}
        </CustomText>
        <CustomText variant="body" fontSize={12}>
          {(() => {
            if (!selectedToken || !networkFee || !amount) return "$0.00";
            const amountValue = parseFloat(amount);
            const usdValue = amountValue * (selectedToken.price || 0);
            const feeValue = parseFloat(networkFee.feeInUSD.replace('$', ''));
            const total = usdValue + feeValue;
            return `$${total.toFixed(2)}`;
          })()}
        </CustomText>
      </Box>
    </Box>
  );
};

export default NetworkFeeCard;
