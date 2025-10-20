import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell, Star } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
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

const ArticlePage = () => {
  const { tokenId: rawTokenId, articleId: rawArticleId } = useLocalSearchParams();
  
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

  // Handle different articleId formats
  let articleId: string;
  if (Array.isArray(rawArticleId)) {
    articleId = rawArticleId[0];
  } else if (typeof rawArticleId === "object" && rawArticleId !== null) {
    articleId =
      (rawArticleId as any)?._id ||
      (rawArticleId as any)?.id ||
      JSON.stringify(rawArticleId);
  } else {
    articleId = rawArticleId || "";
  }

  tokenId = String(tokenId);
  articleId = String(articleId);
  const router = useRouter();

  // Redux state
  const selectedToken = useSelector((state: AppRootState) =>
    selectTokenBySupportedCurrencyId(state, tokenId as string)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [article, setArticle] = useState<any>(null);

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Fetch article details
  const fetchArticle = useCallback(async () => {
    if (tokenId && articleId && selectedToken) {
      setIsLoading(true);
      try {
        // This would normally fetch from SDK
        // For now, we'll simulate the data structure
        const mockArticle = {
          id: articleId,
          title: "Bitcoin price soars to a new All Time High after Trump re-election is officially confirmed",
          description: "Bitcoin reaches new heights following political developments",
          url: "https://example.com/article1",
          image: "https://via.placeholder.com/400x300",
          publishedAt: new Date("2024-11-27T10:49:00Z"),
          body: `Bitcoin has reached a new all-time high of $97,000, marking a significant milestone in the cryptocurrency's journey. This surge comes in the wake of Donald J. Trump's re-election, which has been met with optimism by the crypto community.

The price increase reflects growing confidence in Bitcoin as a store of value and hedge against inflation. Market analysts attribute this surge to several factors:

1. **Political Stability**: Trump's re-election has brought a sense of political stability that investors find reassuring.

2. **Crypto-Friendly Policies**: The new administration has shown support for cryptocurrency innovation and regulation.

3. **Institutional Adoption**: Major corporations and financial institutions continue to add Bitcoin to their balance sheets.

4. **Global Economic Factors**: Ongoing inflation concerns and currency devaluation in various countries have driven demand for alternative assets.

The broader cryptocurrency market has also seen significant gains, with Ethereum, Solana, and other major cryptocurrencies following Bitcoin's lead. This suggests a maturing market where Bitcoin's performance influences the entire ecosystem.

Looking ahead, analysts predict continued growth as more institutional investors enter the space and regulatory clarity improves. The combination of technological innovation and mainstream adoption is creating a perfect storm for cryptocurrency growth.

However, investors should remain cautious as the crypto market is known for its volatility. While the long-term outlook remains positive, short-term fluctuations are expected as the market continues to mature.`,
          source: {
            name: "CoinList",
            url: "https://coinlist.com",
            image: "https://via.placeholder.com/30x30"
          }
        };
        
        setArticle(mockArticle);
      } catch (error) {
        console.error("❌ Failed to fetch article:", error);
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [tokenId, articleId, selectedToken]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  if (isLoading) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ZapLoader
            size={100}
            showText={true}
            text="Loading article..."
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

  if (!article) {
    return (
      <PageWrapper>
        <Box flex={1} justifyContent="center" alignItems="center" padding="m">
          <CustomText color="bodyTextColor" textAlign="center" marginBottom="m">
            Article not found
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {/* Article Header */}
        <Box paddingHorizontal="l" marginBottom="l">
          <CustomText
            variant="bodyBold"
            fontSize={24}
            color="headerTextColor"
            lineHeight={32}
            marginBottom="m"
          >
            {article.title}
          </CustomText>

          {/* Source and Date */}
          <Box flexDirection="row" alignItems="center" marginBottom="l">
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
            <Box flexDirection="row" alignItems="center">
              <CustomText
                color="white"
                variant="bodyMedium"
                fontSize={14}
              >
                {article.source?.name || "News"}
              </CustomText>
              <CustomText
                color="placeholderTextColor"
                variant="bodyMedium"
                fontSize={14}
                marginLeft="s"
              >
                • {article.publishedAt
                  ? formatDate(article.publishedAt)
                  : "Today"}
              </CustomText>
            </Box>
          </Box>

          {/* Article Image */}
          {article.image && (
            <Box
              width="100%"
              height={200}
              borderRadius={12}
              marginBottom="l"
              overflow="hidden"
            >
              <Image
                source={{ uri: article.image }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </Box>
          )}

          {/* Article Body */}
          <Box>
            <CustomText
              color="bodyTextColor"
              fontSize={16}
              lineHeight={24}
            >
              {article.body}
            </CustomText>
          </Box>
        </Box>
      </ScrollView>
    </PageWrapper>
  );
};

export default ArticlePage;
