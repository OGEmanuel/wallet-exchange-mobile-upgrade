import {
  ThemedBookIcon,
  ThemedGiftFill3Icon,
  ThemedHeatIcon,
  ThemedHelpIcon,
  ThemedResolveChatIcon,
  ThemedSettingsFillIcon,
  ThemedShieldFillIcon,
  ThemedStarFillIcon,
  ThemedWalletFilledIcon,
} from "@/assets/svg/wallet-icons-components";
import {
  selectWalletConnected,
  setWalletConnected,
} from "@/state/reducers/wallet.reducer";
import { Theme } from "@/theme";
import { ISidebarItem } from "@/types/SidebarItem";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "iconsax-react-nativejs";
import React from "react";
import { Image } from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import LearnWithZapCards from "./LearnWithZapCards";
import SidebarItemCard from "./SidebarItemCard";

const Sidebar = () => {
  const isConnect = useSelector(selectWalletConnected);
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();

  const handleConnect = () => {
    dispatch(setWalletConnected(!isConnect));
  };

  // adding the data hear
  const SIDEBAR_DATA: ISidebarItem[] = [
    {
      icon: (
        <ThemedWalletFilledIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Manage wallet",
      link: "/dashboard/home/wallets",
      isActive: false,
    },
    {
      icon: (
        <ThemedResolveChatIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Wallet Connect",
      link: "/dashboard/home/connect",
      isActive: false,
    },
    {
      icon: (
        <ThemedHeatIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Bank Accounts",
      link: "/dashboard/home/banks",
      isActive: false,
    },
    {
      icon: (
        <ThemedBookIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Address book",
      link: "/dashboard/home/address-book",
      isActive: false,
    },
    {
      icon: (
        <ThemedGiftFill3Icon
          width={20}
          height={20}
          darkModeColor={theme.colors.tabBarActiveColor}
          lightModeColor={theme.colors.tabBarActiveColor}
        />
      ),
      title: "Refer & Earn",
      link: "/dashboard/home/reward",
      isActive: true,
    },
    {
      icon: (
        <ThemedSettingsFillIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Preferences",
      link: "/dashboard/home/preferences",
      isActive: false,
    },
    {
      icon: (
        <ThemedShieldFillIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Security",
      link: "/dashboard/home/security",
      isActive: false,
    },
    {
      icon: (
        <ThemedHelpIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Help & Support",
      link: "/dashboard/home/help",
      isActive: false,
    },
    {
      icon: (
        <ThemedStarFillIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "About Zap Wallet",
      link: "/dashboard/home/about",
      isActive: false,
    },
  ];
  return (
    <Box flex={1} bg="mainBackgroundColor">
      <LinearGradient
        colors={["#6045FF", "#1B1251"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          width: "100%",
          height: 150,
          paddingHorizontal: 20,
          paddingBottom: 10,
          justifyContent: "flex-end",
        }}
      >
        <Box
          width="100%"
          height={66}
          borderRadius={8}
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="m"
          style={{ backgroundColor: "#12121233" }}
        >
          <Box
            width={40}
            height={40}
            borderRadius={20}
            bg="secondaryBackgroundColor"
          >
            {isConnect && (
              <Image
                source={require("@/assets/images/avatar.png")}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            )}
            {!isConnect && (
              <Image
                source={require("@/assets/images/personplaceholder.png")}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            )}
          </Box>
          <Box marginLeft="s">
            {isConnect && (
              <>
                <CustomText variant="bodySubheader" fontSize={16}>
                  lekkymoney.zap
                </CustomText>
                <Box flexDirection="row" alignItems="center">
                  <CustomText variant="light" fontSize={12}>
                    Connected
                  </CustomText>
                </Box>
              </>
            )}
            {!isConnect && (
              <>
                <CustomText variant="bodySubheader" fontSize={16}>
                  anonymous.zap
                </CustomText>
                <Box flexDirection="row" alignItems="center">
                  <CustomText variant="light" fontSize={12}>
                    Connect to zap
                  </CustomText>
                  <Link
                    variant="Outline"
                    color={theme.colors.bodyTextColor}
                    size={20}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </LinearGradient>
      <Box flex={1}>
        <ScrollView>
          <Box
            width="100%"
            height={70}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingHorizontal="m"
          >
            <Box>
              <CustomText variant="bodySubheader" fontSize={16}>
                Simple mode
              </CustomText>
              <CustomText fontSize={12}>
                Provide easy use for beginners
              </CustomText>
            </Box>
            <Switch
              value={isConnect}
              onValueChange={() => handleConnect()}
              trackColor={{
                false: theme.colors.primaryColor,
                true: theme.colors.primaryColor,
              }}
            />
          </Box>
          {SIDEBAR_DATA.map((item, index) => (
            <SidebarItemCard key={index.toString()} {...item} />
          ))}
        </ScrollView>
      </Box>
      <Box
        width="100%"
        height={170}
        borderTopWidth={1}
        borderTopColor="borderColor"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        >
          <LearnWithZapCards />
          <LearnWithZapCards />
          <LearnWithZapCards />
          <LearnWithZapCards />
        </ScrollView>
      </Box>
    </Box>
  );
};

export default Sidebar;
