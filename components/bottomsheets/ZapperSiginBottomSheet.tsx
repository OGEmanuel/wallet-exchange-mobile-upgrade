import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import useKyc from "@/src/modules/kyc/presentation/hooks/useKyc";
import { AppRootState } from "@/state";
import { Theme } from "@/theme";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useTheme } from "@shopify/restyle";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, View } from "react-native";
import { ConfettiMethods } from "react-native-fast-confetti";
import { useSelector } from "react-redux";
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
  const { exchangeUserData, handleExchangeLogin, isExchangeAuthenticated } = useExchangeAuth();
  const { user: kycUser } = useSelector((state: AppRootState) => state.kyc);
  const confettiRef = useRef<ConfettiMethods>(null);
  
  // Use exchangeUserData if available, otherwise fall back to KYC user
  const user = exchangeUserData || kycUser;
  
  // Determine initial step based on user's current onboarding status
  // Note: This should NOT be called if user has username (handled separately)
  const determineInitialStep = useCallback((): ScreenStep => {
    if (!user) return "login";
    
    const { emailVerified, username: userUsername } = user;
    
    // If user has username, they've completed onboarding - should not reach here
    // (this case is handled in useEffect to close immediately)
    if (userUsername) {
      return "login"; // Fallback, but should not be used
    }
    
    // If email is verified but no username, show username entry
    if (emailVerified && !userUsername) {
      return "enterUsername";
    }
    
    // If user has email but not verified, show email verification
    if (user.email && !emailVerified) {
      return "emailVerification";
    }
    
    // Default to login
    return "login";
  }, [user]);
  
  const [currentStep, setCurrentStep] = useState<ScreenStep>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isResending, setIsResending] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Initialize animation value to 0 (centered) for initial render
  useEffect(() => {
    slideAnim.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hasClosedForUsernameRef = useRef(false);
  const prevAuthStateRef = useRef<boolean | null>(null);
  const prevUsernameRef = useRef<string | null>(null);

  useEffect(() => {
    confettiRef.current?.pause();
    // Initialize prev auth state on mount
    prevAuthStateRef.current = isExchangeAuthenticated;
    prevUsernameRef.current = exchangeUserData?.username || null;
    
    // If user already has username when component mounts, close immediately
    // Only check exchangeUserData (not kycUser) to ensure we have fresh exchange data
    const hasUsername = exchangeUserData?.username;
    if (isExchangeAuthenticated && hasUsername && !hasClosedForUsernameRef.current) {
      console.log("✅ User already has username on mount, closing onboarding sheet immediately");
      hasClosedForUsernameRef.current = true;
      // Close immediately - user is fully logged in
      setTimeout(() => {
        onContinue?.();
      }, 100);
    }
  }, []);

  // Check if user has username (fully logged in) - close sheet only after authentication
  // Check both when auth state changes AND when exchangeUserData updates with username
  useEffect(() => {
    const wasAuthenticated = prevAuthStateRef.current;
    const isNowAuthenticated = isExchangeAuthenticated;
    const hasUsername = exchangeUserData?.username;
    const prevUsername = prevUsernameRef.current;
    
    // Update refs for next check
    prevAuthStateRef.current = isNowAuthenticated;
    prevUsernameRef.current = hasUsername || null;
    
    // If user is not authenticated, don't close - let them log in
    if (!isNowAuthenticated) {
      hasClosedForUsernameRef.current = false;
      return;
    }
    
    // Check if user JUST became authenticated (was false, now true)
    const justBecameAuthenticated = wasAuthenticated === false && isNowAuthenticated === true;
    
    // Check if username was just added (was null/undefined, now has value)
    const usernameJustAdded = !prevUsername && hasUsername;
    
    // Only close if:
    // 1. User is authenticated AND has username
    // 2. Either they JUST became authenticated OR username was just added to exchangeUserData
    // 3. We haven't closed yet
    const shouldClose = hasUsername && 
                       (justBecameAuthenticated || usernameJustAdded) &&
                       !hasClosedForUsernameRef.current;
    
    if (shouldClose) {
      console.log("✅ User is authenticated and has username, closing onboarding sheet");
      hasClosedForUsernameRef.current = true;
      // Close the sheet - user is fully logged in
      // Use a delay to ensure the sheet has opened first
      const timer = setTimeout(() => {
        onContinue?.();
      }, 1000); // Longer delay to ensure sheet is visible
      return () => clearTimeout(timer);
    }
    
    // Reset the ref if user doesn't have username (so it can check again when username is added)
    if (!hasUsername) {
      hasClosedForUsernameRef.current = false;
    }
  }, [isExchangeAuthenticated, exchangeUserData, onContinue]);

  // Initialize step based on user data when component mounts
  // Only set step if user doesn't have username (needs onboarding)
  useEffect(() => {
    // Only check exchangeUserData for username (not kycUser) to ensure we have fresh exchange data
    // kycUser might have stale data from previous sessions
    const hasUsername = exchangeUserData?.username;
    
    // Don't set step if user has username (will be closed by above effect or mount check)
    if (hasUsername) {
      // Don't set step - sheet will be closed
      return;
    }
    
    // Only set step if we have user data OR if we're not authenticated
    // This prevents setting step to "login" when user data is still loading
    if (!isExchangeAuthenticated && !user) {
      // Not authenticated and no user data - show login
      setCurrentStep("login");
      return;
    }
    
    // If authenticated but no username yet, or if we have user data, set appropriate step
    if (isExchangeAuthenticated || user) {
      const initialStep = determineInitialStep();
      setCurrentStep(initialStep);
      
      if (user?.email) {
        setEmail(user.email);
      }
    }
  }, [determineInitialStep, user, exchangeUserData, kycUser, isExchangeAuthenticated]);

  // Screen transition function
  const transitionToNextScreen = (nextStep: ScreenStep) => {
    // Start from the right (positive translateX value) - off screen
    slideAnim.setValue(SCREEN_WIDTH || 400);
    
    // Set the new step immediately so it renders
    setCurrentStep(nextStep);

    // Use requestAnimationFrame to ensure the new screen is rendered before animating
    requestAnimationFrame(() => {
      // Animate to center (0)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Navigation handlers
  const handleLoginSuccess = (userEmail: string) => {
    setEmail(userEmail);
    transitionToNextScreen("emailVerification");
  };

  const handleEmailVerificationSuccess = (userData?: any) => {
    // Check username directly from the OTP verification response
    // This is more reliable than waiting for exchangeUserData to update
    const hasUsername = userData?.username || exchangeUserData?.username;
    
    if (hasUsername) {
      // User already has username, close the sheet
      console.log("✅ User has username after email verification, closing onboarding sheet");
      onContinue?.();
      return;
    }
    
    // User doesn't have username, continue to username entry
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
            onVerify={(code, userData) => handleEmailVerificationSuccess(userData)}
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
        snapPoints={["90%"]}
        enablePanDownToClose={true}
        showGradientHandle={true}
        gradientColors={[
          colors.primaryColor,
          colors.mainBackgroundColor,
          colors.mainBackgroundColor,
        ]}
        onClose={onClose}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 40,
            flexGrow: 1,
            paddingHorizontal: 0,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
        >
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
              width: "100%",
              overflow: "hidden",
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
