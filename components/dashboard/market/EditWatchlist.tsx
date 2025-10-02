import icons from "@/assets/icons";
import AppText from "@/components/AppText";
import Button from "@/components/Button";
import Base from "@/layouts/Base";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Dummy cryptocurrency data with some pre-selected
const cryptoAssets = [
  {
    id: 1,
    symbol: "AVAX",
    name: "Avalanche",
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    selected: true,
  },
  {
    id: 2,
    symbol: "BASE",
    name: "Base",
    logo: "https://cryptologos.cc/logos/base-base-logo.png",
    selected: false,
  },
  {
    id: 3,
    symbol: "ARB",
    name: "Arbitrum",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    selected: true,
  },
  {
    id: 4,
    symbol: "OP",
    name: "Optimism",
    logo: "https://cryptologos.cc/logos/optimism-op-logo.png",
    selected: true,
  },
  {
    id: 5,
    symbol: "FTM",
    name: "Fantom",
    logo: "https://cryptologos.cc/logos/fantom-ftm-logo.png",
    selected: false,
  },
  {
    id: 6,
    symbol: "XTZ",
    name: "Tezos",
    logo: "https://cryptologos.cc/logos/tezos-xtz-logo.png",
    selected: false,
  },
  {
    id: 7,
    symbol: "SOL",
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
    selected: true,
  },
  {
    id: 8,
    symbol: "TRX",
    name: "Tron",
    logo: "https://cryptologos.cc/logos/tron-trx-logo.png",
    selected: false,
  },
  {
    id: 9,
    symbol: "MATIC",
    name: "Polygon",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    selected: false,
  },
];

export default function EditWatchlist() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<number[]>(
    cryptoAssets.filter((asset) => asset.selected).map((asset) => asset.id)
  );

  const filteredAssets = cryptoAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAssetSelection = (assetId: number) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleUpdateWatchlist = () => {
    // Here you would typically update the watchlist with the selected assets
    console.log("Updated watchlist:", selectedAssets);
    router.back();
  };

  const CryptoItem = ({ asset }: { asset: any }) => {
    const isSelected = selectedAssets.includes(asset.id);

    return (
      <TouchableOpacity
        onPress={() => toggleAssetSelection(asset.id)}
        className="flex-row items-center justify-between px-4 py-4 border-b border-stroke dark:border-dark-stroke"
      >
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: asset.logo }}
            className="w-8 h-8"
            resizeMode="contain"
          />
          <View>
            <AppText className="text-sm font-semibold text-text dark:text-dark-text">
              {asset.symbol}
            </AppText>
            <AppText className="text-xs text-text dark:text-dark-text opacity-60">
              {asset.name}
            </AppText>
          </View>
        </View>

        <View
          className={`w-5 h-5 rounded border-2 items-center justify-center ${
            isSelected
              ? "bg-lemon border-lemon"
              : "border-stroke dark:border-dark-stroke"
          }`}
        >
          {isSelected && (
            <Image source={icons.check} className="w-3 h-3" tintColor="#000" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Base title="Edit Watchlist" canGoBack>
      <View className="flex-1">
        {/* Search Bar */}
        <View className="px-4 py-4">
          <View className="flex-row items-center bg-keyPad dark:bg-dark-keyPad rounded-lg px-4 py-3">
            <Image
              source={icons.search}
              className="w-5 h-5 mr-3"
              tintColor="#6B7280"
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for a bank"
              placeholderTextColor="#6B7280"
              className="flex-1 text-text dark:text-dark-text"
            />
          </View>
        </View>

        {/* Cryptocurrency List */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {filteredAssets.map((asset) => (
            <CryptoItem key={asset.id} asset={asset} />
          ))}
        </ScrollView>

        {/* Update Watchlist Button */}
        <View className="px-4 py-4 bg-base dark:bg-dark-base border-t border-stroke dark:border-dark-stroke">
          <Button onPress={handleUpdateWatchlist} className="w-full">
            <AppText className="text-dark-text dark:text-text font-semibold">
              Update watchlist
            </AppText>
          </Button>
        </View>
      </View>
    </Base>
  );
}
