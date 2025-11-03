import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText } from "@/components/general";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { CurrencyModel } from "@zap/blockchain-sdk";
import { TickCircle } from "iconsax-react-nativejs";
import { uniq } from "lodash";
import { Search } from "lucide-react-native";
import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const { height: HEIGHT } = Dimensions.get("screen");

const ChangeCurrencyBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const [currenciesList, setCurrenciesList] = useState<CurrencyModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const { getCurrencies, defaultCurrency, setDefaultCurrenct } = useSettings();

  const fetchCurrencies = useCallback(async () => {
    if (isLoading || !hasMore) return;
    try {
      setIsLoading(true);
      const data = await getCurrencies({
        params: { limit: 470, offset: 1 },
      });

      const newCurrencies = data?.data?.currencies ?? [];
      const totalCount = data?.data?.totalCount ?? 0;

      setCurrenciesList((prev) => {
        const updated = uniq([...prev, ...newCurrencies]);
        setHasMore(updated.length < totalCount);
        return updated;
      });

      setTotal(totalCount);
      setIsLoading(false);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, getCurrencies]);

  // Initial fetch
  useEffect(() => {
    fetchCurrencies();
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
      snapPoints={["90%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      style={{ backgroundColor: theme.colors.mainBackgroundColor }}
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
          height: "90%",
          backgroundColor: theme.colors.mainBackgroundColor,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        <CustomText variant="subheader" textAlign="center" fontSize={24} mb="l">
          Currency
        </CustomText>
        <CustomInputWithoutForm
          value={search}
          onChange={setSearch}
          placeholder="Search by name"
          iconLeft={<Search color={theme.colors.bodyTextColor} size={24} />}
          editable={currenciesList.length > 0}
          boxStyle={{ borderWidth: 0 }}
        />
        <Box
          width="100%"
          height="80%"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          backgroundColor="secondaryBackgroundColor"
          borderRadius={12}
          mt="l"
        >
          <FlatList
            style={{ width: "100%", height: "100%" }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
            data={
              search
                ? currenciesList.filter(
                    (item) =>
                      item?.name
                        ?.toLowerCase()
                        .includes(search.toLowerCase()) ||
                      item?.code?.toLowerCase().includes(search.toLowerCase())
                  )
                : currenciesList
            }
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setDefaultCurrenct(item)}
                style={{
                  width: "100%",
                  height: 50,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                  marginBottom: 20,
                }}
              >
                <Box>
                  <CustomText variant="subheader" fontSize={16}>
                    {item.code}
                  </CustomText>
                  <CustomText>{item.name}</CustomText>
                </Box>
                {item.code === defaultCurrency?.code && (
                  <TickCircle
                    variant="Bold"
                    color={theme.colors.tabBarActiveColor}
                  />
                )}
              </Pressable>
            )}
            ListFooterComponent={() => (
              <>
                {isLoading ? (
                  <Box
                    width="100%"
                    height={50}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <ActivityIndicator
                      animating
                      color={theme.colors.tabBarActiveColor}
                    />
                  </Box>
                ) : null}
              </>
            )}
          />
        </Box>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default ChangeCurrencyBottomSheet;
