import {
  ThemedActivityIcon,
  ThemedEditIcon,
  ThemedProfileOutlineIcon,
  ThemedShieldOutlineIcon,
} from "@/assets/svg/wallet-icons-components";
import ZapLinkBottomSheet from "@/components/bottomsheets/ZapLinkBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import KYCFlowManager from "@/components/kyc/KYCFlowManager";
import { useAppBottomSheet } from "@/hooks/useAppBottomSheet";
import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { userHasAtleastOneDocumentApproved } from "@/src/modules/kyc/domain/entities/models/document-type-model";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, User } from "lucide-react-native";
import React, { useRef } from "react";
import { Image, Pressable } from "react-native";

const ItemCard = ({
  icon,
  title,
  badge = undefined,
  onPress,
  completeBadge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  onPress: () => void;
  completeBadge?: React.ReactNode;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      style={{
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onPress={() => onPress()}
    >
      <Box flexDirection="row" alignItems="center">
        {icon}
        <Box alignItems="flex-start">
          <CustomText fontSize={12} marginLeft="m">
            {title}
          </CustomText>
          {completeBadge && (
            <Box ml="m" mt="s">
              {completeBadge}
            </Box>
          )}
        </Box>
      </Box>
      <Box flexDirection="row" alignItems="center">
        {badge && badge}
        <ChevronRight
          size={20}
          style={{ marginLeft: 10 }}
          color={theme.colors.bodyTextColor}
        />
      </Box>
    </Pressable>
  );
};

const ProfilePage = () => {
  const theme = useTheme<Theme>();
  const { exchangeUserData, logoutFromExchange } = useWallet();
  const { isUserLoggedIn } = useExchangeAuth();
  const { showBottomSheet } = useAppBottomSheet();
  const zapLinkBottomSheetRef = useRef<BottomSheet>(null);

  const showKYCBottomSheet = (options?: { onComplete?: () => void; onClose?: () => void }) => {
    return showBottomSheet({
      component: (
        <KYCFlowManager
          onComplete={() => {
            options?.onComplete?.();
          }}
          onBack={() => {
            options?.onClose?.();
          }}
        />
      ),
      props: {
        snapPoints: ["90%"],
        enablePanDownToClose: true,
        showGradientHandle: true,
        gradientColors: [
          theme.colors.primaryColor,
          theme.colors.mainBackgroundColor,
          theme.colors.mainBackgroundColor,
        ],
      },
      onClose: options?.onClose,
    });
  };

  const walletUser = exchangeUserData;

  // Check if user has at least one verification document approved
  const isVerificationComplete: boolean = userHasAtleastOneDocumentApproved(walletUser);

  const DATA: {
    icon: React.ReactNode;
    title: string;
    badge?: React.ReactNode;
    onPress: () => void;
    completeBadge?: React.ReactNode;
  }[] = [
    {
      icon: (
        <ThemedProfileOutlineIcon
          lightModeColor={theme.colors.bodyTextColor}
          darkModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Acount verification",
      badge: !isVerificationComplete ? (
        <Box
          width={"auto"}
          padding="s"
          borderRadius={20}
          bg="secondaryBackgroundColor"
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: "#EF4444" }}
        >
          <CustomText fontSize={10} style={{ color: "#FFFFFF" }}>
            Not Verified
          </CustomText>
        </Box>
      ) : (
        <Box
          width={"auto"}
          padding="s"
          borderRadius={20}
          bg="secondaryBackgroundColor"
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: "#2E8B57" }}
        >
          <CustomText fontSize={10} style={{ color: "#FFFFFF" }}>
            Verified
          </CustomText>
        </Box>
      ),
      onPress: () => {
        // Only show KYC flow if user is not verified
        if (!isVerificationComplete) {
          showKYCBottomSheet({
            onComplete: () => {
              // Handle KYC completion if needed
            },
            onClose: () => {
              // Handle close if needed
            },
          });
        }
        // If verified, do nothing
      },
    },
    {
      icon: (
        <ThemedShieldOutlineIcon
          lightModeColor={theme.colors.bodyTextColor}
          darkModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Two factor authentication",
      onPress: () => {},
    },
    {
      icon: (
        <ThemedActivityIcon
          lightModeColor={theme.colors.bodyTextColor}
          darkModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Activity Log",
      onPress: () =>
        router.push("/dashboard/home/wallet-home/more/profile/activtylogs"),
    },
  ];
  return (
    <PageWrapper>
      <SettingsHeader title="Profile" onBackPress={() => router.back()} />
      <Box
        flex={1}
        mt="m"
        paddingHorizontal="m"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box>
          {/* <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20 }}
        > */}
          <LinearGradient
            colors={["#6045FF", "#1B1251"]}
            style={{
              width: "100%",
              height: 207,
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              width={70}
              height={70}
              borderRadius={50}
              bg="fadedPrimary"
              justifyContent="center"
              alignItems="center"
              style={{
                backgroundColor:
                  walletUser?.avatar?.backgroundColor ||
                  theme.colors.fadedPrimaryColor,
              }}
            >
              {walletUser?.avatar?.url ? (
                <Image
                  source={{ uri: walletUser?.avatar?.url }}
                  style={{ width: "100%", height: "100%", borderRadius: 50 }}
                />
              ) : (
                <User
                  size={50}
                  color={theme.colors.bodyTextColor}
                />
              )}
            </Box>
            <CustomText variant="medium" fontFamily="14" mt="s">
              {walletUser?.username}
            </CustomText>
            <CustomText variant="body" mt="s" fontFamily="14" marginBottom="m">
              {walletUser?.email}
            </CustomText>
            <CustomButton
              text="Edit Profile"
              width={"30%"}
              height={32}
              borderRadius={30}
              variant="bodySubheader"
              leadingIcon={
                <ThemedEditIcon
                  width={16}
                  height={16}
                  darkModeColor={theme.colors.white}
                  lightModeColor={theme.colors.bodyTextColor}
                  style={{ marginRight: 5 }}
                />
              }
              onPress={() =>
                router.push(
                  "/dashboard/home/wallet-home/more/profile/edit-profile"
                )
              }
              fontSize={12}
              bgColor={theme.colors.mainBackgroundColor}
            />
          </LinearGradient>

          <Box
            width={"100%"}
            height={"auto"}
            bg="secondaryBackgroundColor"
            borderWidth={1}
            borderColor="borderColor"
            borderRadius={12}
            p="m"
            mt="l"
          >
            {DATA.map((item, index) => (
              <ItemCard key={index.toString()} {...item} />
            ))}
          </Box>
          {/* </ScrollView> */}
        </Box>
        <Box
          paddingHorizontal="m"
          paddingVertical="m"
          backgroundColor="mainBackgroundColor"
          style={{ marginBottom: 100 }}
        >
          <CustomButton
            width={"100%"}
            borderRadius={50}
            bgColor={theme.colors.secondaryBackgroundColor}
            text="Remove Account"
            color={theme.colors.error}
            onPress={() => {
              zapLinkBottomSheetRef.current?.snapToIndex(0);
            }}
          />
        </Box>
      </Box>
      <ZapLinkBottomSheet
        ref={zapLinkBottomSheetRef}
        isZapLinked={isUserLoggedIn}
        username={exchangeUserData?.username}
        onDisconnect={async () => {
          try {
            await logoutFromExchange();
            zapLinkBottomSheetRef.current?.close();
          } catch (error) {
            console.error("Logout from exchange failed:", error);
          }
        }}
        onClose={() => {
          zapLinkBottomSheetRef.current?.close();
        }}
      />
    </PageWrapper>
  );
};

export default ProfilePage;
