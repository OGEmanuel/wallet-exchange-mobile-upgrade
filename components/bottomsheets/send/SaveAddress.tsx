import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { CustomButton, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback } from "react";
import Box from "../../general/Box";

const SaveAddress = forwardRef<BottomSheet, { save: () => void }>(
  (props, ref) => {
    const { save } = props;
    const [address, setAddress] = React.useState("");
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
        snapPoints={["30%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        style={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        handleComponent={() => (
          <Box
            height={20}
            bg="secondaryBackgroundColor"
            justifyContent="center"
            alignItems="center"
          >
            <Box
              height={4}
              bg="mainBackgroundColor"
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
            backgroundColor: theme.colors.secondaryBackgroundColor,
            paddingHorizontal: 20,
            paddingTop: 30,
          }}
        >
          <CustomText textAlign="center" variant="bodySubheader">
            Save address
          </CustomText>
          <Box height={20} />
          <CustomInputWithoutForm
            value={address}
            onChange={(e) => setAddress(e)}
            boxStyle={{
              backgroundColor: theme.colors.borderColor,
              borderWidth: 0,
            }}
          />

          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            mt="l"
          >
            <CustomButton
              width={"100%"}
              borderRadius={50}
              text="save"
              bgColor={theme.colors.primaryColor}
              disabled={address.length < 1}
              disabledColor={theme.colors.borderColor}
              onPress={() => save()}
            />
          </Box>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default SaveAddress;
