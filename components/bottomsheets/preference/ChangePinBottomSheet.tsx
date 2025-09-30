import SettingsHeader from "@/components/dashboard/SettingsHeader";
import { Box, CustomButton, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { PinInput, PinInputRef } from "@pakenfit/react-native-pin-input";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback } from "react";

const ChangePinBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
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
          paddingHorizontal: 0,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <SettingsHeader title={`Change Passcode`} onBackPress={() => {}} />
        <Box
          paddingHorizontal="m"
          mt="m"
          width={"100%"}
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <CustomText fontSize={14} mb="m">
            Enter your current passcodr
          </CustomText>

          <PinInput
            onFillEnded={(otp) => console.log(otp)}
            inputStyle={{
              width: 70,
              height: 70,
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderWidth: 0,
              color: theme.colors.bodyTextColor,
            }}
            inputProps={{}}
            autoFocus
            ref={pinref}
          />
        </Box>
        <Box width={"100%"} paddingHorizontal="m">
          <CustomButton
            text="Continue"
            onPress={() => {}}
            width={"100%"}
            borderRadius={50}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default ChangePinBottomSheet;
