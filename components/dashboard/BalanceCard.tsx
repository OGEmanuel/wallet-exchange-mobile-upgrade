import { formatCurrency } from "@/src/core/utils/format-utils";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ArrowUp3 } from "iconsax-react-nativejs";
import React from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";

const BalanceCard = ({
  portfolioValue = 0,
  portfolioChange = 0,
  portfolioChangePercentage = 0,
  walletName = "Wallet",
}: {
  portfolioValue?: number;
  portfolioChange?: number;
  portfolioChangePercentage?: number;
  walletName?: string;
}) => {
  const theme = useTheme<Theme>();

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

        <CustomText
          fontSize={30}
          variant="header"
          marginVertical="s"
          color="white"
        >
          {formatCurrency(portfolioValue)}
        </CustomText>

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
          <ArrowUp3 size={17} color="#35B592" variant="Bold" />
          <CustomText
            fontSize={13}
            style={{ marginHorizontal: 3 }}
            color="white"
          >
            {formatCurrency(portfolioChange)}
            {portfolioChange > 0 ? "+" : ""}
          </CustomText>

          <CustomText fontSize={13} color="white">
            {" "}
            <CustomText fontSize={13} style={{ color: "#35B592" }}>
              {portfolioChangePercentage.toFixed(2)}%
            </CustomText>{" "}
            in 24H
          </CustomText>
        </Box>
      </Box>
    </Box>
  );
};

export default BalanceCard;
