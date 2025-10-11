import { PinEntryModal } from "@/components/Modals/PinEntryModal";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import theme from "@/theme";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import ZapLoader from "../general/ZapLoader";

export const PinGuard: React.FC = () => {
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCheckedPin, setHasCheckedPin] = useState(false);

  useEffect(() => {
    if (!hasCheckedPin) {
      checkPinStatus();
    }
  }, [hasCheckedPin]);

  const checkPinStatus = async () => {
    try {
      const hasStoredPin = await pinStorageService.hasPin();

      if (!hasStoredPin) {
        setShowPinSetup(true);
      } else {
        setShowPinEntry(true);
      }
    } catch (error) {
      console.error("Failed to check PIN status:", error);
      setShowPinSetup(true);
    } finally {
      setIsChecking(false);
      setHasCheckedPin(true); // Mark that we've checked PIN status
    }
  };

  const handlePinSetupComplete = () => {
    setShowPinSetup(false);
    setHasCheckedPin(true); // Mark as checked to prevent re-checking
    console.log("✅ PIN setup completed, user can now access app");
  };

  const handlePinEntrySuccess = () => {
    setShowPinEntry(false);
    setHasCheckedPin(true); // Mark as checked to prevent re-checking
    console.log("✅ PIN verified successfully, user can access app");
  };

  // Show loading while checking PIN status
  if (isChecking) {
    return (
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: theme.colors.modalBackgroundColor,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <ZapLoader size={100} showText={false} />
      </View>
    );
  }

  // Show PIN entry if PIN exists
  if (showPinEntry) {
    return (
      <PinEntryModal
        visible={showPinEntry}
        onSuccess={handlePinEntrySuccess}
        onClose={() => setShowPinEntry(false)}
      />
    );
  }

  // Show app content if PIN is verified or not required
  return <></>;
};
