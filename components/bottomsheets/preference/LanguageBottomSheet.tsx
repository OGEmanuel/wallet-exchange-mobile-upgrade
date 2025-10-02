import { Box, CustomText } from "@/components/general";
import { supportedLanguages } from "@/data";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { PinInputRef } from "@pakenfit/react-native-pin-input";
import { useTheme } from "@shopify/restyle";
import { TickCircle } from "iconsax-react-nativejs";
import React, { forwardRef, useCallback } from "react";
import { Dimensions, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const { height: HEIGHT } = Dimensions.get("screen");

const LanguageBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const [language, setLanguage] = React.useState(supportedLanguages[0]);
  const theme = useTheme<Theme>();
  const pinref = React.useRef<PinInputRef>(null);

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
          Language
        </CustomText>
        <Box height={30}></Box>
        <Box
          width={"100%"}
          height={HEIGHT * 0.6}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          backgroundColor="secondaryBackgroundColor"
          borderWidth={0}
          borderColor="borderColor"
          borderRadius={12}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {supportedLanguages.map((item, index) => (
              <Pressable
                key={index.toString()}
                onPress={() => setLanguage(item)}
                style={{
                  width: "100%",
                  height: 50,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Box flexDirection="row" alignItems="center">
                  <CustomText variant="body" fontSize={16}>
                    {item.name}
                  </CustomText>
                </Box>
                {item.code === language.code && (
                  <TickCircle
                    variant="Bold"
                    color={theme.colors.tabBarActiveColor}
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default LanguageBottomSheet;
