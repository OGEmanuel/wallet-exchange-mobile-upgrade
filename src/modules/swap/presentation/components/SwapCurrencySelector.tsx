import { Box, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SupportedCurrency } from "../../domain/entities/currency.types";

interface Props {
  visible: boolean;
  onClose: () => void;
  currencies: SupportedCurrency[];
  selectedCurrency?: SupportedCurrency | null;
  onSelect: (currency: SupportedCurrency) => void;
  title?: string;
}

const SwapCurrencySelector: React.FC<Props> = ({
  visible,
  onClose,
  currencies,
  selectedCurrency,
  onSelect,
  title = "Select Currency",
}) => {
  const theme = useTheme<Theme>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurrencies = currencies.filter((currency) => {
    const code = currency.currencyId?.code?.toLowerCase() || "";
    const symbol = currency.currencyId?.symbol?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return code.includes(query) || symbol.includes(query);
  });

  const handleSelect = (currency: SupportedCurrency) => {
    onSelect(currency);
    setSearchQuery("");
  };

  const renderCurrencyItem = ({
    item,
  }: {
    item: SupportedCurrency;
  }) => {
    const isSelected = item._id === selectedCurrency?._id;

    return (
      <TouchableOpacity onPress={() => handleSelect(item)}>
        <Box
          paddingVertical="m"
          paddingHorizontal="l"
          borderBottomWidth={1}
          borderBottomColor="borderColor"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          backgroundColor={
            isSelected ? "fadedPrimaryColor" : "mainBackgroundColor"
          }
        >
          <Box flexDirection="row" alignItems="center" gap="m">
            {item.image || item.currencyId?.logo ? (
              <Image
                source={{ uri: item.image || item.currencyId?.logo }}
                style={styles.currencyImage}
              />
            ) : (
              <Box
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor="secondaryBackgroundColor"
                justifyContent="center"
                alignItems="center"
              >
                <CustomText variant="body" fontSize={14} fontWeight="600">
                  {item.currencyId?.code?.charAt(0) || "?"}
                </CustomText>
              </Box>
            )}
            <Box gap="s">
              <CustomText variant="body" fontSize={16} fontWeight="600">
                {item.currencyId?.code}
              </CustomText>
              <CustomText
                variant="body"
                fontSize={12}
                color="disabledTextColor"
              >
                {item.currencyId?.symbol}
              </CustomText>
            </Box>
          </Box>
          {isSelected && (
            <CustomText fontSize={20} color="success">
              ✓
            </CustomText>
          )}
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Box
          backgroundColor="mainBackgroundColor"
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          maxHeight="80%"
          paddingBottom="l"
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            p="l"
            borderBottomWidth={1}
            borderBottomColor="borderColor"
          >
            <CustomText variant="bodyBold" fontSize={18}>
              {title}
            </CustomText>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <CustomText fontSize={24} color="disabledTextColor">
                ✕
              </CustomText>
            </TouchableOpacity>
          </Box>

          <Box
            flexDirection="row"
            alignItems="center"
            backgroundColor="secondaryBackgroundColor"
            borderRadius={12}
            m="m"
            paddingHorizontal="m"
          >
            <CustomText fontSize={16} marginRight="s">
              🔍
            </CustomText>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search currencies..."
              placeholderTextColor={theme.colors.placeholderTextColor}
              style={[
                styles.searchInput,
                {
                  color: theme.colors.bodyTextColor,
                  fontFamily: "PlusJakartaSans_Regular",
                },
              ]}
            />
          </Box>

          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item._id}
            renderItem={renderCurrencyItem}
            style={styles.list}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <Box p="xl" alignItems="center">
                <CustomText
                  variant="body"
                  fontSize={14}
                  color="disabledTextColor"
                >
                  No currencies found
                </CustomText>
              </Box>
            }
          />
        </Box>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  currencyImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },
  list: {
    flex: 1,
  },
});

export default SwapCurrencySelector;

