import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, View } from "react-native";
import { ConfettiMethods } from "react-native-fast-confetti";
import EmailVerification from "../onboarding/EmailVerification";
import EnterUsername from "../onboarding/EnterUsername";
import LoginToZap from "../onboarding/LoginToZap";
import UsernameSuccess from "../onboarding/UsernameSuccess";
import VerifyYourIdentity from "../onboarding/VerifyYourIdentity";
import AnimatedGradientBottomSheet, {
  AnimatedGradientBottomSheetRef,
} from "./AnimatedGradientBottomSheet";

// Define the screen steps
type ScreenStep =
  | "login"
  | "emailVerification"
  | "enterUsername"
  | "usernameSuccess"
  | "verifyIdentity";

export default function ZapperSiginBottomSheet({
  ref,
  onContinue,
  onClose,
}: {
  ref?: React.RefObject<AnimatedGradientBottomSheetRef | null>;
  onContinue?: () => void;
  onClose?: () => void;
}) {
  const { colors } = useTheme<Theme>();
  const { authEmail } = useKyc();
  const confettiRef = useRef<ConfettiMethods>(null);
  const [currentStep, setCurrentStep] = useState<ScreenStep>("login");
  const { handleExchangeLogin } = useExchangeAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isResending, setIsResending] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    confettiRef.current?.pause();
  }, []);

  // Screen transition function
  const transitionToNextScreen = (nextStep: ScreenStep) => {
    // Start from the right (positive translateX value)
    slideAnim.setValue(300);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setCurrentStep(nextStep);
  };

  // Navigation handlers
  const handleLoginSuccess = (userEmail: string) => {
    setEmail(userEmail);
    transitionToNextScreen("emailVerification");
  };

  const handleEmailVerificationSuccess = () => {
    transitionToNextScreen("enterUsername");
  };

  const handleUsernameSuccess = (userUsername: string) => {
    setUsername(userUsername);
    transitionToNextScreen("usernameSuccess");
  };

  const handleUsernameSuccessComplete = () => {
    transitionToNextScreen("verifyIdentity");
  };

  const handleVerifyIdentityComplete = () => {
    onContinue?.();
  };

  const handleResendEmail = async () => {
    if (email && !isResending) {
      setIsResending(true);
      try {
        const response = await handleExchangeLogin(email);
        if (response) {
          console.log("Resend email successful");
        } else {
          console.error("Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("Resend email error:", error);
      } finally {
        setIsResending(false);
      }
    }
  };

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentStep) {
      case "login":
        return <LoginToZap onLoginSuccess={handleLoginSuccess} />;
      case "emailVerification":
        return (
          <EmailVerification
            email={email}
            onVerify={handleEmailVerificationSuccess}
            onResend={handleResendEmail}
            isLoading={isResending}
            onCloseBottomSheet={() => {
              if (onClose) {
                onClose();
              }
            }}
          />
        );
      case "enterUsername":
        return <EnterUsername onUsernameSuccess={handleUsernameSuccess} />;
      case "usernameSuccess":
        return (
          <UsernameSuccess
            confettiRef={confettiRef}
            onComplete={handleUsernameSuccessComplete}
            username={username}
          />
        );
      case "verifyIdentity":
        return <VerifyYourIdentity onContinue={handleVerifyIdentityComplete} />;
      default:
        return <LoginToZap onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <>
      {/* <Confetti ref={confettiRef} /> */}
      <AnimatedGradientBottomSheet
        ref={ref}
        snapPoints={["100%"]}
        enablePanDownToClose={true}
        showGradientHandle={true}
        gradientColors={[
          colors.primaryColor,
          colors.mainBackgroundColor,
          colors.mainBackgroundColor,
        ]}
        onClose={onClose}
      >
        <ScrollView>
          <View style={styles.handle} />
          <View style={styles.backContainer}></View>
          <Image
            source={require("@/assets/images/zapLogoDark.png")}
            style={{
              height: 40,
              width: 120,
              alignSelf: "center",
              marginTop: 16,
            }}
            resizeMode="contain"
          />
          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              flex: 1,
            }}
          >
            {renderCurrentScreen()}
          </Animated.View>
        </ScrollView>
      </AnimatedGradientBottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
    alignSelf: "center",
  },
  backContainer: {
    width: "100%",
    height: 40,
  },
});
