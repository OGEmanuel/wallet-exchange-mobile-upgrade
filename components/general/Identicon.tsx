import React from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";

interface IdenticonProps {
  value: string;
  size?: number;
  style?: any;
}

// Simple hash function for generating consistent colors
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Generate a simple identicon pattern
const generateIdenticon = (value: string, size: number): string => {
  const hash = hashString(value);
  
  // Pattern colors - muted and professional
  const patternColors = [
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", 
    "#3B82F6", "#EF4444", "#84CC16", "#F97316"
  ];
  
  // Background colors - dark theme friendly
  const backgroundColors = [
    "#1F2937", "#374151", "#4B5563", "#6B7280",
    "#9CA3AF", "#D1D5DB", "#E5E7EB", "#F3F4F6"
  ];
  
  const backgroundColor = backgroundColors[hash % backgroundColors.length];
  const color = patternColors[(hash + 1) % patternColors.length];
  
  // Create a uniform pattern with straight rectangular shapes
  const pattern = [];
  const cellSize = size / 8;
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const bit = (hash >> (i * 8 + j)) & 1;
      if (bit) {
        // Create rectangular shapes that touch each other
        const x = j * cellSize;
        const y = i * cellSize;
        const width = cellSize;
        const height = cellSize;
        
        pattern.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}"/>`);
      }
    }
  }
  
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
      ${pattern.join('')}
    </svg>
  `;
};

const Identicon: React.FC<IdenticonProps> = ({ value, size = 36, style }) => {
  const svgString = generateIdenticon(value, size);

  return (
    <View style={[{ width: size, height: size, borderRadius: size / 8 }, style]}>
      <SvgXml xml={svgString} width={size} height={size} />
    </View>
  );
};

export default Identicon;
