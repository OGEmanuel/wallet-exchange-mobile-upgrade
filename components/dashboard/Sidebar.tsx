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
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import { StorageKeys } from "@/src/core/storage/storage-types";
import { useWallet } from "@/src/core/wallet/wallet-context";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { ISidebarItem } from "@/types/SidebarItem";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Link, Setting4 } from "iconsax-react-nativejs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Keyboard, Platform, Pressable } from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { AnimatedGradientBottomSheetRef } from "../bottomsheets/AnimatedGradientBottomSheet";
import ZapLinkBottomSheet from "../bottomsheets/ZapLinkBottomSheet";
import ZapperSiginBottomSheet from "../bottomsheets/ZapperSiginBottomSheet";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import SmartImage from "../general/SmartImage";
import { PinEntryModal } from "../Modals/PinEntryModal";
import { PinSetupModal } from "../Modals/PinSetupModal";
import LearnWithZapCards from "./LearnWithZapCards";
import SidebarItemCard from "./SidebarItemCard";

const Sidebar = () => {
  const theme = useTheme<Theme>();
  const { logoutFromExchange, currentExchangeUser, getExchangeUser, setExchangeUserData } = useWallet();
  const { isExchangeAuthenticated, isUserLoggedIn, exchangeUserData } = useExchangeAuth();
  const { user: kycUser } = useSelector((state: AppRootState) => state.kyc);
  const { loadUserFromStorage, fetchUserById } = useKyc();
  
  // Use exchangeUserData if available, otherwise fall back to KYC user
  const userData = exchangeUserData || kycUser;
  const displayUsername = userData?.username;
  const displayAvatar = userData?.avatar;
  // User is logged in if they have a username OR if they have an exchange user ID

  // Load user data from storage or fetch if we have a user ID but no user data
  useEffect(() => {
    const loadUserData = async () => {
      // If we have user data, no need to load
      if (userData?.username || userData?._id) {
        return;
      }

      // Try to load from storage first
      if (!kycUser?._id && !kycUser?.username) {
        const storedUser = await loadUserFromStorage();
        if (storedUser) {
          return; // User loaded from storage, will update Redux state
        }
      }

      // If we have a user ID but no user data, try to fetch
      if (currentExchangeUser && !exchangeUserData) {
        try {
          const user = await getExchangeUser();
          if (user) {
            setExchangeUserData(user);
          }
        } catch (error) {
          console.error("Failed to fetch exchange user:", error);
        }
      }

      // If we have KYC user ID but no username, try to fetch user by ID
      if (kycUser?._id && !kycUser?.username && isExchangeAuthenticated) {
        try {
          await fetchUserById(kycUser);
        } catch (error) {
          console.error("Failed to fetch user by ID:", error);
        }
      }
    };

    loadUserData();
  }, [currentExchangeUser, exchangeUserData, kycUser, isExchangeAuthenticated, loadUserFromStorage, getExchangeUser, setExchangeUserData, fetchUserById, userData]);

  const [hasHardware, setHasHardware] = useState(false);
  const [isZapperBottomSheetVisible, setIsZapperBottomSheetVisible] =
    useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "logout" | "changePin" | "disableBiometric" | null
  >(null);
  const zapLinkBottomSheetRef = useRef<BottomSheet>(null);
  const zapperBottomSheetRef = useRef<AnimatedGradientBottomSheetRef>(null);

  const OS = Platform.OS;

  // Dismiss keyboard when component mounts to prevent auto-focus issues
  useEffect(() => {
    Keyboard.dismiss();
  }, []);

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

    // If enabling biometrics, authenticate first to ensure it works
    if (newValue && hasHardware) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Enable Face ID / Biometric authentication",
          cancelLabel: "Cancel",
          disableDeviceFallback: false,
        });

        if (!result.success) {
          console.log("Biometric authentication cancelled or failed");
          // Don't enable if authentication failed
          return;
        }
      } catch (error) {
        console.error("Biometric authentication error:", error);
        // Don't enable on error
        return;
      }
    }

    // If disabling biometrics, require authentication (biometric or PIN)
    if (!newValue) {
      let authenticated = false;

      // Try biometric first if it's currently enabled
      if (isBiometricEnabled && hasHardware) {
        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Disable Face ID / Biometric authentication",
            cancelLabel: "Cancel",
            disableDeviceFallback: false,
          });

          if (result.success) {
            authenticated = true;
          } else {
            console.log("Biometric authentication cancelled or failed");
            // Fall through to PIN verification
          }
        } catch (error) {
          console.error("Biometric authentication error:", error);
          // Fall through to PIN verification
        }
      }

      // If biometric didn't succeed, check for PIN
      if (!authenticated) {
        try {
          const hasPin = await pinStorageService.hasPin();
          if (hasPin) {
            // Show PIN entry modal
            setPendingAction("disableBiometric");
            setShowPinEntry(true);
            return; // Wait for PIN verification
          } else {
            // No PIN available, don't allow disabling
            console.log("Cannot disable biometric: No PIN available");
            return;
          }
        } catch (error) {
          console.error("Failed to check PIN status:", error);
          // If we can't check PIN, don't allow disabling
          return;
        }
      }
      // If authenticated via biometric, continue to save preference below
    }

    // Save preference (only reached if authentication succeeded)
    setIsBiometricEnabled(newValue);
    try {
      await SecureStore.setItemAsync(
        StorageKeys.BIOMETRIC_ENABLED,
        newValue ? "true" : "false"
      );
      console.log(
        `✅ Biometric authentication ${newValue ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("Failed to save biometric preference:", error);
      // Revert state on error
      setIsBiometricEnabled(!newValue);
    }
  }, [isBiometricEnabled, hasHardware]);

  const handleCheck = () => {
    if (!isUserLoggedIn) {
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
      } else if (pendingAction === "disableBiometric") {
        // Disable biometric after PIN verification
        setIsBiometricEnabled(false);
        try {
          await SecureStore.setItemAsync(
            StorageKeys.BIOMETRIC_ENABLED,
            "false"
          );
          console.log("✅ Biometric authentication disabled");
        } catch (error) {
          console.error("Failed to save biometric preference:", error);
          // Revert state on error
          setIsBiometricEnabled(true);
        }
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
      ...(isUserLoggedIn
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
    [theme.colors.bodyTextColor, isUserLoggedIn]
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

  const SIDEBAR_ABOUT_DATA: ISidebarItem[] = useMemo(
    () => {
      const baseData: ISidebarItem[] = [
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

      // Add logout button only if authenticated (not guest)
      if (isUserLoggedIn) {
        baseData.push({
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
        });
      }

      return baseData;
    },
    [theme.colors.bodyTextColor, handleLogout, isUserLoggedIn]
  );

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
            {displayAvatar ? (
              <Pressable
                onPress={() =>
                  router.push("/dashboard/home/wallet-home/more/profile")
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: displayAvatar?.backgroundColor,
                }}
                android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {({ pressed }) => (
                  <SmartImage
                    source={{ uri: displayAvatar?.url || "" }}
                    width={40}
                    height={40}
                    borderRadius={20}
                    style={pressed ? { opacity: 0.7 } : undefined}
                  />
                )}
              </Pressable>
            ) : (
              <SmartImage
                source={require("@/assets/images/personplaceholder.png")}
                width={40}
                height={40}
                borderRadius={20}
              />
            )}
          </Box>
          <Box marginLeft="s">
            {isUserLoggedIn ? (
              <>
                <CustomText variant="bodySubheader" fontSize={16}>
                  {displayUsername}
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
      <Box flex={1}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Box paddingHorizontal="m" paddingTop="l">
            <Box
              width={"100%"}
              height={"auto"}
              p="s"
              bg="surfaceContainer"
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
              bg="surfaceContainer"
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
              bg="surfaceContainer"
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
        isZapLinked={isUserLoggedIn}
        username={exchangeUserData?.username}
        onClose={() => zapLinkBottomSheetRef.current?.close()}
        ref={zapLinkBottomSheetRef}
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
