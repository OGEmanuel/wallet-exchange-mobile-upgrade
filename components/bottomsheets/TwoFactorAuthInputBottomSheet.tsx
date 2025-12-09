import CodeInput from "@/components/form/CodeInput";
import { CustomButton, CustomText } from "@/components/general";
import Box from "@/components/general/Box";
import { Theme } from "@/theme";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import { X } from "lucide-react-native";
import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";

interface TwoFactorAuthInputBottomSheetProps {
  onVerify: (code: string) => Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface TwoFactorAuthInputBottomSheetRef {
  open: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

const TwoFactorAuthInputBottomSheet = forwardRef<
  TwoFactorAuthInputBottomSheetRef,
  TwoFactorAuthInputBottomSheetProps
>(({ onVerify, onCancel, onClose }, ref) => {
  const theme = useTheme<Theme>();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  // Tab bar height: 90 on iOS, 70 on Android
  const tabBarHeight = Platform.OS === "ios" ? 90 : 70;
  const bottomInset = tabBarHeight;

  const snapPoints = useMemo(() => ["65%"], []);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    open: () => {
      bottomSheetRef.current?.snapToIndex(0);
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
    snapToIndex: (index: number) => {
      bottomSheetRef.current?.snapToIndex(index);
    },
  }));

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setError(null);
  };

  const handleCodeComplete = async (completeCode: string) => {
    if (completeCode.length === 6) {
      await handleVerify(completeCode);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const codeToUse = codeToVerify || code;
    if (codeToUse.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      await onVerify(codeToUse);
      // If verification succeeds, the parent should handle closing
      setCode("");
    } catch (err: any) {
      console.error("2FA verification failed:", err);
      setError(err?.message || "Invalid code. Please try again.");
      setCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setCode("");
    setError(null);
    onCancel?.();
    bottomSheetRef.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="none" // Don't close on backdrop press for 2FA
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={false} // Don't allow closing by dragging for 2FA
      enableOverDrag={false}
      enableDynamicSizing={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      bottomInset={bottomInset}
      backdropComponent={renderBackdrop}
      style={{
        zIndex: 10000, // Very high z-index to appear above everything
      }}
      backgroundStyle={{
        backgroundColor: theme.colors.mainBackgroundColor,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.borderColor,
        width: 32,
      }}
      onChange={(index) => {
        if (index === -1) {
          // Reset state when closing
          setCode("");
          setError(null);
          onClose?.();
        }
      }}
    >
      <BottomSheetView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.mainBackgroundColor,
          },
        ]}
      >
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          marginBottom="l"
        >
          <CustomText variant="header" fontSize={20} color="headerTextColor">
            Two-Factor Authentication
          </CustomText>
          {onCancel && (
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 8,
              })}
            >
              <X size={24} color={theme.colors.headerTextColor} />
            </Pressable>
          )}
        </Box>

        {/* Instructions */}
        <CustomText
          variant="body"
          fontSize={14}
          color="bodyTextColor"
          textAlign="center"
          marginBottom="l"
        >
          Enter the 6-digit code from your authenticator app to continue.
        </CustomText>

        {/* Code Input */}
        <Box marginBottom="l">
          <CodeInput
            length={6}
            onCodeChange={handleCodeChange}
            onCodeComplete={handleCodeComplete}
            autoFocus={false}
            disabled={isVerifying}
            error={!!error}
          />
        </Box>

        {/* Error Message */}
        {error && (
          <Box marginBottom="m">
            <CustomText
              color="error"
              variant="body"
              textAlign="center"
              fontSize={14}
            >
              {error}
            </CustomText>
          </Box>
        )}

        {/* Verify Button */}
        <CustomButton
          text={isVerifying ? "Verifying..." : "Verify"}
          onPress={() => handleVerify()}
          disabled={code.length !== 6 || isVerifying}
          isLoading={isVerifying}
          width="100%"
          borderRadius={50}
          bgColor={
            code.length === 6 && !isVerifying
              ? "primaryColor"
              : "inActiveBtnColor"
          }
        />
      </BottomSheetView>
    </BottomSheet>
  );
});

TwoFactorAuthInputBottomSheet.displayName = "TwoFactorAuthInputBottomSheet";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
});

export default TwoFactorAuthInputBottomSheet;
