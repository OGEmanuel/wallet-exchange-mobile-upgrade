import { View, Text, Pressable } from "react-native";
import React from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRef, useCallback, forwardRef } from "react";
import Box from "../general/Box";
import CustomText from "../general/CustomText";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import CustomInputWithoutForm from "../form/CustomInputWithoutForm";
import { Check, CircleCheck, Search } from "lucide-react-native";
const chains = [
  "Bitcoin",
  "Ethereum",
  "BNB Chain",
  "Polygon",
  "Avalanche",
  "Solana",
  "Cardano",
  "Polkadot",
  "Cosmos",
  "Arbitrum",
  "Optimism",
  "Fantom",
  "Tron",
  "Near Protocol",
  "Algorand",
  "Hedera",
  "Cronos",
  "Harmony",
  "Tezos",
  "Zilliqa",
];

const SelectChainBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const [activeChain, setActiveChain] = React.useState<string | null>(null);

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
      snapPoints={["70%", "80%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
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
      <BottomSheetScrollView
        style={{ flex: 1, backgroundColor: theme.colors.mainBackgroundColor }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 25 }}
      >
        <CustomInputWithoutForm
          value=""
          onChange={() => {}}
          label=""
          placeholder="Search chains"
          placeholderTextColor={theme.colors.disabledTextColor}
          iconLeft={<Search size={20} color={theme.colors.bodyTextColor} />}
        />

        {/* CHAINS */}
        <Box
          width={"100%"}
          height={"auto"}
          backgroundColor="secondaryBackgroundColor"
          borderRadius={20}
          padding="m"
          mt="m"
        >
          <Pressable
            style={{
              width: "100%",
              height: 60,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={() => setActiveChain("All chains")}
          >
            <Box flexDirection="row" alignItems="center">
              <Box
                width={28}
                height={28}
                borderRadius={20}
                bg="mainBackgroundColor"
              />
              <CustomText variant="body" fontSize={14} ml="m">
                All chains
              </CustomText>
            </Box>
            {activeChain === "All chains" && (
              <Box
                width={28}
                height={28}
                borderRadius={28}
                bg="success"
                justifyContent="center"
                alignItems="center"
              >
                <Check size={20} color="white" />
              </Box>
            )}
          </Pressable>
          {chains.slice(0, 5).map((chain, index) => (
            <Pressable
              key={index.toString()}
              style={{
                width: "100%",
                height: 60,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setActiveChain(chain)}
            >
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={28}
                  height={28}
                  borderRadius={20}
                  bg="mainBackgroundColor"
                />
                <CustomText variant="body" fontSize={14} ml="m">
                  {chain}
                </CustomText>
              </Box>
              {activeChain === chain && (
                <Box
                  width={28}
                  height={28}
                  borderRadius={28}
                  bg="success"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Check size={20} color="white" />
                </Box>
              )}
            </Pressable>
          ))}
        </Box>

        <Box
          width={"100%"}
          height={"auto"}
          backgroundColor="secondaryBackgroundColor"
          borderRadius={20}
          padding="m"
          mt="m"
        >
          {chains.slice(5).map((chain, index) => (
            <Pressable
              key={index.toString()}
              style={{
                width: "100%",
                height: 60,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setActiveChain(chain)}
            >
              <Box flexDirection="row" alignItems="center">
                <Box
                  width={28}
                  height={28}
                  borderRadius={20}
                  bg="mainBackgroundColor"
                />
                <CustomText variant="body" fontSize={14} ml="m">
                  {chain}
                </CustomText>
              </Box>
              {activeChain === chain && (
                <Box
                  width={28}
                  height={28}
                  borderRadius={28}
                  bg="success"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Check size={20} color="white" />
                </Box>
              )}
            </Pressable>
          ))}
        </Box>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default SelectChainBottomSheet;
