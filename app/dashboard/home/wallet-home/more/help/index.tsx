import { ThemedExternalLinkIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Linking, Pressable } from "react-native";

const DATA: { title: string; isExternal: boolean; link?: string }[] = [
  {
    title: "Tutorial",
    link: "/dashboard/home/wallet-home/more/help/tutorials",
    isExternal: false,
  },
  {
    title: "Chat with support",
    link: "https://zap.africa/helpcenter",
    isExternal: true,
  },
  
  {
    title: "FAQs",
    isExternal: true,
    link: "https://zap.africa/article?id=FAQs",
  },
];

const ItemCard = ({
  title,
  isExternal,
  link,
}: {
  title: string;
  isExternal: boolean;
  link?: string;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 50,
      }}
      onPress={() => {
        if (isExternal) {
          Linking.openURL(link as string);
        } else {
          router.push(link as any);
        }
      }}
    >
      <Box>
        <CustomText variant="medium" fontSize={16}>
          {title}
        </CustomText>
      </Box>
      {isExternal && link && <ThemedExternalLinkIcon width={24} height={24} />}

      {!isExternal && link && (
        <ChevronRight
          color={theme.colors.bodyTextColor}
          width={24}
          height={24}
        />
      )}
    </Pressable>
  );
};

const Help = () => {
  const theme = useTheme<Theme>();
  return (
    <PageWrapper>
      <SettingsHeader
        title="Help & Support"
        onBackPress={() => router.back()}
      />
      <Box flex={1} bg="mainBackgroundColor" paddingHorizontal="m">
        {/* <WebView
          startInLoadingState={true}
          source={{ uri: "https://zap.africa/helpcenter" }}
          style={{ flex: 1, backgroundColor: "transparent" }}
          renderLoading={() => (
            <Box
              width={"100%"}
              height={100}
              justifyContent="center"
              alignItems="center"
            >
              <ActivityIndicator
                size={"large"}
                color={theme.colors.primaryColor}
              />
              <CustomText>Loading details</CustomText>
            </Box>
          )}
        /> */}
        {DATA.map((item, index) => (
          <ItemCard key={index.toString()} {...item} />
        ))}
      </Box>
    </PageWrapper>
  );
};

export default Help;
