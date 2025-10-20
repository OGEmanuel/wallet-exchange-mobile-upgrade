/**
 * ChainLogo Component - Handles chain logos with SVG support and fallback
 *
 * This component tries to load SVG images from URLs,
 * and falls back to text-based logos if loading fails.
 */

import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { SvgUri } from "react-native-svg";

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
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleSvgError = (error: any) => {
    console.log("❌ SVG load error:", error);
    setImageError(true);
    setLoading(false);
    onError?.(error);
  };

  const handleSvgLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  // Try to render SVG if URL is provided and no error occurred
  if (logoUrl && logoUrl.endsWith(".svg") && !imageError) {
    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius: width / 2,
            overflow: "hidden",
            backgroundColor: "transparent", // Remove background
            justifyContent: "center",
            alignItems: "center",
          },
          style,
        ]}
      >
        <SvgUri
          uri={logoUrl}
          onError={handleSvgError}
          onLoad={handleSvgLoad}
          width={!loading ? width - 4 : 0}
          height={!loading ? height - 4 : 0}
        />
        {loading && (
          <View
            style={{
              width: width - 4,
              height: height - 4,
              backgroundColor: "#8B5CF6",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 10 }}>...</Text>
          </View>
        )}
      </View>
    );
  }

  // Try to load regular image if URL is provided and no error occurred
  if (logoUrl && !logoUrl.endsWith(".svg")) {
    return (
      <View
        style={[
          {
            width,
            height,
            borderRadius: width / 2,
            overflow: "hidden",
            backgroundColor: "#8B5CF6", // Fallback background
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: logoUrl }}
          style={{
            width: width - 4, // Account for border
            height: height - 4,
            borderRadius: (width - 4) / 2,
          }}
          resizeMode="cover"
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
          backgroundColor: "#8B5CF6", // Purple color as fallback
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "#FFFFFF",
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
