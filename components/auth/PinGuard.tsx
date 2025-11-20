import { PinEntryModal } from "@/components/Modals/PinEntryModal";
import { pinStorageService } from "@/src/core/storage/pin-storage.service";
import theme from "@/theme";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import ZapLoader from "../general/ZapLoader";

export const PinGuard: React.FC = () => {
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCheckedPin, setHasCheckedPin] = useState(false);

  useEffect(() => {
    const checkPinOnMount = async () => {
      try {
        setIsChecking(true);
        const hasPin = await pinStorageService.hasPin();
        if (hasPin) {
          setShowPinEntry(true);
        }
        setHasCheckedPin(true);
      } catch (error) {
        console.error("Failed to check PIN status:", error);
        setHasCheckedPin(true);
      } finally {
        setIsChecking(false);
      }
    };

    if (!hasCheckedPin) {
      checkPinOnMount();
    }
  }, [hasCheckedPin]);

  const handlePinEntrySuccess = () => {
    setShowPinEntry(false);
    setHasCheckedPin(true);
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

  // Show PIN entry if PIN exists and we've checked
  if (showPinEntry && hasCheckedPin && !isChecking) {
    return (
      <PinEntryModal
        visible={showPinEntry}
        onSuccess={handlePinEntrySuccess}
        onClose={() => setShowPinEntry(false)}
        type="VERIFY"
      />
    );
  }

  // Show app content if PIN is verified or not required
  return <></>;
};
