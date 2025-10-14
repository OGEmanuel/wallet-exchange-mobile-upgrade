import { currencies } from "@/data";
import useSettings from "@/src/modules/settings/presentation/hooks/useSettings";
import { setActiveCurrency } from "@/src/modules/settings/presentation/state/settings-slice";
import { CurrencyModel } from "@/src/modules/utilities/domain/entities/models/currency-model";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { uniqBy } from "lodash";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Modal, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useDispatch } from "react-redux";
import { Box, CustomText } from "../general";

interface CurrencySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCurrency: () => void;
}

const CurrencySelectionModal: React.FC<CurrencySelectionModalProps> = ({
  visible,
  onClose,
  onSelectCurrency,
}) => {
  const theme = useTheme<Theme>();
  const [limit, setLimit] = React.useState(30);
  const [offset, setOffset] = React.useState(1);
  const [data, setData] = React.useState<CurrencyModel[]>([]);
  const [loading, setLoading] = React.useState(false);
  const currencyFilters = ["NGN", "USD", "EUR", "GBP", "CAD"];

  const dispatch = useDispatch();
  const { getCurrencies } = useSettings();

  React.useEffect(() => {
    (async function () {
      try {
        setLoading(true);
        const response = await getCurrencies({
          params: { limit, offset },
        });
        console.log("THE CURRENCIES", response.data);
        setData((prev) =>
          uniqBy(
            [...prev, ...(response.data?.currencies as CurrencyModel[])],
            "_id"
          )
        );
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, [offset]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.mainBackgroundColor,
            borderRadius: 12,
            marginHorizontal: 20,
            maxHeight: "80%",
            width: "90%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Box
            paddingHorizontal="l"
            paddingVertical="m"
            borderBottomWidth={1}
            borderBottomColor="borderColor"
          >
            <CustomText
              variant="bodyBold"
              textAlign="center"
              style={{ fontFamily: "NewScience_Bold" }}
            >
              Choose currency
            </CustomText>
          </Box>

          <FlatList
            data={currencyFilters}
            key={"_id"}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              setOffset((prev) => prev + limit);
            }}
            ListFooterComponent={() => (
              <>
                {loading && (
                  <Box
                    width={"100%"}
                    height={40}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <ActivityIndicator size={"small"} />
                  </Box>
                )}
              </>
            )}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => {
                  dispatch(setActiveCurrency(item));
                  onSelectCurrency();
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                android_ripple={{
                  color: "rgba(255,255,255,0.1)",
                  borderless: false,
                }}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingHorizontal="l"
                  paddingVertical="m"
                  borderBottomWidth={index < currencies.length - 1 ? 1 : 0}
                  borderBottomColor="borderColor"
                >
                  <Box flexDirection="row" alignItems="center" flex={1}>
                    <Box flex={1}>
                      <CustomText variant="bodyBold" color="headerTextColor">
                        {item}
                      </CustomText>
                    </Box>
                  </Box>
                  <ChevronRight size={20} color={theme.colors.bodyTextColor} />
                </Box>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CurrencySelectionModal;
