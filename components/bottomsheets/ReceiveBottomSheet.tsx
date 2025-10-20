
import {
  ThemedLinkExternalIcon
} from "@/assets/svg/wallet-icons-components";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useState } from "react";
import { Box, CustomText } from "../general";

const RecieveBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1); // Remove unused state
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
      snapPoints={["80%", "90%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
        zIndex: 1000,
        borderRadius: 12,
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
          paddingBottom: 100, // Add bottom padding for tab bar
        }}
      >
        <CustomText variant="bodyMedium" fontSize={18} textAlign="center">
          Recieve
        </CustomText>
        <CustomText variant="body" fontSize={12} mt="s" textAlign="center">
          June 23, 2024 at 12.00 PM
        </CustomText>

        <Box
          width={"100%"}
          alignItems="center"
          justifyContent="center"
          bg="secondaryBackgroundColor"
          borderRadius={12}
          height={135}
          mt="l"
        >
          <Box
            width={40}
            height={40}
            borderRadius={40}
            bg="mainBackgroundColor"
          ></Box>
          <Box flexDirection="row" alignItems="center" mt="s">
            <CustomText variant="subheader" fontSize={22} ml="s">
              +34.0976 USDT
            </CustomText>
          </Box>
          <CustomText variant="body" mt="s" fontSize={14} ml="s">
            $89.00
          </CustomText>
        </Box>

        <Box
          width={"100%"}
          height={138}
          p="m"
          borderRadius={8}
          borderWidth={1}
          borderColor="borderColor"
          mt="l"
        >
          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            height={30}
          >
            <CustomText color="disabledTextColor" fontSize={12}>
              Recieved From
            </CustomText>
            <CustomText fontSize={12}>0xd5321...de32</CustomText>
          </Box>

          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            height={30}
          >
            <CustomText color="disabledTextColor" fontSize={12}>
              Network
            </CustomText>
            <CustomText fontSize={12}>Fantom</CustomText>
          </Box>

          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            height={30}
          >
            <CustomText color="disabledTextColor" fontSize={12}>
              Network Fee
            </CustomText>
            <CustomText fontSize={12}>0.0089FTM</CustomText>
          </Box>

          <Box
            width={"100%"}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            height={30}
          >
            <CustomText color="disabledTextColor" fontSize={12}>
              Hash
            </CustomText>
            <Box flexDirection="row" alignItems="center">
              <CustomText fontSize={12} marginHorizontal="s">
                0xd5321...de32
              </CustomText>
              <ThemedLinkExternalIcon width={15} height={15} />
            </Box>
          </Box>
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default RecieveBottomSheet;
