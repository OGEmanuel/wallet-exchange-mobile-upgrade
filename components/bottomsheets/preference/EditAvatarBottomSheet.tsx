import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomButton } from "@/components/general";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React, { forwardRef, useCallback } from "react";
import { Pressable, ScrollView } from "react-native";

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
  const [activeColor, setActiveColor] = React.useState("#23F9A1");
  const [activeAvatarIndex, setActiveAvatarIndex] = React.useState(2); // Default to a3.png (index 2)
  const theme = useTheme<Theme>();
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
            >
              <Image
                source={AVATARS[activeAvatarIndex]}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
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
                {AVATARS.map((avatar, index) => (
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
                      //   backgroundColor: activeColor,
                    }}
                  >
                    <Image
                      source={avatar}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </Box>
            </ScrollView>
          </Box>
        </Box>
        <Box height={80} justifyContent="center" paddingHorizontal="m">
          <CustomButton
            width={"100%"}
            borderRadius={50}
            onPress={() => {}}
            text="Save Changes"
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default EditAvatarBottomSheet;
