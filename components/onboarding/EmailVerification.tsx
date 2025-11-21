import { useExchangeAuth } from "@/hooks/useExchangeAuth";
import { TokenData } from "@/src/core/api/models";
import { zapSDKService } from "@/src/core/sdk/zap-sdk.service";
import { twoFactorAuthService } from "@/src/core/services/two-factor-auth.service";
import storageService from "@/src/core/storage/app-storage";
import { StorageKeys } from "@/src/core/storage/storage-types";
import { useWallet } from "@/src/core/wallet/wallet-context";
import { Theme } from "@/theme";
import { useTheme } from "@shopify/restyle";
import { ExchangeValidateOtpResponse } from "@zap/blockchain-sdk";
import React, { useEffect, useState } from "react";
import { Keyboard, Pressable } from "react-native";
import OTPInput from "../form/OTPInput";
import { CustomButton, CustomText } from "../general";
import Box from "../general/Box";

interface EmailVerificationProps {
  email?: string;
  onVerify?: (code: string, userData?: any) => void;
  onResend?: () => void;
  isLoading?: boolean;
  onCloseBottomSheet?: () => void;
}

export default function EmailVerification({
  email = "",
  onVerify,
  onResend,
  isLoading = false,
  onCloseBottomSheet,
}: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme<Theme>();
  const { handleExchangeValidateOtp } = useExchangeAuth();
  const { setIsExchangeAuthenticated, setExchangeUserData, setCurrentExchangeUser } = useWallet();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setError(null);
    setIsCodeComplete(newCode.length === 6);
  };

  const handleCodeComplete = (completeCode: string) => {
    setIsCodeComplete(true);
  };

  useEffect(() => {
    if (isCodeComplete) {
      handleVerify();
    }
  }, [isCodeComplete]);

  const handleResend = () => {
    if (resendTimer === 0) {
      setResendTimer(90);
      onResend?.();
    }
  };

  const handleVerify = async () => {
    if (isCodeComplete && !isLoading && !isVerifying) {
      setIsVerifying(true);
      try {
        const response = await handleExchangeValidateOtp(email, code);
        console.log("Email verification response:", response);

        // Check if verification was successful
        // If response is false, it means 2FA is required (handled separately)
        // Only proceed if we have a valid response object with user data
        if (response && typeof response === "object" && "data" in response) {
          const responseData = response as ExchangeValidateOtpResponse;

          // Check if 2FA is required (response has twoFA flag but no user)
          const requires2FA =
            responseData.message?.toLowerCase().includes("2fa required") ||
            responseData.message?.toLowerCase().includes("2fa") ||
            (responseData.data as any)?.twoFA === true;

          if (requires2FA && !responseData.data?.user) {
            // 2FA is required - show the 2FA input sheet
            const partialToken = (responseData.data as any)?.partialToken;
            if (partialToken) {
              setIsVerifying(false);
              // Show 2FA input bottom sheet
              twoFactorAuthService.show2FAInput(async (totpCode: string) => {
                try {
                  setIsVerifying(true);
                  // Complete login with 2FA code using twoFA.login
                  const loginResult = await zapSDKService.loginWithTwoFa({
                    code: totpCode,
                    partialToken: partialToken,
                  });
                  
                  console.log("2FA login result:", JSON.stringify(loginResult, null, 2));
                  
                  // Handle the login result
                  // The login result should have user, token, refreshToken, and session
                  if (loginResult && typeof loginResult === "object") {
                    const loginData = loginResult as any;
                    
                    // Extract user data and tokens from the result
                    // The SDK's twoFA.login might return the response in a different structure
                    const userData = loginData.user || loginData.data?.user || loginData.data?.data?.user;
                    const token = loginData.token || loginData.data?.token || loginData.jwt || loginData.data?.jwt || loginData.data?.data?.token || loginData.data?.data?.jwt;
                    const refreshToken = loginData.refreshToken || loginData.data?.refreshToken || loginData.data?.data?.refreshToken;
                    const session = loginData.session || loginData.data?.session || loginData.data?.data?.session;
                    
                    console.log("🔍 Extracted from 2FA login:", {
                      hasUserData: !!userData,
                      hasToken: !!token,
                      hasRefreshToken: !!refreshToken,
                      hasSession: !!session,
                      tokenLength: token?.length,
                    });
                    
                    // Store token in TokenData format that the SDK expects
                    // Use token, jwt, or session - whichever is available
                    const finalToken = token || session;
                    if (finalToken) {
                      const tokenData: TokenData = {
                        token: finalToken,
                        refreshToken: refreshToken || null,
                        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
                      };
                      
                      // Use storageService.save to properly store the TokenData object
                      await storageService.save(StorageKeys.TOKEN_DATA, tokenData);
                      
                      console.log("✅ Token stored after 2FA login:", { 
                        hasToken: !!tokenData.token, 
                        hasRefreshToken: !!tokenData.refreshToken,
                        tokenPreview: tokenData.token?.substring(0, 20) + "..."
                      });
                      
                      // Try to set the token in the SDK's exchangeAuth provider if possible
                      // The SDK's exchangeAuth provider should read from storage, but we'll try to set it explicitly
                      try {
                        const sdk = zapSDKService.getSDK();
                        if (sdk && sdk.exchangeAuth) {
                          // Check if SDK has a method to set tokens
                          // Some SDKs require explicit token setting after manual login
                          if (typeof (sdk.exchangeAuth as any).setToken === 'function') {
                            await (sdk.exchangeAuth as any).setToken(finalToken, refreshToken);
                            console.log("✅ Token set in SDK exchangeAuth provider");
                          } else if (typeof (sdk.exchangeAuth as any).updateToken === 'function') {
                            await (sdk.exchangeAuth as any).updateToken(finalToken, refreshToken);
                            console.log("✅ Token updated in SDK exchangeAuth provider");
                          } else if (typeof (sdk.exchangeAuth as any).refreshToken === 'function') {
                            // Try to refresh the token provider to read from storage
                            await (sdk.exchangeAuth as any).refreshToken();
                            console.log("✅ Token provider refreshed");
                          }
                          
                          // Verify the SDK can now get the token
                          try {
                            const tokens = await sdk.exchangeAuth.getTokens();
                            console.log("🔍 SDK exchangeAuth tokens after setting:", {
                              hasToken: !!tokens?.token,
                              tokenPreview: tokens?.token?.substring(0, 20) + "..."
                            });
                          } catch (verifyError) {
                            console.warn("⚠️ Could not verify token in SDK:", verifyError);
                          }
                        }
                      } catch (sdkError) {
                        console.warn("⚠️ Could not set token in SDK exchangeAuth provider:", sdkError);
                        // This is not critical - the SDK should read from storage
                      }
                      
                      // Add a small delay to ensure storage is fully written before SDK tries to read
                      await new Promise(resolve => setTimeout(resolve, 100));
                    } else {
                      console.error("❌ No token found in 2FA login response");
                    }

                    if (userData) {
                      await storageService.setItem(
                        StorageKeys.USER_PROFILE,
                        JSON.stringify(userData)
                      );
                      
                      // Update wallet context state to mark user as authenticated
                      setIsExchangeAuthenticated(true);
                      setCurrentExchangeUser(userData._id || null);
                      setExchangeUserData(userData);
                    }

                    // Call onVerify with user data
                    if (userData) {
                      onVerify?.(code, userData);
                    } else {
                      throw new Error("User data not found in login response");
                    }
                  } else {
                    throw new Error("Failed to complete login with 2FA");
                  }
                } catch (error: any) {
                  console.error("2FA login error:", error);
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Invalid 2FA code. Please try again.";
                  throw new Error(errorMessage);
                } finally {
                  setIsVerifying(false);
                }
              });
            } else {
              setError("2FA is required but partial token is missing. Please try again.");
            setIsVerifying(false);
            }
            return;
          }

          await storageService.setItem(
            StorageKeys.TOKEN_DATA,
            JSON.stringify(responseData.data?.session || "")
          );

          const userData = responseData.data?.user;

          if (userData) {
            await storageService.setItem(
              StorageKeys.USER_PROFILE,
              JSON.stringify(userData)
            );
          }

          // Only call onVerify if we have user data (full login successful)
          if (userData) {
            onVerify?.(code, userData);
          }
        } else if (response === false) {
          // 2FA is required - don't show error, the 2FA input sheet will handle it
          // Just reset the verifying state
        } else {
          setError("Invalid OTP. Please try again.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        // Only show error if it's not a 2FA-related error
        // 2FA errors should be handled by the 2FA input sheet
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again.";
        const is2FAError =
          errorMessage.toLowerCase().includes("2fa") ||
          errorMessage.toLowerCase().includes("totp");

        if (!is2FAError) {
          setError(errorMessage);
        }
        // Error handling is already done by the API service with toast notifications
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <Box
      paddingHorizontal="m"
      paddingBottom="xl"
      width="100%"
      style={{ minHeight: 400 }}
    >
      <Pressable onPress={() => Keyboard.dismiss()}>
        <Box alignItems="center" marginBottom="m" marginTop="l">
          <CustomText
            variant="header"
            fontSize={24}
            color="headerTextColor"
            textAlign="center"
            marginBottom="m"
          >
            Email Verification
          </CustomText>
        </Box>

        <Box marginTop="l" alignItems="center">
          <OTPInput
            length={6}
            onCodeChange={handleCodeChange}
            onCodeComplete={handleCodeComplete}
            onResend={handleResend}
            autoFocus={true}
            disabled={isLoading}
            resendTimer={resendTimer}
            instructionText="Please enter the 6-digit OTP sent to"
            phoneNumber={email}
            error={error !== null}
            errorText={error || ""}
          />
        </Box>

        <Box
          marginTop="xl"
          width="100%"
          alignItems="center"
        >
          <CustomButton
            text={isVerifying ? "Verifying..." : "Verify"}
            onPress={handleVerify}
            disabled={!isCodeComplete || isLoading || isVerifying}
            isLoading={isLoading || isVerifying}
            width="100%"
            height={56}
            borderRadius={56}
            bgColor={
              isCodeComplete && !isVerifying
                ? theme.colors.primaryColor
                : theme.colors.inActiveBtnColor
            }
            color="white"
            fontSize={16}
            variant="bodySubheader"
          />
        </Box>
      </Pressable>
    </Box>
  );
}
