import { ThemedExternalLinkIcon } from "@/assets/svg/wallet-icons-components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React from "react";
import { Linking, Pressable } from "react-native";

const DATA: { title: string; body?: string; link?: string }[] = [
  {
    title: "Terms of services",
    link: "https://zapwallet.com",
  },
  {
    title: "Privacy policy",
    link: "https://zapwallet.com",
  },
  {
    title: "Version",
    body: "0.1.2",
  },
];

const ItemCard = ({
  title,
  body,
  link,
}: {
  title: string;
  body?: string;
  link?: string;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Box
      width={"100%"}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      height={50}
    >
      <Box>
        <CustomText variant="medium" fontSize={16}>
          {title}
        </CustomText>
        {body && (
          <CustomText variant="body" fontFamily="14" mt="s">
            {body}
          </CustomText>
        )}
      </Box>
      {link && (
        <Pressable onPress={() => Linking.openURL(link)}>
          <ThemedExternalLinkIcon width={24} height={24} />
        </Pressable>
      )}
    </Box>
  );
};

const About = () => {
  return (
    <PageWrapper>
      <SettingsHeader title="About" onBackPress={() => router.back()} />
      <Box paddingHorizontal="m" mt="l">
        {DATA.map((item, index) => (
          <ItemCard key={index.toString()} {...item} />
        ))}
      </Box>
    </PageWrapper>
  );
};

export default About;
