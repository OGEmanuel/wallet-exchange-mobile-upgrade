import {
  ThemedAddressBookIcon,
  ThemedBankAccountIcon,
  ThemedChartIcon,
  ThemedFaceIDIcon,
  ThemedHelpIcon,
  ThemedSignOutIcon,
  ThemedStarFillIcon
} from "@/assets/svg/wallet-icons-components";
import ThemedNumpadIcon from "@/assets/svg/wallet-icons-components/ThemedNumpadIcon";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { StorageKeys } from "@/src/core/api/models";
import { useWallet } from "@/src/core/wallet/wallet-context";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import {
  selectBiometricEnabled,
  toggleBiometric,
} from "@/src/modules/settings/presentation/state/settings-slice";
import { selectUser } from "@/state/reducers/kyc-reducer";
import {
  selectWalletConnected,
  setWalletConnected,
} from "@/state/reducers/wallet.reducer";
import { Theme } from "@/theme";
import { ISidebarItem } from "@/types/SidebarItem";
import { logoutUser } from "@/utils/clear-device-data";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { Link, Setting4 } from "iconsax-react-nativejs";
import React, { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable } from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import ChangePinBottomSheet from "../bottomsheets/preference/ChangePinBottomSheet";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import SidebarItemCard from "./SidebarItemCard";

const Sidebar = () => {
  const isConnect = useSelector(selectWalletConnected);
  const dispatch = useDispatch();
  const { setBiometricEnabled } = useSettings();
  const { logoutFromExchange } = useWallet();
  const user = useSelector(selectUser);
  const isBiometricEnabled = useSelector(selectBiometricEnabled);
  const theme = useTheme<Theme>();
  const { changePinRef } = useBottomSheetRefs();
  const [hasHardware, setHasHardware] = useState(false);
  const OS = Platform.OS;

  useEffect(() => {
    (async () => {
      const has = await LocalAuthentication.hasHardwareAsync();
      if (has) {
        // ANDROID CHECK
        if (Platform.OS === "android" && has) {
          setHasHardware(true);
        } else {
          setHasHardware(false);
        }

        // IOS CHECK
        if (Platform.OS === "ios" && has) {
          setHasHardware(true);
        } else {
          setHasHardware(false);
        }
      } else {
        setHasHardware(false);
      }
    })();
  }, []);

  const handleConnect = () => {
    dispatch(setWalletConnected(!isConnect));
  };

  const handleBiometricEnabled = async () => {
    dispatch(toggleBiometric());
    setBiometricEnabled(
      StorageKeys.BIOMETRIC_ENABLED,
      isBiometricEnabled ? "false" : "true"
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? You will need to sign in again to access your account.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Logout from exchange
              await logoutFromExchange();
              
              // Clear user data
              const success = await logoutUser();
              
              if (success) {
                // Route to select track screen
                router.replace("/select-track");
              } else {
                Alert.alert(
                  "Error",
                  "Failed to logout completely. Please try again."
                );
              }
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert(
                "Error",
                "An error occurred during logout. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // adding the data hear
  const SIDEBAR_DATA: ISidebarItem[] = [
    // {
    //   icon: (
    //     <ThemedResolveChatIcon
    //       width={20}
    //       height={20}
    //       darkModeColor={theme.colors.bodyTextColor}
    //       lightModeColor={theme.colors.bodyTextColor}
    //     />
    //   ),
    //   title: "Wallet Connect",
    //   link: "/dashboard/home/connect",
    //   isActive: false,
    // },
    {
      icon: (
        <ThemedBankAccountIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Bank Accounts",
      link: "/dashboard/home/wallet-home/more/bank",
      isActive: false,
    },
    {
      icon: (
        <ThemedAddressBookIcon
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
        <ThemedChartIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Markets",
      link: "/dashboard/home/market",
      isActive: false,
    },
    // {
    //   icon: (
    //     <ThemedGiftFill3Icon
    //       width={20}
    //       height={20}
    //       darkModeColor={theme.colors.tabBarActiveColor}
    //       lightModeColor={theme.colors.tabBarActiveColor}
    //     />
    //   ),
    //   title: "Affilates & Referrals",
    //   link: "/dashboard/home/reward",
    //   isActive: true,
    // },
    {
      icon: (
        <Setting4 color={theme.colors.bodyTextColor} size={20} variant="Outline" />
      ),
      title: "Preferences",
      link: "/dashboard/home/wallet-home/more/preferences",
      isActive: false,
    },
  ];

  const SIDEBAR_SECURITY_DATA: ISidebarItem[] = [
    {
      icon: (
        <ThemedNumpadIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Change Zap PIN",
      link: "/dashboard/home/wallet-home/more/about",
      isActive: false,
      onPress: () => changePinRef.current?.snapToIndex(1),
      disablClick: false,
    },
  ];

  if (hasHardware)
    SIDEBAR_SECURITY_DATA.unshift({
      icon: (
        <ThemedFaceIDIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Login with FaceID",
      link: "/dashboard/home/about",
      isActive: false,
      disablClick: true,
      trailingItem: (
        <Switch
          value={isBiometricEnabled}
          onValueChange={() => handleBiometricEnabled()}
          trackColor={{
            false: theme.colors.primaryColor,
            true: theme.colors.primaryColor,
          }}
        />
      ),
    });

  const SIDEBAR_ABOUT_DATA: ISidebarItem[] = [
    // {
    //   icon: (
    //     <ThemedShieldFillIcon
    //       width={20}
    //       height={20}
    //       darkModeColor={theme.colors.bodyTextColor}
    //       lightModeColor={theme.colors.bodyTextColor}
    //     />
    //   ),
    //   title: "Terms of Service",
    //   link: "/dashboard/home/security",
    //   isActive: false,
    //   onPress: () => {},
    // },
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
      link: "/dashboard/home/wallet-home/more/help",
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
      link: "/dashboard/home/wallet-home/more/about",
      isActive: false,
    },
    {
      icon: (
        <ThemedSignOutIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Logout",
      link: "/dashboard/home/wallet-home/more/about",
      isActive: false,
      onPress: handleLogout,
      disablClick: false,
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
          height: OS === "ios" ? 150 : 130,
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
            {user && (
              <Pressable
                onPress={() =>
                  router.push("/dashboard/home/wallet-home/more/profile")
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: user?.avatar?.backgroundColor,
                }}
                android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {({ pressed }) => (
                  <Image
                    source={{ uri: user?.avatar?.url }}
                    style={[
                      { width: 40, height: 40, borderRadius: 20 },
                      pressed && { opacity: 0.7 },
                    ]}
                  />
                )}
              </Pressable>
            )}
            {!user && (
              <Image
                source={require("@/assets/images/personplaceholder.png")}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            )}
          </Box>
          <Box marginLeft="s">
            {user && (
              <>
                <CustomText variant="bodySubheader" fontSize={16}>
                  {user?.username || "anonymous.zap"}
                </CustomText>
                <Box flexDirection="row" alignItems="center">
                  <CustomText variant="light" fontSize={12}>
                    Connected
                  </CustomText>
                </Box>
              </>
            )}
            {!user && (
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
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
            <Box justifyContent="center">
              <Switch
                value={isConnect}
                onValueChange={() => handleConnect()}
                trackColor={{
                  false: theme.colors.primaryColor,
                  true: theme.colors.primaryColor,
                }}
              />
            </Box>
          </Box>
          <Box paddingHorizontal="m">
            <Box
              width={"100%"}
              height={"auto"}
              p="s"
              bg="secondaryBackgroundColor"
              borderWidth={1}
              borderColor="borderColor"
              borderRadius={12}
            >
              {SIDEBAR_DATA.map((item, index) => (
                <SidebarItemCard key={index.toString()} {...item} />
              ))}
            </Box>
          </Box>

          <Box paddingHorizontal="m" marginTop="l">
            <CustomText
              variant="bodySubheader"
              fontSize={14}
              color="disabledTextColor"
              marginBottom="m"
            >
              SECURITY
            </CustomText>
            <Box
              width={"100%"}
              height={"auto"}
              p="s"
              bg="secondaryBackgroundColor"
              borderWidth={1}
              borderColor="borderColor"
              borderRadius={12}
            >
              {SIDEBAR_SECURITY_DATA.map((item, index) => (
                <SidebarItemCard key={index.toString()} {...item} />
              ))}
            </Box>
          </Box>

          <Box paddingHorizontal="m" marginTop="l">
            <CustomText
              variant="bodySubheader"
              fontSize={14}
              color="disabledTextColor"
              marginBottom="m"
            >
              ABOUT ZAP
            </CustomText>
            <Box
              width={"100%"}
              height={"auto"}
              p="s"
              bg="secondaryBackgroundColor"
              borderWidth={1}
              borderColor="borderColor"
              borderRadius={12}
            >
              {SIDEBAR_ABOUT_DATA.map((item, index) => (
                <SidebarItemCard key={index.toString()} {...item} />
              ))}
            </Box>
          </Box>
        </ScrollView>
      </Box>
      {/* <Box
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
      </Box> */}
      <ChangePinBottomSheet ref={changePinRef} />
    </Box>
  );
};

export default Sidebar;
