import EditAvatarBottomSheet from "@/components/bottomsheets/preference/EditAvatarBottomSheet";
import EditFirstnameBottomSheet from "@/components/bottomsheets/preference/EditFirstnameBottomSheet";
import EditUsernameBottomSheet from "@/components/bottomsheets/preference/EditUsernameBottomSheet";
import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import {
  Box,
  CustomButton,
  CustomText,
  PageWrapper,
} from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { UserModel } from "@zap/blockchain-sdk";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { CheckCircle, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";

const EditProfile = () => {
  const theme = useTheme<Theme>();
  const { getExchangeUser } = useWallet();
  const [user, setUser] = useState<UserModel | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Type for EditFirstnameBottomSheet (firstname, lastname, or phone)
  const type: "firstname" | "lastname" | "phone" = "firstname";
  
  // refs
  const { editAvatarRef, editUsernameRef, editFirstnameRef } =
    useBottomSheetRefs();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      setError(null);
      try {
        const userData = await getExchangeUser();
        if (userData) {
          setUser(userData);
          setUsername(userData.username || "");
          setPhone(userData.phone || "");
        }
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setError(err?.message || "Failed to load user profile");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [getExchangeUser]);

  const handleUpdateUser = async () => {
    if (!user?._id) {
      alert("User not found. Please try again.");
      return;
    }

    try {
      if (username.trim() === "") {
        alert("Username is required");
        return;
      }

      if (phone.trim() === "") {
        alert("Phone number is required");
        return;
      }

      setIsLoading(true);
      setError(null);

      const sdk = zapSDKService.getSDK();
      const updatedUser = await sdk.users.updateProfile(user._id, {
        username: username.trim(),
        phone: phone.trim(),
      });

      if (updatedUser) {
        // Update local state
        setUser(updatedUser as UserModel);
        setUsername(updatedUser.username || "");
        setPhone(updatedUser.phone || "");
        alert("Profile updated successfully!");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      setError(error?.message || "Failed to update profile");
      alert(error?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <PageWrapper>
        <SettingsHeader
          title="Account Information"
          onBackPress={() => router.back()}
        />
        <Box flex={1} justifyContent="center" alignItems="center">
          <CustomText variant="body" color="bodyTextColor">
            Loading profile...
          </CustomText>
        </Box>
      </PageWrapper>
    );
  }

  if (error && !user) {
    return (
      <PageWrapper>
        <SettingsHeader
          title="Account Information"
          onBackPress={() => router.back()}
        />
        <Box flex={1} justifyContent="center" alignItems="center" paddingHorizontal="m">
          <CustomText variant="body" color="error" textAlign="center">
            {error}
          </CustomText>
        </Box>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <SettingsHeader
          title="Account Information"
          onBackPress={() => router.back()}
        />
        <Box flex={1} justifyContent="center" alignItems="center">
          <CustomText variant="body" color="bodyTextColor">
            User not found
          </CustomText>
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SettingsHeader
        title="Account Information"
        onBackPress={() => router.back()}
      />
      <Box flex={1} bg="mainBackgroundColor" paddingHorizontal="m">
        <Box width={"100%"} height={"auto"} alignItems="center" mt="l">
          <Box
            width={60}
            height={60}
            borderRadius={30}
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
              <ExpoImage
                source={{ uri: user.avatar.url }}
                style={{ width: "100%", height: "100%", borderRadius: 30 }}
                contentFit="cover"
              />
            ) : (
              <User
                size={30}
                color={theme.colors.bodyTextColor}
              />
            )}
          </Box>
          <CustomText
            textAlign="center"
            mt="m"
            color="tabBarActiveColor"
            fontSize={14}
            onPress={() => editAvatarRef.current?.snapToIndex(1)}
          >
            Change avatar
          </CustomText>
        </Box>

        {error && (
          <Box mt="m" padding="s" backgroundColor="error" borderRadius={8}>
            <CustomText variant="body" color="white" fontSize={12}>
              {error}
            </CustomText>
          </Box>
        )}

        <Box mt="l" width={"100%"}>
          <CustomInputWithoutForm
            value={username}
            onChange={(e) => setUsername(e)}
            label="Username"
          />

          <Box
            width={"100%"}
            flexDirection="row"
            mt="m"
            justifyContent="space-between"
          >
            <Box width={"47%"}>
              <CustomInputWithoutForm
                value={user?.firstName || ""}
                onChange={() => {}}
                label="First name"
                editable={false}
              />
            </Box>

            <Box width={"47%"}>
              <CustomInputWithoutForm
                value={user?.lastName || ""}
                onChange={() => {}}
                label="Last name"
                editable={false}
              />
            </Box>
          </Box>

          <Box
            width={"100%"}
            height={50}
            p="s"
            mt="m"
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
          >
            <Box
              width={"100%"}
              height={"100%"}
              borderLeftWidth={2}
              borderLeftColor="tabBarActiveColor"
              px="s"
              justifyContent="center"
              flexWrap="nowrap"
            >
              <CustomText
                variant="body"
                fontSize={14}
                flexWrap="wrap"
                lineHeight={16}
              >
                Your first and last name will be retrieved from your BVN and
                government ID
              </CustomText>
            </Box>
          </Box>

          <Box width={"100%"} mt="m">
            <CustomInputWithoutForm
              value={user?.email || ""}
              onChange={() => {}}
              label="Email"
              editable={false}
            />
          </Box>

          <Box width={"100%"} mt="m">
            <CustomInputWithoutForm
              value={phone}
              onChange={(e) => setPhone(e)}
              label="Phone"
              iconRight={
                <CheckCircle size={20} color={theme.colors.primaryColor} />
              }
            />
          </Box>

          <Box mt="2xl">
            <CustomButton
              width={"100%"}
              borderRadius={50}
              text="Save Changes"
              onPress={handleUpdateUser}
              isLoading={isLoading}
            />
          </Box>
        </Box>
      </Box>
      <EditAvatarBottomSheet ref={editAvatarRef} />
      <EditUsernameBottomSheet ref={editUsernameRef} />
      <EditFirstnameBottomSheet ref={editFirstnameRef} type={type} />
    </PageWrapper>
  );
};

export default EditProfile;
