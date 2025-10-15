import icons from "@/assets/icons";
import images from "@/assets/images";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { Bank, SellFlowProps } from "@/types/sell.types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";
import { FlatList, Pressable, View } from "react-native";
import { Search } from "react-native-feather";
import { SvgXml } from "react-native-svg";

const BANKS: Bank[] = [
  {
    id: "b1",
    bankName: "First Bank",
    accountName: "Kelechukwu",
    accountNumber: "0123456789",
  },
  {
    id: "b2",
    bankName: "GTBank",
    accountName: "Kele",
    accountNumber: "0987654321",
  },
];

const SelectBankStep: React.FC<SellFlowProps> = ({
  onNext,
  onBack,
  setSelectedBank,
}) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  const onPickBank = (bank: Bank) => {
    setSelectedBank(bank);
    onNext("details");
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      <Box style={{ flex: 1, marginBottom: 100 }}>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="m"
          flex={1}
        >
          <Pressable onPress={onBack}>
            <SvgXml
              xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
              width={16}
              height={16}
            />
          </Pressable>
          <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
            Select receiver account
          </CustomText>
          <Box width={30} />
        </Box>

        <CustomInputWithoutForm
          value=""
          onChange={(e) => console.log(e)}
          iconLeft={<Search color={theme.colors.bodyTextColor} />}
          placeholder="Search token"
          style={{}}
        />

        <Box
          marginTop="m"
          style={{
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.success,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <CustomText variant="bodyBold">First Bank</CustomText>
            <CustomText variant="body">Kelechukwu • 31298931918</CustomText>
          </View>
          <Image source={icons.checkFill} style={{ width: 24, height: 24 }} />
        </Box>

        <Box
          backgroundColor="secondaryBackgroundColor"
          padding="m"
          gap="s"
          borderRadius={20}
          flex={1}
          flexGrow={1}
        >
          <FlatList
            data={BANKS}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ flexGrow: 1 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onPickBank(item)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box flexDirection="row" gap="s" marginBottom="s">
                  <Image
                    source={images.firstBank}
                    style={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <CustomText variant="bodyBold">{item.bankName}</CustomText>
                    <CustomText variant="body" color="disabledTextColor">
                      *****52782
                    </CustomText>
                  </Box>
                </Box>
              </Pressable>
            )}
          />
        </Box>
      </Box>
      <Box gap="m" mt="xl">
        <CustomButton
          text="Continue"
          onPress={() => onPickBank(BANKS[0])}
          width={"100%"}
          borderRadius={50}
        />
        <CustomButton
          text="Send to a different account"
          onPress={() => onPickBank(BANKS[0])}
          width={"100%"}
          borderRadius={50}
          color={
            isDark ? theme.colors.bodyTextColor : theme.colors.bodyTextColor
          }
          bgColor={
            isDark
              ? theme.colors.secondaryBackgroundColor
              : theme.colors.secondaryBackgroundColor
          }
        />
      </Box>
    </BottomSheetView>
  );
};

export default SelectBankStep;
