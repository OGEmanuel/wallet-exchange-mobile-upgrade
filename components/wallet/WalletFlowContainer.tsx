import { Box } from "@/components/general";
import { useWalletFlow, WalletFlowType } from "@/src/hooks/useWalletFlow";
import React from "react";
import { WalletICloudBackupStep } from "./steps/WalletICloudBackupStep";
import { WalletNameStep } from "./steps/WalletNameStep";
import WalletPasscodeStep from "./steps/WalletPasscodeStep";
import { WalletPasswordStep } from "./steps/WalletPasswordStep";
import { WalletPrivateKeyStep } from "./steps/WalletPrivateKeyStep";
import { WalletRestoreStep } from "./steps/WalletRestoreStep";
import { WalletSeedPhraseStep } from "./steps/WalletSeedPhraseStep";
import { WalletSuccessStep } from "./steps/WalletSuccessStep";
import { WalletWatchAddressStep } from "./steps/WalletWatchAddressStep";

interface WalletFlowContainerProps {
  flowType: WalletFlowType;
  onComplete?: () => void;
}

export const WalletFlowContainer: React.FC<WalletFlowContainerProps> = ({
  flowType,
  onComplete,
}) => {
  const walletFlow = useWalletFlow(flowType);
  const { currentStepData, walletData, isLoading } = walletFlow;

  const renderCurrentStep = () => {
    if (!currentStepData) return null;

    const commonProps = {
      walletData,
      isLoading,
      onBack: walletFlow.goToPreviousStep,
      onContinue: walletFlow.handleStepAction,
      onUpdateData: walletFlow.updateWalletData,
    };

    switch (currentStepData.component) {
      case "name":
        return <WalletNameStep {...commonProps} flowType={flowType} />;

      case "seed-phrase":
        return <WalletSeedPhraseStep {...commonProps} />;

      case "private-key":
        return <WalletPrivateKeyStep {...commonProps} />;

      case "watch-address":
        return <WalletWatchAddressStep {...commonProps} />;

      case "restore":
        return <WalletRestoreStep {...commonProps} />;

      case "icloud-backup":
        return <WalletICloudBackupStep {...commonProps} />;

      case "passcode":
        return <WalletPasscodeStep {...commonProps} />;

      case "password":
        return <WalletPasswordStep {...commonProps} />;

      case "success":
        return (
          <WalletSuccessStep
            walletData={walletData}
            flowType={flowType}
            onContinue={walletFlow.handleSuccessContinue}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box flex={1} backgroundColor="mainBackgroundColor">
      {renderCurrentStep()}
    </Box>
  );
};
