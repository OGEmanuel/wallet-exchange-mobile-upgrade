import { AppBar, Box, CustomButton, CustomText } from "@/components/general";
import React from "react";
import { ChevronLeft } from "react-native-feather";

import {
  ThemedLinkedTrueIcon,
  ThemedSwap2Icon,
} from "@/assets/svg/wallet-icons-components";
import {
  selectBuyCurrency,
  setBuyStage,
} from "@/src/modules/buy/presentation/state/buy-slice";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import { Pressable } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

const Buy = () => {
  const currency = useSelector(selectBuyCurrency);
  const dispatch = useDispatch();
  const theme = useTheme<Theme>();

  // state
  const [value, setValue] = React.useState("");
  return (
    <Box flex={0.75}>
      <AppBar
        height={30}
        paddingHorizontal={0}
        leading={
          <ChevronLeft
            fontSize={20}
            onPress={() => dispatch(setBuyStage("currency_select"))}
          />
        }
        title={
          <CustomText fontSize={16} variant="medium">
            Buy
          </CustomText>
        }
        trailing={
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.colors.secondaryBackgroundColor,
              borderRadius: 20,
            }}
            onPress={() => dispatch(setBuyStage("currency_select"))}
          >
            <CustomText>{currency?.flag}</CustomText>
            <ChevronDown size={20} color={theme.colors.bodyTextColor} />
          </Pressable>
        }
      />

      <Box flex={1} paddingHorizontal="m">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          height={200}
        >
          <Box />
          <Box alignItems="center">
            <Box flexDirection="row" alignItems="center">
              <CustomText fontSize={16} variant="medium">
                {currency?.flag}
              </CustomText>
              <CustomText fontSize={14} variant="medium">
                {currency?.name}
              </CustomText>
            </Box>
            <TextInput
              placeholder="NGN0.00"
              placeholderTextColor={theme.colors.bodyTextColor}
              style={{
                fontSize: 40,
                fontFamily: theme.textVariants.bodySubheader.fontFamily,
                marginTop: 10,
                color: theme.colors.bodyTextColor,
              }}
              value={value}
              onChangeText={(text) => setValue(text)}
              keyboardType="numeric"
            />
            <CustomText fontSize={16} mt="s">
              {value ? `${Number(value) * 0.3}` : "0.00"}
            </CustomText>
          </Box>
          <Box
            width={30}
            height={30}
            borderRadius={8}
            justifyContent="center"
            alignItems="center"
            bg="tabBarActiveColor"
          >
            <ThemedSwap2Icon darkModeColor={"black"} lightModeColor={"black"} />
          </Box>
        </Box>
      </Box>

      <Box height={180} justifyContent="center" paddingHorizontal="m">
        <Box
          width={"100%"}
          height={50}
          borderRadius={8}
          borderWidth={1}
          borderColor="borderColor"
          flexDirection="row"
          paddingHorizontal="s"
          alignItems="center"
          justifyContent="space-between"
          mb="l"
        >
          <Box flexDirection="row" alignItems="center">
            <Image
              source={require("@/assets/images/zapIcon.png")}
              style={{
                width: 20,
                height: 20,
              }}
            />
            <CustomText marginHorizontal="s" fontSize={12} variant="body">
              Zap Exchange
            </CustomText>
            <ThemedLinkedTrueIcon
              darkModeColor={theme.colors.bodyTextColor}
              lightModeColor={theme.colors.bodyTextColor}
            />
          </Box>
          <Box>
            <CustomText variant="body" fontSize={12}>
              1 {currency?.name.toUpperCase()} = 500 USDC
            </CustomText>
          </Box>
        </Box>
        <CustomButton
          disabled={value.length < 1}
          disabledColor={theme.colors.disabledTextColor}
          text="Continue"
          width={"100%"}
          borderRadius={40}
          onPress={() => dispatch(setBuyStage("transfer_details"))}
        />
      </Box>
    </Box>
  );
};

export default Buy;
