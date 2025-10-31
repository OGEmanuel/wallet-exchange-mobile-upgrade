import icons from "@/assets/icons";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import { Box, CustomText } from "@/components/general";
import { showErrorToast, showSuccessToast } from "@/src/core/utils/toast-utils";
import { MarketTokenModel } from "@/src/modules/market/domain/entities/models/market-token-model";
import useMarket from "@/src/modules/market/presentation/hooks/useMarket";
import { marketActions } from "@/src/modules/market/presentation/state/market-slice";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import TokenImage from "./TokenImage";
import TouchableIcon from "./TouchableIcon";

interface AssetHeaderProps {
  asset?: any;
  logo?: string;
  symbol?: string;
  parsedAsset?: MarketTokenModel | null;
  currencyId?: string;
}

const AssetHeader: React.FC<AssetHeaderProps> = ({
  asset,
  logo,
  symbol,
  parsedAsset,
  currencyId,
}) => {
  const router = useRouter();
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { addToWatchlist, removeFromWatchlist } = useMarket();
  const { watchlistTokens } = useSelector(
    (state: AppRootState) => state.market
  );
  const user = useSelector((state: AppRootState) => state.kyc.user);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  const tokenSymbol = symbol || 
                     parsedAsset?.currencyId?.symbol || 
                     parsedAsset?.symbol || 
                     asset?.currencyId?.symbol || 
                     asset?.symbol || 
                     asset || 
                     "Unknown";
  const tokenLogo =
    logo ||
    parsedAsset?.currencyId?.logo ||
    asset?.currencyId?.logo ||
    asset?.logo ||
    "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";

  // Check if token is in watchlist
  const isTokenInWatchlist = (currencyId: string) => {
    const result =
      watchlistTokens?.some((item) => {
        // console.log("Checking item:", item.currencyId, "against:", currencyId);
        return item.currencyId === currencyId;
      }) || false;
    // console.log("isTokenInWatchlist result:", result);
    return result;
  };

  // Get watchlist item for removal
  const getWatchlistItem = (currencyId: string) => {
    return watchlistTokens?.find((item) => item.currencyId === currencyId);
  };

  const handleShareCard = () => {
    router.push({
      pathname: "/dashboard/home/market/share",
      params: {
        asset: JSON.stringify(parsedAsset),
      },
    });
  };

  const handleAddToWatchlist = async () => {
    console.log("=== WATCHLIST DEBUG ===");
    console.log("user._id:", user?._id);
    console.log("currencyId:", currencyId);
    console.log("watchlistTokens:", watchlistTokens);

    if (!user?._id || !currencyId) {
      showErrorToast("Please log in to manage watchlist");
      return;
    }

    setIsWatchlistLoading(true);

    try {
      const isInWatchlist = isTokenInWatchlist(currencyId);
      // console.log("isTokenInWatchlist:", isInWatchlist);

      if (isInWatchlist) {
        // Remove from watchlist
        const watchlistItem = getWatchlistItem(currencyId);
        // console.log("watchlistItem for removal:", watchlistItem);

        if (watchlistItem?._id) {
          // console.log(
          //   "Calling removeFromWatchlist API with ID:",
          //   watchlistItem._id
          // );
          const response = await removeFromWatchlist({
            body: watchlistItem._id,
            params: {},
            extra: null,
          });

          console.log("Remove API response:", response);

          if (response?.success) {
            // Update Redux state with currencyId for filtering
            console.log(
              "Dispatching removeFromWatchlist with currencyId:",
              currencyId
            );
            dispatch(marketActions.removeFromWatchlist(currencyId));
            showSuccessToast("Removed from watchlist");
          } else {
            console.log("Remove API failed:", response);
            showErrorToast("Failed to remove from watchlist");
          }
        } else {
          console.log("No watchlist item found with _id");
          showErrorToast("Watchlist item not found");
        }
      } else {
        console.log("Adding to watchlist...");
        const response = await addToWatchlist({
          body: {
            userId: user._id,
            currencyId: currencyId,
          },
          params: {},
          extra: null,
        });

        // console.log("Add API response:", response);

        if (response?.data) {
          showSuccessToast("Added to watchlist");
        } else {
          showErrorToast("Failed to add to watchlist");
        }
      }
    } catch (error) {
      console.log("Watchlist error:", error);
      showErrorToast("Failed to update watchlist");
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  const handleAddToPriceAlert = () => {
    router.push({
      pathname: "/dashboard/home/market/create-price-alert",
      params: {
        asset: JSON.stringify(parsedAsset),
      },
    });
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
          onPress={() => router.back()}
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

      <Pressable
        onPress={() => {
          // Navigate to unified token details page
          router.push(`/dashboard/home/token-details/${currencyId || (parsedAsset as any)?._id}`);
        }}
        style={({ pressed }) => ({
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
        })}
        android_ripple={{
          color: "rgba(255,255,255,0.1)",
          borderless: false,
        }}
      >
        <TokenImage uri={tokenLogo} name={tokenSymbol} size={24} />
        <CustomText
          variant="bodySubheader"
          fontSize={16}
          style={{ fontFamily: "NewScience_Bold" }}
        >
          {tokenSymbol}
        </CustomText>
      </Pressable>

      <Box flexDirection="row" gap="m" width={92} justifyContent="flex-end">
        <TouchableIcon source={icons.alert} onPress={handleAddToPriceAlert} />
        <TouchableIcon
          source={icons.star}
          onPress={handleAddToWatchlist}
          tintColor={isTokenInWatchlist(currencyId || "") ? "green" : undefined}
          disabled={isWatchlistLoading}
        />
        <TouchableIcon source={icons.share} onPress={handleShareCard} />
      </Box>
    </Box>
  );
};

export default AssetHeader;

//asset history
//watchlist tab
//look into share card
