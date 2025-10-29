import {
  ThemedActivityIcon,
  ThemedEditIcon,
  ThemedProfileOutlineIcon,
  ThemedShieldOutlineIcon,
} from "@/assets/svg/wallet-icons-components";
import { useZapperSignBottomSheet } from "@/components";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import { selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { User } from "iconsax-react-nativejs";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { useSelector } from "react-redux";

const ItemCard = ({
  icon,
  title,
  badge = undefined,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  onPress: () => void;
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
        <CustomText fontSize={12} marginLeft="m">
          {title}
        </CustomText>
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
  const user = useSelector(selectUser);
  const { showZapperSignBottomSheet } = useZapperSignBottomSheet();


  const DATA: {
    icon: React.ReactNode;
    title: string;
    badge?: React.ReactNode;
    onPress: () => void;
  }[] = [
    {
      icon: (
        <ThemedProfileOutlineIcon
          lightModeColor={theme.colors.bodyTextColor}
          darkModeColor={theme.colors.bodyTextColor}
        />
      ),
      title: "Personal verification",
      badge: (
        <Box
          width={"auto"}
          padding="s"
          borderRadius={8}
          bg="secondaryBackgroundColor"
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: "#EDB1181A" }}
        >
          <CustomText fontSize={10} color="pendingColor">
            Incomplete
          </CustomText>
        </Box>
      ),
      onPress: () => {
        showZapperSignBottomSheet({
          onContinue: () => {
            // Navigate to dashboard after successful exchange authentication
            router.push("/dashboard/home/wallet-home/swap");
          },
          onClose: () => {
            // Handle close if needed
          },
        });
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
      onPress: () =>
        router.push("/dashboard/home/wallet-home/more/profile/enable-2fa"),
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
                  user?.avatar?.backgroundColor ||
                  theme.colors.fadedPrimaryColor,
              }}
            >
              {user?.avatar?.url ? (
                <Image
                  source={{ uri: user?.avatar?.url }}
                  style={{ width: "100%", height: "100%", borderRadius: 50 }}
                />
              ) : (
                <User
                  size={50}
                  color={theme.colors.bodyTextColor}
                  variant="Bold"
                />
              )}
            </Box>
            <CustomText variant="medium" fontFamily="14" mt="s">
              {user?.username}
            </CustomText>
            <CustomText variant="body" mt="s" fontFamily="14" marginBottom="m">
              {user?.email}
            </CustomText>
            <CustomButton
              text="Edit Profile"
              width={"30%"}
              height={32}
              borderRadius={30}
              leadingIcon={
                <ThemedEditIcon
                  width={16}
                  height={16}
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
            text="Delete Account"
            color={theme.colors.error}
            onPress={() =>
              router.push(
                "/dashboard/home/wallet-home/more/profile/delete-account"
              )
            }
          />
        </Box>
      </Box>
      {/* <Box paddingHorizontal="m">
        <CustomButton
          width={"100%"}
          borderRadius={50}
          bgColor={theme.colors.secondaryBackgroundColor}
          text="Delete Account"
          color={theme.colors.error}
          onPress={() => {}}
        />
      </Box> */}
    </PageWrapper>
  );
};

export default ProfilePage;
