import TokenImage from "@/components/dashboard/market/TokenImage";
import CustomInputWithoutForm from "@/components/form/CustomInputWithoutForm";
import { Box, CustomText } from "@/components/general";
import { Theme } from "@/theme";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { Image } from "expo-image";
import { ChevronRight, Search } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { Token } from "../home/BuyBottomSheet";

const TOKENS: Token[] = [
  {
    id: "t_usdt",
    symbol: "USDT",
    name: "Tether",
    balance: 120.5,
    price: 1,
    icon: "https://assets.coingecko.com/coins/images/325/large/Tether.png?1696501580",
  },
  {
    id: "t_bnb",
    symbol: "BNB",
    name: "Binance Coin",
    balance: 3.2,
    price: 540,
    icon: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501627",
  },
  {
    id: "t_eth",
    symbol: "ETH",
    name: "Ethereum",
    balance: 0.55,
    price: 3250,
    icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501627",
  },
  {
    id: "t_sol",
    symbol: "SOL",
    name: "Solana",
    balance: 0.55,
    price: 3250,
    icon: "https://assets.coingecko.com/coins/images/4128/large/solana.png?1696501627",
  },
  {
    id: "t_ada",
    symbol: "ADA",
    name: "Cardano",
    balance: 0.55,
    price: 3250,
    icon: "https://assets.coingecko.com/coins/images/975/large/cardano.png?1696501627",
  },
  {
    id: "t_matic",
    symbol: "MATIC",
    name: "Polygon",
    balance: 0.55,
    price: 3250,
    icon: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1696501627",
  },
  {
    id: "t_dot",
    symbol: "DOT",
    name: "Polkadot",
    balance: 0.55,
    price: 3250,
    icon: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png?1696501627",
  },
  {
    id: "t_btc",
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.55,
    price: 3250,
    icon: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501627",
  },
];

const TokenCard = ({
  item,
  onTokenSelect,
}: {
  item: Token;
  onTokenSelect: (token: Token) => void;
}) => {
  const theme = useTheme<Theme>();
  return (
    <Pressable
      onPress={() => onTokenSelect(item)}
      style={{
        width: "100%",
        height: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box flex={1} flexDirection="row" alignItems="center" gap="s">
        <TokenImage uri={item?.icon} name={item.symbol} size={24} />
        <Box ml="s">
          <CustomText fontSize={12} variant="medium">
            {item.symbol}
          </CustomText>
          <CustomText
            fontSize={10}
            style={{ marginTop: 2, color: theme.colors.bodyTextColor }}
          >
            {item.balance} {item.symbol}-SPL
          </CustomText>
        </Box>
      </Box>
      <CustomText>${item.price}</CustomText>
    </Pressable>
  );
};

const Tokens = ({
  onTokenSelect,
}: {
  onTokenSelect: (token: Token) => void;
}) => {
  const theme = useTheme<Theme>();

  return (
    <Box flex={1} paddingBottom="l">
      <CustomInputWithoutForm
        value=""
        onChange={(e) => console.log(e)}
        iconLeft={<Search color={theme.colors.bodyTextColor} />}
        placeholder="Search token"
        style={{}}
      />

      <Pressable
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <CustomText>Chain</CustomText>
        <Box flexDirection="row" alignItems="center">
          <Image
            source={require("@/assets/images/chains.png")}
            style={{ width: 100, height: 30 }}
            contentFit="contain"
          />
          <ChevronRight color={theme.colors.bodyTextColor} />
        </Box>
      </Pressable>

      <CustomText variant="medium" fontSize={16} mt="m">
        Your tokens
      </CustomText>
      <BottomSheetScrollView
        style={{
          backgroundColor: theme.colors.secondaryBackgroundColor,
          marginTop: 20,
          borderRadius: 12,
        }}
        contentContainerStyle={{
          paddingBottom: 100,
          padding: 16,
        }}
      >
        {TOKENS.map((item, index) => (
          <TokenCard
            item={item}
            key={`token-${item}-${index}`}
            onTokenSelect={onTokenSelect}
          />
        ))}
      </BottomSheetScrollView>
    </Box>
  );
};

export default Tokens;
