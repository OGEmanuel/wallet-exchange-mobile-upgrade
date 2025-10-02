import { Box, CustomText } from "@/components/general";
import { supportedLanguages } from "@/data";
import useActiveTheme from "@/hooks/useTheme";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { PinInputRef } from "@pakenfit/react-native-pin-input";
import { useTheme } from "@shopify/restyle";
import { Sparkles, VibrateIcon } from "lucide-react-native";
import React, { forwardRef, useCallback } from "react";
import { Image, Pressable, Switch } from "react-native";

const AppearanceCard = ({
  title,
  isActive,
  onPress,
  image,
}: {
  title: string;
  isActive: boolean;
  onPress: () => void;
  image: React.ReactNode;
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box width={90} alignItems="center">
      <Box
        width={"100%"}
        height={80}
        borderRadius={12}
        bg="secondaryBackgroundColor"
      >
        {image}
      </Box>
      <CustomText variant="bodyMedium" mt="s" onPress={onPress}>
        {title}
      </CustomText>
      <Pressable
        style={{
          width: 26,
          height: 26,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: theme.colors.tabBarActiveColor,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Box
          width={20}
          height={20}
          borderRadius={12}
          bg={isActive ? "tabBarActiveColor" : "secondaryBackgroundColor"}
        ></Box>
      </Pressable>
    </Box>
  );
};

const SwitchCards = ({
  isActive,
  title,
  icon,
  onSwitchPressed,
}: {
  isActive: boolean;
  title: string;
  icon: React.ReactNode;
  onSwitchPressed: () => void;
}) => {
  return (
    <Box
      width={"100%"}
      height={50}
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
    >
      <Box flexDirection="row" alignItems="center">
        {icon}
        <CustomText variant="bodyMedium" ml="m">
          {title}
        </CustomText>
      </Box>
      <Box justifyContent="center">
        <Switch value={isActive} onValueChange={onSwitchPressed} />
      </Box>
    </Box>
  );
};

const AppearanceBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const [language, setLanguage] = React.useState(supportedLanguages[0]);
  const [isActive, setIsActive] = React.useState(false);
  const theme = useTheme<Theme>();
  const pinref = React.useRef<PinInputRef>(null);
  const { colorTheme } = useActiveTheme();

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
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <CustomText variant="subheader" textAlign="center" fontSize={24}>
          Appearance
        </CustomText>
        <Box height={30}></Box>
        <Box
          width={"100%"}
          height={195}
          borderRadius={12}
          p="m"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          bg="secondaryBackgroundColor"
          mb="m"
        >
          <AppearanceCard
            title="System"
            isActive={isActive}
            onPress={() => setIsActive(true)}
            image={
              <Image
                source={require("@/assets/images/systemthemeimg.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            }
          />

          <AppearanceCard
            title="Light"
            isActive={isActive}
            onPress={() => setIsActive(true)}
            image={
              <Image
                source={require("@/assets/images/lightmodeimg.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            }
          />

          <AppearanceCard
            title="Dark"
            isActive={isActive}
            onPress={() => setIsActive(true)}
            image={
              <Image
                source={require("@/assets/images/darkmodeimg.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            }
          />
        </Box>
        <Box
          width={"100%"}
          height={120}
          borderRadius={12}
          p="m"
          alignItems="center"
          bg="secondaryBackgroundColor"
          mb="m"
        >
          <SwitchCards
            icon={<VibrateIcon color={theme.colors.bodyTextColor} size={30} />}
            title="Enable Haptics"
            isActive={isActive}
            onSwitchPressed={() => setIsActive(!isActive)}
          />

          <SwitchCards
            icon={<Sparkles color={theme.colors.bodyTextColor} size={30} />}
            title="Enable Animations"
            isActive={isActive}
            onSwitchPressed={() => setIsActive(!isActive)}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default AppearanceBottomSheet;
