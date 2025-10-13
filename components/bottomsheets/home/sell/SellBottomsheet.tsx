import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { forwardRef, useEffect, useState } from "react";

import { Bank, Currency, SellFlowStep, Token } from "@/types/sell.types";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import AmountStep from "./steps/AmountStep";
import ConfirmingStep from "./steps/ConfirmingStep";
import DetailsStep from "./steps/DetailsStep";
import SelectBankStep from "./steps/SelectBankStep";
import SelectCurrencyStep from "./steps/SelectCurrencyStep";
import SelectTokenStep from "./steps/SelectTokenStep";
import SuccessStep from "./steps/SuccessStep";

const SellFlowBottomSheet = forwardRef<BottomSheet, {}>((props, ref) => {
  const theme = useTheme<Theme>();
  const [step, setStep] = useState<SellFlowStep>("select-token");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(
    null
  );
  const [amount, setAmount] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const steps = ["Confirming", "Swapping", "Sending"];

  // Handle the confirming step animation
  useEffect(() => {
    if (step === "confirm") {
      let index = 0;
      const timer = setInterval(() => {
        if (index < 2) {
          index++;
          setCurrentStepIndex(index);
        } else {
          clearInterval(timer);
          setTimeout(() => setStep("success"), 1000);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  const handleBack = () => {
    const stepOrder: SellFlowStep[] = [
      "select-token",
      "select-currency",
      "amount",
      "select-bank",
      "details",
      "confirm",
      "success",
    ];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  const resetStates = () => {
    setStep("select-token");
    setSelectedToken(null);
    setSelectedCurrency(null);
    setAmount("");
    setSelectedBank(null);
    setCurrentStepIndex(0);
    setShowConfirmModal(false);
  };

  const handleClose = () => {
    resetStates();
    (ref as React.RefObject<BottomSheetMethods>).current?.close();
  };

  const handleZapAgain = () => {
    resetStates();
  };

  const commonProps = {
    selectedToken,
    setSelectedToken,
    selectedCurrency,
    setSelectedCurrency,
    amount,
    setAmount,
    selectedBank,
    setSelectedBank,
    onNext: setStep,
    onBack: handleBack,
    onClose: handleClose,
  };

  const renderStep = () => {
    switch (step) {
      case "select-token":
        return <SelectTokenStep {...commonProps} />;
      case "select-currency":
        return <SelectCurrencyStep {...commonProps} />;
      case "amount":
        return <AmountStep {...commonProps} />;
      case "select-bank":
        return <SelectBankStep {...commonProps} />;
      case "details":
        return (
          <DetailsStep
            {...commonProps}
            setShowConfirmModal={setShowConfirmModal}
          />
        );
      case "confirm":
        return (
          <ConfirmingStep
            {...commonProps}
            currentStepIndex={currentStepIndex}
            steps={steps}
          />
        );
      case "success":
        return (
          <SuccessStep
            {...commonProps}
            onZapAgain={handleZapAgain}
            onGoToHistory={handleClose}
          />
        );
      default:
        return <SelectTokenStep {...commonProps} />;
    }
  };

  return (
    <>
      <BottomSheet
        ref={ref}
        index={-1}
        enableOverDrag={false}
        enableDynamicSizing={false}
        snapPoints={["90%", "95%"]}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        backdropComponent={(props: any) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
        style={{
          backgroundColor: theme.colors.mainBackgroundColor,
        }}
        onChange={(index) => {
          if (index === -1) {
            handleClose();
          }
        }}
      >
        <BottomSheetView style={{ flex: 1 }}>{renderStep()}</BottomSheetView>
      </BottomSheet>

      <ConfirmTransactionModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          setStep("confirm");
        }}
      />
    </>
  );
});

SellFlowBottomSheet.displayName = "SellFlowBottomSheet";
export default SellFlowBottomSheet;
