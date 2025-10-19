import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { ProcessedAsset } from "@/interfaces/portfolio.interface";
import { PortfolioService } from "@/services/portfolio.service";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CircleQuestionMarkIcon } from "lucide-react-native";
import React from "react";
import { Box, CustomText } from "../general";
import CryptoIcon from "../general/CrptoIcon";

interface NetworkFeeCardProps {
  networkFee?: {
    fee: number;
    feeInUSD: number;
    speed: "Standard" | "Fast" | "Instant";
    gasPrice?: number;
    gasLimit?: number;
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
          <CustomText
            variant="body"
            fontSize={12}
            color="secondaryColor"
            mr="s"
          >
            {PortfolioService.formatCurrency(networkFee?.feeInUSD || 0)}
          </CustomText>
          <CryptoIcon image={selectedToken?.image} size={12} />
        </Box>
        <CustomText variant="body" fontSize={12}>
          {(() => {
            if (!selectedToken || !networkFee || !amount) return PortfolioService.formatCurrency(0);
            const amountValue = parseFloat(amount);
            const usdValue = amountValue * (selectedToken.price || 0);
            const feeValue = networkFee.feeInUSD;
            const total = usdValue + feeValue;
            return PortfolioService.formatCurrency(total);
          })()}
        </CustomText>
      </Box>
    </Box>
  );
};

export default NetworkFeeCard;
