import { formatCurrency } from "@/src/core/utils/format-utils";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Triangle } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { useSelector } from "react-redux";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import SkeletonLoader from "../general/SkeletonLoader";

const BalanceCard = ({
  portfolioValue = 0,
  portfolioChange = 0,
  portfolioChangePercentage = 0,
  isLoading = false,
}: {
  portfolioValue?: number;
  portfolioChange?: number;
  portfolioChangePercentage?: number;
  walletName?: string;
  isLoading?: boolean;
}) => {
  const theme = useTheme<Theme>();
  const { isPortfolioLoading } = useSelector(
    (state: AppRootState) => state.portfolio
  );

  return (
    <Box
      width="100%"
      alignItems="center"
      justifyContent="center"
      position="relative"
    >
      {/* Center content */}
      <Box alignItems="center" justifyContent="center" flex={1}>
        <CustomText fontSize={13} variant="body" color="white" opacity={0.8}>
          Your portfolio value
        </CustomText>

        <SkeletonLoader isLoading={isLoading || isPortfolioLoading}>
          <CustomText
            fontSize={35}
            variant="header"
            marginVertical="m"
            color="white"
          >
            {formatCurrency(portfolioValue)}
          </CustomText>
        </SkeletonLoader>

        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Box
            width={185}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            height={36}
            borderRadius={24}
            paddingHorizontal="s"
            bg="secondaryBackgroundColor"
          >
            <Triangle
              size={11}
              fill={theme.colors.success}
              color={theme.colors.success}
            />
            <CustomText
              marginHorizontal="s"
              fontSize={13}
              style={{ marginHorizontal: 3 }}
              color="white"
            >
              {formatCurrency(portfolioChange)}
              {portfolioChange > 0 ? "+" : ""}
            </CustomText>

            <CustomText fontSize={13} color="placeholderTextColor">
              {" "}
              <CustomText fontSize={13} style={{ color: theme.colors.success }}>
                {portfolioChangePercentage.toFixed(2)}%
              </CustomText>{" "}
              24H
            </CustomText>
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
};

export default BalanceCard;
