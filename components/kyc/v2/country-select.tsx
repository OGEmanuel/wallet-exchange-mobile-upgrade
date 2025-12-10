import {
  allCountries as countries,
  CountryData,
  getCountryFlagUrl,
} from "@/src/core/utils/countryData";
import { Image } from "expo-image";
import { ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
// import countries from "./countries.json";

export default function CountrySelect(props: {
  value: CountryData;
  onChange: (value: CountryData) => void;
}) {
  const { value, onChange } = props;
  const [open, setOpen] = useState(false);

  const select = (item: CountryData) => {
    onChange(item);
    setOpen(false);
  };

  return (
    <View style={{ width: "100%", marginRight: 8 }}>
      {/* Selected value button */}
      <Pressable
        onPress={() => setOpen(!open)}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 16,
          borderRadius: 8,
          flexDirection: "row",
          backgroundColor: "#F7F7F7",
          alignItems: "center",
          //   position: "relative",
        }}
      >
        <View
          style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          {value ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: getCountryFlagUrl(value.value) }}
                style={{ width: 24, height: 24, marginRight: 12 }}
                contentFit="contain"
              />
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {value.label}
              </Text>
            </View>
          ) : (
            <Text>Country</Text>
          )}
          <ChevronDown />
        </View>
      </Pressable>

      {/* Dropdown list */}
      {open && (
        <View
          style={{
            borderRadius: 8,
            width: "100%",
            paddingHorizontal: 12,
            paddingVertical: 16,
            top: "100%",
            zIndex: 999,
            maxHeight: 240,
            backgroundColor: "#F7F7F7",
            position: "absolute",
          }}
        >
          <FlatList
            data={countries}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => select(item)}
                style={{
                  flexDirection: "row",
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: getCountryFlagUrl(item.value) }}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                  contentFit="contain"
                />
                <Text style={{ marginLeft: 10 }}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
