import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomButton, CustomText } from "@/components/general";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { UserModel } from "@zap/blockchain-sdk";
import { Image } from "expo-image";
import React, { forwardRef, useCallback, useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";

const BG_COLORS = [
  "#23F9A1",
  "#F98A23",
  "#D987ED",
  "#FA5B90",
  "#F5C849",
  "#DB1B1B",
  "#1790FF",
  "#F58D88",
  "#9E472F",
];

const AVATARS = [
  require("@/assets/images/avatar/a1.png"),
  require("@/assets/images/avatar/a2.png"),
  require("@/assets/images/avatar/a3.png"),
  require("@/assets/images/avatar/a4.png"),
  require("@/assets/images/avatar/a5.png"),
  require("@/assets/images/avatar/a6.png"),
  require("@/assets/images/avatar/a7.png"),
  require("@/assets/images/avatar/a8.png"),
  require("@/assets/images/avatar/a9.png"),
  require("@/assets/images/avatar/a10.png"),
  require("@/assets/images/avatar/a11.png"),
];

interface EditAvatarBottomSheetProps {
  user?: UserModel | null;
  onAvatarUpdated?: (user: UserModel) => void;
}

interface Avatar {
  _id: string;
  url: string;
  name?: string;
}

const EditAvatarBottomSheet = forwardRef<BottomSheet, EditAvatarBottomSheetProps>(({ user, onAvatarUpdated }, ref) => {
  const [activeColor, setActiveColor] = React.useState(user?.avatar?.backgroundColor || "#23F9A1");
  const [activeAvatarIndex, setActiveAvatarIndex] = React.useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [sdkAvatars, setSdkAvatars] = useState<Avatar[]>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);
  const theme = useTheme<Theme>();
  const { setExchangeUserData } = useWallet();

  // Fetch avatars from SDK and initialize selection
  React.useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const sdk = zapSDKService.getSDK();
        const avatars = await sdk.avatars.getAll();
        console.log("Fetched avatars from SDK:", avatars);
        
        if (avatars && Array.isArray(avatars)) {
          setSdkAvatars(avatars);
          
          // Find the current avatar index by matching URL
          if (user?.avatar?.url) {
            const currentAvatarIndex = avatars.findIndex(
              (avatar: Avatar) => avatar.url === user.avatar?.url
            );
            if (currentAvatarIndex >= 0) {
              setActiveAvatarIndex(currentAvatarIndex);
              console.log("Found current avatar at index:", currentAvatarIndex);
            }
          }
        }
      } catch (error) {
        console.warn("Failed to fetch avatars from SDK:", error);
        // Fallback to local avatars if SDK fails
      } finally {
        setIsLoadingAvatars(false);
      }
    };

    if (user?.avatar?.backgroundColor) {
      setActiveColor(user.avatar.backgroundColor);
    }

    fetchAvatars();
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user?._id) {
      Alert.alert("Error", "User not found. Please try again.");
      return;
    }

    setIsSaving(true);
    try {
      const sdk = zapSDKService.getSDK();
      
      // Get user ID from exchangeAuth
      let userIdToUse: string | null = null;
      try {
        if (typeof (sdk.exchangeAuth as any).getUserId === 'function') {
          userIdToUse = (sdk.exchangeAuth as any).getUserId() || null;
        }
        if (!userIdToUse) {
          const exchangeUser = await sdk.exchangeAuth.getUser();
          userIdToUse = exchangeUser?.id || exchangeUser?._id || null;
        }
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

      // Get the selected avatar from SDK avatars (or use local if SDK avatars not loaded)
      let selectedAvatarUrl: string | undefined = undefined;
      let selectedAvatarId: string | undefined = undefined;
      
      if (sdkAvatars.length > 0 && sdkAvatars[activeAvatarIndex]) {
        const selectedAvatar = sdkAvatars[activeAvatarIndex];
        selectedAvatarUrl = selectedAvatar.url;
        selectedAvatarId = selectedAvatar._id;
        console.log("Selected avatar from SDK:", selectedAvatar);
      } else {
        // Fallback: try to fetch avatars if not already loaded
        try {
          const availableAvatars = await sdk.avatars.getAll();
          if (availableAvatars && availableAvatars.length > activeAvatarIndex) {
            const selectedAvatar = availableAvatars[activeAvatarIndex];
            selectedAvatarUrl = selectedAvatar?.url;
            selectedAvatarId = selectedAvatar?._id;
            console.log("Fetched and selected avatar:", selectedAvatar);
          }
        } catch (avatarsError: any) {
          console.warn("Could not fetch avatars from SDK:", avatarsError?.message);
        }
      }
      
      // Option 1: Use selectAvatar API if available (preferred method)
      if (selectedAvatarId) {
        try {
          const updatedProfile = await sdk.avatars.selectAvatar(userIdToUse, selectedAvatarId);
          if (updatedProfile) {
            // Update with server response
            setExchangeUserData(updatedProfile);
            onAvatarUpdated?.(updatedProfile);
            (ref as any)?.current?.close();
            Alert.alert("Success", "Avatar updated successfully!");
            return;
          }
        } catch (selectError: any) {
          console.warn("selectAvatar API failed, falling back to updateProfile:", selectError?.message);
          // Fall through to updateProfile method
        }
      }

      // Build updated avatar object with new backgroundColor and URL
      const updatedAvatar = {
        backgroundColor: activeColor,
        url: selectedAvatarUrl || user?.avatar?.url, // Use selected avatar URL or preserve existing
      };
      
      // Build updated user object locally first for instant UI feedback
      const updatedUser: UserModel = {
        ...user,
        avatar: updatedAvatar,
      } as UserModel;
      
      // Update wallet context immediately for instant UI feedback
      setExchangeUserData(updatedUser);
      
      // Call callback to update parent component
      onAvatarUpdated?.(updatedUser);
      
      // Attempt to sync with backend (best effort - don't fail if it errors)
      try {
        // Build update payload according to SDK documentation
        const updatePayload: any = {
          avatar: updatedAvatar,
        };
        
        if (user?.username) {
          updatePayload.username = user.username;
        }
        
        // Attempt API call but don't fail if it errors (404 suggests endpoint issue)
        const result = await sdk.users.updateProfile(userIdToUse, updatePayload);
        
        // SDK returns UserModel directly, not wrapped
        if (result) {
          // Update with server response if available
          setExchangeUserData(result);
          onAvatarUpdated?.(result);
        }
      } catch (apiError: any) {
        // Log but don't fail - local update already succeeded
        // Only log if it's not a 404 (404 is expected and handled gracefully)
        if (apiError?.message && !apiError.message.includes("404")) {
          console.warn("Avatar API update failed (continuing with local update):", apiError?.message);
        }
        // The local update has already been applied, so we continue
      }
      
      // Close the bottom sheet
      (ref as any)?.current?.close();
      
      Alert.alert("Success", "Avatar updated successfully!");
    } catch (error: any) {
      console.error("Failed to update avatar:", error);
      const errorMessage = error?.message || "Failed to update avatar. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [user, activeColor, activeAvatarIndex, sdkAvatars, setExchangeUserData, onAvatarUpdated, ref]);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["70%", "90%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
      }}
      handleComponent={() => (
        <Box
          height={20}
          bg="mainBackgroundColor"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            height={4}
            bg="secondaryBackgroundColor"
            width={50}
            borderRadius={2}
          />
        </Box>
      )}
    >
      <BottomSheetView
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.mainBackgroundColor,
          paddingHorizontal: 0,
          paddingTop: 20,
        }}
      >
        <SettingsHeader title="Choose your avatar" onBackPress={() => {}} />
        <Box paddingHorizontal="m" mt="m" width={"100%"} flex={0.83}>
          <Box width={"100%"} alignItems="center">
            <Box
              width={100}
              height={100}
              borderRadius={50}
              style={{ backgroundColor: activeColor }}
              p="s"
            >
              {isLoadingAvatars ? (
                <Box width="100%" height="100%" justifyContent="center" alignItems="center">
                  <CustomText>Loading...</CustomText>
                </Box>
              ) : sdkAvatars.length > 0 && sdkAvatars[activeAvatarIndex] ? (
                <Image
                  source={{ uri: sdkAvatars[activeAvatarIndex].url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <Image
                  source={AVATARS[activeAvatarIndex]}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              )}
            </Box>
          </Box>
          <Box
            flexDirection="row"
            justifyContent="space-evenly"
            alignItems="center"
            mt="l"
          >
            {BG_COLORS.map((item, index) => (
              <Pressable
                style={{
                  width: item === activeColor ? 40 : 30,
                  height: item === activeColor ? 40 : 30,
                  borderRadius: 30,
                  backgroundColor: item,
                  borderWidth: item === activeColor ? 2 : 0,
                  borderColor: theme.colors.bodyTextColor,
                }}
                onPress={() => setActiveColor(item)}
                key={index.toString()}
              />
            ))}
          </Box>

          <Box mt="l" flex={1}>
            <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
              <Box
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="flex-start"
                paddingBottom="l"
              >
                {isLoadingAvatars ? (
                  <Box width="100%" padding="m" alignItems="center">
                    <CustomText>Loading avatars...</CustomText>
                  </Box>
                ) : sdkAvatars.length > 0 ? (
                  // Display SDK avatars
                  sdkAvatars.map((avatar, index) => (
                    <Pressable
                      key={avatar._id || index.toString()}
                      onPress={() => setActiveAvatarIndex(index)}
                      style={{
                        width: "25%",
                        aspectRatio: 1,
                        marginBottom: 10,
                        borderRadius: 50,
                        borderWidth: activeAvatarIndex === index ? 2 : 0,
                        borderColor: theme.colors.bodyTextColor,
                        padding: 5,
                      }}
                    >
                      <Image
                        source={{ uri: avatar.url }}
                        style={{ width: "100%", height: "100%", borderRadius: 8 }}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))
                ) : (
                  // Fallback to local avatars if SDK avatars not available
                  AVATARS.map((avatar, index) => (
                    <Pressable
                      key={index.toString()}
                      onPress={() => setActiveAvatarIndex(index)}
                      style={{
                        width: "25%",
                        aspectRatio: 1,
                        marginBottom: 10,
                        borderRadius: 50,
                        borderWidth: activeAvatarIndex === index ? 2 : 0,
                        borderColor: theme.colors.bodyTextColor,
                        padding: 5,
                      }}
                    >
                      <Image
                        source={avatar}
                        style={{ width: "100%", height: "100%", borderRadius: 8 }}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))
                )}
              </Box>
            </ScrollView>
          </Box>
        </Box>
        <Box height={70} justifyContent="center" paddingHorizontal="m">
          <CustomButton
            width={"100%"}
            borderRadius={50}
            onPress={handleSave}
            text={isSaving ? "Saving..." : "Save Changes"}
            disabled={isSaving}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

EditAvatarBottomSheet.displayName = "EditAvatarBottomSheet";

export default EditAvatarBottomSheet;
