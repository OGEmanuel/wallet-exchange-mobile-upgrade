// components/bottomsheets/ZapLinkBottomSheet.tsx

import ThemedLinkIcon from "@/assets/svg/wallet-icons-components/ThemedLinkIcon";
import ThemedNotLinkedIcon from "@/assets/svg/wallet-icons-components/ThemedNotLinkedIcon";
import ThemedUnlinkIcon2 from "@/assets/svg/wallet-icons-components/ThemedUnlinkIcon2";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useCallback, useState } from "react";
import { Box, CustomButton } from "../general";
import CustomText from "../general/CustomText";

interface ZapLinkBottomSheetProps {
  onClose?: () => void;
  onDisconnect?: () => void;
  onConnect?: () => void;
  isZapLinked?: boolean;
  username?: string;
}

const ZapLinkBottomSheet = forwardRef<BottomSheet, ZapLinkBottomSheetProps>(
  (props, ref) => {
    const theme = useTheme<Theme>();
    const { isZapLinked, onDisconnect, onConnect, onClose, username } = props;
    const [isConfirmDisconnect, setIsConfirmDisconnect] = useState(false);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );
    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["70%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={() => setIsConfirmDisconnect(false)}
        style={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        enableOverDrag={false}
        enableHandlePanningGesture={true}
        backgroundStyle={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.white,
        }}
      >
        <BottomSheetView
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 130,
            backgroundColor: theme.colors.mainBackgroundColor,
          }}
        >
          <Box
            alignItems="center"
            marginBottom="l"
            backgroundColor="mainBackgroundColor"
          >
            {isZapLinked ? (
              isConfirmDisconnect ? null : (
                <ThemedLinkIcon width={80} height={80} />
              )
            ) : (
              <ThemedNotLinkedIcon />
            )}
            <CustomText
              variant="medium"
              fontSize={22}
              color="headerTextColor"
              textAlign="center"
              marginTop="s"
              marginBottom="l"
            >
              {isZapLinked
                ? isConfirmDisconnect
                  ? "Disconnect Account?"
                  : "Connected to Zap"
                : "Connect to Zap?"}
            </CustomText>
            <CustomText
              variant="body"
              color="bodyTextColor"
              textAlign="center"
              fontSize={14}
              paddingHorizontal="s"
            >
              {isZapLinked
                ? isConfirmDisconnect
                  ? "Are you sure you want to disconnect Zap Account? You will have to connect again to access buy/sell trades."
                  : "Your Zap Exchange account is currently connected to your wallet app."
                : "Connect to Zap exchange to be able to perform buy or sell trades"}
            </CustomText>
          </Box>
          {isZapLinked ? (
            !isConfirmDisconnect ? (
              <CustomButton
                bgColor={theme.colors.error}
                width={"100%"}
                text="Disconnect"
                trailingIcon={<ThemedUnlinkIcon2 />}
                onPress={() => setIsConfirmDisconnect(true)}
                height={60}
                borderRadius={30}
              />
            ) : (
              <Box
                flexDirection="row"
                justifyContent="space-between"
                width={"100%"}
              >
                <CustomButton
                  text="Cancel"
                  bgColor={theme.colors.secondaryBackgroundColor}
                  color="headerTextColor"
                  onPress={() => setIsConfirmDisconnect(false)}
                  height={56}
                  width={"47%"}
                  borderRadius={40}
                />
                <CustomButton
                  bgColor={theme.colors.error}
                  text="Disconnect"
                  onPress={() => onDisconnect && onDisconnect()}
                  height={56}
                  width={"47%"}
                  borderRadius={40}
                />
              </Box>
            )
          ) : (
            <Box
              flexDirection="row"
              justifyContent="space-between"
              width={"100%"}
            >
              <CustomButton
                text="Cancel"
                bgColor={theme.colors.secondaryBackgroundColor}
                color="headerTextColor"
                onPress={() => onClose && onClose()}
                height={56}
                width={"47%"}
                borderRadius={40}
              />
              <CustomButton
                bgColor={theme.colors.primaryColor}
                text="Connect"
                onPress={() => onConnect && onConnect()}
                height={56}
                width={"47%"}
                borderRadius={40}
              />
            </Box>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ZapLinkBottomSheet.displayName = "ZapLinkBottomSheet";

export default ZapLinkBottomSheet;
