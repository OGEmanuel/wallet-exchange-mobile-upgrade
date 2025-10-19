import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell, Star } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";

import ZapLogo from "@/assets/svg/wallet-icons-components/ZapLogo";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import PageWrapper from "@/components/general/PageWrapper";
import ZapLoader from "@/components/general/ZapLoader";
import { formatDate } from "@/src/core/utils/format-utils";
import { AppRootState } from "@/state";
import { selectTokenBySupportedCurrencyId } from "@/state/selectors/portfolio.selectors";
import { Theme } from "@/theme";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { SvgUri } from "react-native-svg";

// CryptoIcon component for token images
const CryptoIcon = ({
  image,
  size = 32,
  symbol,
}: {
  image?: string;
  size?: number;
  symbol?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      width={size}
      height={size}
      borderRadius={size / 2}
      overflow="hidden"
      justifyContent="center"
      alignItems="center"
      borderWidth={0}
      style={{ backgroundColor: "transparent" }}
    >
      {image && !imageError ? (
        <SvgUri
          uri={image}
          width={size - 4}
          height={size - 4}
          onError={() => {
            console.log("Failed to load token image:", image);
            setImageError(true);
          }}
        />
      ) : symbol ? (
        <CustomText fontSize={size * 0.4} color="white" fontWeight="bold">
          {symbol.charAt(0)}
        </CustomText>
      ) : (
        <ZapLogo />
      )}
    </Box>
  );
};

const NewsPage = () => {
  const { tokenId: rawTokenId } = useLocalSearchParams();
  
  // Handle different tokenId formats
  let tokenId: string;
  if (Array.isArray(rawTokenId)) {
    tokenId = rawTokenId[0];
  } else if (typeof rawTokenId === "object" && rawTokenId !== null) {
    tokenId =
      (rawTokenId as any)?._id ||
      (rawTokenId as any)?.id ||
      JSON.stringify(rawTokenId);
  } else {
    tokenId = rawTokenId || "";
  }

  tokenId = String(tokenId);
  const router = useRouter();
  const theme = useTheme<Theme>();

  // Redux state
  const selectedToken = useSelector((state: AppRootState) =>
    selectTokenBySupportedCurrencyId(state, tokenId as string)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<any>(null);

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Fetch token details and news
  const fetchTokenDetails = useCallback(async () => {
    if (tokenId && selectedToken) {
      setIsLoading(true);
      try {
        // This would normally fetch from SDK
        // For now, we'll simulate the data structure
        setTokenDetails({
          tokenNews: [
            {
              id: "1",
              title: "Bitcoin price soars to a new All Time High after Trump re-election is officially confirmed",
              description: "Bitcoin reaches new heights following political developments",
              url: "https://example.com/article1",
              image: "https://via.placeholder.com/300x200",
              publishedAt: new Date("2024-11-27T10:49:00Z"),
              body: "Bitcoin has reached a new all-time high of $97,000...",
              source: {
                name: "CoinList",
                url: "https://coinlist.com",
                image: "https://via.placeholder.com/30x30"
              }
            },
            {
              id: "2", 
              title: "Ethereum 2.0 upgrade shows promising results",
              description: "Latest Ethereum upgrade demonstrates improved performance",
              url: "https://example.com/article2",
              image: "https://via.placeholder.com/300x200",
              publishedAt: new Date("2024-11-26T15:30:00Z"),
              body: "The Ethereum 2.0 upgrade has shown significant improvements...",
              source: {
                name: "CryptoNews",
                url: "https://cryptonews.com",
                image: "https://via.placeholder.com/30x30"
              }
            },
            {
              id: "3",
              title: "Solana ecosystem continues to expand",
              description: "New projects and partnerships announced",
              url: "https://example.com/article3", 
              image: "https://via.placeholder.com/300x200",
              publishedAt: new Date("2024-11-25T09:15:00Z"),
              body: "The Solana ecosystem has seen remarkable growth...",
              source: {
                name: "SolanaNews",
                url: "https://solananews.com",
                image: "https://via.placeholder.com/30x30"
              }
            }
          ]
        });
      } catch (error) {
        console.error("❌ Failed to fetch token details:", error);
        setTokenDetails(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [tokenId, selectedToken]);

  useEffect(() => {
    fetchTokenDetails();
  }, [fetchTokenDetails]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchTokenDetails();
    } catch (error) {
      console.error("❌ Failed to refresh news:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTokenDetails]);

  const handleArticlePress = (articleId: string) => {
    router.push(`/dashboard/home/token-details/${tokenId}/news/${articleId}`);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ZapLoader
            size={100}
            showText={true}
            text="Loading news..."
          />
        </Box>
      </PageWrapper>
    );
  }

  if (!selectedToken) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center" padding="m">
          <CustomText color="bodyTextColor" textAlign="center" marginBottom="m">
            Token not found
          </CustomText>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="l"
        paddingBottom="m"
        paddingTop="m"
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <ArrowLeft2 size={24} color="white" />
        </Pressable>

        <Box flexDirection="row" alignItems="center">
          <Box marginRight="s">
            <CryptoIcon
              image={selectedToken.image}
              size={32}
              symbol={selectedToken.symbol}
            />
          </Box>
          <CustomText variant="header" fontSize={18} color="white">
            {selectedToken.name || selectedToken.symbol}
          </CustomText>
        </Box>

        <Box flexDirection="row" alignItems="center" gap="m">
          <Pressable onPress={handleFavorite}>
            <Star
              size={20}
              color={isFavorite ? "yellow" : "white"}
              fill={isFavorite ? "yellow" : "transparent"}
            />
          </Pressable>
          <Bell size={20} color="white" />
        </Box>
      </Box>

      {/* News Title */}
      <Box paddingHorizontal="l" marginBottom="l">
        <CustomText
          variant="bodyBold"
          fontSize={24}
          color="headerTextColor"
        >
          News
        </CustomText>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primaryColor}
            colors={[theme.colors.primaryColor]}
          />
        }
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {tokenDetails?.tokenNews && tokenDetails.tokenNews.length > 0 ? (
          tokenDetails.tokenNews.map((article: any, index: number) => (
            <Pressable
              key={article.id || index}
              onPress={() => handleArticlePress(article.id || index.toString())}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                marginBottom: index !== tokenDetails.tokenNews.length - 1 ? 12 : 0,
              })}
            >
              <Box
                backgroundColor="modalBackgroundColor"
                borderRadius={20}
                padding="m"
                marginHorizontal="l"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Box marginBottom="s">
                  <Box flexDirection="row" alignItems="center" mb="s">
                    {/* Article Image */}
                    <Box
                      width={30}
                      height={30}
                      borderRadius={5}
                      backgroundColor="borderColor"
                      marginRight="s"
                      overflow="hidden"
                    >
                      {article?.source?.image ? (
                        <Image
                          source={{ uri: article.source.image }}
                          style={{
                            width: "100%",
                            height: "100%",
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Box
                          flex={1}
                          justifyContent="center"
                          alignItems="center"
                          backgroundColor="borderColor"
                        >
                          <CustomText fontSize={24}>📰</CustomText>
                        </Box>
                      )}
                    </Box>
                    <Box
                      borderRadius={6}
                      flexDirection="row"
                      alignItems="center"
                      flex={1}
                    >
                      <CustomText
                        color="white"
                        variant="bodyMedium"
                        verticalAlign="middle"
                        fontSize={14}
                        height="100%"
                      >
                        {article.source?.name || "News"}
                      </CustomText>
                      <CustomText
                        color="placeholderTextColor"
                        variant="bodyMedium"
                        fontSize={14}
                      >
                        {" "}
                        •{" "}
                        {article.publishedAt
                          ? formatDate(article.publishedAt)
                          : "Today"}
                      </CustomText>
                    </Box>
                  </Box>

                  {/* Article Content */}
                  <Box flex={1}>
                    <Box
                      marginBottom="s"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <CustomText
                        color="headerTextColor"
                        fontSize={15}
                        variant="body"
                        lineHeight={20}
                        numberOfLines={2}
                        flex={1}
                      >
                        {article.title || "Latest news about this token"}
                      </CustomText>
                      <Box
                        width={80}
                        height={80}
                        marginLeft="s"
                        borderRadius={10}
                        overflow="hidden"
                      >
                        {article.image ? (
                          <Image
                            source={{ uri: article.image }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        ) : null}
                      </Box>
                    </Box>

                    <Box flexDirection="row" alignItems="center">
                      <CustomText
                        color="placeholderTextColor"
                        variant="bodyMedium"
                        fontSize={14}
                      >
                        {article.publishedAt
                          ? new Date(
                              article.publishedAt
                            ).toLocaleTimeString()
                          : "Now"}
                      </CustomText>
                      <CustomText
                        color="placeholderTextColor"
                        variant="bodyMedium"
                        fontSize={14}
                      >
                        {" "}
                        •{" "}
                        {article.publishedAt
                          ? formatDate(article.publishedAt)
                          : "Today"}
                      </CustomText>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Pressable>
          ))
        ) : (
          <Box
            backgroundColor="modalBackgroundColor"
            borderRadius={20}
            padding="xl"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
            marginHorizontal="l"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <CustomText
              variant="bodyBold"
              fontSize={16}
              color="headerTextColor"
              marginBottom="s"
              textAlign="center"
            >
              No News Available
            </CustomText>
            <CustomText
              color="bodyTextColor"
              textAlign="center"
              fontSize={14}
              lineHeight={20}
            >
              Check back later for the latest news about{" "}
              {selectedToken.symbol}
            </CustomText>
          </Box>
        )}
      </ScrollView>
    </PageWrapper>
  );
};

export default NewsPage;
