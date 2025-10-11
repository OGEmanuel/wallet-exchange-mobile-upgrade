import CustomInputWithoutForm from '@/components/form/CustomInputWithoutForm';
import AppBar from '@/components/general/AppBar';
import Box from '@/components/general/Box';
import CustomButton from '@/components/general/CustomButton';
import CustomText from '@/components/general/CustomText';
import { WalletFlowData } from '@/src/hooks/useWalletFlow';
import { Theme } from '@/theme';
import { useTheme } from '@shopify/restyle';
import { ChevronLeft, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Keyboard } from 'react-native';

interface WalletPasscodeStepProps {
  walletData: WalletFlowData;
  isLoading: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onUpdateData: (data: Partial<WalletFlowData>) => void;
}

export const WalletPasscodeStep: React.FC<WalletPasscodeStepProps> = ({
  walletData,
  isLoading,
  onBack,
  onContinue,
  onUpdateData,
}) => {
  const theme = useTheme<Theme>();
  const [passcode, setPasscode] = useState('');

  const handleContinue = () => {
    Keyboard.dismiss();
    onUpdateData({ passcode });
    onContinue();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const isValidPasscode = passcode.length >= 4;

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
        title="Set Passcode"
        paddingHorizontal={0}
        height={70}
      />

      <Box flex={1} paddingHorizontal="l" paddingTop="l">
        <Box alignItems="center" mb="xl">
          <Lock size={60} color={theme.colors.primaryColor} />
        </Box>

        <CustomText variant="medium" fontSize={22} mb="m" textAlign="center">
          Set your passcode
        </CustomText>
        
        <CustomText variant="body" fontSize={14} mb="l" textAlign="center">
          Create a 4-6 digit passcode to secure your wallet
        </CustomText>

        <CustomInputWithoutForm
          onChange={(value) => setPasscode(value.toString())}
          value={passcode}
          label="Passcode"
          placeholder="Enter your passcode"
          placeholderTextColor={theme.colors.placeholderTextColor}
          secureTextEntry
          keyboardType="numeric"
          maxLength={6}
        />

        <Box flex={1} />

        <CustomButton
          disabled={!isValidPasscode}
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

export default WalletPasscodeStep;
