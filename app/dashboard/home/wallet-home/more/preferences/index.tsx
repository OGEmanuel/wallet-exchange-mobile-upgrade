import { ThemedThemeIcon } from "@/assets/svg/wallet-icons-components";
import AppearanceBottomSheet from "@/components/bottomsheets/preference/AppearanceBottomSheet";
import ChangeCurrencyBottomSheet from "@/components/bottomsheets/preference/ChangeCurrencyBottomSheet";
import LanguageBottomSheet from "@/components/bottomsheets/preference/LanguageBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Money4 } from "iconsax-react-nativejs";
import { Bell, ChevronRight, Speech } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

interface ItemCardProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const ItemCard = ({ title, icon, onPress }: ItemCardProps) => {
  const theme = useTheme<Theme>();

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box flexDirection="row" alignItems="center">
        {icon}
        <CustomText variant="medium" fontSize={16} ml="m">
          {title}
        </CustomText>
      </Box>

      <ChevronRight size={25} color={theme.colors.bodyTextColor} />
    </Pressable>
  );
};

const Index = () => {
  const theme = useTheme<Theme>();
  const {
    currencyBottomSheetRef,
    languageBottomSheetRef,
    appearanceBottomSheetRef,
  } = useBottomSheetRefs();
  const items: ItemCardProps[] = [
    {
      title: "Default Currency",
      icon: (
        <Money4 width={24} height={24} color={theme.colors.bodyTextColor} />
      ),
      onPress: () => currencyBottomSheetRef.current?.snapToIndex(1),
    },
    {
      title: "Appearance",
      icon: (
        <ThemedThemeIcon
          width={24}
          height={24}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      onPress: () => appearanceBottomSheetRef.current?.snapToIndex(1),
    },
    {
      title: "Notifications",
      icon: <Bell width={24} height={24} color={theme.colors.bodyTextColor} />,
      onPress: () =>
        router.push(
          "/dashboard/home/wallet-home/more/preferences/notifications"
        ),
    },
    {
      title: "Language",
      icon: (
        <Speech width={24} height={24} color={theme.colors.bodyTextColor} />
      ),
      onPress: () => languageBottomSheetRef.current?.snapToIndex(1),
    },
    // {
    //   title: "App Icon",
    //   icon: <Bell width={24} height={24} color={theme.colors.bodyTextColor} />,
    //   onPress: () => {},
    // },
  ];
  return (
    <PageWrapper>
      <SettingsHeader title="Preferences" onBackPress={() => router.back()} />
      <Box flex={1} paddingHorizontal="m" paddingTop="l">
        <Box
          borderRadius={12}
          borderWidth={1}
          borderColor="borderColor"
          p="s"
          bg="secondaryBackgroundColor"
        >
          {items.map((item, index) => (
            <ItemCard key={index.toString()} {...item} />
          ))}
        </Box>
      </Box>
      <ChangeCurrencyBottomSheet ref={currencyBottomSheetRef} />
      <LanguageBottomSheet ref={languageBottomSheetRef} />
      <AppearanceBottomSheet ref={appearanceBottomSheetRef} />
    </PageWrapper>
  );
};

export default Index;
