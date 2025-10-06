import { Box, CustomText } from "@/components/general";
import { ChainModel } from "@/src/modules/settings/domain/entities/models/chain-model";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import {
  selectSettingState,
  setActiveChain,
} from "@/src/modules/settings/presentation/state/settings-slice";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { TickCircle } from "iconsax-react-nativejs";
import React, { forwardRef, useCallback } from "react";
import { Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

const ChainsBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<ChainModel[]>([]);
  const { getChains } = useSettings();
  const dispatch = useDispatch();
  const activeChain = useSelector(selectSettingState);

  React.useEffect(() => {
    (async () => {
      try {
        const response = await getChains();
        setData(response.data as ChainModel[]);
        console.log("FROM CHAINS MODAL", (response.data as any[])[0] as any);
        setLoading(false);
      } catch (error) {
        console.log(error);
        alert(JSON.stringify(error));
      }
    })();
  }, []);

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
      snapPoints={["80%", "60%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{
        backgroundColor: theme.colors.mainBackgroundColor,
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
          paddingHorizontal: 0,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <CustomText variant="subheader" textAlign="center">
          Select Your chain
        </CustomText>
        <FlatList
          contentContainerStyle={{
            marginTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
          data={data}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => dispatch(setActiveChain(item))}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                justifyContent: "space-between",
              }}
            >
              <Box flexDirection="row" alignItems="center">
                <Image
                  source={{ uri: item?.nativeCurrencyId.logo }}
                  contentFit="contain"
                  style={{ width: 40, height: 40 }}
                />
                <CustomText marginLeft="s">{item.name}</CustomText>
              </Box>
              {activeChain.activeChain?._id === item._id && (
                <TickCircle
                  color={theme.colors.tabBarActiveColor}
                  size={30}
                  variant="Bold"
                />
              )}
            </Pressable>
          )}
        />
      </BottomSheetView>
    </BottomSheet>
  );
});

export default ChainsBottomSheet;
