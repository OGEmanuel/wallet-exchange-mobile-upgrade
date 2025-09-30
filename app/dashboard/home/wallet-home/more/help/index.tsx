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
    title: "Chat with support",
    link: "/dashboard/home/wallet-home/more/help/chat",
    isExternal: false,
  },
  {
    title: "Tutorial",
    link: "/dashboard/home/wallet-home/more/help/tutorials",
    isExternal: false,
  },
  {
    title: "FAQs",
    isExternal: true,
    link: "https://www.zapwallet.com/help",
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
  return (
    <PageWrapper>
      <SettingsHeader
        title="Help & Support"
        onBackPress={() => router.back()}
      />
      <Box
        flex={1}
        bg="mainBackgroundColor"
        paddingHorizontal="m"
        paddingTop="l"
      >
        {DATA.map((item, index) => (
          <ItemCard key={index.toString()} {...item} />
        ))}
      </Box>
    </PageWrapper>
  );
};

export default Help;
