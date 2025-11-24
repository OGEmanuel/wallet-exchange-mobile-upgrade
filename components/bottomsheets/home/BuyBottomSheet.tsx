import { CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import useBottomSheetRefs from "@/hooks/useBottomSheetRefs";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React, { forwardRef } from "react";
import { Platform, Pressable } from "react-native";
import { ChevronRight } from "react-native-feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Token = {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  image?: any;
  icon?: string;
  price?: number;
};

const ItemCard = ({
  title,
  body,
  image,
  onPress,
}: {
  title: string;
  body: string;
  image: React.ReactNode;
  onPress: () => void;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      style={{
        width: "100%",
        height: 92,
        borderWidth: 1,
        borderColor: theme.colors.borderColor,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16, // theme.spacing.m value
      }}
      onPress={() => onPress()}
    >
      <Box flexDirection="row" justifyContent="flex-start" alignItems="center">
        <Box width={55} height={60}>
          {image}
        </Box>
        <Box ml="m">
          <CustomText variant="subheader">{title}</CustomText>
          <CustomText variant="bodySubheader">{body}</CustomText>
        </Box>
      </Box>

      <ChevronRight color={theme.colors.bodyTextColor} />
    </Pressable>
  );
};

const TradeSelectBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const insets = useSafeAreaInsets();
  const { buyTokensBottomSheetRef, sellTokensBottomSheetRef } =
    useBottomSheetRefs();

  // Tab bar height: 90 on iOS, 70 on Android
  const tabBarHeight = Platform.OS === "ios" ? 90 : 70;
  const bottomInset = tabBarHeight;

  const openSellFlow = () => {
    // Close this sheet using the ref prop
    (ref as React.RefObject<BottomSheet>).current?.close();

    setTimeout(() => {
      sellTokensBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  };

  const openBuyFlow = () => {
    (ref as React.RefObject<BottomSheet>).current?.close();
    setTimeout(() => {
      buyTokensBottomSheetRef.current?.snapToIndex(0);
    }, 100);
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={["35%"]}
      enablePanDownToClose
      enableOverDrag={false}
      enableDynamicSizing={false}
      bottomInset={bottomInset}
      backdropComponent={(props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      )}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
        zIndex: 1000,
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
        }}
      >
        <ItemCard
          title="Buy"
          body="Buy cryptocurrencies"
          image={
            <Image
              source={require("@/assets/images/btcc.png")}
              contentFit="contain"
              style={{ width: "100%", height: "100%" }}
            />
          }
          onPress={openBuyFlow}
        />
        <Box height={16}></Box>
        <ItemCard
          title="Sell"
          body="Sell cryptocurrencies"
          image={
            <Image
              source={require("@/assets/images/dollar2.png")}
              contentFit="contain"
              style={{ width: "100%", height: "100%" }}
            />
          }
          onPress={openSellFlow}
        />
      </BottomSheetView>
    </BottomSheet>
  );
});

TradeSelectBottomSheet.displayName = "TradeSelectBottomSheet";
export default TradeSelectBottomSheet;
