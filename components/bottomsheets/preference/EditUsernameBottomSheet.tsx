import SettingsHeader from "@/components/dashboard/SettingsHeader";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomButton, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback } from "react";

const EditUsernameBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
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
        <SettingsHeader title="Change Username" onBackPress={() => {}} />
        <Box paddingHorizontal="m" mt="m" width={"100%"} flex={1}>
          <CustomText fontSize={14} mb="m">
            Set your username. Other zap wallet users will be able to send
            assets to you using this username
          </CustomText>

          <CustomInputWithoutForm
            value=""
            onChange={() => {}}
            label="username"
            iconLeft={<CustomText color="disabledTextColor">@</CustomText>}
          />
          <CustomText fontSize={12} mt="s" mb="l">
            15 characters maximium
          </CustomText>

          <CustomButton
            text="Set username"
            onPress={() => {}}
            width={"100%"}
            borderRadius={50}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default EditUsernameBottomSheet;
