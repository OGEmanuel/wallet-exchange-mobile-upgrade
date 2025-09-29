import { Box, CustomButton, CustomText } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { setStage } from "@/state/reducers/recievePage.reducer";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { Copy, X } from "lucide-react-native";
import React from "react";
import QRCode from "react-native-qrcode-svg";
import { useDispatch } from "react-redux";

const ShowQRcode = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { recieveActivityRef } = useBottomSheetRefs();
  return (
    <Box flex={1}>
      <Box width="100%">
        <X
          size={20}
          color={theme.colors.bodyTextColor}
          onPress={() => {
            dispatch(setStage("token"));
            recieveActivityRef.current?.close();
          }}
        />
      </Box>
      <CustomText
        textAlign="center"
        mt="m"
        variant="bodySubheader"
        fontSize={18}
      >
        Ethereum
      </CustomText>
      <CustomText textAlign="center" mt="s">
        Copy address or scan bar code to receive token into your wallet with
        ease.
      </CustomText>
      <Box flex={0.9} alignItems="center" justifyContent="center">
        <Box p="s" backgroundColor="white" borderRadius={5} overflow="hidden">
          <QRCode
            value="0x1234567890abcdef1234567890abcdef"
            size={250}
            backgroundColor="white"
            color="black"
          />
        </Box>
        <Box
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          marginTop="l"
        >
          <Image
            source={require("@/assets/images/eth.png")}
            style={{ width: 20, height: 20 }}
          />
          <CustomText paddingHorizontal="m">0x1234567890..hhh7yf</CustomText>
          <Copy size={20} color={theme.colors.white} />
        </Box>
      </Box>
      <CustomButton
        width={"100%"}
        borderRadius={50}
        text="Copy Address"
        leadingIcon={<Copy size={20} color={theme.colors.white} />}
        onPress={() => {}}
      />
    </Box>
  );
};

export default ShowQRcode;
