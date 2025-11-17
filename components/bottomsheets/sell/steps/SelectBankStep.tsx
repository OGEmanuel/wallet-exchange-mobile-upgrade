import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import Box from "@/components/general/Box";
import CustomText from "@/components/general/CustomText";
import { setSellSelectedBank, setSellStage } from "@/src/modules/sell/presentation/state/sell-slice";
import { useBankAccounts } from "@/src/modules/swap/presentation/hooks/useBankAccounts";
import { Theme } from "@/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { UserBankAccount } from "@zap/blockchain-sdk";
import { Image } from "expo-image";
import React, { useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Search } from "react-native-feather";
import { SvgXml } from "react-native-svg";
import { useDispatch } from "react-redux";

const SelectBankStep = () => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";
  const dispatch = useDispatch();
  const { bankAccounts, isLoadingBankAccounts } = useBankAccounts();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBankAccounts = React.useMemo(() => {
    if (!bankAccounts || bankAccounts.length === 0) return [];
    if (!searchQuery.trim()) return bankAccounts;
    
    const query = searchQuery.toLowerCase();
    return bankAccounts.filter(
      (acc) => {
        const bankIdObj = acc.bankId as any;
        const bankName = bankIdObj?.name || '';
        return (
          acc.holderName?.toLowerCase().includes(query) ||
          acc.number?.includes(query) ||
          bankName?.toLowerCase().includes(query)
        );
      }
    );
  }, [bankAccounts, searchQuery]);

  const onPickBank = (bankAccount: UserBankAccount) => {
    dispatch(setSellSelectedBank(bankAccount));
    dispatch(setSellStage("order_details"));
  };

  const handleBack = () => {
    dispatch(setSellStage("amount"));
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
          <Pressable onPress={handleBack}>
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e)}
          iconLeft={<Search color={theme.colors.bodyTextColor} />}
          placeholder="Search bank account"
          style={{}}
        />

        <Box
          backgroundColor="secondaryBackgroundColor"
          padding="m"
          gap="s"
          borderRadius={20}
          flex={1}
          flexGrow={1}
          mt="m"
        >
          {isLoadingBankAccounts ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <CustomText variant="body" color="disabledTextColor">
                Loading bank accounts...
              </CustomText>
            </Box>
          ) : filteredBankAccounts.length === 0 ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <CustomText variant="body" color="disabledTextColor">
                No bank accounts found
              </CustomText>
            </Box>
          ) : (
            <FlatList
              data={filteredBankAccounts}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ flexGrow: 1 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onPickBank(item)}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.borderColor,
                  }}
                >
                  <Box flexDirection="row" gap="s" alignItems="center">
                    <Image
                      source={{ 
                        uri: (item.bankId as any)?.icon || "" 
                      }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                      contentFit="contain"
                    />
                    <Box>
                      <CustomText variant="bodyBold">
                        {(item.bankId as any)?.name || "Bank"}
                      </CustomText>
                      <CustomText variant="body" color="disabledTextColor">
                        {item.holderName} • {item.number?.slice(-4) || "****"}
                      </CustomText>
                    </Box>
                  </Box>
                </Pressable>
              )}
            />
          )}
        </Box>
      </Box>
    </BottomSheetView>
  );
};

export default SelectBankStep;
