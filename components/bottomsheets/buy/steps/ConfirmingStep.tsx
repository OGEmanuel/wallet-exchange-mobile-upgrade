import { ThemedCopyIcon } from "@/assets/svg/wallet-icons-components";
import { Box, CustomText } from "@/components/general";
import { setBuyStage } from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { useDispatch } from "react-redux";

const ConfirmingStep = () => {
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();

  React.useEffect(() => {
    const sub = setTimeout(() => {
      dispatch(setBuyStage("confirmed"));
    }, 10000);

    return () => clearTimeout(sub);
  }, []);
  return (
    <Box flex={1} paddingHorizontal="m" paddingTop={18}>
      <ChevronLeft
        size={30}
        color={theme.colors.bodyTextColor}
        onPress={() => dispatch(setBuyStage("transfer_details"))}
      />

      <Box
        width={"100%"}
        height={200}
        bg="secondaryBackgroundColor"
        borderRadius={12}
        mt="l"
        justifyContent="center"
        alignItems="center"
      >
        <CustomText color="disabledTextColor" fontSize={14}>
          Swap 869,000NGN for
        </CustomText>

        <CustomText
          color="bodyTextColor"
          variant="subheader"
          mt="l"
          fontSize={24}
        >
          0.000869 BTC
        </CustomText>

        <Box
          width={"40%"}
          height={32}
          borderRadius={8}
          mt="m"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
          bg="mainBackgroundColor"
        >
          <CustomText color="bodyTextColor" fontSize={14}>
            0x123456d33...
          </CustomText>
          <ThemedCopyIcon
            lightModeColor={theme.colors.bodyTextColor}
            darkModeColor={theme.colors.bodyTextColor}
          />
        </Box>

        <Box
          width={"30%"}
          height={32}
          borderRadius={8}
          mt="s"
          flexDirection="row"
          justifyContent="center"
          alignItems="center"
        >
          <CustomText color="bodyTextColor" fontSize={14}>
            ERC-20
          </CustomText>
        </Box>
      </Box>

      <Box width={"100%"} flexDirection="row" alignItems="center" mt="l">
        <Box
          width={20}
          height={20}
          borderWidth={2}
          borderColor="borderColor"
          bg="tabBarActiveColor"
          borderRadius={5}
        ></Box>
        <Box flex={1} height={5} bg="tabBarActiveColor"></Box>
        <Box
          width={20}
          height={20}
          borderWidth={2}
          borderColor="borderColor"
          borderRadius={5}
        ></Box>
        <Box flex={1} height={5} bg="secondaryBackgroundColor"></Box>
        <Box
          width={20}
          height={20}
          borderWidth={2}
          borderColor="borderColor"
          borderRadius={5}
        ></Box>
      </Box>
      <Box
        width={"100%"}
        flexDirection="row"
        justifyContent="space-between"
        mt="s"
      >
        <CustomText fontSize={12}>Confirming</CustomText>
        <CustomText fontSize={12}>Swapping</CustomText>
        <CustomText fontSize={12}>Sending</CustomText>
      </Box>
    </Box>
  );
};

export default ConfirmingStep;

