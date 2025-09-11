import React from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, forwardRef } from "react";
import Box from "../general/Box";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { CustomText } from "../general";

const ActivityFilterBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
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
      snapPoints={["50%", "60%"]}
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
          paddingTop: 30,
        }}
      >
        <CustomText variant="bodyMedium" fontSize={18} mb="l">
          Filter by
        </CustomText>

        <CustomText variant="body" fontSize={14} mb="m">
          Date
        </CustomText>

        <CustomText variant="body" fontSize={14} mb="m">
          Buy
        </CustomText>

        <CustomText variant="body" fontSize={14} mb="m">
          Sell
        </CustomText>

        <CustomText variant="body" fontSize={14} mb="m">
          Swap
        </CustomText>

        <CustomText variant="body" fontSize={14} mb="m">
          Bridge
        </CustomText>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default ActivityFilterBottomSheet;
