import { ThemedFaceIDIcon } from "@/assets/svg/wallet-icons-components";
import NetworkFeeCard from "@/components/dashboard/NetworkFeeCard";
import { CustomButton, CustomText } from "@/components/general";
import { selectStage } from "@/state/reducers/sendPage.reducer";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React, { forwardRef, useCallback } from "react";
import { Pressable } from "react-native";
import { useSelector } from "react-redux";
import Box from "../../general/Box";

const ConfirmSend = forwardRef<BottomSheet, { send: () => void }>(
  (props, ref) => {
    const { send } = props;
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
        snapPoints={["60%"]}
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
            Confirm Send
          </CustomText>
          <Box alignItems="center" mb="m">
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "auto",
                marginTop: 20,
                marginBottom: 30,
              }}
            >
              <Box
                width={20}
                height={20}
                borderRadius={2}
                bg="secondaryBackgroundColor"
              >
                <Image
                  source={require("@/assets/images/rect2.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                  }}
                />
              </Box>
              <CustomText variant="body" fontSize={14} marginHorizontal="m">
                Daggerman
              </CustomText>
            </Pressable>

            <Box position="relative" width={"100%"}>
              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                width={"100%"}
                height={101}
                borderRadius={12}
                bg="mainBackgroundColor"
                p="m"
              >
                <Box flex={1}>
                  <CustomText>You're sending</CustomText>
                  <CustomText
                    variant="subheader"
                    fontSize={22}
                    style={{ marginVertical: 4 }}
                  >
                    0.099TRX
                  </CustomText>
                  <CustomText>$10.00</CustomText>
                </Box>
                <Image
                  source={require("@/assets/images/tron.png")}
                  style={{ width: 30, height: 30 }}
                  contentFit="contain"
                />
              </Box>

              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                width={"100%"}
                height={101}
                borderRadius={12}
                bg="mainBackgroundColor"
                mt="s"
                p="m"
              >
                <Box flex={1}>
                  <CustomText>To</CustomText>
                  <CustomText
                    variant="subheader"
                    fontSize={22}
                    style={{ marginVertical: 4 }}
                  >
                    Rabidranger.eth
                  </CustomText>
                </Box>
                <Image
                  source={require("@/assets/images/eth.png")}
                  style={{ width: 30, height: 30 }}
                  contentFit="contain"
                />
              </Box>
              <Image
                source={require("@/assets/images/arrowsdown.png")}
                style={{
                  width: 40,
                  height: 40,
                  position: "absolute",
                  left: "45%",
                  top: "40%",
                }}
                contentFit="contain"
              />
            </Box>
          </Box>
          <NetworkFeeCard />
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            mt="l"
          >
            <CustomButton
              width={"49%"}
              borderRadius={50}
              text="Cancel"
              bgColor={theme.colors.borderColor}
              onPress={() => {}}
            />
            <CustomButton
              width={"49%"}
              borderRadius={50}
              text="Send"
              trailingIcon={
                <Box ml="s">
                  <ThemedFaceIDIcon
                    darkModeColor={theme.colors.bodyTextColor}
                    lightModeColor={theme.colors.bodyTextColor}
                  />
                </Box>
              }
              onPress={() => {
                send();
              }}
            />
          </Box>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default ConfirmSend;
