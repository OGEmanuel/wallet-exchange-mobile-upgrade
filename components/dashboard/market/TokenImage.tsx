import CustomText from "@/components/general/CustomText";
import SmartImage from "@/components/general/SmartImage";
import React from "react";
import { Image, View } from "react-native";

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

  // Use SmartImage for all URL-based images (handles both SVG and regular images)
  return (
    <SmartImage
      source={{ uri }}
      width={size}
      height={size}
      style={{ borderRadius: size / 2 }}
      resizeMode="contain"
    />
  );
}
