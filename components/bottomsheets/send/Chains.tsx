import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText } from "@/components/general";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { setStage } from "@/state/reducers/sendPage.reducer";
import { Theme } from "@/theme";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { TickCircle } from "iconsax-react-nativejs";
import { Search } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { useDispatch } from "react-redux";

const ChainCard = ({
  title = "BTC",
  price = 1000,
  showCheck = false,
  showPrice = true,
}: {
  title?: string;
  price?: number;
  showCheck?: boolean;
  showPrice?: boolean;
}) => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const { sendTokenRef: bottomsheetRef } = useBottomSheetRefs();
  const handleClick = () => {
    bottomsheetRef.current?.close();
    dispatch(setStage("token"));
    router.push("/dashboard/home/send-token");
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
        <Box ml="s" justifyContent="center">
          <CustomText fontSize={14} variant="bodyMedium">
            {title}
          </CustomText>
          {showPrice && (
            <CustomText fontSize={10} style={{ marginTop: 2 }}>
              {price && showPrice ? `${price}` : ""}
            </CustomText>
          )}
        </Box>
      </Box>
      {showCheck && (
        <TickCircle variant="Bold" color={theme.colors.tabBarActiveColor} />
      )}
    </Pressable>
  );
};

const Chains = () => {
  const theme = useTheme<Theme>();

  return (
    <Box flex={1}>
      <CustomInputWithoutForm
        value=""
        onChange={(e) => console.log(e)}
        iconLeft={<Search color={theme.colors.bodyTextColor} />}
        placeholder="Search chains"
        style={{}}
      />
      <BottomSheetScrollView>
        <Box
          width={"100%"}
          borderRadius={12}
          backgroundColor="secondaryBackgroundColor"
          p="m"
          mt="l"
        >
          <ChainCard title="All chains" showCheck showPrice={false} />
          {Array.from([1, 2, 3]).map((item) => (
            <ChainCard key={item} />
          ))}
        </Box>

        <Box
          width={"100%"}
          borderRadius={12}
          backgroundColor="secondaryBackgroundColor"
          p="m"
          mt="m"
        >
          {Array.from([
            "BTC",
            "ETH",
            "BNB",
            "MATIC",
            "AVAX",
            "SOL",
            "DOT",
            "ADA",
          ]).map((item, index) => (
            <ChainCard key={index.toString()} showPrice={false} title={item} />
          ))}
        </Box>
      </BottomSheetScrollView>
    </Box>
  );
};

export default Chains;
