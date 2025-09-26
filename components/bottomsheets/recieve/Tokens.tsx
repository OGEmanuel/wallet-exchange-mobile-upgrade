import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText } from "@/components/general";
import { setStage } from "@/state/reducers/recievePage.reducer";
import { Theme } from "@/theme";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Copy, Search } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { useDispatch } from "react-redux";

const TokenCard = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(setStage("qrcode"));
  };
  return (
    <Pressable
      onPress={handleClick}
      style={{
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <Box flex={1} flexDirection="row" alignItems="center">
        <Box
          width={40}
          height={40}
          borderRadius={40}
          bg="mainBackgroundColor"
        ></Box>
        <Box ml="s">
          <CustomText fontSize={12} variant="medium">
            USDT
          </CustomText>
          <CustomText fontSize={10} style={{ marginTop: 2 }}>
            4.2 USDT-SPL
          </CustomText>
        </Box>
      </Box>
      <Copy size={20} color={theme.colors.bodyTextColor} />
    </Pressable>
  );
};

const UserTokens = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();

  return (
    <Box flex={1}>
      <CustomInputWithoutForm
        value=""
        onChange={(e) => console.log(e)}
        iconLeft={<Search color={theme.colors.bodyTextColor} />}
        placeholder="Search token"
        style={{}}
      />

      <CustomText variant="medium" fontSize={16} mt="m">
        Your tokens
      </CustomText>
      <Box flex={0.95}>
        <BottomSheetScrollView
          style={{
            backgroundColor: theme.colors.secondaryBackgroundColor,
            marginTop: 20,
            borderRadius: 12,
          }}
          contentContainerStyle={{
            paddingBottom: 100,

            padding: 10,
          }}
        >
          {Array.from([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5,
            6, 7, 8, 9,
          ]).map((item, index) => (
            <TokenCard key={`token-${item}-${index}`} />
          ))}
        </BottomSheetScrollView>
      </Box>

      <Pressable
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
          height: 20,
        }}
        onPress={() => dispatch(setStage("import"))}
      >
        <CustomText>You cannot find a token?</CustomText>
        <CustomText color="tabBarActiveColor" ml="s">
          Import token
        </CustomText>
      </Pressable>
    </Box>
  );
};

export default UserTokens;
