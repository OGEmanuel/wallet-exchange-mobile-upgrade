import {
  ThemedAddressBookIcon,
  ThemedBankAccountIcon,
  ThemedChartIcon,
  ThemedFaceIDIcon,
  ThemedHelpIcon,
  ThemedShieldFillIcon,
  ThemedSignOutIcon,
  ThemedStarFillIcon,
} from "@/assets/svg/wallet-icons-components";
import ThemedNumpadIcon from "@/assets/svg/wallet-icons-components/ThemedNumpadIcon";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { StorageKeys } from "@/src/core/api/models";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { setWalletUser } from "@/state/reducers/wallet.reducer";
import { Theme } from "@/theme";
import { ISidebarItem } from "@/types/SidebarItem";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Link, Setting4 } from "iconsax-react-nativejs";
import { uniq } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, Platform, Pressable } from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import LogoutModal from "../Modals/LogoutModal";
import { PinEntryModal } from "../Modals/PinEntryModal";
import { PinSetupModal } from "../Modals/PinSetupModal";
import { AnimatedGradientBottomSheetRef } from "../bottomsheets/AnimatedGradientBottomSheet";
import ZapLinkBottomSheet from "../bottomsheets/ZapLinkBottomSheet";
import ZapperSiginBottomSheet from "../bottomsheets/ZapperSiginBottomSheet";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import LearnWithZapCards from "./LearnWithZapCards";
import SidebarItemCard from "./SidebarItemCard";

const Sidebar = () => {
  const theme = useTheme<Theme>();
  const {
    logoutFromExchange,
    getExchangeUser,
    exchangeUserData,
    setExchangeUserData,
  } = useWallet();
  const { isExchangeAuthenticated } = useExchangeAuth();

  const [hasHardware, setHasHardware] = useState(false);
  const [isZapperBottomSheetVisible, setIsZapperBottomSheetVisible] =
    useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "logout" | "changePin" | null
  >(null);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [user, setUser] = React.useState<UserModel | null>(null);
  const dispatch = useDispatch();
  const zapLinkBottomSheetRef = useRef<BottomSheet>(null);
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);

  const OS = Platform.OS;

  React.useEffect(() => {
    (async function () {
      if (isExchangeAuthenticated && !user) {
        const data = await getExchangeUser();
        setUser(data);
        dispatch(setWalletUser(data as UserModel));
        console.log("USER DATA", data);
        console.log("WALLET USER", user);
      }
    })();
  }, [isExchangeAuthenticated]);

  // Load biometric preference from SecureStore
  useEffect(() => {
    const loadBiometricPreference = async () => {
      try {
        const value = pinStorageService.getFaceIdValue();
        setIsBiometricEnabled(value);
      } catch (error) {
        console.error("Failed to load biometric preference:", error);
      }
    };
    loadBiometricPreference();
  }, []);

  // Check for biometric hardware
  useEffect(() => {
    const checkBiometricHardware = async () => {
      try {
        const has = await LocalAuthentication.hasHardwareAsync();
        if (has) {
          const types =
            await LocalAuthentication.supportedAuthenticationTypesAsync();
          // Check if device supports biometric authentication
          const hasBiometric = types.length > 0;
          setHasHardware(hasBiometric);
        } else {
          setHasHardware(false);
        }
      } catch (error) {
        console.error("Failed to check biometric hardware:", error);
        setHasHardware(false);
      }
    };
    checkBiometricHardware();
  }, []);

  const handleConnectZapExchange = useCallback(() => {
    zapLinkBottomSheetRef.current?.close();
    setIsZapperBottomSheetVisible(true);
    setTimeout(() => {
      zapperBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  }, []);

  const handleDisconnectZapExchange = async () => {
    try {
      logoutFromExchange().then(() => {
        zapLinkBottomSheetRef.current?.close();
      });
    } catch (error) {
      console.error("Logout from exchange failed:", error);
    }
  };

  const handleBiometricEnabled = useCallback(async () => {
    const newValue = !isBiometricEnabled;
    setIsBiometricEnabled(newValue);
    try {
      await SecureStore.setItemAsync(
        StorageKeys.BIOMETRIC_ENABLED,
        newValue ? "true" : "false"
      );
    } catch (error) {
      console.error("Failed to save biometric preference:", error);
      // Revert state on error
      setIsBiometricEnabled(!newValue);
    }
  }, [isBiometricEnabled]);

  const handleCheck = () => {
    if (!isExchangeAuthenticated || !exchangeUserData?.username) {
      // Not connected - show connect modal
      // zapLinkBottomSheetRef.current?.snapToIndex(0);
      setIsZapperBottomSheetVisible(true);
      zapperBottomSheetRef.current?.snapToIndex(0);
    } else {
      // Connected - go to profile
      router.push("/dashboard/home/wallet-home/more/profile");
    }
  };

  // Protected action handler - requires PIN verification
  const handleProtectedAction = async (
    action: "logout" | "changePin",
    callback: () => void
  ) => {
    try {
      const hasPin = await pinStorageService.hasPin();

      if (hasPin) {
        // PIN exists, show PIN entry modal
        setPendingAction(action);
        setShowPinEntry(true);
      } else {
        // No PIN, proceed directly
        callback();
      }
    } catch (error) {
      console.error("Failed to check PIN status:", error);
      // On error, proceed anyway (fail open for UX)
      callback();
    }
  };

  // Handle PIN verification success
  const handlePinSuccess = useCallback(
    async (pin: string) => {
      setShowPinEntry(false);

      if (pendingAction === "changePin") {
        // Show PIN setup modal to create new PIN
        setShowPinSetup(true);
      }

      setPendingAction(null);
    },
    [pendingAction]
  );

  // Handle PIN modal close
  const handlePinClose = useCallback(() => {
    setShowPinEntry(false);
    setPendingAction(null);
  }, []);

  // Handle logout - open disconnect modal (like swap screen)
  const handleLogout = useCallback(() => {
    zapLinkBottomSheetRef.current?.snapToIndex(1);
    // setShowLogoutModal(true);
  }, []);

  const handleChangePin = useCallback(() => {
    handleProtectedAction("changePin", () => {
      // If no PIN exists, show setup directly
      setShowPinSetup(true);
    });
  }, []);

  const handlePinSetupComplete = useCallback(() => {
    setShowPinSetup(false);
    console.log("✅ PIN changed successfully");
  }, []);

  const handlePinSetupClose = useCallback(() => {
    setShowPinSetup(false);
  }, []);

  // Sidebar data
  const SIDEBAR_DATA: ISidebarItem[] = useMemo(
    () => [
      ...(isExchangeAuthenticated
        ? [
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
          ]
        : []),
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
    ],
    [theme.colors.bodyTextColor, isExchangeAuthenticated]
  );

  const SIDEBAR_SECURITY_DATA: ISidebarItem[] = useMemo(() => {
    const baseData: ISidebarItem[] = [
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
        onPress: handleChangePin,
        disablClick: false,
      },
    ];

    if (hasHardware) {
      baseData.unshift({
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
            onValueChange={handleBiometricEnabled}
            trackColor={{
              false: theme.colors.primaryColor,
              true: theme.colors.primaryColor,
            }}
          />
        ),
      });
    }

    return baseData;
  }, [
    hasHardware,
    isBiometricEnabled,
    theme.colors.bodyTextColor,
    theme.colors.primaryColor,
    handleBiometricEnabled,
    handleChangePin,
  ]);

  let SIDEBAR_ABOUT_DATA: ISidebarItem[] = [
    {
      icon: (
        <ThemedShieldFillIcon
          width={20}
          height={20}
          darkModeColor={theme.colors.bodyTextColor}
          lightModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Terms of Service",
      link: "/dashboard/home/wallet-home/more/legal",
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
      link: "/dashboard/home/wallet-home/more/help",
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
        onPress: () => handleLogout(),
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
            {isExchangeAuthenticated ? (
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
            ) : (
              <Image
                source={require("@/assets/images/personplaceholder.png")}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            )}
          </Box>
          <Box marginLeft="s">
            {isExchangeAuthenticated ? (
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
            ) : (
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
      <Box flex={0.8}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {isExchangeAuthenticated && (
            <Box paddingHorizontal="m" paddingTop="l">
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
                  <SidebarItemCard
                    key={item.title || index.toString()}
                    {...item}
                  />
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
                  <SidebarItemCard
                    key={item.title || index.toString()}
                    {...item}
                  />
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
                <SidebarItemCard
                  key={item.title || index.toString()}
                  {...item}
                />
              ))}
            </Box>
          </Box>
        </ScrollView>
      </Box>
      <Box width={"100%"} height={140}>
        <ScrollView
          horizontal
          contentContainerStyle={{
            width: "100%",
            height: "100%",
            paddingLeft: 20,
            paddingTop: 20,
          }}
        >
          <LearnWithZapCards />
          <LearnWithZapCards />
        </ScrollView>
      </Box>
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
      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
      <PinEntryModal
        type="VERIFY"
        visible={showPinEntry}
        onSuccess={handlePinSuccess}
        onClose={handlePinClose}
      />
      <PinSetupModal
        visible={showPinSetup}
        onClose={handlePinSetupClose}
        onComplete={handlePinSetupComplete}
        skipIntro={true}
      />
    </Box>
  );
};

export default Sidebar;
