import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Box from './Box';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@/theme';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  logo?: any;
  logoSize?: number;
  logoBackgroundColor?: string;
  logoMargin?: number;
  logoBorderRadius?: number;
  quietZone?: number;
  enableLinearGradient?: boolean;
  gradientDirection?: string[];
  linearGradient?: string[];
  borderRadius?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  backgroundColor = 'white',
  color = 'black',
  logo,
  logoSize = 30,
  logoBackgroundColor = 'white',
  logoMargin = 2,
  logoBorderRadius = 0,
  quietZone = 0,
  enableLinearGradient = false,
  gradientDirection = ['0%', '0%', '100%', '100%'],
  linearGradient = ['#000000', '#000000'],
  borderRadius = 0,
}) => {
  const theme = useTheme<Theme>();

  const containerStyle = {
    borderRadius: borderRadius,
    overflow: 'hidden' as const,
    backgroundColor: backgroundColor,
  };

  return (
    <Box alignItems="center" justifyContent="center">
      <View style={[containerStyle, { width: size, height: size }]}>
        <QRCode
          value={value}
          size={size}
          color={color}
          backgroundColor="transparent"
          logo={logo}
          logoSize={logoSize}
          logoBackgroundColor={logoBackgroundColor}
          logoMargin={logoMargin}
          logoBorderRadius={logoBorderRadius}
          quietZone={quietZone}
          enableLinearGradient={enableLinearGradient}
          gradientDirection={gradientDirection}
          linearGradient={linearGradient}
        />
      </View>
    </Box>
  );
};

export default QRCodeGenerator;
