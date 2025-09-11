import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Box from './Box';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import QRCodeGenerator from './QRCodeGenerator';
import { useTheme } from '@shopify/restyle';
import { Theme } from '@/theme';
import { ThemedCopyIcon } from '@/assets/svg/wallet-icons-components';
import { Pressable, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  subtitle?: string;
  showCopyButton?: boolean;
  showAddress?: boolean;
  size?: number;
  logo?: any;
  onCopy?: () => void;
  borderRadius?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  title = "Scan QR Code",
  subtitle = "Scan this QR code to receive tokens",
  showCopyButton = true,
  showAddress = true,
  size = 200,
  logo,
  onCopy,
  borderRadius = 12,
}) => {
  const theme = useTheme<Theme>();

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(value);
      Alert.alert('Copied!', 'Address copied to clipboard');
      onCopy?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  return (
    <Box alignItems="center" justifyContent="center" p="m">
      {title && (
        <CustomText variant="header2" textAlign="center" fontSize={18} mb="s">
          {title}
        </CustomText>
      )}
      
      {subtitle && (
        <CustomText variant="body" textAlign="center" fontSize={14} mb="l" color="disabledTextColor">
          {subtitle}
        </CustomText>
      )}

      <Box 
        alignItems="center" 
        justifyContent="center" 
        p="l"
        borderRadius={borderRadius}
        style={{ backgroundColor: theme.colors.white }}
        mb="l"
      >
        <QRCodeGenerator
          value={value}
          size={size}
          color={theme.colors.primaryColor}
          backgroundColor={theme.colors.white}
          logo={logo}
          logoSize={logo ? 40 : 0}
          logoBackgroundColor={theme.colors.white}
          logoMargin={4}
          logoBorderRadius={8}
          quietZone={10}
          borderRadius={borderRadius}
        />
      </Box>

      {showAddress && (
        <Box 
          flexDirection="row" 
          alignItems="center" 
          justifyContent="center" 
          gap="s" 
          mb="m"
          p="m"
          borderRadius={8}
          style={{ backgroundColor: theme.colors.secondaryBackgroundColor }}
        >
          <CustomText variant="body" textAlign="center" fontSize={12} flex={1}>
            {value}
          </CustomText>
          <Pressable onPress={handleCopy}>
            <ThemedCopyIcon />
          </Pressable>
        </Box>
      )}

      {showCopyButton && (
        <CustomButton
          text="Copy Address"
          onPress={handleCopy}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          width={200}
          borderRadius={8}
        />
      )}
    </Box>
  );
};

export default QRCodeDisplay;
