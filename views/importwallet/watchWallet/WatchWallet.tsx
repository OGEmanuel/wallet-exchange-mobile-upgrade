import { ThemedScanIcon } from "@/assets/svg/wallet-icons-components";
import SelectChainBottomSheet from "@/components/bottomsheets/SelectChainBottomSheet";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { setCurrentPage } from "@/state/reducers/currentPage.reducer";
import { Theme } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useRef } from "react";
import { Pressable } from "react-native";
import { useDispatch } from "react-redux";

const WatchWallet = () => {
  const theme = useTheme<Theme>();
  const dispatch = useDispatch();
  const [wallet, setWallet] = React.useState("");

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <Box flex={1} padding="m">
      <Box flexDirection="row" width="100%" height={60} alignItems="center">
        <ChevronLeft
          size={24}
          color={theme.colors.bodyTextColor}
          onPress={() => router.back()}
        />
      </Box>
      <CustomText variant="medium" fontSize={20}>
        Watch a wallet
      </CustomText>
      <CustomText variant="body" fontSize={14} mt="s">
        View the assets and activity of any public key. You cannot control
        assets or sign transactions though.
      </CustomText>

      <Pressable
        style={{
          width: "100%",
          height: 50,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 10,
          backgroundColor: theme.colors.secondaryBackgroundColor,
          marginTop: 20,
          paddingHorizontal: 20,
          marginBottom: 20,
        }}
        onPress={() => bottomSheetRef?.current?.snapToIndex(1)}
      >
        <CustomText>Select chain</CustomText>
        <ChevronDown size={24} color={theme.colors.bodyTextColor} />
      </Pressable>

      <CustomInputWithoutForm
        label=""
        placeholder="Enter wallet address"
        value={wallet}
        placeholderTextColor={theme.colors.disabledTextColor}
        style={{
          color: theme.colors.bodyTextColor,
        }}
        onChange={(value) => setWallet(value as string)}
        iconRight={
          <>
            <ThemedScanIcon
              lightModeColor={theme.colors.bodyTextColor}
              darkModeColor={theme.colors.bodyTextColor}
            />
          </>
        }
      />

      <Box height={100} />

      {wallet?.length > 3 && (
        <CustomButton
          text="Import"
          onPress={() => dispatch(setCurrentPage(2))}
          width={"100%"}
          borderRadius={56}
          height={56}
          bgColor={theme.colors.primaryColor}
        />
      )}
      <SelectChainBottomSheet ref={bottomSheetRef} />
    </Box>
  );
};

export default WatchWallet;
