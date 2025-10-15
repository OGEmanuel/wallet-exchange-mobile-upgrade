import icons from "@/assets/icons";
import images from "@/assets/images";
import { ARROW_DARK_LEFT_SVG, ARROW_LEFT_SVG } from "@/assets/svgs";
import Box from "@/components/general/Box";
import CustomButton from "@/components/general/CustomButton";
import CustomText from "@/components/general/CustomText";
import { Theme } from "@/theme";
import { SellFlowProps } from "@/types/sell.types";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";

const AmountStep: React.FC<SellFlowProps> = ({
  onNext,
  onBack,
  selectedToken,
  amount,
  setAmount,
  selectedCurrency,
}) => {
  const theme = useTheme<Theme>();
  const isDark = theme.colors.headerTextColor === "#FBFBFB";

  const onContinueAmount = () => {
    const num = Number(amount.replace(/[^\d.]/g, ""));
    if (!selectedToken || !selectedCurrency || !num || num <= 0) return;
    onNext("select-bank");
  };

  return (
    <BottomSheetView style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="m"
      >
        <Pressable onPress={onBack}>
          <SvgXml
            xml={isDark ? ARROW_DARK_LEFT_SVG : ARROW_LEFT_SVG}
            width={16}
            height={16}
          />
        </Pressable>
        <CustomText variant="medium" color="bodyTextColor" paddingLeft="m">
          Sell
        </CustomText>
        <Box
          width={50}
          height={35}
          borderRadius={50}
          backgroundColor="secondaryBackgroundColor"
          alignItems="center"
          justifyContent="center"
          flexDirection="row"
        >
          <Image
            source={images.nigeria}
            style={{ width: 18, height: 18, borderRadius: 30 }}
            contentFit="cover"
          />
          <Image
            source={icons.down}
            tintColor={isDark ? "white" : "black"}
            style={{ width: 20, height: 20 }}
          />
        </Box>
      </Box>

      <Box
        alignItems="center"
        alignContent="center"
        justifyContent="center"
        flexDirection="row"
        gap="s"
        marginTop="xl"
      >
        <Image
          source={{
            uri: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          }}
          style={{ width: 25, height: 25 }}
        />
        <CustomText variant="bodyBold" fontSize={14}>
          {selectedToken?.symbol || "BNB"}
        </CustomText>
      </Box>

      <View style={{ alignItems: "center", marginTop: 25 }}>
        <TextInput
          value={amount}
          autoFocus={true}
          onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          keyboardType="numeric"
          style={{
            fontSize: 36,
            color: theme.colors.bodyTextColor,
            fontWeight: "700",
            textAlign: "center",
          }}
        />
        <CustomText variant="body" color="bodyTextColor" fontSize={16}>
          ₦
          {Number(amount || 0).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
          })}
        </CustomText>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 40,
          gap: 10,
        }}
      >
        {["10%", "half", "Max"].map((label, i) => {
          const isActive = label === "10%";
          return (
            <Pressable
              key={i}
              style={{
                backgroundColor: isActive
                  ? theme.colors.tabBarLemonColor
                  : theme.colors.secondaryBackgroundColor,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isActive
                  ? theme.colors.tabBarActiveColor
                  : theme.colors.secondaryBackgroundColor,
                paddingVertical: 5,
                paddingHorizontal: 18,
              }}
            >
              <CustomText
                color={isActive ? "tabBarActiveColor" : "disabledTextColor"}
                variant="body"
              >
                {label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>

      <Box
        borderColor="bodyTextColor"
        marginBottom="m"
        borderRadius={10}
        padding="m"
        marginTop="2xl"
        borderWidth={1}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        style={{
          borderColor: theme.colors.disabledTextColor,
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="s">
          <Image source={images.zapLogo} style={{ width: 16, height: 16 }} />
          <CustomText variant="body" color="bodyTextColor">
            Zap Exchange
          </CustomText>
          <Image source={images.linked} style={{ width: 16, height: 16 }} />
        </Box>
        <CustomText variant="body" color="disabledTextColor">
          1 BNB ≈ 500 USDC
        </CustomText>
      </Box>

      <CustomButton
        text="Continue"
        onPress={onContinueAmount}
        width={"100%"}
        borderRadius={50}
      />
    </BottomSheetView>
  );
};

export default AmountStep;
