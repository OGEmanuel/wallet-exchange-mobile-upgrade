import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomButton } from "@/components/general";
import { UserModel } from "@/src/modules/kyc/domain/entities/models/user-model";
import { IAvatar } from "@/src/modules/settings/domain/entities/models/avatar-model";
import { IUpdateUserDetailsParams } from "@/src/modules/settings/domain/entities/params/update-user-details-params";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { kycActions, selectUser } from "@/state/reducers/kyc-reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { User } from "iconsax-react-nativejs";
import React, { forwardRef, useCallback, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

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

// Pre-loaded avatar images
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
  require("@/assets/images/avatar/a5.png"),
];

const EditAvatarBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [activeColor, setActiveColor] = React.useState(
    user?.avatar?.backgroundColor || "#23F9A1"
  );
  const [activeAvatar, setActiveAvatar] = React.useState<string>(
    user?.avatar?.url || ""
  ); // Default to a3.png (index 2)
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = useState<IAvatar[]>([]);
  const { getAvatars, updateUser } = useSettings();
  const theme = useTheme<Theme>();
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await getAvatars();
        console.log(response.data);
        setData(response.data || []);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleUpdateUser = useCallback(
    async (payload: Partial<IUpdateUserDetailsParams>) => {
      try {
        if (!activeAvatar) {
          alert("Your avatar is required");
          return;
        }
        setIsLoading(true);
        const response = await updateUser(payload, user as UserModel);
        dispatch(kycActions.setUser(response.data as UserModel));
        console.log(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    },
    [updateUser, user]
  );

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
      snapPoints={["80%", "60%"]}
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
        <Box paddingHorizontal="m" mt="m" width={"100%"} flex={1}>
          <Box width={"100%"} alignItems="center">
            <Box
              width={100}
              height={100}
              borderRadius={50}
              style={{ backgroundColor: activeColor }}
              p="s"
              justifyContent="center"
              alignItems="center"
            >
              {activeAvatar ? (
                <Image
                  source={activeAvatar}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <User
                  size={70}
                  variant="Bold"
                  color={theme.colors.bodyTextColor}
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
            <FlatList
              data={data}
              keyExtractor={(item) => item._id}
              numColumns={4}
              renderItem={({ item }) => (
                <Pressable
                  style={{
                    width: "25%",
                    aspectRatio: 1,
                    marginBottom: 10,
                    borderRadius: 50,
                    borderWidth: activeAvatar === item.url ? 2 : 0,
                    borderColor: theme.colors.bodyTextColor,
                    padding: 5,
                    //   backgroundColor: activeColor,
                  }}
                  onPress={() => setActiveAvatar(item.url)}
                >
                  <Image
                    source={item.url}
                    style={{ width: "100%", height: "100%", borderRadius: 8 }}
                    contentFit="cover"
                  />
                </Pressable>
              )}
              ListFooterComponent={() => (
                <>
                  {isLoading && (
                    <Box
                      width={"100%"}
                      height={20}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <ActivityIndicator
                        animating={isLoading}
                        color={theme.colors.bodyTextColor}
                      />
                    </Box>
                  )}
                </>
              )}
            />
          </Box>
        </Box>
        <Box height={80} justifyContent="center" paddingHorizontal="m">
          <CustomButton
            width={"100%"}
            borderRadius={50}
            isLoading={isLoading}
            disabled={!activeAvatar}
            disabledColor={theme.colors.disabledTextColor}
            onPress={() =>
              handleUpdateUser({
                avatar: { url: activeAvatar, backgroundColor: activeColor },
              })
            }
            text="Save Changes"
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default EditAvatarBottomSheet;
