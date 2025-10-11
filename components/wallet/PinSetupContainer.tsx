import Box from "@/components/general/Box";
import { WalletFlowData } from "@/src/hooks/useWalletFlow";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { router } from "expo-router";
import React, { useState } from "react";
import { WalletPinSetupStep } from "./steps/WalletPinSetupStep";

interface PinSetupContainerProps {
  onComplete: () => void;
}

export const PinSetupContainer: React.FC<PinSetupContainerProps> = ({
  onComplete,
}) => {
  const theme = useTheme<Theme>();
  const [walletData, setWalletData] = useState<WalletFlowData>({
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateData = (data: Partial<WalletFlowData>) => {
    setWalletData(prev => ({ ...prev, ...data }));
  };

  const handleContinue = () => {
    // PIN has been set, complete the setup
    console.log('✅ PIN setup completed');
    onComplete();
  };

  const handleBack = () => {
    // Go back to setup or previous screen
    router.back();
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      <WalletPinSetupStep
        walletData={walletData}
        isLoading={isLoading}
        onBack={handleBack}
        onContinue={handleContinue}
        onUpdateData={handleUpdateData}
      />
    </Box>
  );
};
