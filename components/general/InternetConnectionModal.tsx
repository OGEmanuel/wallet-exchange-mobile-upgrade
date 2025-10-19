import { Theme } from '@/theme';
import { useTheme } from '@shopify/restyle';
import { WifiOff } from 'lucide-react-native';
import React from 'react';
import { Dimensions } from 'react-native';
import { Box } from './Box';
import { CustomButton } from './CustomButton';
import { CustomText } from './CustomText';

const { width, height } = Dimensions.get('window');

interface InternetConnectionModalProps {
  visible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function InternetConnectionModal({
  visible,
  onRetry,
  onDismiss,
}: InternetConnectionModalProps) {
  const theme = useTheme<Theme>();

  if (!visible) return null;

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0, 0, 0, 0.8)"
      justifyContent="center"
      alignItems="center"
      zIndex={9999}
    >
      <Box
        backgroundColor="modalBackgroundColor"
        borderRadius={20}
        padding="xl"
        marginHorizontal="l"
        width={width * 0.85}
        maxWidth={320}
        alignItems="center"
        borderWidth={1}
        borderColor="borderColor"
      >
        {/* Satellite Dish Icon */}
        <Box
          width={80}
          height={80}
          borderRadius={40}
          backgroundColor="secondaryBackgroundColor"
          justifyContent="center"
          alignItems="center"
          marginBottom="l"
          borderWidth={1}
          borderColor="borderColor"
        >
          <WifiOff size={40} color={theme.colors.bodyTextColor} />
        </Box>

        {/* Title */}
        <CustomText
          variant="header"
          color="headerTextColor"
          fontSize={24}
          fontWeight="bold"
          textAlign="center"
          marginBottom="s"
        >
          No Internet Connection
        </CustomText>

        {/* Subtitle */}
        <CustomText
          variant="body"
          color="bodyTextColor"
          fontSize={16}
          textAlign="center"
          lineHeight={22}
          marginBottom="xl"
        >
          You are not connected to the internet.{'\n'}
          Reconnect and try again
        </CustomText>

        {/* Action Buttons */}
        <Box width="100%" gap="m">
          {onRetry && (
            <CustomButton
              text="Reconnect"
              onPress={onRetry}
              width="100%"
              height={50}
              borderRadius={25}
              bgColor="primaryColor"
              color="white"
            />
          )}
          
          {onDismiss && (
            <CustomButton
              text="Dismiss"
              onPress={onDismiss}
              width="100%"
              height={50}
              borderRadius={25}
              bgColor="transparent"
              color="headerTextColor"
              borderWidth={1}
              borderColor="borderColor"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
