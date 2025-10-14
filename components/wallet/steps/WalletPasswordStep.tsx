import CustomInputWithoutForm from '@/components/form/CustomInputWithoutForm';
import AppBar from '@/components/general/AppBar';
import Box from '@/components/general/Box';
import CustomButton from '@/components/general/CustomButton';
import CustomText from '@/components/general/CustomText';
import { WalletFlowData } from '@/src/hooks/useWalletFlow';
import { Theme } from '@/theme';
import { useTheme } from '@shopify/restyle';
import { ChevronLeft, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { Keyboard } from 'react-native';

interface WalletPasswordStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletPasswordStep: React.FC<WalletPasswordStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleContinue = () => {
    Keyboard.dismiss();
    onUpdateData({ password });
    onContinue();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const isValidPassword = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const isFormValid = isValidPassword && passwordsMatch;

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <AppBar
        leading={
          <ChevronLeft
            size={24}
            color={theme.colors.bodyTextColor}
            onPress={handleBack}
          />
        }
        title="Create Password"
        paddingHorizontal={0}
        height={70}
      />

      <Box flex={1} paddingHorizontal="l" paddingTop="l">
        <Box alignItems="center" mb="xl">
          <Shield size={60} color={theme.colors.primaryColor} />
        </Box>

        <CustomText variant="medium" fontSize={22} mb="m" textAlign="center">
          Create your password
        </CustomText>
        
        <CustomText variant="body" fontSize={14} mb="l" textAlign="center">
          Set a strong password to protect your wallet
        </CustomText>

        <CustomInputWithoutForm
          onChange={(value) => setPassword(value.toString())}
          value={password}
          label="Password"
          placeholder="Enter your password"
          placeholderTextColor={theme.colors.placeholderTextColor}
          secureTextEntry
        />

        <Box height={20} />

        <CustomInputWithoutForm
          onChange={(value) => setConfirmPassword(value.toString())}
          value={confirmPassword}
          label="Confirm Password"
          placeholder="Confirm your password"
          placeholderTextColor={theme.colors.placeholderTextColor}
          secureTextEntry
        />

        {password && !isValidPassword && (
          <CustomText variant="body" fontSize={12} color="bodyTextColor" mt="s">
            Password must be at least 8 characters long
          </CustomText>
        )}

        {confirmPassword && !passwordsMatch && (
          <CustomText variant="body" fontSize={12} color="bodyTextColor" mt="s">
            Passwords do not match
          </CustomText>
        )}

        <Box flex={1} />

        <CustomButton
          disabled={!isFormValid}
          disabledColor={theme.colors.disabledTextColor}
          width="100%"
          text="Continue"
          onPress={handleContinue}
          bgColor={theme.colors.primaryColor}
          color={theme.colors.white}
          borderRadius={56}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  );
};
