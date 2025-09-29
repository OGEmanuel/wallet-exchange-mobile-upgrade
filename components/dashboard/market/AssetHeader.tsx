import icons from "@/assets/icons";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import { Box, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { SvgXml } from "react-native-svg";
import TokenImage from "./TokenImage";
import TouchableIcon from "./TouchableIcon";

interface AssetHeaderProps {
  asset?: any;
}

const AssetHeader: React.FC<AssetHeaderProps> = ({ asset }) => {
  const router = useRouter();
  const theme = useTheme<Theme>();

  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  const tokenSymbol = asset?.currencyId?.symbol || "BTC";
  const tokenLogo =
    asset?.currencyId?.logo ||
    "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";

  const handleBack = () => {
    router.back();
  };

  const handleShareCard = () => {
    console.log("Share card functionality");
  };

  const handleAddToWatchlist = () => {
    console.log("Add to watchlist functionality");
  };

  const handleAddToPriceAlert = () => {
    console.log("Add price alert functionality");
  };

  return (
    <Box
      borderBottomWidth={0.3}
      borderBottomColor="disabledTextColor"
      height={56}
      width="100%"
      paddingHorizontal="m"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box width={92}>
        <Pressable
          onPress={handleBack}
          style={{
            width: 24,
            height: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
          android_ripple={{
            color: "rgba(255,255,255,0.1)",
            borderless: true,
          }}
        >
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
      </Box>

      <Box flexDirection="row" gap="s" alignItems="center">
        <TokenImage uri={tokenLogo} name={tokenSymbol} size={24} />
        <CustomText
          variant="bodySubheader"
          fontSize={16}
          style={{ fontFamily: "NewScience_Bold" }}
        >
          {tokenSymbol}
        </CustomText>
      </Box>

      <Box flexDirection="row" gap="m" width={92} justifyContent="flex-end">
        <TouchableIcon source={icons.alert} onPress={handleAddToPriceAlert} />
        <TouchableIcon source={icons.star} onPress={handleAddToWatchlist} />
        <TouchableIcon source={icons.share} onPress={handleShareCard} />
      </Box>
    </Box>
  );
};

export default AssetHeader;
