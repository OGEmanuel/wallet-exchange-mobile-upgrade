import { showErrorToast } from "@/src/core/utils/toast-utils";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { router } from "expo-router";
import { useCallback, useState } from "react";

export type WalletFlowType =
  | "create"
  | "import-seed"
  | "import-key"
  | "watch-address"
  | "restore-cloud";

export interface WalletFlowData {
  name: string;
  seedPhrase?: string;
  privateKey?: string;
  chain?: string;
  watchAddress?: string;
  passcode?: string;
  password?: string;
  selectedWalletGroup?: any; // Wallet group selected from iCloud backup
  restoredWallets?: any[]; // Restored wallets from backup
}

export interface WalletFlowStep {
  id: number;
  component: string;
  title: string;
  canGoBack: boolean;
}

export const WALLET_FLOW_STEPS = {
  CREATE: [
    { id: 1, component: "name", title: "Name your wallet", canGoBack: true },
    { id: 2, component: "success", title: "Wallet Created", canGoBack: false },
  ],
  IMPORT_SEED: [
    {
      id: 1,
      component: "seed-phrase",
      title: "Enter seed phrase",
      canGoBack: false,
    },
    { id: 2, component: "name", title: "Name your wallet", canGoBack: true },
    { id: 3, component: "success", title: "Wallet Imported", canGoBack: false },
    { id: 4, component: "passcode", title: "Set passcode", canGoBack: true },
    { id: 5, component: "password", title: "Create password", canGoBack: true },
  ],
  IMPORT_KEY: [
    {
      id: 1,
      component: "private-key",
      title: "Enter private key",
      canGoBack: false,
    },
    { id: 2, component: "name", title: "Name your wallet", canGoBack: true },
    { id: 3, component: "success", title: "Wallet Imported", canGoBack: false },
  ],
  WATCH_ADDRESS: [
    {
      id: 1,
      component: "watch-address",
      title: "Enter watch address",
      canGoBack: false,
    },
    { id: 2, component: "name", title: "Name your wallet", canGoBack: true },
    { id: 3, component: "success", title: "Address Added", canGoBack: false },
  ],
  RESTORE_CLOUD: [
    {
      id: 1,
      component: "icloud-backup",
      title: "iCloud Backup",
      canGoBack: false,
    },
    {
      id: 2,
      component: "restore",
      title: "Restore your wallet",
      canGoBack: true,
    },
    { id: 3, component: "success", title: "Wallet Restored", canGoBack: false },
  ],
};

export const useWalletFlow = (flowType: WalletFlowType) => {
  const { createWallet, importWallet, importPrivateKey, watchAddress } =
    useWallet();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [walletData, setWalletData] = useState<WalletFlowData>({
    name: "",
  });

  const steps =
    WALLET_FLOW_STEPS[
      flowType.toUpperCase().replace("-", "_") as keyof typeof WALLET_FLOW_STEPS
    ];
  const currentStepData = steps.find((step) => step.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  const updateWalletData = useCallback((data: Partial<WalletFlowData>) => {
    setWalletData((prev) => ({ ...prev, ...data }));
  }, []);

  const goToNextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    } else {
      // If we're on the first step, go back to the parent screen
      // This will close the import modal and return to the name screen
      router.back();
    }
  }, [isFirstStep]);

  const goToStep = useCallback((stepId: number) => {
    setCurrentStep(stepId);
  }, []);

  const resetFlow = useCallback(() => {
    setCurrentStep(1);
    setWalletData({ name: "" });
    setIsLoading(false);
  }, []);

  const handleCreateWallet = useCallback(async () => {
    if (!walletData.name) {
      showErrorToast("Wallet name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createWallet(walletData.name);
      if (result?.isCreated) {
        goToNextStep();
      } else {
        showErrorToast(result?.message || "Error creating wallet");
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      showErrorToast("Error creating wallet");
    } finally {
      setIsLoading(false);
    }
  }, [walletData.name, createWallet, goToNextStep]);

  const handleImportSeedPhrase = useCallback(async () => {
    if (!walletData.seedPhrase || !walletData.name) {
      showErrorToast("Seed phrase and wallet name are required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await importWallet(walletData.seedPhrase, walletData.name);
      if (result?.isCreated) {
        goToNextStep();
      } else {
        showErrorToast(result?.message || "Error importing wallet");
      }
    } catch (error) {
      console.error("Error importing wallet:", error);
      showErrorToast("Error importing wallet");
    } finally {
      setIsLoading(false);
    }
  }, [walletData.seedPhrase, walletData.name, importWallet, goToNextStep]);

  const handleImportPrivateKey = useCallback(async () => {
    if (!walletData.privateKey || !walletData.chain || !walletData.name) {
      showErrorToast("Private key, chain, and wallet name are required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await importPrivateKey(
        walletData.privateKey,
        walletData.name,
        walletData.chain
      );
      if (result?.isCreated) {
        goToNextStep();
      } else {
        showErrorToast(result?.message || "Error importing private key");
      }
    } catch (error) {
      console.error("Error importing private key:", error);
      showErrorToast("Error importing private key");
    } finally {
      setIsLoading(false);
    }
  }, [
    walletData.privateKey,
    walletData.chain,
    walletData.name,
    importPrivateKey,
    goToNextStep,
  ]);

  const handleWatchAddress = useCallback(async () => {
    if (!walletData.watchAddress || !walletData.chain || !walletData.name) {
      showErrorToast("Watch address, chain, and wallet name are required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await watchAddress(
        walletData.watchAddress,
        walletData.name
      );
      if (result?.isCreated) {
        goToNextStep();
      } else {
        showErrorToast(result?.message || "Error adding watch address");
      }
    } catch (error) {
      console.error("Error adding watch address:", error);
      showErrorToast("Error adding watch address");
    } finally {
      setIsLoading(false);
    }
  }, [
    walletData.watchAddress,
    walletData.chain,
    walletData.name,
    watchAddress,
    goToNextStep,
  ]);

  const handleStepAction = useCallback(async () => {
    const currentComponent = currentStepData?.component;

    switch (currentComponent) {
      case "name":
        if (flowType === "create") {
          await handleCreateWallet();
        } else if (flowType === "import-seed") {
          await handleImportSeedPhrase();
        } else if (flowType === "import-key") {
          await handleImportPrivateKey();
        } else if (flowType === "watch-address") {
          await handleWatchAddress();
        } else {
          goToNextStep();
        }
        break;
      default:
        goToNextStep();
    }
  }, [
    currentStepData,
    flowType,
    handleCreateWallet,
    handleImportSeedPhrase,
    handleImportPrivateKey,
    handleWatchAddress,
    goToNextStep,
  ]);

  const handleSuccessContinue = useCallback(() => {
    router.replace("/dashboard/home/wallet-home/home");
    resetFlow();
  }, [resetFlow]);

  return {
    // State
    currentStep,
    currentStepData,
    walletData,
    isLoading,
    isFirstStep,
    isLastStep,

    // Actions
    updateWalletData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetFlow,
    handleStepAction,
    handleSuccessContinue,

    // Specific handlers
    handleCreateWallet,
    handleImportSeedPhrase,
    handleImportPrivateKey,
    handleWatchAddress,
  };
};
