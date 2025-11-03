import { ThemedThemeIcon } from "@/assets/svg/wallet-icons-components";
import AppearanceBottomSheet from "@/components/bottomsheets/preference/AppearanceBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomText, PageWrapper } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { Money4 } from "iconsax-react-nativejs";
import { Bell, ChevronRight, Speech } from "lucide-react-native";
import React, { useMemo } from "react";
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
      style={({ pressed }) => ({
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: pressed ? 0.5 : 1,
        marginBottom: 5,
      })}
    >
      <Box flexDirection="row" alignItems="center">
        {icon}
        <CustomText variant="bodyMedium" fontSize={16} ml="m">
          {title}
        </CustomText>
      </Box>

      <ChevronRight size={20} color={theme.colors.bodyTextColor} />
    </Pressable>
  );
};

const PreferencesIndex = () => {
  const theme = useTheme<Theme>();
  const { appearanceBottomSheetRef } = useBottomSheetRefs();

  const items: ItemCardProps[] = useMemo(
    () => [
      {
        title: "Default Currency",
        icon: (
          <Money4 width={24} height={24} color={theme.colors.bodyTextColor} />
        ),
        onPress: () => {
          // TODO: Implement currency selection bottom sheet
          console.log("Currency selection not yet implemented");
        },
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
        icon: (
          <Bell width={24} height={24} color={theme.colors.bodyTextColor} />
        ),
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
        onPress: () => {
          // TODO: Implement language selection bottom sheet
          console.log("Language selection not yet implemented");
        },
      },
      // {
      //   title: "App Icon",
      //   icon: <Bell width={24} height={24} color={theme.colors.bodyTextColor} />,
      //   onPress: () => {},
      // },
    ],
    [theme.colors.bodyTextColor, appearanceBottomSheetRef]
  );

  return (
    <PageWrapper>
      <SettingsHeader title="Preferences" onBackPress={() => router.back()} />
      <Box flex={1} paddingHorizontal="m" paddingTop="l">
        {items.map((item) => (
          <ItemCard key={item.title} {...item} />
        ))}
      </Box>
      <AppearanceBottomSheet ref={appearanceBottomSheetRef} />
    </PageWrapper>
  );
};

export default PreferencesIndex;
