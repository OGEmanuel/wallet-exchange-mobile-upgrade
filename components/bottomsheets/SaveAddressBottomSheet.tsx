
import { Theme } from '@/theme';
import { useTheme } from '@shopify/restyle';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import CustomInputWithoutForm from '../form/CustomInputWithoutForm';
import { Box, CustomButton, CustomText } from '../general';

interface SaveAddressBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (addressName: string) => void;
  recipientAddress: string;
  isLoading?: boolean;
}

export default function SaveAddressBottomSheet({
  visible,
  onClose,
  onSave,
  recipientAddress,
  isLoading = false,
}: SaveAddressBottomSheetProps) {
  const theme = useTheme<Theme>();
  const [addressName, setAddressName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!addressName.trim()) return;
    
    setIsSaving(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await onSave(addressName.trim());
      setAddressName('');
      onClose();
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setAddressName('');
    onClose();
  };

  // Dismiss keyboard when modal closes
  useEffect(() => {
    if (!visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      justifyContent="flex-end"
      zIndex={1000}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={handleClose}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Pressable onPress={Keyboard.dismiss}>
          <Box
            backgroundColor="modalBackgroundColor"
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            padding="l"
            paddingTop="m"
            borderTopWidth={1}
            borderTopColor="borderColor"
          >
        {/* Handle Bar */}
        <Box
          width={40}
          height={4}
          backgroundColor="borderColor"
          borderRadius={2}
          alignSelf="center"
          marginBottom="l"
        />

        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          marginBottom="l"
        >
          <CustomText variant="header" color="headerTextColor" fontSize={20}>
            Save Address
          </CustomText>
          
          <Pressable onPress={handleClose}>
            <X size={24} color={theme.colors.headerTextColor} />
          </Pressable>
        </Box>

        {/* Address Display */}
        <Box
          backgroundColor="secondaryBackgroundColor"
          borderRadius={12}
          padding="m"
          marginBottom="l"
        >
          <CustomText variant="body" color="bodyTextColor" marginBottom="s">
            Address:
          </CustomText>
          <CustomText variant="body" color="headerTextColor" numberOfLines={1}>
            {recipientAddress}
          </CustomText>
        </Box>

        {/* Input Field */}
        <Box marginBottom="xl">
          <CustomText variant="body" color="headerTextColor" marginBottom="s">
            Enter address name
          </CustomText>
          <CustomInputWithoutForm
            value={addressName}
            onChange={(e) => setAddressName(e)}
            placeholder="Enter address name"
            autoFocus
            maxLength={50}
          />
        </Box>

        {/* Save Button */}
        <CustomButton
          text={isSaving ? "Saving..." : "Save"}
          onPress={handleSave}
          disabled={!addressName.trim() || isSaving}
          width="100%"
          height={56}
          borderRadius={50}
          bgColor="primaryColor"
          color="white"
        />
          </Box>
        </Pressable>
      </KeyboardAvoidingView>
    </Box>
  );
}
