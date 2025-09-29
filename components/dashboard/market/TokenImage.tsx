import CustomText from "@/components/general/CustomText";
import React from "react";
import { Image, View } from "react-native";
import { SvgUri } from "react-native-svg";

interface TokenImageProps {
  uri?: string;
  name?: string;
  size?: number;
  overflow?: "visible" | "hidden" | "scroll";
}

export default function TokenImage({
  uri,
  name,
  size = 32,
  overflow = "hidden",
}: TokenImageProps) {
  const isSvg = uri?.toLowerCase().endsWith(".svg");

  // CASE 1: If no uri at all
  if (!uri) {
    if (name) {
      // show initials
      return (
        <View
          style={{ width: size, height: size, overflow }}
          className="bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center"
        >
          <CustomText className="text-gray-600 dark:text-gray-300 font-semibold">
            {name.substring(0, 2).toUpperCase()}
          </CustomText>
        </View>
      );
    }

    // fallback icon
    return (
      <View
        className="bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          source={require("../../../assets/images/help.png")}
          style={{ width: size * 0.6, height: size * 0.6 }}
          tintColor="#6B7280"
        />
      </View>
    );
  }

  // CASE 2: If SVG
  if (isSvg) {
    return <SvgUri uri={uri} width={size} height={size} />;
  }

  // CASE 3: Default to PNG or others
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      className="rounded-full"
      resizeMode="contain"
    />
  );
}
