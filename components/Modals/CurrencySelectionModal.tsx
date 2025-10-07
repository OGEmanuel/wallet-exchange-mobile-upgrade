import { currencies } from "@/data";
import { Currency } from "@/interfaces/account.interface";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, ScrollView } from "react-native";
import { Box, CustomText } from "../general";

interface CurrencySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCurrency: (currency: Currency) => void;
}

const CurrencySelectionModal: React.FC<CurrencySelectionModalProps> = ({
  visible,
  onClose,
  onSelectCurrency,
}) => {
  const theme = useTheme<Theme>();

  const handleCurrencySelect = (currency: Currency) => {
    onSelectCurrency(currency);
    onClose();
  };

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

          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            {currencies.map((currency, index) => (
              <Pressable
                key={currency.code}
                onPress={() => handleCurrencySelect(currency)}
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
                    <CustomText fontSize={24} marginRight="s">
                      {currency.flag}
                    </CustomText>
                    <Box flex={1}>
                      <CustomText variant="bodyBold" color="headerTextColor">
                        {currency.code}
                      </CustomText>
                      <CustomText
                        variant="body"
                        color="bodyTextColor"
                        fontSize={12}
                      >
                        {currency.name}
                      </CustomText>
                    </Box>
                  </Box>
                  <ChevronRight size={20} color={theme.colors.bodyTextColor} />
                </Box>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CurrencySelectionModal;
