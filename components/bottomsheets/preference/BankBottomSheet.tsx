import { Box, CustomText } from "@/components/general";
import { BankModel } from "@/src/modules/settings/domain/entities/models/bank-model";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import {
  selectSettingState,
  setActiveBank,
} from "@/src/modules/settings/presentation/state/settings-slice";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { TickCircle } from "iconsax-react-nativejs";
import { uniq } from "lodash";
import React, { forwardRef, useCallback } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

const BankBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<BankModel[]>([]);
  const [limit, setLimit] = React.useState(30);
  const [offset, setOffset] = React.useState(1);
  const { getBanks } = useSettings();
  const dispatch = useDispatch();
  const { activeBank } = useSelector(selectSettingState);
  console.log("Active Bank", activeBank);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await getBanks({ params: { limit, offset } });
        setData((prev) =>
          uniq([...prev, ...(response.data?.banks as BankModel[])])
        );
        console.log("FROM BANK MODAL", response.data?.banks as any[] as any);
        setLoading(false);
      } catch (error) {
        console.log(error);
        alert(JSON.stringify(error));
      }
    })();
  }, [offset]);

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
        <CustomText variant="subheader" textAlign="center" mb="l">
          Select Your bank
        </CustomText>
        <FlatList
          contentContainerStyle={{
            marginTop: 0,
            paddingHorizontal: 20,
            paddingBottom: 10,
          }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            setOffset((prev) => prev + limit);
          }}
          data={data}
          ListFooterComponent={() => (
            <>
              {loading && (
                <Box
                  width={"100%"}
                  height={40}
                  justifyContent="center"
                  alignItems="center"
                >
                  <ActivityIndicator color={theme.colors.primaryColor} />
                  <CustomText>Loading Banks</CustomText>
                </Box>
              )}
            </>
          )}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => dispatch(setActiveBank(item))}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                justifyContent: "space-between",
                height: 50,
              }}
            >
              <Box
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
              >
                <Box width={30} height={30} borderRadius={30} overflow="hidden">
                  <Image
                    source={{ uri: item.icon }}
                    contentFit="contain"
                    style={{ width: 30, height: 30 }}
                  />
                </Box>
                <CustomText variant="bodySubheader" fontSize={14} ml="s">
                  {item.name}
                </CustomText>
              </Box>
              {activeBank !== null && activeBank?._id === item._id && (
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

export default BankBottomSheet;
