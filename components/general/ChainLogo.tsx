/**
 * ChainLogo Component - Handles chain logos with SVG support and fallback
 *
 * This component tries to load SVG images from URLs,
 * and falls back to text-based logos if loading fails.
 */

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Text, View } from "react-native";
import SmartImage from "./SmartImage";

interface ChainLogoProps {
  symbol: string;
  name: string;
  logoUrl?: string;
  width?: number;
  height?: number;
  style?: any;
  onError?: (error: any) => void;
  onLoad?: () => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

const ChainLogo: React.FC<ChainLogoProps> = ({
  symbol,
  name,
  logoUrl,
  width = 32,
  height = 32,
  style,
  onError,
  onLoad,
  onLoadStart,
  onLoadEnd,
}) => {
  const theme = useTheme<Theme>();
  const [imageError, setImageError] = useState(false);

  const handleError = (error: any) => {
    console.log("❌ Image load error:", error);
    setImageError(true);
    onError?.(error);
  };

  const handleLoad = () => {
    onLoad?.();
  };

  // Try to render image if URL is provided
  if (logoUrl && !imageError) {
    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius: width / 2,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          style,
        ]}
      >
        <SmartImage
          source={{ uri: logoUrl }}
          width={width}
          height={height}
          borderRadius={width / 2}
          resizeMode="cover"
          onError={handleError}
          onLoad={handleLoad}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
        />
      </View>
    );
  }

  // Fallback to text-based logo
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: width / 2,
          backgroundColor: "#8B5CF6",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: width * 0.4,
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
        }}
      >
        {symbol.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

export default ChainLogo;
