import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { SIZES } from "@/data";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Pressable, ScrollView } from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";

// Initialize dimensions
const { width, height } = Dimensions.get("window");
SIZES.width = width;
SIZES.height = height;

export default function AllNews() {
  const router = useRouter();
  const { currentTokenDetails } = useSelector(
    (state: AppRootState) => state.market
  );

  const theme = useTheme<Theme>();

  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  return (
    <PageWrapper>
      <Box flex={1} paddingBottom="xl">
        {/* Header */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="m"
          paddingVertical="m"
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
          <CustomText
            variant="bodySubheader"
            fontSize={20}
            style={{ fontFamily: "NewScience_Bold" }}
          >
            All News
          </CustomText>
          <Box width={92} />
        </Box>

        {/* News List */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {currentTokenDetails?.tokenNews?.length === 0 ? (
            <Box height="100%" alignItems="center" marginVertical="xl">
              <CustomText
                variant="body"
                fontSize={16}
                color="disabledTextColor"
                textAlign="center"
              >
                No news available at the moment.
              </CustomText>
            </Box>
          ) : (
            <Box width="100%" paddingHorizontal="m" marginTop="s">
              {currentTokenDetails?.tokenNews?.map((news, index) => (
                <Box
                  key={news.id || index}
                  width="100%"
                  bg="secondaryBackgroundColor"
                  borderRadius={16}
                  marginBottom="s"
                  padding="m"
                >
                  <CustomText
                    variant="body"
                    fontSize={14}
                    color="bodyTextColor"
                    marginBottom="s"
                    numberOfLines={2}
                  >
                    {news.title}
                  </CustomText>
                  {news.source?.name && (
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                    >
                      {news.source.name}
                    </CustomText>
                  )}
                  {news.publishedAt && (
                    <CustomText
                      variant="body"
                      fontSize={12}
                      color="disabledTextColor"
                      marginTop="s"
                    >
                      {new Date(news.publishedAt).toLocaleDateString()}
                    </CustomText>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </ScrollView>
      </Box>
    </PageWrapper>
  );
}
