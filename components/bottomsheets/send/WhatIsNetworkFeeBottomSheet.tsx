import { CustomButton, CustomText } from "@/components/general";
import { selectStage } from "@/state/reducers/sendPage.reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@shopify/restyle";
import React, { RefObject, forwardRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Box from "../../general/Box";

const WhatIsNetworkFeeBottomsheet = forwardRef<BottomSheet, { networkName?: string }>(
  (props: { networkName?: string }, ref) => {
    const { networkName } = props;
    const stage = useSelector(selectStage);
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
        snapPoints={["35%"]}
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
            <Box height={4} bg="white" width={50} borderRadius={2} />
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
          <Box flex={1} paddingBottom="l">
            <Box flex={1}>
              <CustomText variant="bodySubheader" fontSize={18}>
                What is Network Fee ?
              </CustomText>
              <CustomText fontSize={14} mt="m">
                This is “gas fee” used by the {networkName} blockchain to
                validate your transaction securely.
              </CustomText>
              <CustomText fontSize={14} mt="m">
                This fee is dynamic and varies depending on the network demand
                and congestion. (How busy it is)
              </CustomText>
            </Box>
            <CustomButton
              text="Got it"
              onPress={() =>
                (ref as RefObject<BottomSheetMethods>).current?.close()
              }
              width={"100%"}
              borderRadius={50}
            />
          </Box>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default WhatIsNetworkFeeBottomsheet;
