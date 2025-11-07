import {
  ThemedAddressBookIcon,
  ThemedBankAccountIcon,
  ThemedChartIcon,
  ThemedFaceIDIcon,
  ThemedHelpIcon,
  ThemedSignOutIcon,
  ThemedStarFillIcon,
} from "@/assets/svg/wallet-icons-components";
import ThemedNumpadIcon from "@/assets/svg/wallet-icons-components/ThemedNumpadIcon";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { selectBiometricEnabled } from "@/src/modules/settings/presentation/state/settings-slice";
import { kycActions } from "@/state/reducers/kyc-reducer";
import {
  selectWalletConnected,
  selectWalletUser,
  setWalletConnected,
  setWalletUser,
} from "@/state/reducers/wallet.reducer";
import { Theme } from "@/theme";
import { ISidebarItem } from "@/types/SidebarItem";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { Link, Setting4 } from "iconsax-react-nativejs";
import { uniq } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Platform, Pressable } from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import LogoutModal from "../Modals/LogoutModal";
import { PinEntryModal } from "../Modals/PinEntryModal";
import { AnimatedGradientBottomSheetRef } from "../bottomsheets/AnimatedGradientBottomSheet";
import ZapLinkBottomSheet from "../bottomsheets/ZapLinkBottomSheet";
import ZapperSiginBottomSheet from "../bottomsheets/ZapperSiginBottomSheet";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import LearnWithZapCards from "./LearnWithZapCards";
import SidebarItemCard from "./SidebarItemCard";

const Sidebar = () => {
  const [showPinModal, setShowPinModal] = React.useState(false);
  const isConnect = useSelector(selectWalletConnected);
  const dispatch = useDispatch();
  const { setBiometricEnabled } = useSettings();
  const { logoutFromExchange } = useWallet();
  const isBiometricEnabled = useSelector(selectBiometricEnabled);
  const theme = useTheme<Theme>();
  const [hasHardware, setHasHardware] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isZapperBottomSheetVisible, setIsZapperBottomSheetVisible] =
    useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = React.useState(
    pinStorageService.getFaceIdValue()
  );
  const walletUser = useSelector(selectWalletUser);

  const OS = Platform.OS;
  const { getExchangeUser } = useWallet();
  const { isExchangeAuthenticated, exchangeUserData } = useExchangeAuth();
  const { fetchUserById, updateUser } = useKyc();
  const zapLinkBottomSheetRef = useRef<BottomSheet>(null);
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);

  React.useEffect(() => {
    if (isExchangeAuthenticated && !exchangeUserData) {
      (async function () {
        const val = await getExchangeUser();
        const userDetails = await fetchUserById(val);
        updateUser(userDetails.data);
        dispatch(kycActions.setUser(userDetails.data as UserModel));
        dispatch(setWalletUser(userDetails.data as UserModel));
      })();
    }
  }, []);

  const handleConnectZapExchange = useCallback(() => {
    zapLinkBottomSheetRef.current?.close();
    setIsZapperBottomSheetVisible(true);
    setTimeout(() => {
      zapperBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  }, []);

  const handleDisconnectZapExchange = useCallback(async () => {
    try {
      await logoutFromExchange();
      zapLinkBottomSheetRef.current?.close();
    } catch (error) {
      console.error("Logout from exchange failed:", error);
    }
  }, []);

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
    const isEnabled = await pinStorageService.toggleFaceId();
    setFaceIdEnabled(isEnabled);
  };

  const handleCheck = () => {
    if (!isExchangeAuthenticated) {
      setIsZapperBottomSheetVisible(true);
      zapperBottomSheetRef.current?.snapToIndex(0);
    } else {
      router.push("/dashboard/home/wallet-home/more/profile");
    }
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
        <Setting4
          color={theme.colors.bodyTextColor}
          size={20}
          variant="Outline"
        />
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
      onPress: () => {
        setShowPinModal(true);
      },
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
          value={faceIdEnabled}
          onValueChange={() => handleBiometricEnabled()}
          trackColor={{
            false: theme.colors.primaryColor,
            true: theme.colors.primaryColor,
          }}
        />
      ),
    });

  let SIDEBAR_ABOUT_DATA: ISidebarItem[] = [
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
  ];

  if (isExchangeAuthenticated) {
    const items = uniq([
      ...SIDEBAR_ABOUT_DATA,
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
        onPress: () => setShowLogoutModal(true),
        disablClick: false,
      },
    ]);
    SIDEBAR_ABOUT_DATA = items;
  }

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
        <Pressable
          style={{
            backgroundColor: "#12121233",
            width: "100%",
            height: 66,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
          onPress={() => handleCheck()}
        >
          <Box
            width={40}
            height={40}
            borderRadius={20}
            bg="secondaryBackgroundColor"
          >
            {isExchangeAuthenticated && (
              <Pressable
                onPress={() =>
                  router.push("/dashboard/home/wallet-home/more/profile")
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: walletUser?.avatar?.backgroundColor,
                }}
                android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {({ pressed }) => (
                  <Image
                    source={{ uri: walletUser?.avatar?.url }}
                    style={[
                      { width: 40, height: 40, borderRadius: 20 },
                      pressed && { opacity: 0.7 },
                    ]}
                  />
                )}
              </Pressable>
            )}
            {!isExchangeAuthenticated && (
              <Image
                source={require("@/assets/images/personplaceholder.png")}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            )}
          </Box>
          <Box marginLeft="s">
            {isExchangeAuthenticated && (
              <>
                <CustomText variant="bodySubheader" fontSize={16}>
                  {walletUser?.username || "anonymous.zap"}
                </CustomText>
                <Box flexDirection="row" alignItems="center">
                  <CustomText variant="light" fontSize={12}>
                    Connected
                  </CustomText>
                </Box>
              </>
            )}
            {!isExchangeAuthenticated && (
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
        </Pressable>
      </LinearGradient>
      <Box flex={1}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {isExchangeAuthenticated && (
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
          )}

          {isExchangeAuthenticated && (
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
          )}

          {isExchangeAuthenticated && (
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
          )}

          <Box paddingHorizontal="m" marginTop="l" mb="3xl">
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
        </ScrollView>
      </Box>

      <PinEntryModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => setShowPinModal(false)}
        type="SETUP"
      />
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
      {/* <ChangePinBottomSheet ref={changePinRef} /> */}
      {isZapperBottomSheetVisible && (
        <ZapperSiginBottomSheet
          key="zapper-bottom-sheet"
          ref={zapperBottomSheetRef}
          onContinue={() => {
            zapperBottomSheetRef.current?.close();
            setIsZapperBottomSheetVisible(false);
          }}
          onClose={() => {
            setIsZapperBottomSheetVisible(false);
            zapperBottomSheetRef.current?.close();
            zapLinkBottomSheetRef.current?.close();
          }}
        />
      )}
      <ZapLinkBottomSheet
        onDisconnect={handleDisconnectZapExchange}
        onConnect={handleConnectZapExchange}
        isZapLinked={isExchangeAuthenticated}
        username={exchangeUserData?.username}
        onClose={() => zapLinkBottomSheetRef.current?.close()}
        ref={zapLinkBottomSheetRef}
      />
    </Box>
  );
};

export default Sidebar;
