import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Linking, Pressable } from "react-native";

const LEGAL_OPTIONS = [
  {
    title: "Terms of Service",
    url: "https://zap.africa/termsofservice",
  },
  {
    title: "Privacy Policy",
    url: "https://zap.africa/privacypolicy",
  },
];

const LegalOptionCard = ({ title, url }: { title: string; url: string }) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      onPress={() => {
        Linking.openURL(url);
      }}
      style={({ pressed }) => ({
        width: "100%",
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Box
        width="100%"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="l"
      >
        <CustomText variant="medium" fontSize={16}>
          {title}
        </CustomText>
        <ChevronRight
          color={theme.colors.bodyTextColor}
          width={24}
          height={24}
        />
      </Box>
    </Pressable>
  );
};

const Legal = () => {
  return (
    <PageWrapper>
      <SettingsHeader title="Legal" onBackPress={() => router.back()} />
      <Box
        flex={1}
        bg="mainBackgroundColor"
        paddingHorizontal="m"
        paddingTop="l"
      >
        {LEGAL_OPTIONS.map((option, index) => (
          <LegalOptionCard key={index.toString()} {...option} />
        ))}
      </Box>
    </PageWrapper>
  );
};

export default Legal;
