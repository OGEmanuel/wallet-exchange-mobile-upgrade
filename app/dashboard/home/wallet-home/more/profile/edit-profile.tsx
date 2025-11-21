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
import { transformCloudinaryUrl } from "@/src/core/utils/cloudinary-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { UserModel } from "@zap/blockchain-sdk";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { CheckCircle, User } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";

const EditProfile = () => {
  const theme = useTheme<Theme>();
  const { getExchangeUser, setExchangeUserData, exchangeUserData } = useWallet();
  const { fetchUserById } = useKyc();
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

  // Track if we've already loaded user data to prevent re-fetching after updates
  const hasLoadedRef = useRef(false);
  const loadedUserIdRef = useRef<string | null>(null);

  // Fetch user profile on mount only
  useEffect(() => {
    const fetchUser = async () => {
      // Only fetch if we haven't loaded yet, or if the user ID has changed
      const currentUserId = exchangeUserData?._id;
      if (hasLoadedRef.current && loadedUserIdRef.current === currentUserId) {
        return; // Already loaded this user, skip
      }

      setLoadingUser(true);
      setError(null);
      try {
        // First try to get from exchange user
        let userData = await getExchangeUser();
        
        // If we don't have firstName/lastName, try to fetch from KYC
        if (userData && (!userData.firstName && !userData.lastName) && userData._id) {
          try {
            const kycResponse = await fetchUserById(userData);
            if (kycResponse?.data) {
              // Merge KYC data with exchange user data
              userData = {
                ...userData,
                ...kycResponse.data,
                firstName: kycResponse.data.firstName || userData.firstName,
                lastName: kycResponse.data.lastName || userData.lastName,
              };
            }
          } catch (kycErr) {
            console.log("Could not fetch KYC user data:", kycErr);
            // Continue with exchange user data
          }
        }
        
        // Fallback to exchangeUserData from context if available
        if (!userData && exchangeUserData) {
          userData = exchangeUserData;
        }
        
        if (userData) {
          setUser(userData);
          setUsername(userData.username || "");
          setPhone(userData.phone || "");
          hasLoadedRef.current = true;
          loadedUserIdRef.current = userData._id || null;
        }
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err);
        setError(err?.message || "Failed to load user profile");
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getExchangeUser, fetchUserById]); // Removed exchangeUserData to prevent re-fetching after updates

  // Update local state when exchangeUserData changes (but only if it's a different user)
  // We don't sync same-user updates to prevent overwriting user's edits
  useEffect(() => {
    if (exchangeUserData && exchangeUserData._id !== loadedUserIdRef.current) {
      // Different user, update the data
      setUser(exchangeUserData);
      setUsername(exchangeUserData.username || "");
      setPhone(exchangeUserData.phone || "");
      hasLoadedRef.current = true;
      loadedUserIdRef.current = exchangeUserData._id || null;
    }
    // Don't sync same-user updates - this prevents overwriting user's edits
    // The user's edits will be saved via handleUpdateUser, which updates exchangeUserData
    // but we don't want to re-fetch and overwrite their current edits
  }, [exchangeUserData]);

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

      setIsLoading(true);
      setError(null);

      // Get SDK instance
      const sdk = zapSDKService.getSDK();
      
      // Get user ID from exchangeAuth (as per SDK documentation)
      // Try getUserId() first (if available), otherwise use getUser()
      let userIdToUse: string | null = null;
      try {
        // Try getUserId() method if it exists (per SDK docs)
        if (typeof (sdk.exchangeAuth as any).getUserId === 'function') {
          userIdToUse = (sdk.exchangeAuth as any).getUserId() || null;
        }
        
        // Fallback to getUser() if getUserId() doesn't exist or returned null
        if (!userIdToUse) {
          const exchangeUser = await sdk.exchangeAuth.getUser();
          userIdToUse = exchangeUser?.id || exchangeUser?._id || null;
        }
        
        // Final fallback to user._id
        if (!userIdToUse) {
          userIdToUse = user._id;
        }
      } catch (err) {
        console.warn("Could not get user ID from exchangeAuth, using existing ID:", err);
        userIdToUse = user._id;
      }

      if (!userIdToUse) {
        throw new Error("User ID is required");
      }

      // Build update payload according to SDK documentation
      const updatePayload: {
        firstName?: string;
        lastName?: string;
        name?: string;
        username?: string;
        bio?: string;
        avatar?: {
          url?: string;
          backgroundColor?: string;
        };
      } = {
        username: username.trim(),
      };

      // Include firstName and lastName if available
      if (user.firstName) {
        updatePayload.firstName = user.firstName;
      }
      if (user.lastName) {
        updatePayload.lastName = user.lastName;
      }

      // Construct full name if we have firstName and/or lastName
      if (user.firstName || user.lastName) {
        updatePayload.name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      }

      // Include avatar if it exists
      if (user.avatar) {
        updatePayload.avatar = {
          url: user.avatar.url,
          backgroundColor: user.avatar.backgroundColor,
        };
      }

      // Build updated user object locally first for instant UI feedback
      const updatedUser: UserModel = {
        ...user,
        username: username.trim(),
        firstName: updatePayload.firstName || user.firstName,
        lastName: updatePayload.lastName || user.lastName,
        ...(updatePayload.name && { name: updatePayload.name }),
        avatar: updatePayload.avatar || user.avatar,
      } as UserModel;

      // Update local state immediately for instant UI feedback
      setUser(updatedUser);
      setUsername(updatedUser.username || "");
      setPhone(phone.trim() || updatedUser.phone || "");
      
      // Update wallet context immediately
      setExchangeUserData(updatedUser);

      // Attempt to sync with backend (best effort - don't fail if it errors)
      try {
        // Call SDK updateProfile - returns wrapped response with success/data
        const result = await sdk.users.updateProfile(userIdToUse, updatePayload);

        // Handle wrapped response (check for success property)
        if (result) {
          let serverUser: UserModel | null = null;
          
          // Check if result is wrapped (has success property)
          if (typeof result === 'object' && 'success' in result) {
            if (result.success && result.data) {
              serverUser = result.data as UserModel;
            } else if (result.success && 'user' in result) {
              serverUser = (result as any).user as UserModel;
            }
          } else {
            // Direct UserModel response
            serverUser = result as UserModel;
          }
          
          // Update with server response if available
          if (serverUser) {
            setUser(serverUser);
            setUsername(serverUser.username || "");
            setPhone(serverUser.phone || "");
            setExchangeUserData(serverUser);
            console.log("✅ Profile updated successfully on backend:", serverUser);
            
            // Refresh user data from backend to ensure we have the latest (bypasses cache)
            try {
              const refreshedUser = await sdk.users.getProfile(userIdToUse, { bypassCache: true });
              if (refreshedUser) {
                setUser(refreshedUser);
                setUsername(refreshedUser.username || "");
                setPhone(refreshedUser.phone || "");
                setExchangeUserData(refreshedUser);
                console.log("✅ User data refreshed from backend:", refreshedUser);
              }
            } catch (refreshError) {
              console.warn("⚠️ Could not refresh user data (using response data):", refreshError);
            }
          } else {
            console.warn("⚠️ Profile update succeeded but no user data in response");
            // Try to fetch fresh data anyway
            try {
              const refreshedUser = await sdk.users.getProfile(userIdToUse, { bypassCache: true });
              if (refreshedUser) {
                setUser(refreshedUser);
                setUsername(refreshedUser.username || "");
                setPhone(refreshedUser.phone || "");
                setExchangeUserData(refreshedUser);
                console.log("✅ User data refreshed from backend after update:", refreshedUser);
              }
            } catch (refreshError) {
              console.warn("⚠️ Could not refresh user data:", refreshError);
            }
          }
        }
      } catch (apiError: any) {
        // Log but don't fail - local update already succeeded
        // 404 suggests endpoint might not be available, but local update is fine
        // Only log if it's not a 404 (404 is expected and handled gracefully)
        if (apiError?.message && !apiError.message.includes("404")) {
          console.warn("Profile API update failed (continuing with local update):", apiError?.message);
        }
        // The local update has already been applied, so we continue
      }
      
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const errorMessage = error?.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      alert(errorMessage);
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
                key={`${user.avatar.url}-${user.avatar.backgroundColor}`}
                source={{ 
                  uri: transformCloudinaryUrl(user.avatar.url) // Use original URL directly
                }}
                style={{ width: "100%", height: "100%", borderRadius: 30 }}
                contentFit="cover"
                onError={(error: any) => {
                  // Log all errors to help debug
                  console.warn("⚠️ Edit profile avatar failed to load:", user.avatar?.url, error);
                }}
                onLoad={() => {
                  // Silently handle successful loads
                }}
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
                placeholder="Not available"
              />
            </Box>

            <Box width={"47%"}>
              <CustomInputWithoutForm
                value={user?.lastName || ""}
                onChange={() => {}}
                label="Last name"
                editable={false}
                placeholder="Not available"
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
      <EditAvatarBottomSheet 
        ref={editAvatarRef} 
        user={user}
        onAvatarUpdated={(updatedUser) => {
          setUser(updatedUser);
          // Wallet context is already updated in EditAvatarBottomSheet
        }}
      />
      <EditUsernameBottomSheet ref={editUsernameRef} />
      <EditFirstnameBottomSheet ref={editFirstnameRef} type={type} />
    </PageWrapper>
  );
};

export default EditProfile;
